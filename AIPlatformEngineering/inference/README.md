# Inference engineering

Four static lessons on serving LLM inference, plus a curated roadmap appendix.
Start at `index.html`; `lessons.js` supplies the shared course engine's navigation
and the isolated `inference-engineering-progress` storage namespace.

Lesson 4 was previously published at `AIPlatformEngineering/01-sglang-vs-vllm.html`,
which is now a redirect stub. Its original progress key (`ai-platform-decisions`)
is abandoned rather than migrated: a reader who completed it will see lesson 4 as
unfinished.

## Teaching assets

- `diagrams/request-time.html` — interactive waterfall of one request's time,
  used by lesson 1.
- `diagrams/request-lifecycle.html` — interactive state machine of a request
  inside the scheduler, used by lesson 2.
- `diagrams/*.delivery.json` — provenance receipts for the two diagrams. Keep
  them beside the HTML; they are what makes the artifacts checkable.
- Lesson 4 reuses the existing `diagrams/inference-lifecycle.svg` and
  `diagrams/serving-engine-decision.svg` at the repository root.

Both diagram pages are self-contained and need no network access or build step.
Every lesson embeds a text equivalent of its diagram, so the explanation is
complete without opening the interactive version or running JavaScript.

## Model limitations

Every performance figure in lessons 1 to 3 is hand-derived from published
datasheet specifications and labelled as such. The arithmetic deliberately omits
attention FLOPs, activation and workspace memory, non-matmul overhead and cache
hierarchy effects; it establishes which regime a phase is in and roughly how far
from the roof, and it does not predict throughput. Lesson 4's comparison table
is explicitly invented for reasoning practice. Hardware figures are dense BF16
datasheet numbers reviewed in November 2026 — re-check your own SKU, since
bandwidth differs between PCIe and SXM variants of the same chip.

Engine behaviour described in lesson 2 (the 16-token default block size,
chunked prefill as the default scheduling policy, recompute versus swap on
preemption) is configurable and changes between releases.

## Regenerating the diagrams

The two interactive diagrams were produced with the `archify` skill. Sources
live in `.archify/` at the repository root, which is git-ignored, so regenerating
them requires re-authoring the candidate JSON. The published HTML and its
`.delivery.json` receipt are the committed artifacts.

## Checks

No arithmetic runs in the browser in this course, so there is nothing to unit
test. Verify links and quizzes with the existing browser script from a sibling
course, which crawls whatever is served:

```sh
node AIPlatformEngineering/infrastructure/tests/browser.cjs
```
