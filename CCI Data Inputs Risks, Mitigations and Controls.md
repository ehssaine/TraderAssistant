# CCI Data Inputs: Risks, Mitigations and Controls

This register covers each data input to the CCI calculation library. For each input: what it is, what could go wrong, how to mitigate the risk, and the control to put in place. It is built from the CCI setup (share classes with 1 to 5 benchmarks, weights summing to 1, performance over a 10-year window), so adjust any item that differs from your actual pipeline.

## 1. Share class prices / NAVs

**What it is:** the time series of net asset values per share class, the base of every performance figure.

**What could go wrong:**

- Missing month or gap in the series
- Stale price (same value repeated) or a late NAV restatement
- Outlier or typo (misplaced decimal, wrong currency)
- Non-month-end dates when month-end is expected
- Short history (share class younger than 10 years) or dormant share class
- Dividend or distribution not reflected, so performance is distorted

**Mitigation:** one documented rule per case (fill, flag, or exclude), applied the same way every run. Never silently interpolate. Keep the raw series untouched and apply corrections in a separate layer.

**Controls:**

- Completeness check: expected number of month-end points versus received
- Staleness check: flag N identical consecutive values
- Outlier check: monthly return beyond a threshold triggers review
- Date check: every point must fall on the expected calendar date
- History-length check: classify as full, short, or dormant before calculating

## 2. Benchmark index levels / returns

**What it is:** the time series for each benchmark, total return or price return, in a given currency.

**What could go wrong:**

- Wrong index variant (price return used instead of total return, net versus gross of tax)
- Currency mismatch with the share class
- Different frequency from the share class (daily versus monthly), which is your open composite case
- Missing data or provider restatement
- Index discontinued, renamed or rebased

**Mitigation:** store the index variant and currency as explicit metadata, resample to a single documented frequency before combining, and version the data so a restatement is traceable.

**Controls:**

- Metadata check: variant and currency must match the share class definition
- Frequency check: align or reject before any composite calculation
- Completeness and outlier checks, same as for NAVs
- Reconciliation of a sample of returns against a second source or the provider factsheet

## 3. Benchmark-to-share-class mapping

**What it is:** which benchmark or benchmarks apply to each share class, and from when to when.

**What could go wrong:**

- Share class mapped to the wrong benchmark
- Benchmark change with an effective date that is wrong or not on a month-end
- Benchmark added or removed during the 10 years without the history being handled
- Overlapping or missing validity periods, leaving a gap or a double count

**Mitigation:** treat the mapping as dated reference data with start and end dates, never as a single current value. Require a documented source (prospectus, KID, or manager notice) for every change.

**Controls:**

- Continuity check: validity periods must be contiguous with no gap and no overlap
- Every share class has at least one and at most five active benchmarks at any date
- Change log with source document and approver
- Four-eyes review on any mapping change

## 4. Composite benchmark weights

**What it is:** the weight of each component in a multi-benchmark composite, valid over a period.

**What could go wrong:**

- Weights do not sum to 1 (rounding, typo, missing component)
- Weight change on a date that does not align with the return calendar
- Negative or zero weight, or a component weight left from a removed benchmark
- Rebalancing assumption differs from the manager's (monthly rebalanced versus buy-and-hold)

**Mitigation:** validate on load, fail loudly rather than normalise silently, and document the rebalancing convention once and apply it everywhere.

**Controls:**

- Sum-to-one check with a strict tolerance
- Range check: each weight between 0 and 1
- Effective-date check against the month-end calendar
- Regression test comparing the composite to a hand-computed example

## 5. Calendar and frequency

**What it is:** the dates on which values are observed and the frequency used to compute returns.

**What could go wrong:**

- Holidays and market closures create missing days
- Month-end falls on a weekend, so NAV and index dates differ
- Time zone or cut-off differences between providers
- Different frequencies mixed inside one calculation

**Mitigation:** one reference calendar, one documented rule for non-business month-ends (last available business day), and a single frequency per calculation.

**Controls:**

- Calendar alignment check between share class and each benchmark
- Automatic flag when a date is shifted by the fallback rule
- Test cases covering non-month-end dates, which are on your TODO list

## 6. Static and reference data

**What it is:** share class identifiers (ISIN), currency, inception date, share class type, fund domicile.

**What could go wrong:**

- Wrong or duplicate identifier
- Inception date later than the first price, or earlier than the real launch
- Currency inconsistent with the price series
- Share class closed or merged but still processed

**Mitigation:** one golden source for reference data, with a documented owner and a refresh process.

**Controls:**

- Uniqueness check on identifiers
- Consistency check: first price date versus inception date
- Currency consistency check across NAV, benchmark and reference data
- Status check: closed or merged share classes excluded or flagged

## 7. Parameters and regulatory configuration

**What it is:** the calculation window (10 years), methodology choices, and thresholds.

**What could go wrong:**

- Parameter changed without a trace
- Regulatory change (PRIIPs KID modernisation, UK CCI regime) not reflected
- Thresholds too tight (noise) or too loose (misses real errors)

**Mitigation:** configuration under version control, with every change reviewed and linked to its regulatory reason.

**Controls:**

- Config versioning and change approval
- Regression test suite run on every change, tied to your test-case tracker
- Periodic review of thresholds against observed false positives and misses

## 8. Cross-cutting controls and what to do when a problem occurs

**Control families to present to the business analysts:**

- **Preventive:** validation on load, rejecting bad input before it enters the calculation
- **Detective:** post-calculation reasonableness checks, such as performance versus benchmark within an expected range, and period-over-period change
- **Corrective:** a documented fallback or exclusion rule with a flag on the output
- **Governance:** logging, ownership, four-eyes review, and an audit trail

**When a problem occurs:**

1. Detect: the control raises an alert with the share class, input and rule that failed
2. Contain: block or flag the affected output so it is not published
3. Diagnose: identify the source, either data provider, internal feed or mapping
4. Resolve: correct at source where possible, otherwise apply the documented rule
5. Communicate: tell the business analysts which clients and figures are affected
6. Learn: add a test case so it is caught automatically next time

**Severity classification:** blocking (no output), warning (output published with a flag), and informational (logged only). This gives you a clear way to present the classification of all controls and to come across as managing the process, not only executing it.
