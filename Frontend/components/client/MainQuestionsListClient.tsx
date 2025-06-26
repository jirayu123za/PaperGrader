'use client';

import { Flex, Paper, Table, Title, Text } from "@mantine/core";
import { NoSubmissionsList } from "@/components/INS/INSProcess/ManageSubmissions/NoSubmissionsList";
import { IoCheckmarkSharp } from "react-icons/io5";
import { useFetchSubmissionsFromQuestion } from "@/hooks/Submissions/useFetchSubmissions";
import { useSubmissionsStore } from "@/store/Submissions/useSubmissionsStore";

export default function MainQuestionsListClient({ course_id, assignment_id, question_id }: { course_id: string; assignment_id: string; question_id: string; }) {
  const { isLoading, data: submissionsData } = useFetchSubmissionsFromQuestion(course_id, assignment_id);
  const { submissions } = useSubmissionsStore();

  return (
    <Flex direction="column" gap="xs" p="16px">
      <h1>Main Questions for Course {course_id}, Assignment {assignment_id}, Question {question_id}</h1>
      <Title order={3} fw="500" mb="lg">Question 1: Mock question title</Title>
      {submissions?.submissions.length === 0 ? (
        <NoSubmissionsList />
      ) : (
        <Paper withBorder>
          <Table.ScrollContainer minWidth={800} style={{ height: 'calc(100vh - 200px)' }}>
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
              <Table.Thead className='bg-gray-100'>
                <Table.Tr>
                  <Table.Th>No.</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th ta='center'>Graded by</Table.Th>
                  <Table.Th ta='center'>Section</Table.Th>
                  <Table.Th ta='center'>Score</Table.Th>
                  <Table.Th ta='center'>Graded?</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {submissions?.submissions.map((submission, index) => (
                  <Table.Tr key={submission.submission_id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td className="hover:underline hover:text-blue-500 hover:cursor-pointer">
                      {submission.user_name?.first_name && submission.user_name?.email ? (
                        `${submission.user_name.first_name}${submission.user_name.last_name ? ` ${submission.user_name.last_name}` : ''} (${submission.user_name.email})`
                      ) : (
                        <Text size="sm" c="gray" fs="italic">Not assigned student to this submission</Text>
                      )}
                    </Table.Td>
                    <Table.Td ta='center'>{submission.graded_by}</Table.Td>
                    <Table.Td ta='center'>{submission.section_name}</Table.Td>
                    <Table.Td ta='center'>{submission.score.toFixed(2)}</Table.Td>
                    <Table.Td ta='center' align="center">  
                      {submission.grade_status ? (
                        <Flex justify="center" align="center">
                          <IoCheckmarkSharp color="green" />
                        </Flex>
                      ) : null}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </Flex>
  );
}