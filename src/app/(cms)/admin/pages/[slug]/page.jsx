"use client";
import { Toast } from "@/app/(cms)/admin/components/toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FIELD_TYPES = [
  "text",
  "textarea",
  "richtext",
  "image",
  "number",
  "email",
  "date",
  "select",
  "checkbox",
];

const FIELD_TYPE_DETAILS = {
  text: {
    label: "Text",
    description: "Short titles, names, paragraphs, or lists",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3" /><path d="M21 12.1H3" /><path d="M15.1 18.1H3" /></svg>
    ),
  },
  textarea: {
    label: "Long Text",
    description: "Multi-line text for descriptions or content",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
  },
  richtext: {
    label: "Rich text",
    description: "Text formatting with references and media",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h10" /></svg>
    ),
  },
  image: {
    label: "Media",
    description: "Images, videos, PDFs and other files",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
    ),
  },
  number: {
    label: "Number",
    description: "ID, order number, rating, or quantity",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
    ),
  },
  email: {
    label: "Email",
    description: "Validated email address field",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
    ),
  },
  date: {
    label: "Date and time",
    description: "Event dates, deadlines, and schedules",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
  },
  select: {
    label: "Selection",
    description: "Choose from a pre-defined list of options",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="2" ry="2" /><path d="m16 10-4 4-4-4" /></svg>
    ),
  },
  checkbox: {
    label: "Boolean",
    description: "Yes or no, 1 or 0, true or false",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="m9 12 2 2 4-4" /></svg>
    ),
  },
};

