"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

export default function SpecializationSelect({
  value,
  onChange,
  courseId,
  required = false,
}) {
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    if (!courseId) {
      setSpecializations([]);
      return;
    }

    let cancelled = false;
    const fetchSpecializations = async () => {
      try {
        const res = await callApi(
          `/api/admin/specializations?courseId=${encodeURIComponent(courseId)}`,
          { cache: "no-store", auth: true }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("SpecializationSelect: failed to fetch specializations", { status: res.status, err });
          if (!cancelled) setSpecializations([]);
          return;
        }

        const data = await res.json();
        if (!cancelled) setSpecializations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("SpecializationSelect: error fetching specializations:", err);
        if (!cancelled) setSpecializations([]);
      }
    };

    fetchSpecializations();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // 🔥 If no course selected → just render empty list
  const finalList = Array.isArray(specializations) ? specializations : [];

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={!courseId || finalList.length === 0}
      className="border px-3 py-2 rounded-md w-full bg-card"
    >
      <option value="">{courseId ? "Select Specialization" : "Select Course first"}</option>

      {finalList.length > 0 ? (
        finalList.map((spec) => (
          <option key={spec._id} value={spec._id}>
            {spec.name}
          </option>
        ))
      ) : (
        courseId && <option value="" disabled>No specializations available</option>
      )}
    </select>
  );
}
