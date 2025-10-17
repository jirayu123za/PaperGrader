"use client";

import { Card, Stack, Skeleton, Text } from "@mantine/core";
import StatisticHeader from "@/components/INS/Header/StatisticHeader";
import AssignmentStatistics from "@/components/INS/INSStatistics/AssignmentStatistics";
import RubricTable from "@/components/INS/INSStatistics/RubricTable";
import { useFetchStatistics } from "@/hooks/Statistic/useFetchStatistics";
import { useParams } from "next/navigation";
import { useAssignmentStatisticStore } from "@/store/statistic/useAssignmentStatisticStore";
import Image from "next/image";

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ textAlign: "center" }}>
        <Image src="/Image/statistic/statistic.svg" alt="Statistics" width={400} height={400} style={{ width: 400, maxWidth: "60%", height: "auto", margin: "0 auto 12px" }} />
        <Text c="dimmed">{message}</Text>
      </div>
    </div>
  );
}

export default function StatisticsSunmary() {
  const { data, isFetching, isError, error } = useFetchStatistics();
  const params = useParams();
  const assignmentIdFromParam = params?.assignment_id ? String(params.assignment_id) : null;
  const selectedAssignmentId = useAssignmentStatisticStore((s) => s.selectedAssignmentId);
  const noAssignmentChosen = !selectedAssignmentId && !assignmentIdFromParam;

  if (noAssignmentChosen) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Stack gap="md" style={{ height: "100%", overflow: "hidden" }}>
          <StatisticHeader title="Assignment Statistics" />
          <EmptyState message="Select an assignment to view statistics." />
        </Stack>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Stack gap="md" style={{ height: "100%", overflow: "hidden" }}>
        <StatisticHeader title="Assignment Statistics" />
        <Card withBorder radius="md" p="md">
          {isFetching ? <Skeleton height={220} /> : isError ? <Text c="red">Failed to load statistics: {(error as Error)?.message}</Text> : data ? <AssignmentStatistics stats={data.statistics} /> : <Text c="dimmed">Select assignment and sections to view statistics.</Text>}
        </Card>
        <Card withBorder radius="md" p={0} style={{ overflow: "hidden", flex: 1 }}>
          {isFetching ? (
            <div style={{ padding: 12 }}>
              <Skeleton height={28} mb="sm" />
              <Skeleton height={180} />
            </div>
          ) : isError ? (
            <div style={{ padding: 12 }}>
              <Text c="red">Failed to load questions: {(error as Error)?.message}</Text>
            </div>
          ) : data ? (
            <RubricTable questions={data.questions_list} viewportBottomPadding={0} />
          ) : null}
        </Card>
      </Stack>
    </div>
  );
}
