"""Self-check for the detector. No framework: python3 test_detect_io.py

Each case is one thing the lessons claim the detector does.
"""

import tempfile
from pathlib import Path

from detect_io import IO, NO_IO, UNKNOWN, analyse
from evaluate import metrics


def verdicts(source: str) -> dict[str, str]:
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "m.py"
        path.write_text(source)
        return {name: fn.verdict for name, fn in analyse(path).items()}


def test_pure_function_is_clean():
    v = verdicts("def area(w, h):\n    return w * h\n")
    assert v == {"area": NO_IO}, v


def test_direct_io_primitive():
    v = verdicts("def read(p):\n    return open(p).read()\n")
    assert v["read"] == IO, v


def test_io_propagates_to_callers():
    # lesson 2: greeting() has no IO primitive of its own
    v = verdicts(
        "def read_config(p):\n"
        "    return open(p).read()\n"
        "def greeting():\n"
        "    return 'Hello, ' + read_config('name.txt')\n"
        "def shout():\n"
        "    return greeting().upper()\n"
    )
    assert v["read_config"] == IO, v
    assert v["greeting"] == IO, v
    assert v["shout"] == IO, v          # two hops


def test_pure_lookalikes_are_not_io():
    # os.path.join and json.dumps live in IO-ish modules but are string work
    v = verdicts(
        "import json, os.path\n"
        "def p(a, b):\n"
        "    return json.dumps(os.path.join(a, b))\n"
    )
    assert v["p"] == NO_IO, v


def test_duck_typed_write_is_unknown_not_io():
    # lesson 3: a file, a socket and an io.StringIO all have .write
    v = verdicts("def emit(stream, text):\n    stream.write(text)\n")
    assert v["emit"] == UNKNOWN, v


def test_runtime_callee_is_unknown():
    v = verdicts("def go(kind, rows):\n    return HANDLERS[kind](rows)\n")
    assert v["go"] == UNKNOWN, v


def test_eval_is_unknown():
    v = verdicts("def go(src):\n    return eval(src)\n")
    assert v["go"] == UNKNOWN, v


def test_unknown_does_not_override_io():
    # if a function both does known IO and has an unresolved call, IO wins:
    # it is the stronger, more useful claim
    v = verdicts(
        "def both(p, stream):\n"
        "    stream.write(open(p).read())\n"
    )
    assert v["both"] == IO, v


def test_methods_are_qualified_by_class():
    v = verdicts(
        "class A:\n"
        "    def run(self):\n"
        "        return 1\n"
        "class B:\n"
        "    def run(self, p):\n"
        "        return open(p).read()\n"
    )
    assert v["A.run"] == NO_IO, v
    assert v["B.run"] == IO, v


def test_metrics_match_hand_calculation():
    # lesson 4's by-hand exercise: 500 functions, 100 do IO, 120 flagged, 80 right
    m = metrics(tp=80, fp=40, fn=20, tn=360)
    assert round(m["precision"], 2) == 0.67, m
    assert round(m["recall"], 2) == 0.80, m
    assert round(m["accuracy"], 2) == 0.88, m


def test_metrics_of_a_detector_that_never_fires():
    # the return-False baseline: high accuracy, zero on both honest metrics
    m = metrics(tp=0, fp=0, fn=12, tn=88)
    assert m["accuracy"] == 0.88, m
    assert m["precision"] == 0.0 and m["recall"] == 0.0, m


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for test in tests:
        test()
        print(f"ok   {test.__name__}")
    print(f"\n{len(tests)} passed")
