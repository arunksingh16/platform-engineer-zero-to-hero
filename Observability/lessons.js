/* Course data for the Observability course. Consumed by ../course.js. */
const COURSE = {
  key: "observability",
  title: "Observability from zero",
  lessons: [
    { n: 1, file: "01-why-observability.html", title: "Why observability?", blurb: "Monitoring vs observability, and the three signals." },
    { n: 2, file: "02-metrics.html", title: "Metrics: counters, gauges, histograms", blurb: "The three building blocks, worked by hand." },
    { n: 3, file: "03-time-series-labels.html", title: "Time series, labels & cardinality", blurb: "What a series really is, and how systems blow up." },
    { n: 4, file: "04-tsdb.html", title: "How a time series database stores data", blurb: "Scraping, chunks, delta-of-delta compression." },
    { n: 5, file: "05-querying.html", title: "Querying: rate, sum and percentiles", blurb: "PromQL maths you can do on paper." },
    { n: 6, file: "06-logs.html", title: "Logs you can actually search", blurb: "Structured logs and correlation IDs." },
    { n: 7, file: "07-traces.html", title: "Traces and spans", blurb: "Waterfalls, parent/child, self time." },
    { n: 8, file: "08-opentelemetry.html", title: "OpenTelemetry", blurb: "API, SDK, OTLP, Collector, context propagation." },
    { n: 9, file: "09-slos.html", title: "SLIs, SLOs & burn-rate alerting", blurb: "Error budgets and what to learn next." },
  ],
};
