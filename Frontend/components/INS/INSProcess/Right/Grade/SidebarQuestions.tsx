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
            <Flex direction="column" h="100%" style={{ minHeight: 0 }}>
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

              <Divider my="xs" mx="md" />

              <Box px="lg" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <ScrollArea type="hover" scrollbarSize={8} scrollbars="y" offsetScrollbars style={{ flex: 1, height: "100%" }}>
                  {submissionDetails?.questions_details.map((q, idx) => (
                    <Box key={q.question_id} mb="lg">
                      <Text size="sm" fw="500">Question {idx + 1}</Text>
                      <Group justify="space-between" className="group">
                        {q.question_title && (
                          <Title order={5} size="md" fw={400} lineClamp={1} 
                            className={
                              !q.sub_questions
                                ? "text-[#495057] group-hover:text-[#3B5BDB] group-hover:underline transition-colors duration-200 cursor-pointer"
                                : "text-[#495057]"
                            }
                            onClick={() => {
                              if (q.sub_questions && q.sub_questions.length > 0) return;
                              toggleSelectedRubricID(q.question_id);
                            }}
                          >
                            {q.question_title}
                          </Title>
                        )}
                        <Text size="sm" c="#495057">{q.question_point} pts</Text>
                      </Group>

                      {selectedRubricID === q.question_id && (
                        <RubricDetails rubric={q.rubrics} />
                      )}

                      {q.sub_questions?.map((sub, subIdx) => (
                        <Box key={sub.sub_question_id} pl="md" mt="xs" className="group">
                          <Group justify="space-between" w="100%" wrap="nowrap">
                            <Flex gap="md">
                              <Text size="sm" c="#495057">
                                {`${idx + 1}.${subIdx + 1}`}
                              </Text>
                              <Title order={6} size="sm" fw={400} lineClamp={1} className="text-[#495057] group-hover:text-[#3B5BDB] group-hover:underline transition-colors duration-200 cursor-pointer" 
                                onClick={() => toggleSelectedRubricID(sub.sub_question_id)}
                              >
                                {sub.sub_question_title}
                              </Title>
                            </Flex>
                            <Text size="sm" w={60} c="#495057" ta="right">
                              {sub.sub_question_point} pts
                            </Text>
                          </Group>

                          {selectedRubricID === sub.sub_question_id && (
                            <RubricDetails rubric={sub.rubrics} />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </ScrollArea>
              </Box>
            </Flex>
          )}
        </Container>
      )}
    </Flex>
  );
};