'use client';

import React from 'react';
import { Table, Progress, Text, Flex, Paper, Anchor, Box } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { VscListUnordered } from "react-icons/vsc";
import { useQuestionsListStore } from '@/store/question/useQuestionsList';
import { useFetchQuestionsList } from '@/hooks/Question/useFetchQuestsList';
import { NoSubmissions } from '@/components/INS/INSProcess/ManageSubmissions/NoSubmissions';

export const INSSubmissionsQuestion: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const assignment_id = params.assignment_id as string;
  const course_id = params.course_id as string;
  
  const { isLoading: isLoadingQuestions, data: questionsData } = useFetchQuestionsList(assignment_id);
  const { questions } = useQuestionsListStore();

  const allSubmissionsEmpty = questions.every((q) => {
    if (q.sub_questions && q.sub_questions.length > 0) {
      return q.sub_questions.every((sub) => sub.submission_id === null);
    }
    return q.submission_id === null;
  });

  if (allSubmissionsEmpty) {
    return <NoSubmissions />;
  }

  return (
    <Flex direction="column" gap="sm" p="md">
      <Flex direction="column">
        <Text size="lg" fw={500}>
          Grading Dashboard
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          Grade submissions by selecting individual questions below.
        </Text>
      </Flex>

      <Paper withBorder>
        <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
          <Table.Thead className='bg-gray-100'>
            <Table.Tr>
              <Table.Th>Question</Table.Th>
              <Table.Th ta='center'>Points</Table.Th>
              <Table.Th ta='center'>Progress</Table.Th>
              <Table.Th ta='center'>Graded by</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {questions.map((question, index) => {
              const hasSub = question.sub_questions && question.sub_questions.length > 0;

              return (
                <Table.Tr key={question.question_id}>
                  {/* Question Column */}
                  <Table.Td className="align-top">
                    {hasSub ? (
                      <Box className="mb-2">
                        <Text size="md">
                          {index + 1}: {question.question_title}
                        </Text>
                      </Box>
                    ) : (
                      <Box className="mb-2 group flex items-center gap-1 relative w-fit">
                        <Anchor
                          underline="hover"
                          c="dark"
                          onClick={() => router.push(`/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question.question_id}/submissions/${question.submission_id}`)}
                        >
                          {index + 1}: {question.question_title}
                        </Anchor>
                        <Anchor
                          underline="hover"
                          size='xs'
                          ml='xs'
                          className="invisible group-hover:visible"
                          onClick={() => router.push(`/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question.question_id}/submissions`)}
                        >
                          <Flex align="center" gap={4} >
                            <VscListUnordered size={12} className='translate-y-[1px]'/>
                            <span>Submissions</span>
                          </Flex>
                        </Anchor>
                      </Box>
                    )}

                    {hasSub && (
                      <Flex direction="column" gap={16}>
                        {question.sub_questions?.map((sub, subIndex) => (
                          <Flex key={sub.sub_question_id} align="center" ml="lg" className="group relative w-fit">
                            <span className="w-3 h-3 border-l-2 border-b-2 border-dotted border-gray-300 mr-2 -translate-y-[2px]" />
                            <Anchor
                              underline="hover"
                              size="sm"
                              c="dimmed"
                              onClick={() => router.push(`/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question.question_id}/sub-questions/${sub.sub_question_id}/submissions/${sub.submission_id}`)}
                            >
                              {index + 1}.{subIndex + 1}: {sub.sub_question_title}
                            </Anchor>
                            <Anchor
                              underline="hover"
                              size='xs'
                              ml='xs'
                              className="invisible group-hover:visible"
                              onClick={() => router.push(`/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question.question_id}/sub-questions/${sub.sub_question_id}/submissions`)}
                            >
                              <Flex align="center" gap={4} >
                                <VscListUnordered size={12} className='translate-y-[1px]'/>
                                <span>Submissions</span>
                              </Flex>
                            </Anchor>
                          </Flex>
                        ))}
                      </Flex>
                    )}
                  </Table.Td>

                  {/* Points Column */}
                  <Table.Td ta="center" className="align-top">
                    <Text mb="xs" size="md" fw={500} h='24.80px' c="dimmed">{question.question_point.toFixed(1)}</Text>
                    {hasSub && (
                      <Flex direction="column" gap={16}>
                        {question.sub_questions?.map((sub) => (
                          <Text
                            key={sub.sub_question_id}
                            size="sm"
                            fw={500}
                            c="dimmed"
                          >
                            {sub.sub_question_point.toFixed(1)}
                          </Text>
                        ))}
                      </Flex>
                    )}
                  </Table.Td>

                  {/* Progress Column */}
                  <Table.Td ta="center" className="align-top">
                    {!hasSub ? (
                      <Flex align="center" justify="center">
                        <Progress value={question.progress ?? 0} color="green" w={350} size="lg" />
                        <Text size="sm" fw={500} c="green" w={30}>{question.progress}%</Text>
                      </Flex>
                    ) : (
                      <>
                        <div className="min-h-[24px] mb-[10px]" />
                        <Flex direction="column" gap={16}>
                          {question.sub_questions?.map((sub) => (
                            <Flex
                              key={sub.sub_question_id}
                              align="center"
                              justify="center"
                              gap="2px"
                            >
                              <Progress
                                value={sub.progress ?? 0}
                                color="gray"
                                w={350}
                                size="lg"
                              />
                              <Text size="sm" fw={500} c="green" w={30}>{sub.progress}%</Text>
                            </Flex>
                          ))}
                        </Flex>                      
                      </>
                    )}
                  </Table.Td>

                  {/* Graded by Column */}
                  <Table.Td ta="center" className="align-top">
                    {!hasSub ? (
                        <Text size="sm" fw={500} c="dimmed">{question.graded_by ?? "-"}</Text>
                      ) : (
                        <>
                          <div className="min-h-[24px] mb-[10px]" />
                          <Flex direction="column" gap={16}>
                            {question.sub_questions?.map((sub) => (
                              <Text
                                key={sub.sub_question_id}
                                size="sm"
                                fw={500}
                                c="dimmed"
                              >
                                {sub.graded_by ?? "-"}
                              </Text>
                            ))}
                          </Flex>
                        </>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>
    </Flex>
  );
};
