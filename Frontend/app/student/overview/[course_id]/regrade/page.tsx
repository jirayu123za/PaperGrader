"use client";

import React from "react";
import { Title } from "@mantine/core";
import STD_RegradeList from "@/components/STD/Regrade/STD_RegradeList";

const mockAssignments = [
  {
    assignment_id: "a1",
    assignment_name: "Lab 01: JavaScript Basics",
    score: 85,
    published_grade: true,
  },
  {
    assignment_id: "a2",
    assignment_name: "Lab 02: React Components",
    score: 92,
    published_grade: false,
  },
];

export default function RegradePage() {
  return (
    <>
      <Title order={2} mb="md">
        Regrade Requests
      </Title>
      {/* ✅ ส่ง array ที่แน่นอนเข้าไป */}
      <STD_RegradeList assignments={mockAssignments ?? []} />
    </>
  );
}
