"use client";

import React, { useState } from "react";
import { ScrollArea, Button, Collapse, Text } from "@mantine/core";
import { useAssignmentStore } from "@/store/Student/useSTD_AssignmentStore";
import AssignmentList from "./AssignmentList";

export default function SubmitAssignments({ isLoading }: { isLoading: boolean }) {
  const { assignments } = useAssignmentStore();
  const completed = assignments.filter(a => a.has_submitted);

  const [page, setPage] = useState(1);

  if (completed.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="lg">
        No submitted assignments yet
      </Text>
    );
  }

  return (
    <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
      <AssignmentList
        assignments={completed}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
      />
    </ScrollArea>
  );
}
