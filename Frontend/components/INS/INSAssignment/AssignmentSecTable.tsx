'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Button, Checkbox, Flex, Loader, Menu, Progress, Table, Text } from '@mantine/core';
import { useSelectSectionStore } from '@/store/useSectionStore';
import { useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useAssignmentSectionStore } from '@/store/table/useAssignmentsListStore';
dayjs.extend(utc);

type Section = {
  assignment_section_id: string;
  section_id: string;
  section_name: string;
  release_date: string | null;
  due_date: string | null;
};

type Props = {
  assignment: {
    assignment_id: string;
    assignment_sections: Section[];
  };
};

const AssignmentSecTable: React.FC<Props> = ({ assignment }) => {
  // const { selectedSections, setSelectedSections } = useSelectSectionStore();
  const { openModal } = useModalAssignmentSettingStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const { addSectionIDs, removeSectionIDs, removeAssignmentID, setAssignmentID, selectedSectionIDs } = useAssignmentSectionStore();
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="md">
        <Loader color="blue" />
      </Flex>
    );
  }

  return (
    <Table.ScrollContainer minWidth="100%" maxHeight='225px' className='no-scroll-padding'>
    <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="xl">
      <Table.Thead className="bg-gray-100 h-14">
        <Table.Tr>
          <Table.Th w={50}></Table.Th>
          <Table.Th w={100} ta="center">SECTIONS</Table.Th>
          <Table.Th w={240} ta="center">RELEASE DATE</Table.Th>
          <Table.Th w={240} ta="center">DUE DATE</Table.Th>
          <Table.Th w={300} ta="center">TIME REMAINING</Table.Th>
          <Table.Th w={100} ta="center">ACTIONS</Table.Th>
        </Table.Tr> 
      </Table.Thead>
      <Table.Tbody>
        {assignment.assignment_sections.map((section) => {
          const progress = calculateProgress(section.release_date, section.due_date);
          const isChecked = selectedSectionIDs.includes(section.assignment_section_id);
          return (
            <Table.Tr key={section.assignment_section_id} className={`transition hover:bg-gray-100 ${isChecked ? 'bg-blue-100' : 'bg-gray-50'}`}>
              <Table.Td>
                <Checkbox 
                  aria-label="Select assignment section"
                  checked={isChecked}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    if (checked) {
                      addSectionIDs([section.assignment_section_id]);
                    } else {
                      removeSectionIDs([section.assignment_section_id]);
                    }
                    const allSectionIDs = assignment.assignment_sections.map(s => s.assignment_section_id);
                    const updated = checked
                      ? [...selectedSectionIDs, section.assignment_section_id]
                      : selectedSectionIDs.filter(id => id !== section.assignment_section_id);
                    const isAllSelected = allSectionIDs.every(id => updated.includes(id));
                    if (isAllSelected) {
                      setAssignmentID(assignment.assignment_id);
                    } else {
                      removeAssignmentID(assignment.assignment_id);
                    }
                  }}
                />
              </Table.Td>
              <Table.Td ta="center">{section.section_name}</Table.Td>
              <Table.Td ta="center">{section.release_date ? dayjs.utc(section.release_date).format('MMM D, YYYY h:mm A') : 'N/A'}</Table.Td>
              <Table.Td ta="center">{section.due_date ? dayjs.utc(section.due_date).format('MMM D, YYYY h:mm A') : 'N/A'}</Table.Td>
              <Table.Td>
                <Progress size="md" color={getProgressColor(section.release_date, section.due_date)} value={progress}></Progress>
                <Text size='xs' mt='2px' ta='center'>{getRemainingTimeText(section.due_date)}</Text>
              </Table.Td>
              <Table.Td w={180} ta="center">
                <Menu shadow="md">
                  <Menu.Target>
                    <Button variant="transparent">•••</Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => openModal(section.assignment_section_id)}>Settings</Menu.Item>
                    <Menu.Item color="red" leftSection={<IconTrash size={14} />}>Delete</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
    </Table.ScrollContainer>
  );
};

function calculateProgress(release: string | null, due: string | null): number {
  const now = dayjs();
  const releaseTime = dayjs.utc(release);
  const dueTime = dayjs.utc(due);
  const total = dueTime.diff(releaseTime);
  const remaining = dueTime.diff(now)
  if (!release || !due) return 0;
  if (now.isBefore(releaseTime)) return 100;
  if (now.isAfter(dueTime)) return 0;;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

const getProgressColor = (releaseDate: string | null, dueDate: string | null): string => {
  const remainingPercentage = calculateProgress(releaseDate, dueDate);
  if (remainingPercentage > 70) return 'green';
  if (remainingPercentage > 40) return 'orange';
  return 'red';
};

function getRemainingTimeText(due: string | null): string {
  const now = dayjs();
  const dueTime = dayjs.utc(due);
  const duration = dueTime.diff(now, 'minute');
  const days = Math.floor(duration / (60 * 24));
  const hours = Math.floor((duration % (60 * 24)) / 60);
  const minutes = duration % 60;
  if (!due) return 'N/A';
  if (now.isAfter(dueTime)) return 'Past Due';
  return [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ') || 'Less than a minute';
}

export default AssignmentSecTable;
