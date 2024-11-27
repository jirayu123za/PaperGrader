import React from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox, Text } from '@mantine/core';
import { useCreateAssignment } from '../../hooks/useCreate/useCreateAssignment';
import UploadFile from '../UploadFile';
import { useRouter } from 'next/router';
import { useFileStore } from '../../store/useFileStore';
import { useForm } from '@mantine/form';
import { Editor } from './Editor.tsx/Editor';
import SectionSelector from '../Create/Sections/SectionSelector';
import { useSelectSectionStore } from '../../store/useSectionStore';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { course_id } = router.query;
  const { files, templateFile, clearFiles } = useFileStore();
  const { mutate } = useCreateAssignment();
  const { selectedSections, setSelectedSections } = useSelectSectionStore();

  const form = useForm({
    initialValues: {
      assignment_name: '',
      assignment_description: '',
      submiss_by: 'student',
      group_submiss: false,
      sections: selectedSections,
    },
    validate: {
      assignment_name: (value) => (value ? null : 'Assignment name is required'),
      assignment_description: (value) => (value ? null : 'Assignment description is required'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData();
    formData.append('course_id', Array.isArray(course_id) ? course_id[0] : course_id || '');
    formData.append('assignment_name', values.assignment_name);
    formData.append('assignment_description', values.assignment_description);
    formData.append('submiss_by', values.submiss_by);
    formData.append('group_submiss', String(values.group_submiss));
    formData.append('sections', values.sections.join(','));

    if (templateFile) {
      formData.append('template_file', templateFile);
      formData.append('is_template', 'true');
    }

    files.forEach((file, index) => {
      formData.append(`is_template[${index}]`, file === templateFile ? 'true' : 'false');
      formData.append('files', file);
    });

    console.log('FormData Entries:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    mutate(formData, {
      onSuccess: () => {
        onClose();
        form.reset();
        clearFiles();
      },
      onError: (error) => {
        console.error('Error creating assignment:', error);
      },
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => {
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
          <Text size="sm" fw={500}>
            Assign to Sections
          </Text>
          <SectionSelector setSections={(sections: string[]) => form.setFieldValue('sections', sections)} />
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
          <RadioGroup {...form.getInputProps('submiss_by')} label="Who will upload submissions?" required>
            <div className="flex justify-start gap-8 mt-1">
              <Radio value="instructor" label="Instructor" />
              <Radio value="student" label="Student" />
            </div>
          </RadioGroup>
        </div>

        <Checkbox
          className="mt-2"
          label="Allow group submissions"
          {...form.getInputProps('group_submiss', { type: 'checkbox' })}
        />

        <div className="flex justify-end mt-6">
          <Button type="submit">Create Assignment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssignmentModal;
