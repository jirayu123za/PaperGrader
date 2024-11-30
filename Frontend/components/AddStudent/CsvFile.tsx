import React, { useState } from 'react';
import { Modal, Button, Image, FileInput, rem  } from '@mantine/core';
import { FaFileCsv } from "react-icons/fa";
import useCSVdataStore from '../../store/add member/useCSVdataStore';

interface CsvFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (csvData: { [key: string]: string }[]) => void;
}

const CsvFile: React.FC<CsvFileModalProps> = ({ isOpen, onClose, onNext }) => {
  const [file, setFile] = useState<File | null>(null);
  const { setCsvData, processXlsxData } = useCSVdataStore();

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleNext = async () => {
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        const mockCsvData = {
          columns: ['firstName', 'lastName', 'email', 'studentId', 'Section', 'test'],
          data: [
            { firstName: 'John', lastName: 'Doe', email: 'john@example.com', studentId: '123', Section: '804', test: '804' },
            { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', studentId: '456', Section: '801', test: '804' },
            { firstName: 'Alex', lastName: 'Johnson', email: 'alex@example.com', studentId: '789', Section: '801', test: '804' },
          ],
        };

        setCsvData(mockCsvData);
        console.log('CSV data stored:', mockCsvData);
        onNext(mockCsvData.data);
        onClose();
      } else if (fileExtension === 'xlsx') {
        try {
          await processXlsxData(file);
          const csvData = useCSVdataStore.getState().csvData;
          console.log('XLSX data stored:', csvData);
          if (csvData) onNext(csvData.data);
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
        className="mt-4 mb-4"
        radius="md"
        style={{ width: '100%', height: '100%', maxWidth: '800px' }}
      />

      <FileInput
        leftSection={<FaFileCsv />}
        label="Attach your file"
        placeholder="Your file"
        leftSectionPointerEvents="none"
        clearable
        required
        accept=".csv,.xlsx"
        onChange={handleFileChange}
      />
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
