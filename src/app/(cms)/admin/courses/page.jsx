"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
import DegreeTypeSelect from "../components/DegreeTypeSelect";
import ContentBuilder from "../components/ContentBuilder";
import ImageUploader from "../components/ImageUploader";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, X, Pencil, Trash2, ChevronRight, Loader2, MoreVertical, ExternalLink } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const emptyForm = {
    name: "",
    slug: "",
    degreeTypeId: "",
    icon: "",
    description: "",
    duration: "",
    feeStarting: "",
    universities: [],
    approvals: [],
    highlights: [],
    contentBlocks: [],
    isActive: true,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [providers, setProviders] = useState([]);

  const buildPayload = (fd) => ({
    ...fd,
    feeStarting: fd.feeStarting ? Number(fd.feeStarting) : null,
    universities: Array.isArray(fd.universities) ? fd.universities : [],
    approvals: (fd.approvals || []).map((s) => (s || "").trim()).filter(Boolean),
    highlights: (fd.highlights || []).map((s) => (s || "").trim()).filter(Boolean),
    contentBlocks: Array.isArray(fd.contentBlocks) ? fd.contentBlocks : [],
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
  /* Fetch Courses */
  /* ---------------------------------- */
  const fetchCourses = async () => {
    try {
      const res = await callApi("/api/admin/courses", {
        cache: "no-store",
        auth: true,
      });

      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch courses:", await res.text());
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await callApi("/api/admin/providers", { auth: true });
      if (res.ok) {
        const data = await res.json();
        setProviders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching providers", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchProviders();
  }, []);

  /* ---------------------------------- */
  /* Create */
  /* ---------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Course name is required!");
      return;
    }

    if (!formData.degreeTypeId) {
      alert("Please select degree type!");
      return;
    }

    setSaving(true);

    if (editingId) {
      await callApi(`/api/admin/courses/${editingId}`, {
        method: "PUT",
        auth: true,
        body: buildPayload(formData),
      });
      setEditingId(null);
    } else {
      await callApi("/api/admin/courses", {
        method: "POST",
        auth: true,
        body: buildPayload(formData),
      });
    }

    setFormData(emptyForm);
    setShowForm(false);
    setSaving(false);
    fetchCourses();
  };

  /* ---------------------------------- */
  /* Edit */
  /* ---------------------------------- */
  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      name: course.name,
      slug: course.slug,
      degreeTypeId: course.degreeTypeId?._id || course.degreeTypeId,
      icon: course.icon || "",
      description: course.description || "",
      duration: course.duration || "",
      feeStarting: course.feeStarting || "",
      universities: Array.isArray(course.universities) ? course.universities.map(u => u._id || u) : [],
      approvals: Array.isArray(course.approvals) ? course.approvals : [],
      highlights: Array.isArray(course.highlights) ? course.highlights : [],
      contentBlocks: Array.isArray(course.contentBlocks) ? course.contentBlocks : [],
      isActive: course.isActive,
    });
    setShowForm(true);
  };

  const handleUpdate = async (id) => {
    if (!formData.name.trim()) {
      alert("Course name is required!");
      return;
    }

    if (!formData.degreeTypeId) {
      alert("Please select degree type!");
      return;
    }

    setSaving(true);

    await callApi(`/api/admin/courses/${id}`, {
      method: "PUT",
      auth: true,
      body: buildPayload(formData),
    });

    setEditingId(null);
    setSaving(false);
    fetchCourses();
  };

  /* ---------------------------------- */
  /* Delete */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this course?");
    if (!confirmDelete) return;

    await callApi(`/api/admin/courses/${id}`, {
      method: "DELETE",
      auth: true,
    });

    fetchCourses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest animate-pulse">
          Loading Courses
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary ring-1 ring-primary/20">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Courses</h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground/70 mt-1 ml-[52px]">
              Manage your curriculum and academic course offerings
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
              className="px-6 py-4 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2 h-auto"
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" />
                  Close
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Course
                </>
              )}
            </Button>
          )}
        </div>

        {/* ---------------------------------- */}
        {/* Create Form */}
        {/* ---------------------------------- */}
        {showForm && (
          <div className="bg-card dark:bg-zinc-900/50 p-8 rounded-2xl shadow-sm border border-border/50 dark:border-zinc-800/60 mb-10 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              {editingId ? "Edit Course" : "Create New Course"}
            </h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Course Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        name: value,
                        slug: generateSlug(value),
                      });
                    }}
                    className="w-full bg-muted/30 dark:bg-zinc-800/50 border border-border/50 dark:border-zinc-700/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-foreground text-sm font-medium"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Slug</label>
                  <input
                    type="text"
                    placeholder="auto-generated-slug"
                    value={formData.slug}
                    readOnly
                    className="w-full bg-muted/10 dark:bg-zinc-800/20 border border-border/40 dark:border-zinc-800/40 px-4 py-2.5 rounded-xl text-muted-foreground/60 outline-none text-sm font-mono italic"
                  />
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Icon</label>
                  <ImageUploader
                    value={formData.icon}
                    onChange={(url) => setFormData({ ...formData, icon: url })}
                    folder="cop/courses/icons"
                  />
                </div>

                {/* Degree Type Dropdown */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Degree Type</label>
                  <DegreeTypeSelect
                    value={formData.degreeTypeId}
                    onChange={(value) =>
                      setFormData({ ...formData, degreeTypeId: value })
                    }
                    required
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Years / 4 Semesters"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-muted/30 dark:bg-zinc-800/50 border border-border/50 dark:border-zinc-700/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-foreground text-sm font-medium"
                  />
                </div>

                {/* Fee Starting */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Starting Fee (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.feeStarting}
                    onChange={(e) => setFormData({ ...formData, feeStarting: e.target.value })}
                    className="w-full bg-muted/30 dark:bg-zinc-800/50 border border-border/50 dark:border-zinc-700/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-foreground text-sm font-medium"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 opacity-0 select-none">Status</label>
                  <label className="flex items-center gap-3 cursor-pointer group bg-muted/20 dark:bg-zinc-800/30 px-4 py-[9px] rounded-xl border border-border/40 dark:border-zinc-800/40 w-full transition-colors hover:border-primary/30">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="peer sr-only"
                      />
                      <div className="w-10 h-5 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-colors"></div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-widest">Active Status</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Short Description</label>
                <textarea
                  placeholder="Provide a brief overview of the course..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-muted/30 dark:bg-zinc-800/50 border border-border/50 dark:border-zinc-700/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-foreground text-sm font-medium resize-none"
                />
              </div>

              {/* Universities Multi-Select */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Associated Universities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {providers.map((provider) => (
                    <label
                      key={provider._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${formData.universities.includes(provider._id)
                        ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                        : "bg-muted/20 border-border/40 hover:border-primary/30"
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.universities.includes(provider._id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            universities: checked
                              ? [...prev.universities, provider._id]
                              : prev.universities.filter(id => id !== provider._id)
                          }));
                        }}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.universities.includes(provider._id)
                        ? "bg-primary border-primary"
                        : "bg-white dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 group-hover:border-primary"
                        }`}>
                        {formData.universities.includes(provider._id) && (
                          <Plus className="w-3 h-3 text-white rotate-45 scale-125" />
                        )}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${formData.universities.includes(provider._id) ? "text-primary" : "text-muted-foreground"
                        }`}>
                        {provider.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Approvals */}


              {/* Detailed Page — Block Editor */}
              <div className="p-5 rounded-xl border border-border/50 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20">
                <ContentBuilder
                  form={{ content: formData.contentBlocks || [] }}
                  setForm={(v) => setFormData({ ...formData, contentBlocks: v.content })}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40 dark:border-zinc-800/60">
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2 h-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingId ? "Saving..." : "Creating..."}
                    </>
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* Table */}
        {/* ---------------------------------- */}
        <div className="bg-card dark:bg-zinc-900/50 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-sm dark:shadow-zinc-950/40 overflow-hidden text-foreground">
          
          {/* Table Header Bar */}
          <div className="px-8 py-5 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              All Courses
            </h2>
            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/50 dark:bg-zinc-800/60 px-3 py-1 rounded-full border border-border/40 dark:border-zinc-700/40">
              {courses.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/20 dark:bg-zinc-800/20 border-b border-border/40 dark:border-zinc-800/60">
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">S.No.</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">Course Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">Identifier (Slug)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">Degree Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">Duration/Fees</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">Universities</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/30 dark:divide-zinc-800/50">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground italic">
                      No courses found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  courses.map((course, index) => (
                    <tr key={course._id} className="group hover:bg-muted/20 dark:hover:bg-zinc-800/20 transition-colors">
                      {/* S.No. */}
                      <td className="px-6 py-4 text-sm font-bold text-muted-foreground tracking-tight">
                        {index + 1}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        {editingId === course._id ? (
                          <input
                            value={formData.name}
                            onChange={(e) => {
                              const nameValue = e.target.value;
                              setFormData({
                                ...formData,
                                name: nameValue,
                                slug: generateSlug(nameValue),
                              });
                            }}
                            className="w-full bg-muted/50 dark:bg-zinc-800/50 border border-border/50 dark:border-zinc-700/50 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-foreground font-medium"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/40">
                              {course.icon ? (
                                <img src={course.icon} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-muted-foreground/40" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-foreground tracking-tight">{course.name}</span>
                              {Array.isArray(course.approvals) && course.approvals.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {course.approvals.slice(0, 3).map((a, i) => (
                                    <span key={i} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                                      {a}
                                    </span>
                                  ))}
                                  {course.approvals.length > 3 && (
                                    <span className="text-[9px] text-muted-foreground italic">+{course.approvals.length - 3}</span>
                                  )}
                                </div>
                              )}
                              {Array.isArray(course.highlights) && course.highlights.length > 0 && (
                                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                                  {course.highlights.length} highlight{course.highlights.length === 1 ? "" : "s"}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4">
                        {editingId === course._id ? (
                          <input
                            value={formData.slug}
                            readOnly
                            className="w-full bg-transparent text-muted-foreground/50 px-3 py-1.5 rounded-lg outline-none text-xs font-mono italic"
                          />
                        ) : (
                          <code className="bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground/70 px-2 py-1 rounded-md text-[10px] font-mono italic border border-border/30 dark:border-zinc-700/30">
                            {course.slug}
                          </code>
                        )}
                      </td>

                      {/* Degree Type */}
                      <td className="px-6 py-4">
                        {editingId === course._id ? (
                          <DegreeTypeSelect
                            value={formData.degreeTypeId}
                            onChange={(value) =>
                              setFormData({
                                ...formData,
                                degreeTypeId: value,
                              })
                            }
                            required
                            className="py-1 px-3 rounded-lg text-xs"
                          />
                        ) : (
                          <span className="inline-flex items-center bg-muted/50 dark:bg-zinc-800/40 text-muted-foreground/60 px-2.5 py-1 rounded-full text-[10px] font-bold border border-border/40 dark:border-zinc-700/40 uppercase tracking-wider">
                            {course.degreeTypeId?.name || "Uncategorized"}
                          </span>
                        )}
                      </td>

                      {/* Duration/Fees */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-foreground tracking-tight">
                            {course.duration || "N/A"}
                          </span>
                          <span className="text-[10px] font-bold text-primary/70 uppercase">
                            {course.feeStarting ? `₹${course.feeStarting.toLocaleString()}+` : "No Fee Set"}
                          </span>
                        </div>
                      </td>

                      {/* Universities */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-bold border border-blue-500/20">
                          {Array.isArray(course.universities) ? course.universities.length : 0} Unis
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {editingId === course._id ? (
                          <div className="flex items-center">
                            <label className="relative flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    isActive: e.target.checked,
                                  })
                                }
                                className="peer sr-only"
                              />
                              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-colors"></div>
                            </label>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${course.isActive
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/20"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${course.isActive ? "bg-emerald-500 dark:bg-emerald-400" : "bg-zinc-500 dark:bg-zinc-400"}`} />
                            {course.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {editingId === course._id ? (
                            <>
                              <Button
                                onClick={() => handleUpdate(course._id)}
                                size="sm"
                                disabled={saving}
                                className="h-8 px-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                              </Button>
                              <Button
                                onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-muted-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                title="Open full editor (detailed page blocks)"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                onClick={() => setEditingId(null)}
                                variant="secondary"
                                size="sm"
                                className="h-8 px-3 bg-muted dark:bg-zinc-800 text-muted-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-muted/80 transition-colors"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(course)}
                                className="w-8 h-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(course._id)}
                                className="w-8 h-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

