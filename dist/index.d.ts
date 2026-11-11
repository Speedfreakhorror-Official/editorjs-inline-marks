import type { InlineToolConstructable } from '@editorjs/editorjs';
export interface MarkSpec {
    /** The tag the tool wraps the selection in. */
    tag: string;
    /** Other tags that mean the same (kept by the sanitizer, seen as "on"). */
    also?: string[];
    title: string;
    shortcut: string;
    icon: string;
}
export declare const SPECS: {
    underline: {
        tag: string;
        title: string;
        shortcut: string;
        icon: string;
    };
    strikethrough: {
        tag: string;
        also: string[];
        title: string;
        shortcut: string;
        icon: string;
    };
    superscript: {
        tag: string;
        title: string;
        shortcut: string;
        icon: string;
    };
    subscript: {
        tag: string;
        title: string;
        shortcut: string;
        icon: string;
    };
    highlight: {
        tag: string;
        title: string;
        shortcut: string;
        icon: string;
    };
    code: {
        tag: string;
        title: string;
        shortcut: string;
        icon: string;
    };
};
/** Every tag a spec keeps, as an Editor.js sanitize rule (handy for a block tool's own text fields). */
export declare const sanitizeFor: (specs?: MarkSpec[]) => Record<string, Record<string, boolean>>;
/** Makes an inline tool that wraps the selection in spec.tag, or takes it off when the selection is already in one. */
export declare function markTool(spec: MarkSpec): InlineToolConstructable;
export declare const Underline: InlineToolConstructable;
export declare const Strikethrough: InlineToolConstructable;
export declare const Superscript: InlineToolConstructable;
export declare const Subscript: InlineToolConstructable;
export declare const Highlight: InlineToolConstructable;
export declare const InlineCode: InlineToolConstructable;
