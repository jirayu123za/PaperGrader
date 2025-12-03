"use client";

import React, { useState } from "react";
import { ScrollArea, Button, Collapse } from "@mantine/core";
import AssignmentList from "./AssignmentList";
import { useAssignmentStore } from "@/store/Student/useSTD_AssignmentStore";
import dayjs from "dayjs";

export default function ActiveAssignments({ isLoading }: { isLoading: boolean }) {
  const { assignments } = useAssignmentStore();
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);

  const active = assignments.filter(a => dayjs(a.due_date).isAfter(dayjs()) && !a.has_submitted);
  const completed = assignments.filter(a => a.has_submitted);

  return (
    <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
      <AssignmentList
        assignments={active}
        isLoading={isLoading}
        page={activePage}
        setPage={setActivePage}
      />
    </ScrollArea>
  );
}
