import React from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateSingleUser } from '../../hooks/useCreate/useCreateSingleUser';
import { useRouter } from 'next/router';
import { useFetchSections } from '../../hooks/useFetchSelectSection';
import { useSectionsListStore } from '../../store/useSectionStore';

interface SingleUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SingleUser: React.FC<SingleUserModalProps> = ({ isOpen, onClose }) => {
  const { mutate } = useCreateSingleUser();
  const router = useRouter();
  const { course_id } = router.query;


  const { isLoading, error } = useFetchSections(course_id as string);
  const sectionsList = useSectionsListStore((state) => state.sectionsList)||[]; 


  const sortedSections = [...sectionsList].sort((a, b) => a.section_name.localeCompare(b.section_name));

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      student_id: '',
      user_group_name: '',
      section_id: '', 
    },

    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email format'),
      user_group_name: (value) => (value ? null : 'Please select a role'),
      section_id: (value, values) =>
        values.user_group_name === 'STUDENT' && !value ? 'Please select a section' : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const [first_name, last_name] = values.name.split(' ');
    const formData = new FormData();

    formData.append('course_id', Array.isArray(course_id) ? course_id[0] : course_id || '');
    formData.append('first_name', first_name || '');
    formData.append('last_name', last_name || '');
    formData.append('email', values.email);
    formData.append('student_id', values.student_id);
    formData.append('user_group_name', values.user_group_name);
    formData.append('section_id', values.section_id); 

    mutate(formData, {
      onSuccess: () => {
        console.log('User created successfully');
        form.reset();
        onClose();
      },
      onError: (error) => {
        console.error('Error creating user:', error);
      },
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Add a User"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Name"
          placeholder="John Doe"
          required
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Email Address"
          placeholder="johndoe@example.com"
          required
          className="mt-4"
          {...form.getInputProps('email')}
        />
        <TextInput
          label="Student ID # (Optional)"
          placeholder="7855423"
          className="mt-4"
          {...form.getInputProps('student_id')}
          disabled={form.values.user_group_name !== 'STUDENT'}
        />
        <RadioGroup
          label="Role"
          required
          className="mt-4"
          {...form.getInputProps('user_group_name')}
        >
          <div className="flex gap-4">
            <Radio value="STUDENT" label="Student" />
            <Radio value="INSTRUCTOR" label="Instructor" />
          </div>
        </RadioGroup>
        {form.values.user_group_name === 'STUDENT' && (
          <Select
            label="Section"
            placeholder={sortedSections.length === 0 ? "No sections created yet" : "Select a section"}
            data={sortedSections.map((section) => ({
              value: section.section_id,
              label: section.section_name,
            }))}
            required
            searchable 
            className="mt-4"
            {...form.getInputProps('section_id')}
          />
        )}
        {isLoading && <p>Loading sections...</p>}
        {error && <p style={{ color: 'red' }}>Error loading sections</p>}
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
          <Button type="submit" className="ml-2">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SingleUser;
