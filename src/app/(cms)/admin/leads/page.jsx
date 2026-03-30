"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";
import { 
  Users, 
  ChevronRight, 
  Loader2, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare,
  Check,
  X,
  Filter,
  UserCheck
} from "lucide-react";

const CALL_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/20", bullet: "bg-zinc-500" },
  { value: "called", label: "Called", color: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/20", bullet: "bg-blue-500" },
  { value: "did_not_answer", label: "Did Not Answer", color: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/20", bullet: "bg-rose-500" },
  { value: "called_and_helped", label: "Called & Helped", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20", bullet: "bg-emerald-500" },
  { value: "need_follow_up", label: "Need Follow-up", color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/20", bullet: "bg-amber-500" },
  { value: "schedule_call", label: "Schedule Call", color: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 dark:border-purple-500/20", bullet: "bg-purple-500" },
];


export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(""); // "" means show all

  const [formData, setFormData] = useState({
    callStatus: "pending",
    notes: "",
    assignedTo: "",
    scheduledCallDate: "",
  });

  /* ---------------------------------- */
  /* Fetch Leads */
  /* ---------------------------------- */
  const fetchLeads = async () => {
    try {
      let url = "/api/admin/leads";
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const res = await callApi(url, { cache: "no-store", auth: true });
      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        return;
      }

      setLeads(data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      await fetchLeads();
    };

    loadData();
  }, [filterStatus]);


  //   useEffect(() => {
  //     fetchLeads();
  //   }, [filterStatus]);

  /* ---------------------------------- */
  /* Edit Lead */
  /* ---------------------------------- */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      callStatus: item.callStatus || "pending",
      notes: item.notes || "",
      assignedTo: item.assignedTo || "",
      scheduledCallDate: item.scheduledCallDate
        ? item.scheduledCallDate.split("T")[0]
        : "",
    });
  };

  /* ---------------------------------- */
  /* Update Lead */
  /* ---------------------------------- */
  const handleUpdate = async (id) => {
    setLoading(true);

    const payload = {
      callStatus: formData.callStatus,
      notes: formData.notes,
      assignedTo: formData.assignedTo,
      scheduledCallDate: formData.scheduledCallDate
        ? new Date(formData.scheduledCallDate)
        : null,
    };

    console.log("Updating lead id", id, "payload:", payload);

    await callApi(`/api/admin/leads/${id}`, {
      method: "PUT",
      auth: true,
      body: payload,
    });

    setEditingId(null);
    setLoading(false);
    fetchLeads();
  };

  /* ---------------------------------- */
  /* Delete Lead */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this lead?");
    if (!confirmDelete) return;

    await callApi(`/api/admin/leads/${id}`, {
      method: "DELETE",
      auth: true,
    });

    fetchLeads();
  };

  const getStatusColor = (status) => {
    const option = CALL_STATUS_OPTIONS.find((o) => o.value === status);
    return option?.color || "bg-muted";
  };

  const getStatusBullet = (status) => {
    const option = CALL_STATUS_OPTIONS.find((o) => o.value === status);
    return option?.bullet || "bg-zinc-500";
  };

  const getStatusLabel = (status) => {
    const option = CALL_STATUS_OPTIONS.find((o) => o.value === status);
    return option?.label || status;
  };


  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary ring-1 ring-primary/20">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Leads Management</h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground/70 mt-1 ml-[52px]">
              Track and manage all customer inquiries and leads
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card dark:bg-zinc-900/50 p-1.5 rounded-xl border border-border/50 dark:border-zinc-800/60 shadow-sm">
            <div className="flex items-center gap-2 pl-3 mr-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Filter by Status</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-muted/50 dark:bg-zinc-800/60 border-none text-xs font-bold text-foreground px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer min-w-[140px]"
            >
              <option value="">All Leads</option>
              {CALL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table Container ── */}
        <div className="bg-card dark:bg-zinc-900/50 rounded-2xl border border-border/50 dark:border-zinc-800/60 shadow-sm dark:shadow-zinc-950/40 overflow-hidden text-foreground">
          
          {/* Table header bar */}
          <div className="px-8 py-5 border-b border-border/40 dark:border-zinc-800/60 bg-muted/20 dark:bg-zinc-800/20 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              Inbound Leads
            </h2>
            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/50 dark:bg-zinc-800/60 px-3 py-1 rounded-full border border-border/40 dark:border-zinc-700/40">
              {leads.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 dark:bg-zinc-800/10 border-b border-border/40 dark:border-zinc-800/60">
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Interest</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Assignment</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Notes</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Updated</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>


              <tbody className="divide-y divide-border/30 dark:divide-zinc-800/50">
                {leads.map((lead) => (
                  <tr key={lead._id} className="group hover:bg-muted/20 dark:hover:bg-zinc-800/20 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10">
                          <span className="text-xs font-bold text-primary">{lead.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-tight">{lead.name}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground/70">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs font-medium tracking-tight">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground/70">
                          <Phone className="w-3 h-3" />
                          <span className="text-[10px] font-medium tracking-tight">{lead.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Course Interest */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-muted/50 dark:bg-zinc-800/40 text-muted-foreground/60 px-2.5 py-1 rounded-full text-[10px] font-bold border border-border/40 dark:border-zinc-700/40 uppercase tracking-wider">
                        {lead.courseOfInterest || "General"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {editingId === lead._id ? (
                        <select
                          value={formData.callStatus}
                          onChange={(e) =>
                            setFormData({ ...formData, callStatus: e.target.value })
                          }
                          className="bg-muted/50 dark:bg-zinc-800/60 border border-border/40 dark:border-zinc-700/40 px-2 py-1.5 rounded-lg text-[10px] font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {CALL_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(
                            lead.callStatus
                          )}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusBullet(lead.callStatus)}`} />
                          {getStatusLabel(lead.callStatus)}
                        </span>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="px-6 py-4">
                      {editingId === lead._id ? (
                        <div className="relative group">
                          <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
                          <input
                            type="text"
                            placeholder="Counselor"
                            value={formData.assignedTo}
                            onChange={(e) =>
                              setFormData({ ...formData, assignedTo: e.target.value })
                            }
                            className="bg-muted/50 dark:bg-zinc-800/60 border border-border/40 dark:border-zinc-700/40 pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium text-foreground w-full outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70">
                          {lead.assignedTo ? (
                            <>
                              <UserCheck className="w-3 h-3 text-primary/50" />
                              <span>{lead.assignedTo}</span>
                            </>
                          ) : (
                            <span className="italic text-muted-foreground/30">Unassigned</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4">
                      {editingId === lead._id ? (
                        <div className="relative">
                          <MessageSquare className="absolute left-2.5 top-2.5 w-3 h-3 text-muted-foreground/40" />
                          <textarea
                            placeholder="Add notes..."
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({ ...formData, notes: e.target.value })
                            }
                            className="bg-muted/50 dark:bg-zinc-800/60 border border-border/40 dark:border-zinc-700/40 pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium text-foreground w-full outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[200px]"
                            rows="2"
                          />
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground/40 shrink-0" />
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 max-w-[180px]" title={lead.notes}>
                            {lead.notes || <span className="italic text-muted-foreground/30">No notes</span>}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                          {lead.lastUpdated
                            ? new Date(lead.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric' })
                            : "-"}
                        </span>
                        <span className="text-[9px] text-muted-foreground/40">
                           {lead.lastUpdated ? new Date(lead.lastUpdated).getFullYear() : ""}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {editingId === lead._id ? (
                          <>
                            <Button
                              onClick={() => handleUpdate(lead._id)}
                              disabled={loading}
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors rounded-lg"
                              title="Save Changes"
                            >
                              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                              onClick={() => setEditingId(null)}
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors rounded-lg"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(lead)}
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                              title="Edit Lead"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              onClick={() => handleDelete(lead._id)}
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leads.length === 0 && (
            <div className="p-20 text-center">
              <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 rounded-2xl bg-muted/50 dark:bg-zinc-800/40 border border-border/30 dark:border-zinc-700/30">
                <Users className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-base font-semibold text-foreground/70 mb-1">No leads found</p>
              <p className="text-sm text-muted-foreground/50">There are no leads matching your current filter.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

