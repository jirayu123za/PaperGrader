"use client";

import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

import { useFetchAssignments } from "../../hooks/useFetchAssignments";
import { useAssignmentStore } from "../../store/useAssignmentStore";
import { useStdCourseDashboardStore } from "../../store/useCourseStore";
import { useRouter, useParams } from "next/navigation";
import { Badge, Divider, Table, Title } from "@mantine/core";
import { useFetchStdCourse } from "../../hooks/useFetchCourse";

const STD_CourseDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { course_id } = params as { course_id: string };
  const { isLoading, error } = useFetchAssignments(course_id as string);
  const { assignments: assignmentList } = useAssignmentStore();
  const { isLoading: isCourseLoading, error: errorCourse } = useFetchStdCourse(
    course_id as string
  );
  const { course: courseData } = useStdCourseDashboardStore();

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  return (
    <div className="course-dashboard">
      <div className="header mb-6">
        <Title order={2}>
          {courseData?.course_name} | ({courseData?.semester}/
          {courseData?.academic_year
            ? Number(courseData.academic_year) + 543
            : ""}
          )
        </Title>

        <p className="text-gray-500">Course Code: {courseData?.course_code}</p>
        <Divider my="md" />
      </div>

      {!assignmentList || assignmentList.length === 0 ? (
        <div className="text-center text-gray-500">
          This course has no assignments assigned yet.
        </div>
      ) : (
        <Table highlightOnHover verticalSpacing="md">
          <Table.Thead>
            <Table.Tr className="border-b">
              <Table.Th>Name</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Released</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Due</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Late</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>
                Last Submitted
              </Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Score</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignmentList.map((assignment) =>
              assignment ? (
                <React.Fragment key={assignment.assignment_id}>
                  <Table.Tr className="border-b">
                    <Table.Td
                      className="py-2 px-4 cursor-pointer hover:underline"
                      onClick={() => {
                        // ไปหน้าส่งงาน (ยังไม่มี file_url ใน API)
                        router.push(
                          `/student/overview/${course_id}/assignment/${assignment.assignment_id}`
                        );
                      }}
                    >
                      {assignment.assignment_name}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      {assignment.release_date
                        ? dayjs(assignment.release_date).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "N/A"}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      {assignment.due_date
                        ? dayjs(assignment.due_date).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "N/A"}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      {assignment.cut_off_date
                        ? dayjs(assignment.cut_off_date).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "N/A"}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      {assignment.release_date
                        ? dayjs(assignment.release_date).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "N/A"}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      {assignment.published_grade ? (
                        <span>
                          {assignment.score ?? "0"} /{" "}
                          {assignment.max_score ?? "100"}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          -
                        </span>
                      )}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      {assignment.has_submitted ? (
                        <Badge color="green" variant="filled">
                          Submitted
                        </Badge>
                      ) : (
                        <Badge color="blue" variant="filled">
                          Not Submitted
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                </React.Fragment>
              ) : null
            )}
          </Table.Tbody>
        </Table>
      )}
    </div>
  );
};

export default STD_CourseDashboard;
