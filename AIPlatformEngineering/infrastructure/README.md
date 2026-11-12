# AI infrastructure at scale

Ten static lessons for Kubernetes engineers new to GPUs, balancing training and
inference. Start at `index.html`; `lessons.js` supplies the shared course engine's
navigation and isolated `ai-infrastructure-progress` storage namespace.

## Teaching assets

- `infrastructure.css`: course-scoped visual helpers using the handbook theme.
- `widgets.js`: controllable lifecycle diagrams, accelerator filtering,
  fragmentation explorer and validated calculator inputs. No autoplay;
  reduced-motion playback advances one step. Background tabs pause playback.
- `math.js`: pure memory, input-pipeline, queue and capacity arithmetic.
- `diagrams/*.svg`: editable, labeled cluster and inference-fleet drawings.
- Every lesson includes a worked exercise, interview practice (the final lesson
  uses two full design defenses), a quiz and sources.

The site requires no build step or new runtime dependency. Static explanations,
worked examples, diagrams and an index fallback remain readable without JS.

## Model limitations

Memory planning assumes ideal sharding of persistent state and KV cache;
workspace, overhead and reserve are per-device inputs. It cannot establish peak
runtime fit. The input-pipeline model uses comparable byte representations. The
queue model is deterministic excess demand, not a tail-latency simulator.
Capacity planners take measured throughput or explicitly hypothetical inputs,
not hardware-derived performance predictions. Costs cover accelerator allocation
only; all default prices and benchmark figures are invented teaching examples.

Product references were reviewed in November 2026. Recheck version, SKU, region,
fabric, precision and reservation support when updating vendor examples.

## Checks

From the repository root, run the dependency-free arithmetic checks:

```sh
node --test AIPlatformEngineering/infrastructure/tests/planning.test.cjs
```

`tests/browser.cjs` is an optional browser verification script. It requires
Playwright installed in your development environment and its Chromium browser
(or `PLAYWRIGHT_CHANNEL=chrome` for an installed Chrome). Set `NODE_PATH` to an
external installation's `node_modules` if needed. No package installation is
needed to read or deploy the course.

```sh
node AIPlatformEngineering/infrastructure/tests/browser.cjs
```

The script creates its own loopback server with a project-subpath prefix, checks
local links, all quizzes and persisted progress, calculator examples/invalid
inputs, responsive overflow, animation controls, reduced motion and no-JS
reading. `SCREENSHOT_DIR` optionally captures mobile/dark and desktop/light views.
