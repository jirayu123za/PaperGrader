"use client";

import React from "react";
import { useParams } from "next/navigation";
import GradePdfViewer from "@/components/STD/GradePdfViewer"; 

export const metadata = {
  title: "Student Assignment Viewer",
  description: "View and review submitted assignment PDF",
};

const STDAssignment = () => {
  const params = useParams();
  const { course_id, assignment_id } = params as {
    course_id: string;
    assignment_id: string;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        📄 Assignment #{assignment_id} – Course {course_id}
      </h1>
      <div className="w-full max-w-5xl shadow-md border rounded-xl bg-white overflow-hidden">
        <GradePdfViewer courseId={course_id} assignmentId={assignment_id} />
      </div>
    </div>
  );
};

export default STDAssignment;
