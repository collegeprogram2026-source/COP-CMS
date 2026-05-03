"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";
import ContentBuilder from "../components/ContentBuilder";
import TextBlock from "../components/TextBlock";
import ImageUploader from "../components/ImageUploader";
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
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  ChevronRight,
  Scale,
  AlertTriangle,
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
  bestROI: false,
  trending: false,
  isActive: "active",
  publicationStatus: "draft",
  averageRating: 0,
  reviewCount: 0,
  ratingBreakdown: {
    averageRating: 0,
    digitalInfrastructure: 0,
    curriculum: 0,
    valueForMoney: 0,
  },
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
  sampleCertificateDescription: null,
  sampleCertificateImage: "",
  whoShouldChoosePoints: [],
  admissionOpen: { isOpen: false, year: "", text: "", description: null },
  admissionOpenDescription: null,
  comparison: {
    location: "",
    feesStartingFrom: "",
    duration: "",
    intakePeriod: "",
    timeCommitment: "",
    totalSeatsAvailable: "",
    overallRating: "",
    accreditation: "",
    placementRate: "",
    averageSalary: "",
    eligibility: "",
    minimumRequirements: "",
    ugcDebStatus: false,
    naacGrade: "",
    examType: "",
    roiScore: "",
  },
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const inp =
  "w-full border border-border/60 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary/70 focus:border-primary/60 transition-all outline-none text-sm text-foreground bg-background/80 placeholder:text-muted-foreground/40 dark:bg-zinc-900/60 dark:border-zinc-700/60 dark:focus:border-primary/50";
const sel =
  "w-full border border-border/60 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/60 transition-all outline-none bg-card dark:bg-zinc-900/60 dark:border-zinc-700/60 text-foreground";
const ta =
  "w-full border border-border/60 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/60 transition-all outline-none resize-none bg-background/80 placeholder:text-muted-foreground/40 dark:bg-zinc-900/60 dark:border-zinc-700/60";

// ─── Layout Primitives ────────────────────────────────────────────────────────

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{title}</h3>
      {count !== undefined && (
        <span className="text-xs bg-primary/10 text-primary font-bold rounded-full px-2.5 py-0.5 border border-primary/20">{count}</span>
      )}
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-card dark:bg-zinc-900/40 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-sm dark:shadow-zinc-950/40 overflow-hidden mb-8">
      <div className="flex items-center gap-3 px-8 py-5 border-b border-border/40 dark:border-zinc-800/60 bg-muted/30 dark:bg-zinc-800/20">
        {Icon && (
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary ring-1 ring-primary/20">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
          {description && <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>}
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
    <div className={`flex flex-col gap-1.5 ${COL_SPAN[span] || "col-span-1"}`}>
      <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground/50 leading-tight">{hint}</span>}
    </div>
  );
}

