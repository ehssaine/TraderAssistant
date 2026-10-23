"""
Data-quality checks for the CCI perf input table.

Columns : IdShareClass, fkIdInstrument, type ('price' | 'return'), price, date
          (`price` holds a price or a return depending on `type`)
Series  : one series = (fkIdInstrument, IdShareClass, type)

validate() returns a ValidationReport:
  - issues : list of Issue (code, severity, instrument, share class, dates, count)
  - clean  : rows that passed the structural checks (exact duplicates removed,
             future dates removed). Conflicting duplicates are KEPT but flagged ERROR.
Policy : any ERROR -> block / quarantine the load; WARNING -> build but review; INFO -> FYI.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from typing import Iterable, Optional

import numpy as np
import pandas as pd

from benchmark_composite import BenchmarkComposer, BenchmarkMapping

COL_SHARE, COL_INSTR, COL_TYPE, COL_VALUE, COL_DATE = "IdShareClass", "fkIdInstrument", "type", "price", "date"
REQUIRED = [COL_SHARE, COL_INSTR, COL_TYPE, COL_VALUE, COL_DATE]
SERIES_KEY = [COL_INSTR, COL_SHARE, COL_TYPE]
ROW_KEY = SERIES_KEY + [COL_DATE]
TYPE_ALIASES = {"price": "price", "prices": "price", "px": "price",
                "return": "return", "returns": "return", "ret": "return"}


class Severity(str, Enum):
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"


@dataclass(frozen=True)
class Issue:
    code: str
    severity: Severity
    message: str
    instrument_id: Optional[str] = None
    share_class: Optional[str] = None
    date_from: Optional[pd.Timestamp] = None
    date_to: Optional[pd.Timestamp] = None
    count: int = 1


@dataclass
class CheckConfig:
    max_abs_return: float = 0.25          # V03: daily move above this is an outlier
    spike_threshold: float = 0.10         # V04: spike-and-revert detection
    stale_run: int = 5                    # V06: identical consecutive values
    max_gap_business_days: int = 3        # DT03: longer gaps are flagged (shorter = holidays)
    max_lag_days: int = 5                 # M03: allowed lag between last data and end/as_of
    start_tolerance_days: int = 5         # M02: allowed lag between mapping start and first data
    return_price_tol: float = 1e-4        # T02: |pct_change(price) - return|
    business_days_only: bool = True       # DT02 / DT03 use a Mon-Fri calendar


@dataclass
class ValidationReport:
    issues: list[Issue]
    clean: pd.DataFrame

    @property
    def has_errors(self) -> bool:
        return any(i.severity is Severity.ERROR for i in self.issues)

    def to_frame(self) -> pd.DataFrame:
        cols = ["code", "severity", "instrument_id", "share_class", "date_from", "date_to", "count", "message"]
        return pd.DataFrame([{c: (getattr(i, c).value if c == "severity" else getattr(i, c)) for c in cols}
                             for i in self.issues], columns=cols)

    def summary(self) -> pd.DataFrame:
        f = self.to_frame()
        if f.empty:
            return f
        return f.groupby(["severity", "code"]).agg(issues=("code", "size"), rows=("count", "sum"))


class CciPerfValidator:
    def __init__(self, cfg: Optional[CheckConfig] = None, calendar: Optional[pd.DatetimeIndex] = None):
        self.cfg = cfg or CheckConfig()
        self.calendar = calendar          # optional trading calendar (e.g. exchange holidays)

    # ------------------------------------------------------------------ API
    def validate(self, df: pd.DataFrame,
                 mappings: Optional[Iterable[BenchmarkMapping]] = None,
                 as_of: Optional[date] = None) -> ValidationReport:
        as_of_ts = pd.Timestamp(as_of or date.today()).normalize()
        issues: list[Issue] = []

        missing = [c for c in REQUIRED if c not in df.columns]
        if missing:                                                   # S01
            issues.append(Issue("S01", Severity.ERROR, f"Missing columns: {missing}"))
            return ValidationReport(issues, pd.DataFrame(columns=REQUIRED))

        w = self._structure(df[REQUIRED].copy(), issues)
        w = self._duplicates(w, issues)
        w = self._future(w, as_of_ts, issues)
        self._series_checks(w, issues)
        self._type_consistency(w, issues)
        if mappings:
            self._mapping_checks(w, list(mappings), as_of_ts, issues)
        clean = w.sort_values(ROW_KEY).reset_index(drop=True)
        return ValidationReport(issues, clean)

    # ------------------------------------------------------------ helpers
    @staticmethod
    def _add(issues, code, sev, msg, count=1, instr=None, share=None, d0=None, d1=None):
        issues.append(Issue(code, sev, msg, instr, share, d0, d1, int(count)))

    def _by_series(self, issues, rows: pd.DataFrame, code, sev, msg):
        """One issue per (instrument, share class) for a set of flagged rows."""
        for (i, s), g in rows.groupby([COL_INSTR, COL_SHARE]):
            self._add(issues, code, sev, msg, len(g), i, s, g[COL_DATE].min(), g[COL_DATE].max())

    # ---------------------------------------------------------- structure
    def _structure(self, w: pd.DataFrame, issues) -> pd.DataFrame:
        raw = w.copy()
        for c in REQUIRED:                                            # S02
            n = int(raw[c].isna().sum())
            if n:
                self._add(issues, "S02", Severity.ERROR, f"{n} null value(s) in required column '{c}'", n)

        try:
            d = pd.to_datetime(raw[COL_DATE], errors="coerce")
        except (ValueError, TypeError):
            d = pd.to_datetime(raw[COL_DATE], errors="coerce", utc=True)
        if getattr(d.dt, "tz", None) is not None:                     # DT05
            self._add(issues, "DT05", Severity.WARNING, "Timezone-aware dates, tz dropped", int(d.notna().sum()))
            d = d.dt.tz_localize(None)
        nn = d.dropna()
        if (nn != nn.dt.normalize()).any():                           # DT05
            self._add(issues, "DT05", Severity.WARNING, "Dates carry a time component, normalised to day",
                      int((nn != nn.dt.normalize()).sum()))
        d = d.dt.normalize()
        bad_d = d.isna() & raw[COL_DATE].notna()
        if bad_d.any():                                               # S04
            self._add(issues, "S04", Severity.ERROR, "Unparsable date(s)", bad_d.sum())

        v = pd.to_numeric(raw[COL_VALUE], errors="coerce")
        bad_v = v.isna() & raw[COL_VALUE].notna()
        if bad_v.any():                                               # S04
            self._add(issues, "S04", Severity.ERROR, "Non-numeric price/return value(s)", bad_v.sum())
        inf = np.isinf(v)
        if inf.any():                                                 # S05
            self._add(issues, "S05", Severity.ERROR, "Infinite value(s)", inf.sum())
            v = v.mask(inf)

        t_raw = raw[COL_TYPE].astype("string").str.strip().str.lower()
        t = t_raw.map(TYPE_ALIASES)
        bad_t = t.isna() & raw[COL_TYPE].notna()
        if bad_t.any():                                               # S03
            bad_vals = sorted(t_raw[bad_t].dropna().unique())[:5]
            self._add(issues, "S03", Severity.ERROR, f"Invalid type value(s) {bad_vals}, expected price|return", bad_t.sum())

        out = pd.DataFrame({
            COL_SHARE: raw[COL_SHARE].astype("string").str.strip(),
            COL_INSTR: raw[COL_INSTR].astype("string").str.strip(),
            COL_TYPE: t, COL_VALUE: v, COL_DATE: d})
        return out.dropna().astype({COL_SHARE: str, COL_INSTR: str, COL_TYPE: str}).reset_index(drop=True)

    # --------------------------------------------------------- duplicates
    def _duplicates(self, w: pd.DataFrame, issues) -> pd.DataFrame:
        dup = w.duplicated(ROW_KEY, keep=False)
        if not dup.any():
            return w
        nun = w.groupby(ROW_KEY)[COL_VALUE].transform("nunique")
        conflicting = dup & (nun > 1)
        if conflicting.any():                                         # D02
            self._by_series(issues, w[conflicting], "D02", Severity.ERROR,
                            "Same (instrument, share class, type, date) with different values (restatement?)")
        exact = dup & ~conflicting
        if exact.any():                                               # D01
            excess = w[exact].duplicated(ROW_KEY + [COL_VALUE])
            self._by_series(issues, w[exact][excess], "D01", Severity.WARNING, "Exact duplicate rows, first kept")
        return w.drop_duplicates(ROW_KEY + [COL_VALUE]).reset_index(drop=True)

    def _future(self, w: pd.DataFrame, as_of: pd.Timestamp, issues) -> pd.DataFrame:
        fut = w[w[COL_DATE] > as_of]
        if not fut.empty:                                             # DT01
            self._by_series(issues, fut, "DT01", Severity.ERROR, f"Dates after as_of ({as_of.date()}), removed")
        return w[w[COL_DATE] <= as_of].reset_index(drop=True)

    # ------------------------------------------------------ series checks
    def _series_checks(self, w: pd.DataFrame, issues) -> None:
        cfg = self.cfg
        if cfg.business_days_only:                                    # DT02
            wk = w[w[COL_DATE].dt.dayofweek >= 5]
            if not wk.empty:
                self._by_series(issues, wk, "DT02", Severity.WARNING, "Weekend dates")

        unsorted = w.groupby(SERIES_KEY)[COL_DATE].apply(lambda s: not s.is_monotonic_increasing)
        if unsorted.any():                                            # DT06
            self._add(issues, "DT06", Severity.INFO, f"{int(unsorted.sum())} series received unsorted, sorted")

        for (instr, share, typ), g in w.groupby(SERIES_KEY):
            s = g.set_index(COL_DATE)[COL_VALUE].sort_index()
            kw = dict(instr=instr, share=share)

            if typ == "price":
                bad = s[s <= 0]                                       # V01
                if len(bad):
                    self._add(issues, "V01", Severity.ERROR, "Price <= 0", len(bad), d0=bad.index.min(), d1=bad.index.max(), **kw)
                ret = s.pct_change().replace([np.inf, -np.inf], np.nan)
            else:
                bad = s[s <= -1]                                      # V02
                if len(bad):
                    self._add(issues, "V02", Severity.ERROR, "Return <= -100%", len(bad), d0=bad.index.min(), d1=bad.index.max(), **kw)
                ret = s
                if len(s) >= 20 and ret.abs().quantile(0.95) > 1:     # V05
                    self._add(issues, "V05", Severity.WARNING,
                              "Returns look like percent (1.5) instead of decimal (0.015)", len(s),
                              d0=s.index.min(), d1=s.index.max(), **kw)

            big = ret[ret.abs() > cfg.max_abs_return]                 # V03
            if len(big):
                self._add(issues, "V03", Severity.WARNING, f"|daily move| > {cfg.max_abs_return:.0%}", len(big),
                          d0=big.index.min(), d1=big.index.max(), **kw)

            r1, r2 = ret, ret.shift(-1)                               # V04
            spike = (r1.abs() > cfg.spike_threshold) & (r2.abs() > cfg.spike_threshold) & (r1 * r2 < 0) \
                    & (((1 + r1) * (1 + r2) - 1).abs() < cfg.spike_threshold / 3)
            if spike.any():
                idx = spike[spike].index
                self._add(issues, "V04", Severity.WARNING, "Spike then revert (bad tick?)", len(idx),
                          d0=idx.min(), d1=idx.max(), **kw)

            grp = (s != s.shift()).cumsum()                           # V06
            runs = s.index.to_series().groupby(grp.values).agg(["min", "max", "size"])
            for _, r in runs[runs["size"] >= cfg.stale_run].iterrows():
                self._add(issues, "V06", Severity.WARNING, f"Stale: same value {int(r['size'])} days in a row",
                          r["size"], d0=r["min"], d1=r["max"], **kw)

            self._gaps(s, typ, issues, kw)

    def _gaps(self, s: pd.Series, typ: str, issues, kw) -> None:
        cfg = self.cfg
        lo, hi = s.index.min(), s.index.max()
        if self.calendar is not None:
            expected = self.calendar[(self.calendar >= lo) & (self.calendar <= hi)]
        else:
            expected = pd.bdate_range(lo, hi) if cfg.business_days_only else pd.date_range(lo, hi)
        miss = expected.difference(s.index)
        if miss.empty:
            return
        pos = expected.get_indexer(miss)
        short = 0
        for run in np.split(pos, np.where(np.diff(pos) != 1)[0] + 1):
            if len(run) > cfg.max_gap_business_days:                  # DT03
                note = " (a missing return is NOT zero: the chain is broken)" if typ == "return" else ""
                self._add(issues, "DT03", Severity.WARNING, f"Gap of {len(run)} business days{note}", len(run),
                          d0=expected[run[0]], d1=expected[run[-1]], **kw)
            else:
                short += len(run)
        if short:                                                     # DT04
            self._add(issues, "DT04", Severity.INFO, "Short gaps (holidays?)", short, **kw)

    # ------------------------------------------------- type consistency
    def _type_consistency(self, w: pd.DataFrame, issues) -> None:
        nt = w.groupby([COL_INSTR, COL_SHARE])[COL_TYPE].nunique()
        for (instr, share) in nt[nt > 1].index:                       # T01 / T02
            self._add(issues, "T01", Severity.WARNING, "Both price and return rows for the same series",
                      instr=instr, share=share)
            g = w[(w[COL_INSTR] == instr) & (w[COL_SHARE] == share)]
            p = g[g[COL_TYPE] == "price"].set_index(COL_DATE)[COL_VALUE].sort_index()
            r = g[g[COL_TYPE] == "return"].set_index(COL_DATE)[COL_VALUE].sort_index()
            common = p.index.intersection(r.index)
            diff = (p.pct_change().reindex(common) - r.reindex(common)).abs()
            bad = diff[diff > self.cfg.return_price_tol]
            if len(bad):
                self._add(issues, "T02", Severity.WARNING, "pct_change(price) differs from stated return", len(bad),
                          instr=instr, share=share, d0=bad.index.min(), d1=bad.index.max())

        sc = w.groupby(COL_INSTR)[COL_SHARE].unique()
        for instr, classes in sc[sc.map(len) > 1].items():            # T03
            self._add(issues, "T03", Severity.WARNING,
                      f"{len(classes)} share classes {sorted(classes)}: need a rule to pick one", instr=instr)

    # ----------------------------------------------- coverage vs mapping
    def _mapping_checks(self, w: pd.DataFrame, mappings: list[BenchmarkMapping],
                        as_of: pd.Timestamp, issues) -> None:
        cfg = self.cfg
        children = {m.benchmark_id for m in mappings}
        parents = {m.instrument_id for m in mappings}
        orphans = sorted(set(w[COL_INSTR]) - children)
        if orphans:                                                   # M04
            self._add(issues, "M04", Severity.INFO, f"Instruments in perf but not mapped: {orphans[:10]}", len(orphans))

        dates: dict[str, pd.DatetimeIndex] = {}
        for child in sorted(children):
            sub = w[w[COL_INSTR] == child]
            if sub.empty:                                             # M01
                self._add(issues, "M01", Severity.ERROR, "Mapped child has no perf data", instr=child)
                continue
            dates[child] = pd.DatetimeIndex(sub[COL_DATE].unique())
            if set(sub[COL_TYPE]) == {"return"}:                      # M07
                self._add(issues, "M07", Severity.INFO, "Return-only series: no base price, rebased from initial amount", instr=child)
            first, last = sub[COL_DATE].min(), sub[COL_DATE].max()
            for m in (m for m in mappings if m.benchmark_id == child):
                start = pd.Timestamp(m.start_date)
                if start > as_of:
                    continue
                end = min(pd.Timestamp(m.end_date) if m.end_date else as_of, as_of)
                if first > start + pd.Timedelta(days=cfg.start_tolerance_days):   # M02
                    self._add(issues, "M02", Severity.ERROR,
                              f"Data starts {first.date()}, mapping (parent {m.instrument_id}) starts {start.date()}",
                              instr=child, d0=start, d1=first)
                if last < end - pd.Timedelta(days=cfg.max_lag_days):             # M03
                    self._add(issues, "M03", Severity.WARNING,
                              f"Data stops {last.date()}, mapping (parent {m.instrument_id}) runs to {end.date()}",
                              instr=child, d0=last, d1=end)

        composer = BenchmarkComposer(mappings)
        for parent in sorted(parents):
            try:
                segs = composer.build_segments(parent, as_of.date())
            except ValueError as e:                                   # M06
                self._add(issues, "M06", Severity.ERROR, f"Invalid mapping: {e}", instr=parent)
                continue
            for seg in segs:
                if len(seg.weights) < 2:
                    continue
                lo, hi = pd.Timestamp(seg.start), pd.Timestamp(seg.end)
                per_leg = {leg: set(dates[leg][(dates[leg] >= lo) & (dates[leg] <= hi)])
                           for leg in seg.weights if leg in dates}
                if len(per_leg) < 2:
                    continue
                union = set.union(*per_leg.values())
                for leg, ds in per_leg.items():                       # M05
                    gone = sorted(union - ds)
                    if gone:
                        self._add(issues, "M05", Severity.WARNING,
                                  f"Leg has no data on {len(gone)} date(s) where other legs of parent {parent} do "
                                  f"(forward-fill would mask it)", len(gone), instr=leg, d0=gone[0], d1=gone[-1])


# ----------------------------------------------------------------------
if __name__ == "__main__":
    rng = np.random.default_rng(1)
    idx = pd.bdate_range("2024-01-01", "2024-06-28")
    frames = []
    for b in ("A", "B"):
        px = 100 * np.cumprod(1 + rng.normal(0, 0.005, len(idx)))
        frames.append(pd.DataFrame({COL_SHARE: f"SC_{b}", COL_INSTR: b, COL_TYPE: "price", COL_VALUE: px, COL_DATE: idx}))
    df = pd.concat(frames, ignore_index=True)
    # inject problems
    df.loc[10, COL_VALUE] = np.nan                                    # S02
    df.loc[20, COL_TYPE] = "prix"                                     # S03
    df = pd.concat([df, df.iloc[[30]]], ignore_index=True)            # D01
    dup = df.iloc[[40]].copy(); dup[COL_VALUE] += 5                   # D02
    df = pd.concat([df, dup], ignore_index=True)
    df.loc[50, COL_VALUE] = 0                                         # V01
    df.loc[60, COL_VALUE] *= 1.4                                      # V03 / V04
    df.loc[70:78, COL_VALUE] = df.loc[70, COL_VALUE]                  # V06
    df = df.drop(range(130 + 5, 130 + 25))                            # DT03 gap on B (rows of B start at len(idx))
    df = df[~((df[COL_INSTR] == "B") & (df[COL_DATE] > "2024-05-31"))]  # M03

    maps = [BenchmarkMapping("P1", "A", 0.5, date(2023, 12, 1)),      # M02 (data starts Jan 2024)
            BenchmarkMapping("P1", "B", 0.5, date(2024, 1, 1)),
            BenchmarkMapping("P2", "Z", 1.0, date(2024, 1, 1))]       # M01
    rep = CciPerfValidator().validate(df, maps, as_of=date(2024, 6, 28))
    pd.set_option("display.width", 200, "display.max_colwidth", 70)
    print(rep.summary(), "\nhas_errors =", rep.has_errors)
