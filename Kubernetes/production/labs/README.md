# Production engineering labs

Run commands from this directory. These exercises use the dedicated namespace
`pe-lab` and cluster-scoped admission objects named `pe-lab-team`. Use a disposable
cluster with no existing objects under those names. The tests deliberately break
workloads and temporarily deny requests in that namespace.

## Environment and repeatability

- Linux Kubernetes nodes, Kubernetes **1.30+ API feature floor**, a currently
  supported release, and kubectl within its supported version skew.
- Namespace administration; cluster administration for namespace labels and CEL
  policy creation; impersonation rights for the RBAC test.
- A working registry path for `busybox:1.37.0`. Record the resolved image ID:
  tags are not a production immutable-image policy.
- A default dynamic StorageClass for the persistence exercise. CSI snapshot,
  zone-failure, cloud federation, host performance and etcd recovery drills have
  additional environment-specific requirements described below.
- Enforcing CNI for the NetworkPolicy test. Default kind networking does not
  establish that prerequisite.

Create an isolated kubeconfig rather than switching your normal context:

```sh
export KUBECONFIG="$PWD/pe-handbook.kubeconfig"
kind create cluster --name pe-handbook --config kind.yaml --kubeconfig "$KUBECONFIG"
export CTX=kind-pe-handbook
kubectl --context "$CTX" version
kubectl --context "$CTX" apply -f namespace.yaml
kubectl --context "$CTX" apply -f workload.yaml
kubectl --context "$CTX" rollout status -n pe-lab deployment/echo --timeout=120s
kubectl --context "$CTX" get pods -n pe-lab \
  -o custom-columns=NAME:.metadata.name,IMAGE:.status.containerStatuses[*].imageID
```

Choose a kind release and node image supported together; the validation record
names the versions actually executed. The sample kind configuration has one
control-plane node and two workers. It models host placement, not independent
physical zones. Do not infer production HA from three containers on one laptop.

For automated integration checks on a **fresh** lab namespace, run:

```sh
python3 verify_labs.py --kubeconfig "$KUBECONFIG" --context "$CTX"
```

The runner owns its namespace and admission fixtures, checks expected failures as
well as successes, and cleans its objects on exit. It refuses a preexisting
namespace or admission fixture. Delete the manually created namespace first if
you choose the automated path. Network enforcement and provider-specific drills
remain separate; see [validation status](../VALIDATION.md).

## Fleet

**Purpose:** identify shared dependencies and test the zone-capacity arithmetic.

```sh
kubectl --context "$CTX" get nodes -L topology.kubernetes.io/zone,kubernetes.io/hostname
kubectl --context "$CTX" get deployments,daemonsets -n kube-system
kubectl --context "$CTX" get storageclass
```

Build a table with rows for API, DNS, registry, identity, storage, Git and telemetry;
columns are existing requests, new Pods, recovery access, owner and failure signal.
Assume three equal zones at 60% utilization and a safe ceiling of 70%. Calculate
post-zone-loss load (90%) and admissible normal utilization (46.7%).

**Pass:** distinguish the modeled failure from what this local environment can
prove; identify a recovery dependency shared by otherwise separate cells.
**Cleanup:** none beyond the common lab resources.

## Control plane

**Purpose:** observe create, read, watch/update and delete without a load storm.

```sh
kubectl --context "$CTX" get --raw '/readyz?verbose'
kubectl --context "$CTX" create configmap write-probe -n pe-lab --from-literal=revision=one
kubectl --context "$CTX" get configmap write-probe -n pe-lab -w
```

In a second terminal using the same kubeconfig and context:

```sh
kubectl --context "$CTX" patch configmap write-probe -n pe-lab \
  --type=merge -p '{"data":{"revision":"two"}}'
kubectl --context "$CTX" get configmap write-probe -n pe-lab -o yaml
kubectl --context "$CTX" delete configmap write-probe -n pe-lab
```

Stop the watch with Ctrl-C. Record timestamps, resourceVersion changes and the
observed update/deletion. This probes the write path, not production throughput.

**Extended restore drill:** on a separate self-managed cluster or provider recovery
environment, create a known object and application data marker, take an authenticated
snapshot and retain compatible topology/PKI/encryption material. Follow the exact
distribution restore procedure, including revision/cache handling. Fence the old
control plane, restore to the isolated destination and verify object reads,
create/watch/delete, Secret decryption and application data. Record incident-start,
API-ready and application-ready timestamps independently. Never use the original
cluster as a competing writer during recovery.

**Pass:** prove restored markers and controller convergence; a snapshot checksum
alone is insufficient. **Cleanup:** delete the isolated recovery environment using
its provisioner's procedure; retain only the intended evidence bundle.

## IAM

