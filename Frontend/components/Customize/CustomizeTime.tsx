import React, { useEffect, useState } from 'react';
import { Modal, Button, Text, Checkbox } from '@mantine/core';
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
  const [isLateSubmissionEnabled, setIsLateSubmissionEnabled] = useState(false); // State to control Cut Off Date visibility

  const form = useForm({
    initialValues: {
      selectedSections: [] as string[],
      release_date: releaseDate || '', // Ensure no null values
      due_date: dueDate || '',
      cut_off_date: cutOffDate || '',
    },
  });

  useEffect(() => {
    form.setValues({  
      release_date: releaseDate || '', // Ensure no null values
      due_date: dueDate || '',
      cut_off_date: cutOffDate || '',
    });
  }, [releaseDate, dueDate, cutOffDate]);

  const handleSectionsChange = (sections: string[]) => {
    form.setFieldValue('selectedSections', sections);
  };

  const handleSubmit = (values: typeof form.values) => {
    updateCustomizeTime({
      sections: values.selectedSections,
      releaseDate: values.release_date,
      dueDate: values.due_date,
      cutOffDate: isLateSubmissionEnabled ? values.cut_off_date : '', // แปลง null เป็น empty string
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
        {/* Section Selector */}
        <div className="mb-6">
          <SectionSelector setSections={handleSectionsChange} defaultEnabled={true} />
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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

        {/* Late Submission Checkbox and Cut Off Date */}
        <div className="mb-6">
          <Checkbox
            label="Allow late submissions"
            checked={isLateSubmissionEnabled}
            onChange={(event) => setIsLateSubmissionEnabled(event.currentTarget.checked)}
          />
          {isLateSubmissionEnabled && (
            <DateTimePicker
              label="Cut Off Date"
              placeholder="Select cut off date"
              {...form.getInputProps('cut_off_date')}
              valueFormat="DD/MM/YYYY HH:mm"
              className="mt-4"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="default"
            onClick={() => {
              form.reset();
              setIsLateSubmissionEnabled(false); // Reset late submission checkbox
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            Apply
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomizeTimeModal;
