import React, { useEffect } from 'react';
import { Button, Checkbox } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useFetchAssignmentSetting } from '../../../hooks/AssignmentSetting/useFetchAssignmentSetting'; 
import { useAssignmentSettingStore } from '../../../store/useAssignmentSettingStore';
import { useModalAssignmentSettingStore } from '../../../store/modal/useAssignmentSettingModal';
import SectionEditAssignment from '../../Create/Sections/SectionEditAssignment';
import '@mantine/dates/styles.css';

const CustomizeTime: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { assignmentSetting } = useAssignmentSettingStore();
  const { assignment_id } = useModalAssignmentSettingStore(state => state);
  const { isLoading } = useFetchAssignmentSetting(course_id as string, assignment_id as string);

  const form = useForm({
    initialValues: {
      selectedSections: assignmentSetting?.assignmentSections.map((s) => s.section_id) || [],
      release_date: assignmentSetting?.assignmentSections[0]?.releaseDate || '',
      due_date: assignmentSetting?.assignmentSections[0]?.dueDate || '',
      cut_off_date: assignmentSetting?.assignmentSections[0]?.cutOffDate || '',
      allowLateSubmissions: !!assignmentSetting?.assignment?.lateSubmiss || false,
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

  // const handleSubmit = (values: typeof form.values) => {
  //   console.log('Updated Customize Time:', {
  //     sections: values.selectedSections,
  //     releaseDate: values.release_date,
  //     dueDate: values.due_date,
  //     cutOffDate: values.allowLateSubmissions ? values.cut_off_date : '',
  //   });
  //   // TODO: call API to update assignment setting
  // };

  return (
    <>
      <SectionEditAssignment/>
      
      <div className="grid grid-cols-2 gap-4 mb-3 mt-3">
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
        label="Cut Off Date"
        placeholder="Select cut off date"
        {...form.getInputProps('cut_off_date')}
        valueFormat="DD/MM/YYYY HH:mm"
        className="mt-4"
      />
    </>
  );
};

export default CustomizeTime;
