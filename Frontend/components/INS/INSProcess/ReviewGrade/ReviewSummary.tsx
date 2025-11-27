"use client";

import { useParams } from "next/navigation";
import { NumberInput, Group, Text, Title, Flex, Center, Popover, ActionIcon, Box, Skeleton } from "@mantine/core";
import { useFetchReviewGrade } from "@/hooks/ReviewGrade/useFetchReviewGrade";
import { useReviewGradeStore } from "@/store/reviewGrade/useReviewGradeStore";
import { ErrorReviewStatistics } from "@/components/INS/INSProcess/ReviewGrade/ErrorReviewStatistics";
import { NoReviewStatistic } from "@/components/INS/INSProcess/ReviewGrade/NoReviewStatistic";
import { NoGradeStudentTable } from "@/components/INS/INSProcess/ReviewGrade/NoGradeStudentTable";
import GradeStatistics from "@/components/INS/INSProcess/ReviewGrade/GradeStatistics";
import GradeStudentTable from "@/components/INS/INSProcess/ReviewGrade/GradeStudentTable";

export default function ReviewSummary() {
  const { bin, setBin, gradeStatistics } = useReviewGradeStore();
  const { course_id, assignment_id } = useParams() as { course_id?: string; assignment_id?: string; };
  const { isLoading, isError, isFetching } = useFetchReviewGrade(course_id ?? null, assignment_id ?? null, bin);
  const statisticNoData = !gradeStatistics || (gradeStatistics.grades_data.length === 0) || (gradeStatistics.maximum === 0 && gradeStatistics.minimum === 0 && gradeStatistics.mean === 0 && gradeStatistics.sd === 0 && gradeStatistics.median === 0) || (gradeStatistics.submission_scores.length === 0);
  return (
    <Flex direction="column" gap="md" className="h-full" px="lg" pt="md">
      <Box>
        <Flex justify="space-between" align="center">
          <Title order={3}>Review Grades</Title>
          <Group justify="flex-end" align="center" gap="xs">
            <Text size="sm" c="dimmed" fw={600}>
              No. of Bin
            </Text>
            <NumberInput
              defaultValue={bin}
              min={1}
              max={25}
              size="xs"
              maw={80}
              disabled={isLoading || isFetching}
              allowDecimal={false}
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
          </Group>
        </Flex>
      </Box>

      <Box>
        { isFetching ? (
            <Skeleton h={400}/>
          ) : isError ? (
            <ErrorReviewStatistics />
          ) : statisticNoData ? (
            <NoReviewStatistic />
          ) : gradeStatistics ? (
            <GradeStatistics />
          ) : <NoReviewStatistic />
        }
      </Box>

      <Box className="flex-1 min-h-0">
        {isFetching ? (
            <Skeleton h={400} />
          ) : isError ? (
            null
          ) : gradeStatistics ? (
            <GradeStudentTable />
          ) : <NoGradeStudentTable />
        }
      </Box>
    </Flex>
  );
}
