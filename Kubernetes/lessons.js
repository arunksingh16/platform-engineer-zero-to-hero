/* Course data for the Kubernetes course. Consumed by ../course.js.
   Cloud-specific courses live in child folders (Kubernetes/eks/ and friends)
   and get their own lessons.js with their own key. */
const COURSE = {
  key: "kubernetes",
  title: "Kubernetes from zero",
  lessons: [
    { n: 1, file: "01-desired-state.html", title: "Desired state and the control loop", blurb: "The one idea the whole system is built from." },
    { n: 2, file: "02-pods-and-controllers.html", title: "Pods, and the controllers that run them", blurb: "ReplicaSets, Deployments, and how a rollout works." },
    { n: 3, file: "03-requests-and-limits.html", title: "Requests and limits", blurb: "The scheduler's currency, QoS classes, throttling and OOMKills." },
    { n: 4, file: "04-scheduling.html", title: "Scheduling, and why Pods stay Pending", blurb: "Filtering, scoring, taints, affinity and spread." },
    { n: 5, file: "05-hpa.html", title: "Horizontal Pod Autoscaling", blurb: "The formula, the tolerance, and why it flaps." },
    { n: 6, file: "06-keda.html", title: "KEDA and event-driven scaling", blurb: "Scaling on queue depth, and getting to zero." },
    { n: 7, file: "07-node-autoscaling.html", title: "Node autoscaling and Karpenter", blurb: "Pending Pods, provisioning, consolidation, disruption." },
    { n: 8, file: "08-operators.html", title: "Operators and custom resources", blurb: "Extending the API with the same control loop." },
    { n: 9, file: "09-references.html", title: "References", blurb: "Every claim in this course, and where to check it." },
  ],
};
