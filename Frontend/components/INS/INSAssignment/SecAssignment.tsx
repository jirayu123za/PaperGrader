import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Checkbox, Table, Progress, Text as MantineText, ScrollArea } from '@mantine/core';
import { useSelectSectionStore } from '../../../store/useSectionStore';
import { useAssignmentExpandStore, useSelectedAssignmentStore } from '../../../store/Table/useInsAssignmentTableStore';
import { useInsAssignmentStore } from '../../../store/useAssignmentStore';

const SecAssignment: React.FC = () => {
  dayjs.extend(utc);

  const { setSelectedSections, selectedSections } = useSelectSectionStore();
  const { selectedAssignmentSections } = useSelectedAssignmentStore();
  const insAssignments = useInsAssignmentStore((state) => state.insAssignments);
  const expandedAssignments = useAssignmentExpandStore((state) => state.expandedAssignments);

  const expandedAssignmentsData = insAssignments.filter(
    (assignment) => expandedAssignments[assignment.assignment_id]
  );

  const handleSectionCheckboxChange = (checked: boolean, sectionID: string) => {
    setSelectedSections((prev) => {
      const updatedSections = checked
        ? [...prev, sectionID]
        : prev.filter((id) => id !== sectionID);

      console.log("Updated Sections (inside setter):", updatedSections);
      return updatedSections;
    });
  };

  const allSections = expandedAssignmentsData.flatMap((assignment) => assignment.assignment_sections);

  return (
    <ScrollArea style={{ height: '400px' }}>
      <Table
        striped
        highlightOnHover
        verticalSpacing="md"
        className="bg-white"
        style={{ borderCollapse: 'collapse' }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '10%' }}></Table.Th>
            <Table.Th style={{ width: '10%' }}>SELECT</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>Section Name</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>Release Date</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>Due Date</Table.Th>
            <Table.Th style={{ width: '30%', textAlign: 'center' }}>Time Remaining</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {allSections.map((section, index) => (
            <Table.Tr
              key={section.assignment_section_id}
              style={{
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                color: '#495057',
              }}
            >
              <Table.Td style={{ textAlign: 'center' }}></Table.Td> 
              <Table.Td>
                <Checkbox
                  pl={10}
                  checked={selectedSections.includes(section.section_id)}
                  onChange={(event) =>
                    handleSectionCheckboxChange(event.currentTarget.checked, section.section_id)
                  }
                />
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>{section.section_name}</Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {section.release_date
                  ? dayjs(section.release_date).utc().format('MMM D, YYYY h:mm A')
                  : 'N/A'}
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {section.due_date
                  ? dayjs(section.due_date).utc().format('MMM D, YYYY h:mm A')
                  : 'N/A'}
              </Table.Td>
              <Table.Td>
                <Progress
                  value={calculateTimeRemaining(section.release_date ?? 'N/A', section.due_date ?? 'N/A')}
                  color={getProgressColor(section.release_date ?? 'N/A', section.due_date ?? 'N/A')}
                  size="lg"
                  striped
                />
                <MantineText size="xs" mt={4} style={{ textAlign: 'center' }}>
                  {getRemainingTimeText(section.due_date)}
                </MantineText>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

const calculateTimeRemaining = (releaseDate: string | null, dueDate: string | null): number => {
  if (!releaseDate || !dueDate || releaseDate === 'N/A' || dueDate === 'N/A') return 0;

  const now = dayjs();
  const release = dayjs(releaseDate);
  const due = dayjs(dueDate);

  if (now.isBefore(release)) {
    return 100;
  }
  if (now.isAfter(due)) {
    return 0;
  }

  const totalDuration = due.diff(release);
  const remainingDuration = due.diff(now);

  return (remainingDuration / totalDuration) * 100;
};

const getProgressColor = (releaseDate: string | null, dueDate: string | null): string => {
  const remainingPercentage = calculateTimeRemaining(releaseDate, dueDate);

  if (remainingPercentage > 70) {
    return 'green';
  } else if (remainingPercentage > 40) {
    return 'orange';
  } else {
    return 'red';
  }
};

const getRemainingTimeText = (dueDate: string | null): string => {
  if (!dueDate || dueDate === 'N/A') return 'N/A';

  const now = dayjs();
  const due = dayjs(dueDate);

  if (now.isAfter(due)) {
    return 'Past Due';
  }

  const duration = due.diff(now, 'minute');

  const days = Math.floor(duration / (60 * 24));
  const hours = Math.floor((duration % (60 * 24)) / 60);
  const minutes = duration % 60;

  const timeParts = [];
  if (days > 0) timeParts.push(`${days}d`);
  if (hours > 0) timeParts.push(`${hours}h`);
  if (minutes > 0) timeParts.push(`${minutes}m`);

  return timeParts.join(' ') || 'Less than a minute';
};

export default SecAssignment;
