import React from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateSingleUser } from '../../hooks/useCreate/useCreateSingleUser';
import { useRouter } from 'next/router';
import SectionSelector from '../Create/Sections/SectionSelector';

interface SingleUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SingleUser: React.FC<SingleUserModalProps> = ({ isOpen, onClose }) => {
  const { mutate } = useCreateSingleUser();
  const router = useRouter();
  const { course_id } = router.query;

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      student_code: '',
      role_type: '',
      sections: [] as string[], // Store selected sections as an array
    },

    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email format'),
      role_type: (value) => (value ? null : 'Please select a role'),
      sections: (value, values) =>
        values.role_type === 'STUDENT' && value.length === 0 ? 'Please select at least one section' : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const [first_name, last_name] = values.name.split(' ');
    const formData = new FormData();

    formData.append('course_id', Array.isArray(course_id) ? course_id[0] : course_id || '');
    formData.append('first_name', first_name || '');
    formData.append('last_name', last_name || '');
    formData.append('email', values.email);
    formData.append('student_code', values.student_code);
    formData.append('role_type', values.role_type);
    formData.append('sections', values.sections.join(',')); // Send selected sections as a comma-separated string

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
            <Radio value="STUDENT" label="Student" />
            <Radio value="INSTRUCTOR" label="Instructor" />
          </div>
        </RadioGroup>
        {form.values.role_type === 'STUDENT' && (
          <div className="mt-4">
            <SectionSelector
              setSections={(sections: string[]) => form.setFieldValue('sections', sections)}
              defaultEnabled={true} // Automatically show the section selector
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
          <Button type="submit" className="ml-2">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SingleUser;
