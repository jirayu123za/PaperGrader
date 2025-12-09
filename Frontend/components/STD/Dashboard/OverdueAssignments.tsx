"use client";

import React from "react";
import AssignmentList from "@/components/STD/Dashboard/AssignmentList";
import { ScrollArea } from "@mantine/core";
import { useAssignmentStore } from "@/store/Student/useAssignmentStore";
import { NoDueAssignment } from "@/components/STD/Dashboard/NoDueAssignment";
import { LoadingAssignmentList } from "@/components/STD/Dashboard/LoadingAssignmentList";
import { ErrorDashboard } from "@/components/STD/Dashboard/ErrorDashboard";

export default function OverdueAssignments({ isLoading, isError }: { isLoading: boolean; isError: boolean }) {
  const { over_due } = useAssignmentStore();

  return (
    <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
      {over_due.length === 0 ? (
        <NoDueAssignment />
      ) : isLoading ? (
        <LoadingAssignmentList />
      ) : isError ? (
        <ErrorDashboard />
      ) : (
        <AssignmentList assignments={over_due} />
      )}
    </ScrollArea>
  );
}
