"use client";

import React from 'react';
import SectionSelector from '../Create/Sections/SectionSelector';
import UploadFile from '../UploadFile';
import { Modal, Button, TextInput, RadioGroup, Radio, Text } from '@mantine/core';
import { useCreateAssignment } from '../../hooks/useCreate/useCreateAssignment';
import { useParams } from 'next/navigation';
import { useFileStore } from '../../store/useFileStore';
import { useForm } from '@mantine/form';
import { Editor } from './Editor.tsx/Editor';
import { useSelectSectionStore } from '../../store/useSectionStore';
import { notifications } from '@mantine/notifications';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose }) => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { files, templateFile, clearFiles } = useFileStore();
  const { mutate } = useCreateAssignment();
  const { selectedSections, resetSelectedSections } = useSelectSectionStore();

  const form = useForm({
    initialValues: {
      assignment_name: '',
      assignment_description: '',
      submitted_by: 'student',
      group_submitted: false,
    },
    validate: {
      assignment_name: (value) => (value ? null : 'Assignment name is required'),
      assignment_description: (value) => (value ? null : 'Assignment description is required'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData();
    formData.append('assignment_name', values.assignment_name);
    formData.append('assignment_description', values.assignment_description);
    formData.append('submitted_by', values.submitted_by);
    formData.append('sections', selectedSections.join(','));


    const toUpload: File[] = [...files];


    if (
      templateFile &&
      !toUpload.some(
        (f) => f === templateFile || (f.name === templateFile.name && f.size === templateFile.size)
      )
    ) {
      toUpload.push(templateFile);
    }

    if (toUpload.length === 0) {
      notifications.show({
        title: 'No file',
        message: 'กรุณาอัปโหลดอย่างน้อย 1 ไฟล์ (เช่น Template)',
        color: 'red',
      });
      return;
    }


    toUpload.forEach((file, index) => {
      const isTemplate =
        !!templateFile &&
        (file === templateFile ||
          (file.name === templateFile.name && file.size === templateFile.size));

      formData.append(`is_template[${index}]`, isTemplate ? 'true' : 'false');
      formData.append('files', file);

      notifications.show({
        title: isTemplate ? 'Template added' : 'File added',
        message: file.name,
        color: 'green',
      });
    });


    mutate(
      { formData, course_id: Array.isArray(course_id) ? course_id[0] : course_id || '' },
      {
        onSuccess: () => {
          onClose();
          resetSelectedSections();
          form.reset();
          clearFiles();
          notifications.show({
            title: 'Success',
            message: 'Assignment created successfully',
            color: 'green',
          });
        },
        onError: (error: any) => {
          notifications.show({
            title: 'Error',
            message: `${error?.response?.data?.error ?? 'Failed to create assignment'}`,
            color: 'red',
          });
        },
      }
    );
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => {
        resetSelectedSections();
        form.reset();
        clearFiles();
        onClose();
      }}
      title="Create Assignment"
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)} className="p-4">
        <TextInput
          className="mb-4"
          label="Assignment Name"
          placeholder="Name your assignment"
          {...form.getInputProps('assignment_name')}
          required
        />

        <Text size="sm" fw={500} mb={2}>
          Assignment Description
        </Text>
        <Editor onContentChange={(content) => form.setFieldValue('assignment_description', content)} />

        {/* Section Selector */}
        <div className="mb-4 mt-4">
          <SectionSelector />
        </div>

        {/* File Upload */}
        <div className="flex flex-col mb-4 mt-4">
          <Text size="sm" fw={500}>
            Upload File
          </Text>
          <div className="mt-2">
            <UploadFile />
          </div>
        </div>

        <div className="mt-4">
          <RadioGroup {...form.getInputProps('submitted_by')} label="Who will upload submissions?" required>
            <div className="flex justify-start gap-8 mt-1">
              <Radio value="instructor" label="Instructor" />
              <Radio value="student" label="Student" />
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit">Create Assignment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssignmentModal;
