"use client";

import TextBlock from "./TextBlock";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Image as ImageIcon, LayoutGrid, Trash2 } from "lucide-react";

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

  const addCardBlock = () => {
    setForm({
      ...form,
      content: [
        ...form.content,
        {
          type: "card",
          heading: "",
          subheading: "",
          columns: 3,
          items: [{ icon: "", title: "", description: "" }],
        },
      ],
    });
  };

  const updateCardField = (index, key, value) => {
    const updated = [...form.content];
    updated[index][key] = value;
    setForm({ ...form, content: updated });
  };

  const updateCardItem = (index, itemIdx, key, value) => {
    const updated = [...form.content];
    const items = [...(updated[index].items || [])];
    items[itemIdx] = { ...items[itemIdx], [key]: value };
    updated[index].items = items;
    setForm({ ...form, content: updated });
  };

  const addCardItem = (index) => {
    const updated = [...form.content];
    updated[index].items = [...(updated[index].items || []), { icon: "", title: "", description: "" }];
    setForm({ ...form, content: updated });
  };

  const removeCardItem = (index, itemIdx) => {
    const updated = [...form.content];
    updated[index].items = (updated[index].items || []).filter((_, i) => i !== itemIdx);
    setForm({ ...form, content: updated });
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
          className="px-4 py-2 text-xs font-semibold text-muted-foreground border-2 border-dashed border-border rounded-lg hover:border-border hover:bg-muted transition-colors h-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Text Block
        </Button>

        <Button
          type="button"
          onClick={addImageBlock}
          variant="outline"
          className="px-4 py-2 text-xs font-semibold text-muted-foreground border-2 border-dashed border-border rounded-lg hover:border-border hover:bg-muted transition-colors h-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Image Block
        </Button>

        <Button
          type="button"
          onClick={addCardBlock}
          variant="outline"
          className="px-4 py-2 text-xs font-semibold text-muted-foreground border-2 border-dashed border-border rounded-lg hover:border-border hover:bg-muted transition-colors h-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Card Block
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
              <div className="flex items-center gap-2">
                {block.type === "text" && <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
                {block.type === "image" && <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                {block.type === "card" && <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {block.type === "text" && "Text Block"}
                  {block.type === "image" && "Image Block"}
                  {block.type === "card" && "Card Block"}
                </span>
              </div>
              <Button
                type="button"
                onClick={() => removeBlock(index)}
                variant="ghost"
                size="sm"
                className="text-xs text-red-500 hover:text-rose-500 font-semibold px-3 py-1 rounded hover:bg-rose-500/10 transition-colors h-auto flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
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

              {/* CARD BLOCK */}
              {block.type === "card" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Section heading (e.g. Program Highlights)"
                      value={block.heading || ""}
                      onChange={(e) => updateCardField(index, "heading", e.target.value)}
                      className={inp}
                    />
                    <input
                      type="text"
                      placeholder="Optional subheading"
                      value={block.subheading || ""}
                      onChange={(e) => updateCardField(index, "subheading", e.target.value)}
                      className={inp}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-muted-foreground">Columns</label>
                    <select
                      value={block.columns || 3}
                      onChange={(e) => updateCardField(index, "columns", Number(e.target.value))}
                      className={inp + " w-24"}
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {(block.items || []).map((it, i) => (
                      <div key={i} className="border-2 border-border rounded-lg p-3 bg-muted/40 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Card {i + 1}</span>
                          <Button
                            type="button"
                            onClick={() => removeCardItem(index, i)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-rose-500 font-semibold px-2 py-1 rounded h-auto flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Emoji (e.g. 🎓) — or upload an image below"
                            value={it.icon || ""}
                            onChange={(e) => updateCardItem(index, i, "icon", e.target.value)}
                            className={inp}
                          />
                          <ImageUploader
                            value={it.icon && /^(https?:\/\/|\/|data:image\/)/.test(it.icon) ? it.icon : ""}
                            onChange={(url) => updateCardItem(index, i, "icon", url)}
                            folder="cop/content-blocks/card-icons"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Card title"
                          value={it.title || ""}
                          onChange={(e) => updateCardItem(index, i, "title", e.target.value)}
                          className={inp}
                        />
                        <textarea
                          placeholder="Card description"
                          value={it.description || ""}
                          onChange={(e) => updateCardItem(index, i, "description", e.target.value)}
                          className={inp + " min-h-[60px] resize-none"}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={() => addCardItem(index)}
                    variant="outline"
                    className="w-full px-4 py-2 text-xs font-semibold text-muted-foreground border-2 border-dashed border-border rounded-lg hover:bg-muted h-auto flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Card Item
                  </Button>
                </div>
              )}

              {/* IMAGE BLOCK */}
              {block.type === "image" && (
                <ImageUploader
                  value={block.value}
                  onChange={(url) => updateBlock(index, url)}
                  folder="cop/content-blocks"
                />
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
