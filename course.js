/* Shared course engine: lesson list, header/progress, footer nav, quiz.
   Each course supplies its own COURSE object in lessons.js, loaded before this file.
   No dependencies. */
const LESSONS = COURSE.lessons;
const KEY = COURSE.key + "-progress";
// where "up" goes: the site index for a top-level course, the parent course for a child folder
const UP = COURSE.up || { href: "../index.html", label: "↖ Courses" };

function storageNotice(error) {
  console.warn("Course progress could not be saved or loaded.", error);
  if (document.getElementById("storage-notice")) return;
  const notice = document.createElement("p");
  notice.id = "storage-notice";
  notice.className = "storage-notice";
  notice.setAttribute("role", "status");
  notice.textContent = "Browser progress storage is unavailable or invalid. You can still read lessons and take quizzes, but progress may not persist.";
  document.body.appendChild(notice);
}

const store = {
  get() {
    try {
      const progress = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
        throw new Error("Invalid course progress");
      }
      return progress;
    } catch (error) { storageNotice(error); return {}; }
  },
  mark(n) {
    try {
      const p = store.get();
      p[n] = true;
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch (error) { storageNotice(error); }
  },
};

(function init() {
  const main = document.querySelector("main");
  main.id = "main";
  main.setAttribute("tabindex", "-1");
  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#main";
  skip.textContent = "Skip to content";
  document.body.prepend(skip);
  const done = store.get();

  // Index page: render lesson list
  const list = document.getElementById("lessons");
  if (list) {
    const bar = document.createElement("header");
    bar.className = "top";
    bar.innerHTML = `<a href="${UP.href}">${UP.label}</a><span>${COURSE.title}</span>`;
    skip.after(bar);

    const completed = LESSONS.filter((l) => done[l.n]).length;
    const resume = LESSONS.find((l) => !done[l.n]) || LESSONS[0];
    const summary = document.createElement("div");
    summary.className = "course-summary";
    summary.innerHTML = `<span><strong>${completed} / ${LESSONS.length}</strong> lessons complete</span><a href="${resume.file}">${completed === LESSONS.length ? "Review the course" : completed ? "Continue learning" : "Begin the course"} →</a>`;
    list.before(summary);

    LESSONS.forEach((l) => {
      const li = document.createElement("li");
      li.className = done[l.n] ? "done" : "";
      li.innerHTML = `<a href="${l.file}"><span class="n">${done[l.n] ? "✓" : l.n}</span><span><strong>${l.title}</strong><br><span class="muted">${l.blurb}</span></span></a>`;
      list.appendChild(li);
    });
  }

  const n = parseInt(document.body.dataset.lesson || "0", 10);
  if (!n) return;
  const idx = n - 1;

  // Header with progress
  const header = document.createElement("header");
  header.className = "top";
  const ticks = LESSONS.map((l) => `<i class="${done[l.n] ? "on" : ""}"></i>`).join("");
  header.innerHTML = `<a href="${UP.href}">${UP.label}</a><a href="index.html">${COURSE.title}</a><div class="bar">${ticks}</div><span>Lesson ${n} / ${LESSONS.length}</span>`;
  header.querySelector(".bar").setAttribute("aria-label", `${LESSONS.filter((l) => done[l.n]).length} of ${LESSONS.length} lessons complete`);
  header.querySelector(".bar").setAttribute("role", "img");
  skip.after(header);

  const outline = document.createElement("nav");
  outline.className = "course-outline";
  outline.setAttribute("aria-label", "Course lessons");
  outline.innerHTML = `<details${matchMedia("(min-width: 1300px)").matches ? " open" : ""}><summary>Course contents</summary><ol>${LESSONS.map((l) => `<li><a href="${l.file}"${l.n === n ? ' aria-current="page"' : ""}>${l.title}</a></li>`).join("")}</ol></details>`;
  header.after(outline);

  // Footer nav
  const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.setAttribute("aria-label", "Previous and next lessons");
  nav.innerHTML = (prev ? `<a href="${prev.file}">← ${prev.title}</a>` : `<a href="index.html">← All lessons</a>`) +
    (next ? `<a class="next" id="nextLink" href="${next.file}">${next.title} →</a>` : `<a class="next" id="nextLink" href="index.html">Back to start ↺</a>`);
  main.appendChild(nav);
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
    scoreBox.setAttribute("role", "status");
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
      if (pass) {
        store.mark(n);
        done[n] = true;
        const progress = header.querySelector(".bar");
        progress.children[idx].classList.add("on");
        progress.setAttribute("aria-label", `${LESSONS.filter((l) => done[l.n]).length} of ${LESSONS.length} lessons complete`);
        document.getElementById("nextLink").classList.add("ready");
      }
    }
  }
  render();
})();
