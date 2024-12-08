import React, { useEffect, useState } from 'react';
import SectionSelector from '../../Create/Sections/SectionSelector';
import { Button, Checkbox } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCustomizeTimeStore } from '../../../store/useCustomizeTimeStore';
import { useAssignmentSettingStore } from '../../../store/useAssignmentSettingStore';
import '@mantine/dates/styles.css';

const CustomizeTime: React.FC = () => {
  const [isLateSubmissionEnabled, setIsLateSubmissionEnabled] = useState(false);
  const { assignmentSetting } = useAssignmentSettingStore();

  const form = useForm({
    initialValues: {
      selectedSections: [],
      release_date: '',
      due_date: '',
      cut_off_date: '',
    },
  });


  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
  };

  return (
    <>
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
        <Button onClick={() => form.onSubmit(handleSubmit)}>
          Save
        </Button>
      </div>
    </>
  );
};

export default CustomizeTime;
