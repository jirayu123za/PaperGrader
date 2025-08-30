'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Badge, Button, Checkbox, Flex, Loader, Menu, Progress, SegmentedControl, Table, Text, Tooltip, } from '@mantine/core';
import { useAssignmentSettingStore, useModalAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useAssignmentSectionStore } from '@/store/table/useAssignmentsListStore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Bangkok');

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
  const { openModal } = useModalAssignmentSettingStore();
  const {
    addAssignmentSectionIDs,
    removeAssignmentSectionIDs,
    removeAssignmentID,
    setAssignmentID,
    selectedAssignmentSectionIDs,
  } = useAssignmentSectionStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const { selectedSectionIDs, setSectionIDs } = useAssignmentSettingStore();


  const [publicState, setPublicState] = React.useState<Record<string, 'public' | 'private'>>(() => {
    const now = dayjs().tz('Asia/Bangkok');
    const map: Record<string, 'public' | 'private'> = {};
    assignment.assignment_sections.forEach((s) => {
      const released = s.release_date ? dayjs(s.release_date).tz('Asia/Bangkok').isBefore(now) : false;
      map[s.assignment_section_id] = released ? 'public' : 'private';
    });
    return map;
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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
            <Table.Th w={50}></Table.Th>
            <Table.Th w={100} ta="center">Sections</Table.Th>
            <Table.Th w={240} ta="center">Release date</Table.Th>
            <Table.Th w={240} ta="center">Due date</Table.Th>
            <Table.Th w={340} ta="center">Time Remaining</Table.Th>
            <Table.Th w={200} ta="center">Public Grade</Table.Th>
            <Table.Th w={100} ta="center">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {assignment.assignment_sections.map((section) => {
            const progress = calculateProgress(section.release_date, section.due_date);
            const isChecked = selectedAssignmentSectionIDs.includes(section.assignment_section_id);
            const pubVal = publicState[section.assignment_section_id] ?? 'private';


            const descFull =
              pubVal === 'public'
                ? 'Grade visible to students'
                : 'Grade hidden from students';

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

                      const updatedSectionIDs = checked
                        ? [...selectedSectionIDs, sectionID]
                        : selectedSectionIDs.filter((id) => id !== sectionID);
                      setSectionIDs(Array.from(new Set(updatedSectionIDs)));

                      const allSectionIDs = assignment.assignment_sections.map((s) => s.assignment_section_id);
                      const updated = checked
                        ? [...selectedAssignmentSectionIDs, section.assignment_section_id]
                        : selectedAssignmentSectionIDs.filter((id) => id !== section.assignment_section_id);
                      const isAllSelected = allSectionIDs.every((id) => updated.includes(id));
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
                  <Progress size="md" color={getProgressColor(section.release_date, section.due_date)} value={progress} />
                  <Text size="xs" mt="2px" ta="center">
                    {getRemainingTimeText(section.due_date)}
                  </Text>
                </Table.Td>

                <Table.Td ta="center">
                  <SegmentedControl
                    size="xs"
                    value={pubVal}
                    onChange={(val) =>
                      setPublicState((prev) => ({
                        ...prev,
                        [section.assignment_section_id]: (val as 'public' | 'private') ?? 'private',
                      }))
                    }
                    data={[
                      { label: 'Public', value: 'public' },
                      { label: 'Private', value: 'private' },
                    ]}
                  />

                  <div style={{ marginTop: 6 }}>
                    <Tooltip label={descFull} withArrow openDelay={200} position="top">
                      <Badge
                        color={pubVal === 'public' ? 'green' : 'gray'}
                        variant="light"

                        title={descFull}
                        style={{ cursor: 'help' }}
                      >
                        {descFull}
                      </Badge>
                    </Tooltip>
                  </div>
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
