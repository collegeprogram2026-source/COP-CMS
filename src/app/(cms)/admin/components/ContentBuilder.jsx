"use client";

import TextBlock from "./TextBlock";
import { Button } from "@/components/ui/button";

// ─── Section Header ───────────────────────────────────────────────

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
      {count !== undefined && (
        <span className="text-xs bg-border text-muted-foreground font-semibold rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Stronger input — visible border + readable placeholder ────────
const inp =
  "border-2 border-border bg-card px-3 py-2.5 rounded-lg text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-border w-full " +
  "placeholder-slate-400 transition-colors hover:border-border";

// ─── Content Builder ───────────────────────────────────────────────

export default function ContentBuilder({ form, setForm }) {

  const addTextBlock = () => {
    setForm({
      ...form,
      content: [...form.content, { type: "text", value: "", align: "left" }],
    });
  };

  const addImageBlock = () => {
    setForm({
      ...form,
      content: [...form.content, { type: "image", value: "", align: "center" }],
    });
  };

  const removeBlock = (index) => {
    const updated = form.content.filter((_, i) => i !== index);
    setForm({ ...form, content: updated });
  };

  const updateBlock = (index, newValue) => {
    const updated = [...form.content];
    updated[index].value = newValue;
    setForm({ ...form, content: updated });
  };

  return (
    <div>
      <SectionHeader title="Content Builder" count={form.content.length} />

      {/* ── Add Buttons ── */}
      <div className="flex gap-3 mb-6">
        <Button
          type="button"
          onClick={addTextBlock}
          variant="outline"
          className="px-4 py-2 text-xs font-semibold text-muted-foreground border-2 border-dashed border-border rounded-lg hover:border-border hover:bg-muted transition-colors h-auto"
        >
          + Add Text Block
        </Button>

        <Button
          type="button"
          onClick={addImageBlock}
          variant="outline"
          className="px-4 py-2 text-xs font-semibold text-muted-foreground border-2 border-dashed border-border rounded-lg hover:border-border hover:bg-muted transition-colors h-auto"
        >
          + Add Image Block
        </Button>
      </div>

      {/* ── Blocks ── */}
      <div className="space-y-4">
        {form.content.map((block, index) => (
          <div
            key={index}
            className="border-2 border-border rounded-xl overflow-hidden bg-card hover:border-border transition-colors"
          >
            {/* Block Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted border-b-2 border-border">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                📋 {block.type === "text" ? "Text Block" : "Image Block"}
              </span>
              <Button
                type="button"
                onClick={() => removeBlock(index)}
                variant="ghost"
                size="sm"
                className="text-sm text-red-500 hover:text-rose-500 font-semibold px-3 py-1 rounded hover:bg-rose-500/10 transition-colors h-auto"
              >
                Remove
              </Button>
            </div>

            {/* Block Content */}
            <div className="p-4">
              {/* TEXT BLOCK */}
              {block.type === "text" && (
                <TextBlock
                  value={block.value}
                  onChange={(val) => updateBlock(index, val)}
                />
              )}

              {/* IMAGE BLOCK */}
              {block.type === "image" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Paste image URL here, e.g. https://example.com/photo.jpg"
                    value={block.value}
                    onChange={(e) => updateBlock(index, e.target.value)}
                    className={inp}
                  />

                  {block.value ? (
                    <img
                      src={block.value}
                      alt="Preview"
                      className="rounded-lg max-h-60 object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-border bg-card text-muted-foreground text-xs">
                      Image preview will appear here
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {form.content.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-border text-muted-foreground text-xs">
            No content blocks yet — add one above
          </div>
        )}
      </div>
    </div>
  );
}
