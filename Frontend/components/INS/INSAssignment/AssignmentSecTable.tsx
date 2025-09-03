'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Badge, Button, Checkbox, Flex, Loader, Menu, Progress, SegmentedControl, Table, Text, Tooltip, } from '@mantine/core';
import { useAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useAssignmentSectionStore } from '@/store/table/useAssignmentsListStore';
import { useModalAssignmentTimeSettingStore } from '@/store/modal/useAssignmentTimeSettingModal';
import { TimeSetting } from '@/components/Customize/TimeSetting';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Bangkok');

type Section = {
  assignment_section_id: string;
  section_id: string;
  section_name: string;
  published: boolean;
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
  const { openModal } = useModalAssignmentTimeSettingStore();
  const { addAssignmentSectionIDs, removeAssignmentSectionIDs, removeAssignmentID, setAssignmentID, selectedAssignmentSectionIDs } = useAssignmentSectionStore();
  const { selectedSectionIDs, setSectionIDs } = useAssignmentSettingStore();
  const [ isLoading, setIsLoading ] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Helper checks
  const allAssignmentSectionIDs = React.useMemo(() => assignment.assignment_sections.map(s => s.assignment_section_id), [assignment.assignment_sections]);
  const allPlainSectionIDs = React.useMemo(() => assignment.assignment_sections.map(s => s.section_id), [assignment.assignment_sections]);
  const allSelected = allAssignmentSectionIDs.length > 0 && allAssignmentSectionIDs.every(id => selectedAssignmentSectionIDs.includes(id));
  const someSelected = selectedAssignmentSectionIDs.length > 0 && !allSelected;

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      addAssignmentSectionIDs(allAssignmentSectionIDs);
      setSectionIDs(Array.from(new Set([...selectedSectionIDs, ...allPlainSectionIDs])));
      setAssignmentID(assignment.assignment_id);
    } else {
      removeAssignmentSectionIDs(allAssignmentSectionIDs);
      const toRemove = new Set(allPlainSectionIDs);
      setSectionIDs(selectedSectionIDs.filter(id => !toRemove.has(id)));
      removeAssignmentID(assignment.assignment_id);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="md">
        <Loader />
      </Flex>
    );
  }

  return (
    <Table.ScrollContainer minWidth="100%" maxHeight="225px" className="no-scroll-padding">
      <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="xl">
        <Table.Thead className="bg-gray-100 h-14 whitespace-nowrap">
          <Table.Tr>
            <Table.Th w={50} ta="center">
              <Checkbox
                aria-label="Select all assignment sections"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(e) => handleToggleAll(e.currentTarget.checked)}
              />
            </Table.Th>
            <Table.Th w={100} ta="center">Sections</Table.Th>
            <Table.Th w={240} ta="center">Release date</Table.Th>
            <Table.Th w={240} ta="center">Due date</Table.Th>
            <Table.Th w={340} ta="center">Time remaining</Table.Th>
            <Table.Th w={200} ta="center">Published</Table.Th>
            <Table.Th w={100} ta="center">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {assignment.assignment_sections.map((section) => {
            const progress = calculateProgress(section.release_date, section.due_date);
            const isChecked = selectedAssignmentSectionIDs.includes(section.assignment_section_id);
            const isFullPublished = section.published ? 'Grade visible to students' : 'Grade hidden from students';

            return (
              <Table.Tr
                key={section.assignment_section_id}
                className={`transition hover:bg-gray-100 ${isChecked ? 'bg-blue-100' : 'bg-gray-50'}`}
              >
                <Table.Td>
                  <Checkbox
                    aria-label="Select assignment section"
                    checked={isChecked}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      const sectionID = section.section_id;
                      if (checked) {
                        addAssignmentSectionIDs([section.assignment_section_id]);
                      } else {
                        removeAssignmentSectionIDs([section.assignment_section_id]);
                      }
                      const updatedSectionIDs = checked ? [...selectedSectionIDs, sectionID] : selectedSectionIDs.filter((id) => id !== sectionID);
                      setSectionIDs(Array.from(new Set(updatedSectionIDs)));
                      const allIDs = allAssignmentSectionIDs;
                      const updated = checked ? [...selectedAssignmentSectionIDs, section.assignment_section_id] : selectedAssignmentSectionIDs.filter((id) => id !== section.assignment_section_id);
                      const isAllSelected = allIDs.every((id) => updated.includes(id));
                      if (isAllSelected) setAssignmentID(assignment.assignment_id);
                      else removeAssignmentID(assignment.assignment_id);
                    }}
                  />
                </Table.Td>

                <Table.Td ta="center">{section.section_name}</Table.Td>
                <Table.Td ta="center" className="whitespace-nowrap">
                  <Text size="sm" style={{ whiteSpace: 'nowrap' }}
                    title={section.release_date ? dayjs(section.release_date).format('MMM D, YYYY h:mm A') : 'N/A'}>
                    {section.release_date ? dayjs(section.release_date).format('MMM D, YYYY h:mm A') : 'N/A'}
                  </Text>
                </Table.Td>

                <Table.Td ta="center" className="whitespace-nowrap">
                  <Text size="sm" style={{ whiteSpace: 'nowrap' }}
                    title={section.due_date ? dayjs(section.due_date).format('MMM D, YYYY h:mm A') : 'N/A'}>
                    {section.due_date ? dayjs(section.due_date).format('MMM D, YYYY h:mm A') : 'N/A'}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Progress mt="md" size="md" color={getProgressColor(section.release_date, section.due_date)} value={progress} />
                  <Text size="xs" mt="2px" ta="center">
                    {getRemainingTimeText(section.due_date)}
                  </Text>
                </Table.Td>

                <Table.Td ta="center">
                  <SegmentedControl
                    size="xs"
                    value={section.published ? 'public' : 'private'}
                    data={[
                      { label: 'Public', value: "public" },
                      { label: 'Private', value: "private" },
                    ]}
                  />

                  <Flex justify="center" mt="xs">
                    <Tooltip label={isFullPublished} withArrow openDelay={200} position="top">
                      <Badge
                        color={section.published ? 'green' : 'gray'}
                        variant="light"
                        title={isFullPublished}
                        style={{ cursor: 'help' }}
                      >
                        {isFullPublished}
                      </Badge>
                    </Tooltip>
                  </Flex>
                </Table.Td>

                <Table.Td w={180} ta="center">
                  <Menu shadow="md">
                    <Menu.Target>
                      <Button variant="transparent">•••</Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => openModal(assignment.assignment_id)}>
                        Settings
                      </Menu.Item>
                      <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <TimeSetting />
    </Table.ScrollContainer>
  );
};

