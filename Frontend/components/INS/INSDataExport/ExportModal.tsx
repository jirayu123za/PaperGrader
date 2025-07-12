// components/INS/INSDataExport/ExportModal.tsx
'use client';

import React from 'react';
import { Modal, MultiSelect, Text, Button, Flex, Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import { useFetchAssignments, useExportAssignments } from '@/hooks/useFetchExportModal';
import { useParams } from 'next/navigation';

const ExportModal: React.FC = () => {
  const params = useParams();
  const opened = useExportModalStore((s) => s.opened);
  const closeModal = useExportModalStore((s) => s.closeModal);
  const course_id = useExportModalStore((s) => s.course_id) ?? params.course_id;
  

  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    error: fetchError,
  } = useFetchAssignments(course_id);

  const {
    exportAssignments,
    isExporting,
    exportError,
  } = useExportAssignments(course_id);

  const form = useForm({
    initialValues: {
      assignments: [] as string[],
    },
    validate: {
      assignments: (val) =>
        val.length > 0 ? null : 'Please select at least one assignment',
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const blob = await exportAssignments(values.assignments, 'csv');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignments.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      showNotification({
        title: 'Export Success',
        message: 'Your assignments have been exported in Excel format.',
        color: 'green',
        position: 'bottom-right',
      });

      closeModal();
    } catch {
      showNotification({
        title: 'Export Failed',
        message: 'Failed to export assignments. Please try again.',
        color: 'red',
        position: 'bottom-right',
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


      <form onSubmit={handleSubmit}>
        <Text size="sm" mb="sm">
          The exported file will be in Excel format.
        </Text>

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
          nothingFoundMessage="No assignments available for export."
        />

        <Flex justify="flex-end" gap="md" mt="md">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" loading={isExporting}>
            Export
          </Button>
        </Flex>
      </form>
    </Modal>
  );
};

export default ExportModal;
