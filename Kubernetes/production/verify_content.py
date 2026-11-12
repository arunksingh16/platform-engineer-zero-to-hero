#!/usr/bin/env python3
"""Check production lesson structure, quizzes, local links and JavaScript syntax."""

from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.ids = set()
        self.stack = []
        self.errors = []
        self.feed(text)
        if self.stack:
            self.errors.append(f"unclosed elements: {self.stack}")

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input",
                       "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(tag)
        if "id" in attributes:
            if attributes["id"] in self.ids:
                self.errors.append(f"duplicate id: {attributes['id']}")
            self.ids.add(attributes["id"])
        for key in ("href", "src"):
            if key in attributes:
                self.links.append(attributes[key])

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f"unexpected closing element: {tag}")
        else:
            self.stack.pop()


def main():
    root = Path(__file__).resolve().parent
    repo = root.parent.parent
    pages = sorted(root.glob("*.html"))
    lessons = sorted(root.glob("[0-9][0-9]-*.html"))
    errors = []
    assert len(lessons) == 12
    course = subprocess.check_output([
        "node", "-e",
        "const vm=require('node:vm'),fs=require('node:fs');"
        "console.log(JSON.stringify(vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8')+';COURSE')))",
        str(root / "lessons.js")], text=True)
    course = json.loads(course)
    assert course["key"] == "kubernetes-production"
    assert [entry["file"] for entry in course["lessons"]] == [p.name for p in lessons]
    quiz_count = 0
    for path in pages:
        text = path.read_text()
        page = Page(text)
        errors.extend(f"{path.name}: {e}" for e in page.errors)
        for link in page.links:
            parsed = urlsplit(link)
            if parsed.scheme or parsed.netloc:
                continue
            target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            if not target.exists():
                errors.append(f"{path.name}: missing local target {link}")
            elif parsed.fragment and target.suffix == ".html":
                if parsed.fragment not in Page(target.read_text()).ids:
                    errors.append(f"{path.name}: missing HTML fragment {link}")
            elif parsed.fragment and target.suffix == ".md":
                headings = re.findall(r"^#+\s+(.+)$", target.read_text(), re.M)
                anchors = {re.sub(r"[^\w\- ]", "", h.lower()).replace(" ", "-") for h in headings}
                if parsed.fragment not in anchors:
                    errors.append(f"{path.name}: missing Markdown fragment {link}")
        if path in lessons:
            number = int(path.name[:2])
            assert f'data-lesson="{number}"' in text
            assert 'id="quiz"' in text and "Sources and version scope" in text
            match = re.search(r'<script type="application/json" id="quiz-data">(.*?)</script>', text, re.S)
            quiz = json.loads(match.group(1))
            assert len(quiz) == 3
            for q in quiz:
                assert all(k in q for k in ["q", "options", "answer", "why"])
                assert len(q["options"]) >= 3 and 0 <= q["answer"] < len(q["options"])
            quiz_count += len(quiz)
            assert text.index('src="lessons.js"') < text.index('src="../../course.js"')
    # Check syntax of the shared integration and the changed interactive lessons.
    scripts = [root / "lessons.js", repo / "course.js"]
    for script in scripts:
        subprocess.run(["node", "--check", str(script)], check=True, capture_output=True)
    for name in ["03-requests-and-limits.html", "08-operators.html"]:
        text = (root.parent / name).read_text()
        json.loads(re.search(r'<script type="application/json" id="quiz-data">(.*?)</script>', text, re.S).group(1))
        for script in re.findall(r"<script>(.*?)</script>", text, re.S):
            with tempfile.NamedTemporaryFile(suffix=".js", mode="w") as tmp:
                tmp.write(script)
                tmp.flush()
                subprocess.run(["node", "--check", tmp.name], check=True, capture_output=True)
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"PASS {len(lessons)} lessons, {quiz_count} questions, HTML nesting/IDs, local links, course mapping and JavaScript syntax")


if __name__ == "__main__":
    main()
