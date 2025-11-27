"use client";

import dayjs from "dayjs";
import { useMemo } from "react";
import { Table, Text, Title, Input, Group, Paper } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { IoMdCheckmark, IoMdClose ,IoMdPeople  } from "react-icons/io";
import { useReviewGradeStore } from "@/store/reviewGrade/useReviewGradeStore";
import { useViewportSize } from "@mantine/hooks";

export default function GradeStudentTable() {
  const { height } = useViewportSize();
  const { gradeStatistics } = useReviewGradeStore();
  const totalScore = gradeStatistics?.total_assignment_score;

  const rows = useMemo(() => 
    gradeStatistics?.table ?? [], [gradeStatistics?.table]
  );

  const tableMaxHeight = useMemo(() => {
    if (!height) return 400;
    const reservedTop = 722;
    return Math.max(220, height - reservedTop);
  }, [height]);

  const formatNumber = (value: number | null | undefined) => value == null 
    ? "-" : Number.isInteger(value) ? value.toString() : value.toFixed(2);
  const formatDate = (value?: string | Date | null) => !value 
    ? "" : dayjs(value).format("MMM DD, YYYY [at] hh:mm A");
  const formatScore = (score: number | null, totalScore?: number | null) => totalScore != null
    ? `${formatNumber(score)} / ${formatNumber(totalScore)}` : formatNumber(score);

  if (!rows.length) return null;
  return (
    <>
      <Paper withBorder radius="md" p={0}>
        <Table.ScrollContainer minWidth="auto" maxHeight={tableMaxHeight} className="no-scroll-padding">
          <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="lg">
            <Table.Thead className="bg-gray-100">
              <Table.Tr>
                <Table.Th w="15%"><Title order={6} lineClamp={1}>Name </Title></Table.Th>
                <Table.Th w="15%"><Title order={6} lineClamp={1}>Email</Title></Table.Th>
                <Table.Th w="10%"><Title order={6} lineClamp={1}>Sections</Title></Table.Th>
                <Table.Th w="10%"><Title order={6} lineClamp={1}>Score</Title></Table.Th>
                <Table.Th w="10%"><Title order={6} lineClamp={1}>Graded</Title></Table.Th>
                <Table.Th w="10%"><Title order={6} lineClamp={1}>Submitted</Title></Table.Th>
                <Table.Th w="15%"><Title order={6} lineClamp={1}>Time</Title></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r) => (
                <Table.Tr key={r.personal_data_id ?? r.email}>
                  <Table.Td w="15%">
                    <Text size="sm" title={r.student_name} lineClamp={1} >{r.student_name}</Text>
                  </Table.Td>
                  <Table.Td w="15%">
                    <Text size="sm" title={r.email} lineClamp={1} >{r.email}</Text>
                  </Table.Td>
                  <Table.Td w="10%" pl="24px">
                    <Text size="sm" title={r.sections ?? "-"} lineClamp={1} >{r.sections ?? "-"}</Text>
                  </Table.Td>
                  <Table.Td w="10%">
                    <Text
                      size="sm"
                      truncate
                      lineClamp={1}
                      title={formatScore(r.score, totalScore ?? null)}
                    >
                      {formatScore(r.score, totalScore ?? null)}
                    </Text>
                  </Table.Td>
                  <Table.Td w="10%" pl="34px">
                    {r.graded ? (
                      <IoMdCheckmark
                        size={18}
                        color="#2f9e44"
                        aria-label="graded"
                      />
                    ) : (
                      <IoMdClose
                        size={18}
                        color="#fa5252"
                        aria-label="not graded"
                      />
                    )}
                  </Table.Td>
                  <Table.Td w="10%" pl="44px">
                    {r.has_submission ? (
                      <IoMdCheckmark
                        size={18}
                          color="#2f9e44"
                          aria-label="submitted"
                        />
                      ) : (
                        <IoMdClose
                          size={18}
                          color="#fa5252"
                          aria-label="not submitted"
                        />
                      )}
                  </Table.Td>
                  <Table.Td w="15%"> 
                    <Text size="sm" title={r.submitted_at ? `${formatDate(r.submitted_at)}` : ""} lineClamp={1} >{r.submitted_at ? formatDate(r.submitted_at) : ""}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper></>
  );
}
