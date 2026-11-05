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
| `../style.css` | Site-wide theme (light and dark mode) |
| `../course.js` | Shared engine: progress bar, footer navigation, quiz |

## Adding a lesson

1. Copy an existing lesson file and change the content, widget and the JSON in `#quiz-data`.
2. Add an entry to the `lessons` array in `lessons.js`.
3. Set `data-lesson` on the `<body>` to the lesson number.

If the lesson depends on a concept another course already teaches, link to that
lesson in a `<div class="callout">` rather than explaining it again.
