import React from 'react';
import { Modal, Button, Select, RadioGroup, Radio, Text, Table } from '@mantine/core';
import { useCreateMultipleUser } from '../../hooks/useCreate/useCreateMultipleUser';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import useCSVdataStore from '../../store/add member/useCSVdataStore';

interface SelectColumnProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelectColumn: React.FC<SelectColumnProps> = ({ isOpen, onClose }) => {  
  const csvData = useCSVdataStore((state) => state.csvData);
  const csvHeaders = csvData?.columns || [];
  const router = useRouter();
  const { mutate: createMultipleUser } = useCreateMultipleUser();
  const { course_id } = router.query;

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      section: '',
      role: 'STUDENT',
    },
    validate: {
      firstName: (value) => (value ? null : 'First Name is required'),
      lastName: (value) => (value ? null : 'Last Name is required'),
      email: (value) => (value ? null : 'Email is required'),
      section: (value) => (value ? null : 'Section is required'),
    },
  });

  const renderPreviewRows = () => {
    const previewRows = csvData?.data.slice(0, 3) || [];
    return previewRows.map((row, index) => (
      <tr key={index}>
        <td>{row[form.values.firstName] || '-'}</td>
        <td>{row[form.values.lastName] || '-'}</td>
        <td>{row[form.values.email] || '-'}</td>
        <td>{row[form.values.studentId] || '-'}</td>
        <td>{row[form.values.section] || '-'}</td>
      </tr>
    ));
  };

  const handleImport = () => {
    const isValid = form.validate();

    if (!isValid.hasErrors && csvData) {
      const formData = new FormData();

      const columnData = {
        first_name: csvData.data.map((row) => row[form.values.firstName]),
        last_name: csvData.data.map((row) => row[form.values.lastName]),
        email: csvData.data.map((row) => row[form.values.email]),
        section: csvData.data.map((row) => row[form.values.section]),
        student_code: csvData.data.map((row) => row[form.values.studentId]),
        role_type: form.values.role,
      };

      formData.append('data', JSON.stringify(columnData));

      console.log('Prepared FormData:', columnData); 

      createMultipleUser({ formData, course_id: Array.isArray(course_id) ? course_id[0] : course_id || '' }, {
        onSuccess: () => {
          console.log('Users imported successfully');
          onClose();
        },
        onError: (error) => {
          console.error('Error importing users:', error);
        },
      });
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Import course members from a CSV file"
      size="xl"
    >
      <Text color="dimmed" size="sm" mb="md">
        Match columns from your CSV file to the required fields, and select the role of the new members.
      </Text>

      {/* Part of Column and Table */}
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
            <th>Section</th>
            <th>Student ID (Optional)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Select
                placeholder="Select a first name column"
                data={csvHeaders}
                {...form.getInputProps('firstName')}
              />
            </td>
            <td>
              <Select
                placeholder="Select a last name column"
                data={csvHeaders}
                {...form.getInputProps('lastName')}
              />
            </td>
            <td>
              <Select
                placeholder="Select an email column"
                data={csvHeaders}
                {...form.getInputProps('email')}
              />
            </td>
            <td>
              <Select
                placeholder="Select a section column"
                data={csvHeaders}
                {...form.getInputProps('section')}
              />
            </td>
            <td>
              <Select
                placeholder="Select a student ID column"
                data={csvHeaders}
                {...form.getInputProps('studentId')}
              />
            </td>
          </tr>

          {/* แสดงข้อมูลตัวอย่างใต้ Select */}
          {renderPreviewRows()}
          {csvData && csvData.data.length > 3 && (
            <tr>
              <td colSpan={5}>
                <Text color="dimmed" size="sm">
                  ... and {csvData.data.length - 3} other rows
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* การเลือก Role */}
      <Text mt="md" fw={500}>
        Role
      </Text>
      <RadioGroup
        {...form.getInputProps('role')}
        className="mt-2"
        required
      >
        <div className="flex gap-4">
          <Radio value="STUDENT" label="Student" />
          <Radio value="INSTRUCTOR" label="Instructor" disabled/>
          <Radio value="TA" label="TA" disabled/>
        </div>
      </RadioGroup>

      {/* ปุ่มสำหรับ Cancel และ Import */}
      <div className="flex justify-end mt-6">
        <Button color="red" onClick={onClose}>
          Cancel
        </Button>
        <Button className="ml-2" onClick={handleImport} disabled={!csvData}>
          Import
        </Button>
      </div>
    </Modal>
  );
};

export default SelectColumn;
