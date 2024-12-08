import React, { useEffect, useRef } from 'react';
import { Checkbox, Table, Loader, Text, Paper, Progress } from '@mantine/core';
import { useFetchAssignmentSections } from '../../../hooks/AssignmentSetting/useFetchAssignmentSections';
import { useFetchAssignmentSetting } from '../../../hooks/AssignmentSetting/useFetchAssignmentSetting';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import { useSelectSectionStore } from '../../../store/useSectionStore';

interface SecAssignmentProps {
  courseId: string;
  assignmentId: string;
  parentChecked?: boolean;
  expanded?: boolean;
}

const SecAssignment: React.FC<SecAssignmentProps> = ({
  courseId,
  assignmentId,
  parentChecked,
  expanded,
}) => {
  const { data: sections, isLoading: sectionsLoading, error: sectionsError } =
    useFetchAssignmentSections(assignmentId);
  const { data: assignmentSetting, isLoading: settingLoading, error: settingError } =
    useFetchAssignmentSetting(courseId, assignmentId);
  const { setSelectedSections, resetSelectedSections } = useSelectSectionStore();

  const form = useForm<Record<string, boolean>>({
    initialValues: {},
  });

  const wasExpanded = useRef<boolean | undefined>(expanded);

  useEffect(() => {
    if (wasExpanded.current && !expanded) {
      form.reset();
      resetSelectedSections();
    }
    wasExpanded.current = expanded;
  }, [expanded, form, resetSelectedSections]);

  useEffect(() => {
    if (parentChecked !== undefined && sections) {
      const updatedValues = sections.reduce(
        (acc, section) => ({
          ...acc,
          [section.section_id]: parentChecked,
        }),
        {}
      );

      form.setValues(updatedValues);
      if (parentChecked) {
        setSelectedSections(sections.map((section) => section.section_id));
      } else {
        resetSelectedSections();
      }
    }
  }, [parentChecked, sections, setSelectedSections, resetSelectedSections]);

  const handleCheckboxChange = (sectionId: string, checked: boolean) => {
    setSelectedSections((prev) =>
      checked ? [...prev, sectionId] : prev.filter((id) => id !== sectionId)
    );
    form.setFieldValue(sectionId, checked);
  };

  if (sectionsLoading || settingLoading) {
    return <Loader size="sm" />;
  }

  if (sectionsError || settingError) {
    return <Text color="red">Failed to load data: {sectionsError?.message || settingError?.message}</Text>;
  }

  if (!sections || sections.length === 0) {
    return <Text>No sections available for this assignment.</Text>;
  }

  const matchedSections = sections.map((section) => {
    const matched = assignmentSetting?.assignmentSections.find(
      (assignmentSection) => assignmentSection.section_id === section.section_id
    );
    return {
      ...section,
      releaseDate: matched?.releaseDate || 'N/A',
      dueDate: matched?.dueDate || 'N/A',
    };
  });

  return (
    <Paper shadow="xs" p="sm" radius="md" withBorder>
      <Table highlightOnHover striped verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '10%' }}>SELECT</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center'  }}>Section Name</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>Release Date</Table.Th>
            <Table.Th style={{ width: '30%', textAlign: 'center'}}>Progress</Table.Th>
            <Table.Th style={{ width: '20%', textAlign: 'center' }}>Due Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <tbody>
          {matchedSections.map((section) => (
            <Table.Tr key={section.section_id}>
              <Table.Td>
                <Checkbox
                  pl={10}
                  checked={!!form.values[section.section_id]}
                  onChange={(e) => handleCheckboxChange(section.section_id, e.currentTarget.checked)}
                />
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {section.section_name}
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {section.releaseDate !== 'N/A'
                  ? dayjs(section.releaseDate).format('MMM D, YYYY h:mm A')
                  : 'N/A'}
              </Table.Td>
              <Table.Td>
                <Progress
                  value={calculateProgress(section.releaseDate, section.dueDate)}
                  color="green"
                  size="lg"
                />
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {section.dueDate !== 'N/A'
                  ? dayjs(section.dueDate).format('MMM D, YYYY h:mm A')
                  : 'N/A'}
              </Table.Td>
            </Table.Tr>
          ))}
        </tbody>
      </Table>
    </Paper>
  );
};

// Helper function to calculate progress percentage
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
