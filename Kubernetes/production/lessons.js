const COURSE = {
  key: "kubernetes-production",
  title: "Kubernetes: production engineering",
  up: { href: "../index.html", label: "↖ Kubernetes" },
  lessons: [
    { n: 1, file: "01-fleet-architecture.html", title: "Fleet architecture and failure domains", blurb: "Cells, ownership, shared dependencies and recovery capacity." },
    { n: 2, file: "02-control-plane-and-etcd.html", title: "Control plane and etcd", blurb: "API saturation, admission latency, quorum and recoverable state." },
    { n: 3, file: "03-iam-and-workload-identity.html", title: "IAM and workload identity", blurb: "Trace principals, constrain escalation and diagnose federation." },
    { n: 4, file: "04-policy-and-tenancy.html", title: "Policy and multi-tenancy", blurb: "Isolation boundaries, admission availability and staged enforcement." },
    { n: 5, file: "05-security-engineering.html", title: "Security engineering", blurb: "Runtime hardening, supply chain, secrets and containment." },
    { n: 6, file: "06-storage-and-recovery.html", title: "Storage and stateful recovery", blurb: "CSI, fencing, topology, data consistency and measured restores." },
    { n: 7, file: "07-networking-at-scale.html", title: "Networking at scale", blurb: "DNS, conntrack, SNAT, packet evidence and migration." },
    { n: 8, file: "08-nodes-and-performance.html", title: "Nodes and performance", blurb: "cgroups, OOM, NUMA, reservations and host-pressure diagnosis." },
    { n: 9, file: "09-capacity-and-scheduling.html", title: "Capacity, scheduling and cost", blurb: "Failure headroom, fragmentation, autoscaler feedback and economics." },
    { n: 10, file: "10-upgrades-and-fleet-delivery.html", title: "Upgrades and fleet delivery", blurb: "Compatibility, canaries, API migration and recovery boundaries." },
    { n: 11, file: "11-observability-and-incidents.html", title: "Observability and incident command", blurb: "Platform SLOs, evidence-led triage and recovery verification." },
    { n: 12, file: "12-platform-apis-and-operators.html", title: "Platform APIs and operators", blurb: "Crash-safe reconciliation, finalizers, concurrency and API evolution." }
  ]
};
