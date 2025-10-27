"use client";

import React from "react";
import { useParams } from "next/navigation";
import GradePdfViewer from "@/components/STD/GradePdfViewer"; 
import { SidebarQuestions } from "@/components/INS/INSProcess/Right/Grade/SidebarQuestions"; //แก้เป็นของ นศ.
import { SidebarQuestions_STD } from "@/components/STD/SidebarQuestions";

const STDAssignment = () => {
  const params = useParams();
  const { course_id, assignment_id } = params as {
    course_id: string;
    assignment_id: string;
  };


  return (
     <div className="flex flex-row min-h-screen bg-gray-50">
      {/* ซ้าย = PDF Viewer */}
      <div className="flex-1 p-4">
        <GradePdfViewer courseId={course_id} assignmentId={assignment_id} />
      </div>
       <div className="w-[420px] border-l bg-white shadow-md">
        <SidebarQuestions_STD/>
      </div>
    </div>
  );
};

export default STDAssignment;
