"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
import ContentBuilder from "../components/ContentBuilder";
import TextBlock from "../components/TextBlock";

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
  averageRating: 0,
  scholarshipDescription: null,
  scholarships: [],
  approvalsDescription: null,
  approvals: [],
  rankingsDescription: null,
  rankings: [],
  factsDescription: null,
  facts: [],
  placementPartnersDescription: null,
  placementPartners: [],
  faq: [],
  sampleCertificateDescription: null,
  sampleCertificateImage: "",
  admissionOpen: { isOpen: false, year: "", text: "", description: null },
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const inp =
  "border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 w-full placeholder-slate-300 transition-shadow";
const sel =
  "border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 w-full transition-shadow";
const ta =
  "border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 w-full resize-none placeholder-slate-300 transition-shadow";

// ─── Layout Primitives ────────────────────────────────────────────────────────

/** A titled, card-style section with a left accent bar */
function FormSection({ icon, title, description, children, accent = "slate" }) {
  const accentColors = {
    slate: "bg-slate-700",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className={`w-1 h-8 rounded-full ${accentColors[accent]}`} />
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-base">{icon}</span>}
            <h3 className="text-sm font-bold text-slate-700 tracking-tight">{title}</h3>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {/* Section body */}
      <div className="p-5">{children}</div>
    </div>
  );
}

// Map span numbers to static Tailwind col-span classes (must be static for Tailwind to include them)
const COL_SPAN = {
  1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
  5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
  9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
};

/** Labeled form field wrapper */
function Field({ label, children, span = 1, hint, required }) {
  return (
    <div className={`flex flex-col gap-1.5 ${COL_SPAN[span] || "col-span-1"}`}>
      <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-400 text-[10px]">*</span>}
      </label>
      {children}
      {hint && <span className="text-[11px] text-slate-400 leading-tight">{hint}</span>}
    </div>
  );
}

/** Inline label for compact fields inside array editors */
function InlineLabel({ children }) {
  return (
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
      {children}
    </label>
  );
}

// ─── Array Item Shell ─────────────────────────────────────────────────────────

function ItemCard({ index, label, onRemove, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label} #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[11px] font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** Dashed add-item button */
function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all"
    >
      + {label}
    </button>
  );
}

// ─── Specialised Editors ──────────────────────────────────────────────────────

function FactsEditor({ form, setForm }) {
  const items = form.facts || [];
  const add = () => setForm({ ...form, facts: [...items, { icon: "", text: "" }] });
  const remove = (i) => setForm({ ...form, facts: items.filter((_, idx) => idx !== i) });
  const update = (i, key, val) => {
    const arr = [...items];
    arr[i] = { ...arr[i], [key]: val };
    setForm({ ...form, facts: arr });
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <ItemCard key={i} index={i} label="Fact" onRemove={() => remove(i)}>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3">
              <InlineLabel>Icon URL</InlineLabel>
              <input
                type="text"
                placeholder="https://cdn.../icon.svg"
                value={item.icon || ""}
                onChange={(e) => update(i, "icon", e.target.value)}
                className={inp}
              />
            </div>
            <div className="col-span-9">
              <InlineLabel>Fact Description</InlineLabel>
              <TextBlock value={item.text} onChange={(val) => update(i, "text", val)} />
            </div>
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={add} label="Add Key Fact" />
    </div>
  );
}

