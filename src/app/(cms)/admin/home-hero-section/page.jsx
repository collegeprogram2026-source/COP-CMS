"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// ─── UI Helpers ───────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

const inp =
  "border-2 border-border bg-card px-3 py-2.5 rounded-lg text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-border w-full " +
  "placeholder-slate-400 transition-colors hover:border-border";

const EMPTY_FORM = { title: "", subtitle: "", banner: { url: "", alt: "" } };

// ─── Main Page ────────────────────────────────────────────────────────

export default function HomeHeroSectionPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        const res = await fetch("/api/admin/home-hero-section");
        const data = await res.json();
        if (data.slides) setSlides(data.slides);
      } catch (error) {
        console.error("Error fetching hero section:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroSection();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("banner.")) {
      const bannerField = name.split(".")[1];
      setFormData({ ...formData, banner: { ...formData.banner, [bannerField]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddSlide = () => {
    if (!formData.title || !formData.banner.url) return setToast({ message: "Title and banner URL are required", type: "error" });
    if (slides.length >= 5) return setToast({ message: "Maximum 5 slides allowed", type: "error" });
    setSlides([...slides, { ...formData, localId: Date.now().toString() }]);
    setFormData(EMPTY_FORM);
  };

  const handleEditSlide = (index) => {
    setFormData(slides[index]);
    setEditingIndex(index);
  };

  const handleUpdateSlide = () => {
    if (!formData.title || !formData.banner.url) return setToast({ message: "Title and banner URL are required", type: "error" });
    const updated = [...slides];
    updated[editingIndex] = formData;
    setSlides(updated);
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteSlide = (index) => {
    if (confirm("Delete this slide?")) setSlides(slides.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (slides.length === 0) return setToast({ message: "Please add at least one slide", type: "error" });
    setSaving(true);
    try {
      // Remove localId and _id from new slides before sending
      const slidesToSave = slides.map(slide => {
        const { localId, ...slideData } = slide;
        return slideData;
      });
      const res = await fetch("/api/admin/home-hero-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: slidesToSave }),
      });
      const data = await res.json();
      if (res.ok) setToast({ message: "Hero section saved successfully", type: "success" });
      else setToast({ message: data.error || "Failed to save", type: "error" });
    } catch (error) {
      setToast({ message: "Error saving hero section", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hero Section Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage homepage hero slides and banners</p>
          </div>

          <Button
            onClick={handleSaveAll}
            disabled={saving || slides.length === 0}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors h-auto"
          >
            {saving ? "Saving..." : "💾 Save All"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Form Panel ── */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="bg-primary px-6 py-4">
              <h2 className="text-white font-semibold text-sm tracking-wide">
                {editingIndex !== null ? "✏️ Edit Slide" : "➕ New Slide"}
              </h2>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Content ── */}
              <div>
                <SectionHeader title="Slide Content" />
                <div className="space-y-4">

                  <Field label="Title *">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Discover Your Dream University"
                      className={inp}
                    />
                  </Field>

                  <Field label="Subtitle">
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Expert guidance for global admissions"
                      className={inp}
                    />
                  </Field>

                </div>
              </div>

              {/* ── Banner ── */}
              <div>
                <SectionHeader title="Banner Image" />
                <div className="space-y-4">

                  <Field label="Image URL *">
                    <input
                      type="text"
                      name="banner.url"
                      value={formData.banner.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/hero-image.jpg"
                      className={inp}
                    />
                  </Field>

                  <Field label="Alt Text" hint="Describe the image for accessibility">
                    <input
                      type="text"
                      name="banner.alt"
                      value={formData.banner.alt}
                      onChange={handleInputChange}
                      placeholder="e.g. Students walking on campus"
                      className={inp}
                    />
                  </Field>

                  {/* Preview */}
                  {formData.banner.url ? (
                    <img
                      src={formData.banner.url}
                      alt={formData.banner.alt || "Preview"}
                      className="w-full h-44 object-cover rounded-lg border-2 border-border"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x300?text=Image+Not+Found";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-44 rounded-lg border-2 border-dashed border-border bg-muted text-muted-foreground text-xs">
                      Banner preview will appear here
                    </div>
                  )}

                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2 border-t border-border/50">
                {editingIndex !== null ? (
                  <>
                    <Button
                      onClick={handleUpdateSlide}
                      className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted transition-colors h-auto"
                    >
                      Update Slide
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors h-auto"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAddSlide}
                    className="w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted transition-colors h-auto"
                  >
                    + Add Slide
                  </Button>
                )}
              </div>

            </div>
          </div>

          {/* ── Slides List Panel ── */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">All Slides</span>
              <span className="text-xs font-semibold bg-muted text-muted-foreground rounded-full px-2.5 py-0.5">
                {slides.length} / 5
              </span>
            </div>

            <div className="p-6">
              {slides.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-border text-muted-foreground gap-2">
                  <span className="text-2xl">🖼️</span>
                  <p className="text-xs">No slides yet — add one from the form</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.localId || slide._id || index}
                      className={`
                        flex gap-3 p-3 rounded-xl border-2 transition-colors
                        ${editingIndex === index
                          ? "border-primary bg-muted"
                          : "border-border hover:border-border"
                        }
                      `}
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-border bg-muted">
                        <img
                          src={slide.banner.url}
                          alt={slide.banner.alt || "Slide"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100x80?text=No+Image";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {slide.title}
                        </p>
                        {slide.subtitle && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {slide.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate mt-1 font-mono">
                          {slide.banner.url}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
                        <Button
                          onClick={() => handleEditSlide(index)}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors h-auto"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteSlide(index)}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-500 hover:text-rose-500 font-semibold px-2 py-1 rounded hover:bg-rose-500/10 transition-colors h-auto"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slot indicators */}
              {slides.length > 0 && slides.length < 5 && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  {5 - slides.length} slot{5 - slides.length !== 1 ? "s" : ""} remaining
                </p>
              )}
              {slides.length === 5 && (
                <p className="text-xs text-amber-500 text-center mt-4 font-medium">
                  ⚠️ Maximum of 5 slides reached
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
