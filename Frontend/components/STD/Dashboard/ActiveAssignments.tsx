"use client";

import React from "react";
import AssignmentList from "@/components/STD/Dashboard/AssignmentList";
import { ScrollArea } from "@mantine/core";
import { useAssignmentStore } from "@/store/Student/useAssignmentStore";
import { NoActiveAssignment } from "@/components/STD/Dashboard/NoActiveAssignment";
import { LoadingAssignmentList } from "@/components/STD/Dashboard/LoadingAssignmentList";
import { ErrorDashboard } from "@/components/STD/Dashboard/ErrorDashboard";

export default function ActiveAssignments({ isLoading, isError }: { isLoading: boolean; isError: boolean }) {
  const { active } = useAssignmentStore();

  return (
    <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
      {active.length === 0 ? (
        <NoActiveAssignment />
      ) : isLoading ? (
        <LoadingAssignmentList />
      ) : isError ? (
        <ErrorDashboard />
      ) : (
      <AssignmentList assignments={active} />
      )}
    </ScrollArea>
  );
}
