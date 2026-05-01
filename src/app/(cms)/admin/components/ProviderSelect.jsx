"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

export default function ProviderSelect({ value, onChange, required = false }) {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await callApi("/api/admin/providers", {
          cache: "no-store",
          auth: true,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("ProviderSelect: failed to fetch providers", { status: res.status, err });
          setProviders([]);
          return;
        }
        const data = await res.json();
        setProviders(Array.isArray(data) ? data : []);
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

