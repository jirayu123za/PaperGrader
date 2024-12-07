import React, { useEffect, useState } from 'react';
import { Button, Text, Checkbox, Paper } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCustomizeTime } from '../../../hooks/useCustomizeTime';
import { useCustomizeTimeStore } from '../../../store/useCustomizeTimeStore';
import SectionSelector from '../../Create/Sections/SectionSelector';
import '@mantine/dates/styles.css';

interface CustomizeTimeProps {
  assignmentId: string;
}

const CustomizeTime: React.FC<CustomizeTimeProps> = ({ assignmentId }) => {
  const { releaseDate, dueDate, cutOffDate } = useCustomizeTimeStore();
  const { isFetching, updateCustomizeTime } = useCustomizeTime(assignmentId);
  const [isLateSubmissionEnabled, setIsLateSubmissionEnabled] = useState(false);

  const form = useForm({
    initialValues: {
      selectedSections: [] as string[],
      release_date: releaseDate || '',
      due_date: dueDate || '',
      cut_off_date: cutOffDate || '',
    },
  });

  useEffect(() => {
    form.setValues({
      release_date: releaseDate || '',
      due_date: dueDate || '',
      cut_off_date: cutOffDate || '',
    });
  }, [releaseDate, dueDate, cutOffDate]);

  const handleSubmit = (values: typeof form.values) => {
    updateCustomizeTime({
      sections: values.selectedSections,
      releaseDate: values.release_date,
      dueDate: values.due_date,
      cutOffDate: isLateSubmissionEnabled ? values.cut_off_date : '',
    });
  };

  if (isFetching) return <div>Loading...</div>;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <SectionSelector defaultEnabled={true} />

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

      <div className="flex justify-end space-x-4">
        <Button
          variant="default"
          onClick={() => {
            form.reset();
            setIsLateSubmissionEnabled(false);
          }}
        >
          Reset
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>

  );
};

export default CustomizeTime;