```sh
kubectl --context "$CTX" apply -f rbac.yaml
kubectl --context "$CTX" auth can-i list pods -n pe-lab \
  --as=system:serviceaccount:pe-lab:observer
kubectl --context "$CTX" auth can-i get secrets -n pe-lab \
  --as=system:serviceaccount:pe-lab:observer
kubectl --context "$CTX" get pods -n pe-lab \
  --as=system:serviceaccount:pe-lab:observer
kubectl --context "$CTX" get secrets -n pe-lab \
  --as=system:serviceaccount:pe-lab:observer
```

**Expected:** yes, no, successful list, Forbidden. The two denials are intentional
and return nonzero. This exercises authorization and actual impersonated requests,
not real ServiceAccount token authentication. Review any unexpected broader grant.

**Federation extension:** in a cloud sandbox, follow the linked provider identity
lesson to grant one ServiceAccount one resource action. Verify the allowed action
and a denied out-of-scope action. Change the trusted namespace/subject, observe the
exchange error, restore the exact trust and verify a renewed token works. Record
error/request IDs and identity metadata, never the raw credential. Remove sandbox
trust and resource roles at cleanup.

**Cleanup:** `kubectl --context "$CTX" delete -f rbac.yaml`.

## Policy

```sh
kubectl --context "$CTX" apply -f policy.yaml
kubectl --context "$CTX" create --dry-run=server -f policy-probe.yaml
kubectl --context "$CTX" patch validatingadmissionpolicybinding pe-lab-team \
  --type=merge -p '{"spec":{"validationActions":["Deny"]}}'
kubectl --context "$CTX" create --dry-run=server -f policy-probe.yaml
```

Allow policy propagation before evaluating a result. **Expected:** the first
probe succeeds with a warning; the second fails with `pe-lab Pods require a
non-empty team label`. Confirm the cause, not just a nonzero exit code.

Create an allowed probe without editing the tracked fixture:

```sh
kubectl --context "$CTX" label --local -f policy-probe.yaml team=platform -o yaml \
  | kubectl --context "$CTX" create --dry-run=server -f -
kubectl --context "$CTX" patch validatingadmissionpolicybinding pe-lab-team \
  --type=merge -p '{"spec":{"validationActions":["Warn","Audit"]}}'
kubectl --context "$CTX" create --dry-run=server -f policy-probe.yaml
```

**Pass:** allowed and denied paths differ for the intended reason, and recovery
restores the warning-only behavior. No audit backend is installed by this fixture.
**Cleanup:** `kubectl --context "$CTX" delete -f policy.yaml`.

## Security

```sh
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- id
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- touch /should-fail
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- touch /work/should-work
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- \
  sh -c 'test ! -e /var/run/secrets/kubernetes.io/serviceaccount/token'
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- wget -qO- http://127.0.0.1:8080
```

Expected: UID 1000, failed root write, successful designated-volume write, token
absent, `healthy` response. Test PSA separately from the CEL team-label rule:

```sh
kubectl --context "$CTX" run privileged-probe -n pe-lab \
  --image=busybox:1.37.0 --labels=team=platform --restart=Never --dry-run=server \
  --overrides='{"spec":{"containers":[{"name":"privileged-probe","image":"busybox:1.37.0","securityContext":{"privileged":true}}]}}'
```

**Pass:** rejection explicitly names PodSecurity restrictions. **Cleanup:**
remove `/work/should-work` or delete the common Deployment. Dry-run creates no Pod.

## Storage

Prerequisite: a default StorageClass that can provide a writable filesystem to the
specified non-root UID/fsGroup. Inspect it before applying; default kind storage is
node-local and does **not** demonstrate remote CSI attach or zone recovery.

```sh
kubectl --context "$CTX" get storageclass
kubectl --context "$CTX" apply -f storage.yaml
kubectl --context "$CTX" wait -n pe-lab --for=condition=Ready pod/marker --timeout=120s
kubectl --context "$CTX" exec -n pe-lab marker -- sh -c 'printf "commit-0001\n" > /data/marker'
kubectl --context "$CTX" exec -n pe-lab marker -- sha256sum /data/marker
kubectl --context "$CTX" exec -n pe-lab marker -- cat /data/marker > marker.backup
kubectl --context "$CTX" delete pod marker -n pe-lab --wait=true
kubectl --context "$CTX" apply -f storage.yaml
kubectl --context "$CTX" wait -n pe-lab --for=condition=Ready pod/marker --timeout=120s
kubectl --context "$CTX" exec -n pe-lab marker -- cat /data/marker
kubectl --context "$CTX" exec -n pe-lab marker -- sh -c 'printf "corrupt\n" > /data/marker'
kubectl --context "$CTX" exec -i -n pe-lab marker -- sh -c 'cat > /data/marker' < marker.backup
kubectl --context "$CTX" exec -n pe-lab marker -- sha256sum /data/marker
```

