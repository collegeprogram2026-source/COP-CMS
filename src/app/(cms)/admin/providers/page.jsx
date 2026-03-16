"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slugify = (str = "") =>
  str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

const EMPTY_FORM = {
  // Basic
  name: "",
  slug: "",
  type: "University",
  shortExcerpt: "",
  logo: "",
  coverImage: "",
  galleryImages: [],
  isFeatured: false,
  isActive: true,
  publicationStatus: "draft",
  // Ratings
  averageRating: 0,
  reviewCount: 0,
  ratingBreakdown: {
    averageRating: 0,
    digitalInfrastructure: 0,
    curriculum: 0,
    valueForMoney: 0,
  },
  // Arrays
  scholarships: [],
  approvals: [],
  rankings: [],
  facts: [],
  campuses: [],
  placementPartners: [],
  faq: [],
  // Media
  sampleCertificateImage: "",
  // Admission
  admissionOpen: { isOpen: false, year: "", text: "" },
  // SEO
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
      {count !== undefined && (
        <span className="text-xs bg-muted text-muted-foreground font-bold rounded-full px-2.5 py-0.5">{count}</span>
      )}
      <div className="flex-1 h-px bg-muted" />
    </div>
  );
}

function Field({ label, children, span = 1, hint }) {
  return (
    <div className={`flex flex-col gap-2 col-span-${span}`}>
      <label className="text-xs font-bold text-foreground uppercase tracking-wide">{label}</label>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground leading-tight">{hint}</span>}
    </div>
  );
}

const inp =
  "w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-foreground bg-background placeholder:text-muted-foreground/50";
const sel =
  "w-full border border-border/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-card text-foreground";
const ta =
  "w-full border border-border/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none bg-background placeholder:text-muted-foreground/50";

// ─── Array Editor ─────────────────────────────────────────────────────────────

