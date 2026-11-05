# Code analysis from zero

How a platform works out what code does, and how to tell whether the answer is
any good. Five lessons building towards one real problem: detecting which
functions perform IO, and measuring the detector honestly.

Status: lesson 1 published, lessons 2–5 in progress.

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
| `../style.css` | Site-wide theme |
| `../course.js` | Shared engine: progress bar, footer navigation, quiz |

Lesson 5 will add a `solution/` directory with runnable Python (standard
library only) so readers can point the detector at their own code.

## Cross-course links

Lessons here link back to Observability rather than re-explaining shared ground:

| This course | Links to | Shared idea |
| --- | --- | --- |
| 1. What counts as IO? | [Traces and spans](../Observability/07-traces.html), [OpenTelemetry](../Observability/08-opentelemetry.html) | A trace waterfall is a machine-generated list of the moments a service left the process |
| 3. What static analysis cannot see | [OpenTelemetry](../Observability/08-opentelemetry.html) | Auto-instrumentation detects IO at runtime by wrapping known libraries |
| 4. Measuring a detector | [SLIs, SLOs & burn-rate alerting](../Observability/09-slos.html) | An SLI is good ÷ valid events; precision and recall are ratios over a confusion matrix. The denominator decides whether the number means anything |

## Sources

Claims in lesson 1 are traceable to:

- [Bazel: hermeticity](https://bazel.build/basics/hermeticity) — the definition of a hermetic build, action caching, per-action sandboxing
- [Python asyncio: running blocking code](https://docs.python.org/3/library/asyncio-dev.html#running-blocking-code) — why blocking calls stall the event loop
