// src/index.ts
var svg = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
var SPECS = {
  underline: { tag: "u", title: "Underline", shortcut: "CMD+U", icon: svg('<path d="M7 4v7a5 5 0 0 0 10 0V4"/><path d="M5 20h14"/>') },
  strikethrough: { tag: "s", also: ["del", "strike"], title: "Strikethrough", shortcut: "CMD+SHIFT+X", icon: svg('<path d="M16.5 6.5A4 4 0 0 0 13 4h-2a3.5 3.5 0 0 0-2 6.4"/><path d="M4 12h16"/><path d="M8 17.5a4 4 0 0 0 3.5 2.5h1a3.5 3.5 0 0 0 3.4-4.5"/>') },
  superscript: { tag: "sup", title: "Superscript", shortcut: "CMD+.", icon: svg('<path d="m3 9 9 10M12 9l-9 10"/><path d="M15 4h4.5v3.5H15V11h5"/>') },
  subscript: { tag: "sub", title: "Subscript", shortcut: "CMD+SHIFT+.", icon: svg('<path d="m3 5 9 10M12 5l-9 10"/><path d="M15 13h4.5v3.5H15V20h5"/>') },
  highlight: { tag: "mark", title: "Highlight", shortcut: "CMD+SHIFT+H", icon: svg('<path d="m14 4 6 6-8 8H6v-6z"/><path d="M4 21h9"/>') },
  code: { tag: "code", title: "Inline code", shortcut: "CMD+E", icon: svg('<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>') }
};
var sanitizeFor = (specs = Object.values(SPECS)) => Object.fromEntries(specs.flatMap((s) => [s.tag, ...s.also ?? []]).map((t) => [t, {}]));
function around(node, tags) {
  for (let n = node;n; n = n.parentNode) {
    if (!(n instanceof HTMLElement))
      continue;
    if (tags.includes(n.tagName.toLowerCase()))
      return n;
    if (n.isContentEditable && !n.parentElement?.isContentEditable)
      return null;
  }
  return null;
}
function changed(node) {
  const host = node instanceof Element ? node : node?.parentElement;
  host?.closest('[contenteditable="true"]')?.dispatchEvent(new Event("input", { bubbles: true }));
}
function selectContents(nodes) {
  const sel = window.getSelection();
  if (!sel || !nodes.length)
    return;
  const r = document.createRange();
  r.setStartBefore(nodes[0]);
  r.setEndAfter(nodes[nodes.length - 1]);
  sel.removeAllRanges();
  sel.addRange(r);
}
function markTool(spec) {
  const tags = [spec.tag, ...spec.also ?? []];
  return class MarkTool {
    static isInline = true;
    static title = spec.title;
    static shortcut = spec.shortcut;
    static get sanitize() {
      return sanitizeFor([spec]);
    }
    api;
    button = null;
    constructor({ api }) {
      this.api = api;
    }
    render() {
      const b = document.createElement("button");
      b.type = "button";
      b.classList.add(this.api.styles.inlineToolButton);
      b.innerHTML = spec.icon;
      b.title = spec.title;
      b.setAttribute("aria-label", spec.title);
      this.button = b;
      return b;
    }
    surround(range) {
      if (!range)
        return;
      const on = around(range.commonAncestorContainer, tags);
      if (on) {
        const kids = Array.from(on.childNodes);
        const parent = on.parentNode;
        on.replaceWith(...kids);
        selectContents(kids);
        changed(parent);
        return;
      }
      if (range.collapsed)
        return;
      const el = document.createElement(spec.tag);
      const part = range.extractContents();
      part.querySelectorAll(tags.join(",")).forEach((x) => x.replaceWith(...Array.from(x.childNodes)));
      el.append(part);
      range.insertNode(el);
      selectContents([el]);
      changed(el);
    }
    checkState() {
      const on = !!around(window.getSelection()?.anchorNode ?? null, tags);
      this.button?.classList.toggle(this.api.styles.inlineToolButtonActive, on);
      return on;
    }
  };
}
var Underline = markTool(SPECS.underline);
var Strikethrough = markTool(SPECS.strikethrough);
var Superscript = markTool(SPECS.superscript);
var Subscript = markTool(SPECS.subscript);
var Highlight = markTool(SPECS.highlight);
var InlineCode = markTool(SPECS.code);
export {
  Highlight,
  InlineCode,
  SPECS,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  markTool,
  sanitizeFor
};
