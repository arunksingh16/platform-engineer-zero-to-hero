#!/usr/bin/env python3
"""Run bounded integration exercises in a fresh, explicitly selected kind lab."""

import argparse
import json
from pathlib import Path
import subprocess
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kubeconfig", required=True)
    parser.add_argument("--context", required=True, choices=["kind-pe-handbook"])
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    base = ["kubectl", "--kubeconfig", args.kubeconfig, "--context", args.context,
            "--request-timeout=20s"]
    passed = []

    def run(*command, stdin=None, check=True):
        result = subprocess.run(base + list(command), input=stdin, text=True,
                                capture_output=True, timeout=160)
        if check and result.returncode:
            raise AssertionError(f"{' '.join(command)}\n{result.stdout}{result.stderr}")
        return result

    def obj(*command):
        return json.loads(run(*command, "-o", "json").stdout)

    def apply(name):
        run("apply", "-f", str(root / name))

    def record(name):
        passed.append(name)
        print(f"PASS {name}", flush=True)

    def eventually(description, probe, timeout=90):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if probe():
                return
            time.sleep(1)
        raise AssertionError(f"Timed out: {description}")

    def patch(resource, name, payload, namespace=True, kind="merge"):
        command = ["patch", resource, name, f"--type={kind}", "-p", json.dumps(payload)]
        if namespace:
            command += ["-n", "pe-lab"]
        run(*command)

    def http():
        return run("exec", "-n", "pe-lab", "deploy/echo", "--", "wget", "-T", "3",
                   "-qO-", "http://127.0.0.1:8080").stdout.strip()

    for resource, name in [("namespace", "pe-lab"),
                           ("validatingadmissionpolicy", "pe-lab-team"),
                           ("validatingadmissionpolicybinding", "pe-lab-team")]:
        result = run("get", resource, name, "--ignore-not-found", "-o", "name")
        if result.stdout.strip():
            raise SystemExit(f"Refusing to overwrite preexisting {resource}/{name}")

    version = obj("version")
    print(json.dumps({"client": version["clientVersion"]["gitVersion"],
                      "server": version["serverVersion"]["gitVersion"]}), flush=True)
    try:
        apply("namespace.yaml")
        for name in ["rbac.yaml", "workload.yaml", "policy.yaml", "storage.yaml",
                     "oom.yaml", "network-deny.yaml", "network-allow.yaml"]:
            run("apply", "--dry-run=server", "-f", str(root / name))
        record("server-side validation of all deployable fixtures")

        apply("workload.yaml")
        run("rollout", "status", "deployment/echo", "-n", "pe-lab", "--timeout=120s")
        assert http() == "healthy"
        record("two-replica workload rollout and HTTP readiness")

        apply("rbac.yaml")
        identity = "--as=system:serviceaccount:pe-lab:observer"
        assert run("auth", "can-i", "list", "pods", "-n", "pe-lab", identity).stdout.strip() == "yes"
        denied = run("auth", "can-i", "get", "secrets", "-n", "pe-lab", identity, check=False)
        assert denied.returncode and denied.stdout.strip() == "no"
        run("get", "pods", "-n", "pe-lab", identity)
        denied = run("get", "secrets", "-n", "pe-lab", identity, check=False)
        assert denied.returncode and "Forbidden" in denied.stderr
        record("RBAC allowed Pod read and denied Secret read")

        apply("policy.yaml")
        probe = str(root / "policy-probe.yaml")

        def warns():
            result = run("create", "--dry-run=server", "-f", probe, check=False)
            return result.returncode == 0 and "non-empty team label" in result.stderr

        eventually("CEL warning propagation", warns)
        patch("validatingadmissionpolicybinding", "pe-lab-team",
              {"spec": {"validationActions": ["Deny"]}}, namespace=False)

        def denies():
            result = run("create", "--dry-run=server", "-f", probe, check=False)
            return result.returncode != 0 and "non-empty team label" in result.stderr

        eventually("CEL deny propagation", denies)
        labeled = run("label", "--local", "-f", probe, "team=platform", "-o", "json").stdout
        run("create", "--dry-run=server", "-f", "-", stdin=labeled)
        patch("validatingadmissionpolicybinding", "pe-lab-team",
              {"spec": {"validationActions": ["Warn", "Audit"]}}, namespace=False)
        eventually("CEL recovery propagation", warns)
        record("CEL warn, deny, compliant acceptance and recovery")

        def execute(*command, check=True):
            return run("exec", "-n", "pe-lab", "deploy/echo", "--", *command, check=check)

        assert "uid=1000" in execute("id").stdout
        denied = execute("touch", "/should-fail", check=False)
        assert denied.returncode and "Read-only file system" in denied.stderr
        execute("touch", "/work/should-work")
        execute("sh", "-c", "test ! -e /var/run/secrets/kubernetes.io/serviceaccount/token")
        privileged = json.loads(labeled)
        privileged["spec"]["containers"][0]["securityContext"]["privileged"] = True
        privileged["spec"]["containers"][0]["securityContext"]["allowPrivilegeEscalation"] = True
        denied = run("create", "--dry-run=server", "-f", "-",
                     stdin=json.dumps(privileged), check=False)
        assert denied.returncode and "PodSecurity" in denied.stderr, denied.stdout + denied.stderr
        record("non-root, read-only root, writable volume, absent token and PSA rejection")

        run("create", "configmap", "write-probe", "-n", "pe-lab", "--from-literal=revision=one")
        before = obj("get", "configmap", "write-probe", "-n", "pe-lab")
        patch("configmap", "write-probe", {"data": {"revision": "two"}})
        after = obj("get", "configmap", "write-probe", "-n", "pe-lab")
        assert after["data"]["revision"] == "two"
        assert before["metadata"]["resourceVersion"] != after["metadata"]["resourceVersion"]
        run("delete", "configmap", "write-probe", "-n", "pe-lab")
        record("API create, versioned update, read and delete")

        apply("storage.yaml")
        run("wait", "-n", "pe-lab", "--for=condition=Ready", "pod/marker", "--timeout=120s")
        run("exec", "-n", "pe-lab", "marker", "--", "sh", "-c",
            "printf 'commit-0001\\n' > /data/marker")
        backup = run("exec", "-n", "pe-lab", "marker", "--", "cat", "/data/marker").stdout
        checksum = run("exec", "-n", "pe-lab", "marker", "--", "sha256sum", "/data/marker").stdout
        run("delete", "pod", "marker", "-n", "pe-lab", "--wait=true")
        apply("storage.yaml")
        run("wait", "-n", "pe-lab", "--for=condition=Ready", "pod/marker", "--timeout=120s")
        assert run("exec", "-n", "pe-lab", "marker", "--", "cat", "/data/marker").stdout == backup
        run("exec", "-n", "pe-lab", "marker", "--", "sh", "-c", "printf corrupt > /data/marker")
        run("exec", "-i", "-n", "pe-lab", "marker", "--", "sh", "-c",
            "cat > /data/marker", stdin=backup)
        assert run("exec", "-n", "pe-lab", "marker", "--", "sha256sum", "/data/marker").stdout == checksum
        record("PVC persistence across Pod replacement and checksum-verified file restore")

        apply("oom.yaml")

        def oom_finished():
            pod = obj("get", "pod", "memory-boundary", "-n", "pe-lab")
            return any(s.get("state", {}).get("terminated", {}).get("reason") == "OOMKilled"
                       for s in pod["status"].get("containerStatuses", []))

        eventually("bounded cgroup OOM", oom_finished)
        nodes = obj("get", "nodes")["items"]
        assert all(any(c["type"] == "Ready" and c["status"] == "True"
                       for c in node["status"]["conditions"]) for node in nodes)
        record("bounded cgroup OOM with all nodes remaining Ready")

        patch("deployment", "echo", {"spec": {"template": {"spec": {
            "nodeSelector": {"pe-lab/nonexistent": "true"}}}}})

        def scheduling_failed():
            pods = obj("get", "pods", "-n", "pe-lab", "-l", "app=echo")["items"]
            return any(c.get("reason") == "Unschedulable" and "affinity" in c.get("message", "").lower()
                       for pod in pods for c in pod["status"].get("conditions", []))

        eventually("explicit selector scheduling failure", scheduling_failed)
        deployment = obj("get", "deployment", "echo", "-n", "pe-lab")
        assert deployment["status"].get("availableReplicas", 0) >= 2
        patch("deployment", "echo", {"spec": {"template": {"spec": {"nodeSelector": None}}}})
        run("rollout", "status", "deployment/echo", "-n", "pe-lab", "--timeout=120s")
        record("impossible placement, preserved replicas and scheduling recovery")

        run("set", "image", "deployment/echo", "-n", "pe-lab", "http=busybox:pe-lab-does-not-exist")

        def image_failed():
            pods = obj("get", "pods", "-n", "pe-lab", "-l", "app=echo")["items"]
            return any(s.get("state", {}).get("waiting", {}).get("reason") in
                       ("ErrImagePull", "ImagePullBackOff")
                       for pod in pods for s in pod["status"].get("containerStatuses", []))

        eventually("image-pull failure", image_failed)
        deployment = obj("get", "deployment", "echo", "-n", "pe-lab")
        assert deployment["status"].get("availableReplicas", 0) >= 2
        run("rollout", "undo", "deployment/echo", "-n", "pe-lab")
        run("rollout", "status", "deployment/echo", "-n", "pe-lab", "--timeout=120s")
        assert http() == "healthy"
        record("failed-image rollout, retained availability and verified rollback")

        run("create", "configmap", "finalizer-probe", "-n", "pe-lab", "--from-literal=externalAsset=none")
        finalizer = "training.example.com/no-external-assets"
        patch("configmap", "finalizer-probe", {"metadata": {"finalizers": [finalizer]}})
        run("delete", "configmap", "finalizer-probe", "-n", "pe-lab", "--wait=false")
        blocked = obj("get", "configmap", "finalizer-probe", "-n", "pe-lab")
        assert blocked["metadata"]["deletionTimestamp"]
        patch("configmap", "finalizer-probe", [
            {"op": "test", "path": "/metadata/finalizers/0", "value": finalizer},
            {"op": "remove", "path": "/metadata/finalizers/0"}], kind="json")
        assert not run("get", "configmap", "finalizer-probe", "-n", "pe-lab",
                       "--ignore-not-found", "-o", "name").stdout.strip()
        record("finalizer blocks deletion until its specific training obligation is released")
        print(f"{len(passed)} integration groups passed; network enforcement and provider drills are separate.", flush=True)
    finally:
        # Only objects whose absence was verified before this run are owned here.
        run("delete", "-f", str(root / "policy.yaml"), "--ignore-not-found", check=False)
        # This lab-only finalizer has no external asset; release it if a test failed.
        run("patch", "configmap", "finalizer-probe", "-n", "pe-lab", "--type=merge",
            "-p", '{"metadata":{"finalizers":[]}}', check=False)
        cleanup = run("delete", "namespace", "pe-lab", "--ignore-not-found", "--timeout=120s", check=False)
        if cleanup.returncode:
            raise AssertionError(f"Lab cleanup failed: {cleanup.stderr}")


if __name__ == "__main__":
    main()
