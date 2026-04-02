"use client";

import { Toast } from "@/app/(cms)/admin/components/toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";
import {
  AlignLeft,
  AlignJustify,
  LayoutTemplate,
  Image as ImageIcon,
  Hash,
  Mail,
  Calendar,
  ChevronDown,
  CheckSquare,
  ChevronLeft,
  Save,
  FileText,
  Plus,
  X,
  Trash2,
  Loader2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Lock,
  PlusCircle,
  Layers,
  Settings,
  GripVertical,
} from "lucide-react";

const FIELD_TYPES = [
  "text", "textarea", "richtext", "image",
  "number", "email", "date", "select", "checkbox",
];

const FIELD_TYPE_DETAILS = {
  text: { label: "Text", description: "Short titles, names, paragraphs, or lists", icon: <AlignLeft className="w-6 h-6" /> },
  textarea: { label: "Long Text", description: "Multi-line text for descriptions or content", icon: <AlignJustify className="w-6 h-6" /> },
  richtext: { label: "Rich text", description: "Text formatting with references and media", icon: <LayoutTemplate className="w-6 h-6" /> },
  image: { label: "Media", description: "Images, videos, PDFs and other files", icon: <ImageIcon className="w-6 h-6" /> },
  number: { label: "Number", description: "ID, order number, rating, or quantity", icon: <Hash className="w-6 h-6" /> },
  email: { label: "Email", description: "Validated email address field", icon: <Mail className="w-6 h-6" /> },
  date: { label: "Date and time", description: "Event dates, deadlines, and schedules", icon: <Calendar className="w-6 h-6" /> },
  select: { label: "Selection", description: "Choose from a pre-defined list of options", icon: <ChevronDown className="w-6 h-6" /> },
  checkbox: { label: "Boolean", description: "Yes or no, 1 or 0, true or false", icon: <CheckSquare className="w-6 h-6" /> },
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
  const [activeTab, setActiveTab] = useState("general");
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const router = useRouter();

  useEffect(() => { paramsPromise.then(setParams); }, [paramsPromise]);
  useEffect(() => { if (params?.slug) fetchPage(); }, [params]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) { e.preventDefault(); e.returnValue = "You have unsaved changes. Are you sure you want to leave?"; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const generateApiIdentifier = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  const fetchPage = async () => {
    try {
      const res = await callApi(`/api/admin/pages/${params.slug}`, { auth: true });
      if (res.ok) {
        const data = await res.json();
        if (data.sections) {
          data.sections = data.sections.map((section) => {
            if (!section.apiIdentifier && section.title) {
              return { ...section, apiIdentifier: generateApiIdentifier(section.title) };
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
    if (hasChanges) { setPendingPath(path); setShowConfirmModal(true); }
    else router.push(path);
  };

  const handleConfirmNavigate = async (shouldSave) => {
    setShowConfirmModal(false);
    if (shouldSave) {
      const success = await handleSave();
      if (success) router.push(pendingPath);
    } else {
      router.push(pendingPath);
    }
  };

  const handleCreateContentModel = (title, apiIdentifier, description = "") => {
    if (!title || !apiIdentifier) return;
    const newSection = { _id: new Date().getTime().toString(), title, apiIdentifier, description, fields: [], dataInstances: [] };
    setPage({ ...page, sections: [...page.sections, newSection] });
    setHasChanges(true);
    setActiveSection(newSection._id);
    setShowCreateModal(false);
  };

  const handleDeleteSection = (sectionId) => { setSectionToDelete(sectionId); setShowDeleteConfirm(true); };

  const confirmDeleteSection = () => {
    if (!sectionToDelete) return;
    setPage({ ...page, sections: page.sections.filter((s) => s._id !== sectionToDelete) });
    setHasChanges(true);
    setActiveSection(null);
    setShowDeleteConfirm(false);
    setSectionToDelete(null);
  };

  const handleSectionChange = (sectionId, field, value) => {
    setPage({ ...page, sections: page.sections.map((s) => s._id === sectionId ? { ...s, [field]: value } : s) });
    setHasChanges(true);
  };

  const handleDragStart = (e, sectionId) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    if (!draggedSectionId || draggedSectionId === targetSectionId) {
      setDraggedSectionId(null);
      return;
    }

    const draggedIndex = page.sections.findIndex((s) => s._id === draggedSectionId);
    const targetIndex = page.sections.findIndex((s) => s._id === targetSectionId);

    const newSections = [...page.sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    setPage({ ...page, sections: newSections });
    setHasChanges(true);
    setDraggedSectionId(null);
  };

  const handleSave = async () => {
    if (!page.title || !page.slug) { setError("Title and slug are required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await callApi(`/api/admin/pages/${page.slug}`, {
        method: "PUT",
        auth: true,
        body: {
          title: page.title,
          description: page.description,
          sections: page.sections.map((section, index) => ({
            sectionIndex: index,
            title: section.title,
            apiIdentifier: section.apiIdentifier || generateApiIdentifier(section.title),
            description: section.description,
            fields: section.fields.map((field) => ({
              name: field.name, label: field.label, type: field.type,
              required: field.required, placeholder: field.placeholder, options: field.options,
            })),
            dataInstances: section.dataInstances || [],
          })),
          isPublished: page.isPublished,
        },
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
      <div className="min-h-screen flex items-center justify-center bg-muted/20 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest animate-pulse">Constructing Editor...</p>
        </div>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 dark:bg-zinc-950 p-8">
        <div className="bg-card dark:bg-zinc-900 p-12 rounded-[3rem] shadow-xl border border-border/50 dark:border-zinc-800/60 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">Editor Error</h2>
          <p className="text-muted-foreground/70 mb-8">{error}</p>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  if (!page) return null;

  const currentSection = activeSection ? page.sections.find((s) => s._id === activeSection) : null;

  return (
    <div className="max-w-7xl mx-auto p-8 text-foreground">
      <div className="flex flex-col gap-6">

        {/* ── Header Navigation ── */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateGuarded("/admin/pages")}
            className="text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 dark:hover:bg-zinc-800/60 rounded-lg transition-all"
            title="Back to Pages"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 w-px bg-border/50 dark:bg-zinc-800" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">{page.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
                Architecture Editor
              </span>
              <span className="text-muted-foreground/30">•</span>
              <code className="text-xs bg-muted/50 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md text-muted-foreground/70 font-mono border border-border/30 dark:border-zinc-700/30">/{page.slug}</code>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button
              onClick={() => setShowStatusModal(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 shadow-sm ${page.isPublished
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${page.isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {page.isPublished ? "Published" : "Draft"}
            </Button>

          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive dark:text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <div className="flex flex-wrap items-center gap-3 px-1 border-b border-border/30 dark:border-zinc-800/50 pb-4">
          <Button
            onClick={() => setActiveTab("general")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm h-auto flex items-center gap-2 ${activeTab === "general"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg shadow-black/10"
              : "bg-muted/50 text-muted-foreground hover:bg-muted dark:bg-zinc-900/50"
              }`}
          >
            <Settings className="w-4 h-4" />
            General Info
          </Button>
          <Button
            onClick={() => setActiveTab("models")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm h-auto flex items-center gap-2 ${activeTab === "models"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              }`}
          >
            <Layers className="w-4 h-4" />
            Content Model
          </Button>

          <Button
            onClick={() => navigateGuarded(`/admin/pages/${page.slug}/content`)}
            className="px-6 py-2.5 bg-muted/50 text-muted-foreground hover:bg-muted dark:bg-zinc-900/50 rounded-xl font-bold transition-all text-sm h-auto flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Manage Content
          </Button>
        </div>

        {/* ── View Content ── */}
        {activeTab === "models" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Models Table ── */}
            <div className="bg-card dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-border/50 dark:border-zinc-800/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-foreground">Registered Models</h2>
                  <span className="px-2.5 py-1 bg-muted/50 dark:bg-zinc-800/60 text-muted-foreground/60 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border/40 dark:border-zinc-700/40">
                    {page.sections.length} Sections
                  </span>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold text-xs transition-all shadow-sm flex items-center gap-2 h-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Model
                </Button>
              </div>

              {page.sections.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-muted/40 dark:bg-zinc-800/40 border border-border/30 dark:border-zinc-700/30 rounded-3xl flex items-center justify-center mb-6 text-muted-foreground/20">
                    <Layers className="w-10 h-10" />
                  </div>
                  <p className="text-foreground/70 text-lg font-bold tracking-tight">No Content Models Yet</p>
                  <p className="text-muted-foreground/50 mt-2 max-w-xs mx-auto text-sm mb-8">Create your first content model to define the structure of your page sections.</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 font-bold text-sm transition-all shadow-xl shadow-primary/20 flex items-center gap-2 h-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Initialize First Model
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted/20 dark:bg-zinc-800/20 border-b border-border/40 dark:border-zinc-800/60">
                      <tr>
                        {["", "Index", "Structure", "Identifier", "Status", "Actions"].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ${i === 0 ? "w-12 text-center" : i === 5 ? "text-right" : i === 4 ? "text-center" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 dark:divide-zinc-800/50">
                      {page.sections.map((section, index) => (
                        <tr
                          key={section._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, section._id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, section._id)}
                          className={`hover:bg-muted/20 dark:hover:bg-zinc-800/20 transition-colors cursor-move group ${activeSection === section._id ? "bg-blue-500/5 dark:bg-blue-500/5" : ""} ${draggedSectionId === section._id ? "opacity-50 bg-primary/5" : ""}`}
                          onClick={() => setActiveSection(section._id)}
                        >
                          <td className="px-6 py-4 w-12 text-center">
                            <GripVertical className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs">{index}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground text-sm">{section.title}</span>
                              <span className="text-xs text-muted-foreground/50 mt-0.5">{section.fields.length} Input Fields</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-[10px] bg-muted/50 dark:bg-zinc-800/50 px-2 py-1 rounded-md text-muted-foreground/70 font-mono italic border border-border/30 dark:border-zinc-700/30">{section.apiIdentifier}</code>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${section.fields.length === 0
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${section.fields.length === 0 ? "bg-amber-500" : "bg-emerald-500"}`} />
                              {section.fields.length === 0 ? "Needs Fields" : "Ready"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5 items-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSectionToEdit(section._id); setShowFieldModal(true); }}
                                className="px-4 py-2 bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-500/20 transition-all border border-blue-500/20"
                              >
                                Manage
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleDeleteSection(section._id); }}
                                className="w-8 h-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                title="Delete Section"
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

            {/* ── Section Detail Panel ── */}
            {currentSection && (
              <div className="bg-card dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-border/50 dark:border-zinc-800/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="px-6 py-4 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{currentSection.title}</h2>
                      <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-0.5">
                        API: <span className="text-muted-foreground/70 font-mono lowercase">{currentSection.apiIdentifier}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setSectionToEdit(currentSection._id); setShowFieldModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold text-sm transition-all shadow-sm h-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </Button>
                </div>
                <div className="p-6">
                  {currentSection.fields.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-border/40 dark:border-zinc-700/40 rounded-2xl flex flex-col items-center justify-center text-center">
                      <p className="text-muted-foreground/50 text-sm font-medium mb-1">No schema defined for this section</p>
                      <p className="text-muted-foreground/30 text-xs">Add fields like text, image, or numbers to build the model.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentSection.fields.map((field) => (
                        <div
                          key={field._id}
                          className="group flex flex-col p-4 bg-card dark:bg-zinc-800/40 border border-border/40 dark:border-zinc-700/40 rounded-xl hover:border-blue-400/40 dark:hover:border-blue-600/40 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-400 transition-all" />
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="text-[10px] bg-destructive/10 text-destructive dark:text-red-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter border border-destructive/20">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-foreground text-sm truncate">{field.label}</p>
                          <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">{field.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {/* ── Floating Save Button ── */}
      <div className="fixed bottom-10 right-10 z-[150] animate-in slide-in-from-bottom-10 duration-500">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="group px-8 py-4 bg-primary text-primary-foreground rounded-[2rem] hover:bg-primary/90 disabled:opacity-50 font-bold transition-all shadow-2xl hover:shadow-primary/40 flex items-center gap-3 h-auto scale-110 active:scale-100 border-4 border-background dark:border-zinc-950"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> Save Schema</>
          )}
        </Button>
      </div>

      {/* ── Modals ── */}
      {showCreateModal && (
        <CreateContentModelModal onSave={handleCreateContentModel} onClose={() => setShowCreateModal(false)} />
      )}
      {showFieldModal && sectionToEdit && (
        <FieldModal
          section={page.sections.find((s) => s._id === sectionToEdit)}
          onSave={(fields) => {
            setPage({ ...page, sections: page.sections.map((s) => s._id === sectionToEdit ? { ...s, fields } : s) });
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
          onCancel={() => { setShowDeleteConfirm(false); setSectionToDelete(null); }}
        />
      )}
      {showStatusModal && (
        <StatusConfirmationModal
          currentStatus={page.isPublished ? "Published" : "Draft"}
          onConfirm={() => { setPage({ ...page, isPublished: !page.isPublished }); setHasChanges(true); setShowStatusModal(false); }}
          onCancel={() => setShowStatusModal(false)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── Modal base classes ───────────────────────────────────────────────────────

const modalOverlay = "fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/50 flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300";
const modalCard = "bg-card dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl dark:shadow-zinc-950/60 max-w-sm w-full overflow-hidden border border-border/50 dark:border-zinc-800/60 animate-in zoom-in-95 duration-300";
const modalInp = "w-full px-5 py-3.5 bg-muted/30 dark:bg-zinc-800/50 border border-border/60 dark:border-zinc-700/60 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/60 focus:bg-background dark:focus:bg-zinc-950 transition-all text-sm font-semibold outline-none text-foreground placeholder:text-muted-foreground/40";

// ─── ConfirmationModal ────────────────────────────────────────────────────────

function ConfirmationModal({ onConfirm, onDiscard, onCancel, saving }) {
  return (
    <div className={modalOverlay}>
      <div className={modalCard}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight mb-2">Unsaved Changes</h2>
          <p className="text-sm text-muted-foreground/70 font-medium leading-relaxed">
            You have unsaved modifications to your content model. Would you like to save them before leaving?
          </p>
        </div>
        <div className="px-8 pb-8 flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            disabled={saving}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 h-auto"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save and Continue
          </Button>
          <Button
            onClick={onDiscard}
            disabled={saving}
            variant="outline"
            className="w-full py-4 border-border/60 dark:border-zinc-700/60 dark:bg-zinc-800/40 text-destructive dark:text-red-400 rounded-2xl hover:bg-destructive/10 font-bold text-sm transition-all h-auto"
          >
            Discard Changes
          </Button>
          <Button
            onClick={onCancel}
            disabled={saving}
            variant="secondary"
            className="w-full py-4 bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground rounded-2xl hover:bg-muted dark:hover:bg-zinc-800 font-bold text-sm transition-all h-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── CreateContentModelModal ──────────────────────────────────────────────────

function CreateContentModelModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [apiIdentifier, setApiIdentifier] = useState("");
  const [description, setDescription] = useState("");

  const generateApiIdentifier = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

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
    <div className={modalOverlay.replace("max-w-sm", "")}>
      <div className="bg-card dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl dark:shadow-zinc-950/60 w-full max-w-lg overflow-hidden border border-border/50 dark:border-zinc-800/60 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-border/40 dark:border-zinc-800/60 flex justify-between items-center bg-muted/20 dark:bg-zinc-800/20">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Create Model</h2>
            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-0.5">Define new content structure</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 dark:hover:bg-zinc-800/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Section Title</label>
            <input type="text" value={title} onChange={handleTitleChange} placeholder="e.g., Hero Features" className={modalInp} required />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1 flex justify-between">
              API Identifier
              <span className="text-[10px] lowercase font-normal italic text-muted-foreground/40">Read-only auto-gen</span>
            </label>
            <div className="relative">
              <input type="text" value={apiIdentifier} readOnly className={modalInp + " cursor-not-allowed dark:bg-zinc-950/60 pr-10"} />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What kind of content does this hold?" rows="3" className={modalInp + " resize-none"} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 px-6 py-3.5 border-border/60 dark:border-zinc-700/60 dark:bg-zinc-800/40 text-muted-foreground rounded-2xl hover:bg-muted/60 dark:hover:bg-zinc-800/60 font-bold text-sm transition-all h-auto">
              Cancel
            </Button>
            <Button type="submit" className="flex-[2] px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 font-bold text-sm transition-all shadow-lg h-auto">
              Initialize Model
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── FieldModal ───────────────────────────────────────────────────────────────

function FieldModal({ section, onSave, onClose }) {
  const [fields, setFields] = useState(section.fields || []);
  const [isSelectingType, setIsSelectingType] = useState(false);

  const handleTypeSelect = (type) => {
    const newField = { _id: new Date().getTime().toString(), name: "", label: "", type, required: false, placeholder: "", options: type === "select" ? [] : undefined };
    setFields([...fields, newField]);
    setIsSelectingType(false);
  };

  const handleFieldChange = (fieldId, field, value) => {
    setFields(fields.map((f) => {
      if (f._id !== fieldId) return f;
      const updated = { ...f, [field]: value };
      if (field === "name") updated.label = value;
      return updated;
    }));
  };

  const handleDeleteField = (fieldId) => setFields(fields.filter((f) => f._id !== fieldId));

  const fieldInp = "w-full px-4 py-2.5 bg-background dark:bg-zinc-950/60 border border-border/60 dark:border-zinc-700/60 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/60 outline-none transition-all text-foreground placeholder:text-muted-foreground/40";

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 dark:bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-card dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl dark:shadow-zinc-950/60 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border/50 dark:border-zinc-800/60 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-border/40 dark:border-zinc-800/60 flex justify-between items-center bg-muted/20 dark:bg-zinc-800/20">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {isSelectingType ? "Select Field Type" : "Define Fields"}
            </h2>
            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-0.5">
              {isSelectingType ? "Choose the best input for your data" : `${section.title} Schema`}
            </p>
          </div>
          <Button
            onClick={isSelectingType ? () => setIsSelectingType(false) : onClose}
            variant="ghost"
            size="icon"
            className="text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 dark:hover:bg-zinc-800/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
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
                  className="flex flex-col items-start text-left p-6 bg-card dark:bg-zinc-800/40 border border-border/50 dark:border-zinc-700/50 rounded-[2rem] hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group active:scale-95 h-auto w-full"
                >
                  <div className="p-3 bg-muted/50 dark:bg-zinc-700/40 text-muted-foreground rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
                    {details.icon}
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{details.label}</h3>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed font-medium">{details.description}</p>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {fields.map((field, idx) => (
                <div
                  key={field._id}
                  className="p-6 bg-muted/20 dark:bg-zinc-800/30 border border-border/40 dark:border-zinc-700/40 rounded-3xl space-y-5 relative group transition-all hover:bg-card dark:hover:bg-zinc-800/50 hover:border-primary/20 dark:hover:border-primary/20 shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-[10px] font-bold">{idx + 1}</span>
                      <h3 className="font-bold text-foreground text-sm">Input Definition</h3>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">{field.type}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(field._id)}
                      className="w-8 h-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      title="Remove Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Field Name</label>
                      <input type="text" value={field.name} onChange={(e) => handleFieldChange(field._id, "name", e.target.value)} placeholder="e.g., subtitle, slug" className={fieldInp} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Field Label</label>
                      <input type="text" value={field.label} onChange={(e) => handleFieldChange(field._id, "label", e.target.value)} placeholder="e.g., Section Subtitle" className={fieldInp} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Input Type</label>
                      <select value={field.type} onChange={(e) => handleFieldChange(field._id, "type", e.target.value)} className={fieldInp + " appearance-none cursor-pointer"}>
                        {FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>{FIELD_TYPE_DETAILS[type]?.label || type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center pt-5 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer group/check">
                        <div className="relative">
                          <input type="checkbox" checked={field.required} onChange={(e) => handleFieldChange(field._id, "required", e.target.checked)} className="peer sr-only" />
                          <div className="w-10 h-6 bg-muted dark:bg-zinc-700 peer-checked:bg-primary rounded-full transition-all duration-300" />
                          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4 shadow-sm" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground group-hover/check:text-foreground transition-colors">Required Field</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Placeholder Context</label>
                    <input type="text" value={field.placeholder} onChange={(e) => handleFieldChange(field._id, "placeholder", e.target.value)} placeholder="Helpful hint for content editors..." className={fieldInp} />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setIsSelectingType(true)}
                className="w-full py-4 bg-muted/20 dark:bg-zinc-800/20 border-2 border-dashed border-border/40 dark:border-zinc-700/50 text-muted-foreground/60 rounded-3xl hover:bg-primary/5 hover:border-primary/30 hover:text-primary font-bold transition-all flex items-center justify-center gap-2 h-auto"
              >
                <PlusCircle className="w-5 h-5" />
                Add New Field Definition
              </Button>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-muted/20 dark:bg-zinc-800/20 border-t border-border/40 dark:border-zinc-800/60 flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-3.5 bg-card dark:bg-zinc-900 border border-border/60 dark:border-zinc-700/60 text-muted-foreground rounded-2xl hover:bg-muted/60 dark:hover:bg-zinc-800/60 font-bold text-sm transition-all">
            Cancel
          </button>
          {!isSelectingType && (
            <button onClick={() => onSave(fields)} className="flex-[2] px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
              Commit Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DeleteConfirmationModal ──────────────────────────────────────────────────

function DeleteConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className={modalOverlay}>
      <div className={modalCard}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight mb-2">Delete Section?</h2>
          <p className="text-sm text-muted-foreground/70 font-medium leading-relaxed">
            This action cannot be undone. All fields in this section will be permanently removed.
          </p>
        </div>
        <div className="px-8 pb-8 flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full py-4 bg-destructive text-destructive-foreground rounded-2xl hover:bg-destructive/90 font-bold text-sm transition-all shadow-lg">
            Yes, Delete Section
          </button>
          <button onClick={onCancel} className="w-full py-4 bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground rounded-2xl hover:bg-muted dark:hover:bg-zinc-800 font-bold text-sm transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── StatusConfirmationModal ──────────────────────────────────────────────────

function StatusConfirmationModal({ currentStatus, onConfirm, onCancel }) {
  const isPublished = currentStatus === "Published";
  const targetStatus = isPublished ? "Draft" : "Published";

  return (
    <div className={modalOverlay}>
      <div className={modalCard}>
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPublished ? "bg-amber-500/10 text-amber-500 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"}`}>
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight mb-2">Change Status?</h2>
          <p className="text-sm text-muted-foreground/70 font-medium leading-relaxed">
            Do you want to make this page <span className={`font-bold ${isPublished ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400"}`}>{targetStatus}</span>?
          </p>
        </div>
        <div className="px-8 pb-8 flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            className={`w-full py-4 text-white rounded-2xl font-bold text-sm transition-all shadow-lg h-auto ${isPublished ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"}`}
          >
            Yes, mark as {targetStatus}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full py-4 bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground rounded-2xl hover:bg-muted dark:hover:bg-zinc-800 font-bold text-sm transition-all h-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}