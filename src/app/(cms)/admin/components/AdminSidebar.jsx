"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  MessageSquare,
  Star,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { callApi } from "@/lib/apiClient";

const sidebarItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: <LayoutDashboard size={16} />,
    section: null, // Dashboard always shows
  },
  {
    name: "Pages",
    path: "/admin/pages",
    icon: <BookOpen size={16} />,
    section: "pages",
  },
  {
    name: "Create Course",
    icon: <GraduationCap size={16} />,
    section: "courses", // Show if user has any course-related access
    children: [
      { name: "Degree Type", path: "/admin/degree-types", section: "degree-types" },
      { name: "Courses", path: "/admin/courses", section: "courses" },
      { name: "Specialization", path: "/admin/specializations", section: "specializations" },
      { name: "Providers", path: "/admin/providers", section: "providers" },
      { name: "Provider Courses", path: "/admin/provider-courses", section: "provider-courses" },
    ],
  },
  {
    name: "Leads",
    path: "/admin/leads",
    icon: <MessageSquare size={16} />,
    section: "leads",
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: <Star size={16} />,
    section: "reviews",
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <Users size={16} />,
    section: "users",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await callApi("/api/admin/users/self", { auth: true });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/login" });
  };

  // Filter items based on user access
  const visibleItems = sidebarItems.filter((item) => {
    // Dashboard always visible
    if (item.section === null) return true;

    // If admin, show all
    if (userData?.role === "admin") return true;

    // Show if user has access to this section or any of its children
    if (item.children) {
      return item.children.some((child) => (userData?.access || []).includes(child.section));
    }
    return (userData?.access || []).includes(item.section);
  });

  // Filter children based on user access
  const getVisibleChildren = (children) => {
    if (userData?.role === "admin") return children;
    return children.filter((child) => (userData?.access || []).includes(child.section));
  };

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen overflow-y-auto bg-white border-r-2 border-slate-100 z-40 flex flex-col">

      {/* ── Logo / Brand ── */}
      <div className="px-5 py-5 border-b-2 border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">COP CMS</p>
            <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">

        {/* Section label */}
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-3 pb-2">
          Menu
        </p>

        {visibleItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.children &&
              item.children.some((child) => child.path === pathname));

          // ── Dropdown item ──
          if (item.children) {
            const visibleChildren = getVisibleChildren(item.children);
            if (visibleChildren.length === 0) return null; // Hide if no visible children

            const isOpen = openDropdown === item.name;
            return (
              <div key={item.name}>
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Children */}
                {isOpen && (
                  <div className="mt-0.5 ml-4 pl-3 border-l-2 border-slate-100 space-y-0.5 py-1">
                    {visibleChildren.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`
                          block px-3 py-2 rounded-lg text-sm transition-colors
                          ${pathname === child.path
                            ? "bg-slate-100 text-slate-800 font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          }
                        `}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // ── Regular item ──
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === item.path
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t-2 border-slate-100 space-y-3">
        <p className="text-xs text-slate-400">© 2026 COP CMS</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}
