# Platform Engineering: Zero to Hero

A practical, self-guided learning path for platform engineering. The repository is a work in progress: Observability is the first available course, and the other topics below are roadmap items rather than published lessons.

## Courses

| Area | Status | Topics |
| --- | --- | --- |
| Observability | Available | Metrics, time series, logs, traces, OpenTelemetry, SLIs, SLOs, and burn-rate alerting |
| Infrastructure foundations | Planned | Linux, networking, Git, and containers |
| Platform systems | Planned | Kubernetes, cloud fundamentals, infrastructure as code, and CI/CD |
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

The root `index.html` is the catalog page. The Observability course lives in `Observability/`; its internal lesson links are relative to that directory and should stay there.

## Repository structure

```text
index.html                 Course catalog
Observability/             Available course
  index.html               Course introduction and lesson list
  course.js                Lesson navigation, progress, and quiz logic
  style.css                Shared course styles
  01-...html to 09-...html Interactive lessons
```

## Accuracy and learning standards

- Prefer primary documentation and explain when an example simplifies real system behavior.
- Distinguish rules of thumb from guarantees; resource use depends on configuration, workload, retention, and implementation.
- Avoid putting secrets or raw personal data into telemetry. Use identifiers only when justified, approved, and protected by suitable access and retention controls.
- Keep examples reproducible, check calculations, and revise links when upstream documentation changes.

Useful primary references for the current course:

- [Prometheus data model](https://prometheus.io/docs/concepts/data_model/)
- [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/)
- [Prometheus histograms](https://prometheus.io/docs/practices/histograms/)
- [Prometheus storage](https://prometheus.io/docs/prometheus/latest/storage/)
- [OpenTelemetry concepts](https://opentelemetry.io/docs/concepts/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)

## License

No license has been selected yet. Until a license is added, standard copyright applies; public visibility alone does not grant permission to reuse or redistribute the content. Choose and add a license before inviting reuse or contributions.