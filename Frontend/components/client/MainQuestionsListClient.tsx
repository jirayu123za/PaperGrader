'use client';

import { Flex, Paper, Table, Title, Text } from "@mantine/core";
import { NoSubmissionsList } from "@/components/INS/INSProcess/ManageSubmissions/NoSubmissionsList";
import { IoCheckmarkSharp } from "react-icons/io5";
import { useFetchSubmissionsFromQuestion } from "@/hooks/Submissions/useFetchSubmissions";
import { useSubmissionsStore } from "@/store/Submissions/useSubmissionsStore";

// interface SubmissionsList {
//   id: string;
//   user_name: UserName;
//   graded_by: string;
//   section: string;
//   score: number;
//   grade_status: boolean;
// }

// interface UserName {
//   name: string;
//   email: string;
// }


export default function MainQuestionsListClient({ course_id, assignment_id, question_id }: { course_id: string; assignment_id: string; question_id: string; }) {
  // const generateMockSubmissions = (count: number): SubmissionsList[] => {
  //   const names = ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Helen", "Isaac", "Jade"];
  //   const graders = ["Dr. Smith", "Prof. Kim", "Dr. Lee", "Ms. Brown"];
  //   const sections = ["001", "002", "003", "004", "005", "006", "701", "702", "703", "704", "801", "802", "803", "804"];
  //   const surnames = ["Johnson", "Lee", "Kim", "Williams", "Brown", "Clark"];
  //   const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  //   return Array.from({ length: count }, (_, i) => {
  //     const name = getRandomItem(names);
  //     const surname = getRandomItem(surnames);
  //     const fullName = `${name} ${surname}`;
  //     const email = `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`;

  //     return {
  //       id: `submission-${i}`,
  //       user_name: {
  //         name: fullName,
  //         email: email,
  //       },
  //       graded_by: getRandomItem(graders),
  //       section: getRandomItem(sections),
  //       score: Math.floor(Math.random() * 101),
  //       grade_status: Math.random() < 0.5,
  //     };
  //   });
  // };

  // const submissionsList: SubmissionsList[] = generateMockSubmissions(250);

  const { isLoading, data: submissionsData } = useFetchSubmissionsFromQuestion(course_id, assignment_id);
  const { submissions } = useSubmissionsStore();

  // if (submissions?.submissions.length === 0) {
  //   return <NoSubmissionsList />
  // }

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