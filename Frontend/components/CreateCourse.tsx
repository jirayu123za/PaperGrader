import React from 'react';
import { Modal, Button, TextInput, Select, Checkbox } from '@mantine/core';
import { useCreateCourseStore } from '../store/useCreateCourseStore';
import { useCreateCourse } from '../hooks/useCreateCourse';
import YearPicker from './YearPicker';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCourse: React.FC<CreateCourseModalProps> = ({ isOpen, onClose }) => {
  const {
    course_code,
    setCourseNumber,
    course_name,
    setCourseName,
    course_description,
    setCourseDescription,
    term,
    setTerm,
    year,
    setYear,
    entry_code,
    setEntryCode,
    resetForm,
  } = useCreateCourseStore();

  // ดึงค่า mutate จากผลลัพธ์ของ useMutation
  const { mutate } = useCreateCourse();

  const handleCreateCourse = async () => {
    const courseData = {
      course_code,
      course_name,
      course_description,
      term,
      year,
      entry_code,
    };

    // เรียกใช้ mutation เพื่อสร้างคอร์สใหม่
    mutate(courseData, {
      onSuccess: () => {
        console.log('Course created successfully');
        resetForm();
        onClose();
      },
      onError: (error) => {
        console.error('Error creating course:', error);
      },
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Enter your course details below."
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <div>
        <TextInput
          label="Course Number"
          placeholder="eg. 261214 "
          value={course_code}
          onChange={(event) => setCourseNumber(event.currentTarget.value)}
          type="number"
          required
        />
        <TextInput
          label="Course Name"
          placeholder="eg. Introduction to Macroeconomics"
          value={course_name}
          onChange={(event) => setCourseName(event.currentTarget.value)}
          required
          className="mt-4"
        />
        <TextInput
          label="Course Description"
          placeholder="Course description"
          value={course_description}
          onChange={(event) => setCourseDescription(event.currentTarget.value)}
          className="mt-4"
        />
        <div className="flex gap-4 mt-4">
          <Select
            label="Semester"
            placeholder="Select semester"
            data={['1', '2', '3']}
            value={term}
            onChange={(value) => setTerm(value!)}
            required
            className="w-full"
          />
          <YearPicker
            value={year}
            onChange={setYear}
          />
        </div>

        <Checkbox
          label="Allow students to enroll via course entry code"
          checked={entry_code}
          onChange={(event) => setEntryCode(event.currentTarget.checked)}
          className="mt-4"
        />
        <div className="flex justify-end mt-4">
          <Button variant="default" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleCreateCourse}>
            Create Course
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCourse;
