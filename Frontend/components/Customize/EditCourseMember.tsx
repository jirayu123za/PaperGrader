import React, { useEffect } from 'react';
import SectionSelector from '../Create/Sections/SectionSelector';
import { Modal, Button, TextInput, Select, Skeleton } from '@mantine/core';
import { useEditCourseMemberStore } from '../../store/useEditCourseMemberStore';
import { useSelectSectionStore } from '../../store/useSectionStore';
import { useFetchEditCourseMember } from '../../hooks/Roster/useFetchEditCourseMember';
import { useModalEditRosterMemberStore } from '../../store/modal/useRosterModalStore';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';

const EditCourseMember: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { editMember } = useEditCourseMemberStore();
  const { selectedSections, setSelectedSections, resetSelectedSections } = useSelectSectionStore();  
  const { personal_data_id, opened, closeModal } = useModalEditRosterMemberStore();
  const { isLoading, isSuccess } = useFetchEditCourseMember(course_id as string, personal_data_id as string);
  // const { mutate: updateCourseMember, status } = useUpdateCourseMember();

  const capitalizeFirstLetter = (value: string) => {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  console.log('Modal state:', { personal_data_id, opened });

  const form = useForm({
    initialValues: {
      fullName: '',
      studentCode: '',
      role: '',
      sections: [] as string[],
    },

    validate: {
      fullName: (value) => (value ? null : 'Full name is required'),
      studentCode: (value) => (value ? null : 'Student code is required'),
      role: (value) => (value ? null : 'Role is required'),
    },
  });

  useEffect(() => {
    if (opened && isSuccess && editMember && form.values.fullName === '') {
      form.setValues({
        fullName: editMember.full_name || '',
        studentCode: editMember.student_code || '',
        role: editMember.role_type || '',
        sections: [],
      });
  
      if (editMember.section_name) {
        const sections = editMember.section_name.includes(',')
          ? editMember.section_name.split(',')
          : [editMember.section_name];
        setSelectedSections(sections);
      }
    }
  }, [opened, isSuccess, editMember]); 
  
  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData();
    const name = capitalizeFirstLetter(values.fullName);
    const [first_name, last_name] = name.split(' ');
    form.setFieldValue('sections', selectedSections); 
    
    formData.append('first_name', first_name || '');
    formData.append('last_name', last_name || '');
    formData.append('student_code', values.studentCode);
    formData.append('role_type', values.role);
    formData.append('sections', selectedSections.join(','));

    // updateCourseMember({ formData, course_id: course_id, personal_data_id: personal_data_id }, {
    //   onSuccess: () => {
    //     resetSelectedSections();
    //     form.reset();
    //     closeModal();
    //   },
    //   onError: () => {
    //     console.log('Error updating member');
    //   },
    // });
    form.reset();
    console.log('Form data:', formData.getAll('first_name'), formData.getAll('last_name'), formData.getAll('student_code'), formData.getAll('role_type'), formData.getAll('sections'));
  };

  const isSectionDisabled = editMember?.role_type === 'INSTRUCTOR' || editMember?.role_type  === 'TA';

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        resetSelectedSections();
        closeModal();
      }}
      title="Edit Course Member"
    >
      <div className="p-4">
        {/* Skeleton loading */}
        <Skeleton visible={isLoading}>
          <TextInput
            label="Full Name"
            {...form.getInputProps('fullName')}
            required
          />
        </Skeleton>
        <Skeleton visible={isLoading}>
          <TextInput label="Email Address" value={editMember?.email || ''} disabled />
        </Skeleton>
        <Skeleton visible={isLoading}>
          <TextInput
            label="Student ID"
            {...form.getInputProps('studentCode')}
          />
        </Skeleton>
        <Skeleton visible={isLoading}>
          <Select
            label="Role"
            data={['INSTRUCTOR', 'STUDENT', 'TA']}
            {...form.getInputProps('role')}
            onChange={(value) => {
              form.setFieldValue('role', value || '');
              if (value === 'INSTRUCTOR' || value === 'TA') resetSelectedSections();
            }}
            required
          />
        </Skeleton>
        {!isSectionDisabled && (
          <SectionSelector defaultEnabled={true} />
        )}

        <div className="flex justify-end mt-6">
          <Button
            variant="default"
            onClick={() => {
              form.reset();
              resetSelectedSections();
              closeModal();
            }}
            disabled={status == "pending"}
          >
            Cancel
          </Button>
          <Button variant="filled" color="teal" className="ml-2" onClick={() => form.onSubmit(handleSubmit)()} disabled={status == "pending"}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCourseMember;
