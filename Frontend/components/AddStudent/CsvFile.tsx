import React from 'react';
import { Modal, Button, Image, FileInput } from '@mantine/core';
import { FaFileCsv } from "react-icons/fa";
import { useUploadFile } from '../../hooks/useFetchDataFormFile';
import useCSVdataStore from '../../store/add member/useCSVdataStore';

interface CsvFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (csvData: { [key: string]: string }[]) => void;
}

const CsvFile: React.FC<CsvFileModalProps> = ({ isOpen, onClose, onNext }) => {
  const uploadFileMutation = useUploadFile();
  const { selectedFile, setSelectedFile, setCsvData } = useCSVdataStore();

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleNext = () => {
    if (selectedFile) {
      uploadFileMutation.mutate({ file: selectedFile }, {
        onSuccess: (data) => {
          setCsvData(data);
          onNext(data.data);
          onClose();
        },
        onError: () => {
          console.log('Failed to upload the file. Please try again.');
        },
      });
    } else {
      console.log('No file selected. Please upload a file.');      
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
