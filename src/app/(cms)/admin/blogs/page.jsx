"use client";

import { useEffect, useState } from "react";
import BlogForm from "../components/BlogForm";
import { Button } from "@/components/ui/button";

// ─── Helpers ─────────────────────────────────────────────────────────

const slugify = (str = "") =>
  str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

// ─── Empty Form ──────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  slug: "",
  summary: "",
  thumbnail: "",
  readingTime: 0,
  status: "draft",
  tags: [],
  author: {
    name: "",
    photo: "",
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
  },
  content: [],
};

// ─── Main Page ───────────────────────────────────────────────────────

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // ─── Fetch Blogs ───────────────────────────────────────────────────

  const fetchBlogs = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch("/api/admin/blogs", { cache: "no-store" });
      const data = await res.json();
      setBlogs(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ─── Create Blog ───────────────────────────────────────────────────

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required!");

    setLoading(true);

    await fetch("/api/admin/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm(EMPTY_FORM);
    setShowForm(false);
    setLoading(false);
    fetchBlogs();
  };

  // ─── Edit Blog ─────────────────────────────────────────────────────

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      summary: item.summary || "",
      thumbnail: item.thumbnail || "",
      readingTime: item.readingTime || 0,
      status: item.status || "draft",
      tags: item.tags || [],
      author: item.author || { name: "", photo: "" },
      seo: item.seo || {
        metaTitle: "",
        metaDescription: "",
        canonicalUrl: "",
      },
      content: item.content || [],
    });

    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Update Blog ───────────────────────────────────────────────────

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required!");

    setLoading(true);

    await fetch(`/api/admin/blogs/${form.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoading(false);
    fetchBlogs();
  };

  // ─── Delete Blog ───────────────────────────────────────────────────

  const handleDelete = async (slug) => {
    if (!confirm("Delete this blog?")) return;

    await fetch(`/api/admin/blogs/${slug}`, {
      method: "DELETE",
    });

    fetchBlogs();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ─── Status Badge ──────────────────────────────────────────────────

  const statusBadge = (status) =>
    status === "published"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-amber-50 text-amber-700 border border-amber-200";

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blogs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage blog posts and content blocks
            </p>
          </div>

          {!editingId && (
            <Button
              onClick={() => {
                setShowForm((v) => !v);
                setForm(EMPTY_FORM);
              }}
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted transition-colors h-auto"
            >
              {showForm ? "✕ Close" : "+ New Blog"}
            </Button>
          )}
        </div>

        {/* ── Create Form ── */}
        {showForm && !editingId && (
          <div className="mb-8">
            <BlogForm
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              loading={loading}
              submitLabel="Create Blog"
              onCancel={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
            />
          </div>
        )}

        {/* ── Edit Form ── */}
        {editingId && (
          <div className="mb-8">
            <BlogForm
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              loading={loading}
              submitLabel="Update Blog"
              onCancel={cancelEdit}
            />
          </div>
        )}

        {/* ── Blogs Table ── */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              All Blogs
            </span>
            <span className="text-xs text-muted-foreground">
              {blogs.length} total
            </span>
          </div>

          {fetchLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-sm">
                No blogs yet. Create one above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border/50">
                    {["Title", "Slug", "Status", "Created", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {blogs.map((item) => (
                    <tr key={item._id} className="hover:bg-muted transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {item.title}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {item.slug}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(item)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors h-auto"
                          >
                            Edit
                          </Button>

                          <Button
                            onClick={() => handleDelete(item.slug)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-rose-500 font-semibold px-2 py-1 rounded hover:bg-rose-500/10 transition-colors h-auto"
                          >
                            Delete
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
    </div>
  );
}