**Pass:** data survives consumer replacement and the restored checksum equals the
original. The host file backup models an independent copy, not database consistency.

**CSI/database extension:** use a driver with snapshot support, its installed
snapshot CRDs/controller and a chosen VolumeSnapshotClass. Write timestamped
commits through the database API; take an application-coordinated backup and logs;
restore into a new PVC/database; compare the latest recovered commit, checksums and
application transaction. Measure RPO/RTO. For a node-loss drill, prove fencing before
forced detach and use the distribution's supported procedure. Stop if writer state
is uncertain. Do not test this by stripping VolumeAttachment finalizers.

**Cleanup:** `kubectl --context "$CTX" delete -f storage.yaml`, then remove the
local `marker.backup`. Check the PV reclaim policy and backend inventory; Retain
volumes and snapshots need explicit cleanup through the storage system.

## Network

### Optional reproducible Cilium environment

This is a separate disposable cluster; it does not migrate the base lab's CNI.
The pinned versions below are the validation target, not an automatic upgrade
recommendation for an existing fleet. With kind 0.33.0 and Helm installed:

```sh
export NETWORK_KUBECONFIG="$PWD/pe-handbook-network.kubeconfig"
kind create cluster --name pe-handbook-network --config kind-network.yaml \
  --image kindest/node:v1.37.0 --kubeconfig "$NETWORK_KUBECONFIG"
helm install cilium cilium --repo https://helm.cilium.io --version 1.20.4 \
  --kubeconfig "$NETWORK_KUBECONFIG" --kube-context kind-pe-handbook-network \
  --namespace kube-system --set ipam.mode=kubernetes \
  --set image.pullPolicy=IfNotPresent --set operator.replicas=1 --wait --timeout 5m
kubectl --kubeconfig "$NETWORK_KUBECONFIG" --context kind-pe-handbook-network \
  wait --for=condition=Ready nodes --all --timeout=120s
python3 verify_network.py --kubeconfig "$NETWORK_KUBECONFIG" --context kind-pe-handbook-network
kind delete cluster --name pe-handbook-network
```

