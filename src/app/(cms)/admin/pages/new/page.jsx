"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreatePagePage() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
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
    <div className="max-w-7xl mx-auto p-8 text-gray-800 min-h-screen">
      <form id="create-page-form" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8">
          {/* Header Navigation */}
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="p-2 text-muted-foreground hover:text-black hover:bg-muted rounded-lg transition-all"
              title="Back to Pages"
            >
              <Link href="/admin/pages">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-200"></div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Create New Page</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Initialize content structure</p>
            </div>

            <div className="ml-auto flex gap-3">
              <Button
                asChild
                className="px-6 py-2.5 bg-card border border-border/50 text-muted-foreground rounded-xl hover:bg-muted/50 font-semibold transition-all shadow-sm flex items-center justify-center h-auto"
              >
                <Link href="/admin/pages">Cancel</Link>
              </Button>
              <Button
                type="submit"
                form="create-page-form"
                disabled={loading}
                className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 h-auto"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                    Create Page
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error/Alert */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-red-100 rounded-2xl text-rose-500 shadow-sm animate-in fade-in slide-in-from-top-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 bg-muted/50/10">
                  <h2 className="text-lg font-bold text-gray-900">General Information</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Basic page identification and SEO</p>
                </div>
                <div className="p-8 space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Page Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="e.g., About Us, Services, Contact"
                      className="w-full px-5 py-3.5 bg-muted/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/50/10 focus:border-blue-500 focus:bg-card transition-all text-sm font-semibold outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Briefly describe the purpose of this page..."
                      rows="6"
                      className="w-full px-5 py-3.5 bg-muted/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/50/10 focus:border-blue-500 focus:bg-card transition-all text-sm font-semibold outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar/Refined Options */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 bg-muted/50/10">
                  <h2 className="text-lg font-bold text-gray-900">URL Settings</h2>
                </div>
                <div className="p-8 space-y-6">
                  {/* Slug */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Page Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
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
                        placeholder="auto-generated-id"
                        className="w-full pl-10 pr-5 py-3.5 bg-muted/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/50/10 focus:border-blue-500 focus:bg-card transition-all text-sm font-mono outline-none"
                      />
                    </div>
                    <p className="px-1 text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                      This defines the final URL path for the page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  Quick Tip
                </h3>
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  After creating the page, you'll be redirected to the Content Model editor where you can define sections like Hero, Features, or Contact Forms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}



