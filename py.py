"""
Instrument -> benchmark mapping and composite time series.

Conventions
-----------
* start_date / end_date are INCLUSIVE. end_date None = still active.
* A mapping active on day d drives the return of day d (close d-1 -> close d),
  i.e. weights are set at the previous close.
* Rebalancing:
    DAILY     : constant weights every day (typical for composite indices)
    AT_CHANGE : weights reset only when the weight vector changes; they drift in between
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta
from enum import Enum
from typing import Optional

import pandas as pd

WEIGHT_TOL = 1e-6


class Rebalancing(str, Enum):
    DAILY = "DAILY"
    AT_CHANGE = "AT_CHANGE"


class GapPolicy(str, Enum):
    RAISE = "RAISE"          # no active mapping on some dates -> error
    FLAT = "FLAT"            # no active mapping -> return 0 (value carried)


# --------------------------------------------------------------------------
# Data model
# --------------------------------------------------------------------------
@dataclass(frozen=True)
class BenchmarkMapping:
    """One row of instrument_benchmark_mapping."""
    instrument_id: str
    benchmark_id: str
    weight: float
    start_date: date
    end_date: Optional[date] = None          # None = active until today
    benchmark_type: str = "cciBenchmark1"

    def __post_init__(self):
        if not (0 < self.weight <= 1 + WEIGHT_TOL):
            raise ValueError(f"weight must be in ]0,1], got {self.weight}")
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError(f"end_date < start_date for {self.benchmark_id}")

    def is_active(self, d: date) -> bool:
        return self.start_date <= d and (self.end_date is None or d <= self.end_date)

    def overlaps(self, other: "BenchmarkMapping") -> bool:
        a_end = self.end_date or date.max
        b_end = other.end_date or date.max
        return self.start_date <= b_end and other.start_date <= a_end


@dataclass(frozen=True)
class Segment:
    """Period during which the weight vector is constant."""
    start: date
    end: date                                  # inclusive
    weights: dict[str, float]


@dataclass
class CompositeResult:
    instrument_id: str
    initial_investment: float
    rebalancing: Rebalancing
    segments: list[Segment]
    series: pd.DataFrame = field(repr=False)   # value, daily_return, cumulative_return


# --------------------------------------------------------------------------
# Engine
# --------------------------------------------------------------------------
class BenchmarkComposer:
    def __init__(self, mappings: list[BenchmarkMapping],
                 normalize_weights: bool = False,
                 gap_policy: GapPolicy = GapPolicy.RAISE):
        self.mappings = mappings
        self.normalize_weights = normalize_weights
        self.gap_policy = gap_policy

    # ---- validation ------------------------------------------------------
    def _for_instrument(self, instrument_id: str) -> list[BenchmarkMapping]:
        ms = [m for m in self.mappings if m.instrument_id == instrument_id]
        if not ms:
            raise ValueError(f"No mapping for {instrument_id}")
        for i, a in enumerate(ms):                       # same benchmark twice on same dates
            for b in ms[i + 1:]:
                if a.benchmark_id == b.benchmark_id and a.overlaps(b):
                    raise ValueError(f"Overlapping rows for {a.benchmark_id}")
        return ms

    # ---- segmentation ----------------------------------------------------
    def build_segments(self, instrument_id: str, as_of: date) -> list[Segment]:
        ms = self._for_instrument(instrument_id)
        first = min(m.start_date for m in ms)
        cuts = {first}
        for m in ms:
            if m.start_date <= as_of:
                cuts.add(m.start_date)
            if m.end_date is not None and m.end_date + timedelta(days=1) <= as_of:
                cuts.add(m.end_date + timedelta(days=1))
        cuts = sorted(c for c in cuts if c >= first)

        raw: list[Segment] = []
        for i, s in enumerate(cuts):
            e = cuts[i + 1] - timedelta(days=1) if i + 1 < len(cuts) else as_of
            w = {m.benchmark_id: m.weight for m in ms if m.is_active(s)}
            if not w:
                if self.gap_policy is GapPolicy.RAISE:
                    raise ValueError(f"Gap in mapping for {instrument_id} from {s} to {e}")
                raw.append(Segment(s, e, {}))
                continue
            total = sum(w.values())
            if abs(total - 1) > WEIGHT_TOL:
                if not self.normalize_weights:
                    raise ValueError(f"Weights sum to {total:.6f} (need 1) from {s} to {e}")
                w = {k: v / total for k, v in w.items()}
            raw.append(Segment(s, e, w))

        # merge adjacent segments with identical weights (e.g. contract renewal, no real change)
        merged: list[Segment] = []
        for seg in raw:
            if merged and self._same(merged[-1].weights, seg.weights):
                merged[-1] = Segment(merged[-1].start, seg.end, seg.weights)
            else:
                merged.append(seg)
        return merged

    @staticmethod
    def _same(a: dict[str, float], b: dict[str, float]) -> bool:
        return a.keys() == b.keys() and all(abs(a[k] - b[k]) < WEIGHT_TOL for k in a)

    # ---- computation -----------------------------------------------------
    def compute(self, instrument_id: str, prices: pd.DataFrame,
                initial_investment: float = 100.0,
                rebalancing: Rebalancing = Rebalancing.DAILY,
                as_of: Optional[date] = None,
                ffill_prices: bool = True) -> CompositeResult:
        """
        prices: DataFrame indexed by date (DatetimeIndex), one column per benchmark_id.
        """
        as_of = as_of or date.today()
        segments = self.build_segments(instrument_id, as_of)

        px = prices.sort_index().copy()
        px.index = pd.to_datetime(px.index)
        if ffill_prices:
            px = px.ffill()
        used = sorted({b for s in segments for b in s.weights})
        missing = [b for b in used if b not in px.columns]
        if missing:
            raise ValueError(f"No price series for {missing}")

        dates = px.index[(px.index >= pd.Timestamp(segments[0].start)) &
                         (px.index <= pd.Timestamp(as_of))]
        if dates.empty:
            raise ValueError("No prices in the mapping period")
        base = dates[0]
        value = pd.Series(index=dates, dtype=float)
        value.loc[base] = initial_investment
        rets_all = px[used].pct_change()

        for seg in segments:
            seg_dates = dates[(dates >= pd.Timestamp(seg.start)) & (dates <= pd.Timestamp(seg.end))]
            if seg_dates.empty:
                continue
            prev = base if seg_dates[0] == base else px.index[px.index.get_loc(seg_dates[0]) - 1]

            if not seg.weights:                               # FLAT gap
                growth = pd.Series(1.0, index=seg_dates)
            else:
                cols = list(seg.weights)
                w = pd.Series(seg.weights)
                if px.loc[seg_dates, cols].isna().any().any() or px.loc[prev, cols].isna().any():
                    raise ValueError(f"Missing prices for {cols} in {seg.start}..{seg.end}")
                if rebalancing is Rebalancing.DAILY:
                    r = (rets_all.loc[seg_dates, cols] * w).sum(axis=1)
                    if seg_dates[0] == base:
                        r.iloc[0] = 0.0
                    growth = (1 + r).cumprod()
                else:                                         # drift from prev close
                    ratio = px.loc[seg_dates, cols].div(px.loc[prev, cols])
                    growth = (ratio * w).sum(axis=1)
            value.loc[seg_dates] = value.loc[prev] * growth

        out = pd.DataFrame({"value": value})
        out["daily_return"] = out["value"].pct_change().fillna(0.0)
        out["cumulative_return"] = out["value"] / initial_investment - 1
        return CompositeResult(instrument_id, initial_investment, rebalancing, segments, out)

    # ---- single benchmark = composite with one 100% leg ------------------
    @staticmethod
    def compute_single(benchmark_id: str, prices: pd.DataFrame,
                       start: date, end: Optional[date] = None,
                       initial_investment: float = 100.0) -> CompositeResult:
        m = BenchmarkMapping("__single__", benchmark_id, 1.0, start, end)
        return BenchmarkComposer([m]).compute(
            "__single__", prices, initial_investment, as_of=end or date.today())


# --------------------------------------------------------------------------
# Example
# --------------------------------------------------------------------------
if __name__ == "__main__":
    import numpy as np
    idx = pd.bdate_range("2024-01-01", "2024-12-31")
    rng = np.random.default_rng(0)
    prices = pd.DataFrame(
        {b: 100 * np.cumprod(1 + rng.normal(0.0003, 0.01, len(idx))) for b in ("B1", "B2", "B3")},
        index=idx)

    maps = [
        BenchmarkMapping("INST1", "B1", 0.6, date(2024, 1, 1), date(2024, 6, 30)),
        BenchmarkMapping("INST1", "B2", 0.4, date(2024, 1, 1), date(2024, 6, 30)),
        BenchmarkMapping("INST1", "B1", 0.5, date(2024, 7, 1)),    # weight change
        BenchmarkMapping("INST1", "B3", 0.5, date(2024, 7, 1)),    # B2 replaced by B3
    ]
    res = BenchmarkComposer(maps).compute("INST1", prices, 10_000, Rebalancing.DAILY,
                                          as_of=date(2024, 12, 31))
    for s in res.segments:
        print(s)
    print(res.series.tail())
