# Kubernetes coverage audit — 12 November 2026

## Scope and method

Inventoried headings across every existing Kubernetes lesson: core (9), CNI (5),
traffic (5), OpenShift (15) and AKS (9). Inspected core resource/operator lessons
and representative identity, tenancy and storage material in detail. This is a
coverage and targeted-correctness audit, not a claim that every provider statement
has been re-certified against every product version.

The existing introductory sequence remains useful. The structural gap was a
vendor-neutral production path: many operational concepts appeared only in a
provider lesson, with limited executable failure/recovery evidence.

## Coverage map

| Existing area | Existing coverage | Added production depth |
| --- | --- | --- |
| Core 01 desired state | Controllers and state | 01 fleet boundaries; 02 write-path saturation, etcd recovery |
| Core 02 Pods/controllers | Rollouts and controller chain | 09 disruption boundaries; 10 failed rollout and fleet gates |
| Core 03 resources | Requests, limits and QoS | 08 cgroup/host OOM, pressure, host budgets and NUMA |
| Core 04 scheduling | Filters, taints, affinity | 09 fragmentation, shape/topology constraints and reserve |
| Core 05 HPA | Formula, metrics and behavior | 09 request/replica loop interaction and downstream ceilings |
| Core 06 KEDA | Activation, HPA and queue scaling | 09 demand lead time, backlog age and overload policy |
| Core 07 node scaling | NodePool/NodeClaim, disruption | 09 failure capacity, provider quota and unit economics |
| Core 08 operators | CRD, reconciliation and status | 12 external idempotency, uncertain outcomes, finalizers and conflicts |
| Core 09 references | Primary sources | Per-module sources and version/test contract |
| CNI 01–05 | IPAM, packet paths, MTU, policy, implementations, eBPF | 07 discriminating probes, DNS/SNAT/conntrack capacity, migration gates |
| Traffic 01–05 | Services, ingress, Gateway API, Kong, mesh | 07 operational path isolation, draining and certificate lifecycle |
| OpenShift 01–07 | Platform architecture, install, CVO, nodes, MachineConfig, updates, OLM | 01 ownership/cells; 10 portable compatibility and release-wave model |
| OpenShift 08–09 | OAuth/RBAC, SCC and hardening | 03 identity boundaries; 04 portable policy; 05 security lifecycle |
| OpenShift 10–11 | OVN, routing and DNS | 07 vendor-neutral diagnosis and evidence matrix |
| OpenShift 12–13 | Storage and tenancy | 04 admission availability; 06 fencing and application recovery evidence |
| OpenShift 14–15 | etcd/day-two and fleet incidents | 02 restore contract; 11 SLI denominators and incident artifacts |
| AKS 01–02 | Ownership and node placement | 01 fleet blast radius; 09 failure headroom |
| AKS 03 | Entra and workload identity | 03 generic trust chain, indirect privilege and negative tests |
| AKS 04–05 | IP planning, traffic and private DNS | 07 cross-layer diagnosis and enforcement verification |
| AKS 06–07 | Scaling/cost and lifecycle | 09 controller coordination; 10 target-version validation |
| AKS 08–09 | Storage recovery and incidents | 06 portable recovery semantics; 11 structured response |

## Correctness changes made

1. Core resource lesson: distinguish cgroup OOM, host OOM and kubelet eviction;
   remove the inference that container-limit OOM requires host-wide pressure.
2. Replace universal QoS eviction ordering with resource/request/priority ranking;
   under-request Pods are not absolutely immune. Update prose, answers, quiz,
   widget and reference row together.
3. Correct the claim that omitting memory requests always produces BestEffort.
   The widget applies limit-to-request defaulting under its explicit no-LimitRange
   assumptions and rejects requests exceeding limits.
4. Explain allocatable versus machine capacity and kernel/runtime enforcement.
   Remove the claim that reclaiming any written memory requires killing a process.
5. Core operator lesson: explicitly enable the status subresource, scope controller
   credentials, and replace status-flag-only duplicate prevention with crash-aware
   external operation identity and reconciliation.
6. Core references: distinguish schema visibility from enabled feature gates and
   provider support. Course README: correct offset/consumer lag as a backlog
   quantity rather than universally a rate.

## Operational evidence added

The lab pack supplies complete namespaced workloads, RBAC, CEL policy and binding,
policy probe, NetworkPolicies, persistence consumer and bounded memory failure.
The integration runner exercises real API acceptance/denial, workload readiness,
runtime restrictions, persistence/restore, failed scheduling, rollback and finalizer
mechanics. A separate Cilium runner proves cross-node network denial, selective
allowances and recovery. Manual drills explicitly cover provider-dependent recovery,
federation, performance and target-version transitions.

See `VALIDATION.md` for executed versus environment-dependent checks. EKS remains
the repository's separately planned provider track; this addition publishes the
complete twelve-area vendor-neutral production curriculum.
