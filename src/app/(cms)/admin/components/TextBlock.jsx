"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";

const toolbarButtons = [
  { label: "B", title: "Bold", action: (e) => e.chain().focus().toggleBold().run(), isActive: (e) => e.isActive("bold"), style: "font-bold" },
  { label: "I", title: "Italic", action: (e) => e.chain().focus().toggleItalic().run(), isActive: (e) => e.isActive("italic"), style: "italic" },
  { label: "H2", title: "Heading 2", action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (e) => e.isActive("heading", { level: 2 }), style: "font-bold" },
  { label: "H3", title: "Heading 3", action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (e) => e.isActive("heading", { level: 3 }), style: "font-bold" },
  { label: "• List", title: "Bullet List", action: (e) => e.chain().focus().toggleBulletList().run(), isActive: (e) => e.isActive("bulletList"), style: "" },
  { label: "1. List", title: "Ordered List", action: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive("orderedList"), style: "" },
];

export default function TextBlock({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="bg-card border-2 border-border rounded-lg overflow-hidden focus-within:border-border focus-within:ring-2 focus-within:ring-slate-300 transition-colors">

      {/* Toolbar */}
      <div className="flex gap-1 flex-wrap px-3 py-2 border-b-2 border-border bg-muted">
        {toolbarButtons.map(({ label, title, action, isActive, style }) => (
          <Button
            key={label}
            type="button"
            title={title}
            onClick={() => action(editor)}
            variant="ghost"
            size="sm"
            className={`
              text-xs px-2.5 py-1.5 rounded font-medium border transition-all h-auto
              ${isActive(editor)
                ? "bg-primary text-white border-primary"
                : "bg-card text-muted-foreground border-border hover:border-border hover:bg-muted"
              } ${style}
            `}
          >
            {label}
          </Button>
        ))}

        {/* Divider */}
        <div className="w-px bg-muted mx-1 self-stretch" />

        <Button
          type="button"
          title="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          variant="ghost"
          size="sm"
          className="text-xs px-2.5 py-1.5 rounded font-medium border bg-card text-muted-foreground border-border hover:border-border hover:bg-muted hover:text-muted-foreground transition-all h-auto"
        >
          Clear
        </Button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="
          min-h-[140px] text-sm text-foreground px-4 py-3
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[120px]
          [&_.ProseMirror_p]:mb-2
          [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-3
          [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_h3]:mt-2
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-2
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-2
          [&_.ProseMirror_li]:mb-0.5
          [&_.ProseMirror_strong]:font-bold
          [&_.ProseMirror_em]:italic
          [&_.ProseMirror.ProseMirror-focused]:outline-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-['Start_writing...'] 
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
        "
      />
    </div>
  );
}
