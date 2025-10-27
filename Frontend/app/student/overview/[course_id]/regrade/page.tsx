"use client";

import React from "react";
import { Title, Flex, Text, Divider, Tooltip } from "@mantine/core";
import STD_RegradeList from "@/components/STD/Regrade/STD_RegradeList";
import { useParams } from "next/navigation";
import { useFetchAssignments } from "@/hooks/useFetchAssignments";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useFetchStdCourse } from "@/hooks/useFetchCourse";
import { useStdCourseDashboardStore } from "@/store/useCourseStore";

export default function RegradePage() {
  const { course_id } = useParams() as { course_id: string };
  const { isLoading, error } = useFetchAssignments(course_id);
  const { assignments } = useAssignmentStore();

  const { isLoading: isCourseLoading, error: courseError } =
    useFetchStdCourse(course_id);
  const { course: courseData } = useStdCourseDashboardStore();

  if (isLoading || isCourseLoading) return <div>Loading...</div>;
  if (error || courseError) return <div>Error loading data</div>;

  // ✅ Truncate ชื่อวิชา + tooltip
  const fullName = courseData?.course_name ?? "No Course Selected";
  const displayName =
    fullName.length > 30 ? `${fullName.slice(0, 30)}…` : fullName;
  const showTooltip = fullName.length > 30;

  return (
    <>
  {/* 🟣 Header */}
  <div className="header mb-6">
    <Flex align="center" gap="8px">
      <Tooltip label={fullName} disabled={!showTooltip} withArrow position="bottom">
        <Title
          order={2}
          fw={600}
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "360px",
            cursor: showTooltip ? "help" : "default",
          }}
        >
          {displayName}
        </Title>
      </Tooltip>

      <Divider size="sm" orientation="vertical" />

      <Title order={2} fw={600}>
        {courseData
          ? `(${courseData.semester}/${Number(courseData.academic_year) + 543})`
          : "No Course Info"}
      </Title>
    </Flex>

    <Text size="sm" c="dimmed" className="mt-0">
      Course code: {courseData?.course_code ?? "-"}
    </Text>

    <Divider my="md" />
  </div>

  {/* ตาราง Regrade Requests */}
  <STD_RegradeList assignments={assignments ?? []} />
</>

  );
}
