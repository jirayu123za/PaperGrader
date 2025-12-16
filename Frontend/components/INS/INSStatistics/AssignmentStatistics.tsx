"use client";

import { Card, Title, Text, SimpleGrid, Group, Box } from "@mantine/core";
import { BarChart } from "@mantine/charts";
import { statisticsData, useStatisticsStore } from "@/store/statistic/useStatisticsStore";
import { useAssignmentStatisticStore } from "@/store/statistic/useAssignmentStatisticStore";
import { StatsChartTooltip } from "@/components/INS/INSStatistics/StatsChartTooltip";
type QuestionRow = statisticsData["questions_list"][number];

export default function AssignmentStatistics() {
  const { statisticsData: stats } = useStatisticsStore();
  const { selectedAssignmentID, assignmentsList } = useAssignmentStatisticStore((s) => ({
    selectedAssignmentID: s.selectedAssignmentID,
    assignmentsList: s.assignmentsList,
  }));

  const chartData = flattenMeans(stats?.questions_list ?? []);
  const nameFromHeader = assignmentsList.find((a) => String(a.value) === String(selectedAssignmentID))?.label;
  const assignmentTitle = nameFromHeader || "this assignment";

  return (
    <Card
      withBorder
      radius="sm"
      p="lg"
      shadow="xs"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Title order={4} fw={700}>
          <Text span c="dimmed" fw={600}>
            Review Grades for{" "}
          </Text>
          <Text span fw={800} c="violet.6">
            {assignmentTitle.charAt(0).toUpperCase() + assignmentTitle.slice(1)}
          </Text>
        </Title>
        <Text size="md" c="dimmed">Submissions: {stats?.statistics.total_submission} | Max Score: {stats?.statistics.total_assignment_score}</Text>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm" mb="md">
        <StatBox label="Minimum" value={stats?.statistics.minimum} suffix="%" />
        <StatBox label="Median" value={stats?.statistics.median} suffix="%" />
        <StatBox label="Maximum" value={stats?.statistics.maximum} suffix="%" />
        <StatBox label="Mean" value={stats?.statistics.mean} suffix="%" />
        <StatBox label="Std Dev" value={stats?.statistics.sd} suffix="%" />
        <StatBox label="Score" value={stats?.statistics.total_assignment_score} />
      </SimpleGrid>

      <Box px={{ sm:"md", md:"lg" }} pb="md">
        <BarChart
          h={300}
          data={chartData}
          withLegend
          dataKey="question"
          tickLine="xy"
          gridAxis="xy"
          xAxisLabel="Question"
          yAxisLabel="Percent mean"
          unit="%"
          series={[{ name: "mean", label: "Mean (%)", color: "#845EF7" }]}
          tooltipAnimationDuration={200}
          tooltipProps={{
            content: ({ label, payload }) => (
              <StatsChartTooltip label={label} payload={payload} />
            ),
          }}
        />
      </Box>
    </Card>
  );
}

function StatBox({ label, value, suffix }: { label: string; value?: number; suffix?: string }) {
  const formattedValue = typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "-";
  return (
    <Card withBorder radius="sm" p="sm">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={700} size="lg">
        {formattedValue}
        {suffix ? <Text span size="sm" c="dimmed"> {suffix}</Text> : null}
      </Text>
    </Card>
  );
}

function flattenMeans(rows: QuestionRow[]): { question: string; mean: number }[] {
  const out: { question: string; mean: number }[] = [];
  for (const q of rows) {
    if (typeof q.percent_mean === "number") out.push({ question: q.question_number, mean: q.percent_mean });
    if (Array.isArray(q.sub_questions)) {
      for (const s of q.sub_questions) {
        if (typeof s.percent_mean === "number") out.push({ question: s.question_number, mean: s.percent_mean });
      }
    }
  }
  return out;
}
