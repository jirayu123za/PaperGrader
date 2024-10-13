import React, { useState } from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';
import { useAssignmentStore } from '../store/useCreateAssignmentStore';
import { useCreateAssignment } from '../hooks/useFetchCreateAssignment';
import UploadFile from './UploadFile';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import '@mantine/dates/styles.css';
import { useRouter } from 'next/router';
import { useFileStore } from '../store/useFileStore';
import { useForm } from '@mantine/form';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { course_id } = router.query;
  const { files, templateFile, clearFiles } = useFileStore();
  const { mutate } = useCreateAssignment();

  const {
    assignment_name,
    setAssignmentName,
    assignment_description,
    setAssignmentDescription,
    submiss_by,
    setUploadBy,
    release_date,
    setReleaseDate,
    due_date,
    setDueDate,
    group_submiss,
    setGroupSubmiss,
    setAllowLateSubmission,
    late_submiss,
    cut_off_date,
    setCutOffDate,
  } = useAssignmentStore();

  // const { mutate } = useCreateAssignment();
  // const [formError, setFormError] = useState('');

  const form = useForm({
    initialValues: {
      assignment_name: '',
      assignment_description: '',
      submiss_by: 'student',
      release_date: null,
      due_date: null,
      group_submiss: false,
      late_submiss: false,
      cut_off_date: null,
    },
    validate: {
      assignment_name: (value) => (value ? null : 'Assignment name is required'),
      assignment_description: (value) => (value ? null : 'Assignment description is required'),
    },
  });


  // const handleCreateAssignment = () => {
  //   if (!assignment_name || !assignment_description) {
  //     setFormError('Please fill in all required fields.');
  //     return;
  //   }

  //   const assignmentData = {
  //     course_id: Array.isArray(course_id) ? course_id[0] : course_id || '',
  //     assignment_name,
  //     assignment_description,
  //     submiss_by,
  //     release_date: release_date ? dayjs(release_date).format("DD-MM-YYYY") : '',
  //     due_date: due_date ? dayjs(due_date).format("DD-MM-YYYY") : '',
  //     group_submiss,
  //     late_submiss,
  //     cut_off_date: late_submiss && cut_off_date ? dayjs(cut_off_date).format("DD-MM-YYYY") : '',
  //   };

  //   console.log('assignmentData:', assignmentData);
  //   console.log('course_id:', course_id);

  //   mutate(assignmentData, {
  //     onSuccess: () => {
  //       console.log('Assignment created successfully');
  //       onClose();
  //     },
  //     onError: (error) => {
  //       console.error('Error creating assignment:', error);
  //     },
  //   });
  // };

  const handleSubmit = (values: typeof form.values) => {
    const formData = new FormData();
    formData.append('course_id', Array.isArray(course_id) ? course_id[0] : course_id || '');
    formData.append('assignment_name', values.assignment_name);
    formData.append('assignment_description', values.assignment_description);
    formData.append('submiss_by', values.submiss_by);

    formData.append('release_date', values.release_date ? dayjs(values.release_date).format('MM-DD-YYYY') : '');
    formData.append('due_date', values.due_date ? dayjs(values.due_date).format('MM-DD-YYYY') : '');
    formData.append('group_submiss', String(values.group_submiss));
    formData.append('late_submiss', String(values.late_submiss));

    if (values.late_submiss && values.cut_off_date) {
      formData.append('cut_off_date', dayjs(values.cut_off_date).format("MM-DD-YYYY"));
    }

    files.forEach((file) => {
      formData.append('files', file);
    });

    if (templateFile) {
      formData.append('template_file', templateFile);
    }

    console.log('formData:', form.values);

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
    // <Modal
    //   opened={isOpen}
    //   onClose={onClose}
    //   title="Create Assignment"
    //   size="lg"
    //   overlayProps={{ opacity: 0.55, blur: 3 }}
    // >
    //   <div className="p-4">
    //     <TextInput
    //       label="Assignment Name"
    //       placeholder="Name your assignment"
    //       value={assignment_name}
    //       onChange={(event) => setAssignmentName(event.currentTarget.value)}
    //       required
    //       className="mb-4"
    //     />

    //     <TextInput
    //       label="Assignment Description"
    //       placeholder="Add your assignment description"
    //       value={assignment_description}
    //       onChange={(event) => setAssignmentDescription(event.currentTarget.value)}
    //       required
    //       className="mb-4"
    //     />

    //     {formError && (
    //       <div className="text-red-500 mb-4">
    //         {formError}
    //       </div>
    //     )}

    //     {/* ส่วนสำหรับการอัพโหลดไฟล์ */}
    //     <div className="flex flex-col mb-4">
    //       <p className="text-sm text-gray-700 mb-2"> 
    //         Upload File
    //       </p>
    //       <div className="mt-2">
    //         <UploadFile /> 
    //       </div>
    //     </div>

    //     <div className="mt-4">
    //       <p className="text-sm text-gray-500 mb-1">Who will upload submissions?</p>
    //       <RadioGroup value={submiss_by} onChange={setUploadBy} required>
    //         <div className="flex justify-start gap-8">
    //           <Radio value="instructor" label="Instructor" />
    //           <Radio value="student" label="Student" />
    //         </div>
    //       </RadioGroup>
    //     </div>

    //     {/* DatePickerInput สำหรับ Release Date และ Due Date */}
    //     <div className="flex justify-between mt-4 mb-4 gap-4">
    //       <div className="w-full">
    //         <DatePickerInput
    //           label="Release Date"
    //           placeholder="Select release date"
    //           value={release_date ? new Date(release_date) : null}
    //           minDate={new Date()}
    //           onChange={(date) => {
    //             setReleaseDate(date ? dayjs(date).toDate() : null);
    //             setDueDate(null);
    //             setCutOffDate(null);
    //           }}
    //           valueFormat="DD/MM/YYYY"
    //           required
    //         />
    //       </div>
    //       <div className="w-full">
    //         <DatePickerInput
    //           label="Due Date"
    //           placeholder="Select due date"
    //           value={due_date ? new Date(due_date) : null}
    //           minDate={release_date ? new Date(release_date) : undefined}
    //           onChange={(date) => {
    //             setDueDate(date ? dayjs(date).toDate() : null);
    //             setCutOffDate(null);
    //           }}
    //           valueFormat="DD/MM/YYYY"
    //           required
    //         />
    //       </div>
    //     </div>

    //     <Checkbox
    //       label="Allow late submissions"
    //       checked={late_submiss}
    //       onChange={(event) => setAllowLateSubmission(event.currentTarget.checked)}
    //       className="mb-1"
    //     />
    //     <Checkbox
    //       label="Allow group submissions"
    //       checked={group_submiss}
    //       onChange={(event) => setGroupSubmiss(event.currentTarget.checked)}
    //     />

    //     {/* แสดง Cut off Date ถ้ามีการเลือก Allow late submissions */}
    //     {late_submiss && (
    //       <DatePickerInput
    //         label="Cut off Date"
    //         placeholder="Select cut off date"
    //         value={cut_off_date ? new Date(cut_off_date) : null}
    //         minDate={due_date ? dayjs(new Date(due_date)).add(1, 'day').toDate() : new Date()}
    //         onChange={(date) => setCutOffDate(date ? dayjs(date).toDate() : null)}
    //         valueFormat="DD/MM/YYYY"
    //         className="mt-4"
    //       />
    //     )}

    //     <div className="flex justify-end mt-6">
    //       <Button onClick={handleCreateAssignment}>
    //         Create Assignment
    //       </Button>
    //     </div>
    //   </div>
    // </Modal>

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
    <form 
      onSubmit={form.onSubmit(handleSubmit)}
      className='p-4' 
    >
      <TextInput
        className="mb-4"
        label="Assignment Name" 
        placeholder="Name your assignment"
        {...form.getInputProps('assignment_name')}
        required
      />
      <TextInput
        className="mb-4"
        label="Assignment Description" 
        placeholder="Add your assignment description"
        {...form.getInputProps('assignment_description')} 
        required
      />

      {/* ส่วนสำหรับการอัพโหลดไฟล์ */}
      <div className="flex flex-col mb-4">
        <p className="text-sm text-gray-700 mb-2"> 
          Upload File
          </p>
          <div className="mt-2">
            <UploadFile /> 
          </div>
      </div>
      <div className="mt-4">
          <RadioGroup
            {...form.getInputProps('submiss_by')} 
            label="Who will upload submissions?" 
            required
          >
          <div className="flex justify-start gap-8 mt-1">
            <Radio 
              value="instructor" 
              label="Instructor"
            />
            <Radio 
              value="student" 
              label="Student" 
            />            
          </div>
          </RadioGroup>
      </div>

      <div className="flex justify-between mt-4 mb-4 gap-4">
        <div className="w-full">
          <DatePickerInput
            label="Release Date"
            placeholder="Select release date"
            {...form.getInputProps('release_date')} 
            minDate={new Date()}
            valueFormat="DD/MM/YYYY"
            required
          />
        </div>
        <div className="w-full">
          <DatePickerInput
            label="Due Date"
            placeholder="Select due date" 
            {...form.getInputProps('due_date')}
            minDate={form.values.release_date ? new Date(form.values.release_date) : undefined}
            valueFormat="DD/MM/YYYY"
            required 
          />
        </div>
      </div>

      <Checkbox
        className="mb-1"
        label="Allow late submissions" 
        {...form.getInputProps('late_submiss', 
        { type: 'checkbox' })} 
      />
      <Checkbox 
        label="Allow group submissions" 
        {...form.getInputProps('group_submiss', 
        { type: 'checkbox' })} 
      />

      {form.values.late_submiss && (
        <DatePickerInput
          className="mt-4"
          label="Cut off Date" 
          placeholder="Select cut off date"
          {...form.getInputProps('cut_off_date')}
          minDate={form.values.due_date ? dayjs(new Date(form.values.due_date)).add(1, 'day').toDate() : new Date()}
          valueFormat="DD/MM/YYYY"
          required
        />
      )}

      <div className="flex justify-end mt-6">
        <Button type="submit">Create Assignment</Button>
      </div>
    </form>
  </Modal>
  );
};

export default CreateAssignmentModal;
