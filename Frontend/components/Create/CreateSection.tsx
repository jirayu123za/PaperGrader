import React from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TagsInput } from '@mantine/core';
import { useCreateSections } from '../../hooks/useCreate/useCreateSection';
import { useRouter } from 'next/router';
import { useDisclosure } from '@mantine/hooks';
import { RiAddLargeLine } from 'react-icons/ri';

const CreateSection: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const [opened, { open, close }] = useDisclosure(false);
  const { mutate } = useCreateSections();
  const addSectionIcon = <RiAddLargeLine strokeWidth={4} size={10}/>

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

    mutate({ section_name: sectionNames, course_id: course_id as string }, {
      onSuccess: () => {
        close();
        form.reset();
      },
      onError: (error) => {
        console.error('Error creating section:', error);
      },
    });
  };

  return (
    <>
      <Button
        onClick={open}
        color='#4C6EF5'
        leftSection={addSectionIcon}
      >
        Create Section
      </Button>

      <Modal
        opened={opened}
        onClose={close}
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
    </>
  );
};

export default CreateSection;