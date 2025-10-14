"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Modal, Button, TextInput, RadioGroup, Radio } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useCreateSingleUser } from '../../hooks/Roster/useCreateSingleUser';
import { useSelectSectionStore } from '../../store/useSectionStore';
import SectionSelector from '../Create/Sections/SectionSelector';

interface SingleUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SingleUser: React.FC<SingleUserModalProps> = ({ isOpen, onClose }) => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { mutate, isPending } = useCreateSingleUser();
  const { resetSelectedSections, selectedSections } = useSelectSectionStore();

  const capitalizeFirstLetter = (value: string) => {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      student_code: '',
      role_type: '',
      sections: selectedSections,
    },

    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email format'),
      role_type: (value) => (value ? null : 'Please select a role'),
      student_code: (value) => (value.length > 0 && value.length < 5 ? 'Student ID must be at least 5 characters' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const name = capitalizeFirstLetter(values.name);
    const [first_name, last_name] = name.split(' ');
    form.setFieldValue('sections', selectedSections); 

    const formData = new FormData();
    formData.append('course_id', course_id as string);
    formData.append('first_name', first_name || '');
    formData.append('last_name', last_name || '');
    formData.append('email', values.email);
    formData.append('student_code', values.student_code);
    formData.append('role_type', values.role_type);
    formData.append('sections', selectedSections.join(','));

    mutate(formData, {
      onSuccess: () => {
        resetSelectedSections();
        form.reset();
        onClose();
        notifications.show({
          title: 'Success',
          message: 'User has been successfully added to the course.',
          color: 'green',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Failed',
          message: `${error.response?.data?.error}`,
          color: 'red',
        });
      },
    });
  };
  
  const handleClose = () => {
    resetSelectedSections();
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title="Add a user to the course"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Full name"
          placeholder="Example Fullname"
          required
          {...form.getInputProps('name')}
          onBlur={(e) => {
            const capitalizedName = capitalizeFirstLetter(e.target.value);
            form.setFieldValue('name', capitalizedName);
          }}
        />
        <TextInput
          label="Email address"
          placeholder="ExampleUserEmail@gmail.com"
          required
          className="mt-4"
          {...form.getInputProps('email')}
        />
        <TextInput
          label="Student ID"
          description="This field is optional and can be used to identify students."
          placeholder="640610123"
          className="mt-4"
          {...form.getInputProps('student_code')}
          disabled={form.values.role_type !== 'STUDENT'}
        />
        <RadioGroup
          label="Role"
          required
          className="mt-4"
          {...form.getInputProps('role_type')}
        >
          <div className="flex gap-4">
            <Radio value="INSTRUCTOR" label="Instructor" />
            <Radio value="STUDENT" label="Student" />
            <Radio value="TA" label="TA" disabled/>
          </div>
        </RadioGroup>
        {(form.values.role_type === 'STUDENT' ) && (
          <div className="mt-4">
            <SectionSelector
              defaultEnabled={true}
            />
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button
            variant="filled"
            color="red"
            onClick={() => {
              form.reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="ml-2" loading={isPending}>
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SingleUser;
