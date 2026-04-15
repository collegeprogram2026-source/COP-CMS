"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Loader2,
  Trash2,
  Eye,
  X,
  ChevronRight,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  BookmarkCheck,
} from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await callApi("/api/admin/students", {
        cache: "no-store",
        auth: true,
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        setStudents([]);
      }
    } catch (err) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleActive = async (id, current) => {
    setSaving(true);
    await callApi(`/api/admin/students/${id}`, {
      method: "PATCH",
      auth: true,
      body: { isActive: !current },
    });
    setSaving(false);
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    if (!confirm("Permanently delete this student account?")) return;
    await callApi(`/api/admin/students/${id}`, { method: "DELETE", auth: true });
    setSelected(null);
    fetchStudents();
  };

  const filtered = students.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.city || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/20 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          Loading Students
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <UserCircle className="w-5 h-5" />
              </span>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                Students
              </h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground/70 mt-1 ml-[52px]">
              Registered student accounts and their profiles
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search name, email, phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-72 bg-card border border-border/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card dark:bg-zinc-900/50 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              All Students
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest bg-muted/50 dark:bg-zinc-800/60 px-3 py-1 rounded-full border border-border/40">
              {filtered.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/20 dark:bg-zinc-800/20 border-b border-border/40">
                  {["S.No.", "Student", "Contact", "Location", "Shortlist", "Status", "Joined", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap ${i === 7 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/30 dark:divide-zinc-800/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-muted-foreground italic">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s._id} className="group hover:bg-muted/20 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-muted-foreground">{i + 1}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.profilePhoto ? (
                            <img
                              src={s.profilePhoto}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-border/40"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {(s.name || s.firstName || s.email || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-foreground">
                              {s.name || [s.firstName, s.lastName].filter(Boolean).join(" ") || "—"}
                            </div>
                            {s.occupation && (
                              <div className="text-[11px] text-muted-foreground">{s.occupation}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {s.email && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{s.email}</span>
                          </div>
                        )}
                        {s.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                            <Phone className="w-3 h-3" />
                            {s.phone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {[s.city, s.state, s.country].filter(Boolean).join(", ") || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-muted/50 text-muted-foreground border border-border/40">
                          <BookmarkCheck className="w-3 h-3" />
                          {s.shortlistedUniversities?.length || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(s._id, s.isActive)}
                          disabled={saving}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            s.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                              : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:text-zinc-400"
                          }`}
                          title="Click to toggle"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? "bg-emerald-500" : "bg-zinc-500"}`} />
                          {s.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelected(s)}
                            className="w-8 h-8 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteStudent(s._id)}
                            className="w-8 h-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            title="Delete account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end"
            onClick={() => setSelected(null)}
          >
            <div
              className="w-full max-w-lg h-full bg-card dark:bg-zinc-900 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border/40 flex items-center justify-between sticky top-0 bg-card dark:bg-zinc-900 z-10">
                <h3 className="text-lg font-bold">Student Details</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  {selected.profilePhoto ? (
                    <img
                      src={selected.profilePhoto}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border border-border/40"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                      {(selected.name || selected.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-bold">
                      {selected.name || [selected.firstName, selected.lastName].filter(Boolean).join(" ") || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">ID: {selected._id}</div>
                  </div>
                </div>

                <Section title="Contact">
                  <Field icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={selected.email} />
                  <Field icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={selected.phone} />
                </Section>

                <Section title="Personal">
                  <Field icon={<Calendar className="w-3.5 h-3.5" />} label="Date of Birth" value={selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : null} />
                  <Field icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={[selected.city, selected.state, selected.country].filter(Boolean).join(", ")} />
                </Section>

                <Section title="Professional">
                  <Field icon={<GraduationCap className="w-3.5 h-3.5" />} label="Current Education" value={selected.currentEducation} />
                  <Field icon={<Briefcase className="w-3.5 h-3.5" />} label="Occupation" value={selected.occupation} />
                  <Field icon={<Briefcase className="w-3.5 h-3.5" />} label="Company / University" value={selected.currentCompanyOrUniversity} />
                  <Field label="Course of Interest" value={selected.courseOfInterest} />
                </Section>

                <Section title={`Shortlisted Universities (${selected.shortlistedUniversities?.length || 0})`}>
                  {selected.shortlistedUniversities?.length ? (
                    <ul className="space-y-2">
                      {selected.shortlistedUniversities.map((u, i) => (
                        <li key={i} className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-center gap-3">
                          {u.logo ? (
                            <img src={u.logo} alt="" className="w-8 h-8 object-contain rounded" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{u.name}</div>
                            {u.minimumDuration && (
                              <div className="text-[11px] text-muted-foreground">{u.minimumDuration}</div>
                            )}
                          </div>
                          {u.startingFee && (
                            <div className="text-xs font-bold text-primary">₹{u.startingFee.toLocaleString()}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No universities shortlisted</p>
                  )}
                </Section>

                <div className="pt-4 border-t border-border/40 flex gap-2">
                  <Button
                    onClick={() => toggleActive(selected._id, selected.isActive)}
                    variant="outline"
                    className="flex-1"
                  >
                    {selected.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    onClick={() => deleteStudent(selected._id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </div>
        <div className="text-foreground">{value}</div>
      </div>
    </div>
  );
}
