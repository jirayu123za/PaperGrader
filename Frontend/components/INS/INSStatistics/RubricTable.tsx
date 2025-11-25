"use client";

import React, { useMemo, useState } from "react";
import { Table, Progress, Text, Flex, Anchor, Box, Paper, Title } from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import { VscListUnordered } from "react-icons/vsc";
import { useStatisticsStore } from "@/store/statistic/useStatisticsStore";
import RubricPieModal from "@/components/INS/INSStatistics/RubricPieModal";

type FlatRow = {
  key: string;
  indent: number;
  number: string;
  title: string;
  point: number | null;
  mean: number | null;
  percent_mean: number | null;
  hasChildren: boolean;
  question_id: string;
  sub_question_id?: string | null;
};

export default function RubricTable() {
  const [opened, { open, close }] = useDisclosure(false);
  const { statisticsData: stats } = useStatisticsStore();
  const { height } = useViewportSize();
  const [activeQuestionID, setActiveQuestionID] = useState<string | null>(null);
  const [activeSubQuestionID, setActiveSubQuestionID] = useState<string | null>(null);
  
  const rows: FlatRow[] = useMemo(() => {
    if (!stats) return [];
    const out: FlatRow[] = [];

    stats.questions_list.forEach((q) => {
      const hasChildren = !!q.sub_questions && q.sub_questions.length > 0;
      // main question
      out.push({
        key: q.question_id,
        indent: 0,
        number: q.question_number,
        title: q.question_title ?? "",
        point: q.question_point ?? null,
        mean: q.mean ?? null,
        percent_mean: q.percent_mean ?? null,
        hasChildren,
        question_id: q.question_id,
        sub_question_id: null,
      });
      // sub-questions
      q.sub_questions?.forEach((sq) => {
        out.push({
          key: sq.sub_question_id,
          indent: 1,
          number: sq.question_number,
          title: sq.sub_question_title ?? "",
          point: sq.sub_question_point ?? null,
          mean: sq.mean ?? null,
          percent_mean: sq.percent_mean ?? null,
          hasChildren: false,
          question_id: q.question_id,
          sub_question_id: sq.sub_question_id,
        });
      });
    });
    return out;
  }, [stats]);

  
  const handleOpenModal = (row: FlatRow) => {
    if (row.hasChildren) return;
    setActiveQuestionID(row.question_id);
    setActiveSubQuestionID(row.sub_question_id ?? null);
    open();
  };

  const handleCloseModal = () => {
    close();
    setActiveQuestionID(null);
    setActiveSubQuestionID(null);
  };

  const tableMaxHeight = useMemo(() => {
    if (!height) return 400;
    const reservedTop = 585;
    return Math.max(220, height - reservedTop);
  }, [height]);


  if (!rows.length) return null;
  return (
    <>
      <Paper withBorder radius="md" p={0}>
        <Table.ScrollContainer minWidth="auto" maxHeight={tableMaxHeight} className="no-scroll-padding">
        <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="lg">
          <Table.Thead className="bg-gray-100" h="50px">
            <Table.Tr>
              <Table.Th ta="left" w="40%">
                <Title order={6} lineClamp={1}>
                  Question
                </Title>
              </Table.Th>
              <Table.Th ta="left" w="20%">
                <Title order={6} lineClamp={1}>
                  Points / Full marks
                </Title>
              </Table.Th>
              <Table.Th ta="left" w="40%">
                <Title order={6} lineClamp={1}>
                  Mean %
                </Title>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.map((row) => {
              const pct = typeof row.percent_mean === "number" && Number.isFinite(row.percent_mean) ? row.percent_mean : null;
              const canOpen = !row.hasChildren;

              return (
                <Table.Tr
                  key={row.key}
                  style={{
                    cursor: canOpen ? "pointer" : "default",
                  }}
                  className="group"
                  onClick={canOpen ? () => handleOpenModal(row) : undefined}
                >
                  <Table.Td>
                    <Flex
                      gap="sm"
                      align="flex-start"
                      style={{ marginLeft: row.indent * 24 }}
                    >
                      <Text fw={500}>
                        {row.number}
                      </Text>

                      <Box className="relative w-fit flex items-center gap-1">
                        <Text fw={400} lineClamp={1}>
                          {row.title ?? "Without question title"}
                        </Text>

                        {canOpen ? (
                          <Anchor
                            underline="hover"
                            size="xs"
                            ml="xs"
                            className="invisible group-hover:visible"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(row);
                            }}
                          >
                            <Flex align="center" gap={4}>
                              <VscListUnordered
                                size={12}
                                className="translate-y-[1px]"
                              />
                              <span>Rubric</span>
                            </Flex>
                          </Anchor>
                        ) : null}
                      </Box>
                    </Flex>
                  </Table.Td>

                  <Table.Td>
                    {typeof row.point === "number" && typeof row.mean === "number" ? (
                      <Text lineClamp={1}>
                        {row.mean.toFixed(1)} / {row.point.toFixed(1)}
                      </Text>
                    ) : row.hasChildren ? null : (
                      <Text c="dimmed" fs="italic" size="sm" lineClamp={1}>
                        Not assign rubric points or Not has graded
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td>
                    {typeof pct === "number" ? (
                      <Flex
                        justify="space-between"
                        align="center"
                        w="100%"
                      >
                        <Progress
                          value={pct}
                          style={{ flex: 1, marginRight: 8 }}
                          size="lg"
                          color="#6665AC"
                        />
                        <Text>{pct.toFixed(2)}%</Text>
                      </Flex>
                    ) : row.hasChildren ? null : (
                      null
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
        </Table.ScrollContainer>
      </Paper>

      <RubricPieModal
        opened={opened}
        onClose={handleCloseModal}
        questionID={activeQuestionID}
        subQuestionID={activeSubQuestionID}
      />
    </>
  );
}
