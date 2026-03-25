"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
import DegreeTypeSelect from "../components/DegreeTypeSelect";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    degreeTypeId: "",
    icon: "",
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
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCourses();
    };

    loadData();
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

    setLoading(true);

    await callApi("/api/admin/courses", {
      method: "POST",
      auth: true,
      body: formData,
    });

    setFormData({
      name: "",
      slug: "",
      degreeTypeId: "",
      icon: "",
      isActive: true,
    });

    setShowForm(false);
    setLoading(false);
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
      isActive: course.isActive,
    });
    setShowForm(false);
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

    setLoading(true);

    await callApi(`/api/admin/courses/${id}`, {
      method: "PUT",
      auth: true,
      body: formData,
    });

    setEditingId(null);
    setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto p-8 text-foreground">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your curriculum and course details</p>
        </div>
        {!editingId && (
          <Button
            onClick={() => {
              setShowForm((v) => !v);
              if (!showForm) {
                setFormData({
                  name: "",
                  slug: "",
                  degreeTypeId: "",
                  icon: "",
                  isActive: true,
                });
              }
            }}
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
                New Course
              </>
            )}
          </Button>
        )}
      </div>

      {/* ---------------------------------- */}
      {/* Create Form */}
      {/* ---------------------------------- */}
      {showForm && !editingId && (
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 mb-10">
          <h2 className="text-lg font-semibold mb-6">Create New Course</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Course Name</label>
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
                  className="w-full border border-border/50 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Slug</label>
                <input
                  type="text"
                  placeholder="auto-generated-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  className="w-full border border-border/40 px-4 py-2.5 rounded-lg bg-muted/50 text-muted-foreground outline-none"
                />
              </div>

              {/* Degree Type Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Degree Type</label>
                <DegreeTypeSelect
                  value={formData.degreeTypeId}
                  onChange={(value) =>
                    setFormData({ ...formData, degreeTypeId: value })
                  }
                  required
                />
              </div>

              {/* Status & Submit */}
              <div className="flex items-end gap-6">
                <div className="flex-1 flex items-center h-[46px]">
                  <label className="flex items-center gap-3 cursor-pointer group">
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
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2 h-auto"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating...
                  </>
                ) : (
                  "Add Course"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------- */}
      {/* Table */}
      {/* ---------------------------------- */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <h2 className="text-lg font-semibold">Course List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Degree Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-muted/30 transition-colors group">
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
                        className="w-full border border-border/50 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    ) : (
                      <span className="font-semibold text-foreground">{course.name}</span>
                    )}
                  </td>

                  {/* Slug */}
                  <td className="px-6 py-4">
                    {editingId === course._id ? (
                      <input
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: generateSlug(e.target.value),
                          })
                        }
                        className="w-full border border-border/40 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground outline-none"
                      />
                    ) : (
                      <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-mono">{course.slug}</code>
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
                      />
                    ) : (
                      <span className="text-muted-foreground">{course.degreeTypeId?.name}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {editingId === course._id ? (
                      <label className="flex items-center gap-2 cursor-pointer">
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
                          <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                      </label>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${course.isActive ? "bg-emerald-500" : "bg-muted-foreground/50"}`}></span>
                        {course.isActive ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {editingId === course._id ? (
                        <>
                          <Button
                            onClick={() => handleUpdate(course._id)}
                            size="sm"
                            className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors h-auto"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingId(null)}
                            variant="secondary"
                            size="sm"
                            className="px-4 py-1.5 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors h-auto"
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
                            className="text-muted-foreground hover:text-primary hover:bg-muted"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(course._id)}
                            className="text-muted-foreground hover:text-red-600 hover:bg-rose-500/10"
                            title="Delete"
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
      </div>
    </div>
  );
}
