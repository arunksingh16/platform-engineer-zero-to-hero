#!/usr/bin/env python3
"""Prove cross-node NetworkPolicy denial and selective recovery on the Cilium lab."""

import argparse
import json
from pathlib import Path
import subprocess
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kubeconfig", required=True)
    parser.add_argument("--context", required=True, choices=["kind-pe-handbook-network"])
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    base = ["kubectl", "--kubeconfig", args.kubeconfig, "--context", args.context,
            "--request-timeout=20s"]

    def run(*command, stdin=None, check=True):
        result = subprocess.run(base + list(command), input=stdin, capture_output=True,
                                text=True, timeout=160)
        if check and result.returncode:
            raise AssertionError(f"{' '.join(command)}\n{result.stderr}")
        return result

    def obj(*command):
        return json.loads(run(*command, "-o", "json").stdout)

    def apply(name):
        run("apply", "-f", str(root / name))

    def eventually(description, probe):
        deadline = time.monotonic() + 60
        while time.monotonic() < deadline:
            if probe():
                print(f"PASS {description}", flush=True)
                return
            time.sleep(1)
        raise AssertionError(f"Timed out: {description}")

    if run("get", "namespace", "pe-lab", "--ignore-not-found", "-o", "name").stdout.strip():
        raise SystemExit("Refusing to overwrite preexisting pe-lab namespace")
    try:
        apply("namespace.yaml")
        apply("workload.yaml")
        run("rollout", "status", "deployment/echo", "-n", "pe-lab", "--timeout=120s")
        pods = obj("get", "pods", "-n", "pe-lab", "-l", "app=echo")["items"]
        assert len(pods) == 2 and pods[0]["spec"]["nodeName"] != pods[1]["spec"]["nodeName"]
        source = pods[0]["metadata"]["name"]
        destination = pods[1]["status"]["podIP"]
        template = obj("get", "deployment", "echo", "-n", "pe-lab")["spec"]["template"]
        outsider = {"apiVersion": "v1", "kind": "Pod", "metadata": {
            "name": "outsider", "namespace": "pe-lab", "labels": {"team": "platform", "app": "outsider"}},
            "spec": template["spec"]}
        outsider["spec"].pop("topologySpreadConstraints", None)
        run("create", "-f", "-", stdin=json.dumps(outsider))
        run("wait", "-n", "pe-lab", "--for=condition=Ready", "pod/outsider", "--timeout=120s")
        outsider_ip = obj("get", "pod", "outsider", "-n", "pe-lab")["status"]["podIP"]

        def request(host):
            return run("exec", "-n", "pe-lab", source, "--", "wget", "-T", "2",
                       "-qO-", f"http://{host}:8080", check=False)

        def succeeds(host):
            result = request(host)
            return result.returncode == 0 and result.stdout.strip() == "healthy"

        def blocked(host):
            result = request(host)
            # A timeout demonstrates a blocked connection; an exec/API failure is
            # not accepted as proof of network isolation.
            return result.returncode != 0 and "timed out" in result.stderr.lower()

        service = "echo.pe-lab.svc.cluster.local"
        assert succeeds(destination) and succeeds(outsider_ip) and succeeds(service)
        print("PASS baseline cross-node Pod, outsider and DNS/Service connectivity", flush=True)
        apply("network-deny.yaml")
        eventually("default-deny blocks direct remote Pod traffic", lambda: blocked(destination))
        apply("network-allow.yaml")
        eventually("explicit allow restores cross-node HTTP", lambda: succeeds(destination))
        eventually("explicit allow restores DNS and Service HTTP", lambda: succeeds(service))
        eventually("unallowed outsider remains blocked", lambda: blocked(outsider_ip))
        run("delete", "-f", str(root / "network-allow.yaml"), "-f", str(root / "network-deny.yaml"))
        eventually("policy cleanup restores original outsider path", lambda: succeeds(outsider_ip))
    finally:
        run("delete", "namespace", "pe-lab", "--ignore-not-found", "--timeout=120s")


if __name__ == "__main__":
    main()
