'use client';

import React, { useState } from 'react';
import ExportModal from '@/components/INS/INSDataExport/ExportModal';
import { Button, Divider, Table, Text, ActionIcon, Flex, Title, Checkbox, Paper, Pagination } from '@mantine/core';
import { IconTrash, IconDownload } from '@tabler/icons-react';
import { FaFileExport } from "react-icons/fa6";
import { usePagination } from '@mantine/hooks';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import { useParams } from 'next/navigation';

interface HistoryItem {
  id: string;
  fileName: string;
  exportedAt: string; 
  exportedBy: string;
  status: 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
}

const mockHistory: HistoryItem[] = [
  { id: '1', fileName: 'export-2025-07-01.csv', exportedAt: '2025-07-01T14:30:00Z', exportedBy: 'Shweta Betgeri', status: 'ready', downloadUrl: '/downloads/export-2025-07-01.csv' },
  { id: '2', fileName: 'export-2025-07-02.csv', exportedAt: '2025-07-02T09:15:00Z', exportedBy: 'Shweta Betgeri', status: 'processing' },
  { id: '3', fileName: 'export-2025-07-03.pdf', exportedAt: '2025-07-03T11:45:00Z', exportedBy: 'jayant jain', status: 'failed' },
  { id: '4', fileName: 'export-2025-07-04.csv', exportedAt: '2025-07-04T08:05:00Z', exportedBy: 'Shweta Betgeri', status: 'ready', downloadUrl: '/downloads/export-2025-07-04.csv' },
  { id: '5', fileName: 'export-2025-07-05.pdf', exportedAt: '2025-07-05T16:20:00Z', exportedBy: 'Shweta Betgeri', status: 'ready', downloadUrl: '/downloads/export-2025-07-05.pdf' },
  { id: '6', fileName: 'export-2025-07-06.csv', exportedAt: '2025-07-06T10:10:00Z', exportedBy: 'jayant jain', status: 'processing' },
  { id: '7', fileName: 'export-2025-07-07.pdf', exportedAt: '2025-07-07T12:00:00Z', exportedBy: 'jayant jain', status: 'failed' },
  { id: '8', fileName: 'export-2025-07-08.csv', exportedAt: '2025-07-08T13:30:00Z', exportedBy: 'Shweta Betgeri', status: 'ready', downloadUrl: '/downloads/export-2025-07-08.csv' },
  { id: '9', fileName: 'export-2025-07-09.pdf', exportedAt: '2025-07-09T15:45:00Z', exportedBy: 'Shweta Betgeri', status: 'processing' },
  { id: '21', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '11', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '12', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '13', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '14', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '15', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '16', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '17', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '18', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
  { id: '19', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', exportedBy: 'jayant jain', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
];

export default function ExportHistory() {
  const params = useParams();
  const course_id = params.course_id as string;
  const openModal = useExportModalStore((s) => s.openModal);
  const data = mockHistory;

  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = data.length > 0 && selected.length === data.length;
  const indeterminate = selected.length > 0 && selected.length < data.length;
  const toggleAll = () => setSelected(allSelected ? [] : data.map((i) => i.id));
  const toggleRow = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
  );

  const pageSize = 10;
  const totalPages = data ? Math.ceil(data.length / pageSize) : 1;
  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });
  const startIndex = (pagination.active - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExportTable = data.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title order={2}>Export History</Title>
        <Button 
          onClick={() => openModal(course_id)} 
          color="#4C6EF5"
          leftSection={<FaFileExport />}
        >
          Export
        </Button>
      </div>

      <Divider my="sm" />

      <Paper withBorder mb="md">
        <Table.ScrollContainer minWidth="100%" className='no-scroll-padding'>
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
                <Table.Th>File name</Table.Th>
                <Table.Th>Export at</Table.Th>
                <Table.Th>Export by</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {data.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text c="dimmed">No export history available.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedExportTable.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onChange={() => toggleRow(item.id)}
                      />
                    </Table.Td>
                    <Table.Td>{item.fileName}</Table.Td>
                    <Table.Td>{new Date(item.exportedAt).toLocaleString()}</Table.Td>
                    <Table.Td>{item.exportedBy}</Table.Td>
                    <Table.Td>
                      <Flex align="center" gap="xs">
                        {item.status === 'ready' && item.downloadUrl && (
                          <ActionIcon component="a" variant="transparent" href={item.downloadUrl} target="_blank" size="sm">
                            <IconDownload size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon variant="transparent" color="red" size="sm" disabled={item.status !== 'ready'}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>

            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={7} className="border-t border-gray-300">
                  <Flex align="center" w="100%" justify="space-between">
                    <Text size="sm" c="dimmed">
                      Total files: {data.length}
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
        </Table.ScrollContainer>
      </Paper>

      <ExportModal />
    </div>
  );
}
