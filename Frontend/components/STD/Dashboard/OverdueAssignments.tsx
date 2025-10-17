"use client";

import React, { useState } from "react";
import { ScrollArea, Text } from "@mantine/core";
import dayjs from "dayjs";
import "dayjs/locale/th";
import AssignmentList from "./AssignmentList";
import { useAssignmentStore } from "@/store/Student/useSTD_AssignmentStore";

dayjs.locale("en");

export default function OverdueAssignments({ isLoading }: { isLoading: boolean }) {
  const { assignments } = useAssignmentStore();
  const [page, setPage] = useState(1);

  
  const overdue = assignments.filter(
    (a) => dayjs(a.due_date).isBefore(dayjs()) && !a.has_submitted
  );

  return (
    <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
      {overdue.length === 0 ? (
        <Text ta="center" c="dimmed" py="lg">
          No overdue assignments at the moment
        </Text>
      ) : (
        <AssignmentList
          assignments={overdue}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          isOverdue={true} 
        />
      )}
    </ScrollArea>
  );
}
