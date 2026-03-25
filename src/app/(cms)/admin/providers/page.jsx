"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";
import ContentBuilder from "../components/ContentBuilder";
import TextBlock from "../components/TextBlock";
import {
  GraduationCap,
  Image as ImageIcon,
  Star,
  ClipboardList,
  MapPin,
  HelpCircle,
  Award,
  Search,
  Building2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (str = "") =>
  str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

const EMPTY_FORM = {
  name: "",
  slug: "",
  shortExcerpt: "",
  contentBlocks: [],
  logo: "",
  coverImage: "",
  galleryDescription: null,
  galleryImages: [],
  isFeatured: false,
  isActive: "active",
  publicationStatus: "draft",
  type: "University",
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
  scholarshipDescription: null,
  scholarships: [],
  approvalsDescription: null,
  approvals: [],
  rankingsDescription: null,
  rankings: [],
  factsDescription: null,
  facts: [],
  campuses: [],
  placementPartnersDescription: null,
  placementPartners: [],
  faq: [],
  // Media
  sampleCertificateDescription: null,
  sampleCertificateImage: "",
  // Admission
  admissionOpen: { isOpen: false, year: "", text: "", description: null },
  // SEO
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const inp =
  "w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-foreground bg-background placeholder:text-muted-foreground/50";
const sel =
  "w-full border border-border/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-card text-foreground";
const ta =
  "w-full border border-border/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none bg-background placeholder:text-muted-foreground/50";

// ─── Layout Primitives ────────────────────────────────────────────────────────

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

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden mb-8">
      <div className="flex items-center gap-3 px-8 py-4 border-b border-border/40 bg-muted/20">
        {Icon && (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function Field({ label, children, span = 1, hint, required }) {
  const COL_SPAN = {
    1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
    5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
    9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
  };
  return (
    <div className={`flex flex-col gap-2 ${COL_SPAN[span] || "col-span-1"}`}>
      <label className="text-xs font-bold text-foreground uppercase tracking-wide">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground leading-tight">{hint}</span>}
    </div>
  );
}

function InlineLabel({ children }) {
  return (
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
      {children}
    </label>
  );
}

// ─── Array Editor ─────────────────────────────────────────────────────────────

function ArrayEditor({ fieldName, form, setForm, fields, template, addLabel, singular }) {
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
          <span>+</span> {addLabel || `Add ${singular || "Item"}`}
        </Button>
      </div>
    </div>
  );
}

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

// ─── Description + List combo ─────────────────────────────────────────────────

function DescribedList({ title, descriptionKey, form, setForm, children }) {
  return (
    <div className="space-y-4">
      <SectionHeader title={title} />
      <div className="mb-4">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Section Description
        </label>
        <TextBlock
          value={form[descriptionKey]}
          onChange={(val) => setForm({ ...form, [descriptionKey]: val })}
        />
      </div>
      {children}
    </div>
  );
}

// ─── Main Provider Form ───────────────────────────────────────────────────────

function ProviderForm({ form, setForm, onSubmit, loading, submitLabel, onCancel }) {
  const isEdit = submitLabel === "Update Provider";

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Form header */}
      <div className="bg-primary px-8 py-5 flex items-center justify-between">
        <h2 className="text-primary-foreground font-bold tracking-tight">{isEdit ? "Edit Provider" : "Create New Provider"}</h2>
        {onCancel && (
          <Button variant="ghost" size="icon" type="button" onClick={onCancel} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-8">

        {/* ── 1. Identity ── */}
        <FormSection icon={GraduationCap} title="Identity" description="Core identification fields shown across the platform">
          <div className="grid grid-cols-12 gap-6">

            <Field label="Provider Name" span={6} required hint="Full official name, e.g. Amity University Online">
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

            <Field label="URL Slug" span={3} required hint="Auto-generated from name.">
              <input
                type="text"
                placeholder="amity-university-online"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className={inp + " font-mono bg-muted"}
              />
            </Field>

            <Field label="Type" span={3}>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={sel}>
                <option value="University">University</option>
                <option value="Edtech">Edtech</option>
                <option value="Platform">Platform</option>
              </select>
            </Field>

            <Field label="Short Excerpt" span={12} hint="Shown in listing cards">
              <textarea
                placeholder="Brief description shown in cards..."
                value={form.shortExcerpt}
                onChange={(e) => setForm({ ...form, shortExcerpt: e.target.value })}
                className={ta}
                rows={2}
              />
            </Field>

            <Field label="Publication Status" span={3}>
              <select value={form.publicationStatus} onChange={(e) => setForm({ ...form, publicationStatus: e.target.value })} className={sel}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>

            <Field label="Active Status" span={3}>
              <select
                value={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.value })}
                className={sel}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>

            <Field label="Featured Flag" span={3}>
              <div className="flex items-center h-[46px]">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="peer sr-only" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Featured</span>
                </label>
              </div>
            </Field>

            <div className="col-span-12">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 block">
                Full Content (Rich Blocks)
              </label>
              <ContentBuilder form={{ content: form.contentBlocks }} setForm={(v) => setForm({ ...form, contentBlocks: v.content })} />
            </div>
          </div>
        </FormSection>

        {/* ── 2. Branding & Media ── */}
        <FormSection icon={ImageIcon} title="Branding & Media" description="Logos and imagery">
          <div className="grid grid-cols-12 gap-6">
            <Field label="Logo URL" span={6} hint="University logo URL">
              <input type="text" placeholder="https://..." value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className={inp} />
            </Field>

            <Field label="Cover Image URL" span={6} hint="Main banner image URL">
              <input type="text" placeholder="https://..." value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className={inp} />
            </Field>

            <div className="col-span-12">
              <DescribedList title="Gallery" descriptionKey="galleryDescription" form={form} setForm={setForm}>
                <GalleryEditor form={form} setForm={setForm} />
              </DescribedList>
            </div>
          </div>
        </FormSection>

        {/* ── 3. Ratings ── */}
        <FormSection icon={Star} title="Ratings" description="Provider ratings and scores">
          <div className="grid grid-cols-12 gap-6">
            <Field label="Average Rating" span={3}>
              <input type="number" min="0" max="5" step="0.1" value={form.averageRating} onChange={(e) => setForm({ ...form, averageRating: parseFloat(e.target.value) || 0 })} className={inp} />
            </Field>
            <Field label="Review Count" span={3}>
              <input type="number" min="0" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })} className={inp} />
            </Field>

            <div className="col-span-12">
              <p className="text-xs text-muted-foreground mb-4 uppercase font-bold tracking-widest">Rating Breakdown</p>
              <div className="grid grid-cols-4 gap-4 p-6 bg-muted/30 rounded-2xl border border-border/40">
                {Object.keys(EMPTY_FORM.ratingBreakdown).map((k) => (
                  <Field key={k} label={k.replace(/([A-Z])/g, ' $1')} span={1}>
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
          </div>
        </FormSection>

        {/* ── 4. Admissions ── */}
        <FormSection icon={ClipboardList} title="Admissions" description="Admission status and details">
          <div className="grid grid-cols-12 gap-6">
            <Field label="Admissions Open" span={2}>
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

            <Field label="Admission Year" span={2} hint='e.g. "2025"'>
              <input type="text" placeholder="2025" value={form.admissionOpen.year} onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, year: e.target.value } })} className={inp} />
            </Field>

            <Field label="Admission CTA Text" span={8} hint="Banner message">
              <input
                type="text"
                placeholder="e.g. Applications are open for 2025..."
                value={form.admissionOpen.text}
                onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, text: e.target.value } })}
                className={inp}
              />
            </Field>

            <div className="col-span-12">
              <DescribedList title="Admission Details" descriptionKey="admissionOpenDescription" form={form} setForm={setForm} />
            </div>
          </div>
        </FormSection>

        {/* ── 5. Detailed Content Sections ── */}
        <div className="space-y-8">
          <DescribedList title="Approvals" descriptionKey="approvalsDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="approvals"
              form={form} setForm={setForm}
              fields={[{ key: "name", label: "Approving Body" }, { key: "logo", label: "Logo URL" }]}
              template={{ name: "", logo: "" }}
              addLabel="Add Approval"
            />
          </DescribedList>

          <DescribedList title="Rankings" descriptionKey="rankingsDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="rankings"
              form={form} setForm={setForm}
              fields={[{ key: "title", label: "Ranking Title" }, { key: "description", label: "Description" }]}
              template={{ title: "", description: "" }}
              addLabel="Add Ranking"
            />
          </DescribedList>

          <DescribedList title="Facts" descriptionKey="factsDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="facts"
              form={form} setForm={setForm}
              fields={[{ key: "icon", label: "Icon Name/URL" }, { key: "text", label: "Fact Text" }]}
              template={{ icon: "", text: "" }}
              addLabel="Add Fact"
            />
          </DescribedList>

          <FormSection title="Campuses" icon={MapPin} description="Geographical locations">
            <ArrayEditor
              fieldName="campuses"
              form={form} setForm={setForm}
              fields={[{ key: "city", label: "City" }, { key: "state", label: "State" }, { key: "country", label: "Country" }]}
              template={{ city: "", state: "", country: "" }}
              addLabel="Add Campus"
            />
          </FormSection>

          <DescribedList title="Placement Partners" descriptionKey="placementPartnersDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="placementPartners"
              form={form} setForm={setForm}
              fields={[{ key: "name", label: "Company Name" }, { key: "logo", label: "Logo URL" }]}
              template={{ name: "", logo: "" }}
              addLabel="Add Placement Partner"
            />
          </DescribedList>

          <DescribedList title="Scholarships" descriptionKey="scholarshipDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="scholarships"
              form={form} setForm={setForm}
              fields={[{ key: "category", label: "Category" }, { key: "scholarshipCredit", label: "Credit/Amount" }, { key: "eligibility", label: "Eligibility" }]}
              template={{ category: "", scholarshipCredit: "", eligibility: "" }}
              addLabel="Add Scholarship"
            />
          </DescribedList>

          <FormSection title="FAQ" icon={HelpCircle} description="Frequently asked questions">
            <ArrayEditor
              fieldName="faq"
              form={form} setForm={setForm}
              fields={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer" }]}
              template={{ question: "", answer: "" }}
              addLabel="Add FAQ"
            />
          </FormSection>
        </div>

        {/* ── 6. Certification ── */}
        <FormSection icon={Award} title="Certification" description="Sample certificate details">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <InlineLabel>Certificate Description</InlineLabel>
              <TextBlock
                value={form.sampleCertificateDescription}
                onChange={(val) => setForm({ ...form, sampleCertificateDescription: val })}
              />
            </div>
            <Field label="Sample Certificate Image URL" span={12} hint="URL to high-res sample certificate">
              <input type="text" placeholder="https://..." value={form.sampleCertificateImage} onChange={(e) => setForm({ ...form, sampleCertificateImage: e.target.value })} className={inp} />
            </Field>
          </div>
        </FormSection>

        {/* ── 7. SEO ── */}
        <FormSection icon={Search} title="SEO" description="Search engine optimization metadata">
          <div className="grid grid-cols-12 gap-6">
            <Field label="Meta Title" span={6} hint="Ideal: 50–60 chars">
              <input type="text" placeholder="Page title..." value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inp} />
            </Field>

            <Field label="Meta Keywords" span={6} hint="Comma-separated tags">
              <input type="text" placeholder="keywords..." value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} className={inp} />
            </Field>

            <Field label="Meta Description" span={12} hint="Ideal: 150–160 chars">
              <textarea placeholder="Snippet shown in search results..." value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={ta} rows={2} />
            </Field>

            <Field label="Canonical URL" span={12} hint="Avoid duplicate content issues">
              <input type="text" placeholder="https://yourdomain.com/providers/..." value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} className={inp} />
            </Field>
          </div>
        </FormSection>

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
      const res = await callApi("/api/admin/providers", { cache: "no-store", auth: true });
      if (res.ok) {
        setProviders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Provider name is required!");
    setLoading(true);
    await callApi("/api/admin/providers", { method: "POST", auth: true, body: form });
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
      shortExcerpt: item.shortExcerpt || "",
      contentBlocks: item.contentBlocks || [],
      logo: item.logo || "",
      coverImage: item.coverImage || "",
      galleryDescription: item.galleryDescription || null,
      galleryImages: item.galleryImages || [],
      isFeatured: item.isFeatured || false,
      isActive: item.isActive === true ? "active" : item.isActive === false ? "inactive" : (item.isActive || "active"),
      publicationStatus: item.publicationStatus || "draft",
      type: item.type || "University",
      averageRating: item.averageRating || 0,
      reviewCount: item.reviewCount || 0,
      ratingBreakdown: item.ratingBreakdown || { averageRating: 0, digitalInfrastructure: 0, curriculum: 0, valueForMoney: 0 },
      scholarshipDescription: item.scholarshipDescription || null,
      scholarships: item.scholarships || [],
      approvalsDescription: item.approvalsDescription || null,
      approvals: item.approvals || [],
      rankingsDescription: item.rankingsDescription || null,
      rankings: item.rankings || [],
      factsDescription: item.factsDescription || null,
      facts: item.facts || [],
      campuses: item.campuses || [],
      placementPartnersDescription: item.placementPartnersDescription || null,
      placementPartners: item.placementPartners || [],
      faq: item.faq || [],
      sampleCertificateDescription: item.sampleCertificateDescription || null,
      sampleCertificateImage: item.sampleCertificateImage || "",
      admissionOpen: item.admissionOpen || { isOpen: false, year: "", text: "", description: null },
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
    await callApi(`/api/admin/providers/${editingId}`, { method: "PUT", auth: true, body: form });
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoading(false);
    fetchProviders();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this provider? This action cannot be undone.")) return;
    await callApi(`/api/admin/providers/${id}`, { method: "DELETE", auth: true });
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

        {/* ── Forms ── */}
        {showForm && !editingId && (
          <div className="mb-8">
            <ProviderForm
              form={form} setForm={setForm}
              onSubmit={handleCreate}
              loading={loading}
              submitLabel="Create Provider"
              onCancel={() => { setShowForm(false); setForm(EMPTY_FORM); }}
            />
          </div>
        )}

        {editingId && (
          <div className="mb-8">
            <ProviderForm
              form={form} setForm={setForm}
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
              <div className="mb-4 flex items-center justify-center">
                <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
                  <Building2 className="w-8 h-8 text-muted-foreground/60" />
                </span>
              </div>
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
                          <span className="flex items-center justify-center w-6 h-6 bg-amber-500/10 rounded-full text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-6 h-6 text-muted-foreground/20">
                            <Star className="w-3.5 h-3.5" />
                          </span>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.isActive === "active" || item.isActive === true
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border/50"
                          }`}>
                          {item.isActive === "active" || item.isActive === true ? "Active" : "Inactive"}
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

