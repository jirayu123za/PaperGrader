"use client";

import React, { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useFetchSubmissionFiles } from "@/hooks/ManageScan/useFetchSubmissionFiles";
import {Flex,Loader,Pagination,Paper,Table,Text, Title,} from "@mantine/core";
import { FaRegFilePdf } from "react-icons/fa";
import { useSubmissionFilesStore } from "@/store/ManageScan/useSubmissionFiles";
import { usePagination, useViewportSize } from "@mantine/hooks";
import { DeleteSubmission } from "./DeleteSubmission";

type Props = {
  assignment_id: string;
};

export const SubmissionsListTable: React.FC<Props> = ({ assignment_id }) => {
  const { isLoading: isLoadingSubmissions } = useFetchSubmissionFiles(
    assignment_id as string
  );
  const { submissionsList } = useSubmissionFilesStore();

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY [at] hh:mm A");
  };

  const { height: viewportH } = useViewportSize();
  const totalItems = submissionsList?.length ?? 0;
    
  const rowsPerPage = useMemo(() => {
    if (viewportH < 700) return 4;
    if (viewportH < 900) return 6;
    return 10;
  }, [viewportH]);

  const totalPages = useMemo(() => {
    return totalItems > 0 ? Math.ceil(totalItems / rowsPerPage) : 1;
  }, [totalItems, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });

  useEffect(() => {
    if (pagination.active > totalPages) {
      pagination.setPage(totalPages);
    }
  }, [totalPages, pagination.active]);

  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedSubmissionsTable = submissionsList?.slice(startIndex, endIndex) ?? [];

  if (!isLoadingSubmissions && totalItems === 0) {
    return null;
  }

  return (
      <Paper withBorder mb="md"
        style={{
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Table verticalSpacing="xs" horizontalSpacing="lg" highlightOnHover style={{ flex: 1, overflowY: "auto" }}>
          <Table.Thead className="bg-gray-100 h-14">
            <Table.Tr>
              <Table.Th w="30%">
                <Title order={6} lineClamp={1}>File</Title>
              </Table.Th>
              <Table.Th w="25%">
                <Title order={6} lineClamp={1}>Date</Title>
              </Table.Th>
              <Table.Th w="15%" ta="center">
                <Title order={6} lineClamp={1}>Total submissions</Title>
              </Table.Th>
              <Table.Th w="15%" ta="center">
                <Title order={6} lineClamp={1}>Submitted by</Title>
              </Table.Th>
              <Table.Th w="15%" ta="center"></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoadingSubmissions ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Flex justify="center" align="center" py="42px">
                    <Loader size="md" color="blue" type="bars" />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedSubmissionsTable.map((submissions, idx) => (
                <Table.Tr
                  key={submissions.submission_id}
                >
                  <Table.Td>
                    <Flex align="center" gap={4}>
                      <FaRegFilePdf size={18} color="red" />
                      <Text c="blue" size="sm" lineClamp={1}>
                        {submissions.file_name}
                      </Text>
                    </Flex>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1}>{formatDate(submissions.submitted_at)}</Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Text size="sm" lineClamp={1}>{submissions.total_submissions}</Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Text size="sm" lineClamp={1}>{submissions.submitted_by}</Text>
                  </Table.Td>
                  <Table.Td ta="center">
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
                    size="sm"
                    value={pagination.active}
                    onChange={pagination.setPage}
                    gap={2}
                  />
                </Flex>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Paper>
  );
};
