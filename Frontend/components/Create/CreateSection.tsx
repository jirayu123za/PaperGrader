import React from 'react';
import { Modal, Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateSection } from '../../hooks/useCreate/useCreateSection';

interface CreateSectionProps {
  opened: boolean;
  onClose: () => void;
}

const CreateSection: React.FC<CreateSectionProps> = ({ opened, onClose }) => {
  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Section name must be at least 2 characters' : null),
    },
  });

  const createSectionMutation = useCreateSection();

  const handleSubmit = (values: typeof form.values) => {
    createSectionMutation.mutate(values, {
      onSuccess: () => {
        console.log('Section created successfully');
        onClose();
        form.reset();
      },
      onError: (error) => {
        console.error('Error creating section:', error);
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Section"  
      centered
      overlayProps={{
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 3,
      }}
      styles={{
        header: {
          backgroundColor: '#7E60BF', 
          padding: '16px',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 700,
        },
        title: {
          color: '#fff', 
        },
        content: {
          backgroundColor: '#f5f5dc',
        },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Section Name"
          placeholder="Enter section name"
          required
          {...form.getInputProps('name')}
          className="mb-4"
        />

        <Button type="submit" className="w-full bg-[#b7410e]">
          Create Section
        </Button>
      </form>
    </Modal>
  );
};

export default CreateSection;
