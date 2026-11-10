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

`openshift/` — **OpenShift for senior SREs**, fifteen lessons: operator-managed
architecture, installation and hosted control planes, the CVO and ClusterOperators,
Machine API and MachineConfig, updates, OLM, OAuth and RBAC, SCCs and hardening,
OVN-Kubernetes, routers and DNS, storage, multi-tenancy, etcd and day-two
operations, and fleet management with an incident playbook. References are at
the end of lesson 15.

Platform-specific material goes in a child directory with its own `lessons.js`
and its own progress key, so progress never bleeds between courses:

```text
Kubernetes/
  cni/                    const COURSE = { key: "kubernetes-cni", up: {...}, ... }
  eks/
    index.html
    lessons.js          const COURSE = { key: "k8s-eks", ... }
    01-....html
  aks/
  openshift/              const COURSE = { key: "kubernetes-openshift", up: {...}, ... }
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
