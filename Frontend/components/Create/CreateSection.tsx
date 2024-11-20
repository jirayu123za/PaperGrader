import React from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TagsInput } from '@mantine/core';
import { useCreateSections } from '../../hooks/useCreate/useCreateSection';
import { useRouter } from 'next/router';

interface CreateSectionProps {
  opened: boolean;
  onClose: () => void;
}

const CreateSection: React.FC<CreateSectionProps> = ({ opened, onClose }) => {
  const router = useRouter();
  const { course_id } = router.query;
  const { mutate } = useCreateSections();

  const form = useForm({
    initialValues: {
      section_name: [] as string[],
    },
    validate: {
      section_name: (value) => (value.length < 1 ? 'Please enter at least one tag' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const sectionNames = values.section_name; 

    console.log('handleSubmit:', sectionNames);

    mutate({ section_name: sectionNames, course_id: course_id as string }, {
      onSuccess: () => {
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
        <Text fw={500} mb={4}>Section Tags</Text>
        <TagsInput
          placeholder="Enter tags and press enter, comma, or space"
          {...form.getInputProps('section_name')}
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