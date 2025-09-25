"use client";

import React, { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { IconUpload } from "@tabler/icons-react";
import {Tabs,ScrollArea,Card,Progress,Text,Skeleton,Flex,Pagination,Button,Collapse,} from "@mantine/core";
import { useFetchStdAssignments } from "@/hooks/Student/useFetchSTD_Assignment";
import { useAssignmentStore } from "@/store/Student/useSTD_AssignmentStore";
import { useSubmitAndDownloadModalStore } from "@/store/modal/useSubmitAndDownloadModal";
import LeftMain from "@/components/STD/SideBar/LeftMain";
import STDSubmit from "@/components/STD/STD_submit";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

function calculateProgress(release: string | null, due: string | null): number {
  const now = dayjs().tz("Asia/Bangkok");
  if (!release || !due) return 0;

  const releaseTime = dayjs(release).tz("Asia/Bangkok");
  const dueTime = dayjs(due).tz("Asia/Bangkok");

  const total = dueTime.diff(releaseTime);
  const remaining = dueTime.diff(now);

  if (now.isBefore(releaseTime)) return 100;
  if (now.isAfter(dueTime)) return 0;

  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

const getProgressColor = (
  releaseDate: string | null,
  dueDate: string | null
): string => {
  const remainingPercentage = calculateProgress(releaseDate, dueDate);
  if (remainingPercentage > 70) return "green";
  if (remainingPercentage > 40) return "orange";
  return "red";
};

function getRemainingTimeText(due: string | null): string {
  const now = dayjs().tz("Asia/Bangkok");
  if (!due) return "N/A";

  const dueTime = dayjs(due).tz("Asia/Bangkok");
  if (now.isAfter(dueTime)) return "Past Due";

  const duration = dueTime.diff(now, "minute");
  const days = Math.floor(duration / (60 * 24));
  const hours = Math.floor((duration % (60 * 24)) / 60);
  const minutes = duration % 60;

  return (
    [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`]
      .filter(Boolean)
      .join(" ") || "Less than a minute"
  );
}

const ITEMS_PER_PAGE = 8;

const STD_Dashboard = () => {
  const { isLoading, error } = useFetchStdAssignments();
  const { assignments: assignmentList } = useAssignmentStore();
  const { openModal } = useSubmitAndDownloadModalStore();

  const [activePage, setActivePage] = useState(1);
  const [overduePage, setOverduePage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);

  if (error) return <div>Error loading assignments: {error.message}</div>;

  const combinedAssignmentList = [...(assignmentList || [])].sort(
    (a, b) => dayjs(a.due_date).valueOf() - dayjs(b.due_date).valueOf()
  );

  // ✅ Filter assignments
  const activeAssignments = combinedAssignmentList.filter(
    (a) => dayjs(a.due_date).isAfter(dayjs()) && !a.has_submitted
  );

  const overdueAssignments = combinedAssignmentList.filter(
    (a) => dayjs(a.due_date).isBefore(dayjs()) && !a.has_submitted
  );

  const completedAssignments = combinedAssignmentList.filter(
    (a) => a.has_submitted
  );

  const paginate = (list: any[], page: number) =>
    list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ✅ Group by due date
  const groupByDate = (list: any[]) => {
    return list.reduce((groups: any, a: any) => {
      const dateKey = dayjs(a.due_date).format("YYYY-MM-DD");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(a);
      return groups;
    }, {});
  };

  const renderAssignments = (
    assignments: any[],
    page: number,
    setPage: (p: number) => void
  ) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
              <Skeleton height={20} width="70%" />
            </Card>
          ))}
        </div>
      );
    }

    if (!assignments.length) {
      return (
        <div className="text-center text-gray-500 py-10">
          Nothing Planned Yet
        </div>
      );
    }

    const paginatedAssignments = paginate(assignments, page);
    const grouped = groupByDate(paginatedAssignments);

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([dateKey, items]: any) => (
          <div key={dateKey} className="space-y-2">
            <Text fw={600} size="sm">
              {dayjs(dateKey).format("dddd, MMMM D")}
            </Text>

            {items.map((assignment: any) => {
              const progress = calculateProgress(
                assignment.release_date,
                assignment.due_date
              );
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
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                          onClick={() =>
                            openModal(
                              assignment.assignment_id,
                              assignment.course_id
                            )
                          }
                        />
                        <Text fw={500}>{assignment.assignment_name}</Text>
                      </div>
                      <Link
                        href={`/student/overview/${assignment.course_id}/dashboard`}
                        passHref
                      >
                        <Text
                          size="sm"
                          c="dimmed"
                          className="cursor-pointer hover:underline"
                        >
                          {assignment.course_code} - {assignment.course_name}
                        </Text>
                      </Link>
                    </div>

                    <div className="w-2/6">
                      <Text size="sm" className="text-center">
                        {getRemainingTimeText(assignment.due_date)}
                      </Text>
                      <Progress
                        color={getProgressColor(
                          assignment.release_date,
                          assignment.due_date
                        )}
                        value={progress}
                        size="md"
                        radius="lg"
                      />
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
  };

  return (
    <Flex>
      <LeftMain />

      <Flex direction="column" className="flex-1 px-6 py-6">
        <Tabs defaultValue="active">
          <Tabs.List>
            <Tabs.Tab value="active">Active Assignments</Tabs.Tab>
            <Tabs.Tab value="overdue">Overdue Assignments</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="active" pt="md">
            <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
              {renderAssignments(activeAssignments, activePage, setActivePage)}

              {/* ✅ Completed Section */}
              {completedAssignments.length > 0 && (
                <div className="mt-6">
                  <Button
                    variant="subtle"
                    onClick={() => setShowCompleted((prev) => !prev)}
                  >
                    {showCompleted
                      ? `Hide Completed Assignments`
                      : `Show ${completedAssignments.length} Completed Assignments`}
                  </Button>

                  <Collapse in={showCompleted}>
                    <div className="mt-4">
                      {renderAssignments(completedAssignments, 1, () => {})}
                    </div>
                  </Collapse>
                </div>
              )}
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="overdue" pt="md">
            <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
              {renderAssignments(
                overdueAssignments,
                overduePage,
                setOverduePage
              )}
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Flex>

      <STDSubmit />
    </Flex>
  );
};

export default STD_Dashboard;
