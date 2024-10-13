import React from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateSingleUser } from '../../hooks/useFetchCreateSingleUser';
// import { useUserStore } from '../../store/useCreateSingleUserStore';

interface SingleUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SingleUser: React.FC<SingleUserModalProps> = ({ isOpen, onClose }) => {
  const { mutate } = useCreateSingleUser();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      student_id: '',
      user_group_name: '',
      //notifyUser: false,
    },

    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid email format',
      user_group_name: (value) => (value ? null : 'Please select a role'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const [first_name, last_name] = values.name.split(' ');
    const formData = new FormData();

    formData.append('first_name', first_name || '');
    formData.append('last_name', last_name || '');
    formData.append('email', values.email);
    formData.append('student_id', values.student_id);
    formData.append('user_group_name', values.user_group_name);
    // formData.append('notifyUser', String(values.notifyUser));

    // setUser({ first_name, last_name, email: values.email, student_id: values.student_id, user_group_name: values.user_group_name/*, notifyUser: values.notifyUser */});

    console.log('Form data:', form.values);
    
    mutate(formData,
      // {
      //   name: values.name,
      //   email: values.email,
      //   student_id: values.student_id || undefined,
      //   user_group_name: values.user_group_name,
      //   notifyUser: values.notifyUser,
      // },
      {
        onSuccess: () => {
          console.log('User created successfully');
          form.reset();
          onClose();
        },
        onError: (error) => {
          console.error('Error creating user:', error);
        },
      }
    );
  };

  return (
    <Modal opened={isOpen} onClose={() => { form.reset(); onClose(); }} 
      title="Add a User">
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
          disabled
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
        {/* <Checkbox
          label="Let user know that they were added to this course"
          className="mt-4"
          {...form.getInputProps('notifyUser', { type: 'checkbox' })} 
        /> */}
        <div className="flex justify-end mt-4">
          <Button 
            variant="filled" color="red" 
            onClick={() => { form.reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" className="ml-2">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SingleUser;
