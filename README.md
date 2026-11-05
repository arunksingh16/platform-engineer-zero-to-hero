# Platform Engineering: Zero to Hero

A practical, self-guided learning path for platform engineering. The repository is a work in progress: Observability and Code analysis are published, and the other topics below are roadmap items rather than published lessons.
Access github pages - https://arunksingh16.github.io/platform-engineer-zero-to-hero

## Courses

| Area | Status | Topics |
| --- | --- | --- |
| Observability | Available | Metrics, time series, logs, traces, OpenTelemetry, SLIs, SLOs, and burn-rate alerting |
| Code analysis | Available | Pure functions and IO, abstract syntax trees, call graphs, runtime detection, and measuring a detector honestly |
| Kubernetes | Available | Control loops, Pods and controllers, scheduling, requests and limits, HPA, KEDA, Karpenter, and operators |
| Kubernetes on EKS / AKS / OpenShift | Planned | Provider specifics layered on the vendor-neutral course, in child directories |
| Infrastructure foundations | Planned | Linux, networking, Git, and containers |
| Platform systems | Planned | Cloud fundamentals, infrastructure as code, and CI/CD |
| Reliability and operations | Planned | Site reliability engineering, incident response, and production operations |

The intended progression is from foundational concepts to operating production systems and, eventually, advanced topics. A topic is not considered complete just because it appears on this roadmap.

## Run locally

From the repository root, start a local static file server:

```sh
uv run --no-project python -m http.server 8000
```

Then open <http://localhost:8000>. The site has no build step or runtime dependencies.

## Publish with GitHub Pages

1. Push the repository to GitHub. Set its visibility to **Public** if you want anyone to access it; private-repository Pages availability depends on your GitHub plan and organization settings.
2. Open **Settings → Pages** for the repository.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
4. Wait for the deployment. The site URL is `https://<owner>.github.io/<repository>/`.

The root `index.html` is the catalog page. Each course lives in its own directory; internal lesson links are relative to that directory and should stay there.

## Repository structure

```text
index.html                 Course catalog
style.css                  Site-wide theme, shared by every course
course.js                  Shared engine: lesson nav, progress, quiz
Observability/             Course
  index.html               Course introduction and lesson list
  lessons.js               This course's lesson list and storage key
  01-...html to 09-...html Interactive lessons
CodeAnalysis/              Course
  index.html
  lessons.js
  01-...html to 05-...html Interactive lessons
  solution/                Runnable Python for the final lesson
Kubernetes/                Course
  index.html
  lessons.js
  01-...html to 09-...html Interactive lessons, ending in a references page
  eks/ aks/ openshift/     Planned child courses, each with its own lessons.js
```

Courses nest. A child course is just a course one level deeper: it gets its own
`lessons.js` with its own `key`, and reaches the shared assets with `../../`.
Nothing in `course.js` assumes a depth.

`style.css` and `course.js` live at the repository root so a change applies to
every course at once. Each course folder supplies only its own data, in
`lessons.js`:

```js
const COURSE = { key: "observability", title: "…", lessons: [ … ] };
```

`key` namespaces that course's progress in `localStorage`, so courses do not
overwrite each other. Lesson pages load the two scripts in order:

```html
<link rel="stylesheet" href="../style.css">
<script src="lessons.js"></script>
<script src="../course.js"></script>
```

## Accuracy and learning standards

- Prefer primary documentation and explain when an example simplifies real system behavior.
- Distinguish rules of thumb from guarantees; resource use depends on configuration, workload, retention, and implementation.
- Avoid putting secrets or raw personal data into telemetry. Use identifiers only when justified, approved, and protected by suitable access and retention controls.
- Keep examples reproducible, check calculations, and revise links when upstream documentation changes.

Primary references for Observability:

- [Prometheus data model](https://prometheus.io/docs/concepts/data_model/)
- [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/)
- [Prometheus histograms](https://prometheus.io/docs/practices/histograms/)
- [Prometheus storage](https://prometheus.io/docs/prometheus/latest/storage/)
- [OpenTelemetry concepts](https://opentelemetry.io/docs/concepts/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)

Primary references for Code analysis:

- [Python `ast` module](https://docs.python.org/3/library/ast.html)
- [Python audit events table](https://docs.python.org/3/library/audit_events.html)
- [PEP 578: Python runtime audit hooks](https://peps.python.org/pep-0578/)
- [Python asyncio: running blocking code](https://docs.python.org/3/library/asyncio-dev.html#running-blocking-code)
- [Bazel: hermeticity](https://bazel.build/basics/hermeticity)
- [scikit-learn: model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html)

Primary references for Kubernetes are listed claim by claim on the course's own
[references page](Kubernetes/09-references.html). The principal ones:

- [Kubernetes documentation](https://kubernetes.io/docs/)
- [Kubernetes API reference](https://kubernetes.io/docs/reference/kubernetes-api/) — field-level defaults
- [KEDA documentation](https://keda.sh/docs/latest/)
- [Karpenter documentation](https://karpenter.sh/docs/)

## License

No license has been selected yet. Until a license is added, standard copyright applies; public visibility alone does not grant permission to reuse or redistribute the content. Choose and add a license before inviting reuse or contributions.
