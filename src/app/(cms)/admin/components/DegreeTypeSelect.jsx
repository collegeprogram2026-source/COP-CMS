"use client";

import { useEffect, useState } from "react";

export default function DegreeTypeSelect({
  value,
  onChange,
  required = false,
}) {
  const [degreeTypes, setDegreeTypes] = useState([]);

  useEffect(() => {
    const fetchDegreeTypes = async () => {
      const res = await fetch("/api/admin/degree-types", {
        cache: "no-store",
      });
      const data = await res.json();
      setDegreeTypes(data);
    };

    fetchDegreeTypes();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border border-border/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
    >
      <option value="">Select Level</option>

      {degreeTypes.map((degree) => (
        <option key={degree._id} value={degree._id}>
          {degree.name}
        </option>
      ))}
    </select>
  );
}
