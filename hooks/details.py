"""MkDocs hook: turn the <details> Hint/Solution/Answer blocks into Material collapsibles.

The exercise files keep plain HTML <details> so they still fold on GitHub.
At build time this rewrites each block as `??? type "Label"` so Markdown
inside it (code, lists, tables) renders and picks up the theme's styling.
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


def on_page_markdown(markdown, **kwargs):
    return BLOCK.sub(_convert, markdown)
