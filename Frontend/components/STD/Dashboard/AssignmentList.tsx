"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { Card, Progress, Text, Pagination } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSubmitAndDownloadModalStore } from "@/store/modal/useSubmitAndDownloadModal";
import { calculateProgress, getProgressColor, getRemainingTimeText } from "@/components/STD/Dashboard/utils/dateUtils";
import { usePagination, useViewportSize } from "@mantine/hooks";

interface AssignmentsList {
  course_id: string;
  assignment_id: string;
  submission_id?: string | null;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  assignment_description: string;
  cut_off_date: string | null;
  due_date: string;
  release_date: string;
  section_name: string;
  has_submitted?: boolean;
}

interface AssignmentsProps {
  assignments: AssignmentsList[];
}

export default function AssignmentList({ assignments }: AssignmentsProps) {
  const router = useRouter();
  const { openModal } = useSubmitAndDownloadModalStore();
  const { height: viewportH } = useViewportSize();

  const rowsPerPage = useMemo(() => {
    if (viewportH < 700) return 2;
    if (viewportH < 900) return 3;
    return 5;
  }, [viewportH]);

  const totalPages = useMemo(() => {
    return assignments.length > 0 ? Math.ceil(assignments.length / rowsPerPage) : 1;
  }, [assignments.length, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });
    
  useEffect(() => {
    if (pagination.active > totalPages) {
      pagination.setPage(totalPages);
    }
  }, [totalPages, pagination.active]);

  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAssignments = assignments.slice(startIndex, endIndex) ?? [];

  const groupedByDueDate = useMemo(() => {
    return paginatedAssignments.reduce<Record<string, AssignmentsList[]>>(
      (acc, assignment) => {
        const key = assignment.due_date
          ? dayjs(assignment.due_date).format("dddd, MMMM D, YYYY")
          : "No due date";

        if (!acc[key]) acc[key] = [];
        acc[key].push(assignment);
        return acc;
      },
      {}
    );
  }, [paginatedAssignments]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDueDate).map(([dateLabel, items]) => (
        <div key={dateLabel} className="space-y-2">
          <Text fw={600} size="sm">
            {dateLabel}
          </Text>
        {items.map((assignment) => {
          const progress = calculateProgress(assignment.release_date, assignment.due_date);
          const isSubmitted = assignment.has_submitted;
          const isLate = dayjs(assignment.due_date).isBefore(dayjs());
          const cutoffPassed = assignment.cut_off_date ? dayjs(assignment.cut_off_date).isBefore(dayjs()) : isLate;
          return (
            <Card
              key={assignment.assignment_id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <div className="flex justify-between items-center">
                <div className="w-2/6">
                  <div className="flex items-center gap-2">
                    <IconUpload
                      size={18}
                      className={`${
                        cutoffPassed
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-800 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!cutoffPassed) {
                          openModal(assignment.assignment_id, assignment.course_id);
                        }
                      }}
                      title={
                        cutoffPassed
                          ? "Upload closed (cut-off date passed)"
                          : "Upload your submission"
                      }
                    />

                    <Text
                      fw={500}
                      className={`py-2 px-4 ${isSubmitted ? "cursor-pointer hover:underline" : "cursor-default"}`}
                      lineClamp={1}
                      onClick={() => {
                        if (!isSubmitted) return;
                        router.push(
                          `/student/course/${assignment.course_id}/assignment/${assignment.assignment_id}/submission/${assignment.submission_id}`
                        )
                      }}
                    >
                      {assignment.assignment_name.charAt(0).toUpperCase() + assignment.assignment_name.slice(1)}
                    </Text>
                  </div>

                  <Link href={`/student/course/${assignment.course_id}/dashboard`}>
                    <Text
                      size="sm"
                      c="dimmed"
                      lineClamp={1}
                      className="cursor-pointer hover:underline"
                    >
                      {assignment.course_code} - {assignment.course_name}
                    </Text>
                  </Link>
                </div>

                <div className="w-2/6 text-center">
                  {isSubmitted ? (
                    <Text fw={600} c="green">
                      Submitted
                    </Text>
                  ) : cutoffPassed ? (
                    <Text c="red" fw={600}>
                      Upload Closed
                    </Text>
                  ) : isLate ? (
                    <Text c="red" fw={600}>
                      DUE:{" "}
                      {dayjs(assignment.due_date).format("dddd, MMMM D, YYYY HH:mm")}
                    </Text>
                  ) : (
                    <>
                      <Text size="sm">
                        {getRemainingTimeText(assignment.due_date)}
                      </Text>
                      <Progress
                        color={getProgressColor(assignment.release_date, assignment.due_date)}
                        value={progress}
                        size="md"
                        radius="lg"
                      />
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        </div>
      ))}
      {assignments.length > rowsPerPage && (
        <div className="flex justify-center py-4">
          <Pagination
            total={totalPages}
            siblings={1}
            boundaries={1}
            value={pagination.active}
            onChange={pagination.setPage}
            size="sm"
            color="#4C6EF5"
          />
        </div>
      )}
    </div>
  );
}
