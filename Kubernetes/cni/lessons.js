/* Course data for the Pod networking / CNI sub-course. Consumed by ../../course.js.
   A child folder of the Kubernetes course: its own progress key, and "up" goes to
   the parent course rather than the site index. */
const COURSE = {
  key: "kubernetes-cni",
  title: "Pod networking and the CNI",
  up: { href: "../index.html", label: "↖ Kubernetes" },
  lessons: [
    { n: 1, file: "01-why-a-cni.html", title: "Why a CNI exists at all", blurb: "The network model Kubernetes demands but refuses to implement." },
    { n: 2, file: "02-pod-to-pod.html", title: "How a packet gets from Pod to Pod", blurb: "Namespaces, veth pairs, IPAM, and overlay versus routed." },
    { n: 3, file: "03-network-policy.html", title: "NetworkPolicy and who enforces it", blurb: "Default-allow until selected, additive rules, and plugins that ignore you." },
    { n: 4, file: "04-the-options.html", title: "The options: Flannel, Calico, Cilium, cloud CNIs", blurb: "What each one actually does differently, and how to choose." },
    { n: 5, file: "05-ebpf-and-cilium.html", title: "eBPF, Cilium, and where the dataplane is going", blurb: "Why iptables ran out of road — plus every source in this course." },
  ],
};
