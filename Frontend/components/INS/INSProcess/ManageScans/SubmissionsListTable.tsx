"use client";

import React from "react";
import dayjs from 'dayjs';
import { useFetchSubmissionFiles } from "@/hooks/ManageScan/useFetchSubmissionFiles";
import { Flex, Image, Loader, Pagination, Paper, Table, Text } from "@mantine/core";
import { FaRegFilePdf } from "react-icons/fa";
import { useSubmissionFilesStore } from "@/store/ManageScan/useSubmissionFiles";
import { usePagination } from "@mantine/hooks";
import { DeleteSubmission } from "./DeleteSubmission";

type Props = {
  assignment_id: string;
};

export const SubmissionsListTable: React.FC<Props> = ({ assignment_id }) => {
  const { isLoading: isLoadingSubmissions, isError: isErrorSubmissions } = useFetchSubmissionFiles(assignment_id as string);
  const { submissionsList } = useSubmissionFilesStore();
  
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY [at] hh:mm A');
  };
  const pageSize = 8;
  const totalPages = submissionsList ? Math.ceil(submissionsList.length / pageSize) : 1;
  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });
  const startIndex = (pagination.active - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSubmissionsTable = submissionsList.slice(startIndex, endIndex);

  if (!isLoadingSubmissions && submissionsList.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" gap="sm" py="xl" w='100%'>
        <Image
          src="/Image/table/no_data.svg"
          alt="No submissions found"
          w="auto"
          h={150}
          fit="contain"
          fallbackSrc="https://placehold.co/200x200?text=Placeholder"
        />
        <Text size="lg" fw={500} mt="md">
          No submissions found
        </Text>
        <Text size="sm" c="dimmed">
          You haven’t uploaded any submissions yet.
        </Text>
      </Flex>
    );
  }

  return (
    <Paper withBorder h="100%">
      <Table.ScrollContainer minWidth="100%" maxHeight="495px" className='no-scroll-padding'>
        <Table verticalSpacing="xs" horizontalSpacing="lg" highlightOnHover>
          <Table.Thead className='bg-gray-100 h-14'>
            <Table.Tr>
              <Table.Th w='250px'>File</Table.Th>
              <Table.Th w='350px'>Date</Table.Th>
              <Table.Th w='240px'>Total submissions</Table.Th>
              <Table.Th w='180px'>Submitted by</Table.Th>
              <Table.Th w='60px'></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoadingSubmissions ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Flex justify="center" align="center" py="42px">
                    <Loader size="md" color="blue" type="bars"/>                                
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedSubmissionsTable.map((submissions) => (
                <Table.Tr key={submissions.submission_id}>
                  <Table.Td>
                    <Flex align="center" gap={4}>
                      <FaRegFilePdf size={18} color="red"/>
                      <Text c='blue' size="sm">{submissions.file_name}</Text>                                    
                    </Flex>
                  </Table.Td>
                  <Table.Td>{formatDate(submissions.submitted_at)}</Table.Td>
                  <Table.Td>{submissions.total_submissions}</Table.Td>
                  <Table.Td>{submissions.submitted_by}</Table.Td>
                  <Table.Td>
                    <DeleteSubmission 
                      assignment_id={assignment_id} 
                      submission_id={submissions.submission_id} 
                      submission_name={submissions.file_name}
                    />
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>

          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={5} className="border-t border-gray-300">
                <Flex justify="end">
                  <Pagination
                    total={totalPages}
                    siblings={1}
                    boundaries={1}
                    size={'sm'}
                    value={pagination.active}
                    onChange={pagination.setPage}
                    gap={2}
                  />
                </Flex>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  )

};
