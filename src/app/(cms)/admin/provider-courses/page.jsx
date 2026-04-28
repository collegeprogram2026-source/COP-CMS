"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
import DegreeTypeSelect from "../components/DegreeTypeSelect";
import CourseSelect from "../components/CourseSelect";
import SpecializationSelect from "../components/SpecializationSelect";
import ProviderSelect from "../components/ProviderSelect";
import ContentBuilder from "../components/ContentBuilder";
import ImageUploader from "../components/ImageUploader";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";

export default function ProviderCoursesPage() {
  const [providerCourses, setProviderCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    degreeTypeId: "",
    courseId: "",
    specializationId: "",
    providerId: "",
    title: "",
    slug: "",
    fees: "",
    discountedFees: "",
    feesBreakdown: [],
    duration: "",
    eligibility: "",
    seatsAvailable: "",
    brochureUrl: "",
    thumbnail: "",
    weeklyEffort: "",
    examPattern: "",
    employerAcceptance: "Medium",
    difficultyLevel: "Intermediate",
    approvals: [],
    highlights: [],
    contentBlocks: [],
    isActive: true,
    bestROI: false,
    trending: false,
    isEmiAvailable: false,
    emiStartingAmount: "",
    emiTerms: "",
  });

  const generateSlug = (value) =>
    value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const fetchProviderCourses = async () => {
    try {
      const res = await callApi("/api/admin/provider-courses", { cache: "no-store", auth: true });
      if (res.ok) {
        const data = await res.json();
        setProviderCourses(Array.isArray(data) ? data : []);
      } else {
        setProviderCourses([]);
      }
    } catch (err) {
      setProviderCourses([]);
    }
  };

  useEffect(() => { fetchProviderCourses(); }, []);

  const emptyForm = {
    degreeTypeId: "", courseId: "", specializationId: "", providerId: "",
    title: "", slug: "", fees: "", discountedFees: "", feesBreakdown: [],
    duration: "", eligibility: "", seatsAvailable: "", brochureUrl: "", thumbnail: "",
    weeklyEffort: "", examPattern: "", employerAcceptance: "Medium",
    difficultyLevel: "Intermediate", approvals: [], highlights: [],
    contentBlocks: [],
    isActive: true, bestROI: false, trending: false,
  };

  const buildPayload = (fd) => ({
    ...fd,
    fees: fd.fees ? Number(fd.fees) : 0,
    discountedFees: fd.discountedFees ? Number(fd.discountedFees) : 0,
    weeklyEffort: fd.weeklyEffort ? Number(fd.weeklyEffort) : undefined,
    seatsAvailable: fd.seatsAvailable ? Number(fd.seatsAvailable) : undefined,
    feesBreakdown: (fd.feesBreakdown || []).map((f) => ({ label: f.label, amount: f.amount ? Number(f.amount) : 0 })),
    approvals: (fd.approvals || []).map((s) => (s || "").trim()).filter(Boolean),
    highlights: (fd.highlights || []).map((s) => (s || "").trim()).filter(Boolean),
    contentBlocks: Array.isArray(fd.contentBlocks) ? fd.contentBlocks : [],
    isEmiAvailable: !!fd.isEmiAvailable,
    emiStartingAmount: fd.emiStartingAmount || "",
    emiTerms: fd.emiTerms || "",
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setToast({ message: "Title is required!", type: "error" });
    if (!formData.courseId || !formData.degreeTypeId) return setToast({ message: "Course & Degree Type are required!", type: "error" });
    setLoading(true);
    if (editingId) {
      await callApi(`/api/admin/provider-courses/${editingId}`, { method: "PUT", auth: true, body: buildPayload(formData) });
      setEditingId(null);
    } else {
      await callApi("/api/admin/provider-courses", { method: "POST", auth: true, body: buildPayload(formData) });
    }
    setFormData(emptyForm);
    setShowForm(false);
    setLoading(false);
    fetchProviderCourses();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      degreeTypeId: item.degreeTypeId?._id || item.degreeTypeId,
      courseId: item.courseId?._id || item.courseId,
      specializationId: item.specializationId?._id || "",
      providerId: item.providerId?._id || item.providerId || "",
      feesBreakdown: item.feesBreakdown || [],
      weeklyEffort: item.weeklyEffort || "",
      examPattern: item.examPattern || "",
      employerAcceptance: item.employerAcceptance || "Medium",
      difficultyLevel: item.difficultyLevel || "Intermediate",
      approvals: Array.isArray(item.approvals) ? item.approvals : [],
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
      contentBlocks: Array.isArray(item.contentBlocks) ? item.contentBlocks : [],
      title: item.title, slug: item.slug, fees: item.fees,
      discountedFees: item.discountedFees, duration: item.duration,
      eligibility: item.eligibility, seatsAvailable: item.seatsAvailable,
      brochureUrl: item.brochureUrl, thumbnail: item.thumbnail || "", isActive: item.isActive,
      bestROI: item.bestROI || false,
      trending: item.trending || false,
      isEmiAvailable: item.isEmiAvailable || false,
      emiStartingAmount: item.emiStartingAmount || "",
      emiTerms: item.emiTerms || "",
    });
    setShowForm(false);
  };

  const handleUpdate = async (id) => {
    if (!formData.title.trim()) return setToast({ message: "Title is required!", type: "error" });
    if (!formData.courseId || !formData.degreeTypeId) return setToast({ message: "Course & Degree Type are required!", type: "error" });
    setLoading(true);
    await callApi(`/api/admin/provider-courses/${id}`, { method: "PUT", auth: true, body: buildPayload(formData) });
    setEditingId(null);
    setLoading(false);
    fetchProviderCourses();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this provider course?")) return;
    await callApi(`/api/admin/provider-courses/${id}`, { method: "DELETE", auth: true });
    fetchProviderCourses();
  };

  /* ---------- shared input class ---------- */
  const inputCls =
    "w-full border border-zinc-200 dark:border-zinc-700/60 px-4 py-2.5 rounded-lg " +
    "focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:border-transparent " +
    "transition-all outline-none bg-white dark:bg-zinc-800/70 " +
    "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 " +
    "text-sm";

  const selectCls =
    "w-full border border-zinc-200 dark:border-zinc-700/60 px-4 py-2.5 rounded-lg " +
    "focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:border-transparent " +
    "transition-all outline-none bg-white dark:bg-zinc-800/70 " +
    "text-zinc-900 dark:text-zinc-100 text-sm";

  return (
    <div className="max-w-7xl mx-auto p-8 text-zinc-900 dark:text-zinc-100">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Provider Courses
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Manage course offerings and provider details
          </p>
        </div>

        {(!editingId || showForm) && (
          <Button
            onClick={() => {
              const next = !showForm;
              setShowForm(next);
              if (!next) {
                setEditingId(null);
                setFormData(emptyForm);
              } else if (!editingId) {
                setFormData(emptyForm);
              }
            }}
            className={
              "px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 h-auto " +
              "bg-zinc-900 text-white hover:bg-zinc-700 " +
              "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:shadow-[0_0_16px_rgba(255,255,255,0.07)]"
            }
          >
            {showForm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                Close
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                New Entry
              </>
            )}
          </Button>
        )}
      </div>

      {/* ── Create / Full Edit Form ── */}
      {showForm && (
        <div className="
          mb-10 p-8 rounded-2xl border
          bg-white dark:bg-zinc-900
          border-zinc-200 dark:border-zinc-700/50
          shadow-sm dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)]
        ">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-6 rounded-full bg-zinc-900 dark:bg-zinc-300" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              {editingId ? "Edit Provider Course" : "Create New Provider Course"}
            </h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Identity group */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border border-zinc-100 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/40">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Master of Business Administration"
                    value={formData.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, title: v, slug: generateSlug(v) });
                    }}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Slug</label>
                  <input
                    type="text"
                    placeholder="auto-generated-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className={
                      inputCls +
                      " bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-xs"
                    }
                  />
                </div>
              </div>

              {/* Classification */}
              {[
                { label: "Degree Type", node: <DegreeTypeSelect value={formData.degreeTypeId} onChange={(v) => setFormData({ ...formData, degreeTypeId: v, courseId: "", specializationId: "" })} /> },
                { label: "Course", node: <CourseSelect degreeTypeId={formData.degreeTypeId} value={formData.courseId} onChange={(v) => setFormData({ ...formData, courseId: v, specializationId: "" })} /> },
                { label: "Specialization", node: <SpecializationSelect courseId={formData.courseId} value={formData.specializationId} onChange={(v) => setFormData({ ...formData, specializationId: v })} /> },
                { label: "Provider", node: <ProviderSelect value={formData.providerId} onChange={(v) => setFormData({ ...formData, providerId: v })} /> },
              ].map(({ label, node }) => (
                <div key={label} className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</label>
                  {node}
                </div>
              ))}

              {/* Pricing */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Fees (₹)</label>
                <input type="number" placeholder="0.00" value={formData.fees} onChange={(e) => setFormData({ ...formData, fees: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Discounted Fees (₹)</label>
                <input type="number" placeholder="0.00" value={formData.discountedFees} onChange={(e) => setFormData({ ...formData, discountedFees: e.target.value })} className={inputCls} />
              </div>

              {/* Seats & Eligibility */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Seats Available</label>
                <input type="number" placeholder="e.g. 50" value={formData.seatsAvailable} onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Eligibility</label>
                <input type="text" placeholder="e.g. Graduation with 50%" value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} className={inputCls} />
              </div>

              {/* Logistics */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Duration</label>
                <input type="text" placeholder="e.g. 2 Years" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className={inputCls} />
              </div>

              {/* EMI Details */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={formData.isEmiAvailable} onChange={(e) => setFormData({ ...formData, isEmiAvailable: e.target.checked })} className="peer sr-only" />
                      <div className="w-11 h-6 rounded-full transition-colors bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">EMI Available</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">EMI Starting Amount</label>
                  <input type="text" placeholder="e.g. 8,750/semester" value={formData.emiStartingAmount} onChange={(e) => setFormData({ ...formData, emiStartingAmount: e.target.value })} className={inputCls} disabled={!formData.isEmiAvailable} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">EMI Terms/Fine Print</label>
                  <input type="text" placeholder="e.g. through approved banking partners" value={formData.emiTerms} onChange={(e) => setFormData({ ...formData, emiTerms: e.target.value })} className={inputCls} disabled={!formData.isEmiAvailable} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Weekly Effort (hrs)</label>
                <input type="number" placeholder="e.g. 15" value={formData.weeklyEffort} onChange={(e) => setFormData({ ...formData, weeklyEffort: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Employer Acceptance</label>
                <select value={formData.employerAcceptance} onChange={(e) => setFormData({ ...formData, employerAcceptance: e.target.value })} className={selectCls}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Difficulty Level</label>
                <select value={formData.difficultyLevel} onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })} className={selectCls}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Resources */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Brochure URL</label>
                <input type="text" placeholder="https://example.com/brochure.pdf" value={formData.brochureUrl} onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })} className={inputCls} />
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Thumbnail</label>
                <ImageUploader value={formData.thumbnail} onChange={(url) => setFormData({ ...formData, thumbnail: url })} folder="cop/provider-courses" />
              </div>
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Exam Pattern</label>
                <textarea placeholder="Describe the assessment method" value={formData.examPattern} onChange={(e) => setFormData({ ...formData, examPattern: e.target.value })}
                  className={inputCls + " min-h-[46px] resize-none"} />
              </div>

              {/* Fees Breakdown */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 p-5 rounded-xl border border-zinc-100 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/40 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Fees Breakdown</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, feesBreakdown: [...formData.feesBreakdown, { label: "", amount: 0 }] })}
                    className="
                      px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5
                      border border-zinc-200 dark:border-zinc-600
                      bg-white dark:bg-zinc-800
                      text-zinc-700 dark:text-zinc-300
                      hover:bg-zinc-100 dark:hover:bg-zinc-700
                      transition-colors
                    "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
                    Add Item
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.feesBreakdown.map((fb, idx) => (
                    <div key={idx} className="
                      flex gap-2 items-center p-2 rounded-lg
                      border border-zinc-200 dark:border-zinc-700/60
                      bg-white dark:bg-zinc-800/80
                      shadow-sm
                    ">
                      <input
                        type="text"
                        placeholder="Label (e.g. Admission)"
                        value={fb.label}
                        onChange={(e) => {
                          const arr = [...formData.feesBreakdown];
                          arr[idx].label = e.target.value;
                          setFormData({ ...formData, feesBreakdown: arr });
                        }}
                        className="border-none focus:ring-0 px-2 py-1 text-sm flex-1 outline-none bg-transparent text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                      />
                      <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2">
                        <span className="text-zinc-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={fb.amount}
                          onChange={(e) => {
                            const arr = [...formData.feesBreakdown];
                            arr[idx].amount = e.target.value;
                            setFormData({ ...formData, feesBreakdown: arr });
                          }}
                          className="border-none focus:ring-0 px-2 py-1 text-sm w-20 outline-none bg-transparent text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData({ ...formData, feesBreakdown: formData.feesBreakdown.filter((_, i) => i !== idx) })}
                        className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </Button>
                    </div>
                  ))}
                </div>
                {formData.feesBreakdown.length === 0 && (
                  <p className="text-center py-3 text-xs text-zinc-400 dark:text-zinc-500 italic">No breakdown items added</p>
                )}
              </div>

              {/* Approvals */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 p-5 rounded-xl border border-zinc-100 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/40 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Approvals</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, approvals: [...(formData.approvals || []), ""] })}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
                    Add Approval
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(formData.approvals || []).map((val, idx) => (
                    <div key={idx} className="flex gap-2 items-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/80 shadow-sm">
                      <input
                        type="text"
                        placeholder="e.g. UGC / AICTE / NAAC A+"
                        value={val}
                        onChange={(e) => {
                          const arr = [...formData.approvals];
                          arr[idx] = e.target.value;
                          setFormData({ ...formData, approvals: arr });
                        }}
                        className="border-none focus:ring-0 px-2 py-1 text-sm flex-1 outline-none bg-transparent text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData({ ...formData, approvals: formData.approvals.filter((_, i) => i !== idx) })}
                        className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </Button>
                    </div>
                  ))}
                </div>
                {(!formData.approvals || formData.approvals.length === 0) && (
                  <p className="text-center py-3 text-xs text-zinc-400 dark:text-zinc-500 italic">No approvals added</p>
                )}
              </div>

              {/* Highlights (Short Points) */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 p-5 rounded-xl border border-zinc-100 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/40 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Highlights (Short Points)</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, highlights: [...(formData.highlights || []), ""] })}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
                    Add Point
                  </Button>
                </div>
                <div className="space-y-2">
                  {(formData.highlights || []).map((val, idx) => (
                    <div key={idx} className="flex gap-2 items-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/80 shadow-sm">
                      <span className="text-xs font-bold text-zinc-400 w-5 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="Short point about this course"
                        value={val}
                        onChange={(e) => {
                          const arr = [...formData.highlights];
                          arr[idx] = e.target.value;
                          setFormData({ ...formData, highlights: arr });
                        }}
                        className="border-none focus:ring-0 px-2 py-1 text-sm flex-1 outline-none bg-transparent text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== idx) })}
                        className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </Button>
                    </div>
                  ))}
                </div>
                {(!formData.highlights || formData.highlights.length === 0) && (
                  <p className="text-center py-3 text-xs text-zinc-400 dark:text-zinc-500 italic">No highlights added</p>
                )}
              </div>

              {/* Detailed Page — Block Editor */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 p-5 rounded-xl border border-zinc-100 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/40">
                <ContentBuilder
                  form={{ content: formData.contentBlocks || [] }}
                  setForm={(v) => setFormData({ ...formData, contentBlocks: v.content })}
                />
              </div>

              {/* Status + Submit */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-700/40">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="peer sr-only" />
                      <div className="
                        w-11 h-6 rounded-full transition-colors
                        bg-zinc-200 dark:bg-zinc-700
                        peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-200
                        peer-focus:ring-2 peer-focus:ring-zinc-400
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:rounded-full after:h-5 after:w-5
                        after:transition-all after:shadow-sm
                        peer-checked:after:translate-x-full
                      "></div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                      Course is Active
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={formData.bestROI} onChange={(e) => setFormData({ ...formData, bestROI: e.target.checked })} className="peer sr-only" />
                      <div className="
                        w-11 h-6 rounded-full transition-colors
                        bg-zinc-200 dark:bg-zinc-700
                        peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-400
                        peer-focus:ring-2 peer-focus:ring-emerald-400
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:rounded-full after:h-5 after:w-5
                        after:transition-all after:shadow-sm
                        peer-checked:after:translate-x-full
                      "></div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Best ROI</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={formData.trending} onChange={(e) => setFormData({ ...formData, trending: e.target.checked })} className="peer sr-only" />
                      <div className="
                        w-11 h-6 rounded-full transition-colors
                        bg-zinc-200 dark:bg-zinc-700
                        peer-checked:bg-amber-500 dark:peer-checked:bg-amber-400
                        peer-focus:ring-2 peer-focus:ring-amber-400
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:rounded-full after:h-5 after:w-5
                        after:transition-all after:shadow-sm
                        peer-checked:after:translate-x-full
                      "></div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Trending</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full md:w-auto px-10 py-2.5 rounded-xl font-bold text-sm
                    bg-zinc-900 text-white hover:bg-zinc-700
                    dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white
                    dark:shadow-[0_0_20px_rgba(255,255,255,0.06)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all flex items-center justify-center gap-2
                  "
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : editingId ? "Save Changes" : "Add Provider Course"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div className="
        rounded-2xl border overflow-hidden
        bg-white dark:bg-zinc-900
        border-zinc-200 dark:border-zinc-700/50
        shadow-sm dark:shadow-[0_4px_40px_rgba(0,0,0,0.45)]
      ">
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-zinc-300 dark:bg-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Provider Courses Inventory
            </h2>
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
            {providerCourses.length} {providerCourses.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                {["S.No.", "Title & Course", "Logistics", "Pricing", "Status", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-3.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ${i >= 4 ? "text-center" : ""} ${i === 5 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {providerCourses.map((item, index) => (
                <tr
                  key={item._id}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group"
                >
                  {/* S.No. */}
                  <td className="px-6 py-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    {index + 1}
                  </td>

                  {/* Title & Course */}
                  <td className="px-6 py-4">
                    {editingId === item._id ? (
                      <div className="space-y-2 min-w-[200px]">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Title</label>
                          <input
                            value={formData.title}
                            onChange={(e) => { const v = e.target.value; setFormData({ ...formData, title: v, slug: generateSlug(v) }); }}
                            className={inputCls}
                            placeholder="Title"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Slug</label>
                          <input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                            className={inputCls + " font-mono text-xs text-zinc-500 dark:text-zinc-400"}
                            placeholder="slug"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Degree Type</label>
                          <DegreeTypeSelect value={formData.degreeTypeId} onChange={(v) => setFormData({ ...formData, degreeTypeId: v, courseId: "", specializationId: "" })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Course</label>
                          <CourseSelect degreeTypeId={formData.degreeTypeId} value={formData.courseId} onChange={(v) => setFormData({ ...formData, courseId: v, specializationId: "" })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Specialization</label>
                          <SpecializationSelect courseId={formData.courseId} value={formData.specializationId} onChange={(v) => setFormData({ ...formData, specializationId: v })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Provider</label>
                          <ProviderSelect value={formData.providerId} onChange={(v) => setFormData({ ...formData, providerId: v })} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="block font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-snug line-clamp-1">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                            {item.degreeTypeId?.name}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-600 text-xs">/</span>
                          <span className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1">
                            {item.courseId?.name}
                          </span>
                        </div>
                        {Array.isArray(item.approvals) && item.approvals.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.approvals.map((a, i) => (
                              <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                        {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                          <ul className="mt-2 space-y-0.5 list-disc list-inside text-[11px] text-zinc-600 dark:text-zinc-400">
                            {item.highlights.slice(0, 3).map((h, i) => (
                              <li key={i} className="line-clamp-1">{h}</li>
                            ))}
                            {item.highlights.length > 3 && (
                              <li className="list-none text-[10px] text-zinc-400 italic">+{item.highlights.length - 3} more</li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                  </td>

                  {/* ── Logistics ── */}
                  <td className="px-6 py-4">
                    {editingId === item._id ? (
                      <div className="space-y-2 min-w-[160px]">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Duration</label>
                          <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className={inputCls} placeholder="e.g. 2 Years" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Time Commitment (hrs/week)</label>
                          <input type="number" value={formData.weeklyEffort} onChange={(e) => setFormData({ ...formData, weeklyEffort: e.target.value })}
                            className={inputCls} placeholder="e.g. 15" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Employer Acceptance</label>
                          <select value={formData.employerAcceptance} onChange={(e) => setFormData({ ...formData, employerAcceptance: e.target.value })} className={selectCls}>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Difficulty Level</label>
                          <select value={formData.difficultyLevel} onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })} className={selectCls}>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Seats Available</label>
                          <input type="number" value={formData.seatsAvailable} onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })}
                            className={inputCls} placeholder="e.g. 50" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Eligibility</label>
                          <input type="text" value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                            className={inputCls} placeholder="e.g. Graduation with 50%" />
                        </div>

                        {/* Approvals (inline) */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Approvals</span>
                            <button type="button"
                              onClick={() => setFormData({ ...formData, approvals: [...(formData.approvals || []), ""] })}
                              className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline">
                              + Add
                            </button>
                          </div>
                          {(formData.approvals || []).map((val, idx) => (
                            <div key={idx} className="flex gap-1 items-center">
                              <input type="text" placeholder="e.g. UGC" value={val}
                                onChange={(e) => { const arr = [...formData.approvals]; arr[idx] = e.target.value; setFormData({ ...formData, approvals: arr }); }}
                                className={inputCls + " text-xs"} />
                              <button type="button"
                                onClick={() => setFormData({ ...formData, approvals: formData.approvals.filter((_, i) => i !== idx) })}
                                className="text-zinc-400 hover:text-red-500 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Highlights (inline) */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Highlights</span>
                            <button type="button"
                              onClick={() => setFormData({ ...formData, highlights: [...(formData.highlights || []), ""] })}
                              className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline">
                              + Add
                            </button>
                          </div>
                          {(formData.highlights || []).map((val, idx) => (
                            <div key={idx} className="flex gap-1 items-center">
                              <input type="text" placeholder="Short point" value={val}
                                onChange={(e) => { const arr = [...formData.highlights]; arr[idx] = e.target.value; setFormData({ ...formData, highlights: arr }); }}
                                className={inputCls + " text-xs"} />
                              <button type="button"
                                onClick={() => setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== idx) })}
                                className="text-zinc-400 hover:text-red-500 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.weeklyEffort ? `${item.weeklyEffort}h/week` : "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.difficultyLevel || "Unset"}</span>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* ── Pricing ── */}
                  <td className="px-6 py-4">
                    {editingId === item._id ? (
                      <div className="space-y-2 min-w-[160px]">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">List Price (₹)</label>
                          <input type="number" value={formData.fees} onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                            className={inputCls} placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Discounted Price (₹)</label>
                          <input type="number" value={formData.discountedFees} onChange={(e) => setFormData({ ...formData, discountedFees: e.target.value })}
                            className={inputCls} placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Brochure URL</label>
                          <input type="text" value={formData.brochureUrl} onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                            className={inputCls} placeholder="https://example.com/brochure.pdf" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Exam Pattern</label>
                          <textarea value={formData.examPattern} onChange={(e) => setFormData({ ...formData, examPattern: e.target.value })}
                            className={inputCls + " resize-none"} placeholder="Describe the assessment method" rows={2} />
                        </div>
                        {/* Fees Breakdown */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Breakdown</span>
                            <button type="button"
                              onClick={() => setFormData({ ...formData, feesBreakdown: [...formData.feesBreakdown, { label: "", amount: 0 }] })}
                              className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline">
                              + Add
                            </button>
                          </div>
                          {formData.feesBreakdown.map((fb, idx) => (
                            <div key={idx} className="flex gap-1 items-center">
                              <input type="text" placeholder="Label" value={fb.label}
                                onChange={(e) => { const arr = [...formData.feesBreakdown]; arr[idx].label = e.target.value; setFormData({ ...formData, feesBreakdown: arr }); }}
                                className={inputCls + " text-xs"} />
                              <input type="number" placeholder="₹" value={fb.amount}
                                onChange={(e) => { const arr = [...formData.feesBreakdown]; arr[idx].amount = e.target.value; setFormData({ ...formData, feesBreakdown: arr }); }}
                                className={inputCls + " text-xs w-20"} />
                              <button type="button"
                                onClick={() => setFormData({ ...formData, feesBreakdown: formData.feesBreakdown.filter((_, i) => i !== idx) })}
                                className="text-zinc-400 hover:text-red-500 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          ₹{item.discountedFees?.toLocaleString()}
                        </span>
                        {item.fees > item.discountedFees && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 line-through">
                            ₹{item.fees?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* ── Status ── */}
                  <td className="px-6 py-4 text-center">
                    {editingId === item._id ? (
                      <div className="space-y-3 min-w-[110px]">
                        {[
                          { key: "isActive", label: "Active", color: "peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-200" },
                          { key: "bestROI", label: "Best ROI", color: "peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-400" },
                          { key: "trending", label: "Trending", color: "peer-checked:bg-amber-500 dark:peer-checked:bg-amber-400" },
                        ].map(({ key, label, color }) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer select-none justify-center">
                            <div className="relative flex items-center">
                              <input type="checkbox" checked={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} className="peer sr-only" />
                              <div className={`w-10 h-5 rounded-full transition-colors bg-zinc-200 dark:bg-zinc-700 ${color} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5`} />
                            </div>
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${item.isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700/50"
                          }
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-500 dark:bg-emerald-400" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                          {item.isActive ? "Active" : "Inactive"}
                        </span>

                        <div className="flex flex-wrap justify-center gap-1">
                          {item.bestROI && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                              Best ROI
                            </span>
                          )}
                          {item.trending && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                              Trending
                            </span>
                          )}
                          {!item.bestROI && !item.trending && (
                            <span className="text-[10px] text-zinc-400">No special label</span>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* ── Actions ── */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      {editingId === item._id ? (
                        <>
                          <Button
                            onClick={() => handleUpdate(item._id)}
                            size="icon"
                            disabled={loading}
                            className="
                              w-8 h-8 rounded-lg
                              bg-zinc-900 text-white hover:bg-zinc-700
                              dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white
                              transition-colors shadow-sm disabled:opacity-40
                            "
                            title="Save"
                          >
                            {loading
                              ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                            }
                          </Button>
                          <Button
                            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Open full editor (detailed page blocks)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                          </Button>
                          <Button
                            onClick={() => setEditingId(null)}
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Cancel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleEdit(item)}
                            variant="ghost"
                            size="icon"
                            className="
                              w-8 h-8 rounded-lg
                              text-zinc-400 dark:text-zinc-500
                              hover:text-zinc-900 dark:hover:text-zinc-100
                              hover:bg-zinc-100 dark:hover:bg-zinc-800
                              transition-colors
                            "
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item._id)}
                            className="
                              w-8 h-8 rounded-lg
                              text-zinc-400 dark:text-zinc-500
                              hover:text-red-600 dark:hover:text-red-400
                              hover:bg-red-50 dark:hover:bg-red-500/10
                              transition-colors
                            "
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {providerCourses.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">No Provider Courses Found</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5 max-w-xs">
              You haven't added any course offerings yet. Click <span className="font-semibold text-zinc-600 dark:text-zinc-400">New Entry</span> to get started.
            </p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}