const COURSE = {
  key: "kubernetes-aks",
  title: "AKS: production operations",
  up: { href: "../index.html#platforms", label: "↖ Kubernetes platforms" },
  lessons: [
    { n: 1, file: "01-ownership-and-architecture.html", title: "The managed-service contract", blurb: "Control plane, node resource group, Standard versus Automatic, and the boundaries you still own." },
    { n: 2, file: "02-node-pools-and-placement.html", title: "Node pools and failure domains", blurb: "System versus user pools, zones, taints, capacity and a pool design you can actually upgrade." },
    { n: 3, file: "03-identity-and-security.html", title: "Identity without shared secrets", blurb: "Entra, Kubernetes authorization, cluster and kubelet identities, workload federation and hardening." },
    { n: 4, file: "04-networking-and-ip-planning.html", title: "Azure CNI and IP planning", blurb: "Overlay versus flat networking, Cilium, subnet math and an interactive surge capacity model." },
    { n: 5, file: "05-ingress-egress-and-dns.html", title: "Traffic, egress and private DNS", blurb: "Trace the request through load balancing, TLS, private endpoints, firewalls and SNAT." },
    { n: 6, file: "06-scaling-and-cost.html", title: "Scaling without wishful thinking", blurb: "HPA, KEDA, Cluster Autoscaler, node autoprovisioning and the cost of unavailable capacity." },
    { n: 7, file: "07-upgrades-and-maintenance.html", title: "Upgrades as a reliability exercise", blurb: "Release support, OS images, surge, PDBs, canaries, maintenance and realistic recovery." },
    { n: 8, file: "08-storage-and-recovery.html", title: "Storage and tested recovery", blurb: "CSI, zones, disk versus file, snapshots, backups, RPO/RTO and restore drills." },
    { n: 9, file: "09-observability-and-incidents.html", title: "Observe, triage, improve", blurb: "SLIs, platform signals, incident playbooks and a production-readiness review." },
  ],
};
