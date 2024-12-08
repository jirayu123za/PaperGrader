import React, { useEffect } from 'react';
import { Button, Checkbox } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useFetchAssignmentSetting } from '../../../hooks/AssignmentSetting/useFetchAssignmentSetting'; 
import { useAssignmentSettingStore } from '../../../store/useAssignmentSettingStore';
import SectionEditAssignment from '../../Create/Sections/SectionEditAssignment';
import '@mantine/dates/styles.css';

interface CustomizeTimeProps {
  courseId: string;
  assignmentId: string;
}

const CustomizeTime: React.FC<CustomizeTimeProps> = ({ courseId, assignmentId }) => {
  const { assignmentSetting } = useAssignmentSettingStore();
  const { isFetching } = useFetchAssignmentSetting(courseId, assignmentId);

  // จัดการสถานะด้วย useForm
  const form = useForm({
    initialValues: {
      selectedSections: assignmentSetting?.assignmentSections.map((s) => s.section_id) || [],
      release_date: assignmentSetting?.assignmentSections[0]?.releaseDate || '',
      due_date: assignmentSetting?.assignmentSections[0]?.dueDate || '',
      cut_off_date: assignmentSetting?.assignmentSections[0]?.cutOffDate || '',
      allowLateSubmissions: !!assignmentSetting?.assignment?.lateSubmiss || false, // ใช้ฟอร์มจัดการสถานะนี้
    },
  });

  useEffect(() => {
    if (assignmentSetting) {
      form.setValues({
        selectedSections: assignmentSetting.assignmentSections.map((s) => s.section_id),
        release_date: assignmentSetting.assignmentSections[0]?.releaseDate || '',
        due_date: assignmentSetting.assignmentSections[0]?.dueDate || '',
        cut_off_date: assignmentSetting.assignmentSections[0]?.cutOffDate || '',
        allowLateSubmissions: !!assignmentSetting.assignment?.lateSubmiss || false,
      });
    }
  }, [assignmentSetting]);

  const handleSubmit = (values: typeof form.values) => {
    console.log('Updated Customize Time:', {
      sections: values.selectedSections,
      releaseDate: values.release_date,
      dueDate: values.due_date,
      cutOffDate: values.allowLateSubmissions ? values.cut_off_date : '',
    });
    // TODO: เรียก API เพื่ออัปเดตข้อมูล
  };

  if (isFetching) return <div>Loading...</div>;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <SectionEditAssignment assignmentId={assignmentId} />
      
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
          {...form.getInputProps('allowLateSubmissions', { type: 'checkbox' })}
        />
        {form.values.allowLateSubmissions && (
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
