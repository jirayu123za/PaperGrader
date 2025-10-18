"use client";

import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import dayjs from "dayjs";
import { useFetchSubmissionFiles } from "@/hooks/ManageScan/useFetchSubmissionFiles";
import {Flex,Loader,Pagination,Paper,Table,Text,} from "@mantine/core";
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

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const theadRef = useRef<HTMLTableSectionElement | null>(null);
  const tfootRef = useRef<HTMLTableSectionElement | null>(null);
  const sampleRowRef = useRef<HTMLTableRowElement | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState<number>(8);

  useLayoutEffect(() => {

    const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
    const bottomPadding = 12;
    const availableViewport = Math.max(0, viewportH - sectionTop - bottomPadding);
    const theadH = theadRef.current?.getBoundingClientRect().height ?? 0;
    const tfootH = tfootRef.current?.getBoundingClientRect().height ?? 0;


    const fallbackRowH = 48;
    const rowH =
      sampleRowRef.current?.getBoundingClientRect().height ?? fallbackRowH;

    const dividerH = 1;
    const paperVerticalPadding = 50;
    const availableForRows =
      availableViewport - theadH - tfootH - dividerH - paperVerticalPadding;

    const fit = Math.max(1, Math.floor(availableForRows / rowH));
    setRowsPerPage(fit);
  }, [viewportH, submissionsList?.length]);



  const totalItems = submissionsList?.length ?? 0;
  const totalPages = useMemo(() => {
    return totalItems > 0 ? Math.ceil(totalItems / rowsPerPage) : 1;
  }, [totalItems, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });

  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedSubmissionsTable =
    submissionsList?.slice(startIndex, endIndex) ?? [];

  if (!isLoadingSubmissions && totalItems === 0) {
    return null;
  }

  return (
    <div ref={sectionRef}>
      <Paper withBorder mb="md" style={{ overflow: "hidden" }}>
        <Table verticalSpacing="xs" horizontalSpacing="lg" highlightOnHover>
          <Table.Thead className="bg-gray-100 h-14" ref={theadRef}>
            <Table.Tr>
              <Table.Th w="250px">File</Table.Th>
              <Table.Th w="350px">Date</Table.Th>
              <Table.Th w="240px">Total submissions</Table.Th>
              <Table.Th w="180px">Submitted by</Table.Th>
              <Table.Th w="60px"></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoadingSubmissions ? (
              <Table.Tr ref={sampleRowRef}>
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
                  ref={idx === 0 ? sampleRowRef : undefined}
                >
                  <Table.Td>
                    <Flex align="center" gap={4}>
                      <FaRegFilePdf size={18} color="red" />
                      <Text c="blue" size="sm">
                        {submissions.file_name}
                      </Text>
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

          <Table.Tfoot ref={tfootRef}>
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
    </div>
  );
};
