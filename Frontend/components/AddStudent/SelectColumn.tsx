import React from 'react';
import { Modal, Button, Select, RadioGroup, Radio, Text, Table } from '@mantine/core';
import useCSVdataStore from '../../store/add member/useCSVdataStore';
import useColumnSelectStore, { ColumnSelectStore } from '../../store/add member/useColumnSelectStore';

interface SelectColumnProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelectColumn: React.FC<SelectColumnProps> = ({ isOpen, onClose }) => {  
  const csvData = useCSVdataStore((state) => state.csvData);
  const { selectedColumns, role, setSelectedColumn, setRole, setImportData, errors, setErrors, clearErrors, } = useColumnSelectStore();
  const csvHeaders = csvData?.columns || [];

  const validateColumns = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'section'] as const;
    const errors: Partial<ColumnSelectStore['errors']> = {};

    requiredFields.forEach((field) => {
      if (!selectedColumns[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    setErrors(errors);
  
    return Object.keys(errors).length === 0;
  };

  const renderPreviewRows = () => {
    const previewRows = csvData?.data.slice(0, 3) || [];
    return previewRows.map((row, index) => (
      <tr key={index}>
        <td>{row[selectedColumns.firstName] || '-'}</td>
        <td>{row[selectedColumns.lastName] || '-'}</td>
        <td>{row[selectedColumns.email] || '-'}</td>
        <td>{row[selectedColumns.studentId] || '-'}</td>
        <td>{row[selectedColumns.section] || '-'}</td>
      </tr>
    ));
  };

  const handleImport = () => {
    clearErrors();
    if (!validateColumns()) return;

    if (csvData) {
      const columnData = {
        first_name: csvData.data.map((row) => row[selectedColumns.firstName]),
        last_name: csvData.data.map((row) => row[selectedColumns.lastName]),
        email: csvData.data.map((row) => row[selectedColumns.email]),
        student_code: csvData.data.map((row) => row[selectedColumns.studentId]),
        section: csvData.data.map((row) => row[selectedColumns.section]),
        role_type: role || 'Student',
      };
      setImportData(columnData);
      console.log('Import Data:', columnData);
      onClose();
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
                value={selectedColumns.firstName}
                onChange={(value) => setSelectedColumn('firstName', value || '')}
                error={errors.firstName}
              />
            </td>
            <td>
              <Select
                placeholder="Select a last name column"
                data={csvHeaders}
                value={selectedColumns.lastName}
                onChange={(value) => setSelectedColumn('lastName', value || '')}
                error={errors.lastName}
              />
            </td>
            <td>
              <Select
                placeholder="Select an email column"
                data={csvHeaders}
                value={selectedColumns.email}
                onChange={(value) => setSelectedColumn('email', value || '')}
                error={errors.email}
              />
            </td>
            <td>
              <Select
                placeholder="Select a section column"
                data={csvHeaders}
                value={selectedColumns.section}
                onChange={(value) => setSelectedColumn('section', value || '')}
                error={errors.section}
              />
            </td>
            <td>
              <Select
                placeholder="Select a student ID column"
                data={csvHeaders}
                value={selectedColumns.studentId}
                onChange={(value) => setSelectedColumn('studentId', value || '')}
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
        value={role}
        onChange={setRole}
        className="mt-2"
        required
      >
        <div className="flex gap-4">
          <Radio value="STUDENT" label="Student" />
          <Radio value="INSTRUCTOR" label="Instructor" />
          <Radio value="TA" label="TA" />
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
