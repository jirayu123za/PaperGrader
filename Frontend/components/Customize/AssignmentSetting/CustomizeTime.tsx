import React, { useEffect } from 'react';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useFetchAssignmentSetting } from '../../../hooks/AssignmentSetting/useFetchAssignmentSetting'; 
import { useAssignmentSettingStore } from '../../../store/useAssignmentSettingStore';
import { useCustomizeTimeStore, useModalAssignmentSettingStore } from '../../../store/modal/useAssignmentSettingModal';
import { useSelectSectionStore } from '../../../store/useSectionStore';
import SectionEditAssignment from '../../Create/Sections/SectionEditAssignment';
import '@mantine/dates/styles.css';

const CustomizeTime: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { assignment_id } = useModalAssignmentSettingStore(state => state);
  const { assignmentSetting } = useAssignmentSettingStore();
  const { selectedSections } = useSelectSectionStore();
  const { setCustomizeTime } = useCustomizeTimeStore();
  const { isLoading } = useFetchAssignmentSetting(course_id as string, assignment_id as string);

  const form = useForm({
    initialValues: {
      release_date: assignmentSetting?.assignmentSections[0]?.releaseDate
      ? new Date(assignmentSetting.assignmentSections[0].releaseDate)
      : null,
    due_date: assignmentSetting?.assignmentSections[0]?.dueDate
      ? new Date(assignmentSetting.assignmentSections[0].dueDate)
      : null,
    cut_off_date: assignmentSetting?.assignmentSections[0]?.cutOffDate
      ? new Date(assignmentSetting.assignmentSections[0].cutOffDate)
      : null,
  },
  });

  useEffect(() => {
    if (assignmentSetting) {
      const initialValues = {
        release_date: null,
        due_date: null,
        cut_off_date: null,
        sections: selectedSections || [],
      };
      form.setValues(initialValues);
      setCustomizeTime({ ...initialValues, selectedSections });
    }
  }, [assignmentSetting, setCustomizeTime]);

  useEffect(() => {
    const updatedValues = { ...form.values, selectedSections };
    setCustomizeTime(updatedValues);
    form.setFieldValue('sections', selectedSections);
  }, [form.values, selectedSections, setCustomizeTime]);

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
