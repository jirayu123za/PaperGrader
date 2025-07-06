'use client';

import { Flex, Paper, Table, Text, Group, TextInput, ActionIcon, Divider, ScrollArea } from "@mantine/core";
import { NoSubmissionsList } from "@/components/INS/INSProcess/ManageSubmissions/NoSubmissionsList";
import { IoCheckmarkSharp } from "react-icons/io5";
import { useFetchSubmissionsFromQuestion } from "@/hooks/Submissions/useFetchSubmissions";
import { useSubmissionsStore } from "@/store/Submissions/useSubmissionsStore";
import { useRouter } from 'next/navigation';
import { useRef } from "react";
import { IconArrowBigDown, IconArrowBigUp, IconFilter, IconSearch } from "@tabler/icons-react";

export default function SubQuestionsListClient({ course_id, assignment_id, question_id, sub_question_id }: { course_id: string; assignment_id: string; question_id: string; sub_question_id: string; }) {
  const router = useRouter();
  const viewPort = useRef<HTMLDivElement>(null);
  const { isLoading, data: submissionsData } = useFetchSubmissionsFromQuestion(course_id, assignment_id);
  const { submissions } = useSubmissionsStore();
  const scrollToBottom = () => viewPort.current!.scrollTo({ top: viewPort.current!.scrollHeight, behavior: 'smooth' });
  const scrollToTop = () => viewPort.current!.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Flex direction="column" gap="xs" p="16px">
      <Flex justify="space-between" align="flex-end" mb="xs">
        <Flex direction="column">
          <Text size="lg" fw={500}>
            Submissions list
          </Text>
          <Text size="sm" c="dimmed">
            Select a submission to grade the Sub-Question 1:{' '}
            <Text component="span" c="black" size="md" fw={500}>
              Mock sub-question title
            </Text>.
          </Text>
        </Flex>

        <Flex gap="xs" justify="flex-end" align="center">
          <Group gap="xs" pr="md" pl="md" bdrs="lg" bd="1px solid" c="#edf1f5" bg="#f8f9fa">
            <IconSearch size={18} color="#868e96" />
            <TextInput
              variant="unstyled"
              placeholder="Search"
              size="xs"
              radius="md"
              w={300}
              // value={searchQuery}
              // onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Group>

          <ActionIcon variant="subtle" size="md" color="gray" aria-label="Filter">
            <IconFilter size={20} color="#868e96"/>
          </ActionIcon>
          <Divider orientation="vertical" />
          <ActionIcon variant="subtle" size="md" color="gray" aria-label="Scroll to top" onClick={scrollToTop}>
            <IconArrowBigUp size={20} color="#868e96"/>
          </ActionIcon>
          <ActionIcon variant="subtle" size="md" color="gray" aria-label="Scroll to bottom" onClick={scrollToBottom}>
            <IconArrowBigDown size={20} color="#868e96"/>
          </ActionIcon>
        </Flex>
      </Flex>
      
      {submissions?.submissions.length === 0 ? (
        <NoSubmissionsList />
      ) : (
        <Paper withBorder>
          <ScrollArea viewportRef={viewPort} h={870} miw={800}  className="no-scroll-padding">
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
              <Table.Thead className='bg-gray-100'>
                <Table.Tr>
                  <Table.Th>No.</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
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
                    <Table.Td 
                      onClick={() =>
                        router.push(`/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/questions/${question_id}/sub-questions/${sub_question_id}/lists/${submission.submission_id}`)
                      }
                      className="hover:underline hover:text-blue-500 hover:cursor-pointer"
                    >
                      {submission.user_name?.first_name ? (
                        `${submission.user_name.first_name}${submission.user_name.last_name ? ` ${submission.user_name.last_name}` : ''}`
                      ) : (
                        <Text size="sm" c="gray" fs="italic">Not assigned student to this submission</Text>
                      )}
                    </Table.Td>
                    <Table.Td>{submission.user_name?.email || null}</Table.Td>
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
              <Table.Caption mt={0} className="border-t border-gray-200">
                <Flex justify="end" align="center" p="md">
                  <Text size="sm" c="dimmed">
                    Total Submissions: {submissions?.submissions.length}
                  </Text>                 
                </Flex>
              </Table.Caption>
            </Table>
          </ScrollArea>
        </Paper>
      )}
    </Flex>
  );
}