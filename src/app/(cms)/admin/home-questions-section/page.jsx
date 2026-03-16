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

const ta =
  "border-2 border-border bg-card px-3 py-2.5 rounded-lg text-sm text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-border w-full " +
  "placeholder-slate-400 transition-colors hover:border-border resize-none";

const EMPTY_FORM = { title: "", subtitle: "" };

// ─── Main Page ────────────────────────────────────────────────────────

export default function HomeQuestionsSectionPage() {
  const [sectionTitle, setSectionTitle] = useState("Questions & Answers");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/admin/home-questions-section");
        const data = await res.json();
        if (data.sectionTitle) setSectionTitle(data.sectionTitle);
        if (data.cards) setCards(data.cards);
      } catch (error) {
        console.error("Error fetching questions section:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCard = () => {
    if (!formData.title || !formData.subtitle) return setToast({ message: "Title and answer are required", type: "error" });
    if (cards.length >= 8) return setToast({ message: "Maximum 8 question cards allowed", type: "error" });
    setCards([...cards, { ...formData, localId: Date.now().toString() }]);
    setFormData(EMPTY_FORM);
  };

  const handleEditCard = (index) => {
    setFormData(cards[index]);
    setEditingIndex(index);
  };

  const handleUpdateCard = () => {
    if (!formData.title || !formData.subtitle) return setToast({ message: "Title and answer are required", type: "error" });
    const updated = [...cards];
    updated[editingIndex] = formData;
    setCards(updated);
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteCard = (index) => {
    if (confirm("Delete this question card?")) setCards(cards.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (cards.length === 0) return setToast({ message: "Please add at least one question card", type: "error" });
    setSaving(true);
    try {
      const cardsToSave = cards.map(card => {
        const { localId, ...cardData } = card;
        return cardData;
      });
      const res = await fetch("/api/admin/home-questions-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionTitle, cards: cardsToSave }),
      });
      const data = await res.json();
      if (res.ok) setToast({ message: "Questions section saved successfully", type: "success" });
      else setToast({ message: data.error || "Failed to save", type: "error" });
    } catch (error) {
      setToast({ message: "Error saving questions section", type: "error" });
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

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Questions & Answers Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage homepage Q&A cards</p>
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={saving || cards.length === 0}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors h-auto"
          >
            {saving ? "Saving..." : "💾 Save All"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Form Panel */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="bg-primary px-6 py-4">
              <h2 className="text-white font-semibold text-sm tracking-wide">
                {editingIndex !== null ? "✏️ Edit Question Card" : "➕ New Question Card"}
              </h2>
            </div>

            <div className="p-6 space-y-6">

              {/* Section Settings */}
              <div>
                <SectionHeader title="Section Settings" />
                <Field label="Section Title">
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="e.g. Questions & Answers"
                    className={inp}
                  />
                </Field>
              </div>

              {/* Card Content */}
              <div>
                <SectionHeader title="Card Content" />
                <div className="space-y-4">
                  <Field label="Question *">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. What is COP?"
                      className={inp}
                    />
                  </Field>

                  <Field label="Answer *">
                    <textarea
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      placeholder="Enter the answer to this question..."
                      rows={4}
                      className={ta}
                    />
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-border/50">
                {editingIndex !== null ? (
                  <>
                    <Button
                      onClick={handleUpdateCard}
                      className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted transition-colors h-auto"
                    >
                      Update Card
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
                    onClick={handleAddCard}
                    className="w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-muted transition-colors h-auto"
                  >
                    + Add Card
                  </Button>
                )}
              </div>

            </div>
          </div>

          {/* Cards List Panel */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">All Question Cards</span>
              <span className="text-xs font-semibold bg-muted text-muted-foreground rounded-full px-2.5 py-0.5">
                {cards.length} / 8
              </span>
            </div>

            <div className="p-6">
              {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-border text-muted-foreground gap-2">
                  <span className="text-2xl">❓</span>
                  <p className="text-xs">No question cards yet — add one from the form</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card, index) => (
                    <div
                      key={card.localId || card._id || index}
                      className={`flex gap-3 p-4 rounded-xl border-2 transition-colors ${editingIndex === index
                        ? "border-primary bg-muted"
                        : "border-border hover:border-border"
                        }`}
                    >
                      {/* Q badge */}
                      <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs mt-0.5">
                        Q
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {card.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {card.subtitle}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
                        <Button
                          onClick={() => handleEditCard(index)}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors h-auto"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCard(index)}
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

              {cards.length > 0 && cards.length < 8 && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  {8 - cards.length} slot{8 - cards.length !== 1 ? "s" : ""} remaining
                </p>
              )}
              {cards.length === 8 && (
                <p className="text-xs text-amber-500 text-center mt-4 font-medium">
                  ⚠️ Maximum of 8 cards reached
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
