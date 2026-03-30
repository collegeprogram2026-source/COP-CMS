"use client";

import { useEffect, useState } from "react";

export default function ProviderSelect({ value, onChange, required = false }) {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch("/api/admin/providers", { cache: "no-store" });
        const data = await res.json();
        setProviders(data);
      } catch (err) {
        console.error("Error fetching providers", err);
        setProviders([]);
      }
    };

    fetchProviders();
  }, []);

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border px-3 py-2 rounded-md w-full bg-card"
    >
      <option value="">Select Provider</option>
      {providers.map((p) => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

