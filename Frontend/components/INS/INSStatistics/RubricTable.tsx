"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {Table,Progress,Text,ScrollArea,Flex,Anchor,Box,Paper,} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { VscListUnordered } from "react-icons/vsc";
import RubricPieModal from "./RubricPieModal";
import type {QuestionItem,SubQuestionStat,RubricBlock,} from "@/store/statistic/useStatisticsStore";

type Props = {
  questions: QuestionItem[];
  viewportBottomPadding?: number;
};

export default function RubricTable({
  questions,
  viewportBottomPadding = 16,
}: Props) {
  const hasData = Array.isArray(questions) && questions.length > 0;


  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewH, setViewH] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) return;

    const calc = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const vh = window.innerHeight;
      const available = Math.max(200, vh - rect.top - viewportBottomPadding);
      setViewH(available);
    };

    const onResize = () => requestAnimationFrame(calc);
    calc();

    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    ro.observe(containerRef.current!);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [viewportBottomPadding]);


  type FlatRow =
    | {
        kind: "q";
        id: string;
        number: string;
        title?: string | null;
        point?: number | null;
        percent_mean?: number | null;
        rubric?: RubricBlock | null;
        indent: number;
      }
    | {
        kind: "sub";
        id: string;
        number: string;
        title?: string | null;
        point?: number | null;
        percent_mean?: number | null;
        rubric?: RubricBlock | null;
        indent: number;
      };

  const flatRows: FlatRow[] = useMemo(() => {
    if (!hasData) return [];
    const out: FlatRow[] = [];
    for (const q of questions) {
      out.push({
        kind: "q",
        id: q.question_id,
        number: q.question_number,
        title: q.question_title ?? null,
        point: q.question_point ?? null,
        percent_mean: q.percent_mean ?? null,
        rubric: q.rubric ?? null,
        indent: indentFromNumber(q.question_number),
      });
      if (Array.isArray(q.sub_questions)) {
        for (const s of q.sub_questions as SubQuestionStat[]) {
          out.push({
            kind: "sub",
            id: s.sub_question_id,
            number: s.question_number,
            title: s.sub_question_title ?? null,
            point: s.sub_question_point ?? null,
            percent_mean: s.percent_mean ?? null,
            rubric: s.rubric ?? null,
            indent: indentFromNumber(s.question_number),
          });
        }
      }
    }
    return out;
  }, [hasData, questions]);


  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [selectedRubric, setSelectedRubric] = useState<RubricBlock | null>(
    null
  );

  const handleOpenModal = (row: FlatRow) => {
    if (!row.rubric) return;
    setSelectedTitle(`Rubric for ${row.number} — ${row.title ?? "-"}`);
    setSelectedRubric(row.rubric);
    open();
  };

  if (!hasData) return null;

  return (
    <>

      <div ref={containerRef}>
        <ScrollArea
          h={viewH} 
          type="always"
          scrollbarSize={8}
        >

          <Paper withBorder radius="md" p={0}>
            <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="lg">
              <Table.Thead className="bg-gray-100">
                <Table.Tr>
                  <Table.Th style={{ textAlign: "left", width: "40%" }}>
                    Question
                  </Table.Th>
                  <Table.Th style={{ textAlign: "left", width: "20%" }}>
                    Points
                  </Table.Th>
                  <Table.Th style={{ textAlign: "left", width: "40%" }}>
                    Mean
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {flatRows.map((row) => {
                  const pct =
                    typeof row.percent_mean === "number"
                      ? Math.round(row.percent_mean)
                      : null;

                  return (
                    <Table.Tr
                      key={`${row.kind}-${row.id}`}
                      style={{
                        cursor: row.rubric ? "pointer" : "default",
                      }}
                      className="group"
                      onClick={() => handleOpenModal(row)}
                    >
                      <Table.Td>
                        <Flex
                          gap="sm"
                          align="flex-start"
                          style={{ marginLeft: row.indent * 24 }}
                        >
                          <Text fw={row.indent === 0 ? 700 : 500}>
                            {row.number}
                          </Text>
                          <Box className="relative w-fit flex items-center gap-1">
                            <Text
                              fw={row.indent === 0 ? 500 : 400}
                              style={{
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {row.title ?? "-"}
                            </Text>

                            {row.rubric ? (
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
                        <Text>
                          {typeof row.point === "number"
                            ? `${row.point} point${row.point > 1 ? "s" : ""}`
                            : "-"}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        {typeof pct === "number" ? (
                          <Flex
                            justify="space-between"
                            align="center"
                            style={{ width: "100%" }}
                          >
                            <Progress
                              value={pct}
                              style={{ flex: 1, marginRight: 8 }}
                              color="#6665AC"
                            />
                            <Text>{pct}%</Text>
                          </Flex>
                        ) : (
                          <Text c="dimmed">-</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>
        </ScrollArea>
      </div>

      <RubricPieModal
        opened={opened}
        onClose={close}
        rubric={selectedRubric}
        title={selectedTitle || "Rubric"}
      />
    </>
  );
}

function indentFromNumber(num?: string) {
  if (!num) return 0;
  const dots = num.split(".").length - 1;
  return Math.max(0, dots);
}
