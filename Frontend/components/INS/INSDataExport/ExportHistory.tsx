'use client';

import React, { useState } from 'react';
import {Button,Divider,Table,ThemeIcon,Text,ActionIcon,Flex,Title,Checkbox,} from '@mantine/core';
import { IconTrash, IconDownload } from '@tabler/icons-react';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import ExportModal from '@/components/INS/INSDataExport/ExportModal';

// Mock data
interface HistoryItem {
  id: string;
  fileName: string;
  exportedAt: string; // ISO date
  status: 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
}
const mockHistory: HistoryItem[] = [
  { id: '1', fileName: 'export-2025-07-01.csv', exportedAt: '2025-07-01T14:30:00Z', status: 'ready', downloadUrl: '/downloads/export-2025-07-01.csv' },
  { id: '2', fileName: 'export-2025-07-02.csv', exportedAt: '2025-07-02T09:15:00Z', status: 'processing' },
  { id: '3', fileName: 'export-2025-07-03.pdf', exportedAt: '2025-07-03T11:45:00Z', status: 'failed' },
  { id: '4', fileName: 'export-2025-07-04.csv', exportedAt: '2025-07-04T08:05:00Z', status: 'ready', downloadUrl: '/downloads/export-2025-07-04.csv' },
  { id: '5', fileName: 'export-2025-07-05.pdf', exportedAt: '2025-07-05T16:20:00Z', status: 'ready', downloadUrl: '/downloads/export-2025-07-05.pdf' },
  { id: '6', fileName: 'export-2025-07-06.csv', exportedAt: '2025-07-06T10:10:00Z', status: 'processing' },
  { id: '7', fileName: 'export-2025-07-07.pdf', exportedAt: '2025-07-07T12:00:00Z', status: 'failed' },
  { id: '8', fileName: 'export-2025-07-08.csv', exportedAt: '2025-07-08T13:30:00Z', status: 'ready', downloadUrl: '/downloads/export-2025-07-08.csv' },
  { id: '9', fileName: 'export-2025-07-09.pdf', exportedAt: '2025-07-09T15:45:00Z', status: 'processing' },
  { id: '10', fileName: 'export-2025-07-10.csv', exportedAt: '2025-07-10T09:00:00Z', status: 'ready', downloadUrl: '/downloads/export-2025-07-10.csv' },
];

export default function ExportHistory() {
  const openModal = useExportModalStore((s) => s.openModal);
  const course_id = useExportModalStore((s) => s.course_id);
  const data = mockHistory;

  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = data.length > 0 && selected.length === data.length;
  const indeterminate = selected.length > 0 && selected.length < data.length;
  const toggleAll = () => setSelected(allSelected ? [] : data.map((i) => i.id));
  const toggleRow = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title order={2}>Export History</Title>
        <Button onClick={() => openModal(() => {}, course_id!)} >New Export</Button>
      </div>

      <Divider my="sm" />

      {/* Table wrapper with vertical scroll only */}
      <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
        <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Checkbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onChange={toggleAll}
                />
              </Table.Th>
              <Table.Th>#</Table.Th>
              <Table.Th>Date of export</Table.Th>
              <Table.Th>File name</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  <Text color="dimmed">No export history available.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((item, index) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Checkbox
                      checked={selected.includes(item.id)}
                      onChange={() => toggleRow(item.id)}
                    />
                  </Table.Td>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>{new Date(item.exportedAt).toLocaleString()}</Table.Td>
                  <Table.Td>{item.fileName}</Table.Td>
                  <Table.Td>
                    <Flex align="center" gap="xs">
                      <ThemeIcon
                        color={item.status === 'ready' ? 'green' : 'red'}
                        size="sm"
                        radius="xl"
                      />
                      <Text size="sm">
                        {item.status === 'ready' ? 'Ready' : 'Not ready'}
                      </Text>
                    </Flex>
                  </Table.Td>
                  <Table.Td>
                    <Flex align="center" gap="xs">
                      {item.status === 'ready' && item.downloadUrl && (
                        <ActionIcon component="a" href={item.downloadUrl} target="_blank" size="sm">
                          <IconDownload size={16} />
                        </ActionIcon>
                      )}
                      <ActionIcon color="red" size="sm" disabled={item.status !== 'ready'}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      {/* Mount modal at the end */}
      <ExportModal />
    </div>
  );
}
