import React, { useState } from 'react';
import {Modal,MultiSelect,Radio,Text,Button,Flex,Loader,} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import { useFetchAssignments, useExportAssignments, Assignment } from '@/hooks/useFetchExportModal';


const mockAssignments: Assignment[] = [
  { assignment_id: '1', assignment_name: 'Mock Assignment 1' },
  { assignment_id: '2', assignment_name: 'Mock Assignment 2' },
  { assignment_id: '3', assignment_name: 'Mock Assignment 3' },
];

const ExportModal: React.FC = () => {
  const opened = useExportModalStore((s) => s.opened);
  const closeModal = useExportModalStore((s) => s.closeModal);
  const course_id = useExportModalStore((s) => s.course_id);


  const {
    data: fetchedAssignments = [],
    isLoading: isLoadingAssignments,
    error: fetchError,
  } = useFetchAssignments(course_id);


  const assignments = fetchedAssignments.length > 0 ? fetchedAssignments : mockAssignments;

 
  const {
    exportAssignments,
    isExporting,
    exportError,
  } = useExportAssignments(course_id);

  const [hasExported, setHasExported] = useState(false);

  const form = useForm({
    initialValues: {
      assignments: [] as string[],
      fileType: 'csv' as 'csv' | 'pdf',
    },
    validate: {
      assignments: (val) =>
        val.length > 0 ? null : 'Please select at least one assignment',
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      // perform export
      const blob = await exportAssignments(values.assignments, values.fileType);

      // trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignments.${values.fileType}`;
      a.click();
      URL.revokeObjectURL(url);

      showNotification({
        title: 'Export Success',
        message: 'Your assignments have been exported.',
        color: 'green',
      });

      setHasExported(true);
      closeModal();
    } catch {
      showNotification({
        title: 'Export Failed',
        message: 'Something went wrong. Please try again.',
        color: 'red',
      });
    }
  });

  const options = assignments.map((a) => ({
    value: a.assignment_id,
    label: a.assignment_name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      title="Export Assignments"
      overlayProps={{ blur: 3, opacity: 0.55 }}
    >
      {isLoadingAssignments ? (
        <Loader size="sm" />
      ) : Boolean(fetchError) ? (
        <Text color="red" mb="md">
          Failed to load assignments
        </Text>
      ) : null}

      <form onSubmit={handleSubmit}>
        {!isLoadingAssignments &&
          !fetchError &&
          options.length === 0 && (
            <Text size="sm" color="dimmed" mb="md">
              No assignments available for export.
            </Text>
          )}

        <Radio.Group
          {...form.getInputProps('fileType')}
          label="Choose file type"
          description="Choose the type of file to export"
          mb="md"
        >
          <Flex mt="xs" gap="lg">
            <Radio value="csv" label="CSV" />
            <Radio value="pdf" label="PDF" />
          </Flex>
        </Radio.Group>

        <MultiSelect
          {...form.getInputProps('assignments')}
          data={options}
          label="Select assignments"
          description="Select assignments to export grades (can select multiple)"
          placeholder="Select assignments"
          searchable
          clearable
          withScrollArea={false}
          mb="md"
        />

        <Flex justify="flex-end" gap="md" mt="md">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" loading={isExporting}>
            Export
          </Button>
        </Flex>

        {Boolean(exportError) && (
          <Text color="red" size="sm" mt="xs">
            Failed to export assignments
          </Text>
        )}

        {hasExported && (
          <Text size="sm" color="blue" mt="sm">
            Export completed successfully!
          </Text>
        )}
      </form>
    </Modal>
  );
};

export default ExportModal;
