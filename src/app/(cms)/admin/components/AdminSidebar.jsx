"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  UserCircle,
  MessageSquare,
  Star,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { callApi } from "@/lib/apiClient";

const sidebarItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: <LayoutDashboard size={18} />,
    shortcut: "1",
    section: null,
  },
  {
    name: "Pages",
    path: "/admin/pages",
    icon: <BookOpen size={18} />,
    shortcut: "2",
    section: "pages",
  },
  {
    name: "Courses",
    icon: <GraduationCap size={18} />,
    section: "courses",
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
    icon: <MessageSquare size={18} />,
    shortcut: "L",
    section: "leads",
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: <Star size={18} />,
    shortcut: "R",
    section: "reviews",
  },
  {
    name: "Students",
    path: "/admin/students",
    icon: <UserCircle size={18} />,
    shortcut: "S",
    section: "students",
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <Users size={18} />,
    shortcut: "U",
    section: "users",
  },
];

export default function AdminSidebar({ isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await callApi("/api/admin/users/self", { auth: true });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/admin/login" });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleItems = sidebarItems.filter((item) => {
    // 1. Access check
    const hasAccess =
      item.section === null ||
      userData?.role === "admin" ||
      (item.children
        ? item.children.some((child) => (userData?.access || []).includes(child.section))
        : (userData?.access || []).includes(item.section));

    if (!hasAccess) return false;

    // 2. Search check
    if (!searchQuery) return true;

    const nameMatches = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const childMatches =
      item.children &&
      item.children.some(
        (child) =>
          (userData?.role === "admin" || (userData?.access || []).includes(child.section)) &&
          child.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return nameMatches || childMatches;
  });

  const getVisibleChildren = (children) => {
    if (userData?.role === "admin") {
      if (!searchQuery) return children;
      return children.filter((child) => child.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return children.filter((child) => {
      const access = (userData?.access || []).includes(child.section);
      if (!access) return false;
      if (!searchQuery) return true;
      return child.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  // Auto-expand search results
  useEffect(() => {
    if (searchQuery) {
      const itemToOpen = sidebarItems.find(item =>
        item.children && getVisibleChildren(item.children).length > 0
      );
      if (itemToOpen) setOpenDropdown(itemToOpen.name);
    }
  }, [searchQuery]);

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 ${isCollapsed ? "w-20" : "w-72"} shadow-2xl h-screen max-h-screen overflow-hidden bg-background border-r border-border z-50 
        flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>

        {/* ── Brand Header ── */}
        <div
          onClick={() => isCollapsed && setIsCollapsed(false)}
          className={`p-5 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} group cursor-pointer hover:bg-muted/50 transition-colors relative`}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-black/5 transition-all 
              ${isCollapsed ? "group-hover:bg-primary/90" : "group-hover:scale-105"} shrink-0
            `}>
              {isCollapsed ? (
                <>
                  <span className="text-white text-lg font-black italic transition-all group-hover:hidden animate-in fade-in">C</span>
                  <ChevronRight size={18} className="text-white hidden group-hover:block animate-in zoom-in duration-200" />
                </>
              ) : (
                <span className="text-white text-lg font-black italic">C</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <span className="text-sm font-bold text-foreground leading-tight">COP CMS</span>
                <span className="text-[11px] font-medium text-muted-foreground">Admin Workspace</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(true);
              }}
              className="hidden lg:flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all hover:bg-muted p-1.5 rounded-lg text-muted-foreground hover:text-foreground animate-in fade-in"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* ── Global Search ── */}
        <div className="px-5 mb-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={isCollapsed ? "" : "Search"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full bg-muted/50 border-none rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none text-foreground
                ${isCollapsed ? "opacity-0 cursor-default" : "opacity-100"}
              `}
              disabled={isCollapsed}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-muted/80 p-1 rounded-md"
              >
                <X size={12} strokeWidth={3} />
              </button>
            ) : (
              !isCollapsed && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-background border border-border px-1.5 py-0.5 rounded-md shadow-sm pointer-events-none animate-in fade-in">
                  <span className="text-[10px] font-bold text-muted-foreground">⌘</span>
                  <span className="text-[10px] font-bold text-muted-foreground">K</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-hide">
          {visibleItems.length > 0 ? (
            <>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70 animate-in fade-in">Main Menu</p>
              )}

              {visibleItems.map((item) => {
                const isActive = pathname === item.path || (item.children && item.children.some(c => c.path === pathname));

                if (item.children) {
                  const visibleChildren = getVisibleChildren(item.children);
                  if (visibleChildren.length === 0) return null;
                  const isOpen = openDropdown === item.name;

                  return (
                    <div key={item.name} className="space-y-0.5">
                      <button
                        onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                        className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                      ${isActive ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                    `}
                      >
                        <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                          <div className={`${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                            {item.icon}
                          </div>
                          {!isCollapsed && <span className="animate-in fade-in duration-300">{item.name}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown size={14} className={`transition-transform duration-300 animate-in fade-in ${isOpen ? "rotate-180" : "opacity-40 group-hover:opacity-100"}`} />
                        )}
                      </button>

                      {isOpen && (
                        <div className="ml-9 border-l border-border py-1 space-y-0.5 animate-in slide-in-from-left-2 duration-200">
                          {visibleChildren.map((child) => (
                            <Link
                              key={child.path}
                              href={child.path}
                              className={`
                            block px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all
                            ${pathname === child.path
                                  ? "text-foreground bg-muted"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }
                            ${isCollapsed ? "hidden" : ""}
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

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${pathname === item.path
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                `}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                      <div className={`${pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {item.icon}
                      </div>
                      {!isCollapsed && <span className="animate-in fade-in duration-300">{item.name}</span>}
                    </div>
                    {!isCollapsed && item.shortcut && (
                      <span className={`text-[10px] font-bold opacity-0 group-hover:opacity-40 transition-opacity border px-1 rounded border-border animate-in fade-in`}>
                        ⌘{item.shortcut}
                      </span>
                    )}
                  </Link>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3">
                <Search size={20} className="text-muted-foreground/50" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">No results found</p>
              <p className="text-xs font-medium text-muted-foreground">Try searching for something else</p>
            </div>
          )}

          {/* <div className="pt-6 pb-2">
            <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Support</p>
            <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all group">
              <Settings size={18} className="text-muted-foreground group-hover:text-muted-foreground" />
              <span>Settings</span>
            </Link>
            <Link href="/admin/help" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all group">
              <HelpCircle size={18} className="text-muted-foreground group-hover:text-muted-foreground" />
              <span>Help Center</span>
            </Link>
          </div> */}
        </div>

        {/* ── User Footer ── */}
        <div className="p-4 bg-muted/30 border-t border-border">
          {/* Theme Toggler */}
          <div className={`p-1 bg-muted/50 rounded-xl flex items-center gap-1 mb-3 ${isCollapsed ? "flex-col" : ""}`}>
            <button
              onClick={() => setTheme("light")}
              className={`
                flex-1 flex items-center justify-center py-2 rounded-lg transition-all
                ${mounted && theme === "light"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
              title="Light Mode"
            >
              <Sun size={14} className={mounted && theme === "light" ? "text-amber-500" : ""} />
              {!isCollapsed && <span className="ml-2 text-[11px] font-bold">Light</span>}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`
                flex-1 flex items-center justify-center py-2 rounded-lg transition-all
                ${mounted && theme === "dark"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
              title="Dark Mode"
            >
              <Moon size={14} className={mounted && theme === "dark" ? "text-indigo-400" : ""} />
              {!isCollapsed && <span className="ml-2 text-[11px] font-bold">Dark</span>}
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`
                flex-1 flex items-center justify-center py-2 rounded-lg transition-all
                ${mounted && theme === "system"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
              title="System Mode"
            >
              <Settings size={14} />
              {!isCollapsed && <span className="ml-2 text-[11px] font-bold">System</span>}
            </button>
          </div>

          <div
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-background hover:shadow-sm border border-transparent hover:border-border transition-all cursor-pointer group"
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
              <div className="w-9 h-9 rounded-full bg-muted overflow-hidden ring-2 ring-background shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-bold text-xs uppercase">
                    {user?.firstName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 animate-in fade-in duration-300">
                  <span className="text-xs font-bold text-foreground truncate">
                    {user?.fullName || "Admin User"}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[120px]">
                    {user?.primaryEmailAddress?.emailAddress || "admin@example.com"}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col gap-0.5 opacity-20 group-hover:opacity-100 transition-opacity animate-in fade-in">
                <ChevronDown size={14} className="mb-[-4px]" />
                <ChevronDown size={14} className="rotate-180" />
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* Logout Profile Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-border animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Sign Out?</h2>
              <p className="text-sm font-medium text-muted-foreground mb-8 px-4">
                You'll need to log back in to access the central control panel.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleLogout}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-bold rounded-2xl transition-all shadow-lg shadow-black/5 active:scale-[0.98]"
                >
                  Yes, Sign Out
                </Button>
                <Button
                  onClick={() => setShowLogoutConfirm(false)}
                  variant="ghost"
                  className="w-full h-12 text-muted-foreground font-bold rounded-2xl hover:bg-muted transition-all"
                >
                  Stay Logged In
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 py-4 px-8 border-t border-border text-center">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">v1.2.0 • COP CMS Enterprise</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

