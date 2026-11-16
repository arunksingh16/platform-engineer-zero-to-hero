# Networking fundamentals

Twelve lessons for junior platform engineers: trace a request, identify each
boundary, predict a failure, then prove recovery from the client's perspective.

## Visual learning

Every lesson has a four-stage walkthrough with manual steps, play/pause and reset.
Nothing autoplays. Reduced-motion mode uses manual steps; changing that preference
or hiding the page stops playback. All explanations are HTML and remain readable
without JavaScript. The course uses the shared theme and existing progress key.

| Lesson | Walkthrough / visual model |
| --- | --- |
| 1 | Next-hop ARP, link envelopes, routed IP packet and return path |
| 2 | IPv4 bit budget slider and longest-prefix route selection |
| 3 | Recursive DNS lookup and cached-answer failover clock |
| 4 | TCP sequence/ACK numbers and two independent TLS legs |
| 5 | Target draining, survivor capacity and stream interruption |
| 6 | Protocol, exposure, scope and TLS service-selection gates |
| 7 | Proxy failure, health detection and client reconnection |
| 8 | SNAT mapping and reverse five-tuple |
| 9 | Cache miss/hit, private data isolation and anycast routing |
| 10 | Zone loss, overload and ready surviving capacity |
| 11 | SYN incident replay and tunnel MTU/ICMP controls |
| 12 | Request-path, trust, capacity and recovery review gates |

`diagrams/*.svg` are hand-authored, editable sources and the published assets.
They need no renderer. `visuals.css` and `visuals.js` are scoped to this course.
Walkthroughs animate inspection of a teaching example, not a live packet capture.
Assumptions are stated beside each model; do not interpret the DNS clock as a
recovery guarantee or the fixed tunnel overhead as a universal value.

## Verification

The optional browser check uses an externally installed Playwright and Chromium
or an installed Chrome. It introduces no runtime or deployment dependency:

```sh
NODE_PATH=/path/to/node_modules PLAYWRIGHT_CHANNEL=chrome node Networking/tests/browser.cjs
```

Omit `PLAYWRIGHT_CHANNEL` to use Playwright's installed Chromium. Optionally set
`SCREENSHOT_DIR` to an existing directory for screenshots. The check serves the
site under `/handbook/` to exercise GitHub Pages project-relative URLs.

Verified: all 12 walkthroughs, 42 quiz answers, persisted course completion,
local links/assets, calculator boundaries, keyboard stepping, timed playback,
pause, mobile overflow, reduced motion, JavaScript errors and no-JS explanations.
SVG packet and mobile lesson screenshots were also inspected. No cloud resources
are deployed and the examples are not network integration tests.
