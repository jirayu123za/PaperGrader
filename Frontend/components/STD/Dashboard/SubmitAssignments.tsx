"use client";

import React from "react";
import AssignmentList from "@/components/STD/Dashboard/AssignmentList";
import { ScrollArea } from "@mantine/core";
import { useAssignmentStore } from "@/store/Student/useAssignmentStore";
import { NoSubmittedAssignment } from "@/components/STD/Dashboard/NoSubmittedAssignment";
import { LoadingAssignmentList } from "@/components/STD/Dashboard/LoadingAssignmentList";
import { ErrorDashboard } from "@/components/STD/Dashboard/ErrorDashboard";

export default function SubmitAssignments({ isLoading, isError }: { isLoading: boolean; isError: boolean }) {
  const { submitted } = useAssignmentStore();

  return (
    <ScrollArea style={{ height: "calc(100vh - 128px)" }}>
      {submitted.length === 0 ? (
        <NoSubmittedAssignment />
      ) : isLoading ? (
        <LoadingAssignmentList />
      ) : isError ? (
        <ErrorDashboard />
      ) : (
      <AssignmentList assignments={submitted} />
      )}
    </ScrollArea>
  );
}
