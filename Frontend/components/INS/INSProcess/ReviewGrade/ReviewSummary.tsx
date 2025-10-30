"use client";

import { useParams } from "next/navigation";
import { NumberInput, Group, Text, Title, Flex, Card, Center, Image, Popover, ActionIcon, } from "@mantine/core";
import GradeStatistics from "./GradeStatistics";
import StudentTable from "./StudentTable";
import { useFetchReviewGrade } from "@/hooks/ReviewGrade/useFetchReviewGrade";
import { useReviewGradeStore } from "@/store/reviewgrade/useReviewGradeStore";

export default function ReviewSummary() {
  const { course_id, assignment_id } = useParams() as { course_id?: string; assignment_id?: string; };
  const bin = useReviewGradeStore((s) => s.bin);
  const setBin = useReviewGradeStore((s) => s.setBin);
  const { data, isLoading, error, isFetching } = useFetchReviewGrade(course_id ?? null, assignment_id ?? null, bin);

  const stats = data?.statistics;
  const rows = stats?.table ?? [];
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
    <div className="flex flex-col h-[calc(100vh-80px)] px-4 md:px-6 lg:px-8 pt-4 overflow-hidden">
      <Flex
        className="shrink-0 "
        align="center"
        justify="space-between"
        mb="xs"
      >
        <Title order={3}>Review Grades</Title>

        <Group justify="flex-end" align="center" gap="xs">
          <Text size="sm" c="dimmed" fw={600}>
          NO. Bin
          </Text>
          <NumberInput
            defaultValue={bin}
            min={1}
            max={25}
            size="xs"
            maw={80}
            hideControls
            clampBehavior="strict"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const raw = (e.currentTarget as HTMLInputElement).value;
                const n = Number.parseInt(raw, 10);
                const safe = Number.isFinite(n) ? n : 10;
                setBin(Math.min(Math.max(safe, 1), 25));
              }
            }}
          />
          <Popover width={280} withArrow shadow="md" position="right-start">
            <Popover.Target>
              <ActionIcon size="sm" variant="subtle" aria-label="Bin help">
                <Text fw={700}>?</Text>
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm">
                You can set the bin range to 1–25. Press Enter to apply. “Bin” is the number of
                buckets used to group scores for the histogram.
              </Text>
            </Popover.Dropdown>
          </Popover>

          <Text size="xs" c="dimmed">
            {isFetching ? "Updating…" : null}
          </Text>
        </Group>
      </Flex>

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
          <div className="shrink-0">
            <GradeStatistics statistics={stats} />
          </div>

          <div className="flex-1 min-h-0">
            <StudentTable
              loading={isLoading}
              errorMessage={(error as Error)?.message}
              rows={rows}
              totalScore={stats?.total_assignment_score}
            />
          </div>
        </>
      )}
    </div>
  );
}
