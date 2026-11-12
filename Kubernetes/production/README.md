# Kubernetes: production engineering

Twelve vendor-neutral modules for engineers operating production fleets. Start at
`index.html`; `lessons.js` uses the isolated `kubernetes-production-progress` key
with the existing shared course engine and theme.

## Content contract

Each module includes a worked scenario, mechanism and trade-offs, inspection steps,
recovery/stop conditions, a lab or explicit environment-dependent drill, a worked
review question, three quiz questions and primary references. Scenarios and sizing
numbers are fictional, not claims about any company's internal systems.

The advanced track complements core Kubernetes, CNI, traffic, AKS and OpenShift.
It does not imply that a namespace lab models cloud IAM, independent zones,
production database correctness or a full fleet upgrade.

- [Coverage and corrections](AUDIT.md)
- [Lab guide](labs/README.md)
- [Validation evidence and limitations](VALIDATION.md): eleven live integration
  groups, cross-node Cilium deny/allow/recovery checks, and browser/quiz validation
- [Incident record](templates/incident-record.md)
- [Production design review](templates/production-readiness.md)

Serve from the repository root with `python3 -m http.server 8000`, then open
`http://localhost:8000/Kubernetes/production/`.

## Maintaining accuracy

The API feature floor is Kubernetes 1.30, not a supported-release recommendation.
Use currently supported platform versions. At a Kubernetes, etcd, CNI, CSI or
provider change, review affected primary references, run target-version schema
validation, execute applicable labs and update `VALIDATION.md`. Record exact
versions, resolved image IDs and measured results. Do not advance a validation
date merely because the source links still load.
