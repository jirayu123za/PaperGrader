"use client";

import StatisticHeader from "@/components/INS/Header/StatisticHeader";
import AssignmentStatistics from "@/components/INS/INSStatistics/AssignmentStatistics";
import RubricTable from "@/components/INS/INSStatistics/RubricTable";
import { useParams } from "next/navigation";
import { Box, Stack, Skeleton, Flex } from "@mantine/core";
import { useFetchStatistics } from "@/hooks/Statistic/useFetchStatistics";
import { useAssignmentStatisticStore } from "@/store/statistic/useAssignmentStatisticStore";
import { NoSelectAssignment } from "@/components/INS/INSStatistics/NoSelectAssignment";
import { ErrorStatistics } from "@/components/INS/INSStatistics/ErrorStatistics";
import { NoRubricTable } from "@/components/INS/INSStatistics/NoRubricTable";
import { NoStatistic } from "@/components/INS/INSStatistics/NoStatistic";
import { useStatisticsStore } from "@/store/statistic/useStatisticsStore";

export default function StatisticsSummary() {
  const params = useParams();
  const assignmentIDFromParam = params?.assignment_id as string;
  const courseID = params?.course_id as string;
  const selectedAssignmentID = useAssignmentStatisticStore((s) => s.selectedAssignmentID);
  const assignmentID = selectedAssignmentID ?? (assignmentIDFromParam ?? null);
  const { data, isFetching, isError } = useFetchStatistics(courseID, assignmentID);
  const { statisticsData: stats } = useStatisticsStore();
  const noSelectAssignment = !selectedAssignmentID && !assignmentIDFromParam;
  const hasRubric = !!stats && Array.isArray(stats.questions_list) && stats.questions_list.length > 0;
  const hasStatistics = !!stats && stats.statistics && ((stats.statistics.total_submission ?? 0) > 0 || (stats.statistics.questions_statistics?.length ?? 0) > 0);

  if (noSelectAssignment) {
    return (
      <Flex h="100vh" direction="column" style={{ display: "flex", overflow: "hidden" }}>
        <Stack gap="md" h="100%">
          <StatisticHeader title="Assignment Statistics" />
          <NoSelectAssignment />
        </Stack>
      </Flex>
    );
  }

  return (
    <Flex h="100vh" direction="column" gap="xl">
      <Box>
        <StatisticHeader title="Assignment Statistics" />
      </Box>

      <Box 
        style={{
          flex: "0 0 230px",
        }}
      >
        {/** Handler isFetching, isError, and data on Statistics */}
        {isFetching ? (
          <Skeleton h={400} /> 
        ) : isError ? (
          <ErrorStatistics />
        ) : stats && hasStatistics ?  (
          <AssignmentStatistics /> 
        ) : <NoStatistic />
        }
      </Box>

      <Box 
        style={{ overflow: "hidden" }}
      >
        {/** Handler isFetching, isError, and data on RubricTable */}
        {isFetching ? (
          <Box>
            <Skeleton height={28} mb="sm" />
            <Skeleton height={450} />
          </Box>
        ) : isError ?  (
          null
        ) : hasRubric ? (
          <RubricTable />
        ) : <NoRubricTable />}
      </Box>
    </Flex>
  );
}
