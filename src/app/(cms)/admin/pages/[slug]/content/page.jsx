"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import TextBlock from "../../../components/TextBlock";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { Button } from "@/components/ui/button";

export default function PageContentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const [page, setPage] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);



  const generateApiIdentifier = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const fetchPageAndContent = async () => {
    try {
      const pageRes = await fetch(`/api/admin/pages/${slug}`);
      const pageData = await pageRes.json();
      setPage(pageData);

      const contentRes = await fetch(`/api/admin/pages/${slug}/content`);
      const contentData = await contentRes.json();
      setContent(contentData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      await fetchPageAndContent();
    };

    loadData();
  }, [slug]);

  const getContentForSection = (sectionIndex, itemIndex = 0) => {
    return content.find(
      (c) => c.sectionIndex === sectionIndex && c.itemIndex === itemIndex
    );
  };

  const togglePublishStatus = async () => {
    try {
      setSaving(true);
      const newStatus = !page.isPublished;
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          description: page.description,
          sections: page.sections.map((section) => ({
            title: section.title,
            apiIdentifier:
              section.apiIdentifier || generateApiIdentifier(section.title),
            description: section.description,
            fields: section.fields.map((field) => ({
              name: field.name,
              label: field.label,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder,
              options: field.options,
            })),
            dataInstances: section.dataInstances || [],
          })),
          isPublished: newStatus,
        }),
      });

      if (res.ok) {
        setPage({ ...page, isPublished: newStatus });
        setToast({
          message: `Page set to ${newStatus ? "Published" : "Draft"}`,
          type: "success",
        });
      } else {
        const data = await res.json();
        setToast({
          message: data.error || "Failed to update status",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({ message: "Error updating status", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const saveContent = async (sectionIndex, itemIndex = 0, values) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/pages/${slug}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionIndex,
          itemIndex,
          values,
        }),
      });

      if (res.ok) {
        const savedContent = await res.json();
        setContent((prev) => {
          const filtered = prev.filter(
            (c) =>
              !(c.sectionIndex === sectionIndex && c.itemIndex === itemIndex)
          );
          return [...filtered, savedContent];
        });
        setToast({ message: "Content saved successfully", type: "success" });
      } else {
        setToast({ message: "Failed to save content", type: "error" });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setToast({ message: "Error saving content", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deleteContent = async (sectionIndex, itemIndex = 0) => {
    if (!confirm("Delete this content?")) return;

    try {
      const res = await fetch(`/api/admin/pages/${slug}/content`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionIndex, itemIndex }),
      });

      if (res.ok) {
        setContent((prev) =>
          prev.filter(
            (c) =>
              !(c.sectionIndex === sectionIndex && c.itemIndex === itemIndex)
          )
        );
        setToast({ message: "Content deleted successfully", type: "success" });
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Constructing Content Editor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-8">
        <div className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Page Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">We couldn't find the page you're looking for.</p>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 text-gray-800 dark:text-gray-200">
      <div className="flex flex-col gap-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/pages/${slug}`}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            title="Back to Page Editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{page.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Content Editor</span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-mono">/{slug}</code>
            </div>
          </div>
          <div className="ml-auto">
            <Button
              onClick={() => setShowStatusModal(true)}
              disabled={saving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 shadow-sm ${page.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-md"
                : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:shadow-md"
                } ${saving ? "opacity-50 cursor-not-allowed" : ""} h-auto`}
              title={page.isPublished ? "Set as Draft" : "Publish Page"}
            >
              <span className={`w-2 h-2 rounded-full ${page.isPublished ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"}`} />
              {page.isPublished ? "Published" : "Draft"}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sections List (Sidebar) */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{page.title} Sections</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex flex-col">
                {page.sections.map((section, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    onClick={() => setActiveSection(idx)}
                    className={`px-4 py-4 text-left transition-all group flex items-center justify-between border-b border-gray-50 dark:border-gray-800 last:border-b-0 rounded-none h-auto ${activeSection === idx
                      ? "bg-gray-100 dark:bg-gray-800 border-l-4 border-l-black dark:border-l-white pl-3"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent"
                      }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${activeSection === idx ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white"}`}>
                        {section.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5 group-hover:text-gray-500 dark:group-hover:text-gray-400">
                        {section.fields.length} Fields
                      </p>
                    </div>
                    {activeSection === idx && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="lg:col-span-3">
            {page.sections[activeSection] && (
              <SectionContentEditor
                key={activeSection}
                section={page.sections[activeSection]}
                sectionIndex={activeSection}
                content={content.filter((c) => c.sectionIndex === activeSection)}
                onSave={saveContent}
                onDelete={deleteContent}
                saving={saving}
                slug={slug}
              />
            )}
          </div>
        </div>
      </div>

      {showStatusModal && (
        <StatusConfirmationModal
          currentStatus={page.isPublished ? "Published" : "Draft"}
          onConfirm={() => {
            togglePublishStatus();
            setShowStatusModal(false);
          }}
          onCancel={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
}

function SectionContentEditor({
  section,
  sectionIndex,
  content,
  onSave,
  onDelete,
  saving,
  slug,
}) {
  const [itemIndex, setItemIndex] = useState(0);
  const [formValues, setFormValues] = useState(() => {
    const firstItem = content.find(c => c.itemIndex === 0);

    if (firstItem?.values) return firstItem.values;

    return section.fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {});
  });

  const currentContent = content.find((c) => c.itemIndex === itemIndex);

  // Initialize form values on mount and when itemIndex or content changes
  //   useEffect(() => {
  //     if (currentContent?.values) {
  //       setFormValues(currentContent.values);
  //     } else {
  //       const initial = {};
  //       section.fields.forEach((field) => {
  //         initial[field.name] = currentContent?.values?.[field.name] || "";
  //       });
  //       setFormValues(initial);
  //     }
  //   }, [itemIndex, currentContent, section.fields]);



  const handleInputChange = (fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = () => {
    onSave(sectionIndex, itemIndex, formValues);
  };

  const handleAddItem = () => {
    const sectionContent = content.filter(
      (c) => c.sectionIndex === sectionIndex
    );

    const maxIndex = Math.max(
      -1,
      ...sectionContent.map((c) => c.itemIndex)
    );

    const newIndex = maxIndex + 1;
    setItemIndex(newIndex);

    // Initialize empty form values for new item
    const initial = {};
    section.fields.forEach((field) => {
      initial[field.name] = "";
    });

    setFormValues(initial);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 transition-all">
      {/* Section Info */}
      <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-800/20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{section.title}</h2>
            {section.description ? (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">{section.description}</p>
            ) : (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Managing {content.length} Items</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          {content.length === 0 && (
            <Button
              onClick={handleAddItem}
              className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-sm transition-all shadow-sm flex items-center gap-2 h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
              Initialize Data
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 dark:disabled:bg-gray-700 font-bold text-sm transition-all shadow-md flex items-center gap-2 h-auto"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Save Item
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Items Tabs */}
      <div className="px-8 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/10 dark:bg-gray-800/20 flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {content.map((item) => (
            <div key={item.itemIndex} className="group flex items-center relative">
              <Button
                onClick={() => {
                  setItemIndex(item.itemIndex);
                  const existing = content.find((c) => c.itemIndex === item.itemIndex);
                  const nextValues = existing?.values || section.fields.reduce((acc, field) => {
                    acc[field.name] = "";
                    return acc;
                  }, {});
                  setFormValues(nextValues);
                }}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all h-auto ${itemIndex === item.itemIndex
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                  : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                Item {item.itemIndex + 1}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(sectionIndex, item.itemIndex); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white dark:border-gray-900 shadow-sm p-0 hover:bg-red-600 hover:text-white"
              >
                ✕
              </Button>
            </div>
          ))}
          {content.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {section.fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={formValues[field.name] || ""}
              onChange={(value) => handleInputChange(field.name, value)}
            />
          ))}
        </div>

        {section.fields.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300 dark:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h10" /></svg>
            </div>
            <p className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-xs">No fields defined</p>
            <Link href={`/admin/pages/${slug}`} className="text-black dark:text-white text-sm font-bold mt-2 hover:underline">Go to Model Editor to add fields</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ field, value, onChange }) {
  const isRequired = field.required;

  const inputClasses = "w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-950 transition-all text-sm font-semibold outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600";

  const renderInput = () => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className={inputClasses}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            rows="4"
            className={`${inputClasses} resize-none`}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className={inputClasses}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className={inputClasses}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClasses}
          />
        );

      case "image":
        return (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste Image URL here..."
                className={inputClasses}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
              </div>
            </div>
            {value && (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden inline-block shadow-sm">
                <img
                  src={value}
                  alt="Preview"
                  className="max-w-xs max-h-64 rounded-3xl object-cover"
                />
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`${inputClasses} appearance-none cursor-pointer pr-10`}
            >
              <option value="" className="dark:bg-gray-900">Select an option</option>
              {field.options?.map((option) => (
                <option key={option} value={option} className="dark:bg-gray-900">
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-3 cursor-pointer group/check w-fit">
            <div className="relative">
              <input
                type="checkbox"
                checked={value === true || value === "true"}
                onChange={(e) => onChange(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 peer-checked:bg-black dark:peer-checked:bg-white rounded-full transition-all duration-300"></div>
              <div className="absolute top-1 left-1 w-4 h-4 bg-white dark:bg-gray-300 rounded-full transition-all duration-300 peer-checked:translate-x-4 shadow-sm"></div>
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover/check:text-black dark:group-hover/check:text-white transition-colors">Enabled</span>
          </label>
        );

      case "richtext":
        return (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <TextBlock
              value={value || ""}
              onChange={onChange}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          {field.label}
          {isRequired && (
            <span className="w-1.5 h-1.5 bg-red-400 dark:bg-red-500 rounded-full" title="Required field"></span>
          )}
        </label>
        {field.type !== 'checkbox' && field.type !== 'richtext' && (
          <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-tighter">
            {field.type}
          </span>
        )}
      </div>
      {renderInput()}
      {field.placeholder && field.type !== "image" && field.type !== 'textarea' && field.type !== 'text' && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium px-1 italic">
          {field.placeholder}
        </p>
      )}
    </div>
  );
}

function StatusConfirmationModal({ currentStatus, onConfirm, onCancel }) {
  const isPublished = currentStatus === "Published";
  const targetStatus = isPublished ? "Draft" : "Published";

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden border border-white/50 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPublished ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
            }`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Change Status?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Do you want to make this page <span className={`font-bold ${isPublished ? "text-amber-600" : "text-emerald-600"}`}>{targetStatus}</span>?
          </p>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            className={`w-full py-4 text-white rounded-2xl font-bold text-sm transition-all shadow-lg h-auto ${isPublished
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              }`}
          >
            Yes, mark as {targetStatus}
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-sm transition-all h-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
