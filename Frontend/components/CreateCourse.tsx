import React from 'react';
import { Modal, Button, TextInput, Select, Checkbox } from '@mantine/core';
import { useCreateCourseStore } from '../store/useCreateCourseStore'; // นำเข้า Zustand store
import { useCreateCourse } from '../hooks/UseCreateCourse'; // นำเข้า React Query hook
import YearPicker from './YearPicker'; // นำเข้า YearPicker Component

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCourse: React.FC<CreateCourseModalProps> = ({ isOpen, onClose }) => {
  const {
    courseNumber,
    setCourseNumber,
    courseName,
    setCourseName,
    courseDescription,
    setCourseDescription,
    term,
    setTerm,
    year,
    setYear,
    entryCode,
    setEntryCode,
    resetForm,
  } = useCreateCourseStore(); // ดึง state และ functions จาก Zustand store

  // ดึงค่า mutate จากผลลัพธ์ของ useMutation
  const { mutate } = useCreateCourse(); // ใช้ React Query custom hook

  const handleCreateCourse = () => {
    const courseData = {
      courseNumber,
      courseName,
      courseDescription,
      term,
      year,
      entryCode,
    };

    // เรียกใช้ mutation เพื่อสร้างคอร์สใหม่
    mutate(courseData, {
      onSuccess: () => {
        console.log('Course created successfully');
        resetForm(); // รีเซ็ตฟอร์มหลังจากสร้างคอร์สสำเร็จ
        onClose(); // ปิด Modal หลังจากสร้างคอร์สเสร็จ
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
          placeholder="eg. Econ 101"
          value={courseNumber}
          onChange={(event) => setCourseNumber(event.currentTarget.value)}
          required
        />
        <TextInput
          label="Course Name"
          placeholder="eg. Introduction to Macroeconomics"
          value={courseName}
          onChange={(event) => setCourseName(event.currentTarget.value)}
          required
          className="mt-4"
        />
        <TextInput
          label="Course Description"
          placeholder="Course description"
          value={courseDescription}
          onChange={(event) => setCourseDescription(event.currentTarget.value)}
          className="mt-4"
        />
        <div className="flex gap-4 mt-4">
          <Select
            label="Term"
            placeholder="Select term"
            data={['1', '2', '3']}
            value={term}
            onChange={(value) => setTerm(value!)}
            required
            className="w-full"
          />
          <YearPicker
            value={year}
            onChange={setYear} // เชื่อมโยงกับ Zustand Store
          />
        </div>

        <Checkbox
          label="Allow students to enroll via course entry code"
          checked={entryCode}
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
