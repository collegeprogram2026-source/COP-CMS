"use client";

import { useEffect, useState } from "react";

export default function SpecializationSelect({
  value,
  onChange,
  courseId,
  required = false,
}) {
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    if (!courseId) return;   // 🚀 Just return, don't set state here

    const fetchSpecializations = async () => {
      try {
        const res = await fetch(
          `/api/admin/specialization?courseId=${courseId}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        setSpecializations(data);
      } catch (err) {
        console.error("Error fetching specializations:", err);
        setSpecializations([]);
      }
    };

    fetchSpecializations();
  }, [courseId]);

  // 🔥 If no course selected → just render empty list
  const finalList = courseId ? specializations : [];

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border px-3 py-2 rounded-md w-full bg-card"
    >
      <option value="">Select Specialization</option>

      {finalList.map((spec) => (
        <option key={spec._id} value={spec._id}>
          {spec.name}
        </option>
      ))}
    </select>
  );
}
