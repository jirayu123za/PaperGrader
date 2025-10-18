"use client";

import { useParams } from "next/navigation";
import { NumberInput, Group, Text, Title, Flex, Card, Center, Image } from "@mantine/core";
import GradeStatistics from "./GradeStatistics";
import StudentTable from "./StudentTable";
import { useFetchReviewGrade } from "@/hooks/ReviewGrade/useFetchReviewGrade";
import { useReviewGradeStore } from "@/store/reviewgrade/useReviewGradeStore";

export default function ReviewSummary() {
  const { course_id, assignment_id } = useParams() as {
    course_id?: string;
    assignment_id?: string;
  };

  const bin = useReviewGradeStore((s) => s.bin);
  const setBin = useReviewGradeStore((s) => s.setBin);

  const { data, isLoading, error, isFetching } = useFetchReviewGrade(
    course_id ?? null,
    assignment_id ?? null,
    bin
  );

  const stats = data?.statistics;
  const rows = stats?.table ?? [];

  // ----- ✅ เช็ค empty state: ค่าทุกอย่างเป็น 0/ว่าง และ arrays ว่าง -----
  const isZero = (n: number | null | undefined) => n === null || n === 0;
  const gradesAllZero = (stats?.grades_data ?? []).every((b) => (b?.count ?? 0) === 0);
  const noScores = (stats?.submission_scores?.length ?? 0) === 0;
  const noRows = rows.length === 0;

  const allZeroAndEmpty =
    !!stats &&
    isZero(stats.minimum) &&
    isZero(stats.median) &&
    isZero(stats.maximum) &&
    isZero(stats.mean) &&
    isZero(stats.sd) &&
    gradesAllZero &&
    noScores &&
    noRows;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <Flex  className="shrink-0 px-4 md:px-6" align="center" justify="space-between" mb="xs">
        <Title order={3}>Review Grades</Title>
        <Group justify="flex-end">
          <Text size="sm" c="dimmed">Bins</Text>
          <NumberInput
            value={bin}
            onChange={(v) => setBin(typeof v === "number" ? v : 10)}
            min={1}
            max={100}
            size="xs"
            maw={80}
            hideControls
          />
          <Text size="xs" c="dimmed">
            {isFetching ? "Updating…" : null}
          </Text>
        </Group>
      </Flex>

      {/* ----- ✅ Empty State ----- */}
      {allZeroAndEmpty ? (
        <Card withBorder radius="md" className="flex-1 flex flex-col">
          <Center className="flex-1 flex flex-col gap-4 py-10">
            <Image
              src="/Image/statistic/statistic.svg"
              alt="No grading activity"
              w={240}
              mah={260}
              fit="contain"
            />
            <Text c="dimmed" size="lg" ta="center">
              There is no grading activity for this assignment yet.
            </Text>
          </Center>
        </Card>
      ) : (
        <>
          {/* สรุปสถิติ + Histogram */}
          <div className="shrink-0">
            <GradeStatistics statistics={stats} />
          </div>

          {/* ตารางนักศึกษา */}
          <div className="flex-1 min-h-0">
            <StudentTable
              loading={isLoading}
              errorMessage={(error as Error)?.message}
              rows={rows}
            />
          </div>
        </>
      )}
    </div>
  );
}
