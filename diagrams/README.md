# Pilot lesson diagrams

The `.markdy` files are the editable sources, following
[MarkdyScript's canonical specification](https://markdy.com/AGENT.md).
The checked-in SVGs are static overview exports made with
`@markdy/renderer-dom` **1.5.7**. The handbook needs no diagram runtime or network
connection to display them.

| Source | Learning point |
| --- | --- |
| `gateway-configuration.markdy` | Gateway API objects describe desired state; KIC translates it into Kong configuration. |
| `kong-request-path.markdy` | Customer requests traverse Kong, not KIC; shared counters are an optional policy dependency. |
| `inference-lifecycle.markdy` | SGLang and vLLM are alternatives; prefill, decode and cache lookup are logical stages within the engine. |
| `serving-engine-decision.markdy` | Compatibility, service targets and migration value determine whether to canary a candidate. |

To edit and animate a source, paste the entire `.markdy` file into the
[Markdy playground](https://markdy.com/playground/). The sources contain storyboard
beats; static SVGs show the complete overview rather than playback.

## Regenerate SVGs

Install `@markdy/renderer-dom@1.5.7` in a tooling directory of your choice, then run:

```sh
node diagrams/render.mjs /absolute/path/to/node_modules/@markdy/renderer-dom/dist/index.js
```

If that package is already resolvable from this repository, the argument can be
omitted. Commit updated SVGs along with source edits. Use Markdy CLI 1.5.7's
`markdy lint path/to/diagram.markdy` to validate source changes.

Diagrams use the `paper` theme so standalone images remain readable in light and
dark pages. Each lesson provides an adjacent explanation, image alternative text,
and links to the full-size SVG and source. The request-path diagram assumes a
supported shared-counter policy using Redis; local-only rate limiting does not
use that dependency. The decision diagram assumes an existing working baseline.
