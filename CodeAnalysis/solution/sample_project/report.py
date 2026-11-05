"""Report building. Contains the awkward cases from lesson 3 on purpose."""

import importlib
import logging

from util import join_path, load_config, now_stamp, pct, slugify, to_json


def header(title):
    return "# " + slugify(title)


def shout(text):
    return text.upper()


def total(rows):
    return sum(len(r) for r in rows)


def summarise(rows):
    return pct(total(rows), 100)


def render(rows):
    return header("report") + to_json(rows)


def write_report(path, rows):
    with open(join_path(path, "report.md"), "w") as out:
        out.write(render(rows))


def banner(path):
    return header(load_config(path)) + str(now_stamp())


def emit(stream, rows):
    # duck typing: a file, a socket and an io.StringIO all have .write
    stream.write(render(rows))


def dispatch(kind, rows):
    # the callee is a value, chosen at runtime
    return HANDLERS[kind](rows)


def run_plugin(name, rows):
    return importlib.import_module(name).run(rows)


def log_done():
    logging.info("done")


HANDLERS = {"json": to_json, "render": render, "shout": shout}
