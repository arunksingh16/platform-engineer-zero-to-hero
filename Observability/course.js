/* Shared course logic: lesson list, header/progress, footer nav, quiz engine. No dependencies. */
const LESSONS = [
  { n: 1, file: "01-why-observability.html", title: "Why observability?", blurb: "Monitoring vs observability, and the three signals." },
  { n: 2, file: "02-metrics.html", title: "Metrics: counters, gauges, histograms", blurb: "The three building blocks, worked by hand." },
  { n: 3, file: "03-time-series-labels.html", title: "Time series, labels & cardinality", blurb: "What a series really is, and how systems blow up." },
  { n: 4, file: "04-tsdb.html", title: "How a time series database stores data", blurb: "Scraping, chunks, delta-of-delta compression." },
  { n: 5, file: "05-querying.html", title: "Querying: rate, sum and percentiles", blurb: "PromQL maths you can do on paper." },
  { n: 6, file: "06-logs.html", title: "Logs you can actually search", blurb: "Structured logs and correlation IDs." },
  { n: 7, file: "07-traces.html", title: "Traces and spans", blurb: "Waterfalls, parent/child, self time." },
  { n: 8, file: "08-opentelemetry.html", title: "OpenTelemetry", blurb: "API, SDK, OTLP, Collector, context propagation." },
  { n: 9, file: "09-slos.html", title: "SLIs, SLOs & burn-rate alerting", blurb: "Error budgets and what to learn next." },
];

const store = {
  get() { try { return JSON.parse(localStorage.getItem("obs-progress") || "{}"); } catch (e) { return {}; } },
  mark(n) { try { const p = store.get(); p[n] = true; localStorage.setItem("obs-progress", JSON.stringify(p)); } catch (e) {} },
};

(function init() {
  const done = store.get();

  // Index page: render lesson list
  const list = document.getElementById("lessons");
  if (list) {
    LESSONS.forEach((l) => {
      const li = document.createElement("li");
      li.className = done[l.n] ? "done" : "";
      li.innerHTML = `<a href="${l.file}"><span class="n">${done[l.n] ? "✓" : l.n}</span><span><strong>${l.title}</strong><br><span class="muted">${l.blurb}</span></span></a>`;
      li.firstChild.parentNode.className = done[l.n] ? "done" : "";
      list.appendChild(li);
    });
  }

  const n = parseInt(document.body.dataset.lesson || "0", 10);
  if (!n) return;
  const idx = n - 1;

  // Header with progress
  const header = document.createElement("header");
  header.className = "top";
  header.innerHTML = `<a href="index.html">Observability from zero</a><div class="bar"><i style="width:${(n / LESSONS.length) * 100}%"></i></div><span>Lesson ${n} / ${LESSONS.length}</span>`;
  document.body.prepend(header);

  // Footer nav
  const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  const nav = document.createElement("div");
  nav.className = "nav";
  nav.innerHTML = (prev ? `<a href="${prev.file}">← ${prev.title}</a>` : `<a href="index.html">← All lessons</a>`) +
    (next ? `<a class="next" id="nextLink" href="${next.file}">${next.title} →</a>` : `<a class="next" id="nextLink" href="index.html">Back to start ↺</a>`);
  document.querySelector("main").appendChild(nav);
  if (done[n]) document.getElementById("nextLink").classList.add("ready");

  // Quiz
  const mount = document.getElementById("quiz");
  const dataEl = document.getElementById("quiz-data");
  if (!mount || !dataEl) return;
  const questions = JSON.parse(dataEl.textContent);
  mount.className = "quiz";

  function render() {
    mount.innerHTML = `<h2>Check yourself</h2><p class="muted">Answer all ${questions.length}. You need ${Math.ceil(questions.length * 0.7)} correct to complete the lesson (you can retry).</p>`;
    let answered = 0, correct = 0;
    const scoreBox = document.createElement("div");
    questions.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "q";
      card.innerHTML = `<p>${qi + 1}. ${q.q}</p>`;
      q.options.forEach((text, oi) => {
        const b = document.createElement("button");
        b.className = "opt";
        b.innerHTML = text;
        b.onclick = () => {
          card.querySelectorAll(".opt").forEach((x) => (x.disabled = true));
          const ok = oi === q.answer;
          b.classList.add(ok ? "right" : "wrong");
          if (!ok) card.querySelectorAll(".opt")[q.answer].classList.add("right");
          const why = document.createElement("div");
          why.className = "why";
          why.innerHTML = (ok ? "✅ Correct. " : "❌ Not quite. ") + q.why;
          card.appendChild(why);
          answered++; if (ok) correct++;
          if (answered === questions.length) finish();
        };
        card.appendChild(b);
      });
      mount.appendChild(card);
    });
    mount.appendChild(scoreBox);

    function finish() {
      const pass = correct >= Math.ceil(questions.length * 0.7);
      scoreBox.innerHTML = `<div class="score ${pass ? "ok" : "err"}">${correct} / ${questions.length} — ${pass ? "Lesson complete! 🎉" : "Re-read the lesson and try again."}</div>`;
      const retry = document.createElement("button");
      retry.className = "ghost";
      retry.textContent = "Retry quiz";
      retry.onclick = render;
      scoreBox.appendChild(retry);
      if (pass) { store.mark(n); document.getElementById("nextLink").classList.add("ready"); }
    }
  }
  render();
})();
