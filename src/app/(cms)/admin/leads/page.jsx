"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";

const CALL_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-muted" },
  { value: "called", label: "Called", color: "bg-blue-100" },
  { value: "did_not_answer", label: "Did Not Answer", color: "bg-red-100" },
  { value: "called_and_helped", label: "Called & Helped", color: "bg-green-100" },
  { value: "need_follow_up", label: "Need Follow-up", color: "bg-yellow-100" },
  { value: "schedule_call", label: "Schedule Call", color: "bg-purple-100" },
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

  const getStatusLabel = (status) => {
    const option = CALL_STATUS_OPTIONS.find((o) => o.value === status);
    return option?.label || status;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Leads Management</h1>
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Track and manage all customer inquiries and leads
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card p-1.5 rounded-xl border border-border shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-3">Filter by Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-muted border-none text-xs font-bold text-foreground px-4 py-2 rounded-lg focus:ring-2 focus:ring-border outline-none transition-all cursor-pointer"
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

        {/* Leads Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-foreground">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Interest</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Assignment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Notes</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Updated</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {leads.map((lead) => (
                  <tr key={lead._id} className="group hover:bg-muted transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-foreground tracking-tight">{lead.name}</span>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground tracking-tight">{lead.email}</span>
                        <span className="text-[11px] font-medium text-muted-foreground tracking-tight">{lead.phone}</span>
                      </div>
                    </td>

                    {/* Course Interest */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border/50">
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
                          className="bg-muted border border-border px-2 py-1.5 rounded-lg text-xs font-bold text-foreground outline-none"
                        >
                          {CALL_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(
                            lead.callStatus
                          )}`}
                        >
                          {getStatusLabel(lead.callStatus)}
                        </span>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="px-6 py-4">
                      {editingId === lead._id ? (
                        <input
                          type="text"
                          placeholder="Counselor"
                          value={formData.assignedTo}
                          onChange={(e) =>
                            setFormData({ ...formData, assignedTo: e.target.value })
                          }
                          className="bg-muted border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-foreground w-full outline-none focus:ring-2 focus:ring-border/50 transition-all"
                        />
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">{lead.assignedTo || "-"}</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4">
                      {editingId === lead._id ? (
                        <textarea
                          placeholder="Add notes..."
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          className="bg-muted border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-foreground w-full outline-none focus:ring-2 focus:ring-border/50 transition-all min-w-[200px]"
                          rows="2"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground truncate block max-w-[150px]" title={lead.notes}>
                          {lead.notes || "-"}
                        </span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                        {lead.lastUpdated
                          ? new Date(lead.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                          : "-"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        {editingId === lead._id ? (
                          <>
                            <Button
                              onClick={() => handleUpdate(lead._id)}
                              disabled={loading}
                              variant="ghost"
                              size="sm"
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors h-auto"
                            >
                              {loading ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              onClick={() => setEditingId(null)}
                              variant="ghost"
                              size="sm"
                              className="text-xs font-bold text-muted-foreground hover:text-muted-foreground transition-colors h-auto"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(lead)}
                              variant="ghost"
                              size="sm"
                              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors h-auto"
                            >
                              Edit
                            </Button>

                            <Button
                              onClick={() => handleDelete(lead._id)}
                              variant="ghost"
                              size="sm"
                              className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors h-auto"
                            >
                              Delete
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
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">No Leads Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

