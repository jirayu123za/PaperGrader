"use client";

import { Tabs, Flex } from "@mantine/core";
import LeftMain from "@/components/STD/SideBar/LeftMain";
import STDSubmit from "@/components/STD/STD_submit";
import ActiveAssignments from "./ActiveAssignments";
import OverdueAssignments from "./OverdueAssignments";
import { useFetchStdAssignments } from "@/hooks/Student/useFetchSTD_Assignment";

export default function STD_Dashboard() {
  const { isLoading, error } = useFetchStdAssignments();

  if (error) return <div>Error loading assignments: {error.message}</div>;

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
            <ActiveAssignments isLoading={isLoading} />
          </Tabs.Panel>

          <Tabs.Panel value="overdue" pt="md">
            <OverdueAssignments isLoading={isLoading} />
          </Tabs.Panel>
        </Tabs>
      </Flex>

      <STDSubmit />
    </Flex>
  );
}
