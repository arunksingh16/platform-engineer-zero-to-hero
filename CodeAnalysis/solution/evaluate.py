"""Score the detector against hand-made labels, the way lesson 4 says to.

Reports both ways of resolving UNKNOWN, and always prints the majority-class
baseline next to the accuracy -- an accuracy figure on its own cannot be checked.

    python3 detect_io.py sample_project/
    python3 evaluate.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def metrics(tp: int, fp: int, fn: int, tn: int) -> dict[str, float]:
    total = tp + fp + fn + tn
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "accuracy": (tp + tn) / total if total else 0.0,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


def score(predictions: dict[str, str], labels: dict[str, bool], unknown_is_io: bool):
    tp = fp = fn = tn = 0
    for name, truth in labels.items():
        verdict = predictions.get(name)
        if verdict is None:
            print(f"no prediction for {name!r}", file=sys.stderr)
            continue
        predicted = verdict == "IO" or (verdict == "UNKNOWN" and unknown_is_io)
        if predicted and truth:
            tp += 1
        elif predicted and not truth:
            fp += 1
        elif not predicted and truth:
            fn += 1
        else:
            tn += 1
    return (tp, fp, fn, tn), metrics(tp, fp, fn, tn)


def main() -> int:
    here = Path(__file__).parent
    pred_file = here / "predictions.json"
    if not pred_file.exists():
        print("run detect_io.py first to produce predictions.json", file=sys.stderr)
        return 1

    predictions = json.loads(pred_file.read_text())
    labels = {k: v for k, v in json.loads((here / "labels.json").read_text()).items()
              if not k.startswith("_")}

    positives = sum(labels.values())
    n = len(labels)
    baseline = max(positives, n - positives) / n
    baseline_label = "always answer no IO" if positives <= n / 2 else "always answer IO"

    print(f"{n} labelled functions, {positives} of them IO "
          f"({positives / n:.0%} positive)\n")

    rows = []
    for unknown_is_io in (True, False):
        (tp, fp, fn, tn), m = score(predictions, labels, unknown_is_io)
        rows.append((
            "UNKNOWN -> IO" if unknown_is_io else "UNKNOWN -> no IO",
            tp, fp, fn, tn, m,
        ))

    head = f"{'policy':<18}{'TP':>4}{'FP':>4}{'FN':>4}{'TN':>4}" \
           f"{'accuracy':>10}{'precision':>11}{'recall':>8}{'F1':>7}"
    print(head)
    print("-" * len(head))
    for label, tp, fp, fn, tn, m in rows:
        print(f"{label:<18}{tp:>4}{fp:>4}{fn:>4}{tn:>4}"
              f"{m['accuracy']:>9.0%}{m['precision']:>11.2f}"
              f"{m['recall']:>8.2f}{m['f1']:>7.2f}")

    print(f"\nbaseline ({baseline_label}): {baseline:.0%} accuracy, 0.00 recall")
    best = max(rows, key=lambda r: r[5]["accuracy"])
    gain = (best[5]["accuracy"] - baseline) * 100
    print(f"best accuracy beats the baseline by {gain:.0f} points -- "
          f"but read the recall column to see which policy you actually want.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