function ArrayEditor({ label, fieldName, form, setForm, fields, template, addLabel }) {
  const items = form[fieldName] || [];

  const add = () => setForm({ ...form, [fieldName]: [...items, { ...template }] });
  const remove = (i) => setForm({ ...form, [fieldName]: items.filter((_, idx) => idx !== i) });
  const update = (i, key, val) => {
    const arr = [...items];
    arr[i] = { ...arr[i], [key]: val };
    setForm({ ...form, [fieldName]: arr });
  };

  return (
    <div>
      <SectionHeader title={label} count={items.length} />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 items-start p-4 bg-muted/30 rounded-xl border border-border/40">
            <div className="flex-1 grid grid-cols-3 gap-4">
              {fields.map((f) => (
                <input
                  key={f.key}
                  type="text"
                  placeholder={f.label}
                  value={item[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  className={inp + " col-span-1 border-border/40"}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              className="mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary border-2 border-dashed border-border/50 rounded-xl px-4 py-3 w-full hover:border-border hover:bg-muted/50 transition-all"
        >
          <span>+</span> {addLabel || `Add ${label}`}
        </Button>
      </div>
    </div>
  );
}

// ─── Gallery Editor ───────────────────────────────────────────────────────────

function GalleryEditor({ form, setForm }) {
  const images = form.galleryImages || [];
  const add = () => setForm({ ...form, galleryImages: [...images, ""] });
  const remove = (i) => setForm({ ...form, galleryImages: images.filter((_, idx) => idx !== i) });
  const update = (i, val) => {
    const arr = [...images];
    arr[i] = val;
    setForm({ ...form, galleryImages: arr });
  };

  return (
    <div>
      <SectionHeader title="Gallery Images" count={images.length} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((img, i) => (
          <div key={i} className="flex gap-3 items-center group">
            <input
              type="text"
              placeholder="https://image-url.com"
              value={img}
              onChange={(e) => update(i, e.target.value)}
              className={inp}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary border-2 border-dashed border-border/50 rounded-xl px-4 py-3 w-full hover:border-border hover:bg-muted/50 transition-all col-span-full"
        >
          <span>+</span> Add Image URL
        </Button>
      </div>
    </div>
  );
}

// ─── Provider Form ────────────────────────────────────────────────────────────

function ProviderForm({ form, setForm, onSubmit, loading, submitLabel, onCancel }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Form header */}
      <div className="bg-primary px-8 py-5 flex items-center justify-between">
        <h2 className="text-primary-foreground font-bold tracking-tight">{submitLabel === "Update Provider" ? "Edit Provider" : "Create New Provider"}</h2>
        {onCancel && (
          <Button variant="ghost" size="icon" type="button" onClick={onCancel} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-8">

        {/* ── BASIC INFORMATION ── */}
        <div>
          <SectionHeader title="Basic Information" />
          <div className="grid grid-cols-6 gap-4">
            <Field label="name *" span={3}>
              <input
                type="text"
                placeholder="e.g. Amity University Online"
                value={form.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, name: v, slug: slugify(v) });
                }}
                className={inp}
                required
              />
            </Field>

            <Field label="slug *" span={3} hint="Auto-generated from name. Must be unique.">
              <input
                type="text"
                placeholder="amity-university-online"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className={inp + " font-mono bg-muted"}
              />
            </Field>

            <Field label="type" span={2}>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={sel}>
                <option value="University">University</option>
                <option value="Edtech">Edtech</option>
                <option value="Platform">Platform</option>
              </select>
            </Field>

            <Field label="publicationStatus" span={2}>
              <select value={form.publicationStatus} onChange={(e) => setForm({ ...form, publicationStatus: e.target.value })} className={sel}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </Field>

            <Field label="Flags" span={2}>
              <div className="flex gap-6 h-[46px] items-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="peer sr-only" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="peer sr-only" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Active</span>
                </label>
              </div>
            </Field>

            <Field label="shortExcerpt" span={6} hint="Shown in listing cards">
              <textarea
                placeholder="Brief description shown in cards..."
                value={form.shortExcerpt}
                onChange={(e) => setForm({ ...form, shortExcerpt: e.target.value })}
                className={ta}
                rows={2}
              />
            </Field>

            <Field label="logo" span={3} hint="University logo URL (header + cards)">
              <input type="text" placeholder="https://..." value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className={inp} />
            </Field>

            <Field label="coverImage" span={3} hint="Main banner image URL">
              <input type="text" placeholder="https://..." value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className={inp} />
            </Field>

            <div className="col-span-6">
              <GalleryEditor form={form} setForm={setForm} />
            </div>
          </div>
        </div>

        {/* ── RATINGS ── */}
        <div>
          <SectionHeader title="Ratings" />
          <div className="grid grid-cols-6 gap-4">
            <Field label="averageRating" span={2}>
              <input type="number" min="0" max="5" step="0.1" value={form.averageRating} onChange={(e) => setForm({ ...form, averageRating: parseFloat(e.target.value) || 0 })} className={inp} />
            </Field>
            <Field label="reviewCount" span={2}>
              <input type="number" min="0" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })} className={inp} />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground mt-2 mb-3">ratingBreakdown (detailed breakdown shown in UI)</p>
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-xl border border-border/50">
            {["averageRating", "digitalInfrastructure", "curriculum", "valueForMoney"].map((k) => (
              <Field key={k} label={`ratingBreakdown.${k}`} span={1}>
                <input
                  type="number" min="0" max="5" step="0.1"
                  value={form.ratingBreakdown[k]}
                  onChange={(e) => setForm({ ...form, ratingBreakdown: { ...form.ratingBreakdown, [k]: parseFloat(e.target.value) || 0 } })}
                  className={inp}
                />
              </Field>
            ))}
          </div>
        </div>

        {/* ── ADMISSIONS ── */}
        <div>
          <SectionHeader title="admissionOpen" />
          <div className="grid grid-cols-6 gap-4 p-4 bg-muted rounded-xl border border-border/50">
            <Field label="isOpen" span={2}>
              <div className="flex items-center h-[46px]">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={form.admissionOpen.isOpen} onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, isOpen: e.target.checked } })} className="peer sr-only" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Yes</span>
                </label>
              </div>
            </Field>
            <Field label="admissionOpen.year" span={2} hint='e.g. "2025"'>
              <input type="text" placeholder="2025" value={form.admissionOpen.year} onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, year: e.target.value } })} className={inp} />
            </Field>
            <Field label="admissionOpen.text" span={2} hint="Custom admission message">
              <input type="text" placeholder="Applications open for 2025 batch" value={form.admissionOpen.text} onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, text: e.target.value } })} className={inp} />
            </Field>
          </div>
        </div>

        {/* ── STRUCTURED ARRAYS ── */}
        <div className="space-y-6">
          <ArrayEditor
            label="approvals"
            fieldName="approvals"
            form={form} setForm={setForm}
            fields={[{ key: "name", label: "name (e.g. AICTE)" }, { key: "logo", label: "logo URL" }]}
            template={{ name: "", logo: "" }}
            addLabel="Add Approval"
          />
          <ArrayEditor
            label="rankings"
            fieldName="rankings"
            form={form} setForm={setForm}
            fields={[{ key: "title", label: "title" }, { key: "description", label: "description" }]}
            template={{ title: "", description: "" }}
            addLabel="Add Ranking"
          />
          <ArrayEditor
            label="facts (Key Facts)"
            fieldName="facts"
            form={form} setForm={setForm}
            fields={[{ key: "icon", label: "icon (optional)" }, { key: "text", label: "text" }]}
            template={{ icon: "", text: "" }}
            addLabel="Add Fact"
          />
          <ArrayEditor
            label="campuses"
            fieldName="campuses"
            form={form} setForm={setForm}
            fields={[{ key: "city", label: "city" }, { key: "state", label: "state" }, { key: "country", label: "country" }]}
            template={{ city: "", state: "", country: "" }}
            addLabel="Add Campus"
          />
          <ArrayEditor
            label="placementPartners"
            fieldName="placementPartners"
            form={form} setForm={setForm}
            fields={[{ key: "name", label: "name" }, { key: "logo", label: "logo URL" }]}
            template={{ name: "", logo: "" }}
            addLabel="Add Placement Partner"
          />
          <ArrayEditor
            label="scholarships"
            fieldName="scholarships"
            form={form} setForm={setForm}
            fields={[{ key: "category", label: "category" }, { key: "scholarshipCredit", label: "scholarshipCredit" }, { key: "eligibility", label: "eligibility" }]}
            template={{ category: "", scholarshipCredit: "", eligibility: "" }}
            addLabel="Add Scholarship"
          />
          <ArrayEditor
            label="faq"
            fieldName="faq"
            form={form} setForm={setForm}
            fields={[{ key: "question", label: "question" }, { key: "answer", label: "answer" }]}
            template={{ question: "", answer: "" }}
            addLabel="Add FAQ"
          />
        </div>

        {/* ── MEDIA ── */}
        <div>
          <SectionHeader title="Media" />
          <Field label="sampleCertificateImage" hint="URL to sample certificate image">
            <input type="text" placeholder="https://..." value={form.sampleCertificateImage} onChange={(e) => setForm({ ...form, sampleCertificateImage: e.target.value })} className={inp} />
          </Field>
        </div>

        {/* ── SEO ── */}
        <div>
          <SectionHeader title="SEO Fields" />
          <div className="grid grid-cols-6 gap-4">
            <Field label="metaTitle" span={3}>
              <input type="text" placeholder="Page title for search engines" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inp} />
            </Field>
            <Field label="metaKeywords" span={3}>
              <input type="text" placeholder="keyword1, keyword2, ..." value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} className={inp} />
            </Field>
            <Field label="metaDescription" span={6}>
              <textarea placeholder="Meta description for search results..." value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={ta} rows={2} />
            </Field>
            <Field label="canonicalUrl" span={6}>
              <input type="text" placeholder="https://yourdomain.com/providers/slug" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} className={inp} />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-8 border-t border-border/50">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchProviders = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch("/api/admin/providers", { cache: "no-store" });
      setProviders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("name is required!");
    setLoading(true);
    await fetch("/api/admin/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setLoading(false);
    fetchProviders();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      type: item.type || "University",
      shortExcerpt: item.shortExcerpt || "",
      logo: item.logo || "",
      coverImage: item.coverImage || "",
      galleryImages: item.galleryImages || [],
      isFeatured: item.isFeatured || false,
      isActive: item.isActive ?? true,
      publicationStatus: item.publicationStatus || "draft",
      averageRating: item.averageRating || 0,
      reviewCount: item.reviewCount || 0,
      ratingBreakdown: item.ratingBreakdown || { averageRating: 0, digitalInfrastructure: 0, curriculum: 0, valueForMoney: 0 },
      scholarships: item.scholarships || [],
      approvals: item.approvals || [],
      rankings: item.rankings || [],
      facts: item.facts || [],
      campuses: item.campuses || [],
      placementPartners: item.placementPartners || [],
      faq: item.faq || [],
      sampleCertificateImage: item.sampleCertificateImage || "",
      admissionOpen: item.admissionOpen || { isOpen: false, year: "", text: "" },
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      metaKeywords: item.metaKeywords || "",
      canonicalUrl: item.canonicalUrl || "",
    });
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setToast({ message: "name is required!", type: "error" });
    setLoading(true);
    await fetch(`/api/admin/providers/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoading(false);
    fetchProviders();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this provider?")) return;
    await fetch(`/api/admin/providers/${id}`, { method: "DELETE" });
    fetchProviders();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const statusBadge = (pub) =>
    pub === "published"
      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      : "bg-amber-500/10 text-amber-500 border border-amber-500/20";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-8">

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Providers</h1>
            <p className="text-muted-foreground mt-1">Manage universities, edtech platforms, and learning providers</p>
          </div>
          {!editingId && (
            <Button
              onClick={() => { setShowForm((v) => !v); setForm(EMPTY_FORM); }}
              className="px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2 h-auto"
            >
              {showForm ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  Close
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  New Provider
                </>
              )}
            </Button>
          )}
        </div>

        {/* ── Create Form ── */}
        {showForm && !editingId && (
          <div className="mb-8">
            <ProviderForm
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              loading={loading}
              submitLabel="Create Provider"
              onCancel={() => { setShowForm(false); setForm(EMPTY_FORM); }}
            />
          </div>
        )}

        {/* ── Edit Form ── */}
        {editingId && (
          <div className="mb-8">
            <ProviderForm
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              loading={loading}
              submitLabel="Update Provider"
              onCancel={cancelEdit}
            />
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-border/40 bg-muted/20 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">All Providers</h2>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{providers.length} total</span>
          </div>

          {fetchLoading ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              Loading providers...
            </div>
          ) : providers.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">🏢</div>
              <p className="text-lg font-medium">No providers yet</p>
              <p className="text-sm">Create your first university or edtech platform above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/40">
                    {["Name", "Type", "Slug", "Excerpt", "Featured", "Status", "Active", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {providers.map((item) => (
                    <tr key={item._id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground text-sm">{item.type || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground font-mono italic">/{item.slug}</code>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-muted-foreground text-xs max-w-[180px] truncate">{item.shortExcerpt || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        {item.isFeatured ? (
                          <span className="flex items-center justify-center w-6 h-6 bg-amber-500/10 rounded-full text-amber-500">★</span>
                        ) : (
                          <span className="text-muted-foreground/20">☆</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.publicationStatus === "published"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.publicationStatus === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {item.publicationStatus || "draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.isActive
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border/50"
                          }`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="text-muted-foreground hover:text-primary hover:bg-muted"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item._id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

