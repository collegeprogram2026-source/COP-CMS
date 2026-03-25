"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function CreatePageDialog({ children, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.title || !formData.slug) {
      setError("Title and slug are required");
      setLoading(false);
      return;
    }

    try {
      const res = await callApi("/api/admin/pages", {
        method: "POST",
        auth: true,
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setOpen(false);
        if (onSuccess) onSuccess();
        router.push(`/admin/pages/${data.slug}`);
      } else {
        setError(data.error || "Failed to create page");
      }
    } catch (err) {
      console.error("Error creating page:", err);
      setError("Error creating page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-bold transition-all shadow-md h-auto">
            + Create Page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Page</DialogTitle>
          <DialogDescription>
            Initialize content structure for your new page
          </DialogDescription>
        </DialogHeader>

        <form id="create-page-dialog-form" onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Error/Alert */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-rose-500 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g., About Us, Services"
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Page Slug <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">/</span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^\w-]+/g, ""),
                    })
                  }
                  placeholder="auto-generated-slug"
                  className="w-full pl-7 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-mono transition-all"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Briefly describe the purpose of this page..."
                rows="3"
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-border px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 font-bold transition-all shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                "Create Page"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
