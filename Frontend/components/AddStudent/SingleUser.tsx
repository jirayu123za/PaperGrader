import React from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateUser } from '../../hooks/useCreateSingleUser'; // Import the custom hook
import { useUserStore } from '../../store/useStoreSingleUser'; // Import Zustand store

interface SingleUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SingleUser: React.FC<SingleUserModalProps> = ({ isOpen, onClose }) => {
  const { mutate } = useCreateUser(); // Use the mutation hook
  const { setUser } = useUserStore(); // Zustand for updating state

  // ใช้ useForm เพื่อจัดการฟอร์ม
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      studentId: '',
      role: '',
      notifyUser: false,
    },

    // กำหนด validation
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid email format',
      role: (value) => (value ? null : 'Please select a role'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const [first_name, last_name] = values.name.split(' '); // แยก first_name และ last_name

    // อัปเดต Zustand store
    setUser({ first_name, last_name, email: values.email, studentId: values.studentId, role: values.role, notifyUser: values.notifyUser });

    // ส่งข้อมูลไป backend ผ่าน React Query
    mutate(
      {
        first_name,
        last_name,
        email: values.email,
        studentId: values.studentId || undefined,
        role: values.role,
        notifyUser: values.notifyUser,
      },
      {
        onSuccess: () => {
          console.log('User created successfully');
          onClose(); // ปิด Modal หลังจากสำเร็จ
        },
        onError: (error) => {
          console.error('Error creating user:', error);
        },
      }
    );
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Add a User">
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
          placeholder="12345"
          className="mt-4"
          {...form.getInputProps('studentId')}
        />
        <RadioGroup
          label="Role"
          required
          className="mt-4"
          {...form.getInputProps('role')}
        >
          <div className="flex gap-4">
            <Radio value="student" label="Student" />
            <Radio value="instructor" label="Instructor" />
          </div>
        </RadioGroup>
        <Checkbox
          label="Let user know that they were added to this course"
          className="mt-4"
          {...form.getInputProps('notifyUser', { type: 'checkbox' })} 
        />
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" className="ml-2">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SingleUser;
