import React, { useState } from 'react';
import { Modal, Button, TextInput, Select, Checkbox } from '@mantine/core';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCourse: React.FC<CreateCourseModalProps> = ({ isOpen, onClose }) => {
  const [courseNumber, setCourseNumber] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');
  const [school, setSchool] = useState('Turnitin University');
  const [department, setDepartment] = useState('');
  const [entryCode, setEntryCode] = useState(false);

  const handleCreateCourse = () => {
    console.log({
      courseNumber,
      courseName,
      courseDescription,
      term,
      year,
      school,
      department,
      entryCode,
    });
    onClose(); // ปิด Modal หลังจากสร้าง Course
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
            data={['Spring', 'Summer', 'Fall']}
            value={term}
            onChange={(value) => setTerm(value!)}
            required
            className="w-full"
          />
          <Select
            label="Year"
            placeholder="Select year"
            data={['2023', '2024', '2025']}
            value={year}
            onChange={(value) => setYear(value!)}
            required
            className="w-full"
          />
        </div>
        <TextInput
          label="School"
          value={school}
          disabled
          className="mt-4"
        />
        <Select
          label="Department"
          placeholder="Please select"
          data={['Computer Science', 'Mathematics', 'Physics']}
          value={department}
          onChange={(value) => setDepartment(value!)}
          required
          className="mt-4"
        />
        <Checkbox
          label="Allow students to enroll via course entry code"
          checked={entryCode}
          onChange={(event) => setEntryCode(event.currentTarget.checked)}
          className="mt-4"
        />
        <div className="flex justify-end mt-4">
          <Button
            variant="default"
            onClick={onClose}
            className="mr-2"
          >
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
