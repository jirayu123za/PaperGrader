"use client";

import { Card, Title, Text, SimpleGrid, Group } from "@mantine/core";
import { BarChart } from "@mantine/charts";
import type { AssignmentStatisticsPayload, QuestionsStatisticsIndex } from "@/store/statistic/useStatisticsStore";
import { useAssignmentStatisticStore } from "@/store/statistic/useAssignmentStatisticStore";

type Props = { stats: AssignmentStatisticsPayload };

export default function AssignmentStatistics({ stats }: Props) {
  const chartData = flattenMeans(stats.questions_statistics);

  const selectedAssignmentId = useAssignmentStatisticStore((s) => s.selectedAssignmentId);
  const assignmentsList = useAssignmentStatisticStore((s) => s.assignmentsList);
  const nameFromHeader = assignmentsList.find((a) => String(a.value) === String(selectedAssignmentId))?.label;


  const assignmentTitle =
    nameFromHeader ??
    (stats as any).assignment_name ??
    (stats as any).assignment?.name ??
    (stats as any).assignmentTitle ??
    "this assignment";

    

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={4}>Review Grades for {assignmentTitle}</Title>
        <Text c="dimmed">Submissions: {stats.total_submission} | Max Score: {stats.total_assignment_score}</Text>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm" mb="md">
        <StatBox label="Minimum" value={stats.minimum} />
        <StatBox label="Median" value={stats.median} />
        <StatBox label="Maximum" value={stats.maximum} />
        <StatBox label="Mean" value={stats.mean} />
        <StatBox label="Std Dev" value={stats.sd} />
        <StatBox label="Total" value={stats.total_submission} />
      </SimpleGrid>

      <Card withBorder radius="md" p="md">
        <BarChart
          h={220}
          data={chartData}
          dataKey="question"
          series={[{ name: "mean", label: "Mean (%)", color: "#845EF7" }]}
          tooltipProps={{
            content: ({ label, payload }) => (
              <div style={{ padding: 8 }}>
                <div><b>{label}</b></div>
                <div>Mean: {payload?.[0]?.value ?? "-"}%</div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  const formattedValue =
    typeof value === "number" && !isNaN(value)
      ? value.toFixed(2)
      : "-";

  return (
    <Card withBorder radius="md" p="sm">
      <Text size="xs" c="dimmed">{label}</Text>
      <Text fw={700}>{formattedValue}%</Text>
    </Card>
  );
}

function flattenMeans(rows: QuestionsStatisticsIndex[]): { question: string; mean: number }[] {
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
