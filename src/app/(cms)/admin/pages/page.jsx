"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";

export default function PagesListPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  //   useEffect(() => {
  //     fetchPages();
  //   }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      setPages(data);
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
  }, [])
  const handleDelete = async (slug) => {
    if (!confirm(`Delete page "${slug}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: "DELETE",
      });

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-border border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Loading Pages
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Pages</h1>
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Create and manage custom pages with dynamic sections
            </p>
          </div>
          <Button
            asChild
            className="inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-[0.98] h-auto"
          >
            <Link href="/admin/pages/new">+ Create Page</Link>
          </Button>
        </div>

        {/* Pages Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-foreground">
          {pages.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-muted-foreground font-medium mb-4">No pages yet</p>
              <Link
                href="/admin/pages/new"
                className="text-sm font-bold text-foreground hover:underline"
              >
                Create your first page
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Title
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Structure
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {pages.map((page) => (
                    <tr key={page._id} className="group hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-foreground tracking-tight">
                          {page.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-muted text-muted-foreground px-2 py-1 rounded-lg text-xs font-medium border border-border/50">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-border uppercase tracking-wider">
                          {page.sections.length} sections
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${page.isPublished
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            }`}
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors h-auto"
                        >
                          <Link href={`/admin/pages/${page.slug}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(page.slug)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors h-auto"
                        >
                          Delete
                        </Button>
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

