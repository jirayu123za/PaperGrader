import React from 'react';
import { Modal, MultiSelect, Radio, Text, Button, Flex, Loader, Group} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useExportModalStore } from '@/store/modal/useExportModalStore';
import { useFetchExportModal } from '@/hooks/useFetchExportModal';

const mockAssignmentOptions = [
  { value: 'mock-1', label: 'Mock Assignment A' },
  { value: 'mock-2', label: 'Mock Assignment B' },
];

const ExportModal: React.FC = () => {
  const opened = useExportModalStore((s) => s.opened);
  const closeModal = useExportModalStore((s) => s.closeModal);
  const onExportCallback = useExportModalStore((s) => s.onExportCallback);
  const course_id = useExportModalStore((s) => s.course_id);

  const {
    assignments,
    isLoadingAssignments,
    fetchError,
    exportAssignments,
    isExporting,
  } = useFetchExportModal(course_id);

  const form = useForm({
    initialValues: {
      fileType: 'csv' as 'csv' | 'pdf',
      assignments: [] as string[],
    },
    validate: {
      assignments: (value) =>
        value.length > 0 ? null : 'Please select at least one assignment',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    exportAssignments(values.assignments, values.fileType);
    onExportCallback(values.assignments, values.fileType);
    closeModal();
  };

  const options = [
    ...mockAssignmentOptions,
    ...assignments.map((a) => ({
      value: a.assignment_id,
      label: a.assignment_name,
    })),
  ];

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      title="Export Assignments"
      overlayProps={{ blur: 3, opacity: 0.55 }}
    >
      {isLoadingAssignments ? (
        <Loader size="sm" />
      ) : fetchError ? (
        <Text color="red" mb="md">
          Failed to load assignments
        </Text>
      ) : null}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        {!isLoadingAssignments && !fetchError && assignments.length === 0 && (
          <Text size="sm" color="dimmed" mb="md">
            No assignments available for export.
          </Text>
        )}

        <Radio.Group
          {...form.getInputProps('fileType')}
          label="Choose file type"
          description="Select the file type you want to export"
          mb="md"
        >
          <Group  mt="xs">
            <Radio value="csv" label="CSV" />
            <Radio value="pdf" label="PDF" />
          </Group>
        </Radio.Group>

        <MultiSelect
          {...form.getInputProps('assignments')}
          data={options}
          label="Select assignments"
          description="Select the assignments you want to export grades (you can choose multiple)"
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
      </form>
    </Modal>
  );
};

export default ExportModal;
