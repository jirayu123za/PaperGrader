import React from 'react';
import dayjs from 'dayjs';
import { Checkbox, Table, Loader, Text, Progress, Skeleton, Pagination } from '@mantine/core';
import { useFetchAssignmentSections } from '../../../hooks/AssignmentSetting/useFetchAssignmentSections';
import { useFetchAssignmentSetting } from '../../../hooks/AssignmentSetting/useFetchAssignmentSetting';
import { useRouter } from 'next/router';
import { useSelectSectionStore } from '../../../store/useSectionStore';
import { useAssignmentExpandStore, useSelectedAssignmentStore } from '../../../store/Table/useInsAssignmentTableStore';
import { useInsAssignmentStore } from '../../../store/useAssignmentStore';
import { usePagination } from '@mantine/hooks';

const SecAssignment: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  // const { data: sections, isLoading: sectionsLoading, error: sectionsError } = useFetchAssignmentSections(assignment_id as string);
  // const { data: assignmentSetting, isLoading: settingLoading, error: settingError } = useFetchAssignmentSetting(course_id as string, assignment_id as string);
  const { setSelectedSections, selectedSections, resetSelectedSections } = useSelectSectionStore();
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
  const pageSize = 3;
  const totalPages = Math.ceil(allSections.length / pageSize);
  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  const paginatedSections = allSections.slice(
    (pagination.active - 1) * pageSize,
    pagination.active * pageSize
  );

  return (
    <>
      <Table withTableBorder={false} verticalSpacing="lg" className="bg-white">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '10%' }}>SELECT</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center'  }}>Section Name</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>Release Date</Table.Th>
            <Table.Th style={{ width: '30%', textAlign: 'center'}}>Progress</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>Due Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
        {/* {expandedAssignmentsData.map((assignment) =>
          assignment.assignment_sections.map((section) => ( */}
        {paginatedSections.map((section) => (
          <Table.Tr key={section.assignment_section_id}>
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
                ? dayjs(section.release_date).format('MMM D, YYYY h:mm A')
                : 'N/A'}
            </Table.Td>
            <Table.Td>
              <Progress
                value={calculateProgress(section.release_date ?? 'N/A', section.due_date ?? 'N/A')}
                color="green"
                size="lg"
              />
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
              {section.due_date
                ? dayjs(section.due_date).format('MMM D, YYYY h:mm A')
                : 'N/A'}
            </Table.Td>
          </Table.Tr>
        ),
      )}
      </Table.Tbody>
    </Table>

    <div className="flex justify-center mt-4 mb-4">
      <Pagination
        total={totalPages}
        siblings={1}
        boundaries={1}
        value={pagination.active}
        onChange={pagination.setPage}
      />
    </div>
    </>
  );
};

const calculateProgress = (releaseDate: string, dueDate: string): number => {
  if (releaseDate === 'N/A' || dueDate === 'N/A') return 0;

  const now = dayjs();
  const release = dayjs(releaseDate);
  const due = dayjs(dueDate);

  if (now.isBefore(release)) {
    return 0;
  }
  if (now.isAfter(due)) {
    return 100;
  }

  const totalDuration = due.diff(release);
  const elapsedDuration = now.diff(release);

  return (elapsedDuration / totalDuration) * 100;
};

export default SecAssignment;
