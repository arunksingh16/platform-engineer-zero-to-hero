# Validation record

## Scope

This record distinguishes executable API/runtime checks from architectural drills.
Lab scenarios and capacity numbers are hypothetical, not production measurements.

## Environment

- Date: 12 November 2026
- Host: macOS arm64; Docker Engine 29.8.1
- Disposable cluster: kind 0.33.0, `kindest/node:v1.37.0`
- Topology: one control-plane container, two worker containers
- kubectl: v1.36.1 (within one minor of the server)
- Application fixture: `busybox:1.37.0`
- Resolved BusyBox repository digest on the tested arm64 node:
  `sha256:a7dbc319b1438115a207e11930dc4bb3e643dcb3ec0bdd694bb36cd8fad289ec`
- Base storage: kind's default local-path provisioner

## Passed checks

### Live Kubernetes integration

`verify_labs.py` passed all eleven groups on the environment above:

1. Server-side schema/admission validation of deployable fixtures.
2. Two-replica rollout and successful HTTP readiness.
3. Allowed Pod reads and denied Secret reads through impersonated requests.
4. CEL warning, denial, compliant acceptance and warning-mode recovery.
5. Non-root execution, read-only root, writable mounted directory, absent automatic
   token and explicit Pod Security Admission rejection.
6. API create, resourceVersion-changing update, read and delete.
7. PVC data survival across consumer replacement and checksum-verified toy restore.
8. Container OOMKilled while all nodes remained Ready.
9. Unschedulable selector, preserved available replicas and scheduling recovery.
10. Image-pull failure, preserved availability and verified rollout undo.
11. Deletion held by a finalizer and completed after releasing the specific
    no-external-assets training finalizer.

The first run exposed a test-fixture issue: privileged mode combined with
`allowPrivilegeEscalation: false` failed object validation before reaching the PSA
decision being tested. The probe now uses a schema-valid privileged context and
asserts a PodSecurity-specific rejection. The complete corrected run passed and
cleaned its namespace/admission objects. The base kind cluster was then removed.

### Cross-node network enforcement

`verify_network.py` passed on a second kind 0.33.0 / Kubernetes v1.37.0 cluster,
created with the default CNI disabled and Cilium Helm chart **1.20.4** installed.
Settings: Kubernetes IPAM, default kube-proxy retained, one operator replica for
the local lab. This is an enforcement exercise, not a production Cilium HA design.

- Baseline HTTP succeeded between replicas on different worker nodes, to a third
  outsider Pod, and through the DNS/Service path.
- Default-deny blocked a fresh direct cross-node HTTP connection with a timeout.
- Explicit allowances restored cross-node HTTP and DNS/Service HTTP.
- The unallowed outsider remained blocked after selective recovery.
- Removing the policies restored the original outsider connection.

The runner cleaned its namespace and policies. Both disposable clusters are
removed after validation; no production cluster was used.

### Content and browser integration

- Twelve module files and 36 valid quiz questions; ordered lesson IDs and isolated
  course key; HTML nesting/IDs, local file/fragment links and JavaScript syntax.
- Headless installed Google Chrome driven with Playwright 1.64.1: all 36 correct
  quiz answers, lesson navigation, persisted completion after reload, 12/12 course
  summary and isolation from the core course's stored progress.
- No page JavaScript errors; 390px mobile storage lesson has no horizontal document
  overflow. Desktop course hub and mobile lesson screenshots inspected.
- Core QoS widget: omitted requests default from limits, an over-limit request is
  rejected, and the BestEffort preset still works.
- All 47 primary-source URLs returned HTTP 200 after correcting the
  node-autoscaling link; link health is not a substitute for source review.

## Reproduction

```sh
python3 Kubernetes/production/verify_content.py
python3 Kubernetes/production/labs/verify_labs.py \
  --kubeconfig /path/to/isolated/pe-handbook.kubeconfig \
  --context kind-pe-handbook
python3 Kubernetes/production/labs/verify_network.py \
  --kubeconfig /path/to/isolated/pe-handbook-network.kubeconfig \
  --context kind-pe-handbook-network
```

The integration runner requires a fresh lab namespace and owns only its named lab
objects. It uses server-side validation and expected acceptance/rejection checks,
then cleans up. See the lab guide for setup and the separate networking exercise.

## Boundaries of evidence

- A local-path PVC and toy file restore do not validate CSI attachment, fencing,
  VolumeSnapshots, database consistency or regional recovery.
- Cloud workload federation, KMS rotation and emergency access require a provider
  sandbox and explicit identity/resource configuration.
- etcd disaster recovery, real zone loss, NUMA tuning and fleet upgrades require
  their documented isolated environments. They are structured drills here, not
  claimed completed experiments.
- Source references were reviewed for the concepts used; a 1.30 API floor is not
  a claim that every Kubernetes/distribution release was tested.
- Browser progress records quiz completion, not proof of operational competence.
