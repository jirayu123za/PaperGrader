import React from 'react';
import { Checkbox, Table, Loader, Text, Paper, Progress } from '@mantine/core';
import { useFetchAssignmentSections } from '../../../hooks/AssignmentSetting/useFetchAssignmentSections';
import { useFetchAssignmentSetting } from '../../../hooks/AssignmentSetting/useFetchAssignmentSetting';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';

interface SecAssignmentProps {
  courseId: string;
  assignmentId: string;
  parentChecked?: boolean;
}

const SecAssignment: React.FC<SecAssignmentProps> = ({ courseId, assignmentId , parentChecked}) => {
  const { data: sections, isLoading: sectionsLoading, error: sectionsError } = useFetchAssignmentSections(assignmentId);
  const { data: assignmentSetting, isLoading: settingLoading, error: settingError } = useFetchAssignmentSetting(courseId, assignmentId);
  const form = useForm<Record<string, boolean>>({
    initialValues: {},
  });
  React.useEffect(() => {
    if (parentChecked !== undefined) {
      const updatedValues = sections?.reduce(
        (acc, section) => ({ ...acc, [section.section_id]: parentChecked }),
        {}
      );
      form.setValues(updatedValues || {});
    }
  }, [parentChecked, sections]);


  

  if (sectionsLoading || settingLoading) {
    return <Loader size="sm" />;
  }

  if (sectionsError || settingError) {
    return <Text color="red">Failed to load data: {sectionsError?.message || settingError?.message}</Text>;
  }

  if (!sections || sections.length === 0) {
    return <Text>No sections available for this assignment.</Text>;
  }



  // Match sections with corresponding times from assignmentSetting
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
        <thead>
          <tr>
            <th style={{ width: '10%' }}>SELECT</th>
            <th style={{ width: '20%' }}>Section Name</th>
            <th style={{ width: '20%', textAlign: 'center' }}>Release Date</th>
            <th style={{ width: '30%' }}>Progress</th>
            <th style={{ width: '20%', textAlign: 'center' }}>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {matchedSections.map((section) => (
            <Table.Tr key={section.section_id}>
              <Table.Td>
              <Checkbox
                  checked={!!form.values[section.section_id]}
                  onChange={(e) =>
                    form.setFieldValue(section.section_id, e.currentTarget.checked)
                  }
                />
              </Table.Td>
              <Table.Td>{section.section_name}</Table.Td>
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
    return 0; // Before release date
  }
  if (now.isAfter(due)) {
    return 100; // After due date
  }

  const totalDuration = due.diff(release);
  const elapsedDuration = now.diff(release);

  return (elapsedDuration / totalDuration) * 100;
};

export default SecAssignment;