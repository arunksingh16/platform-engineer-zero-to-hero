/* Course data for the OpenShift sub-course. Consumed by ../../course.js.
   A child folder of the Kubernetes course: its own progress key, and "up" goes to
   the parent course rather than the site index. */
const COURSE = {
  key: "kubernetes-openshift",
  title: "OpenShift for senior SREs",
  up: { href: "../index.html", label: "↖ Kubernetes" },
  lessons: [
    { n: 1, file: "01-what-openshift-adds.html", title: "What OpenShift adds to Kubernetes", blurb: "The platform-as-operators design, and the two API families that run it." },
    { n: 2, file: "02-install-and-topologies.html", title: "Installation, topologies and hosted control planes", blurb: "IPI, UPI, agent-based, SNO, compact, HyperShift — and what you cannot change later." },
    { n: 3, file: "03-cvo-and-cluster-operators.html", title: "The Cluster Version Operator and ClusterOperators", blurb: "Reading Available / Progressing / Degraded, and the dependency chain behind them." },
    { n: 4, file: "04-nodes-and-machine-api.html", title: "Nodes as cattle: RHCOS and the Machine API", blurb: "Machines, MachineSets, autoscaling and MachineHealthChecks." },
    { n: 5, file: "05-machine-config-operator.html", title: "The Machine Config Operator", blurb: "How node configuration rolls out, why it reboots, and how it gets stuck." },
    { n: 6, file: "06-updates-and-lifecycle.html", title: "Updates, channels and lifecycle", blurb: "Update graphs, EUS-to-EUS, canary pools, disconnected mirroring, and recovery." },
    { n: 7, file: "07-olm-and-operatorhub.html", title: "Operator Lifecycle Manager", blurb: "Catalogs, Subscriptions, InstallPlans, CSVs, and the failure modes of each." },
    { n: 8, file: "08-identity-and-rbac.html", title: "Identity: OAuth, groups and RBAC", blurb: "Identity providers, token lifetimes, kubeadmin, and least-privilege patterns." },
    { n: 9, file: "09-sccs-and-hardening.html", title: "SecurityContextConstraints and hardening", blurb: "SCC selection, UID ranges, Pod Security Admission sync, and platform hardening." },
    { n: 10, file: "10-ovn-kubernetes.html", title: "Networking I: OVN-Kubernetes", blurb: "The default CNI: Geneve, logical switches, egress controls, and MTU." },
    { n: 11, file: "11-routes-ingress-dns.html", title: "Networking II: Routes, routers and DNS", blurb: "IngressControllers, sharding, route types, timeouts, and the API VIP." },
    { n: 12, file: "12-storage.html", title: "Storage", blurb: "CSI, access modes, ODF/Ceph, LVMS, etcd disks, and stuck volumes." },
    { n: 13, file: "13-multi-tenancy.html", title: "Multi-tenancy", blurb: "Projects, templates, quotas, ClusterResourceQuota, noisy neighbours, hard versus soft." },
    { n: 14, file: "14-operations.html", title: "Operations: etcd, monitoring, logging, debugging", blurb: "The control-plane health model and the tools you reach for at 3am." },
    { n: 15, file: "15-incident-playbook-and-references.html", title: "Fleet operations, incident playbook and references", blurb: "GitOps and ACM, a triage order that works, and every source in this course." },
  ],
};
