# Code analysis from zero

How a platform works out what code does, and how to tell whether the answer is
any good. Five lessons building towards one real problem: detecting which
functions perform IO, and measuring the detector honestly.

All five lessons are published.

## Run locally

Serve from the **repository root** — the theme and course engine are shared and
live one level up.

```bash
cd ..
python3 -m http.server 8000
# open http://localhost:8000/CodeAnalysis/
```

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Course home page and lesson list |
| `lessons.js` | This course's lesson list, title and progress key |
| `01-what-is-io.html` | Pure functions, reads and writes, why a platform cares |
| `02-ast-call-graph.html` | Syntax trees, call graphs, propagating to a fixed point |
| `03-what-static-misses.html` | Dynamic dispatch, duck typing, runtime detection, the third verdict |
| `04-measuring-a-detector.html` | Confusion matrices, baselines, precision and recall |
| `05-the-problem.html` | The real problem, worked end to end |
| `solution/` | Runnable stdlib Python: detector, evaluator, tests ([README](solution/README.md)) |
| `../style.css` | Site-wide theme |
| `../course.js` | Shared engine: progress bar, footer navigation, quiz |

## Cross-course links

Lessons here link back to Observability rather than re-explaining shared ground:

| This course | Links to | Shared idea |
| --- | --- | --- |
| 1. What counts as IO? | [Traces and spans](../Observability/07-traces.html), [OpenTelemetry](../Observability/08-opentelemetry.html) | A trace waterfall is a machine-generated list of the moments a service left the process |
| 3. What static analysis cannot see | [OpenTelemetry](../Observability/08-opentelemetry.html) | Auto-instrumentation detects IO at runtime by wrapping known libraries |
| 4. Measuring a detector | [SLIs, SLOs & burn-rate alerting](../Observability/09-slos.html) | An SLI is good ÷ valid events; precision and recall are ratios over a confusion matrix. The denominator decides whether the number means anything |

## Sources

Every quoted claim is traceable to a primary source:

| Lesson | Source |
| --- | --- |
| 1 | [Bazel: hermeticity](https://bazel.build/basics/hermeticity) — hermetic build definition, action caching, per-action sandboxing |
| 1 | [Python asyncio: running blocking code](https://docs.python.org/3/library/asyncio-dev.html#running-blocking-code) — why blocking calls stall the event loop |
| 2 | [Python `ast` module](https://docs.python.org/3/library/ast.html) — `parse`, `walk`, `unparse`. Tree dumps in the widget are real Python 3.14 output |
| 3 | [PEP 578](https://peps.python.org/pep-0578/) and the [audit events table](https://docs.python.org/3/library/audit_events.html) — runtime audit hooks. The sample output is a real run |
| 3 | Rice's theorem (1953) — no general procedure decides a non-trivial semantic property for all programs |
| 4 | [scikit-learn: model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html) — precision, recall, F-measure, dummy baselines, imbalance |

The problem in lesson 5 is published as an anonymous scenario. It is a teaching
reconstruction, not a case study of any identifiable person or employer, and the
numbers in it are worked examples rather than measurements of a real codebase.
