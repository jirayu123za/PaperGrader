"use client";

import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { Card, Progress, Skeleton, Text, Pagination } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSubmitAndDownloadModalStore } from "@/store/modal/useSubmitAndDownloadModal";
import { calculateProgress, getProgressColor, getRemainingTimeText } from "./utils/dateUtils";
import { groupByDate, paginate, ITEMS_PER_PAGE } from "./utils/groupingUtils";

interface Props {
  assignments: any[];
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  isOverdue?: boolean;
}

export default function AssignmentList({ assignments, isLoading, page, setPage, isOverdue = false }: Props) {
  const { openModal } = useSubmitAndDownloadModalStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} shadow="sm" padding="lg" radius="md" withBorder>
            <Skeleton height={40} width="100%" />
          </Card>
        ))}
      </div>
    );
  }

  if (!assignments.length) {
    return (
      <div className="text-center text-gray-500 py-10">Nothing Planned Yet</div>
    );
  }

  const paginated = paginate(assignments, page);
  const grouped = groupByDate(paginated);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateKey, items]: any) => (
        <div key={dateKey} className="space-y-2">
          <Text fw={600} size="sm">
            {dateKey}
          </Text>

          {items.map((a: any) => {
            const progress = calculateProgress(a.release_date, a.due_date);
            const isSubmitted = a.has_submitted;
            const isLate = dayjs(a.due_date).isBefore(dayjs());
            const cutoffPassed = a.cut_off_date
              ? dayjs(a.cut_off_date).isBefore(dayjs())
              : isLate;
            return (
              <Card
                key={a.assignment_id}
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
                            openModal(a.assignment_id, a.course_id);
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
                          //! Need submission_id to view specific submission
                          if (!isSubmitted) return;
                          router.push(
                            `/student/course/${a.course_id}/assignment/${a.assignment_id}/submission/${a.submission_id}`
                          )
                        }}
                      >
                        {a.assignment_name.charAt(0).toUpperCase() + a.assignment_name.slice(1)}
                      </Text>
                    </div>

                    <Link href={`/student/course/${a.course_id}/dashboard`}>
                      <Text
                        size="sm"
                        c="dimmed"
                        lineClamp={1}
                        className="cursor-pointer hover:underline"
                      >
                        {a.course_code} - {a.course_name}
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
                    ) : isOverdue ? (
                      <Text c="red" fw={600}>
                        DUE:{" "}
                        {dayjs(a.due_date).format("dddd, MMMM D, YYYY HH:mm")}
                      </Text>
                    ) : (
                      <>
                        <Text size="sm">
                          {getRemainingTimeText(a.due_date)}
                        </Text>
                        <Progress
                          color={getProgressColor(a.release_date, a.due_date)}
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

      {assignments.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center py-4">
          <Pagination
            total={Math.ceil(assignments.length / ITEMS_PER_PAGE)}
            value={page}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
