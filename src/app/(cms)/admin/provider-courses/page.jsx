"use client";

import { useEffect, useState } from "react";
import DegreeTypeSelect from "../components/DegreeTypeSelect";
import CourseSelect from "../components/CourseSelect";
import SpecializationSelect from "../components/SpecializationSelect";
import ProviderSelect from "../components/ProviderSelect";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";

export default function ProviderCoursesPage() {
  const [providerCourses, setProviderCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
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
    weeklyEffort: "",
    examPattern: "",
    employerAcceptance: "Medium",
    difficultyLevel: "Intermediate",
    isActive: true,
  });

  /* ---------------------------------- */
  /* Slug Generator */
  /* ---------------------------------- */
  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  /* ---------------------------------- */
  /* Fetch Provider Courses */
  /* ---------------------------------- */
  const fetchProviderCourses = async () => {
    try {
      const res = await fetch("/api/admin/provider-courses", {
        cache: "no-store",
      });
      const data = await res.json();
      setProviderCourses(data);
    } catch (err) {
      console.error("Error fetching provider courses", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProviderCourses();
    };

    loadData();
  }, []);

  /* ---------------------------------- */
  /* Create */
  /* ---------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({ message: "Title is required!", type: "error" });
      return;
    }

    if (!formData.courseId || !formData.degreeTypeId) {
      setToast({ message: "Course & Degree Type are required!", type: "error" });
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      fees: formData.fees ? Number(formData.fees) : 0,
      discountedFees: formData.discountedFees ? Number(formData.discountedFees) : 0,
      weeklyEffort: formData.weeklyEffort ? Number(formData.weeklyEffort) : undefined,
      seatsAvailable: formData.seatsAvailable ? Number(formData.seatsAvailable) : undefined,
      feesBreakdown: (formData.feesBreakdown || []).map((f) => ({
        label: f.label,
        amount: f.amount ? Number(f.amount) : 0,
      })),
    };

    console.log("Creating provider-course payload:", payload);

    await fetch("/api/admin/provider-courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setFormData({
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
      weeklyEffort: "",
      examPattern: "",
      employerAcceptance: "Medium",
      difficultyLevel: "Intermediate",
      isActive: true,
    });

    setLoading(false);
    fetchProviderCourses();
  };

  /* ---------------------------------- */
  /* Edit */
  /* ---------------------------------- */
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
      title: item.title,
      slug: item.slug,
      fees: item.fees,
      discountedFees: item.discountedFees,
      duration: item.duration,
      eligibility: item.eligibility,
      seatsAvailable: item.seatsAvailable,
      brochureUrl: item.brochureUrl,
      isActive: item.isActive,
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.title.trim()) {
      alert("Title is required!");
      return;
    }

    if (!formData.courseId || !formData.degreeTypeId) {
      alert("Course & Degree Type are required!");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      fees: formData.fees ? Number(formData.fees) : 0,
      discountedFees: formData.discountedFees ? Number(formData.discountedFees) : 0,
      weeklyEffort: formData.weeklyEffort ? Number(formData.weeklyEffort) : undefined,
      seatsAvailable: formData.seatsAvailable ? Number(formData.seatsAvailable) : undefined,
      feesBreakdown: (formData.feesBreakdown || []).map((f) => ({
        label: f.label,
        amount: f.amount ? Number(f.amount) : 0,
      })),
    };

    console.log("Updating provider-course id", id, "payload:", payload);

    await fetch(`/api/admin/provider-courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setLoading(false);
    fetchProviderCourses();
  };

  /* ---------------------------------- */
  /* Delete */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this provider course?");
    if (!confirmDelete) return;

    await fetch(`/api/admin/provider-courses/${id}`, {
      method: "DELETE",
    });

    fetchProviderCourses();
  };

  return (
    <div className="max-w-7xl mx-auto p-8 text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Provider Courses</h1>
        <p className="text-muted-foreground">Manage course offerings and provider details</p>
      </div>

      {/* ---------------------------------- */}
      {/* Create Form */}
      {/* ---------------------------------- */}
      <div className="bg-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 mb-10">
        <h2 className="text-lg font-semibold mb-6">Create New Provider Course</h2>
        <form onSubmit={handleCreate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Identity Group */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master of Business Administration"
                  value={formData.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, title: value, slug: generateSlug(value) });
                  }}
                  className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Slug</label>
                <input
                  type="text"
                  placeholder="auto-generated-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-muted/50 text-muted-foreground dark:bg-white/5"
                />
              </div>
            </div>

            {/* Classification Group */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Degree Type</label>
              <DegreeTypeSelect
                value={formData.degreeTypeId}
                onChange={(value) =>
                  setFormData({ ...formData, degreeTypeId: value, courseId: "", specializationId: "" })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Course</label>
              <CourseSelect
                degreeTypeId={formData.degreeTypeId}
                value={formData.courseId}
                onChange={(value) => setFormData({ ...formData, courseId: value, specializationId: "" })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Specialization</label>
              <SpecializationSelect
                courseId={formData.courseId}
                value={formData.specializationId}
                onChange={(value) => setFormData({ ...formData, specializationId: value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Provider</label>
              <ProviderSelect
                value={formData.providerId}
                onChange={(value) => setFormData({ ...formData, providerId: value })}
              />
            </div>

            {/* Pricing Group */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Fees (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Discounted Fees (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.discountedFees}
                onChange={(e) => setFormData({ ...formData, discountedFees: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
              />
            </div>

            {/* Seats & Eligibility */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Seats Available</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={formData.seatsAvailable}
                onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Eligibility</label>
              <input
                type="text"
                placeholder="e.g. Graduation with 50%"
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
              />
            </div>

            {/* Logistics Group */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Duration</label>
              <input
                type="text"
                placeholder="e.g. 2 Years"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Weekly Effort (hrs)</label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={formData.weeklyEffort}
                onChange={(e) => setFormData({ ...formData, weeklyEffort: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Employer Acceptance</label>
              <select
                value={formData.employerAcceptance}
                onChange={(e) => setFormData({ ...formData, employerAcceptance: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-card"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Difficulty Level</label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-card"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Resources Group */}
            <div className="lg:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-foreground">Brochure URL</label>
              <input
                type="text"
                placeholder="https://example.com/brochure.pdf"
                value={formData.brochureUrl}
                onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none bg-card"
              />
            </div>
            <div className="lg:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-foreground">Exam Pattern</label>
              <textarea
                placeholder="Describe the assessment method"
                value={formData.examPattern}
                onChange={(e) => setFormData({ ...formData, examPattern: e.target.value })}
                className="w-full border border-border/50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none min-h-[46px] resize-none bg-card"
              />
            </div>

            {/* Fees Breakdown - Full Width Area */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 p-6 bg-muted/50 rounded-xl border border-gray-100 dark:border-white/10 dark:bg-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Fees Breakdown</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      feesBreakdown: [...formData.feesBreakdown, { label: "", amount: 0 }],
                    })
                  }
                  className="px-4 py-1.5 text-xs font-bold bg-card border border-border/50 rounded-lg hover:bg-muted/50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
                  Add Item
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.feesBreakdown.map((fb, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-card p-2 rounded-lg border border-border/50 shadow-sm transition-all hover:border-border">
                    <input
                      type="text"
                      placeholder="Label (e.g. Admission)"
                      value={fb.label}
                      onChange={(e) => {
                        const arr = [...formData.feesBreakdown];
                        arr[idx].label = e.target.value;
                        setFormData({ ...formData, feesBreakdown: arr });
                      }}
                      className="border-none focus:ring-0 px-2 py-1 text-sm flex-1 outline-none"
                    />
                    <div className="flex items-center gap-1 border-l pl-2">
                      <span className="text-muted-foreground text-xs font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={fb.amount}
                        onChange={(e) => {
                          const arr = [...formData.feesBreakdown];
                          arr[idx].amount = e.target.value;
                          setFormData({ ...formData, feesBreakdown: arr });
                        }}
                        className="border-none focus:ring-0 px-2 py-1 text-sm w-20 outline-none"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const arr = formData.feesBreakdown.filter((_, i) => i !== idx);
                        setFormData({ ...formData, feesBreakdown: arr });
                      }}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </Button>
                  </div>
                ))}
              </div>
              {formData.feesBreakdown.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground italic">No breakdown items added</div>
              )}
            </div>

            {/* Status Toggle & Submit */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-gray-100 dark:border-white/10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-black dark:group-hover:text-white transition-colors">Course is Active</span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  "Add Provider Course"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* ---------------------------------- */}
      {/* Table */}
      {/* ---------------------------------- */}
      <div className="bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/10 bg-muted/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Courses Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title & Course</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logistics</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {providerCourses.map((item) => (
                <tr key={item._id} className="hover:bg-muted/50 transition-colors group">
                  {/* Title & Course */}
                  <td className="px-6 py-4">
                    {editingId === item._id ? (
                      <div className="space-y-2 max-w-sm">
                        <input
                          value={formData.title}
                          onChange={(e) => {
                            const nameValue = e.target.value;
                            setFormData({
                              ...formData,
                              title: nameValue,
                              slug: generateSlug(nameValue),
                            });
                          }}
                          className="w-full border border-border/50 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none text-sm font-medium bg-card"
                          placeholder="Title"
                        />
                        <div className="grid grid-cols-1 gap-1">
                          <DegreeTypeSelect
                            value={formData.degreeTypeId}
                            onChange={(value) => setFormData({ ...formData, degreeTypeId: value, courseId: "", specializationId: "" })}
                          />
                          <CourseSelect
                            degreeTypeId={formData.degreeTypeId}
                            value={formData.courseId}
                            onChange={(value) => setFormData({ ...formData, courseId: value, specializationId: "" })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{item.title}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-bold uppercase">{item.degreeTypeId?.name}</span>
                          <span className="text-muted-foreground text-xs">/</span>
                          <span className="text-muted-foreground text-xs line-clamp-1">{item.courseId?.name}</span>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Logistics */}
                  <td className="px-6 py-4">
                    {editingId === item._id ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={formData.weeklyEffort}
                          onChange={(e) => setFormData({ ...formData, weeklyEffort: e.target.value })}
                          className="border border-border/50 px-2 py-1 rounded-lg text-xs w-full bg-card"
                          placeholder="Effort"
                        />
                        <select
                          value={formData.difficultyLevel}
                          onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                          className="border border-border/50 px-2 py-1 rounded-lg text-xs w-full bg-card"
                        >
                          <option value="Beginner">Beg.</option>
                          <option value="Intermediate">Int.</option>
                          <option value="Advanced">Adv.</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {item.weeklyEffort ? `${item.weeklyEffort}h/week` : "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          {item.difficultyLevel || "Unset"}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-4">
                    {editingId === item._id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">List:</span>
                          <input
                            type="number"
                            value={formData.fees}
                            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                            className="border border-border/50 px-2 py-1 rounded-lg text-xs w-16 bg-card"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground font-bold">Disc:</span>
                          <input
                            type="number"
                            value={formData.discountedFees}
                            onChange={(e) => setFormData({ ...formData, discountedFees: e.target.value })}
                            className="border border-border/50 px-2 py-1 rounded-lg text-xs w-16 font-bold bg-card"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">₹{item.discountedFees?.toLocaleString()}</span>
                        {item.fees > item.discountedFees && (
                          <span className="text-[10px] text-muted-foreground line-through">₹{item.fees?.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {editingId === item._id ? (
                      <div className="flex justify-center">
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="peer sr-only"
                          />
                          <div className="w-10 h-5 bg-gray-200 dark:bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
                        </label>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.isActive
                        ? "bg-green-100 dark:bg-emerald-500/10 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                        }`}>
                        <span className={`w-1 h-1 rounded-full mr-1.5 ${item.isActive ? "bg-emerald-500/100" : "bg-gray-400 dark:bg-white/20"}`}></span>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === item._id ? (
                        <>
                          <Button
                            onClick={() => handleUpdate(item._id)}
                            size="icon"
                            className="p-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                            title="Save Changes"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          </Button>
                          <Button
                            onClick={() => setEditingId(null)}
                            variant="secondary"
                            size="icon"
                            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-gray-200 transition-colors"
                            title="Cancel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-muted-foreground hover:text-black dark:hover:text-white hover:bg-muted rounded-lg transition-all"
                            title="Edit Service"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item._id)}
                            className="text-muted-foreground hover:text-red-600 hover:bg-rose-500/10"
                            title="Delete Service"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
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

        {providerCourses.length === 0 && (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-muted/50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-muted-foreground text-xl font-bold">No Provider Courses Found</p>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">You haven't added any course offerings yet. Fill out the form above to create your first course entry.</p>
          </div>
        )}
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
