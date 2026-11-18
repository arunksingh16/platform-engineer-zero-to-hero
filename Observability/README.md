# Observability from zero

A free, hands-on course on observability for junior engineers: metrics, time series databases, logs, traces, OpenTelemetry and SLOs. Every concept has an animation or interactive widget, a by-hand exercise and a quiz.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run locally

Serve from the **repository root**, not this folder — the theme and the course
engine are shared across courses and live one level up.

```bash
cd ..
python3 -m http.server 8000
# open http://localhost:8000/Observability/
```

Publishing is covered in the [root README](../README.md).

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Course home page and lesson list |
| `lessons.js` | This course's lesson list, title and progress key |
| `01-…09-*.html` | One lesson per file; each has its own interactive widget and quiz data |
| `diagrams/*.html` | Two self-contained explorable diagrams, embedded in lessons 4 and 9 |
| `diagrams/*.delivery.json` | Provenance receipts; keep them beside their HTML |
| `../style.css` | Site-wide theme (light and dark mode) |
| `../course.js` | Shared engine: progress bar, footer navigation, quiz, diagram full-screen |

## Diagrams

Most lessons draw their own visual with inline SVG or a small widget, which stays
the right choice for anything that needs to animate or respond to an input.

Two topics were taught only in prose and got an explorable diagram instead:

- Lesson 4, `diagrams/tsdb-write-path.html` — the scrape → head → WAL → block →
  object storage path, and the query path reading back across sources.
- Lesson 9, `diagrams/burn-rate-alerting.html` — three parallel burn-rate rules,
  each an AND of a long and a short window.

They are embedded with `<figure class="diagram"><iframe loading="lazy">`. The
iframe needs no JavaScript in the host page; `course.js` only adds the
full-screen button, and falls back to opening a new tab where element
full-screen is unavailable. Every such figure also carries a text equivalent in
its `figcaption`, so the lesson reads completely without loading the diagram.

Lessons 7 and 8 deliberately keep their hand-built trace waterfall and collector
pipeline: those already respond to clicks and replay, which an exported diagram
would not do better.

Both files were produced with the `archify` skill; the candidate sources live in
the git-ignored `.archify/` directory at the repository root.

## Adding a lesson

1. Copy an existing lesson file and change the content, widget and the JSON in `#quiz-data`.
2. Add an entry to the `lessons` array in `lessons.js`.
3. Set `data-lesson` on the `<body>` to the lesson number.

If the lesson depends on a concept another course already teaches, link to that
lesson in a `<div class="callout">` rather than explaining it again.
