"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Box, Text, ScrollArea, Title, Group, Flex, Burger, Loader, Container, Divider, Paper, Badge, Avatar } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RubricDetails } from "@/components/INS/INSProcess/Right/Grade/RubricDetails";
import { useFetchSubmissionDetails } from "@/hooks/GradeSubmission/useFetchGradeSubmission";
import { useGradeSubmissionStore } from "@/store/GradeSubmission/useGradeSubmissionStore";
import { NoSubmissionGrade } from "@/components/INS/INSProcess/Right/Grade/NoSubmissionGrade";

export const SidebarQuestions = () => {
  const { course_id, assignment_id, submission_id } = useParams<{ course_id: string; assignment_id: string; submission_id: string }>();
  const [ opened, { toggle } ] = useDisclosure(true);
  const { isLoading, isError } = useFetchSubmissionDetails({ course_id, assignment_id, submission_id });
  const submissionDetails = useGradeSubmissionStore((state) => state.submissionDetails);
  const selectedRubricID = useGradeSubmissionStore((state) => state.selectedRubricID);
  const toggleSelectedRubricID = useGradeSubmissionStore((state) => state.toggleSelectedRubricID);

  return (
    <Flex direction="column" bg="#F9F9F9" w={opened ? "100%" : 60} maw={460} h="100vh" className="border-l border-[#ddd] transition-all duration-300">
      <Flex justify="flex-start" align="center" p="md" bg="#6665AC">
        <Burger lineSize={4} size="md" opened={opened} onClick={toggle} color="white" aria-label="Toggle navigation" />
      </Flex>

      {opened && (
        <Container fluid p={0} style={{ flex: 1, minHeight: 0 }}>
          {isLoading ? (
            <Flex align="center" justify="center" w="100%" h="100%">
              <Loader color="violet" type="bars" size="md" />
            </Flex>
          ) : isError ? (
            <NoSubmissionGrade />
          ) : (
            <Flex direction="column" h="100%" gap="xs" style={{ minHeight: 0 }}>
              <Box px="md" pt="md">
                <Paper withBorder radius="xs" p="md" shadow="xs">
                  <Group justify="space-between" align="center" mb="xs">
                    <Title order={4} fw={600} c="#343a40">
                      {submissionDetails?.assignment_details?.assignment_name || "Untitled Submission"}
                    </Title>
                    <Badge size="sm" radius="sm" variant="light" color="grape">
                      {submissionDetails?.summary?.grade_status ? "Graded" : "Ungraded"}
                    </Badge>
                  </Group>

                  <Group justify="space-between" align="flex-start">
                    <Group align="center" gap="sm">
                      <Avatar radius="xl" color="grape">{submissionDetails?.header_details?.nick_name || "?"}</Avatar>
                      <div>
                        <Text size="xs" c="dimmed" fw={500}>Student</Text>
                        <Text size="sm" fw={600}>{submissionDetails?.header_details?.full_name || "Unknown Student"}</Text>
                      </div>
                    </Group>

                    <Box ta="end">
                      <Text size="xs" c="dimmed">Total points</Text>
                      <Text size="sm" fw={700}>{submissionDetails?.summary?.total_submission_point || 0} / {submissionDetails?.summary?.total_assignment_point || 0} pts</Text>
                    </Box>
                  </Group>
                </Paper>
              </Box>

              <Divider mx="md" />
              
              {/* QUESTION LIST */}
              <Box
                px="md"
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ScrollArea
                  type="hover"
                  scrollbarSize={8}
                  scrollbars="y"
                  offsetScrollbars
                  style={{ flex: 1, height: "100%" }}
                >
                  {submissionDetails?.questions_details.map((q, idx) => {
                    const isQuestionSelected = selectedRubricID === q.question_id;
                    return (
                      <Box key={q.question_id} mb="sm" mt="1px">
                        <Paper
                          withBorder
                          radius="md"
                          p="sm"
                          shadow={isQuestionSelected ? "sm" : "xs"}
                          className={`bg-white transition-all duration-150 hover:shadow-sm hover:-translate-y-[1px]`}
                        >
                          {/* HEADER QUESTION ROW */}
                          <Box
                            className="cursor-pointer"
                            onClick={() => {
                              if (q.sub_questions && q.sub_questions.length > 0)
                                return;
                              toggleSelectedRubricID(q.question_id);
                            }}
                          >
                            <Group
                              justify="space-between"
                              align="flex-start"
                              wrap="nowrap"
                            >
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  fw={600}
                                  tt="uppercase"
                                  mb={2}
                                >
                                  Question {idx + 1}
                                </Text>
                                {q.question_title && (
                                  <Text
                                    size="sm"
                                    fw={500}
                                    lineClamp={1}
                                    className="text-[#343a40] group-hover:text-[#3B5BDB] transition-colors duration-200"
                                  >
                                    {q.question_title}
                                  </Text>
                                )}
                              </Box>
                              <Badge
                                variant="light"
                                size="sm"
                                radius="xl"
                                color="gray"
                              >
                                {q.question_point} pts
                              </Badge>
                            </Group>
                          </Box>

                          {isQuestionSelected && q.rubrics && (
                            <RubricDetails rubric={q.rubrics} />
                          )}

                          {/* SUB QUESTIONS */}
                          {q.sub_questions && q.sub_questions.length > 0 && (
                            <Box mt="sm" pt="sm" className="border-t border-[#f1f3f5]">
                              {q.sub_questions.map((sub, subIdx) => {
                                const isSubSelected = selectedRubricID === sub.sub_question_id;
                                return (
                                  <Box
                                    key={sub.sub_question_id}
                                    py={4}
                                    className={`group rounded-md px-1 cursor-pointer transition-colors duration-150 bg-white`}
                                    onClick={() => toggleSelectedRubricID(sub.sub_question_id)}
                                  >
                                    <Group
                                      justify="space-between"
                                      wrap="nowrap"
                                      align="flex-start"
                                    >
                                      <Flex gap="sm" align="flex-start">
                                        <Text
                                          size="xs"
                                          c="dimmed"
                                          mt={2}
                                          w={26}
                                        >
                                          {`${idx + 1}.${subIdx + 1}`}
                                        </Text>
                                        <Text
                                          size="sm"
                                          fw={400}
                                          lineClamp={1}
                                        >
                                          {sub.sub_question_title}
                                        </Text>
                                      </Flex>

                                      <Text
                                        size="xs"
                                        c="dimmed"
                                        ta="right"
                                        w={70}
                                      >
                                        {sub.sub_question_point} pts
                                      </Text>
                                    </Group>

                                    {isSubSelected && sub.rubrics && (
                                      <RubricDetails rubric={sub.rubrics} />
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    );
                  })}
                </ScrollArea>
              </Box>
            </Flex>
          )}
        </Container>
      )}
    </Flex>
  );
};