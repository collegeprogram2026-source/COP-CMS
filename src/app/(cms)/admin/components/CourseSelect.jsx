"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

export default function CourseSelect({
  value,
  onChange,
  degreeTypeId,
  required = false,
}) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await callApi("/api/admin/courses", { cache: "no-store", auth: true });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("CourseSelect: failed to fetch courses", { status: res.status, err });
          setCourses([]);
          return;
        }

        const data = await res.json();
        const courseArray = Array.isArray(data) ? data : [];
        setCourses(courseArray.filter((c) => c.isActive));
      } catch (error) {
        console.error("CourseSelect: error fetching courses", error);
        setCourses([]);
      }
    };

    fetchCourses();
  }, []);

  const finalList = degreeTypeId
    ? courses.filter((c) =>
      c.degreeTypeId?._id === degreeTypeId || c.degreeTypeId === degreeTypeId
    )
    : courses;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border border-border/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-background text-foreground"
    >
      <option value="" className="bg-background text-foreground">Select Course</option>

      {finalList.map((course) => (
        <option key={course._id} value={course._id} className="bg-background text-foreground">
          {course.name}
        </option>
      ))}
    </select>
  );
}