export default function EditPagePage({ params: paramsPromise }) {
  const [params, setParams] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [pendingPath, setPendingPath] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const [toast, setToast] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const router = useRouter();

  // Unwrap params
  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  useEffect(() => {
    if (params?.slug) {
      fetchPage();
    }
  }, [params]);

  // Prevent accidental navigation/closing if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const generateApiIdentifier = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${params.slug}`);
      if (res.ok) {
        const data = await res.json();

        // Migrate old sections that have 'type' but not 'apiIdentifier'
        if (data.sections) {
          data.sections = data.sections.map((section) => {
            if (!section.apiIdentifier && section.title) {
              return {
                ...section,
                apiIdentifier: generateApiIdentifier(section.title),
              };
            }
            return section;
          });
        }

        setPage(data);
        setHasChanges(false);
      } else {
        setError("Page not found");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching page:", err);
      setError("Error loading page");
      setLoading(false);
    }
  };

  const navigateGuarded = (path) => {
    if (hasChanges) {
      setPendingPath(path);
      setShowConfirmModal(true);
    } else {
      router.push(path);
    }
  };

  const handleConfirmNavigate = async (shouldSave) => {
    setShowConfirmModal(false);
    if (shouldSave) {
      const success = await handleSave();
      if (success) {
        router.push(pendingPath);
      }
    } else {
      router.push(pendingPath);
    }
  };

  const handleCreateContentModel = (title, apiIdentifier, description = "") => {
    if (!title || !apiIdentifier) return;

    const newSection = {
      _id: new Date().getTime().toString(),
      title,
      apiIdentifier,
      description,
      fields: [],
      dataInstances: [],
    };

    setPage({
      ...page,
      sections: [...page.sections, newSection],
    });
    setHasChanges(true);
    setActiveSection(newSection._id);
    setShowCreateModal(false);
  };

  const handleDeleteSection = (sectionId) => {
    setSectionToDelete(sectionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSection = () => {
    if (!sectionToDelete) return;
    setPage({
      ...page,
      sections: page.sections.filter((s) => s._id !== sectionToDelete),
    });
    setHasChanges(true);
    setActiveSection(null);
    setShowDeleteConfirm(false);
    setSectionToDelete(null);
  };

  const handleSectionChange = (sectionId, field, value) => {
    setPage({
      ...page,
      sections: page.sections.map((s) =>
        s._id === sectionId ? { ...s, [field]: value } : s
      ),
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!page.title || !page.slug) {
      setError("Title and slug are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          description: page.description,
          sections: page.sections.map((section) => ({
            title: section.title,
            apiIdentifier: section.apiIdentifier || generateApiIdentifier(section.title),
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
          isPublished: page.isPublished,
        }),
      });

      if (res.ok) {
        setToast({ message: "Page saved successfully", type: "success" });
        setHasChanges(false);
        return true;
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save page");
        return false;
      }
    } catch (err) {
      console.error("Error saving page:", err);
      setError("Error saving page");
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Constructing Editor...</p>
        </div>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 p-8">
        <div className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Editor Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
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

  if (!page) return null;

  const currentSection = activeSection
    ? page.sections.find((s) => s._id === activeSection)
    : null;

  return (
    <div className="max-w-7xl mx-auto p-8 text-gray-800 dark:text-gray-200">
      <div className="flex flex-col gap-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateGuarded("/admin/pages")}
            className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            title="Back to Pages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{page.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Model Editor</span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-mono">/{page.slug}</code>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button
              onClick={() => setShowStatusModal(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 shadow-sm ${page.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-md"
                : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:shadow-md"
                }`}
              title={page.isPublished ? "Set as Draft" : "Publish Page"}
            >
              <span className={`w-2 h-2 rounded-full ${page.isPublished ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"}`} />
              {page.isPublished ? "Published" : "Draft"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateGuarded(`/admin/pages/${page.slug}/content`)}
              className="px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all shadow-sm flex items-center gap-2 h-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
              Content
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 dark:disabled:bg-gray-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 h-auto"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                  Save Schema
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error/Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-400 shadow-sm animate-in fade-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Define sections and input fields for this page</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 font-bold transition-all shadow-sm h-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14" /></svg>
            New Content Model
          </Button>
        </div>

        {/* Content Models Inventory */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Registered Models</h2>
            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              {page.sections.length} Sections
            </span>
          </div>

          {page.sections.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">No Content Models Yet</p>
              <p className="text-gray-400 dark:text-gray-500 mt-2 max-w-xs mx-auto text-sm">Create a content model to define the structure of your page sections.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Structure</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Identifier</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {page.sections.map((section) => (
                    <tr
                      key={section._id}
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group ${activeSection === section._id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                      onClick={() => setActiveSection(section._id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{section.title}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{section.fields.length} Input Fields</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 font-mono">{section.apiIdentifier}</code>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${section.fields.length === 0
                            ? "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                            : "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                            }`}
                        >
                          <span className={`w-1 h-1 rounded-full mr-1.5 ${section.fields.length === 0 ? "bg-yellow-500" : "bg-green-500"}`}></span>
                          {section.fields.length === 0 ? "Needs Fields" : "Ready"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleDeleteSection(section._id); }}
                            className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Delete Section"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </Button>
                          <div className="p-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase self-center">Manage</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Content Model Details */}
        {currentSection && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/10 dark:bg-gray-800/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentSection.title}</h2>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">API: <span className="text-gray-600 dark:text-gray-400 font-mono lowercase">{currentSection.apiIdentifier}</span></p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSectionToEdit(currentSection._id);
                  setShowFieldModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-sm transition-all shadow-sm h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14" /></svg>
                Add Field
              </Button>
            </div>

            <div className="p-6">
              {currentSection.fields.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center">
                  <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-1">No schema defined for this section</p>
                  <p className="text-gray-300 dark:text-gray-600 text-xs">Add fields like text, image, or numbers to build the model.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentSection.fields.map((field) => (
                    <div
                      key={field._id}
                      className="group flex flex-col p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-400 transition-all"></div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="text-[10px] bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{field.label}</p>
                      <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-1">{field.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals are handled conditionally below */}
      {showCreateModal && (
        <CreateContentModelModal
          onSave={handleCreateContentModel}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showFieldModal && sectionToEdit && (
        <FieldModal
          section={page.sections.find((s) => s._id === sectionToEdit)}
          onSave={(fields) => {
            setPage({
              ...page,
              sections: page.sections.map((s) =>
                s._id === sectionToEdit ? { ...s, fields } : s
              ),
            });
            setHasChanges(true);
            setShowFieldModal(false);
          }}
          onClose={() => setShowFieldModal(false)}
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          onConfirm={() => handleConfirmNavigate(true)}
          onDiscard={() => handleConfirmNavigate(false)}
          onCancel={() => setShowConfirmModal(false)}
          saving={saving}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          onConfirm={confirmDeleteSection}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSectionToDelete(null);
          }}
        />
      )}

      {showStatusModal && (
        <StatusConfirmationModal
          currentStatus={page.isPublished ? "Published" : "Draft"}
          onConfirm={() => {
            setPage({ ...page, isPublished: !page.isPublished });
            setHasChanges(true);
            setShowStatusModal(false);
          }}
          onCancel={() => setShowStatusModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function ConfirmationModal({ onConfirm, onDiscard, onCancel, saving }) {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden border border-white/50 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Unsaved Changes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            You have unsaved modifications to your content model. Would you like to save them before leaving?
          </p>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            disabled={saving}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 h-auto"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            )}
            Save and Continue
          </Button>
          <Button
            onClick={onDiscard}
            disabled={saving}
            variant="outline"
            className="w-full py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-sm transition-all h-auto"
          >
            Discard Changes
          </Button>
          <Button
            onClick={onCancel}
            disabled={saving}
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


function CreateContentModelModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [apiIdentifier, setApiIdentifier] = useState("");
  const [description, setDescription] = useState("");

  const generateApiIdentifier = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setApiIdentifier(generateApiIdentifier(newTitle));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !apiIdentifier.trim()) return;
    onSave(title, apiIdentifier, description);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-md w-full overflow-hidden border border-white/50 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Create Model</h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Define new content structure</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Section Title</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g., Hero Features"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 transition-all text-sm font-semibold outline-none text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
              API Identifier
              <span className="text-[10px] lowercase font-normal italic text-gray-400">Read-only auto-gen</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                value={apiIdentifier}
                readOnly
                className="w-full px-5 py-3.5 bg-gray-100/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 dark:text-gray-400 font-mono text-xs cursor-not-allowed outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of content does this hold?"
              rows="3"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 transition-all text-sm font-semibold outline-none resize-none text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 px-6 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-sm transition-all h-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-[2] px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-sm transition-all shadow-lg hover:shadow-black/20 dark:hover:shadow-white/10 h-auto"
            >
              Initialize Model
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldModal({ section, onSave, onClose }) {
  const [fields, setFields] = useState(section.fields || []);
  const [isSelectingType, setIsSelectingType] = useState(false);

  const handleAddField = () => {
    setIsSelectingType(true);
  };

  const handleTypeSelect = (type) => {
    const newField = {
      _id: new Date().getTime().toString(),
      name: "",
      label: "",
      type: type,
      required: false,
      placeholder: "",
      options: type === "select" ? [] : undefined,
    };
    setFields([...fields, newField]);
    setIsSelectingType(false);
  };

  const handleFieldChange = (fieldId, field, value) => {
    setFields(
      fields.map((f) => {
        if (f._id === fieldId) {
          const updated = { ...f, [field]: value };
          if (field === "name") {
            updated.label = value;
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleDeleteField = (fieldId) => {
    setFields(fields.filter((f) => f._id !== fieldId));
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/50 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {isSelectingType ? "Select Field Type" : "Define Fields"}
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              {isSelectingType ? "Choose the best input for your data" : `${section.title} Schema`}
            </p>
          </div>
          <Button
            onClick={isSelectingType ? () => setIsSelectingType(false) : onClose}
            variant="ghost"
            size="icon"
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm h-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {isSelectingType ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {Object.entries(FIELD_TYPE_DETAILS).map(([type, details]) => (
                <Button
                  key={type}
                  variant="ghost"
                  onClick={() => handleTypeSelect(type)}
                  className="flex flex-col items-start text-left p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden active:scale-95 h-auto w-full block"
                >
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-4">
                    {details.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{details.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {details.description}
                  </p>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {fields.map((field, idx) => (
                <div
                  key={field._id}
                  className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-3xl space-y-5 relative group transition-all hover:bg-white dark:hover:bg-gray-800 hover:border-blue-100 dark:hover:border-blue-900 inherit-shadow shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Input Definition</h3>
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">
                          {field.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(field._id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all h-auto"
                      title="Remove Field"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Field Name</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleFieldChange(field._id, "name", e.target.value)}
                        placeholder="e.g., subtitle, slug"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Field Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFieldChange(field._id, "label", e.target.value)}
                        placeholder="e.g., Section Subtitle"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Input Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleFieldChange(field._id, "type", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {FIELD_TYPE_DETAILS[type]?.label || type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center pt-5 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer group/check">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(field._id, "required", e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600 rounded-full transition-all duration-300"></div>
                          <div className="absolute top-1 left-1 w-4 h-4 bg-white dark:bg-gray-300 rounded-full transition-all duration-300 peer-checked:translate-x-4 shadow-sm"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover/check:text-black dark:group-hover/check:text-white transition-colors">Required Field</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Placeholder Context</label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => handleFieldChange(field._id, "placeholder", e.target.value)}
                      placeholder="Helpful hint for content editors..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddField}
                className="w-full py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all flex items-center justify-center gap-2 h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
                Add New Field Definition
              </Button>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-sm transition-all"
          >
            Cancel
          </button>
          {!isSelectingType && (
            <button
              onClick={() => onSave(fields)}
              className="flex-[2] px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              Commit Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/40 flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden border border-white/50 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Delete Section?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            This action cannot be undone. All fields in this section will be permanently removed.
          </p>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 font-bold text-sm transition-all shadow-lg shadow-red-500/20"
          >
            Yes, Delete Section
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
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
            variant="ghost"
            onClick={onCancel}
            className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-sm transition-all h-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
