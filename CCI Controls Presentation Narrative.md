# CCI Controls: Presentation Narrative

A storyline for presenting the CCI data inputs, risks and controls to the business analysts and to the management who will run production. The aim: show that you are managing the project, not only executing it.

## The central message

"The CCI library is not just a calculator. It is a calculator with a safety system around it. Every input is checked before it is used, every problem is caught early and classified, and everyone knows what happens next."

If the audience remembers one sentence, it should be that one.

## Format and timing

About 25 to 30 minutes plus questions. Roughly 10 slides. Open with the common story, then split the emphasis: analysts care about their clients and their figures, management cares about risk, ownership and accountability.

## Act 1: Why this matters (3 minutes)

**Slide 1: Opening hook.** Start from the client, not the code. "A manager asks us why a share class shows a performance figure that looks wrong. What do we answer, and how fast?" This lands with analysts, whose clients are managers and investment managers, and with management, who own the consequences.

**Slide 2: CCI versus PRIIPs in one view.** Keep it short: what changes with CCI (benchmark-based performance, up to five benchmarks per share class, a 10-year history, benchmark and weight changes over time) and why that makes the data more demanding than before. The point to land: more moving parts means more places for things to go wrong, so controls are not optional.

## Act 2: Where we started and what we built (5 minutes)

**Slide 3: The starting point.** Be factual and calm. When you took the library over, it handled CCI performance for one benchmark and a single benchmark change over time. This is not criticism of the past, it is the baseline.

**Slide 4: What we added.** Composite benchmarks of 1 to N components, weight changes of a composite over the 10 years, benchmark mapping changes over the 10 years, and a structured test-case list. Show progress as a story: from one benchmark to the full real-world lifecycle.

## Act 3: The data inputs and their risks (8 minutes)

**Slide 5: The map of inputs.** One diagram: share class prices, benchmark levels, mapping, weights, calendar, reference data, parameters, all flowing into the calculation and then the output. This is the single most important visual. Everyone should see that the risk lives at the inputs.

**Slide 6: What can go wrong, in plain words.** Do not read the full register. Pick the three or four risks that are most vivid for this audience: a missing month in a share class, a benchmark changed on a date that is not a month-end, weights that do not sum to one, and benchmark data at a different frequency from the share class. Use one real-looking example for each, with the visible effect on the number.

**Slide 7: The control philosophy.** Four families: preventive, detective, corrective, governance. Then the principle that ties them together: never fix silently, never ignore silently. Every correction is documented, every anomaly is flagged.

## Act 4: The classification and what happens when it breaks (5 minutes)

**Slide 8: Classification of all controls.** The severity scale: blocking (no output is produced), warning (output published with a flag), informational (logged only). This is where management will focus, because it answers the question "what stops production and what does not?" Have the full classified list ready in an appendix.

**Slide 9: When a problem occurs.** Walk through the flow: detect, contain, diagnose, resolve, communicate, learn. Name the owner at each step. Stress the last step: each incident becomes a new test case, so the system gets stronger over time. This is also where you show your test tracker.

## Act 5: Status and the ask (4 minutes)

**Slide 10: Where we are, what remains, what I need.** Be honest and specific. Of the 19 test cases, 10 are done, 1 is in progress (composite with benchmarks of different frequency), and 8 are still to do, mostly share-class history and data edge cases. Then the asks, which is where you show leadership:

- A decision on who owns each control in production
- Agreement on the severity classification and the blocking rules
- A named contact on the data provider side and on the analyst side for incidents
- A date to review the first production month together

End by repeating the central message.

## Tailoring by audience

**For the analysts:**

- Lead with client impact and examples they recognise
- Tell them what they will see: flags on outputs, and what each flag means
- Tell them what you need from them: early warning of benchmark changes from managers, since the mapping depends on that information
- Make it a partnership, not a hand-over

**For the production management:**

- Lead with risk, ownership and auditability
- Emphasise the blocking versus warning rules and the incident flow
- Show that nothing is silent: logging, versioning, four-eyes review on mapping changes
- Give them a clear picture of residual risk, meaning what is still open and when it closes

## Phrases that signal you are managing the project

- "Here is the decision I need from you."
- "Here is the risk, here is the control, here is the owner."
- "This is what is done, this is what remains, and this is the date."
- "I have classified every control so we know what stops production."
- "Every incident becomes a test, so the same problem cannot surprise us twice."

## Likely questions and how to answer

**"What if the data provider sends bad data?"** Preventive checks catch it on load, the output is blocked or flagged depending on severity, and the provider is contacted through the named contact. The raw data is never overwritten, so we can always trace back.

**"Can we trust the numbers today?"** Yes for the covered cases, and here is the tracker showing which ones. For the open cases, the output carries a flag until they are closed.

**"Why not just fix the data automatically?"** Silent fixes hide problems and break audit. We apply only documented rules, and every application is flagged.

**"Who is responsible when a control fails?"** The control register names an owner for each one, and the incident flow names who acts at each step. This is the first ask on the last slide.

**"How long until the remaining test cases are done?"** Give a date. If you do not know yet, commit to a date by which you will give the date.

## Delivery tips

- One idea per slide, with the data register as backup rather than on the slides
- Use the same colours for the severity levels everywhere: red for blocking, orange for warning, grey for informational
- Prepare one concrete worked example, with real-looking numbers, to show a control catching a problem
- Finish on the asks, not on the technical detail, because the asks are what show ownership
