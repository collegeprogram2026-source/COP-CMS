"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreatePageDialog } from "@/components/cms/CreatePageDialog";
import { FileText, Pencil, Trash2, Loader2, ChevronRight } from "lucide-react";
import { callApi } from "@/lib/apiClient";

export default function PagesListPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const fetchPages = async () => {
    try {
      const res = await callApi("/api/admin/pages", { auth: true });
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPages();
    };
    loadData();
  }, []);

  const handleDelete = async (slug) => {
    if (!confirm(`Delete page "${slug}"?`)) return;
    try {
      const res = await callApi(`/api/admin/pages/${slug}`, { method: "DELETE", auth: true });
      if (res.ok) {
        setToast({ message: "Page deleted successfully", type: "success" });
        setPages(pages.filter((p) => p.slug !== slug));
      } else {
        setToast({ message: "Failed to delete page", type: "error" });
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      setToast({ message: "Error deleting page", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest animate-pulse">
          Loading Pages
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary ring-1 ring-primary/20">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Pages</h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground/70 mt-1 ml-[52px]">
              Create and manage custom pages with dynamic sections
            </p>
          </div>
          <CreatePageDialog onSuccess={fetchPages} />
        </div>

        {/* ── Table ── */}
        <div className="bg-card dark:bg-zinc-900/50 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-sm dark:shadow-zinc-950/40 overflow-hidden text-foreground">

          {/* Table header bar */}
          <div className="px-8 py-5 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              All Pages
            </h2>
            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/50 dark:bg-zinc-800/60 px-3 py-1 rounded-full border border-border/40 dark:border-zinc-700/40">
              {pages.length} total
            </span>
          </div>

          {pages.length === 0 ? (
            <div className="p-16 text-center">
              <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 rounded-2xl bg-muted/50 dark:bg-zinc-800/40 border border-border/30 dark:border-zinc-700/30">
                <FileText className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-base font-semibold text-foreground/70 mb-1">No pages yet</p>
              <p className="text-sm text-muted-foreground/50 mb-4">Get started by creating your first page.</p>
              <CreatePageDialog onSuccess={fetchPages}>
                <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                  Create your first page
                </button>
              </CreatePageDialog>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/20 dark:bg-zinc-800/20 border-b border-border/40 dark:border-zinc-800/60">
                    {["Title", "Slug", "Structure", "Status", "Actions"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap ${i === 4 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 dark:divide-zinc-800/50">
                  {pages.map((page) => (
                    <tr key={page._id} className="group hover:bg-muted/20 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-foreground tracking-tight">
                          {page.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground/70 px-2 py-1 rounded-md text-[10px] font-mono italic border border-border/30 dark:border-zinc-700/30">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center bg-muted/50 dark:bg-zinc-800/40 text-muted-foreground/60 px-2.5 py-1 rounded-full text-[10px] font-bold border border-border/40 dark:border-zinc-700/40 uppercase tracking-wider">
                          {page.sections.length} sections
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${page.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/20"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${page.isPublished ? "bg-emerald-500 dark:bg-emerald-400" : "bg-amber-500 dark:bg-amber-400"}`} />
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                            title="Edit"
                          >
                            <Link href={`/admin/pages/${page.slug}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(page.slug)}
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
    </div>
  );
}