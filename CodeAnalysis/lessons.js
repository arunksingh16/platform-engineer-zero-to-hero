/* Course data for the Code analysis course. Consumed by ../course.js.
   Add an entry here only when the lesson file exists. */
const COURSE = {
  key: "code-analysis",
  title: "Code analysis from zero",
  lessons: [
    { n: 1, file: "01-what-is-io.html", title: "What counts as IO?", blurb: "Pure functions, reads, writes, and why a platform cares." },
    { n: 2, file: "02-ast-call-graph.html", title: "Reading code as a tree", blurb: "Syntax trees, call graphs, and propagating to a fixed point." },
    { n: 3, file: "03-what-static-misses.html", title: "What static analysis cannot see", blurb: "Dynamic dispatch, duck typing, and the third verdict." },
    { n: 4, file: "04-measuring-a-detector.html", title: "Measuring a detector", blurb: "Confusion matrices, baselines, precision and recall." },
    { n: 5, file: "05-the-problem.html", title: "The problem", blurb: "Interrogate the claim, build the detector, place the model." },
  ],
};
