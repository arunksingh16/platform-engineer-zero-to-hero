"""Decide which functions in a Python codebase perform IO.

Standard library only. Three verdicts, never two: IO, NO_IO, UNKNOWN.
See lesson 3 for why the third one has to exist.

    python3 detect_io.py sample_project/
"""

from __future__ import annotations

import ast
import json
import sys
from pathlib import Path

IO = "IO"
NO_IO = "NO_IO"
UNKNOWN = "UNKNOWN"

# Calls that are IO by definition. This list is the part you are meant to edit
# for your own codebase -- it is a policy decision, not a fact about Python.
# Note what is deliberately absent: os.path.join and json.dumps are pure string
# work, so they do not belong here.
IO_PRIMITIVES = {
    "open", "print", "input",
    "os.open", "os.read", "os.write", "os.remove", "os.rename", "os.mkdir",
    "os.listdir", "os.getenv", "os.system", "os.urandom", "os.getpid",
    "io.open",
    "socket.socket", "socket.create_connection",
    "time.time", "time.sleep", "time.monotonic",
    "datetime.datetime.now", "datetime.date.today",
    "random.random", "random.randint", "random.choice",
    "subprocess.run", "subprocess.Popen", "subprocess.check_output",
    "shutil.copyfile", "shutil.copy", "shutil.move", "shutil.rmtree",
    "requests.get", "requests.post", "requests.put", "requests.delete",
    "urllib.request.urlopen",
    "json.load", "json.dump",          # the file-object versions, not loads/dumps
    "pickle.load", "pickle.dump",
    "logging.info", "logging.warning", "logging.error", "logging.debug",
}

# Bare method names that mean IO on one type and nothing on another -- the
# duck-typing problem from lesson 3. We refuse to guess: these make a function
# UNKNOWN rather than IO.
AMBIGUOUS_METHODS = {"read", "write", "send", "recv", "execute", "commit", "close", "flush"}

# Calls that construct or fetch code at runtime. Nothing downstream is readable.
OPAQUE = {"eval", "exec", "compile", "getattr", "__import__", "importlib.import_module"}

# Known-pure calls. Without this, every len() and .strip() is an unresolved name
# and almost everything lands in UNKNOWN -- true, useless, and ignored by users.
# Note .append is here: it mutates, but the change never leaves the process, so
# it is not IO (lesson 1).
# ponytail: a name allowlist, not type inference. A class of your own that
# defines .get() doing a network call will be wrongly cleared. Upgrade path is
# resolving receiver types, which is a much bigger tool.
PURE_KNOWN = {
    "len", "str", "int", "float", "bool", "sum", "min", "max", "sorted", "abs",
    "round", "list", "dict", "set", "tuple", "enumerate", "zip", "range", "map",
    "filter", "any", "all", "isinstance", "repr", "format", "reversed",
    "strip", "lstrip", "rstrip", "lower", "upper", "title", "split", "rsplit",
    "splitlines", "join", "replace", "startswith", "endswith", "find", "count",
    "append", "extend", "insert", "pop", "items", "keys", "values", "get",
    "encode", "decode", "ljust", "rjust", "zfill", "copy", "index",
    "json.dumps", "json.loads",
    "os.path.join", "os.path.dirname", "os.path.basename", "os.path.splitext",
    "re.compile", "re.match", "re.search", "re.sub", "re.findall",
}


class Function:
    __slots__ = ("name", "file", "line", "calls", "direct_io", "opaque", "verdict")

    def __init__(self, name: str, file: str, line: int) -> None:
        self.name = name
        self.file = file
        self.line = line
        self.calls: set[str] = set()      # names that might be other functions here
        self.direct_io = False            # calls a known IO primitive
        self.opaque = False               # calls something unresolvable
        self.verdict = NO_IO


def _called_name(node: ast.Call) -> str:
    """Dotted source text of the callee, e.g. 'open' or 'requests.get'."""
    try:
        return ast.unparse(node.func)
    except Exception:          # pragma: no cover - unparse is total in practice
        return "<unparseable>"


def collect(path: Path) -> dict[str, Function]:
    """Parse every .py file under path and record one Function per def."""
    functions: dict[str, Function] = {}
    files = sorted(path.rglob("*.py")) if path.is_dir() else [path]

    for file in files:
        try:
            tree = ast.parse(file.read_text(encoding="utf-8"), filename=str(file))
        except SyntaxError as exc:
            print(f"skipping {file}: {exc}", file=sys.stderr)
            continue

        # qualify names with their enclosing class so Writer.write != Reader.write
        stack: list[str] = []

        def walk(node: ast.AST) -> None:
            for child in ast.iter_child_nodes(node):
                if isinstance(child, ast.ClassDef):
                    stack.append(child.name)
                    walk(child)
                    stack.pop()
                elif isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    qual = ".".join(stack + [child.name])
                    fn = Function(qual, str(file), child.lineno)
                    _scan_body(child, fn)
                    functions[qual] = fn
                    stack.append(child.name)
                    walk(child)          # nested defs
                    stack.pop()
                else:
                    walk(child)

        walk(tree)
    return functions


def _scan_body(node: ast.AST, fn: Function) -> None:
    """Record what this function calls, not counting nested function bodies."""
    for child in ast.iter_child_nodes(node):
        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            continue                      # handled as its own Function
        if isinstance(child, ast.Call):
            name = _called_name(child)
            tail = name.rsplit(".", 1)[-1]
            # order matters: requests.get is IO before .get is pure
            if name in IO_PRIMITIVES:
                fn.direct_io = True
            elif name in OPAQUE or tail in OPAQUE:
                fn.opaque = True
            elif name in PURE_KNOWN or tail in PURE_KNOWN:
                pass
            elif tail in AMBIGUOUS_METHODS:
                fn.opaque = True
            else:
                fn.calls.add(name)
                fn.calls.add(tail)        # tolerate module prefixes we cannot resolve
        _scan_body(child, fn)


def propagate(functions: dict[str, Function]) -> int:
    """Spread IO and UNKNOWN up the call graph. Returns the number of sweeps."""
    for fn in functions.values():
        fn.verdict = IO if fn.direct_io else (UNKNOWN if fn.opaque else NO_IO)

    known = set(functions)
    sweeps = 0
    while True:
        sweeps += 1
        changed = False
        for fn in functions.values():
            if fn.verdict == IO:
                continue
            callees = [functions[c] for c in fn.calls if c in known]
            # a call to something we have never seen defined is not resolvable
            unresolved = any(c not in known for c in fn.calls)
            if any(c.verdict == IO for c in callees):
                fn.verdict, changed = IO, True
            elif fn.verdict == NO_IO and (unresolved or any(c.verdict == UNKNOWN for c in callees)):
                fn.verdict, changed = UNKNOWN, True
        if not changed:
            return sweeps


def analyse(path: Path) -> dict[str, Function]:
    functions = collect(path)
    propagate(functions)
    return functions


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2
    target = Path(argv[1])
    functions = analyse(target)

    width = max((len(f.name) for f in functions.values()), default=10)
    for name in sorted(functions):
        fn = functions[name]
        print(f"{fn.verdict:<8} {name:<{width}}  {fn.file}:{fn.line}")

    counts = {v: sum(1 for f in functions.values() if f.verdict == v) for v in (IO, NO_IO, UNKNOWN)}
    print(f"\n{len(functions)} functions: "
          f"{counts[IO]} IO, {counts[NO_IO]} no IO, {counts[UNKNOWN]} unknown")

    out = Path("predictions.json")
    out.write_text(json.dumps({n: f.verdict for n, f in functions.items()}, indent=2))
    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
