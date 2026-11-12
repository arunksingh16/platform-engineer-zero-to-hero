/* Infrastructure is a child course with independent progress. */
const COURSE = {
  key: "ai-infrastructure",
  title: "AI infrastructure at scale",
  up: { href: "../index.html", label: "↖ AI platform engineering" },
  lessons: [
    { n: 1, file: "01-workloads.html", title: "From Kubernetes to AI infrastructure", blurb: "Follow a training batch and an inference request; learn the GPU vocabulary." },
    { n: 2, file: "02-accelerators.html", title: "Choosing an accelerator", blurb: "Evaluate memory, bandwidth, software, topology and availability before price." },
    { n: 3, file: "03-memory.html", title: "Will the workload fit?", blurb: "Work out training state and inference KV-cache budgets." },
    { n: 4, file: "04-parallelism.html", title: "Scaling training across accelerators", blurb: "Explore data, tensor and pipeline parallelism and sharded state." },
    { n: 5, file: "05-topology.html", title: "Designing the cluster and network", blurb: "Trace local links, scale-out fabrics and failure boundaries." },
    { n: 6, file: "06-storage.html", title: "Feeding accelerators and saving progress", blurb: "Size data pipelines, caches, checkpoints and model loading." },
    { n: 7, file: "07-inference.html", title: "Designing inference fleets", blurb: "Plan replicas, routing, queues and cold starts around service targets." },
    { n: 8, file: "08-operations.html", title: "Scheduling and operating AI workloads", blurb: "Resolve fragmentation, observe bottlenecks and recover safely." },
    { n: 9, file: "09-capacity.html", title: "Capacity planning and economics", blurb: "Meet training deadlines and inference demand using measured capacity." },
    { n: 10, file: "10-capstones.html", title: "Design review and incident capstones", blurb: "Defend two architectures, work the numbers and respond to failures." }
  ]
};
