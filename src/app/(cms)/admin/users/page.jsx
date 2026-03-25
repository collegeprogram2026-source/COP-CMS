"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/apiClient";

const SECTION_NAMES = {
  leads: "Leads",
  courses: "Courses",
  blogs: "Blogs",
  providers: "Providers",
  specializations: "Specializations",
  "degree-types": "Degree Types",
  "provider-courses": "Provider Courses",
  reviews: "Reviews",
  "home-hero-section": "Hero Section",
  "home-industry-experts-section": "Industry Experts",
  "home-program-experts-section": "Program Experts",
  "home-questions-section": "Questions",
  pages: "Pages",
  "page-content": "Page Content",
};

const ACTION_COLORS = {
  create: "bg-green-100 text-emerald-600",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-rose-600",
  view: "bg-muted text-gray-800",
};

const ACCESS_OPTIONS = [
  { id: "pages", label: "Pages" },
  { id: "providers", label: "Providers" },
  { id: "courses", label: "Courses" },
  { id: "provider-courses", label: "Provider Courses" },
  { id: "specializations", label: "Specializations" },
  { id: "degree-types", label: "Degree Types" },
  { id: "leads", label: "Leads" },
  { id: "reviews", label: "Reviews" },
  { id: "users", label: "Users Management" },
];

