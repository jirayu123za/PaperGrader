'use client';

import React from 'react';
import { Modal, MultiSelect, Button, Flex } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { BsFiletypeXlsx } from "react-icons/bs";
import { useForm } from '@mantine/form';
import { useQueryClient } from '@tanstack/react-query';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import { useFetchAssignments } from '@/hooks/useFetchExportModal';
import { useExportGrades } from '@/hooks/ExportGrade/useExportGrades';

const ExportModal: React.FC = () => {
  const opened = useExportModalStore((s) => s.opened);
  const closeModal = useExportModalStore((s) => s.closeModal);
  const course_id = useExportModalStore((s) => s.course_id);
  const { data: assignments = [], isLoading: isLoadingAssignments, error: fetchError } = useFetchAssignments(course_id);
  // Hook for exporting grades
  const postQueueExport = useExportGrades();

  const form = useForm({
    initialValues: { assignments: [] as string[] },
    validate: {
      assignments: (val) =>
        val.length > 0 ? null : 'Please select at least one assignment',
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    postQueueExport.mutate(
      {
        params: { course_id },
        body: { assignment_id: values.assignments.join(',') },
      },
      {
        onSuccess: () => {
          showNotification({
            title: 'Export Success',
            message: 'Your assignments have been exported in Excel format.',
            color: 'green',
            position: 'bottom-right',
          });
          closeModal();
        },
        onError: (error) => {
          showNotification({
            title: 'Export Failed',
            message: `${error.response?.data?.error}`,
            color: 'red',
            position: 'bottom-right',
          });
        }
      }
    );
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
      <form onSubmit={handleSubmit}>
        <MultiSelect
          {...form.getInputProps('assignments')}
          data={options}
          label="Select assignments"
          description="Select assignments to export grades (you can select multiple)"
          placeholder="Select assignments"
          searchable
          clearable
          withScrollArea={false}
          mb="md"
          disabled={isLoadingAssignments}
          withAsterisk
          nothingFoundMessage="No assignments available for export."
          leftSection={<BsFiletypeXlsx size={24}/>}
        />

        <Flex justify="flex-end" gap="md" mt="md">
          <Button color="red" variant="filled" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" variant="filled">
            Export
          </Button>
        </Flex>
      </form>
    </Modal>
  );
};

export default ExportModal;