Keep the default kube-proxy; this exercise tests standard NetworkPolicy, not
kube-proxy replacement. One operator replica is a local-lab choice. The runner
requires a fresh namespace, verifies replicas on different nodes, tests an
unallowed third Pod, and cleans up. For manual commands below, set KUBECONFIG/CTX
to your enforcing-CNI cluster and create the common namespace/workload first.
See [Cilium's kind installation guide](https://docs.cilium.io/en/stable/installation/kind/).

Prerequisite: a CNI that enforces NetworkPolicy. Confirm a successful baseline:

```sh
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- \
  wget -T 3 -qO- http://echo.pe-lab.svc.cluster.local:8080
kubectl --context "$CTX" apply -f network-deny.yaml
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- \
  wget -T 3 -qO- http://echo.pe-lab.svc.cluster.local:8080
```

After dataplane propagation, the second request must fail. Test fresh connections
to a **remote-node Pod IP** as well: obtain placement with `get pods -o wide` and
invoke wget from the other replica. This avoids mistaking a local exception or a
DNS-only failure for full cross-node isolation.

```sh
kubectl --context "$CTX" apply -f network-allow.yaml
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- \
  wget -T 3 -qO- http://echo.pe-lab.svc.cluster.local:8080
```

Expected: allowed DNS and HTTP work again. Verify another unallowed destination
still fails; don't assume restoring one allowed path proves isolation. The fixture
allows conventional CoreDNS labels, not every node-local DNS architecture.

**Pass:** baseline success, isolated failure, selective recovery and retained
denial on the actual dataplane. **Cleanup:**

```sh
kubectl --context "$CTX" delete -f network-allow.yaml -f network-deny.yaml
```

## Nodes

```sh
kubectl --context "$CTX" apply -f oom.yaml
kubectl --context "$CTX" get pod memory-boundary -n pe-lab -w
```

Stop the watch once the Pod terminates, then inspect:

```sh
kubectl --context "$CTX" get pod memory-boundary -n pe-lab -o yaml
kubectl --context "$CTX" get nodes
kubectl --context "$CTX" logs memory-boundary -n pe-lab
```

**Expected:** memory-limit failure while nodes remain Ready. The writer is the
container's main process; inspect its actual termination reason and logs rather
than assuming every exit 137 is OOMKilled.
If the process instead hits a volume/filesystem limit, record that distinction and
do not label it an OOM pass.

**Extended performance drill:** in a dedicated node pool, replay representative
traffic with unchanged application concurrency. Compare CPU limits, throttled
periods, throughput and p99 latency; change one variable. NUMA/CPU-manager changes
require supported node lifecycle and real hardware, not a laptop approximation.

**Cleanup:** `kubectl --context "$CTX" delete -f oom.yaml`.

## Capacity

```sh
kubectl --context "$CTX" patch deployment echo -n pe-lab --type=merge \
  -p '{"spec":{"template":{"spec":{"nodeSelector":{"pe-lab/nonexistent":"true"}}}}}'
kubectl --context "$CTX" get pods -n pe-lab -l app=echo -o wide
kubectl --context "$CTX" get events -n pe-lab --sort-by=.metadata.creationTimestamp
kubectl --context "$CTX" get pdb echo -n pe-lab
```

**Expected:** new Pod Pending with a node selector/affinity failure, while old
replicas remain available under the rollout strategy. Inspect the Pending Pod with
`describe` to prove the reason; the PDB does not control Deployment rolling updates.

```sh
kubectl --context "$CTX" patch deployment echo -n pe-lab --type=merge \
  -p '{"spec":{"template":{"spec":{"nodeSelector":null}}}}'
kubectl --context "$CTX" rollout status deployment/echo -n pe-lab --timeout=120s
```

**Pass/cleanup:** new replicas become Ready and the impossible selector is absent.

## Upgrades

Prerequisite: healthy common Deployment after the capacity exercise.

```sh
kubectl --context "$CTX" set image deployment/echo -n pe-lab http=busybox:pe-lab-does-not-exist
kubectl --context "$CTX" rollout status deployment/echo -n pe-lab --timeout=30s
kubectl --context "$CTX" get pods -n pe-lab -l app=echo
kubectl --context "$CTX" get endpointslices -n pe-lab -l kubernetes.io/service-name=echo
```

The rollout timeout is intentional. Confirm an image-pull reason and preserved
old endpoints. Then recover:

```sh
kubectl --context "$CTX" rollout undo deployment/echo -n pe-lab
kubectl --context "$CTX" rollout status deployment/echo -n pe-lab --timeout=120s
kubectl --context "$CTX" exec -n pe-lab deploy/echo -- wget -qO- http://127.0.0.1:8080
```

**Pass:** failed revision identified, restored image observed and HTTP service
verified. **Cleanup:** recovery returns the common Deployment to a healthy state.

**Target-version extension:** create a second kind cluster with a supported target
image and its own kubeconfig, validate fixtures using server dry-run there, then run
the integration checks. Build a component/CRD matrix from lesson 10. This is a
compatibility rehearsal; it does not model a managed-service in-place upgrade or
prove downgrade support. Delete only that second cluster at cleanup.

## Incidents

Use either the capacity or failed-image scenario above. Start an incident record
before examining the injected change. Record impact, last-known-good time, two
hypotheses, discriminating evidence, mitigation owner, stop condition and the
successful end-to-end recovery probe. Compute the recovery duration from your own
timestamps; do not copy an example as a measured result.

**Pass:** the record explains why the fix addresses the observed boundary and why
the service is recovered. **Cleanup:** follow the selected scenario's recovery and
remove temporary evidence containing private data.

## Operators

This fake finalizer has no controller and no external asset. It is specifically a
deletion-mechanics exercise, not a production finalizer-removal recipe.

```sh
kubectl --context "$CTX" create configmap finalizer-probe -n pe-lab --from-literal=externalAsset=none
kubectl --context "$CTX" patch configmap finalizer-probe -n pe-lab --type=merge \
  -p '{"metadata":{"finalizers":["training.example.com/no-external-assets"]}}'
kubectl --context "$CTX" delete configmap finalizer-probe -n pe-lab --wait=false
kubectl --context "$CTX" get configmap finalizer-probe -n pe-lab -o yaml
```

**Expected:** deletionTimestamp is set, but the object remains. Having verified this
fixture owns no external data, remove only its training finalizer:

```sh
kubectl --context "$CTX" patch configmap finalizer-probe -n pe-lab --type=json \
  -p='[{"op":"test","path":"/metadata/finalizers/0","value":"training.example.com/no-external-assets"},{"op":"remove","path":"/metadata/finalizers/0"}]'
kubectl --context "$CTX" get configmap finalizer-probe -n pe-lab
```

The final get should return NotFound. For each crash point below, write the durable
evidence and correct retry decision: before finalizer write; after finalizer but
before external create; after external acceptance but before status; during status
conflict; during uncertain external deletion. Use a stable operation identity and
honor the deletion/retention contract. A real operator needs fault-injection tests
against its actual external API or a faithful controllable simulator.

**Pass:** no assumed transaction between Kubernetes status and external state.
**Cleanup:** the fixture is already deleted.

## Final cleanup

```sh
kubectl --context "$CTX" delete -f policy.yaml --ignore-not-found
kubectl --context "$CTX" delete namespace pe-lab --wait=true
kind delete cluster --name pe-handbook
```

Remove your isolated kubeconfig and toy backup when no longer needed. Do not force
namespace finalization to hide leaked storage or finalizer obligations.
