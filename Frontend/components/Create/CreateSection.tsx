"use client";

import React from 'react';
import { Modal, Button, Text, Alert, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TagsInput } from '@mantine/core';
import { useCreateSections } from '../../hooks/useCreate/useCreateSection';
import { useParams } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { RiAddLargeLine } from 'react-icons/ri';

const CreateSection: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
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
          title: {
            fontSize: '1.15rem',
            fontWeight: 400,
          },
          body: {
            padding: '0px',
          },
        }}
      >
      
      <Alert>
        <Text size="sm" c="dimmed" mb={5}>
          Create a new section by entering the tags below. You can add multiple tags separated by commas or spaces.
        </Text>
      </Alert>

      <form onSubmit={form.onSubmit(handleSubmit)} className='p-4 pt-6'>
        <TagsInput
          placeholder="Enter tags and press enter, comma, or space"
          {...form.getInputProps('section_name')}
          splitChars={[' ', ',', '\n']}
          className="mb-4"
        />

        <Flex justify="end" align="center" mt={24} gap={6}>
          <Button variant="outline" color="red" onClick={close}>
            Cancel
          </Button>        
          <Button type="submit">
            Create
          </Button>          
        </Flex>
      </form>
    </Modal>
    </>
  );
};

export default CreateSection;