function ArrayEditor({ fieldName, form, setForm, fields, template, addLabel, singular }) {
  const items = form[fieldName] || [];
  const add = () => setForm({ ...form, [fieldName]: [...items, { ...template }] });
  const remove = (i) => setForm({ ...form, [fieldName]: items.filter((_, idx) => idx !== i) });
  const update = (i, key, val) => {
    const arr = [...items];
    arr[i] = { ...arr[i], [key]: val };
    setForm({ ...form, [fieldName]: arr });
  };

  const defaultColSpan = fields.length === 1 ? 12 : fields.length === 2 ? 6 : fields.length === 3 ? 4 : 3;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <ItemCard key={i} index={i} label={singular || addLabel} onRemove={() => remove(i)}>
          <div className="grid grid-cols-12 gap-3">
            {fields.map((f) => (
              <div key={f.key} className={COL_SPAN[f.span || defaultColSpan] || "col-span-6"}>
                <InlineLabel>{f.label}</InlineLabel>
                {f.type === "textarea" ? (
                  <textarea
                    placeholder={f.placeholder || f.label}
                    value={item[f.key] || ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={ta}
                    rows={2}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={f.placeholder || f.label}
                    value={item[f.key] || ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={inp}
                  />
                )}
              </div>
            ))}
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={add} label={addLabel} />
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
    <div className="space-y-2">
      {images.map((img, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-xs text-slate-400 font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
          <input
            type="text"
            placeholder={`https://cdn.../gallery-image-${i + 1}.jpg`}
            value={img}
            onChange={(e) => update(i, e.target.value)}
            className={inp}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ))}
      <AddButton onClick={add} label="Add Gallery Image URL" />
    </div>
  );
}

// ─── Description + List combo ─────────────────────────────────────────────────

function DescribedList({ descriptionLabel, descriptionKey, form, setForm, children }) {
  return (
    <div className="space-y-4">
      <div>
        <InlineLabel>{descriptionLabel}</InlineLabel>
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
    <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
            {isEdit ? "✏️" : "➕"}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {isEdit ? "Edit Provider" : "New Provider"}
            </p>
            <p className="text-slate-400 text-xs">
              {isEdit ? "Update an existing learning provider" : "Add a university, edtech platform, or institution"}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="bg-slate-50 p-6 space-y-5">

        {/* ── 1. Identity ── */}
        <FormSection icon="🏫" title="Identity" description="Core identification fields shown across the platform" accent="slate">
          <div className="grid grid-cols-12 gap-4">

            <Field label="Provider Name" span={12} required hint="Full official name, e.g. Amity University Online">
              <div className="col-span-6">
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
              </div>
            </Field>

            <div className="col-span-12 grid grid-cols-12 gap-4">
              <Field label="URL Slug" span={6} required hint="Auto-generated from name. Must be unique across all providers.">
                <input
                  type="text"
                  placeholder="amity-university-online"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  className={inp + " font-mono text-xs bg-slate-50"}
                />
              </Field>

              <div className="col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status & Settings</label>
                <div className="flex items-center gap-3 h-[38px]">
                  <select
                    value={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value })}
                    className={sel + " w-32"}
                  >
                    <option value="active">🟢 Active</option>
                    <option value="inactive">⚪ Inactive</option>
                  </select>

                  <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <span className="text-amber-400 text-xs font-bold">★</span>
                    <input
                      type="number" step="0.1" min="0" max="5"
                      placeholder="0.0"
                      value={form.averageRating}
                      onChange={(e) => setForm({ ...form, averageRating: e.target.value })}
                      className="w-10 bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
                    />
                    <span className="text-slate-300 text-xs">/5</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg px-3 py-2 hover:bg-amber-50 hover:border-amber-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-amber-400"
                    />
                    ⭐ Featured
                  </label>
                </div>
              </div>
            </div>

            <div className="col-span-12">
              <Field label="Short Excerpt" hint="2–3 sentences shown on listing cards and search results">
                <textarea
                  placeholder="A concise description of this provider. E.g. Amity University Online offers UGC-entitled degrees with flexible learning across 50+ programs."
                  value={form.shortExcerpt}
                  onChange={(e) => setForm({ ...form, shortExcerpt: e.target.value })}
                  className={ta}
                  rows={2}
                />
              </Field>
            </div>

            <div className="col-span-12">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                Full Content <span className="normal-case font-normal text-slate-400">(rich content blocks for the provider detail page)</span>
              </label>
              <ContentBuilder form={{ content: form.contentBlocks }} setForm={(v) => setForm({ ...form, contentBlocks: v.content })} />
            </div>
          </div>
        </FormSection>

        {/* ── 2. Branding & Media ── */}
        <FormSection icon="🖼️" title="Branding & Media" description="Logos, banners, and gallery images displayed on the provider page" accent="blue">
          <div className="space-y-5">
            <div className="grid grid-cols-12 gap-4">
              <Field label="Logo URL" span={6} hint="Square PNG/SVG used in headers, cards, and listings">
                <input
                  type="text"
                  placeholder="https://cdn.yourdomain.com/logos/amity-logo.png"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  className={inp}
                />
              </Field>
              <Field label="Cover / Banner Image URL" span={6} hint="Wide banner shown at the top of the provider page (1200×400px recommended)">
                <input
                  type="text"
                  placeholder="https://cdn.yourdomain.com/banners/amity-cover.jpg"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className={inp}
                />
              </Field>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                Gallery Images <span className="normal-case font-normal text-slate-400">({(form.galleryImages || []).length} added)</span>
              </label>
              <GalleryEditor form={form} setForm={setForm} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Gallery Description</label>
              <TextBlock value={form.galleryDescription} onChange={(val) => setForm({ ...form, galleryDescription: val })} />
            </div>
          </div>
        </FormSection>

        {/* ── 3. Admissions ── */}
        <FormSection icon="📋" title="Admissions" description="Controls the admission open banner and call-to-action displayed on the provider page" accent="emerald">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.admissionOpen.isOpen}
                  onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, isOpen: e.target.checked } })}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                Mark admissions as currently open
              </label>
              <span className="text-xs text-slate-400">— enables the "Admission Open" badge on the provider card</span>
            </div>

            <Field label="Admission Year" span={3} hint='The intake year, e.g. "2025"'>
              <input
                type="text"
                placeholder="2025"
                value={form.admissionOpen.year}
                onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, year: e.target.value } })}
                className={inp}
              />
            </Field>

            <Field label="Admission CTA Text" span={9} hint="Short message shown on the admission banner">
              <input
                type="text"
                placeholder="Applications are open for the 2025–26 academic batch. Apply before March 31."
                value={form.admissionOpen.text}
                onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, text: e.target.value } })}
                className={inp}
              />
            </Field>

            <div className="col-span-12">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Admission Description</label>
              <TextBlock
                value={form.admissionOpen.description}
                onChange={(val) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, description: val } })}
              />
            </div>
          </div>
        </FormSection>

        {/* ── 4. Approvals & Accreditations ── */}
        <FormSection icon="✅" title="Approvals & Accreditations" description="Regulatory bodies and accreditation bodies (e.g. UGC, AICTE, NAAC)" accent="violet">
          <DescribedList descriptionLabel="Approvals Section Description" descriptionKey="approvalsDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="approvals"
              form={form} setForm={setForm}
              fields={[
                { key: "name", label: "Body Name", placeholder: "e.g. UGC, AICTE, NAAC, AIU", span: 6 },
                { key: "logo", label: "Logo URL", placeholder: "https://cdn.../ugc-logo.png", span: 6 },
              ]}
              template={{ name: "", logo: "" }}
              addLabel="Add Approval / Accreditation"
              singular="Approval"
            />
          </DescribedList>
        </FormSection>

        {/* ── 5. Rankings ── */}
        <FormSection icon="🏆" title="Rankings" description="National and international rankings from recognised bodies (e.g. NIRF, QS, Times)" accent="amber">
          <DescribedList descriptionLabel="Rankings Section Description" descriptionKey="rankingsDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="rankings"
              form={form} setForm={setForm}
              fields={[
                { key: "title", label: "Ranking Title", placeholder: "e.g. NIRF Rank #12 (2024), QS World #800", span: 5 },
                { key: "description", label: "Additional Details", placeholder: "e.g. Among top private universities in India", span: 7, type: "textarea" },
              ]}
              template={{ title: "", description: "" }}
              addLabel="Add Ranking"
              singular="Ranking"
            />
          </DescribedList>
        </FormSection>

        {/* ── 6. Key Facts ── */}
        <FormSection icon="📌" title="Key Facts" description="Highlight statistics and standout facts shown in the info panel (e.g. 30+ years experience, 2 lakh+ alumni)" accent="blue">
          <DescribedList descriptionLabel="Facts Section Description" descriptionKey="factsDescription" form={form} setForm={setForm}>
            <FactsEditor form={form} setForm={setForm} />
          </DescribedList>
        </FormSection>

        {/* ── 7. Placement Partners ── */}
        <FormSection icon="🤝" title="Placement Partners" description="Recruiters and companies that hire graduates from this provider" accent="emerald">
          <DescribedList descriptionLabel="Placement Partners Section Description" descriptionKey="placementPartnersDescription" form={form} setForm={setForm}>
            <ArrayEditor
              fieldName="placementPartners"
              form={form} setForm={setForm}
              fields={[
                { key: "name", label: "Company Name", placeholder: "e.g. TCS, Infosys, Wipro, Amazon", span: 6 },
                { key: "logo", label: "Logo URL", placeholder: "https://cdn.../tcs-logo.png", span: 6 },
              ]}
              template={{ name: "", logo: "" }}
              addLabel="Add Placement Partner"
              singular="Partner"
            />
          </DescribedList>
        </FormSection>

        {/* ── 8. Scholarships ── */}
        <FormSection icon="🎓" title="Scholarships" description="Available scholarship programs and financial aid options" accent="violet">
          <div className="space-y-4">
            <div>
              <InlineLabel>Scholarships Section Description</InlineLabel>
              <TextBlock value={form.scholarshipDescription} onChange={(val) => setForm({ ...form, scholarshipDescription: val })} />
            </div>
            <ArrayEditor
              fieldName="scholarships"
              form={form} setForm={setForm}
              fields={[
                { key: "category", label: "Scholarship Category", placeholder: "e.g. Merit-Based, Need-Based, SC/ST", span: 4 },
                { key: "scholarshipCredit", label: "Credit / Amount", placeholder: "e.g. Up to ₹50,000 fee waiver", span: 4 },
                { key: "eligibility", label: "Eligibility Criteria", placeholder: "e.g. 80%+ in 12th, income < ₹8L/yr", span: 4 },
              ]}
              template={{ category: "", scholarshipCredit: "", eligibility: "" }}
              addLabel="Add Scholarship"
              singular="Scholarship"
            />
          </div>
        </FormSection>

        {/* ── 9. Sample Certificate ── */}
        <FormSection icon="📜" title="Sample Certificate" description="Preview image of the degree / certificate issued upon course completion" accent="slate">
          <div className="space-y-4">
            <div>
              <InlineLabel>Certificate Section Description</InlineLabel>
              <TextBlock value={form.sampleCertificateDescription} onChange={(val) => setForm({ ...form, sampleCertificateDescription: val })} />
            </div>
            <Field label="Certificate Image URL" hint="High-res image of the sample certificate (1200×850px recommended)">
              <input
                type="text"
                placeholder="https://cdn.yourdomain.com/certificates/amity-sample-cert.jpg"
                value={form.sampleCertificateImage}
                onChange={(e) => setForm({ ...form, sampleCertificateImage: e.target.value })}
                className={inp}
              />
            </Field>
          </div>
        </FormSection>

        {/* ── 10. FAQ ── */}
        <FormSection icon="💬" title="FAQ" description="Frequently asked questions shown in the FAQ accordion on the provider page" accent="rose">
          <ArrayEditor
            fieldName="faq"
            form={form} setForm={setForm}
            fields={[
              { key: "question", label: "Question", placeholder: "e.g. Is the degree UGC-recognised?", span: 12 },
              { key: "answer", label: "Answer", placeholder: "e.g. Yes, all programs offered by Amity University Online are UGC-entitled and recognised by the Association of Indian Universities (AIU).", span: 12, type: "textarea" },
            ]}
            template={{ question: "", answer: "" }}
            addLabel="Add FAQ"
            singular="FAQ"
          />
        </FormSection>

        {/* ── 11. SEO ── */}
        <FormSection icon="🔍" title="SEO & Metadata" description="Fields used by search engines to index and rank this provider page" accent="slate">
          <div className="grid grid-cols-12 gap-4">
            <Field label="Meta Title" span={7} hint="Ideal length: 50–60 characters. Shown as the browser tab title and search result heading.">
              <input
                type="text"
                placeholder="Amity University Online – UGC-Recognised Online Degrees | YourSite"
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className={inp}
              />
            </Field>

            <Field label="Meta Keywords" span={5} hint="Comma-separated. E.g. online MBA, distance learning, UGC approved">
              <input
                type="text"
                placeholder="amity university online, online mba, ugc approved distance learning"
                value={form.metaKeywords}
                onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                className={inp}
              />
            </Field>

            <Field label="Meta Description" span={12} hint="Ideal length: 150–160 characters. Shown as the snippet in search results.">
              <textarea
                placeholder="Explore UGC-recognised online degrees from Amity University Online. 50+ programs in management, technology, and more. Flexible, industry-aligned learning."
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className={ta}
                rows={2}
              />
            </Field>

            <Field label="Canonical URL" span={12} hint="Full URL to avoid duplicate content issues. Leave blank to use the default page URL.">
              <input
                type="text"
                placeholder="https://yourdomain.com/providers/amity-university-online"
                value={form.canonicalUrl}
                onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                className={inp}
              />
            </Field>
          </div>
        </FormSection>

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Saving…" : submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
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

  const fetchProviders = async () => {
    try {
      setFetchLoading(true);
      const res = await callApi("/api/admin/providers", { cache: "no-store", auth: true });
      if (res.ok) {
        const data = await res.json();
        setProviders(Array.isArray(data) ? data : []);
      } else {
        setProviders([]);
      }
    } catch (err) {
      console.error(err);
      setProviders([]);
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
      isActive: item.isActive || "active",
      averageRating: item.averageRating || 0,
      scholarshipDescription: item.scholarshipDescription || null,
      scholarships: item.scholarships || [],
      approvalsDescription: item.approvalsDescription || null,
      approvals: item.approvals || [],
      rankingsDescription: item.rankingsDescription || null,
      rankings: item.rankings || [],
      factsDescription: item.factsDescription || null,
      facts: item.facts || [],
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
    if (!form.name.trim()) return alert("Provider name is required!");
    setLoading(true);
    await callApi(`/api/admin/providers/${editingId}`, { method: "PUT", auth: true, body: form });
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoading(false);
    fetchProviders();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this provider? This action cannot be undone.")) return;
    await fetch(`/api/admin/providers/${id}`, { method: "DELETE" });
    fetchProviders();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Providers</h1>
            <p className="text-sm text-slate-400 mt-1">Manage universities, edtech platforms, and learning providers</p>
          </div>
          {!editingId && (
            <button
              onClick={() => { setShowForm((v) => !v); setForm(EMPTY_FORM); }}
              className="px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
            >
              {showForm ? "✕ Close" : "+ New Provider"}
            </button>
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

        {/* ── Providers Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-700">All Providers</span>
              <span className="text-xs text-slate-400 ml-2">({providers.length} total)</span>
            </div>
          </div>

          {fetchLoading ? (
            <div className="p-16 text-center text-sm text-slate-400">Loading providers…</div>
          ) : providers.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <p className="text-2xl">🏫</p>
              <p className="text-slate-500 text-sm font-semibold">No providers yet</p>
              <p className="text-slate-400 text-xs">Click "+ New Provider" to add your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Provider", "Slug", "Rating", "Featured", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {providers.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                        {item.shortExcerpt && (
                          <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{item.shortExcerpt}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[180px] truncate">/{item.slug}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-xs font-bold">★</span>
                          <span className="text-slate-700 font-semibold text-xs">{item.averageRating || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={item.isFeatured ? "text-amber-400 text-base" : "text-slate-200 text-base"}>
                          ★
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${item.isActive === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {item.isActive === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
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
    </div>
  );
}