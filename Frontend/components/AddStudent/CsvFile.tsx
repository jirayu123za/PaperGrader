import React, { useState } from 'react';
import { Modal, Button, Image } from '@mantine/core';
import useCSVdataStore from '../../store/add member/useCSVdataStore';

interface CsvFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (csvData: { [key: string]: string }[]) => void;
}

const CsvFile: React.FC<CsvFileModalProps> = ({ isOpen, onClose, onNext }) => {
  const [file, setFile] = useState<File | null>(null);
  const setCsvData = useCSVdataStore((state) => state.setCsvData);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      setFile(event.currentTarget.files[0]);
    }
  };

  const handleNext = () => {
    if (file) {
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
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Add Users from CSV File" size="xl">
      <p>Upload a CSV file to add multiple students or staff members.</p>

      <Image
        src="/Image/CSV.png"
        alt="CSV Upload Example"
        className="mt-4"
        radius="md"
        style={{ width: '100%', height: 'auto', maxWidth: '500px', margin: '0 auto' }}
      />

      <input type="file" accept=".csv" onChange={handleFileChange} className="mt-4" />
      <p className="text-sm text-gray-500 mt-2">{file ? `Selected file: ${file.name}` : 'No file selected'}</p>
      <div className="flex justify-end mt-4">
        <Button color="red" onClick={onClose}>Cancel</Button>
        <Button onClick={handleNext} className="ml-2">Next</Button>
      </div>
    </Modal>
  );
};

export default CsvFile;
