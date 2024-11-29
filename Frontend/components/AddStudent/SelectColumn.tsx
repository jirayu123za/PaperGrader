import React, { useState } from 'react';
import { Modal, Button, Select, RadioGroup, Radio, Text, Table } from '@mantine/core';
import useCSVdataStore from '../../store/add member/useCSVdataStore'; // ดึงข้อมูล CSV จาก Store
import useColumnSelectStore from '../../store/add member/useColumnSelectStore'; // นำเข้า Store สำหรับคอลัมน์

const SelectColumn: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const csvData = useCSVdataStore((state) => state.csvData); // ดึงข้อมูล CSV จาก Zustand store
  const setImportData = useColumnSelectStore((state) => state.setImportData); // ดึงฟังก์ชันจาก Store
  const [selectedColumns, setSelectedColumns] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    section: '',
  });
  const [role, setRole] = useState<string | null>('Student');

  const handleColumnChange = (field: string, value: string) => {
    setSelectedColumns((prev) => ({ ...prev, [field]: value }));
  };

  const csvHeaders = csvData?.columns || []; // ดึงชื่อคอลัมน์จาก store

  const renderPreviewRows = () => {
    const previewRows = csvData?.data.slice(0, 3) || []; // ดึงข้อมูล 3 แถวแรกจาก store
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
    if (csvData) {
      const columnData = {
        first_name: csvData.data.map((row) => row[selectedColumns.firstName]),
        last_name: csvData.data.map((row) => row[selectedColumns.lastName]),
        email: csvData.data.map((row) => row[selectedColumns.email]),
        student_code: csvData.data.map((row) => row[selectedColumns.studentId]),
        section: csvData.data.map((row) => row[selectedColumns.section]),
        role_type: role || 'Student',
      };

      // บันทึกข้อมูลลง Store
      setImportData(columnData);
      console.log('Import Data:', columnData);
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

      {/* ส่วนของการเลือก Column แบบรวมกับ Table */}
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
            <th>Student ID (Optional)</th>
            <th>Section (Optional)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Select
                placeholder="Select a first name column"
                data={csvHeaders}
                value={selectedColumns.firstName}
                onChange={(value) => handleColumnChange('firstName', value || '')}
              />
            </td>
            <td>
              <Select
                placeholder="Select a last name column"
                data={csvHeaders}
                value={selectedColumns.lastName}
                onChange={(value) => handleColumnChange('lastName', value || '')}
              />
            </td>
            <td>
              <Select
                placeholder="Select an email column"
                data={csvHeaders}
                value={selectedColumns.email}
                onChange={(value) => handleColumnChange('email', value || '')}
              />
            </td>
            <td>
              <Select
                placeholder="Select a student ID column"
                data={csvHeaders}
                value={selectedColumns.studentId}
                onChange={(value) => handleColumnChange('studentId', value || '')}
              />
            </td>
            <td>
              <Select
                placeholder="Select a section column"
                data={csvHeaders}
                value={selectedColumns.section}
                onChange={(value) => handleColumnChange('section', value || '')}
              />
            </td>
          </tr>

          {/* แสดงข้อมูลตัวอย่างใต้ Select */}
          {renderPreviewRows()}
          {csvData && csvData.data.length > 3 && (
            <tr>
              <td colSpan={5}>
                <Text color="dimmed" size="sm" align="center">
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
          <Radio value="Student" label="Student" />
          <Radio value="Instructor" label="Instructor" />
          <Radio value="TA" label="TA" />
        </div>
      </RadioGroup>

      {/* ปุ่มสำหรับ Cancel และ Import */}
      <div className="flex justify-end mt-6">
        <Button color="red" onClick={onClose}>
          Cancel
        </Button>
        <Button className="ml-2" onClick={handleImport}>
          Import
        </Button>
      </div>
    </Modal>
  );
};

export default SelectColumn;
