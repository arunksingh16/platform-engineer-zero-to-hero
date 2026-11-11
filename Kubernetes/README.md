# Kubernetes from zero

Kubernetes taught from the control loop up: Pods and controllers, scheduling,
requests and limits, HPA, KEDA, Karpenter and operators. Nine lessons,
vendor-neutral, with every quoted claim sourced on the references page.

## Run locally

Serve from the **repository root** — the theme and course engine are shared and
live one level up.

```bash
cd ..
python3 -m http.server 8000
# open http://localhost:8000/Kubernetes/
```

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Course home, lesson list, and the hub for platform-specific courses |
| `lessons.js` | This course's lesson list, title and progress key |
| `01-desired-state.html` | Spec vs status, controllers, the control loop |
| `02-pods-and-controllers.html` | Pods, ReplicaSets, Deployments, rolling updates |
| `03-requests-and-limits.html` | Scheduler accounting, QoS, throttling vs OOMKill |
| `04-scheduling.html` | Filtering and scoring, taints, affinity, Pending |
| `05-hpa.html` | The HPA formula, tolerance, stabilization, metrics APIs |
| `06-keda.html` | ScaledObjects, activation vs scaling, scale to zero |
| `07-node-autoscaling.html` | Cluster Autoscaler vs Karpenter, consolidation, disruption |
| `08-operators.html` | CRDs, the operator pattern, idempotent reconciliation |
| `09-references.html` | Every claim, its source, and how to check it |
| `../style.css` | Site-wide theme |
| `../course.js` | Shared engine: progress bar, footer navigation, quiz |

## Child courses

`cni/` — **Pod networking and the CNI**, five lessons: the network model and IP
planning, the packet path and MTU, NetworkPolicy and who enforces it, choosing
between Flannel, Calico, Cilium and the cloud CNIs, and the eBPF dataplane.
Vendor-neutral, with its own references section at the end of lesson 5.

## Kubernetes platforms

OpenShift, AKS and the EKS roadmap are grouped as peers under **Kubernetes
platforms** on both the site catalog and this course's home page. CNI remains
a vendor-neutral deep dive. Existing OpenShift paths and progress are unchanged.

`openshift/` — **OpenShift for senior SREs**, fifteen lessons: operator-managed
architecture, installation and hosted control planes, the CVO and ClusterOperators,
Machine API and MachineConfig, updates, OLM, OAuth and RBAC, SCCs and hardening,
OVN-Kubernetes, routers and DNS, storage, multi-tenancy, etcd and day-two
operations, and fleet management with an incident playbook. References are at
the end of lesson 15.

`aks/` — **AKS: production operations**, nine lessons: managed-service
ownership, node pools and failure domains, Entra and workload identity, Azure
CNI and IP planning, ingress/egress/private DNS, scaling and cost, upgrades and
maintenance, CSI storage and tested recovery, observability and incident
playbooks. Each lesson includes a worked scenario, quiz and primary sources.
Lesson 4 includes an interactive flat-versus-overlay surge-IP calculator with
explicit assumptions. AKS Standard is the baseline; Automatic differences and
version-sensitive behavior are called out. Inspection examples do not provision
resources and require your own authorized environment.

EKS remains planned; there is no published EKS directory or lesson link.

Platform-specific material goes in a child directory with its own `lessons.js`
and its own progress key, so progress never bleeds between courses:

```text
Kubernetes/
  cni/                    const COURSE = { key: "kubernetes-cni", up: {...}, ... }
  aks/                     const COURSE = { key: "kubernetes-aks", up: {...}, ... }
    index.html
    lessons.js
    01-....html to 09-....html
  openshift/              const COURSE = { key: "kubernetes-openshift", up: {...}, ... }
  eks/                    Planned; not yet created
```

Child lesson pages reach the shared assets two levels up:

```html
<link rel="stylesheet" href="../../style.css">
<script src="lessons.js"></script>
<script src="../../course.js"></script>
```

Nothing in `course.js` assumes a depth, so no engine change is needed. Add a
card for each child course to `Kubernetes/index.html` as it is written.

The split is by portability, not by convenience: if a concept works on any
conformant cluster it belongs in the generic course, and if it names a provider
API it belongs in a child. Lesson 7 is the worked example — Karpenter's NodePool
and NodeClaim are taught here, `EC2NodeClass` is left for `eks/`.

## Cross-course links

Lessons link to published material rather than re-teaching it:

| This course | Links to | Shared idea |
| --- | --- | --- |
| 1. Desired state | [Code analysis: call graphs](../CodeAnalysis/02-ast-call-graph.html) | Sweeping until nothing changes — convergence, bounded there and deliberately non-terminating here |
| 3. Requests and limits | [Observability: metrics](../Observability/02-metrics.html), [querying](../Observability/05-querying.html) | You cannot set a request honestly without percentiles; averages are what cause OOMKills |
| 5. HPA | [Observability: metrics](../Observability/02-metrics.html), [SLOs](../Observability/09-slos.html) | Choosing a scaling signal is choosing an SLI — mind the denominator |
| 6. KEDA | [Observability: SLOs](../Observability/09-slos.html) | Queue depth is a level, consumer lag is a rate; the distinction decides which to scale on |
| 8. Operators | [Code analysis: what counts as IO](../CodeAnalysis/01-what-is-io.html) | A reconcile loop is IO by definition, which is exactly why it must be safe to re-run |

## Sources

Every quoted claim is listed with its primary source on
[lesson 9](09-references.html). Principal sources:

- [Kubernetes documentation](https://kubernetes.io/docs/) — controllers, workloads, scheduling, resource management, QoS, HPA, feature gates, operator pattern
- [Kubernetes API reference](https://kubernetes.io/docs/reference/kubernetes-api/) — field-level defaults such as `maxSurge` and `maxUnavailable`
- [KEDA documentation](https://keda.sh/docs/latest/) — ScaledObject semantics and defaults
- [Karpenter documentation](https://karpenter.sh/docs/) — provisioning, consolidation, disruption

Written against documentation current in November 2026. Defaults move between
releases — lesson 9 says how to check yours with `kubectl explain`.