function InlineLabel({ children }) {
  return (
    <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-2 block">
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
          <div key={i} className="flex gap-4 items-start p-4 bg-muted/20 dark:bg-zinc-800/30 rounded-xl border border-border/40 dark:border-zinc-700/40">
            <div className="flex-1 grid grid-cols-3 gap-4">
              {fields.map((f) => (
                f.type === "image" ? (
                  <div key={f.key} className="col-span-1">
                    <ImageUploader
                      label={f.label}
                      value={item[f.key] || ""}
                      onChange={(url) => update(i, f.key, url)}
                      folder="cop/providers"
                    />
                  </div>
                ) : (
                  <input
                    key={f.key}
                    type="text"
                    placeholder={f.label}
                    value={item[f.key] || ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={inp + " col-span-1"}
                  />
                )
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              className="mt-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary border-2 border-dashed border-border/40 dark:border-zinc-700/50 rounded-xl px-4 py-3 w-full hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <Plus className="w-4 h-4" /> {addLabel || `Add ${singular || "Item"}`}
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
          <div key={i} className="flex gap-3 items-start group">
            <div className="flex-1">
              <ImageUploader
                value={img}
                onChange={(url) => update(i, url)}
                folder="cop/providers/gallery"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors mt-1.5"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary border-2 border-dashed border-border/40 dark:border-zinc-700/50 rounded-xl px-4 py-3 w-full hover:border-primary/40 hover:bg-primary/5 transition-all col-span-full"
        >
          <Plus className="w-4 h-4" /> Add Image URL
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
        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-2 block">
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

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center h-[46px]">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center">
          <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
          <div className="w-11 h-6 bg-muted dark:bg-zinc-700/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
        </div>
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</span>
      </label>
    </div>
  );
}

// ─── Main Provider Form ───────────────────────────────────────────────────────

function ProviderForm({ form, setForm, onSubmit, loading, submitLabel, onCancel }) {
  const isEdit = submitLabel === "Update Provider";

  return (
    <div className="bg-card dark:bg-zinc-900/50 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-lg dark:shadow-zinc-950/60 overflow-hidden">
      {/* Form header */}
      <div className="bg-primary dark:bg-primary/90 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEdit ? <Pencil className="w-4 h-4 text-primary-foreground/80" /> : <Plus className="w-4 h-4 text-primary-foreground/80" />}
          <h2 className="text-primary-foreground font-bold tracking-tight">{isEdit ? "Edit Provider" : "Create New Provider"}</h2>
        </div>
        {onCancel && (
          <Button variant="ghost" size="icon" type="button" onClick={onCancel} className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10 transition-colors rounded-lg">
            <X className="w-5 h-5" />
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
                className={inp + " font-mono dark:bg-zinc-950/60"}
              />
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
              <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value })} className={sel}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>

            <Field label="Featured Flag" span={2}>
              <Toggle
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                label="Featured"
              />
            </Field>

            <Field label="Best ROI" span={2}>
              <Toggle
                checked={form.bestROI}
                onChange={(e) => setForm({ ...form, bestROI: e.target.checked })}
                label="Best ROI"
              />
            </Field>

            <Field label="Trending" span={2}>
              <Toggle
                checked={form.trending}
                onChange={(e) => setForm({ ...form, trending: e.target.checked })}
                label="Trending"
              />
            </Field>

            <div className="col-span-12">
              <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-2 block">
                Full Content (Rich Blocks)
              </label>
              <ContentBuilder form={{ content: form.contentBlocks }} setForm={(v) => setForm({ ...form, contentBlocks: v.content })} />
            </div>
          </div>
        </FormSection>

        {/* ── 2. Branding & Media ── */}
        <FormSection icon={ImageIcon} title="Branding & Media" description="Logos and imagery">
          <div className="grid grid-cols-12 gap-6">
            <Field label="Logo" span={6} hint="University logo">
              <ImageUploader value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} folder="cop/providers/logos" />
            </Field>

            <Field label="Cover Image" span={6} hint="Main banner image">
              <ImageUploader value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} folder="cop/providers/covers" />
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
              <p className="text-[10px] text-muted-foreground/60 mb-4 uppercase font-bold tracking-widest">Rating Breakdown</p>
              <div className="grid grid-cols-4 gap-4 p-6 bg-muted/20 dark:bg-zinc-800/20 rounded-2xl border border-border/40 dark:border-zinc-700/40">
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

        {/* ── 3.5 Comparison ── */}
        <FormSection icon={Scale} title="Comparison" description="Key data points used to compare this provider against others">
          <div className="grid grid-cols-12 gap-6">
            <Field label="Location" span={6} hint='e.g. "Noida, India"'>
              <input
                type="text"
                placeholder="City, Country"
                value={form.comparison?.location || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, location: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="Fees Starting From" span={3} hint="Numeric value (e.g. 250000)">
              <input
                type="number"
                min="0"
                placeholder="250000"
                value={form.comparison?.feesStartingFrom ?? ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, feesStartingFrom: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 } })}
                className={inp}
              />
            </Field>

            <Field label="Duration" span={3} hint='e.g. "2 years"'>
              <input
                type="text"
                placeholder="2 years"
                value={form.comparison?.duration || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, duration: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="Intake Period" span={4} hint='e.g. "Jan & Jul"'>
              <input
                type="text"
                placeholder="Jan & Jul"
                value={form.comparison?.intakePeriod || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, intakePeriod: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="Time Commitment" span={4} hint='e.g. "15-20 hrs/week"'>
              <input
                type="text"
                placeholder="15-20 hrs/week"
                value={form.comparison?.timeCommitment || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, timeCommitment: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="Total Seats Available" span={4}>
              <input
                type="number"
                min="0"
                placeholder="500"
                value={form.comparison?.totalSeatsAvailable ?? ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, totalSeatsAvailable: e.target.value === "" ? "" : parseInt(e.target.value) || 0 } })}
                className={inp}
              />
            </Field>

            <Field label="Overall Rating" span={3} hint="Out of 5">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
                value={form.comparison?.overallRating ?? ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, overallRating: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 } })}
                className={inp}
              />
            </Field>

            <Field label="Placement Rate" span={3} hint="Percentage (0-100)">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="85"
                value={form.comparison?.placementRate ?? ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, placementRate: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 } })}
                className={inp}
              />
            </Field>

            <Field label="Average Salary" span={6} hint="Numeric (annual CTC)">
              <input
                type="number"
                min="0"
                placeholder="800000"
                value={form.comparison?.averageSalary ?? ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, averageSalary: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 } })}
                className={inp}
              />
            </Field>

            <Field label="Accreditation" span={12} hint='e.g. "UGC, AICTE, NAAC A+"'>
              <input
                type="text"
                placeholder="UGC, AICTE, NAAC A+"
                value={form.comparison?.accreditation || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, accreditation: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="UGC-DEB Status" span={6} hint="Approved status">
              <div className="flex items-center gap-4 h-12">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.comparison?.ugcDebStatus === true}
                    onChange={() => setForm({ ...form, comparison: { ...form.comparison, ugcDebStatus: true } })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-medium">Approved</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.comparison?.ugcDebStatus === false}
                    onChange={() => setForm({ ...form, comparison: { ...form.comparison, ugcDebStatus: false } })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-medium">Not Approved</span>
                </label>
              </div>
            </Field>

            <Field label="NAAC Grade" span={6} hint='e.g. "A+"'>
              <input
                type="text"
                placeholder="A+"
                value={form.comparison?.naacGrade || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, naacGrade: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="Exam Type" span={6} hint='e.g. "Online Semester Exam"'>
              <input
                type="text"
                placeholder="Online Semester Exam"
                value={form.comparison?.examType || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, examType: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="ROI Score" span={6} hint='e.g. "4.8/5" or "High"'>
              <input
                type="text"
                placeholder="4.8/5"
                value={form.comparison?.roiScore || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, roiScore: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="Eligibility" span={6} hint="Who can apply">
              <textarea
                placeholder="e.g. Graduation in any discipline with 50%"
                value={form.comparison?.eligibility || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, eligibility: e.target.value } })}
                className={ta}
                rows={3}
              />
            </Field>

            <Field label="Minimum Requirements" span={6} hint="Academic / technical baseline">
              <textarea
                placeholder="e.g. 10+2 with Mathematics, valid entrance score"
                value={form.comparison?.minimumRequirements || ""}
                onChange={(e) => setForm({ ...form, comparison: { ...form.comparison, minimumRequirements: e.target.value } })}
                className={ta}
                rows={3}
              />
            </Field>
          </div>
        </FormSection>

        {/* ── 4. Admissions ── */}
        <FormSection icon={ClipboardList} title="Admissions" description="Admission status and details">
          <div className="grid grid-cols-12 gap-6">
            <Field label="Admissions Open" span={2}>
              <Toggle
                checked={form.admissionOpen.isOpen}
                onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, isOpen: e.target.checked } })}
                label="Yes"
              />
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
              fields={[{ key: "name", label: "Approving Body" }, { key: "logo", label: "Logo", type: "image" }]}
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
              fields={[{ key: "icon", label: "Icon", type: "image" }, { key: "text", label: "Fact Text" }]}
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
              fields={[{ key: "name", label: "Company Name" }, { key: "logo", label: "Logo", type: "image" }]}
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

          <FormSection title="Who Should Choose" icon={AlertTriangle} description="Key statements for potential students">
            <ArrayEditor
              fieldName="whoShouldChoosePoints"
              form={form} setForm={setForm}
              fields={[{ key: "text", label: "Statement / Point" }]}
              template={{ text: "" }}
              addLabel="Add Statement"
            />
          </FormSection>

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
            <Field label="Sample Certificate Image" span={12} hint="High-res sample certificate image">
              <ImageUploader value={form.sampleCertificateImage} onChange={(url) => setForm({ ...form, sampleCertificateImage: url })} folder="cop/providers/certificates" />
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

        <div className="flex items-center justify-end gap-3 pt-8 border-t border-border/40 dark:border-zinc-800/60">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all rounded-xl"
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
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {submitLabel}
              </>
            )}
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
      bestROI: item.bestROI || false,
      trending: item.trending || false,
      isActive: item.isActive === true ? "active" : item.isActive === false ? "inactive" : (item.isActive || "active"),
      publicationStatus: item.publicationStatus || "draft",
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
      whoShouldChoosePoints: item.whoShouldChoosePoints || [],
      sampleCertificateDescription: item.sampleCertificateDescription || null,
      sampleCertificateImage: item.sampleCertificateImage || "",
      admissionOpen: item.admissionOpen || { isOpen: false, year: "", text: "", description: null },
      admissionOpenDescription: item.admissionOpenDescription || null,
      comparison: {
        location: item.comparison?.location || "",
        feesStartingFrom: item.comparison?.feesStartingFrom ?? "",
        duration: item.comparison?.duration || "",
        intakePeriod: item.comparison?.intakePeriod || "",
        timeCommitment: item.comparison?.timeCommitment || "",
        totalSeatsAvailable: item.comparison?.totalSeatsAvailable ?? "",
        overallRating: item.comparison?.overallRating ?? "",
        accreditation: item.comparison?.accreditation || "",
        placementRate: item.comparison?.placementRate ?? "",
        averageSalary: item.comparison?.averageSalary ?? "",
        eligibility: item.comparison?.eligibility || "",
        minimumRequirements: item.comparison?.minimumRequirements || "",
        ugcDebStatus: item.comparison?.ugcDebStatus || false,
        naacGrade: item.comparison?.naacGrade || "",
        examType: item.comparison?.examType || "",
        roiScore: item.comparison?.roiScore || "",
      },
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

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto p-8">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary ring-1 ring-primary/20">
                <Building2 className="w-5 h-5" />
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Providers</h1>
            </div>
            <p className="text-muted-foreground/70 mt-1 ml-[52px]">Manage universities, edtech platforms, and learning providers</p>
          </div>
          {!editingId && (
            <Button
              onClick={() => { setShowForm((v) => !v); setForm(EMPTY_FORM); }}
              className="px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2 h-auto"
            >
              {showForm ? (
                <><X className="w-4 h-4" /> Close</>
              ) : (
                <><Plus className="w-4 h-4" /> New Provider</>
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
        <div className="bg-card dark:bg-zinc-900/50 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-sm dark:shadow-zinc-950/40 overflow-hidden">
          <div className="px-8 py-5 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              All Providers
            </h2>
            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/50 dark:bg-zinc-800/60 px-3 py-1 rounded-full border border-border/40 dark:border-zinc-700/40">
              {providers.length} total
            </span>
          </div>

          {fetchLoading ? (
            <div className="p-16 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary/50" />
              <p className="text-sm">Loading providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="mb-4 flex items-center justify-center">
                <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 dark:bg-zinc-800/40 border border-border/30 dark:border-zinc-700/30">
                  <Building2 className="w-8 h-8 text-muted-foreground/30" />
                </span>
              </div>
              <p className="text-base font-semibold text-foreground/70">No providers yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Create your first university or edtech platform above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/20 dark:bg-zinc-800/20 border-b border-border/40 dark:border-zinc-800/60">
                    {["S.No.", 'Name', 'Slug', 'Excerpt', 'Featured', 'Best ROI', 'Trending', 'Status', 'Active', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 dark:divide-zinc-800/50">
                  {providers.map((item, index) => (
                    <tr key={item._id} className="hover:bg-muted/20 dark:hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-muted-foreground tracking-tight">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] bg-muted/50 dark:bg-zinc-800/50 px-2 py-1 rounded-md text-muted-foreground/70 font-mono italic border border-border/30 dark:border-zinc-700/30">/{item.slug}</code>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-muted-foreground/60 text-xs max-w-[180px] truncate">{item.shortExcerpt || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        {item.isFeatured ? (
                          <span className="flex items-center justify-center w-7 h-7 bg-amber-500/10 dark:bg-amber-500/15 rounded-lg text-amber-500 border border-amber-500/20">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-7 h-7 text-muted-foreground/20">
                            <Star className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.bestROI
                          ? "bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground/50 border border-border/40 dark:border-zinc-700/40"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.bestROI ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-muted-foreground/30'}`}></span>
                          {item.bestROI ? "Best ROI" : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.trending
                          ? "bg-cyan-500/10 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20"
                          : "bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground/50 border border-border/40 dark:border-zinc-700/40"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.trending ? 'bg-cyan-500 dark:bg-cyan-400' : 'bg-muted-foreground/30'}`}></span>
                          {item.trending ? "Trending" : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.publicationStatus === "published"
                          ? "bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.publicationStatus === 'published' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}`}></span>
                          {item.publicationStatus || "draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.isActive === "active" || item.isActive === true
                          ? "bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground/50 border border-border/40 dark:border-zinc-700/40"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.isActive === "active" || item.isActive === true ? "bg-emerald-500 dark:bg-emerald-400" : "bg-muted-foreground/30"}`}></span>
                          {item.isActive === "active" || item.isActive === true ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="w-8 h-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors rounded-lg"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item._id)}
                            className="w-8 h-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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