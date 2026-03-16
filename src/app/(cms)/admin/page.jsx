"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BookOpen, Building2, MessageSquare, Star } from "lucide-react";
import { callApi } from "@/lib/apiClient";

// ─── Stat Card ────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-muted/80 transition-colors">
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${trend >= 0
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-rose-500/10 text-red-500 border-red-100 dark:bg-rose-500/100/10 dark:text-red-400 dark:border-red-500/20 dark:bg-rose-500/100/10 dark:text-red-400 dark:border-red-500/20"
            }`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground mb-1">{value.toLocaleString()}</p>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-xl ring-1 ring-black/5">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-extrabold text-foreground">
          {p.value} <span className="text-muted-foreground font-medium ml-1">{p.name}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Chart Panel ─────────────────────────────────────────────────────

function ChartPanel({ title, subtitle, children, empty }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border/50 bg-muted/30">
        <h2 className="text-base font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">
        {empty ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-border text-muted-foreground/30 gap-2">
            <span className="text-2xl opacity-50">📊</span>
            <p className="text-xs font-medium">No data available yet</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, providers: 0, leads: 0, reviews: 0 });
  const [reviewsByRating, setReviewsByRating] = useState([]);
  const [leadsBySource, setLeadsBySource] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reviewsRes, leadsRes] = await Promise.all([
          callApi("/api/admin/dashboard/stats", { auth: true }),
          callApi("/api/admin/dashboard/reviews-by-rating", { auth: true }),
          callApi("/api/admin/dashboard/leads-by-source", { auth: true }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (reviewsRes.ok) setReviewsByRating(await reviewsRes.json());
        if (leadsRes.ok) setLeadsBySource(await leadsRes.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Loading Dashboard
        </p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Courses", value: stats.courses, icon: BookOpen },
    { title: "Total Providers", value: stats.providers, icon: Building2 },
    { title: "Total Leads", value: stats.leads, icon: MessageSquare },
    { title: "Total Reviews", value: stats.reviews, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Welcome back — here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Reviews by Rating */}
          <ChartPanel
            title="Reviews by Rating"
            subtitle="Distribution of review scores"
            empty={reviewsByRating.length === 0}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reviewsByRating} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--primary)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "var(--primary)" }}
                  name="Reviews"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          {/* Leads by Source */}
          <ChartPanel
            title="Leads by Source"
            subtitle="Where your leads are coming from"
            empty={leadsBySource.length === 0}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsBySource} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  name="Leads"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

        </div>
      </div>
    </div>
  );
}
