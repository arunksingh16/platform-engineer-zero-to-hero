# IO detector — worked solution

The code behind [lesson 5](../05-the-problem.html). Standard library only, no
dependencies, Python 3.9+ (it uses `ast.unparse`).

## Run it

```bash
cd CodeAnalysis/solution
python3 detect_io.py sample_project/   # writes predictions.json
python3 evaluate.py                    # scores it against labels.json
python3 test_detect_io.py              # 11 assertions, no framework
```

## What each file does

| File | Purpose |
| --- | --- |
| `detect_io.py` | Parse, find calls, build the call graph, propagate to a fixed point |
| `evaluate.py` | Confusion matrix, precision, recall, F1, and the majority-class baseline |
| `test_detect_io.py` | One assertion per claim the lessons make |
| `sample_project/` | 20 functions chosen to include the hard cases |
| `labels.json` | Ground truth, labelled by hand |

## Output on the sample project

```
20 functions: 7 IO, 10 no IO, 3 unknown

policy              TP  FP  FN  TN  accuracy  precision  recall     F1
----------------------------------------------------------------------
UNKNOWN -> IO        9   1   0  10      95%       0.90    1.00   0.95
UNKNOWN -> no IO     7   0   2  11      90%       1.00    0.78   0.88

baseline (always answer no IO): 55% accuracy, 0.00 recall
```

Resolving unknowns as IO catches every IO function (recall 1.00) at the cost of
one false alarm. Resolving them the other way never raises a false alarm and
misses two. That is lesson 3's trade with lesson 4's numbers on it.

## Honest limits

- **The sample's 45% base rate is not realistic.** It is a demo file built to be
  full of hard cases. A real codebase is far more imbalanced, which is precisely
  what makes an accuracy figure misleading — so do not read 95% here as a result
  you would get on your own code.
- **Name-based resolution, not type inference.** `PURE_KNOWN` clears calls by
  name, so a class of your own with a `.get()` that makes a network request is
  wrongly cleared. Fixing that means resolving receiver types: a much bigger tool.
- **One call graph per run, matched by bare name.** Two different modules with a
  `render()` each are treated as the same node.
- **`IO_PRIMITIVES` is a policy, not a fact.** It is meant to be edited. Note
  what is deliberately left out: `os.path.join` and `json.dumps` are pure string
  work despite their modules.
- **Nothing here reads a function's docstring or body semantics.** Everything is
  structural, which is why it is predictable and explainable.
