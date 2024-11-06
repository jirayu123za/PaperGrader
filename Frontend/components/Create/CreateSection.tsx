import React, { useEffect } from 'react';
import { Modal, Button, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateSection } from '../../hooks/useCreate/useCreateSection';
import { TagsInput } from '@mantine/core';

interface CreateSectionProps {
  opened: boolean;
  onClose: () => void;
}

const CreateSection: React.FC<CreateSectionProps> = ({ opened, onClose }) => {
  const form = useForm({
    initialValues: {
      name: [] as string[],
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Please enter at least one tag' : null),
    },
  });

  const createSectionMutation = useCreateSection();

  const handleSubmit = (values: { name: string[] }) => {
    createSectionMutation.mutate(
      { name: values.name },
      {
        onSuccess: () => {
          console.log('Section created successfully');
          onClose();
          form.reset();
        },
        onError: (error) => {
          console.error('Error creating section:', error);
        },
      }
    );
  };

  // ล้างข้อมูลในฟอร์มเมื่อ Modal ถูกปิด
  useEffect(() => {
    if (!opened) {
      form.reset();
    }
  }, [opened]);

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
        <Text fw={500} mb={4}>Section Tags</Text>
        <TagsInput
          placeholder="Enter tags and press enter, comma, or space"
          {...form.getInputProps('name')}
          splitChars={[' ', ',', '\n']}
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
