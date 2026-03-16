"use client";

import ContentBuilder from "./ContentBuilder";
import { Button } from "@/components/ui/button";

// ─── UI Helpers ───────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Field({ label, children, span = 1, hint }) {
  return (
    <div className={`flex flex-col gap-1.5 col-span-${span}`}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

// ── Stronger input styles — visible border + dark placeholder ──────────
const inp =
  "border-2 border-border bg-card px-3 py-2.5 rounded-lg text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-border w-full " +
  "placeholder-slate-400 transition-colors hover:border-border";

const sel =
  "border-2 border-border bg-card px-3 py-2.5 rounded-lg text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-border w-full " +
  "transition-colors hover:border-border";

const ta =
  "border-2 border-border bg-card px-3 py-2.5 rounded-lg text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-border w-full " +
  "resize-none placeholder-slate-400 transition-colors hover:border-border";

// ─── Blog Form ──────────────────────────────────────────────────────

export default function BlogForm({
  form,
  setForm,
  onSubmit,
  loading,
  submitLabel,
  onCancel,
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-primary px-6 py-4 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm tracking-wide">
          {submitLabel === "Update Blog" ? "✏️ Edit Blog" : "➕ New Blog"}
        </h2>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:text-white text-sm transition-colors h-auto"
          >
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-8">

        {/* ── BASIC INFORMATION ── */}
        <div>
          <SectionHeader title="Basic Information" />
          <div className="grid grid-cols-6 gap-4">

            <Field label="Title *" span={3}>
              <input
                type="text"
                placeholder="e.g. Top 10 MBA Programs in 2026"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w-]+/g, ""),
                  })
                }
                className={inp}
                required
              />
            </Field>

            <Field label="Slug *" span={3}>
              <input
                type="text"
                placeholder="auto-generated-from-title"
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w-]+/g, ""),
                  })
                }
                className={inp + " font-mono bg-muted"}
              />
            </Field>

            <Field label="Summary" span={6} hint="Short excerpt shown in blog listing">
              <textarea
                rows={3}
                placeholder="Write a short summary of this blog post..."
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className={ta}
              />
            </Field>

            <Field label="Thumbnail URL" span={3}>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className={inp}
              />
            </Field>

            <Field label="Status" span={3}>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={sel}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>

          </div>
        </div>

        {/* ── AUTHOR ── */}
        <div>
          <SectionHeader title="Author" />
          <div className="grid grid-cols-6 gap-4">

            <Field label="Author Name" span={3}>
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={form.author.name}
                onChange={(e) =>
                  setForm({ ...form, author: { ...form.author, name: e.target.value } })
                }
                className={inp}
              />
            </Field>

            <Field label="Author Photo URL" span={3}>
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={form.author.photo}
                onChange={(e) =>
                  setForm({ ...form, author: { ...form.author, photo: e.target.value } })
                }
                className={inp}
              />
            </Field>

          </div>
        </div>

        {/* ── CONTENT BUILDER ── */}
        <ContentBuilder form={form} setForm={setForm} />

        {/* ── SEO ── */}
        <div>
          <SectionHeader title="SEO Fields" />
          <div className="grid grid-cols-6 gap-4">

            <Field label="Meta Title" span={3}>
              <input
                type="text"
                placeholder="SEO-optimized page title"
                value={form.seo.metaTitle}
                onChange={(e) =>
                  setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })
                }
                className={inp}
              />
            </Field>

            <Field label="Canonical URL" span={3}>
              <input
                type="text"
                placeholder="https://yourdomain.com/blog/slug"
                value={form.seo.canonicalUrl}
                onChange={(e) =>
                  setForm({ ...form, seo: { ...form.seo, canonicalUrl: e.target.value } })
                }
                className={inp}
              />
            </Field>

            <Field label="Meta Description" span={6}>
              <textarea
                rows={2}
                placeholder="Brief description for search engine results (150–160 chars recommended)"
                value={form.seo.metaDescription}
                onChange={(e) =>
                  setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })
                }
                className={ta}
              />
            </Field>

          </div>
        </div>

        {/* ── SUBMIT ── */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted disabled:opacity-50 transition-colors h-auto"
          >
            {loading ? "Saving..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors h-auto"
            >
              Cancel
            </Button>
          )}
        </div>

      </form>
    </div>
  );
}

