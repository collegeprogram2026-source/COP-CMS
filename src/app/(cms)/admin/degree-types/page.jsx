"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";
import {
  Layers,
  Plus,
  X,
  Pencil,
  Trash2,
  Save,
  Database,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function DegreeTypesPage() {
  const [degreeTypes, setDegreeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    order: 0,
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
  /* Fetch Degree Types */
  /* ---------------------------------- */
  const fetchDegreeTypes = async () => {
    try {
      const res = await callApi("/api/admin/degree-types", {
        cache: "no-store",
        auth: true,
      });

      if (res.ok) {
        const data = await res.json();
        setDegreeTypes(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch degree types:", await res.text());
        setDegreeTypes([]);
      }
    } catch (err) {
      console.error("Error fetching degree types", err);
      setDegreeTypes([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchDegreeTypes();
  }, []);

  /* ---------------------------------- */
  /* Create */
  /* ---------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }

    setLoading(true);

    try {
      await callApi("/api/admin/degree-types", {
        method: "POST",
        auth: true,
        body: formData,
      });

      setFormData({
        name: "",
        slug: "",
        order: 0,
        isActive: true,
      });

      setShowForm(false);
      fetchDegreeTypes();
    } catch (err) {
      console.error("Error creating degree type", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------- */
  /* Edit */
  /* ---------------------------------- */
  const handleEdit = (degree) => {
    setEditingId(degree._id);
    setFormData({
      name: degree.name,
      slug: degree.slug,
      order: degree.order,
      isActive: degree.isActive,
    });
    setShowForm(false);
  };

  const handleUpdate = async (id) => {
    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }

    setLoading(true);

    try {
      await callApi(`/api/admin/degree-types/${id}`, {
        method: "PUT",
        auth: true,
        body: formData,
      });

      setEditingId(null);
      fetchDegreeTypes();
    } catch (err) {
      console.error("Error updating degree type", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------- */
  /* Delete */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this degree type?"
    );
    if (!confirmDelete) return;

    await callApi(`/api/admin/degree-types/${id}`, {
      method: "DELETE",
      auth: true,
    });

    fetchDegreeTypes();
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4 text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest animate-pulse">
          Loading Degree Types
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 pb-20 text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary ring-1 ring-primary/20">
                <Layers className="w-5 h-5" />
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">Degree Types</h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground/70 mt-1 ml-[52px]">
              Manage categories and classifications for degrees
            </p>
          </div>
          {!editingId && (
            <Button
              onClick={() => {
                setShowForm((v) => !v);
                if (!showForm) {
                  setFormData({ name: "", slug: "", order: 0, isActive: true });
                }
              }}
              className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2 h-auto"
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" />
                  Close
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Degree Type
                </>
              )}
            </Button>
          )}
        </div>

        {/* ── Create Form ── */}
        {showForm && !editingId && (
          <div className="bg-card dark:bg-zinc-900/50 p-8 rounded-2xl shadow-sm border border-border/50 dark:border-zinc-800/60 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Create New Degree Type
            </h2>
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Degree Type Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name (e.g. Bachelor)"
                    value={formData.name}
                    onChange={(e) => {
                      const nameValue = e.target.value;
                      setFormData({
                        ...formData,
                        name: nameValue,
                        slug: generateSlug(nameValue),
                      });
                    }}
                    className="w-full bg-muted/30 dark:bg-zinc-800/40 border border-border/50 dark:border-zinc-700/40 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: generateSlug(e.target.value),
                      })
                    }
                    className="w-full bg-muted/30 dark:bg-zinc-800/40 border border-border/50 dark:border-zinc-700/40 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-mono text-muted-foreground/80"
                  />
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full bg-muted/30 dark:bg-zinc-800/40 border border-border/50 dark:border-zinc-700/40 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex flex-col justify-center">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1 mb-2">
                    Status
                  </label>
                  <div className="flex items-center h-[46px]">
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
                        <div className="w-11 h-6 bg-muted dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border/50 dark:border-zinc-700/50"></div>
                      </div>
                      <span className="text-sm font-bold text-foreground/70 group-hover:text-primary transition-colors">
                        {formData.isActive ? "Active" : "Inactive"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-border/40 dark:border-zinc-800/60">
                <Button
                  type="submit"
                  disabled={!formData.name.trim() || loading}
                  className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 h-auto ${formData.name.trim() && !loading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Add Degree Type
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-card dark:bg-zinc-900/50 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-sm dark:shadow-zinc-950/40 overflow-hidden text-foreground">

          {/* Table header bar */}
          <div className="px-8 py-5 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              Degree Types List
            </h2>
            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/50 dark:bg-zinc-800/60 px-3 py-1 rounded-full border border-border/40 dark:border-zinc-700/40">
              {degreeTypes.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/20 dark:bg-zinc-800/20 border-b border-border/40 dark:border-zinc-800/60">
                  {["S.No.", "Name", "Slug", "Order", "Status", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-8 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap ${i === 5 ? "text-right" : ""
                        }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/30 dark:divide-zinc-800/50">
                {degreeTypes.map((degree, index) => (
                  <tr
                    key={degree._id}
                    className="group hover:bg-muted/20 dark:hover:bg-zinc-800/20 transition-colors"
                  >
                    {/* S.No. */}
                    <td className="px-8 py-5 text-sm font-bold text-muted-foreground tracking-tight">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td className="px-8 py-5">
                      {editingId === degree._id ? (
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
                          className="w-full bg-muted/30 dark:bg-zinc-800/40 border border-border/50 dark:border-zinc-700/40 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                        />
                      ) : (
                        <span className="text-sm font-bold text-foreground tracking-tight">
                          {degree.name}
                        </span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="px-8 py-5">
                      {editingId === degree._id ? (
                        <input
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              slug: generateSlug(e.target.value),
                            })
                          }
                          className="w-full bg-muted/30 dark:bg-zinc-800/40 border border-border/50 dark:border-zinc-700/40 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-mono text-muted-foreground/80"
                        />
                      ) : (
                        <code className="bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground/70 px-2 py-1 rounded-md text-[10px] font-mono italic border border-border/30 dark:border-zinc-700/30">
                          {degree.slug}
                        </code>
                      )}
                    </td>

                    {/* Order */}
                    <td className="px-8 py-5">
                      {editingId === degree._id ? (
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              order: Number(e.target.value),
                            })
                          }
                          className="w-20 bg-muted/30 dark:bg-zinc-800/40 border border-border/50 dark:border-zinc-700/40 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                        />
                      ) : (
                        <span className="inline-flex items-center bg-muted/50 dark:bg-zinc-800/40 text-muted-foreground/60 px-2.5 py-1 rounded-full text-[10px] font-bold border border-border/40 dark:border-zinc-700/40 uppercase tracking-wider">
                          Rank: {degree.order}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5">
                      {editingId === degree._id ? (
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
                            <div className="w-11 h-6 bg-muted dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border/50 dark:border-zinc-700/50"></div>
                          </div>
                        </label>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${degree.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-500 dark:border-zinc-700/20"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${degree.isActive
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : "bg-zinc-500 dark:bg-zinc-500"
                              }`}
                          />
                          {degree.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {editingId === degree._id ? (
                          <>
                            <Button
                              onClick={() => handleUpdate(degree._id)}
                              size="sm"
                              className="h-8 px-4 bg-primary text-primary-foreground text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1.5"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingId(null)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-4 text-muted-foreground/70 hover:text-foreground text-[11px] font-bold rounded-lg transition-all"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(degree)}
                              className="w-8 h-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(degree._id)}
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
                ))}
              </tbody>
            </table>
          </div>

          {!pageLoading && degreeTypes.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 rounded-2xl bg-muted/50 dark:bg-zinc-800/40 border border-border/30 dark:border-zinc-700/30">
                <Layers className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-base font-bold text-foreground/70 mb-1">No Degree Types Found</p>
              <p className="text-sm text-muted-foreground/50 mb-6">Add a degree type to organize your academic programs.</p>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="rounded-xl px-6 border-dashed border-2 hover:border-primary hover:text-primary transition-all"
                >
                  Create your first degree type
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

