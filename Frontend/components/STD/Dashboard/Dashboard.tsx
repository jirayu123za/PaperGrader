"use client";

import { Tabs, Flex, Badge } from "@mantine/core";
import LeftMain from "@/components/STD/SideBar/LeftMain";
import STDSubmit from "@/components/STD/STD_submit";
import ActiveAssignments from "./ActiveAssignments";
import OverdueAssignments from "./OverdueAssignments";
import SubmitAssignments from "./SubmitAssignments";
import { useFetchStdAssignments } from "@/hooks/Student/useFetchSTD_Assignment";
import { useAssignmentStore } from "@/store/Student/useSTD_AssignmentStore";

export default function Dashboard() {
  const { isLoading, error } = useFetchStdAssignments();
  const { assignments } = useAssignmentStore();

  if (error) return <div>Error loading assignments: {error.message}</div>;

  // Count badges
  const activeCount = assignments.filter(
    a => a.has_submitted === false && new Date(a.due_date) > new Date()
  ).length;

  const overdueCount = assignments.filter(
    a => a.has_submitted === false && new Date(a.due_date) < new Date()
  ).length;

  const submittedCount = assignments.filter(a => a.has_submitted).length;

  return (
    <Flex>
      <LeftMain />
      <Flex direction="column" className="flex-1 px-6 py-6">

        <Tabs defaultValue="active">
          <Tabs.List>

            {/* ---- ACTIVE TAB ---- */}
            <Tabs.Tab value="active" className="relative">
              Active Assignments
              {activeCount > 0 && (
                <Badge
                  color="red"
                  variant="filled"
                  size="sm"
                  className="absolute -right-1 bottom-4 translate-y-1/2"
                  circle
                >
                  {activeCount}
                </Badge>
              )}
            </Tabs.Tab>

            {/* ---- OVERDUE TAB ---- */}
            <Tabs.Tab value="overdue" className="relative">
              Overdue Assignments
              {overdueCount > 0 && (
                <Badge
                  color="red"
                  variant="filled"
                  size="sm"
                  className="absolute -right-1 bottom-4 translate-y-1/2"
                  circle
                >
                  {overdueCount}
                </Badge>
              )}
            </Tabs.Tab>

            {/* ---- SUBMITTED TAB ---- */}
            <Tabs.Tab value="submitted" className="relative">
              Submit Assignments
              {submittedCount > 0 && (
                <Badge
                  color="red"
                  variant="filled"
                  size="sm"
                 className="absolute -right-1 bottom-4 translate-y-1/2"
                  circle
                >
                  {submittedCount}
                </Badge>
              )}
            </Tabs.Tab>

          </Tabs.List>

          <Tabs.Panel value="active" pt="md">
            <ActiveAssignments isLoading={isLoading} />
          </Tabs.Panel>

          <Tabs.Panel value="overdue" pt="md">
            <OverdueAssignments isLoading={isLoading} />
          </Tabs.Panel>

          <Tabs.Panel value="submitted" pt="md">
            <SubmitAssignments isLoading={isLoading} />
          </Tabs.Panel>
        </Tabs>
      </Flex>

      <STDSubmit />
    </Flex>
  );
}
