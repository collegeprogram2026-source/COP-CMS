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
import { AlertCircle, Loader2, Plus } from "lucide-react";

export function CreatePageDialog({ children, onSuccess }) {
  const [formData, setFormData] = useState({ title: "", slug: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateSlug = (title) =>
    title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({ ...formData, title, slug: generateSlug(title) });
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

  const inp = "w-full px-4 py-3 bg-muted/30 dark:bg-zinc-800/40 border border-border/60 dark:border-zinc-700/60 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/60 outline-none text-sm transition-all placeholder:text-muted-foreground/40 dark:text-foreground";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold transition-all shadow-md h-auto flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] dark:bg-zinc-900 dark:border-zinc-800/60">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight">Create New Page</DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            Initialize content structure for your new page
          </DialogDescription>
        </DialogHeader>

        <form id="create-page-dialog-form" onSubmit={handleSubmit} className="space-y-5 pt-4">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest ml-1">
                Page Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g., About Us, Services"
                className={inp}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest ml-1">
                Page Slug <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xs font-mono">/</span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""),
                    })
                  }
                  placeholder="auto-generated-slug"
                  className={inp + " pl-7 font-mono dark:bg-zinc-950/50"}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Briefly describe the purpose of this page..."
                rows="3"
                className={inp + " resize-none"}
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-3 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-border/60 dark:border-zinc-700/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 px-6 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Page
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}