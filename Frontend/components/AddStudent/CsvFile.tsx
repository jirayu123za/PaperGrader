import React, { useState } from 'react';
import { Modal, Button, Image } from '@mantine/core';
import useCSVdataStore from '../../store/add member/useCSVdataStore'; // Import Zustand store

interface CsvFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (csvData: { [key: string]: string }[]) => void; // Callback to open SelectColumn modal
}

const CsvFile: React.FC<CsvFileModalProps> = ({ isOpen, onClose, onNext }) => {
  const [file, setFile] = useState<File | null>(null);
  const { setCsvData, processXlsxData } = useCSVdataStore(); // เรียกใช้ฟังก์ชันจาก store

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      setFile(event.currentTarget.files[0]);
    }
  };

  const handleNext = async () => {
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        // Mock data สำหรับการทดสอบไฟล์ CSV
        const mockCsvData = {
          columns: ['firstName', 'lastName', 'email', 'studentId', 'Section', 'test'],
          data: [
            { firstName: 'John', lastName: 'Doe', email: 'john@example.com', studentId: '123', Section: '804', test: '804' },
            { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', studentId: '456', Section: '801', test: '804' },
            { firstName: 'Alex', lastName: 'Johnson', email: 'alex@example.com', studentId: '789', Section: '801', test: '804' },
          ],
        };

        setCsvData(mockCsvData); // บันทึกข้อมูล CSV ลงใน store
        console.log('CSV data stored:', mockCsvData);
        onNext(mockCsvData.data); // ส่งข้อมูลไปยัง SelectColumn modal
      } else if (fileExtension === 'xlsx') {
        // ใช้ฟังก์ชัน processXlsxData จาก store
        try {
          await processXlsxData(file); // ประมวลผลไฟล์ .xlsx
          const csvData = useCSVdataStore.getState().csvData; // ดึงข้อมูลที่จัดเก็บใน store
          console.log('XLSX data stored:', csvData);
          if (csvData) onNext(csvData.data); // ส่งข้อมูลไปยัง SelectColumn modal
        } catch (error) {
          console.error('Error processing XLSX file:', error);
          alert('Error processing the XLSX file. Please try again.');
        }
      } else {
        alert('Invalid file type. Please upload a CSV or XLSX file.');
      }
    } else {
      alert('No file selected. Please upload a file.');
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Add Users from File" size="xl">
      <p>Upload a CSV or XLSX file to add multiple students or staff members.</p>

      <Image
        src="/Image/CSV.png"
        alt="File Upload Example"
        className="mt-4"
        radius="md"
        style={{ width: '100%', height: 'auto', maxWidth: '700px', margin: '0 auto' }} // ปรับขนาดรูปให้ใหญ่ขึ้น
      />

      <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="mt-4" />
      <p className="text-sm text-gray-500 mt-2">
        {file ? `Selected file: ${file.name}` : 'No file selected'}
      </p>
      <div className="flex justify-end mt-4">
        <Button color="red" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleNext} className="ml-2">
          Next
        </Button>
      </div>
    </Modal>
  );
};

export default CsvFile;
