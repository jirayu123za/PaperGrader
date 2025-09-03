"use client";

import React from 'react';
import { Table, TextInput, Flex, Text, Paper, Pagination, Select, ActionIcon, Skeleton } from '@mantine/core';
import { useRouter, useParams } from 'next/navigation';
import { useFetchSubmissions } from '@/hooks/useFetchINS_Submission';
import { useINS_SubmissionStore } from '@/store/useINS_SubmissionStore';
import { usePagination } from '@mantine/hooks';
import { IoListOutline, IoSearch } from 'react-icons/io5';
import { FaRegFilePdf } from 'react-icons/fa';
import { NoSubmissionsPlaceholder } from './NoSubmissionsPlaceholder ';

export const INSSubmissions = () => {
  const router = useRouter();
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const icons = {
    submissionsList: <IoListOutline />,
    searchIcon: <IoSearch />,
    submissionFile: <FaRegFilePdf color='red'/>
  };

  // Need implement submissionFilter, setSubmissionFilter
  const { submissions, searchTerm, setSearchTerm } = useINS_SubmissionStore();
  const { isLoading, error } = useFetchSubmissions(course_id as string, assignment_id as string);

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = searchTerm
      ? submission.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.section_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    // const matchesSubmission -> Need implement
    return matchesSearch;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredSubmissions.length / pageSize);
  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });
  const paginatedData = filteredSubmissions.slice(
    (pagination.active - 1) * pageSize,
    pagination.active * pageSize
  );

  const handleViewPDF = (submission_id: string) => {
    router.push(
      `/instructor/course/${course_id}/process/${assignment_id}/grade-submissions/${submission_id}`
    );
  };

  if (submissions.length === 0 && !isLoading) {
    return (
      <Flex direction="column" gap="sm" p="md">
        <NoSubmissionsPlaceholder />
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex direction="column" gap="sm" p="md">
        <Flex direction="column">
          <Text size="lg" fw={500}>
            Submissions list
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            View and manage all student submissions for this assignment.
          </Text>
        </Flex>

        <Paper withBorder>
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead className="bg-gray-100">
              <Table.Tr>
                <Table.Th>Student ID</Table.Th>
                <Table.Th w="25%">Name</Table.Th>
                <Table.Th>Section</Table.Th>
                <Table.Th>Submitted at</Table.Th>
                <Table.Th>View</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <Table.Tr key={i}>
                  <Table.Td>
                    <Skeleton height={16} width="80%" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width="90%" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width="60%" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width="70%" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={24} circle />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="sm" p="md">
      <Flex direction="column">
        <Text size="lg" fw={500}>
          Submissions list
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          View and manage all student submissions for this assignment.
        </Text>
      </Flex>

      <Paper withBorder>
        {/* <Flex align="center" gap="xs" mb="md">
          <TextInput
            placeholder="Search by Student Code, Name, or Section"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            disabled={submissions.length === 0 || isLoading }
            rightSection={icons.searchIcon}
            w="25%"
          />
          <Select
            placeholder="Filter by submitted"
            data={[
              { value: 'NOT_SUBMITTED', label: 'Not submitted' },
            ]}
            // value={roleFilter}
            // onChange={setRoleFilter}
            clearable
            disabled={submissions.length === 0 || isLoading }
          />        
        </Flex> */}
        <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
          <Table.Thead className='bg-gray-100'>
            <Table.Tr>
              <Table.Th>Student ID</Table.Th>
              <Table.Th w="25%">Name</Table.Th>
              <Table.Th>Section</Table.Th>
              <Table.Th>Submitted at</Table.Th>
              <Table.Th>View</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.map((submission) => (
              <Table.Tr key={submission.submission_id}>
                <Table.Td>
                  {submission.student_code === "" ? (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  ) : (
                    submission.student_code
                  )}
                </Table.Td>
                <Table.Td>
                  {submission.full_name === "" ? (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  ) : (
                    submission.full_name
                  )}
                </Table.Td>

                <Table.Td pl={24}>
                  {submission.section_name === "" ? (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  ) : (
                    submission.section_name
                  )}
                </Table.Td>
                <Table.Td>{new Date(submission.submitted_at).toLocaleString()}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="transparent"
                    aria-label="view PDF" 
                    onClick={() => 
                      handleViewPDF(submission.submission_id)
                    }>
                    {icons.submissionFile}
                  </ActionIcon>               
                </Table.Td>
              </Table.Tr>
            ))}
            {filteredSubmissions.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                  <Text c="dimmed">No submissions yet</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>

          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={7} className="border-t border-gray-300">
                <Flex align="center" w="100%" justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total submissions: {`${submissions.length} submissions`}
                  </Text>
                  <Pagination
                    total={totalPages}
                    siblings={1}
                    boundaries={1}
                    value={pagination.active}
                    onChange={pagination.setPage}
                    size="sm"
                    gap="2px"
                    color='#4C6EF5'
                  />
                </Flex>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>     
      </Paper>
    </Flex>
  );
};
