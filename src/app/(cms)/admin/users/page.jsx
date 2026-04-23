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
  students: "Students",
  "home-hero-section": "Hero Section",
  "home-industry-experts-section": "Industry Experts",
  "home-program-experts-section": "Program Experts",
  "home-questions-section": "Questions",
  pages: "Pages",
  "page-content": "Page Content",
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
  { id: "students", label: "Students" },
  { id: "users", label: "Users Management" },
];

/* ── shared input class ── */
const inputCls =
  "w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 " +
  "rounded-2xl px-5 py-4 text-sm font-medium " +
  "text-zinc-900 dark:text-zinc-100 " +
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500 " +
  "focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:border-transparent " +
  "outline-none transition-all";

export default function UsersPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [users, setUsers] = useState([]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccessLevel, setInviteAccessLevel] = useState("viewer");
  const [inviteAccess, setInviteAccess] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState({ type: "", text: "" });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserData, setDeleteUserData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showUpdateAccessModal, setShowUpdateAccessModal] = useState(false);
  const [updateAccessUser, setUpdateAccessUser] = useState(null);
  const [updateAccessLevel, setUpdateAccessLevel] = useState("viewer");
  const [updateAccessList, setUpdateAccessList] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  const itemsPerPage = 20;

  const fetchUsers = async () => {
    try {
      const res = await callApi("/api/admin/users", { cache: "no-store", auth: true });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
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
      const res = await callApi(`/api/admin/activities?${params.toString()}`, { cache: "no-store", auth: true });
      const data = await res.json();
      if (!res.ok) { setLoading(false); return; }
      setActivities(data.logs);
      setTotalActivities(data.total);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchActivities();
  }, [filterSection, filterUserId, currentPage]);

  const handleAccessToggle = (id) =>
    setInviteAccess((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleAccessToggleForUpdate = (id) =>
    setUpdateAccessList((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleDeleteUser = async () => {
    if (!deleteUserData) return;
    setDeleteLoading(true);
    try {
      const res = await callApi(`/api/admin/users/${deleteUserData.userId}`, { method: "DELETE", auth: true });
      const data = await res.json();
      if (!res.ok) { alert(data?.error || "Failed to delete user"); setDeleteLoading(false); return; }
      setUsers((prev) => prev.filter((u) => u.userId !== deleteUserData.userId));
      setShowDeleteModal(false);
      setDeleteUserData(null);
      alert(data.message);
    } catch { alert("Network error. Please try again."); }
    finally { setDeleteLoading(false); }
  };

  const handleOpenUpdateAccessModal = (user) => {
    if (!user?.userId) { alert("Error: User ID not found."); return; }
    setUpdateAccessUser(user);
    setUpdateAccessLevel(user.role === "admin" ? "admin" : "viewer");
    setUpdateAccessList(user.access || []);
    setUpdateMessage({ type: "", text: "" });
    setShowUpdateAccessModal(true);
  };

  const handleUpdateAccess = async () => {
    if (!updateAccessUser?.userId) { setUpdateMessage({ type: "error", text: "User ID is missing." }); return; }
    setUpdateLoading(true);
    const accessToSend = updateAccessLevel === "admin" ? ACCESS_OPTIONS.map((o) => o.id) : updateAccessList;
    try {
      const res = await callApi(`/api/admin/users/${updateAccessUser.userId}`, {
        method: "PUT", auth: true,
        body: { access: accessToSend, role: updateAccessLevel === "admin" ? "admin" : "viewer" },
      });
      const data = await res.json();
      if (!res.ok) { setUpdateMessage({ type: "error", text: data?.error || "Failed to update" }); setUpdateLoading(false); return; }
      setUsers((prev) => prev.map((u) => u.userId === updateAccessUser.userId ? { ...u, access: accessToSend, role: updateAccessLevel === "admin" ? "admin" : "viewer" } : u));
      setUpdateMessage({ type: "success", text: "User access updated successfully!" });
      setTimeout(() => { setShowUpdateAccessModal(false); setUpdateAccessUser(null); setUpdateAccessLevel("viewer"); setUpdateAccessList([]); setUpdateMessage({ type: "", text: "" }); }, 1500);
    } catch { setUpdateMessage({ type: "error", text: "Network error. Please try again." }); }
    finally { setUpdateLoading(false); }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteMessage({ type: "", text: "" });
    if (!inviteEmail) { setInviteMessage({ type: "error", text: "Email is required" }); return; }
    const accessToSend = inviteAccessLevel === "admin" ? ACCESS_OPTIONS.map((o) => o.id) : inviteAccess;
    if (accessToSend.length === 0) { setInviteMessage({ type: "error", text: "Please select at least one section" }); return; }
    setInviteLoading(true);
    try {
      const res = await callApi("/api/auth/send-invite", {
        method: "POST",
        auth: true,
        body: { email: inviteEmail, access: accessToSend, role: inviteAccessLevel === "admin" ? "admin" : "viewer" },
      });
      const data = await res.json();
      if (!res.ok) { setInviteMessage({ type: "error", text: data?.error || "Failed to send invite" }); setInviteLoading(false); return; }
      setInviteMessage({ type: "success", text: `Invitation sent to ${inviteEmail}!` });
      setTimeout(() => { setInviteEmail(""); setInviteAccessLevel("viewer"); setInviteAccess([]); setInviteMessage({ type: "", text: "" }); setShowInviteModal(false); }, 2000);
    } catch { setInviteMessage({ type: "error", text: "Network error. Please try again." }); }
    finally { setInviteLoading(false); }
  };

  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  /* ── access level toggle buttons ── */
  const AccessLevelToggle = ({ value, onChange }) => (
    <div className="grid grid-cols-2 gap-3">
      {[
        { id: "viewer", title: "Read-only", sub: "Selected sections" },
        { id: "admin", title: "Full Admin", sub: "Grant all permissions" },
      ].map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${value === opt.id
            ? "border-zinc-900 dark:border-zinc-200 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
        >
          <div className="text-sm font-bold">{opt.title}</div>
          <div className="text-[10px] opacity-70 mt-0.5 font-medium">{opt.sub}</div>
        </button>
      ))}
    </div>
  );

  /* ── permissions checklist ── */
  const PermissionsGrid = ({ value, onChange }) => (
    <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700/50 max-h-60 overflow-y-auto">
      {ACCESS_OPTIONS.map((opt) => (
        <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.includes(opt.id)}
            onChange={() => onChange(opt.id)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-700 focus:ring-zinc-500 cursor-pointer transition-all"
          />
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );

  /* ── modal shell ── */
  const ModalShell = ({ onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="
        relative w-full max-w-lg p-8 rounded-2xl
        bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-700/50
        shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        animate-in zoom-in-95 slide-in-from-bottom-4 duration-200
      ">
        {children}
      </div>
    </div>
  );

  /* ── modal close button ── */
  const CloseBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-lg leading-none"
    >
      ×
    </button>
  );

  /* ── feedback banner ── */
  const FeedbackBanner = ({ type, text }) =>
    text ? (
      <div className={`p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center animate-in zoom-in-95 duration-200 ${type === "success"
        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
        }`}>
        {text}
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Activity Log & Users
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage administrative access and track system-wide changes
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="
              px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2
              bg-zinc-900 text-white hover:bg-zinc-700
              dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white
              dark:shadow-[0_0_16px_rgba(255,255,255,0.06)]
              shadow-sm
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            Invite Admin
          </Button>
        </div>

        {/* ── Users Section ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Active Users</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.length > 0 ? users.map((user) => (
              <div
                key={user.userId}
                className="
                  group p-5 rounded-2xl border transition-all
                  bg-white dark:bg-zinc-900
                  border-zinc-200 dark:border-zinc-700/50
                  hover:border-zinc-300 dark:hover:border-zinc-600
                  shadow-sm dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]
                  hover:shadow-md dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]
                "
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate text-sm">
                      {user.userName}
                    </div>
                    <div className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                      {user.userEmail}
                    </div>
                  </div>
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                      Read-only
                    </span>
                  )}
                </div>

                {user.role !== "admin" && user.access?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {user.access.slice(0, 3).map((acc) => (
                        <span key={acc} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50 px-2 py-0.5 rounded text-[10px] font-medium">
                          {SECTION_NAMES[acc] || acc}
                        </span>
                      ))}
                      {user.access.length > 3 && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium self-center ml-1">
                          +{user.access.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {user.role === "admin" && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                    <span className="text-emerald-500 dark:text-emerald-400">✓</span> Full system access
                  </div>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFilterUserId(user.userId)}
                    className="text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    Logs
                  </button>
                  <button
                    onClick={() => handleOpenUpdateAccessModal(user)}
                    className="text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    Access
                  </button>
                  <button
                    onClick={() => { setDeleteUserData(user); setShowDeleteModal(true); }}
                    className="text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20"
                  >
                    Del
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 text-sm font-medium bg-white dark:bg-zinc-900">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* ── Activity Header & Filters ── */}
        <div className="flex flex-col justify-start items-start gap-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">System Activity Logs</span>
            <div className="h-px w-8 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
          </div>

          <div className="
            flex flex-wrap items-center gap-2 w-full sm:w-auto
            bg-white dark:bg-zinc-900
            border border-zinc-200 dark:border-zinc-700/50
            rounded-xl p-1.5
            shadow-sm dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]
          ">
            <div className="flex items-center flex-1 sm:flex-none gap-2 px-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">Section</span>
              <select
                value={filterSection}
                onChange={(e) => { setFilterSection(e.target.value); setCurrentPage(1); }}
                className="bg-zinc-100 dark:bg-zinc-800 border-none text-xs font-semibold text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-zinc-400 outline-none transition-all cursor-pointer"
              >
                <option value="">All Sections</option>
                {ACCESS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

            <div className="flex items-center flex-1 sm:flex-none gap-2 px-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">User</span>
              <select
                value={filterUserId}
                onChange={(e) => { setFilterUserId(e.target.value); setCurrentPage(1); }}
                className="bg-zinc-100 dark:bg-zinc-800 border-none text-xs font-semibold text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-zinc-400 outline-none transition-all cursor-pointer min-w-[110px]"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>{user.userName}</option>
                ))}
              </select>
            </div>

            {filterUserId && (
              <button
                onClick={() => { setFilterUserId(""); setCurrentPage(1); }}
                className="text-[10px] font-bold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 pr-2 transition-colors"
              >
                Clear ×
              </button>
            )}
          </div>
        </div>

        {/* ── Activity Table ── */}
        <div className="
          rounded-2xl border overflow-hidden
          bg-white dark:bg-zinc-900
          border-zinc-200 dark:border-zinc-700/50
          shadow-sm dark:shadow-[0_4px_40px_rgba(0,0,0,0.45)]
        ">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
                  {["Administrator", "Action", "Section", "Target Item", "Timestamp"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-300 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fetching Logs…</p>
                    </td>
                  </tr>
                ) : activities.length > 0 ? activities.map((activity) => (
                  <tr key={activity._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{activity.userName}</div>
                      <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">{activity.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${activity.action === "create"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                        : activity.action === "update"
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                          : activity.action === "delete"
                            ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50"
                        }`}>
                        {activity.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                        {SECTION_NAMES[activity.section] || activity.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {activity.itemName || activity.itemId || "—"}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate italic" title={activity.details}>
                          {activity.details || "No additional details"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        {new Date(activity.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase mt-0.5">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📋</span>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">No activities found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="
                px-4 py-2 text-xs font-bold rounded-xl transition-all
                bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-700/50
                text-zinc-500 dark:text-zinc-400
                hover:bg-zinc-100 dark:hover:bg-zinc-800
                hover:text-zinc-900 dark:hover:text-zinc-100
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-sm
              "
            >
              ← Previous
            </button>
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
              Page <span className="text-zinc-700 dark:text-zinc-200">{currentPage}</span> of <span className="text-zinc-700 dark:text-zinc-200">{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="
                px-4 py-2 text-xs font-bold rounded-xl transition-all
                bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-700/50
                text-zinc-500 dark:text-zinc-400
                hover:bg-zinc-100 dark:hover:bg-zinc-800
                hover:text-zinc-900 dark:hover:text-zinc-100
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-sm
              "
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Invite Modal ── */}
        {showInviteModal && (
          <ModalShell onClose={() => setShowInviteModal(false)}>
            <div className="flex justify-between items-start mb-7">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Invite Admin</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Send a system invitation to grant access.</p>
              </div>
              <CloseBtn onClick={() => setShowInviteModal(false)} />
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com" className={inputCls} required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Access Level</label>
                <AccessLevelToggle
                  value={inviteAccessLevel}
                  onChange={(v) => { setInviteAccessLevel(v); if (v === "admin") setInviteAccess(ACCESS_OPTIONS.map((o) => o.id)); else setInviteAccess([]); }}
                />
              </div>

              {inviteAccessLevel === "viewer" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Permitted Sections</label>
                  <PermissionsGrid value={inviteAccess} onChange={handleAccessToggle} />
                </div>
              )}

              <FeedbackBanner {...inviteMessage} />

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowInviteModal(false); setInviteEmail(""); setInviteAccessLevel("viewer"); setInviteAccess([]); setInviteMessage({ type: "", text: "" }); }}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white disabled:opacity-40 transition-all">
                  {inviteLoading ? "Sending…" : "Send Invitation"}
                </button>
              </div>
            </form>
          </ModalShell>
        )}

        {/* ── Delete Modal ── */}
        {showDeleteModal && deleteUserData && (
          <ModalShell onClose={() => setShowDeleteModal(false)}>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Delete User</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Removing access for <span className="font-bold text-zinc-700 dark:text-zinc-300">{deleteUserData.userName}</span>
              </p>
            </div>

            <div className="p-4 mb-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed">
                ⚠️ This action is permanent. All administrative access for <span className="underline">{deleteUserData.userEmail}</span> will be revoked immediately.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteUserData(null); }}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all">
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-rose-600 text-white hover:bg-rose-700 dark:hover:bg-rose-500 disabled:opacity-40 transition-all shadow-sm dark:shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                {deleteLoading ? "Deleting…" : "Delete User"}
              </button>
            </div>
          </ModalShell>
        )}

        {/* ── Update Access Modal ── */}
        {showUpdateAccessModal && updateAccessUser && (
          <ModalShell onClose={() => setShowUpdateAccessModal(false)}>
            <div className="flex justify-between items-start mb-7">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Access Control</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Managing permissions for <span className="font-bold text-zinc-700 dark:text-zinc-300">{updateAccessUser.userName}</span>
                </p>
              </div>
              <CloseBtn onClick={() => setShowUpdateAccessModal(false)} />
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Access Level</label>
                <AccessLevelToggle
                  value={updateAccessLevel}
                  onChange={(v) => { setUpdateAccessLevel(v); if (v === "admin") setUpdateAccessList(ACCESS_OPTIONS.map((o) => o.id)); else setUpdateAccessList(updateAccessUser.access || []); }}
                />
              </div>

              {updateAccessLevel === "viewer" ? (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Permitted Sections</label>
                  <PermissionsGrid value={updateAccessList} onChange={handleAccessToggleForUpdate} />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed">
                    ✓ Administrator status grants unrestricted access to all system sections and configurations.
                  </p>
                </div>
              )}

              <FeedbackBanner {...updateMessage} />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowUpdateAccessModal(false); setUpdateAccessUser(null); setUpdateAccessLevel("viewer"); setUpdateAccessList([]); setUpdateMessage({ type: "", text: "" }); }}
                  disabled={updateLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAccess}
                  disabled={updateLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white disabled:opacity-40 transition-all">
                  {updateLoading ? "Saving…" : "Update Access"}
                </button>
              </div>
            </div>
          </ModalShell>
        )}
      </div>
    </div>
  );
}