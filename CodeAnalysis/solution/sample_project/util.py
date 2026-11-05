"""Helpers. Deliberately a mix of pure, IO and unresolvable functions."""

import json
import os.path
import time


def normalize(name):
    return name.strip().lower()


def slugify(title):
    return normalize(title).replace(" ", "-")


def pct(part, whole):
    return 0.0 if not whole else round(100 * part / whole, 1)


def join_path(base, leaf):
    # pure string work despite living in os -- must not be flagged
    return os.path.join(base, leaf)


def to_json(rows):
    # dumps, not dump: no file object involved
    return json.dumps(rows)


def read_text(path):
    with open(path) as handle:
        return handle.read()


def load_config(path):
    return to_json(read_text(path))


def now_stamp():
    return int(time.time())


def from_file(handle):
    # json.load takes a file object, so this is IO
    return json.load(handle)
