# Kubernetes incident record

- Incident ID / commander / technical owner / communications owner:
- Start time (UTC), detection time, last known good, recovery verified:
- User journey and affected cells/clusters/tenants:
- Current impact, data-integrity risk, next update time:
- Relevant changes (Git revision, image digest, platform versions):

## Evidence and decisions

| Time | Hypothesis | Evidence / correlation ID | Discriminating check | Decision / owner |
| --- | --- | --- | --- | --- |
| | | | | |

Use metadata and scoped logs; exclude credentials and unnecessary personal data.

## Mitigation

- Preconditions and available recovery capacity:
- Exact change and owner:
- Stop condition and rollback / forward-recovery path:
- Temporary policy/access/GitOps drift and expiry:
- External assets / writer-fencing evidence, if relevant:

## Recovery verification

- Previously failing operation now succeeds (evidence):
- Intentionally denied operation remains denied (if relevant):
- SLI and observation window, including downstream impact:
- New workload provisioning/replacement verified:
- Latest recovered commit / measured RPO / measured RTO, if relevant:
- Desired state reconciled and temporary changes removed:

## Learning

- Trigger, enabling conditions and amplification:
- Detection/diagnosis delay and missing signal:
- Which barrier should have bounded the impact?
- Follow-up: owner, due date, observable acceptance criterion:
