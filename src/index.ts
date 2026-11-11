// editorjs-inline-marks: underline, strikethrough, superscript, subscript, highlight and inline code tools for Editor.js.
import type { API, InlineTool, InlineToolConstructable, InlineToolConstructorOptions } from '@editorjs/editorjs';

export interface MarkSpec {
  /** The tag the tool wraps the selection in. */
  tag: string;
  /** Other tags that mean the same (kept by the sanitizer, seen as "on"). */
  also?: string[];
  title: string;
  shortcut: string;
  icon: string;
}

const svg = (d: string) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const SPECS = {
  underline: { tag: 'u', title: 'Underline', shortcut: 'CMD+U', icon: svg('<path d="M7 4v7a5 5 0 0 0 10 0V4"/><path d="M5 20h14"/>') },
  strikethrough: { tag: 's', also: ['del', 'strike'], title: 'Strikethrough', shortcut: 'CMD+SHIFT+X', icon: svg('<path d="M16.5 6.5A4 4 0 0 0 13 4h-2a3.5 3.5 0 0 0-2 6.4"/><path d="M4 12h16"/><path d="M8 17.5a4 4 0 0 0 3.5 2.5h1a3.5 3.5 0 0 0 3.4-4.5"/>') },
  superscript: { tag: 'sup', title: 'Superscript', shortcut: 'CMD+.', icon: svg('<path d="m3 9 9 10M12 9l-9 10"/><path d="M15 4h4.5v3.5H15V11h5"/>') },
  subscript: { tag: 'sub', title: 'Subscript', shortcut: 'CMD+SHIFT+.', icon: svg('<path d="m3 5 9 10M12 5l-9 10"/><path d="M15 13h4.5v3.5H15V20h5"/>') },
  highlight: { tag: 'mark', title: 'Highlight', shortcut: 'CMD+SHIFT+H', icon: svg('<path d="m14 4 6 6-8 8H6v-6z"/><path d="M4 21h9"/>') },
  code: { tag: 'code', title: 'Inline code', shortcut: 'CMD+E', icon: svg('<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>') },
} satisfies Record<string, MarkSpec>;

/** Every tag a spec keeps, as an Editor.js sanitize rule (handy for a block tool's own text fields). */
export const sanitizeFor = (specs: MarkSpec[] = Object.values(SPECS)) =>
  Object.fromEntries(specs.flatMap((s) => [s.tag, ...(s.also ?? [])]).map((t) => [t, {}])) as Record<string, Record<string, boolean>>;

/** The element of one of `tags` around `node`, inside the editable it sits in; null when none. */
function around(node: Node | null, tags: string[]): HTMLElement | null {
  for (let n: Node | null = node; n; n = n.parentNode) {
    if (!(n instanceof HTMLElement)) continue;
    if (tags.includes(n.tagName.toLowerCase())) return n;
    if (n.isContentEditable && !n.parentElement?.isContentEditable) return null;
  }
  return null;
}

/** Tells the editable the change happened (a block tool that keeps its text on `input` sees it). */
function changed(node: Node | null) {
  const host = node instanceof Element ? node : node?.parentElement;
  host?.closest('[contenteditable="true"]')?.dispatchEvent(new Event('input', { bubbles: true }));
}

function selectContents(nodes: Node[]) {
  const sel = window.getSelection();
  if (!sel || !nodes.length) return;
  const r = document.createRange();
  r.setStartBefore(nodes[0]);
  r.setEndAfter(nodes[nodes.length - 1]);
  sel.removeAllRanges();
  sel.addRange(r);
}

/** Makes an inline tool that wraps the selection in spec.tag, or takes it off when the selection is already in one. */
export function markTool(spec: MarkSpec): InlineToolConstructable {
  const tags = [spec.tag, ...(spec.also ?? [])];
  return class MarkTool implements InlineTool {
    static isInline = true;
    static title = spec.title;
    static shortcut = spec.shortcut;
    static get sanitize() { return sanitizeFor([spec]); }
    private api: API;
    private button: HTMLButtonElement | null = null;
    constructor({ api }: InlineToolConstructorOptions) { this.api = api; }
    render() {
      const b = document.createElement('button');
      b.type = 'button';
      b.classList.add(this.api.styles.inlineToolButton);
      b.innerHTML = spec.icon;
      b.title = spec.title;
      b.setAttribute('aria-label', spec.title);
      this.button = b;
      return b;
    }
    surround(range: Range | null) {
      if (!range) return;
      const on = around(range.commonAncestorContainer, tags);
      if (on) {
        const kids = Array.from(on.childNodes);
        const parent = on.parentNode;
        on.replaceWith(...kids);
        selectContents(kids);
        changed(parent);
        return;
      }
      if (range.collapsed) return;
      const el = document.createElement(spec.tag);
      const part = range.extractContents();
      // the same style inside the selection merges into the new one
      part.querySelectorAll(tags.join(',')).forEach((x) => x.replaceWith(...Array.from(x.childNodes)));
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

export const Underline = markTool(SPECS.underline);
export const Strikethrough = markTool(SPECS.strikethrough);
export const Superscript = markTool(SPECS.superscript);
export const Subscript = markTool(SPECS.subscript);
export const Highlight = markTool(SPECS.highlight);
export const InlineCode = markTool(SPECS.code);
