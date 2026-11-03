# Observability from zero

A free, hands-on course on observability for junior engineers: metrics, time series databases, logs, traces, OpenTelemetry and SLOs. Every concept has an animation or interactive widget, a by-hand exercise and a quiz.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run locally

```bash
cd observability-course
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish on GitHub Pages

1. Create a new GitHub repository and push this folder's contents to the repo root (so `index.html` is at the top level).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute your site is live at `https://<your-username>.github.io/<repo-name>/`.

Any static host (Netlify, Cloudflare Pages, S3) works the same way: upload the files as they are.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Home page and lesson list |
| `course.js` | Lesson list, progress bar, footer navigation and the quiz engine |
| `style.css` | Shared styles (light and dark mode) |
| `01-…09-*.html` | One lesson per file; each has its own interactive widget and quiz data |

## Adding a lesson

1. Copy an existing lesson file and change the content, widget and the JSON in `#quiz-data`.
2. Add an entry to the `LESSONS` array at the top of `course.js`.
3. Set `data-lesson` on the `<body>` to the lesson number.
