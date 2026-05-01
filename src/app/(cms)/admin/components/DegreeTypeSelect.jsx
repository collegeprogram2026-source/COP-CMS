"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

export default function DegreeTypeSelect({
  value,
  onChange,
  required = false,
  className = "",
}) {
  const [degreeTypes, setDegreeTypes] = useState([]);

  useEffect(() => {
    const fetchDegreeTypes = async () => {
      try {
        const res = await callApi("/api/admin/degree-types", {
          cache: "no-store",
          auth: true,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("DegreeTypeSelect: failed to fetch degree types", { status: res.status, err });
          setDegreeTypes([]);
          return;
        }
        const data = await res.json();
        setDegreeTypes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching degree types", err);
        setDegreeTypes([]);
      }
    };

    fetchDegreeTypes();
  }, []);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full bg-muted/30 dark:bg-zinc-800/50 border border-border/50 dark:border-zinc-700/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-foreground text-sm font-medium disabled:opacity-50 appearance-none cursor-pointer pr-10 ${className}`}
      >
        <option value="" className="bg-white dark:bg-zinc-900 text-foreground">Select Degree Type</option>

        {degreeTypes.map((degree) => (
          <option key={degree._id} value={degree._id} className="bg-white dark:bg-zinc-900 text-foreground">
            {degree.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  );
}

