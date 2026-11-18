/* Inference engineering is a child course with independent progress. */
const COURSE = {
  key: "inference-engineering",
  title: "Inference engineering",
  up: { href: "../index.html", label: "↖ AI platform engineering" },
  lessons: [
    { n: 1, file: "01-roofline.html", title: "Where the time actually goes", blurb: "Derive arithmetic intensity by hand and find out which phase waits on memory." },
    { n: 2, file: "02-scheduler.html", title: "Read the scheduler, do not rebuild it", blurb: "Paged KV blocks, continuous batching, chunked prefill and preemption." },
    { n: 3, file: "03-measurement.html", title: "Build the lens before the knobs", blurb: "TTFT, inter-token latency and queue depth: what to measure, what to delete." },
    { n: 4, file: "04-sglang-vs-vllm.html", title: "SGLang or vLLM: make the serving decision", blurb: "From a slow model endpoint to a workload-specific, measured choice." }
  ]
};
