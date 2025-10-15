"use client";

import { Stack, Center, Image, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import AssignmentStatistics from "./AssignmentStatistics";
import { RubricTable, type RubricItem } from "./RubricTable";
import StatisticHeader from "../Header/StatisticHeader";
import mock from "@/mock/statisticsMock.json";

type QuestionStat = { question: string; mean: number };
type AssignmentMock = {
  id: string;
  label: string;
  questions: QuestionStat[];
  rubric: RubricItem[];
};


const ASSIGNMENTS = (mock as { assignments: AssignmentMock[] }).assignments;

export default function ReviewSummary() {
  const form = useForm({
    initialValues: {
      assignmentId: ASSIGNMENTS[0]?.id ?? "",
      //  assignmentId: "a2", 
      sectionId: "all",
    },
  });

  const current = ASSIGNMENTS.find((a) => a.id === form.values.assignmentId);

  const questions = current?.questions ?? [];
  const rubric = current?.rubric ?? [];

  const noDataAll = (!questions || questions.length === 0) && (!rubric || rubric.length === 0);

  return (
    <Stack gap="sm" className="h-[calc(100vh-80px)]">
      <StatisticHeader title="Assignment Statistics" />

      {noDataAll ? (
        <Center className="flex-1 min-h-0">
          <Stack gap="xs" align="center">
            <Image
              src="/Image/statistic/statistic.svg"
              alt="No grading activity"
              maw={360}
              radius="md"
            />
            <Text c="dimmed" size="sm">
              This assignment has no grading activity yet.
            </Text>
          </Stack>
        </Center>
      ) : (
        <>
          <div className="shrink-0">
            <AssignmentStatistics
              assignmentName={current?.label ?? ""}
              questions={questions}
              initialChartHeight={220}
              compact
            />
          </div>
          <div className="flex-1 min-h-0">
            <RubricTable data={rubric} />
          </div>
        </>
      )}
    </Stack>
  );
}
