import React, { useState } from 'react';
import { Modal, Button } from '@mantine/core';

interface CsvFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CsvFile: React.FC<CsvFileModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      setFile(event.currentTarget.files[0]);
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Add Users from CSV File">
      <p>Upload a CSV file to add multiple students or staff members.</p>
      <input type="file" accept=".csv" onChange={handleFileChange} className="mt-4" />
      <p className="text-sm text-gray-500 mt-2">{file ? `Selected file: ${file.name}` : 'No file selected'}</p>
      <div className="flex justify-end mt-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onClose} className="ml-2">Submit</Button>
      </div>
    </Modal>
  );
};

export default CsvFile;
