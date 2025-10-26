'use client';

import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import ExportModal from '@/components/INS/INSDataExport/ExportModal';
import { RingProgressReady } from "@/components/INS/INSDataExport/RingProgressReady";
import { RingProgressProcess } from "@/components/INS/INSDataExport/RingProgressProcess";
import { RingProgressExpired } from "@/components/INS/INSDataExport/RingProgressExpired";
import { Button, Table, Text, ActionIcon, Flex, Title, Checkbox, Paper, Pagination } from '@mantine/core';
import { IconTrash, IconDownload } from '@tabler/icons-react';
import { FaFileExport } from "react-icons/fa6";
import { usePagination, useViewportSize } from '@mantine/hooks';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import { useParams } from 'next/navigation';
import { useFetchLatestExport } from '@/hooks/ExportGrade/useExportGrades';
import { useExportGradeStore } from '@/store/ExportGrade/useExportGradeStore';

export default function ExportHistory() {
  const params = useParams();
  const course_id = params.course_id as string;
  const openModal = useExportModalStore((s) => s.openModal);
  const { data, isLoading, error } = useFetchLatestExport(course_id);
  const exportList = useExportGradeStore((s) => s.exportList);
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = exportList.length > 0 && selected.length === exportList.length;
  const indeterminate = selected.length > 0 && selected.length < exportList.length;
  const toggleAll = () => setSelected(allSelected ? [] : exportList.map((i) => i.export_grade_id));
  const toggleRow = (id: string) =>
    setSelected((current) => current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
  );
  const { height: viewportH } = useViewportSize();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);   
  const theadRef = useRef<HTMLTableSectionElement | null>(null);
  const tfootRef = useRef<HTMLTableSectionElement | null>(null);
  const sampleRowRef = useRef<HTMLTableRowElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  useLayoutEffect(() => {
    const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
    const bottomPadding = 12;
    const availableViewport = Math.max(0, viewportH - sectionTop - bottomPadding);
    const headerH = headerRef.current?.getBoundingClientRect().height ?? 0;
    const theadH = theadRef.current?.getBoundingClientRect().height ?? 0;
    const tfootH = tfootRef.current?.getBoundingClientRect().height ?? 0;
    const rowH   = sampleRowRef.current?.getBoundingClientRect().height ?? 48;
    const dividerH = 1;
    const paperVerticalPadding = 50; 
    const availableForRows = availableViewport - headerH - dividerH - theadH - tfootH - paperVerticalPadding;
    const fit = Math.max(1, Math.floor(availableForRows / rowH));
    setRowsPerPage(fit);
  }, [viewportH, exportList.length]);

  const totalPages = useMemo(() => {
    return exportList ? Math.ceil(exportList.length / rowsPerPage) : 1;
  }, [exportList, rowsPerPage]);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });

  const startIndex = (pagination.active - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedExportTable = exportList.slice(startIndex, endIndex);

  return (
    <div className="pl-5 pr-5">
      <div ref={sectionRef}>

        <div ref={headerRef} className="flex justify-between items-center mb-6">
          <Title order={2}>Export History</Title>
          <Button
            onClick={() => openModal(course_id)}
            color="#4C6EF5"
            leftSection={<FaFileExport />}
          >
            Export
          </Button>
        </div>

        <Paper withBorder mb="md" style={{ overflow: 'hidden' }}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead className="bg-gray-100" ref={theadRef}>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={toggleAll}
                  />
                </Table.Th>
                <Table.Th>File name</Table.Th>
                <Table.Th>Export at</Table.Th>
                <Table.Th>Export status</Table.Th>
                <Table.Th>Export by</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {exportList.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text c="dimmed">No export history available.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedExportTable.map((item, idx) => (
                  <Table.Tr key={item.export_grade_id} ref={idx === 0 ? sampleRowRef : undefined}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.includes(item.export_grade_id)}
                        onChange={() => toggleRow(item.export_grade_id)}
                      />
                    </Table.Td>
                    <Table.Td>{item.file_name}</Table.Td>
                    <Table.Td>{item.processed_at}</Table.Td>
                    <Table.Td style={{ paddingLeft: 38 }}>
                      {item.file_status === 'pending' && <RingProgressProcess />}
                      {item.file_status === 'completed' && <RingProgressReady />}
                      {item.file_status === 'failed' && <RingProgressExpired />}
                    </Table.Td>
                    <Table.Td>{item.requested_by}</Table.Td>
                    <Table.Td>
                      <Flex align="center" gap="xs">
                        {item.file_status === 'completed' && item.file_url && (
                          <ActionIcon
                            component="a"
                            variant="transparent"
                            href={item.file_url}
                            target="_blank"
                            size="sm"
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          variant="transparent"
                          color="red"
                          size="sm"
                          disabled={item.file_status !== 'completed'}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>

            <Table.Tfoot ref={tfootRef}>
              <Table.Tr>
                <Table.Td colSpan={7} className="border-t border-gray-300">
                  <Flex align="center" w="100%" justify="space-between">
                    <Text size="sm" c="dimmed">
                      Total files: {exportList.length}
                    </Text>
                    <Pagination
                      total={totalPages}
                      siblings={1}
                      boundaries={1}
                      value={pagination.active}
                      onChange={pagination.setPage}
                      gap="2px"
                      size="sm"
                      color="#4C6EF5"
                    />
                  </Flex>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Paper>
      </div>

      <ExportModal />
    </div>
  );
}