export default function UsersPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [users, setUsers] = useState([]);

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccessLevel, setInviteAccessLevel] = useState("viewer"); // "admin" or "viewer"
  const [inviteAccess, setInviteAccess] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState({ type: "", text: "" });

  // Delete user modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserData, setDeleteUserData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update access modal
  const [showUpdateAccessModal, setShowUpdateAccessModal] = useState(false);
  const [updateAccessUser, setUpdateAccessUser] = useState(null);
  const [updateAccessLevel, setUpdateAccessLevel] = useState("viewer"); // "admin" or "viewer"
  const [updateAccessList, setUpdateAccessList] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  const itemsPerPage = 20;

  const fetchUsers = async () => {
    try {
      const res = await callApi("/api/admin/users", {
        cache: "no-store",
        auth: true,
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filterSection) params.append("section", filterSection);
      if (filterUserId) params.append("userId", filterUserId);

      params.append("limit", itemsPerPage);
      params.append("skip", (currentPage - 1) * itemsPerPage);

      const res = await callApi(`/api/admin/activities?${params.toString()}`, {
        cache: "no-store",
        auth: true,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        setLoading(false);
        return;
      }

      setActivities(data.logs);
      setTotalActivities(data.total);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchActivities();
    };

    loadData();
  }, [filterSection, filterUserId, currentPage]);

  const handleAccessToggle = (accessId) => {
    setInviteAccess((prev) =>
      prev.includes(accessId)
        ? prev.filter((id) => id !== accessId)
        : [...prev, accessId]
    );
  };

  const handleAccessToggleForUpdate = (accessId) => {
    setUpdateAccessList((prev) =>
      prev.includes(accessId)
        ? prev.filter((id) => id !== accessId)
        : [...prev, accessId]
    );
  };

  const handleDeleteUser = async () => {
    if (!deleteUserData) return;
    setDeleteLoading(true);

    try {
      const res = await callApi(`/api/admin/users/${deleteUserData.userId}`, {
        method: "DELETE",
        auth: true,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to delete user");
        setDeleteLoading(false);
        return;
      }

      setUsers((prev) => prev.filter((u) => u.userId !== deleteUserData.userId));
      setShowDeleteModal(false);
      setDeleteUserData(null);
      alert(data.message);
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenUpdateAccessModal = (user) => {
    if (!user || !user.userId) {
      alert("Error: User ID not found. Please try again.");
      return;
    }
    setUpdateAccessUser(user);
    setUpdateAccessLevel(user.role === "admin" ? "admin" : "viewer");
    setUpdateAccessList(user.access || []);
    setUpdateMessage({ type: "", text: "" });
    setShowUpdateAccessModal(true);
  };

  const handleUpdateAccess = async () => {
    if (!updateAccessUser || !updateAccessUser.userId) {
      setUpdateMessage({
        type: "error",
        text: "User ID is missing. Please close and try again.",
      });
      return;
    }
    setUpdateLoading(true);

    // If admin, grant all sections; if viewer, use selected sections
    const accessToSend = updateAccessLevel === "admin"
      ? ACCESS_OPTIONS.map(opt => opt.id)
      : updateAccessList;

    try {
      const res = await callApi(`/api/admin/users/${updateAccessUser.userId}`, {
        method: "PUT",
        auth: true,
        body: {
          access: accessToSend,
          role: updateAccessLevel === "admin" ? "admin" : "viewer",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setUpdateMessage({
          type: "error",
          text: data?.error || "Failed to update user access",
        });
        setUpdateLoading(false);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === updateAccessUser.userId
            ? { ...u, access: accessToSend, role: updateAccessLevel === "admin" ? "admin" : "viewer" }
            : u
        )
      );

      setUpdateMessage({
        type: "success",
        text: "User access updated successfully!",
      });

      setTimeout(() => {
        setShowUpdateAccessModal(false);
        setUpdateAccessUser(null);
        setUpdateAccessLevel("viewer");
        setUpdateAccessList([]);
        setUpdateMessage({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      setUpdateMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteMessage({ type: "", text: "" });

    if (!inviteEmail) {
      setInviteMessage({ type: "error", text: "Email is required" });
      return;
    }

    // If admin, grant all sections
    const accessToSend = inviteAccessLevel === "admin"
      ? ACCESS_OPTIONS.map(opt => opt.id)
      : inviteAccess;

    if (accessToSend.length === 0) {
      setInviteMessage({ type: "error", text: "Please select at least one section" });
      return;
    }

    setInviteLoading(true);

    try {
      const res = await callApi("/api/auth/send-invite", {
        method: "POST",
        body: {
          email: inviteEmail,
          access: accessToSend,
          role: inviteAccessLevel === "admin" ? "admin" : "viewer",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteMessage({
          type: "error",
          text: data?.error || "Failed to send invite",
        });
        setInviteLoading(false);
        return;
      }

      setInviteMessage({
        type: "success",
        text: `Invitation sent to ${inviteEmail}! They will receive an email to set their password.`,
      });

      // Reset form
      setTimeout(() => {
        setInviteEmail("");
        setInviteAccessLevel("viewer");
        setInviteAccess([]);
        setInviteMessage({ type: "", text: "" });
        setShowInviteModal(false);
      }, 2000);
    } catch (err) {
      setInviteMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Activity Log & Users</h1>
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Manage administrative access and track system-wide changes
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            + Invite Admin
          </Button>
        </div>

        {/* ================================ */}
        {/* Users Section */}
        {/* ================================ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Active Users</h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.userId}
                  className="group bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-border transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-foreground tracking-tight truncate">{user.userName}</div>
                      <div className="text-[11px] font-medium text-muted-foreground mt-1 truncate">{user.userEmail}</div>
                    </div>
                    <div>
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                          Read-only
                        </span>
                      )}
                    </div>
                  </div>

                  {user.role !== "admin" && user.access && user.access.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Permissions</p>
                      <div className="flex flex-wrap gap-1">
                        {user.access.slice(0, 3).map((acc) => (
                          <span
                            key={acc}
                            className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-medium border border-border/50"
                          >
                            {SECTION_NAMES[acc] || acc}
                          </span>
                        ))}
                        {user.access.length > 3 && (
                          <span className="text-[10px] text-muted-foreground font-medium self-center ml-1">
                            +{user.access.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {user.role === "admin" && (
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-muted-foreground italic">
                      <span className="text-rose-500">✓</span> Full system access
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setFilterUserId(user.userId)}
                      variant="outline"
                      size="sm"
                      className="text-center text-[10px] font-bold text-muted-foreground bg-muted hover:bg-muted px-2 py-2 rounded-lg border border-border/50 transition-colors uppercase tracking-widest"
                      title="View Activity"
                    >
                      Logs
                    </Button>
                    <Button
                      onClick={() => handleOpenUpdateAccessModal(user)}
                      variant="outline"
                      size="sm"
                      className="text-center text-[10px] font-bold text-muted-foreground bg-muted hover:bg-muted px-2 py-2 rounded-lg border border-border/50 transition-colors uppercase tracking-widest"
                      title="Update Access"
                    >
                      Access
                    </Button>
                    <Button
                      onClick={() => {
                        setDeleteUserData(user);
                        setShowDeleteModal(true);
                      }}
                      variant="destructive"
                      size="sm"
                      className="text-center text-[10px] font-bold text-rose-500 bg-rose-50/50 hover:bg-rose-50 px-2 py-2 rounded-lg border border-rose-100 transition-colors uppercase tracking-widest"
                      title="Delete User"
                    >
                      Del
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center bg-card rounded-2xl border border-dashed border-border text-muted-foreground text-sm font-medium">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* ================================ */}
        {/* Activity Section Header & Filters */}
        {/* ================================ */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">System Activity Logs</h2>
            <div className="h-[2px] w-8 bg-primary rounded-full" />
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-card p-1.5 rounded-2xl border border-border shadow-sm w-full sm:w-auto">
            {/* Section Filter */}
            <div className="flex items-center flex-1 sm:flex-none">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-3 mr-2">Section</span>
              <select
                value={filterSection}
                onChange={(e) => {
                  setFilterSection(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-muted border-none text-xs font-bold text-foreground px-3 py-2 rounded-lg focus:ring-2 focus:ring-border outline-none transition-all cursor-pointer w-full"
              >
                <option value="">All Sections</option>
                {Object.entries(SECTION_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-6 bg-muted hidden sm:block" />

            {/* User Filter */}
            <div className="flex items-center flex-1 sm:flex-none">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 mr-2">User</span>
              <select
                value={filterUserId}
                onChange={(e) => {
                  setFilterUserId(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-muted border-none text-xs font-bold text-foreground px-3 py-2 rounded-lg focus:ring-2 focus:ring-border outline-none transition-all cursor-pointer w-full min-w-[120px]"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>{user.userName}</option>
                ))}
              </select>
            </div>

            {filterUserId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterUserId("");
                  setCurrentPage(1);
                }}
                className="ml-2 text-[10px] font-bold text-rose-500 hover:text-rose-600 pr-3"
              >
                Clear ×
              </Button>
            )}
          </div>
        </div>

        {/* ================================ */}
        {/* Activity Table */}
        {/* ================================ */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-foreground">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Administrator</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Section</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Target Item</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="w-10 h-10 border-[3px] border-border/50 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Fetching Logs</p>
                    </td>
                  </tr>
                ) : activities.length > 0 ? (
                  activities.map((activity) => (
                    <tr key={activity._id} className="group hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground tracking-tight">{activity.userName}</span>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{activity.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${activity.action === 'create' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                            activity.action === 'update' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                              activity.action === 'delete' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                "bg-muted text-muted-foreground border-border"
                            }`}
                        >
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-lg border border-border/50">
                          {SECTION_NAMES[activity.section] || activity.section}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-bold text-foreground tracking-tight truncate">
                            {activity.itemName || activity.itemId || "-"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate italic" title={activity.details}>
                            {activity.details || "No additional details"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground">
                            {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase">
                            {new Date(activity.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                        <span className="text-2xl">📋</span>
                      </div>
                      <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">No activities found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================ */}
        {/* Pagination */}
        {/* ================================ */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-4">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="inline-flex items-center px-4 py-2 bg-card border border-border text-xs font-bold text-muted-foreground rounded-xl hover:bg-muted disabled:opacity-40 transition-all shadow-sm hover:shadow active:scale-95"
            >
              ← Previous
            </Button>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-2 bg-muted rounded-lg">
              Page <span className="text-foreground">{currentPage}</span> of <span className="text-foreground">{totalPages}</span>
            </div>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="inline-flex items-center px-4 py-2 bg-card border border-border text-xs font-bold text-muted-foreground rounded-xl hover:bg-muted disabled:opacity-40 transition-all shadow-sm hover:shadow active:scale-95"
            >
              Next →
            </Button>
          </div>
        )}

        {/* ================================ */}
        {/* Invite Admin Modal */}
        {/* ================================ */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowInviteModal(false)} />
            <div className="relative bg-card rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">Invite Admin</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-2">
                    Send a system invitation to grant administrative access.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInviteModal(false)}
                  className="w-10 h-10 bg-muted flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-muted-foreground transition-all"
                >
                  ×
                </Button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-sm font-medium text-foreground focus:ring-4 focus:ring-border/50 focus:border-border outline-none transition-all placeholder:text-muted-foreground/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    Access Level
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setInviteAccessLevel("viewer");
                        setInviteAccess([]);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all h-auto ${inviteAccessLevel === "viewer"
                        ? "border-slate-900 bg-primary text-white"
                        : "border-border/50 bg-muted text-muted-foreground hover:border-border"
                        }`}
                    >
                      <div className="text-sm font-bold">Read-only</div>
                      <div className="text-[10px] opacity-70 mt-1 font-medium">Selected sections</div>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setInviteAccessLevel("admin");
                        setInviteAccess(ACCESS_OPTIONS.map(opt => opt.id));
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all h-auto ${inviteAccessLevel === "admin"
                        ? "border-slate-900 bg-primary text-white"
                        : "border-border/50 bg-muted text-muted-foreground hover:border-border"
                        }`}
                    >
                      <div className="text-sm font-bold">Full Admin</div>
                      <div className="text-[10px] opacity-70 mt-1 font-medium">Grant all permissions</div>
                    </Button>
                  </div>
                </div>

                {inviteAccessLevel === "viewer" && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
                      Permitted Sections
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-muted p-5 rounded-3xl border border-border/50">
                      {ACCESS_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={inviteAccess.includes(option.id)}
                              onChange={() => handleAccessToggle(option.id)}
                              className="w-5 h-5 rounded-lg border-border text-foreground focus:ring-slate-900 transition-all cursor-pointer"
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {inviteMessage.text && (
                  <div
                    className={`p-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-center animate-in zoom-in-95 duration-200 ${inviteMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                  >
                    {inviteMessage.text}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail("");
                      setInviteAccessLevel("viewer");
                      setInviteAccess([]);
                      setInviteMessage({ type: "", text: "" });
                    }}
                    className="flex-1 px-8 py-4 bg-card border border-border text-muted-foreground text-sm font-bold rounded-2xl hover:bg-muted transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-1 px-8 py-4 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary disabled:opacity-60 transition-all shadow-lg shadow-border/50 active:scale-95"
                  >
                    {inviteLoading ? "Sending Invitation..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================ */}
        {/* Delete User Modal */}
        {/* ================================ */}
        {showDeleteModal && deleteUserData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-card rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">Delete User</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-2">
                    Removing access for <span className="text-foreground font-bold">{deleteUserData.userName}</span>
                  </p>
                </div>
              </div>

              <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl mb-8">
                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest leading-relaxed">
                  ⚠️ Warning: This action is permanent. All administrative access for {deleteUserData.userEmail} will be revoked immediately.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteUserData(null);
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-8 py-4 bg-card border border-border text-muted-foreground text-sm font-bold rounded-2xl hover:bg-muted transition-all active:scale-95"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  variant="destructive"
                  className="flex-1 px-8 py-4 bg-rose-600 text-white text-sm font-bold rounded-2xl hover:bg-rose-700 disabled:opacity-60 transition-all shadow-lg shadow-rose-200 active:scale-95"
                >
                  {deleteLoading ? "Deleting..." : "Delete User"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================================ */}
        {/* Update User Access Modal */}
        {/* ================================ */}
        {showUpdateAccessModal && updateAccessUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowUpdateAccessModal(false)} />
            <div className="relative bg-card rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">Access Control</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-2">
                    Manage permissions for <span className="text-foreground font-bold">{updateAccessUser.userName}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUpdateAccessModal(false)}
                  className="w-10 h-10 bg-muted flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-muted-foreground transition-all"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    Access Level
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setUpdateAccessLevel("viewer");
                        setUpdateAccessList(updateAccessUser.access || []);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all h-auto ${updateAccessLevel === "viewer"
                        ? "border-slate-900 bg-primary text-white"
                        : "border-border/50 bg-muted text-muted-foreground hover:border-border"
                        }`}
                    >
                      <div className="text-sm font-bold">Read-only</div>
                      <div className="text-[10px] opacity-70 mt-1 font-medium">Selected sections</div>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setUpdateAccessLevel("admin");
                        setUpdateAccessList(ACCESS_OPTIONS.map(opt => opt.id));
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all h-auto ${updateAccessLevel === "admin"
                        ? "border-slate-900 bg-primary text-white"
                        : "border-border/50 bg-muted text-muted-foreground hover:border-border"
                        }`}
                    >
                      <div className="text-sm font-bold">Full Admin</div>
                      <div className="text-[10px] opacity-70 mt-1 font-medium">Grant all permissions</div>
                    </Button>
                  </div>
                </div>

                {updateAccessLevel === "viewer" ? (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
                      Permitted Sections
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-muted p-5 rounded-3xl border border-border/50 max-h-60 overflow-y-auto custom-scrollbar">
                      {ACCESS_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={updateAccessList.includes(option.id)}
                              onChange={() => handleAccessToggleForUpdate(option.id)}
                              className="w-5 h-5 rounded-lg border-border text-foreground focus:ring-slate-900 transition-all cursor-pointer"
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl animate-in fade-in duration-300">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-widest leading-relaxed">
                      ✓ Administrator status grants unrestricted access to all system sections and configurations.
                    </p>
                  </div>
                )}

                {updateMessage.text && (
                  <div
                    className={`p-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-center animate-in zoom-in-95 duration-200 ${updateMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                  >
                    {updateMessage.text}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowUpdateAccessModal(false);
                      setUpdateAccessUser(null);
                      setUpdateAccessLevel("viewer");
                      setUpdateAccessList([]);
                      setUpdateMessage({ type: "", text: "" });
                    }}
                    disabled={updateLoading}
                    className="flex-1 px-8 py-4 bg-card border border-border text-muted-foreground text-sm font-bold rounded-2xl hover:bg-muted transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpdateAccess}
                    disabled={updateLoading}
                    className="flex-1 px-8 py-4 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary disabled:opacity-60 transition-all shadow-lg shadow-border/50 active:scale-95"
                  >
                    {updateLoading ? "Saving Changes..." : "Update Access"}
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

