"use client";

import ActiveAssignments from "@/components/STD/Dashboard/ActiveAssignments";
import OverdueAssignments from "@/components/STD/Dashboard/OverdueAssignments";
import SubmitAssignments from "@/components/STD/Dashboard/SubmitAssignments";
import LeftMain from "@/components/STD/SideBar/LeftMain";
import { AssignmentFilesModal } from "@/components/STD/AssignmentFilesModal";
import { useFetchStdAssignments } from "@/hooks/Student/useFetchAssignment";
import { useAssignmentStore } from "@/store/Student/useAssignmentStore";
import { Badge, Flex, Tabs } from "@mantine/core";

export default function Dashboard() {
  const { isLoading, isError } = useFetchStdAssignments();
  const { active, over_due, submitted } = useAssignmentStore();
  const activeCount = active.length;
  const overdueCount = over_due.length;
  const submittedCount = submitted.length;
  
  return (
    <Flex>
      <LeftMain />
      <Flex direction="column" className="flex-1 px-6 py-6 min-h-screen bg-slate-50/70">
        <Tabs defaultValue="active" keepMounted={false} color="#4C6EF5">
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
            <ActiveAssignments isLoading={isLoading} isError={isError} />
          </Tabs.Panel>

          <Tabs.Panel value="overdue" pt="md">
            <OverdueAssignments isLoading={isLoading} isError={isError} />
          </Tabs.Panel>

          <Tabs.Panel value="submitted" pt="md">
            <SubmitAssignments isLoading={isLoading} isError={isError} />
          </Tabs.Panel>
        </Tabs>
      </Flex>

      <AssignmentFilesModal />
    </Flex>
  );
}
