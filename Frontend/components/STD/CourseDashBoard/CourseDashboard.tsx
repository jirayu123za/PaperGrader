"use client";

import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");
import { useRouter, useParams } from "next/navigation";
import { Badge, Divider, Table, Title, Tooltip, Flex, Text, Box, Paper, Loader } from "@mantine/core";
import { useFetchAssignments } from "@/hooks/useFetchAssignments";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useStdCourseDashboardStore } from "@/store/useCourseStore";
import { useFetchStdCourse } from "@/hooks/useFetchCourse";
import { NoAssignmentList } from "@/components/STD/CourseDashBoard/NoAssignmentList";
import { ErrorsAssignmentsList } from "@/components/STD/CourseDashBoard/ErrorsAssignmentsList";

export const CourseDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { course_id } = params as { course_id: string };

  const { course: courseData } = useStdCourseDashboardStore();
  const { isLoading: isLoadingAssignments, error: errorLoadingAssignments } = useFetchAssignments(course_id as string);
  const { assignments: assignmentList } = useAssignmentStore();
  const { isLoading: isLoadingCourse, error: errorLoadingCourse } = useFetchStdCourse(course_id as string);

  if (errorLoadingAssignments || errorLoadingCourse) return <ErrorsAssignmentsList />;

  return (
    <Box p="md">
      <Box>
        <Flex align="center" gap="8px">
          <Tooltip label={courseData?.course_name} withArrow position="bottom">
            <Title order={2} lineClamp={1} w="240px">{courseData?.course_name}</Title>
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
      </Box>

      <Divider my="md" />

      {isLoadingAssignments ? (
        <Paper withBorder>
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead className="bg-gray-100">
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th ta="center">Released</Table.Th>
                <Table.Th ta="center">Due</Table.Th>
                <Table.Th ta="center">Late</Table.Th>
                <Table.Th ta="center">Last submitted</Table.Th>
                <Table.Th ta="center">Score</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td colSpan={7} p="md">
                  <Flex align="center" justify="center" gap="sm">
                    <Loader size="sm" />
                    <Text c="dimmed" size="sm">Loading assignments...</Text>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      ) : !assignmentList || assignmentList.length === 0 ? (
        <NoAssignmentList />
      ) : (
        <Paper withBorder>
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead className="bg-gray-100">
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th ta="center">Released</Table.Th>
                <Table.Th ta="center">Due</Table.Th>
                <Table.Th ta="center">Late</Table.Th>
                <Table.Th ta="center">Last submitted</Table.Th>
                <Table.Th ta="center">Score</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {assignmentList.map((assignment) =>
                  <React.Fragment key={assignment.assignment_id}>
                    <Table.Tr>
                      <Table.Td
                        className="py-2 px-4 cursor-pointer hover:underline"
                        onClick={() => {
                          router.push(`/student/course/${course_id}/assignment/${assignment.assignment_id}/submission/${assignment.submission_id}`);
                        }}
                      >
                        <Text size="sm" lineClamp={1}>{assignment.assignment_name}</Text>
                      </Table.Td>

                      <Table.Td ta="center">
                        <Text size="sm" lineClamp={1}>
                          {assignment.release_date ? dayjs(assignment.release_date).format("MMM D, YYYY h:mm A") : "N/A"}
                        </Text>
                      </Table.Td>

                      <Table.Td ta="center">
                        <Text size="sm" lineClamp={1}>
                          {assignment.due_date ? dayjs(assignment.due_date).format("MMM D, YYYY h:mm A") : "N/A"}
                        </Text>
                      </Table.Td>

                      <Table.Td ta="center">
                        <Text size="sm" lineClamp={1}>
                          {assignment.cut_off_date ? dayjs(assignment.cut_off_date).format("MMM D, YYYY h:mm A") : "N/A"}
                        </Text>
                      </Table.Td>

                      <Table.Td ta="center">
                        <Text size="sm" lineClamp={1}>
                          {assignment.release_date ? dayjs(assignment.release_date).format("MMM D, YYYY h:mm A") : "N/A"}
                        </Text>
                      </Table.Td>

                      <Table.Td ta="center">
                        {assignment.score ? (
                          <Text size="sm" lineClamp={1}>
                            {assignment.score ?? "-"} / {assignment.total_score}
                          </Text>
                        ) : (
                          <Text className="text-gray-400 italic">-</Text>
                        )}
                      </Table.Td>

                      <Table.Td ta="center">
                        {assignment.has_submitted ? (
                          <Badge color="green" variant="filled">
                            Submitted
                          </Badge>
                        ) : (
                          <Badge color="red" variant="filled">
                            Not Submitted
                          </Badge>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  </React.Fragment>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};
