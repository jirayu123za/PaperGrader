import React, { useEffect } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCustomizeTime } from '../../hooks/useCustomizeTime';
import { useCustomizeTimeStore } from '../../store/useCustomizeTimeStore';
import SectionSelector from '../Create/Sections/SectionSelector'; 
import '@mantine/dates/styles.css';

interface CustomizeTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
}

const CustomizeTimeModal: React.FC<CustomizeTimeModalProps> = ({ isOpen, onClose, assignmentId }) => {
  const { releaseDate, dueDate, cutOffDate } = useCustomizeTimeStore();
  const { isFetching, updateCustomizeTime } = useCustomizeTime(assignmentId);

  const form = useForm({
    initialValues: {
      selectedSections: [] as string[], // จะดึงจาก SectionSelector
      release_date: releaseDate,
      due_date: dueDate,
      cut_off_date: cutOffDate,
    },
  });

  useEffect(() => {
    form.setValues({
      release_date: releaseDate,
      due_date: dueDate,
      cut_off_date: cutOffDate,
    });
  }, [releaseDate, dueDate, cutOffDate]);

  const handleSectionsChange = (sections: string[]) => {
    form.setFieldValue('selectedSections', sections);
  };

  const handleSubmit = (values: typeof form.values) => {
    updateCustomizeTime({
      sections: values.selectedSections,
      releaseDate: values.release_date!,
      dueDate: values.due_date!,
      cutOffDate: values.cut_off_date!,
    });
    onClose();
  };

  if (isFetching) return <div>Loading...</div>;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Customize Dates & Student Visibility"
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="mb-4">
          <Text size="sm" fw={500}>
            Selected Section(s)
          </Text>
          <SectionSelector setSections={handleSectionsChange} />
        </div>

        <div className="flex justify-between gap-4 mb-4">
          <DateTimePicker
            label="Release Date"
            placeholder="Select release date"
            {...form.getInputProps('release_date')}
            valueFormat="DD/MM/YYYY HH:mm"
          />
          <DateTimePicker
            label="Due Date"
            placeholder="Select due date"
            {...form.getInputProps('due_date')}
            valueFormat="DD/MM/YYYY HH:mm"
          />
        </div>

        <DateTimePicker
          className="mb-4"
          label="Cut Off Date"
          placeholder="Select cut off date"
          {...form.getInputProps('cut_off_date')}
          valueFormat="DD/MM/YYYY HH:mm"
        />

        <div className="flex justify-end mt-6">
          <Button
            variant="default"
            onClick={() => {
              form.reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="ml-2">
            Apply
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomizeTimeModal;