function calculateProgress(release: string | null, due: string | null): number {
  if (!release || !due) return 0;
  const now = dayjs().tz('Asia/Bangkok');
  const releaseTime = dayjs(release).tz('Asia/Bangkok');
  const dueTime = dayjs(due).tz('Asia/Bangkok');
  const total = dueTime.diff(releaseTime);
  const remaining = dueTime.diff(now);
  if (now.isBefore(releaseTime)) return 100;
  if (now.isAfter(dueTime)) return 0;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

const getProgressColor = (releaseDate: string | null, dueDate: string | null): string => {
  const remainingPercentage = calculateProgress(releaseDate, dueDate);
  if (remainingPercentage > 70) return 'green';
  if (remainingPercentage > 40) return 'orange';
  return 'red';
};

function getRemainingTimeText(due: string | null): string {
  if (!due) return 'N/A';
  const now = dayjs().tz('Asia/Bangkok');
  const dueTime = dayjs(due).tz('Asia/Bangkok');
  const duration = dueTime.diff(now, 'minute');
  if (now.isAfter(dueTime)) return 'Past Due';
  const days = Math.floor(duration / (60 * 24));
  const hours = Math.floor((duration % (60 * 24)) / 60);
  const minutes = duration % 60;
  return [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ') || 'Less than a minute';
}

export default AssignmentSecTable;
