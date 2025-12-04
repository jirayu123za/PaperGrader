'use client';

import { ErrorExportHistory } from '@/components/INS/INSDataExport/ErrorExportHistory';
import { ExportModal } from '@/components/INS/INSDataExport/ExportModal';
import { NoExportHistory } from '@/components/INS/INSDataExport/NoExportHistory';
import { RingProgressExpired } from "@/components/INS/INSDataExport/RingProgressExpired";
import { RingProgressProcess } from "@/components/INS/INSDataExport/RingProgressProcess";
import { RingProgressReady } from "@/components/INS/INSDataExport/RingProgressReady";
import { useFetchLatestExport } from '@/hooks/ExportGrade/useExportGrades';
import { useExportGradeStore } from '@/store/ExportGrade/useExportGradeStore';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import { ActionIcon, Button, Checkbox, Flex, Pagination, Paper, Skeleton, Table, Text, Title, Tooltip } from '@mantine/core';
import { usePagination, useViewportSize } from '@mantine/hooks';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FaFileExport } from "react-icons/fa6";

export default function ExportHistory() {
  const params = useParams();
  const course_id = params.course_id as string;
  const openModal = useExportModalStore((s) => s.openModal);
  const exportList = useExportGradeStore((s) => s.exportList);
  const { isLoading, isError } = useFetchLatestExport(course_id);
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = exportList.length > 0 && selected.length === exportList.length;
  const indeterminate = selected.length > 0 && selected.length < exportList.length;
  const toggleAll = () => setSelected(allSelected ? [] : exportList.map((i) => i.export_grade_id));
  const toggleRow = (id: string) =>
    setSelected((current) => current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
  );

  const { height: viewportH } = useViewportSize();
  const rowsPerPage = useMemo(() => {
    if (viewportH < 700) return 4;
    if (viewportH < 900) return 6;
    return 10;
  }, [viewportH]);

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

  const formatExportDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  const formatFullName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}.`;
  };

  return (
    <div className="pl-5 pr-5">
      <div className="flex justify-between items-center mb-6">
        <Title order={2}>Export History</Title>
        <Button
          onClick={() => openModal(course_id)}
          disabled={isLoading || !!isError}
          color="#4C6EF5"
          leftSection={<FaFileExport />}
        >
          Export
        </Button>
      </div>

      {isLoading ? (
        <Skeleton h={400} />
      ) : isError ? (
        <ErrorExportHistory />
      ) : !exportList || exportList.length === 0 ? (
        <NoExportHistory />
      ) : (
        <Paper withBorder mb="md" style={{ overflow: 'hidden' }}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead className="bg-gray-100">
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={toggleAll}
                  />
                </Table.Th>
                <Table.Th>
                  <Title order={6} lineClamp={1}>File name</Title>
                </Table.Th>
                <Table.Th>
                  <Title order={6} lineClamp={1}>Export at</Title>
                </Table.Th>
                <Table.Th ta="center">
                  <Title order={6} lineClamp={1}>Export status</Title>
                </Table.Th>
                <Table.Th ta="center">
                  <Title order={6} lineClamp={1}>Export by</Title>
                </Table.Th>
                <Table.Th ta="center">
                  <Title order={6} lineClamp={1}>Actions</Title>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {
                paginatedExportTable.map((item) => (
                  <Table.Tr key={item.export_grade_id}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.includes(item.export_grade_id)}
                        onChange={() => toggleRow(item.export_grade_id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size='sm' lineClamp={1}>{item.file_name}</Text>
                    </Table.Td>
                    <Table.Td>
                      {
                        item.processed_at === null && item.file_status === 'pending' ? (
                          <Text size='sm' c='dimmed' fs="italic">This file is being processed</Text>
                        ) : item.processed_at === null && item.file_status === 'failed' ? (
                          <Text size='sm' c='dimmed' fs="italic">This file failed to process</Text>
                        ) : (
                          <Text size='sm' lineClamp={1}>{formatExportDate(item.processed_at ?? null)}</Text>
                        )
                      }
                    </Table.Td>
                    <Table.Td ta="center">
                      {item.file_status === 'pending' && <RingProgressProcess />}
                      {item.file_status === 'completed' && <RingProgressReady />}
                      {item.file_status === 'failed' && <RingProgressExpired />}
                    </Table.Td>
                    <Table.Td style={{cursor: 'help'}} ta="center">
                      <Tooltip label={item.requested_by} withArrow>
                        <Text size='sm' lineClamp={1}>{formatFullName(item.requested_by)}</Text>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>
                      <Flex align="center" gap="xs" justify="center">
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
              }
            </Table.Tbody>

            <Table.Tfoot>
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
      )}
      <ExportModal />
    </div>
  );
}
