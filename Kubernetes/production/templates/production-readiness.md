# Production Kubernetes design review

Record evidence links and explicit decisions, not just yes/no checkboxes.

| Area | Decision and evidence | Owner | Unresolved risk / due date |
| --- | --- | --- | --- |
| Service SLO and capacity unit | Eligible events, safe throughput and load-test revision | | |
| Failure domains | Cell/zone/region loss, shared dependencies and tested receiving capacity | | |
| Identity | Human/workload/node principals, indirect RBAC powers, allowed/denied tests | | |
| Policy | Enforcement scope, availability, exceptions, emergency repair test | | |
| Runtime and supply chain | Image digest/provenance, security context, host isolation | | |
| Secrets | Delivery, encryption, reload, revocation and recovery keys | | |
| Storage | Access/topology semantics, fencing, backup destination, measured RPO/RTO | | |
| Network | DNS, IP/SNAT budget, ingress/egress/policy tests and MTU | | |
| Nodes | Allocatable/reservations, runtime versions, pressure and locality needs | | |
| Scaling and cost | Lead time, reserve, field ownership, downstream caps and cost/unit | | |
| Lifecycle | Current/target compatibility matrix, canary gates, rollback boundaries | | |
| Observability | SLIs, burn alerts, evidence access and telemetry-loss detection | | |
| Operators | Idempotency, crash windows, external ownership, finalizer recovery | | |

## Release gate

- Representative canary cohort and test environment:
- Stop thresholds and owner authorized to pause the wave:
- Restore/failover evidence and date:
- Provider support constraints / escalation contact:
- Accepted residual risks, owner and review date:
- Next verification date or version-change trigger:
