"use client";

import { useEffect, useState } from "react";

export default function SpecializationTypeSelect({
  value,
  onChange,
  required = false,
}) {
  const [specializationTypes, setSpecializationTypes] = useState([]);

  useEffect(() => {
    const fetchSpecializationTypes = async () => {
      try {
        const res = await fetch("/api/admin/specialization-types", {
          cache: "no-store",
        });

        const data = await res.json();
        setSpecializationTypes(data);
      } catch (error) {
        console.error("Failed to fetch specialization types", error);
      }
    };

    fetchSpecializationTypes();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border px-3 py-2 rounded-md w-full bg-card"
    >
      <option value="">Select Specialization Type</option>

      {specializationTypes.map((specialization) => (
        <option key={specialization._id} value={specialization._id}>
          {specialization.name}
        </option>
      ))}
    </select>
  );
}
