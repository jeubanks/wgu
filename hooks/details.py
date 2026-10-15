"""MkDocs hook: smooth over GitHub-flavored Markdown that Python-Markdown reads differently.

- The exercise files keep plain HTML <details> so they still fold on GitHub.
  At build time each block becomes `??? type "Label"` so Markdown inside it
  (code, lists, tables) renders and picks up the theme's styling.
- A trailing backslash is a hard line break on GitHub but literal text here,
  so it becomes `<br>` (outside code blocks).
- GitHub lets a list start on the line right after a paragraph; Python-Markdown
  needs a blank line first, or the items run together as one paragraph.
- GitHub alerts (`> [!NOTE]`, `> [!TIP]`, ...) become Material admonitions.
- `<a href="file" download>` becomes a Markdown link with a download attribute,
  because MkDocs only adjusts Markdown link paths for each page's URL.
"""
import re

TYPES = {"Hint": "tip", "Solution": "success", "Answer": "success"}

BLOCK = re.compile(
    r"^(?P<indent>[ \t]*)<details>\n"
    r"(?P=indent)<summary>(?P<label>[^<]+)</summary>\n"
    r"(?P<body>.*?)\n"
    r"(?P=indent)</details>[ \t]*$",
    re.MULTILINE | re.DOTALL,
)


def _convert(match):
    indent, label = match["indent"], match["label"].strip()
    kind = TYPES.get(label, "note")
    body = []
    for line in match["body"].strip("\n").split("\n"):
        # Re-indent one level deeper than the <details> tag.
        stripped = line[len(indent):] if line.startswith(indent) else line.lstrip()
        body.append(f"{indent}    {stripped}" if stripped else "")
    return f'{indent}??? {kind} "{label}"\n\n' + "\n".join(body)


FENCE = re.compile(r"^\s*(?:>\s*)?(```|~~~)")
LIST_ITEM = re.compile(r"^\s*(?:[-*+]|\d+\.)\s+\S")
NOT_PARAGRAPH = re.compile(r"^\s*(?:\||<|>|#)")


def _gfm_fixes(markdown):
    out, in_fence = [], False
    for line in markdown.split("\n"):
        if FENCE.match(line):
            in_fence = not in_fence
        elif not in_fence:
            prev = out[-1] if out else ""
            if (LIST_ITEM.match(line) and prev.strip()
                    and not LIST_ITEM.match(prev) and not NOT_PARAGRAPH.match(prev)):
                out.append("")
            if line.endswith("\\") and not line.endswith("\\\\"):
                line = line[:-1] + "<br>"
        out.append(line)
    return "\n".join(out)


ALERTS = {
    "NOTE": ("note", "Note"),
    "TIP": ("tip", "Tip"),
    "IMPORTANT": ("info", "Important"),
    "WARNING": ("warning", "Warning"),
    "CAUTION": ("danger", "Caution"),
}
ALERT_START = re.compile(r"^(?P<indent>[ \t]*)>\s*\[!(?P<kind>[A-Z]+)\]\s*$")


def _alerts(markdown):
    lines, out, i = markdown.split("\n"), [], 0
    while i < len(lines):
        start = ALERT_START.match(lines[i])
        if not start or start["kind"] not in ALERTS:
            out.append(lines[i])
            i += 1
            continue
        indent = start["indent"]
        kind, title = ALERTS[start["kind"]]
        out += [f'{indent}!!! {kind} "{title}"', ""]
        i += 1
        quoted = re.compile(rf"^{re.escape(indent)}>( ?)(?P<text>.*)$")
        while i < len(lines) and (m := quoted.match(lines[i])):
            out.append(f"{indent}    {m['text']}" if m["text"].strip() else "")
            i += 1
    return "\n".join(out)


DOWNLOAD = re.compile(r'<a href="(?P<href>[^"]+)" download>(?P<text>.*?)</a>')


def _download_link(match):
    href = match["href"]
    # The download attribute's value is the saved filename.
    return f'[{match["text"]}]({href}){{: download="{href.rsplit("/", 1)[-1]}" }}'


def _downloads(markdown):
    return DOWNLOAD.sub(_download_link, markdown)


def on_page_markdown(markdown, **kwargs):
    return BLOCK.sub(_convert, _gfm_fixes(_alerts(_downloads(markdown))))
