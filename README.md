# editorjs-inline-marks

Inline tools for Editor.js: Underline, Strikethrough, Superscript, Subscript, Highlight and Inline code. Each one wraps the selection in its tag, or takes it off again when the selection is already inside one.

## Install

```
npm i github:Speedfreakhorror-Official/editorjs-inline-marks
```

Import the tools and the stylesheet:

```ts
import { Underline, Strikethrough, Superscript, Subscript, Highlight, InlineCode } from 'editorjs-inline-marks';
import 'editorjs-inline-marks/style.css';
```

## Usage

```ts
new EditorJS({
  tools: {
    underline: Underline, strikethrough: Strikethrough, superscript: Superscript,
    subscript: Subscript, highlight: Highlight, inlineCode: InlineCode,
    paragraph: { inlineToolbar: ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'highlight', 'inlineCode', 'link'] },
  },
});
```

| Tool | Tag | Shortcut |
|---|---|---|
| Underline | `<u>` | Cmd/Ctrl+U |
| Strikethrough | `<s>` (also keeps `<del>`, `<strike>`) | Cmd/Ctrl+Shift+X |
| Superscript | `<sup>` | Cmd/Ctrl+. |
| Subscript | `<sub>` | Cmd/Ctrl+Shift+. |
| Highlight | `<mark>` | Cmd/Ctrl+Shift+H |
| Inline code | `<code>` | Cmd/Ctrl+E |

A block tool whose own text fields carry inline HTML can keep these tags with `sanitizeFor()`, an Editor.js sanitize rule for every tag above: `text: { b: true, i: true, a: { href: true }, ...sanitizeFor() }`.

`markTool(spec)` makes another tool of the same kind from `{ tag, also?, title, shortcut, icon }`.

The stylesheet colours `<mark>` and `<code>` inside the editor from these CSS variables, with light and dark defaults on `:root`: `--ejs-mark`, `--ejs-code-bg`, `--ejs-line`.

## Credits

Built as part of [PrintCut](https://printcut.app), a browser studio for designing laser-cut boxes, puzzles, keychains and signs from templates. Made and owned by [ibrahim-jaber.com](https://ibrahim-jaber.com).
