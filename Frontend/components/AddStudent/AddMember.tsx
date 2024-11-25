import React, { useState } from 'react';
import { Modal, Button, Divider, Alert } from '@mantine/core';
import { FaUser, FaUsers } from "react-icons/fa";
import SingleUser from './SingleUser';
import CsvFile from './CsvFile';
import { IconInfoCircle } from '@tabler/icons-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const [isSingleUserOpen, setIsSingleUserOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  const icon = <IconInfoCircle />;

  const handleSingleUserOpen = () => {
    setIsSingleUserOpen(true);
    onClose();
  };

  const handleCsvOpen = () => {
    setIsCsvOpen(true);
    onClose();
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="Add Students or Staff">
        <Alert variant="light" color="blue" icon={icon}>
          Add a single user or upload a CSV file to add multiple users at once.
        </Alert>
        <div className="flex justify-around items-center mt-6">
          <div
            className="flex flex-col items-center cursor-pointer hover:text-blue-500"
            onClick={handleSingleUserOpen}
          >
            <FaUser size={50} className="transition-colors duration-300" />
            <p className="mt-2">Single User</p>
          </div>

          <Divider orientation="vertical" />

          <div
            className="flex flex-col items-center cursor-pointer hover:text-blue-500"
            onClick={handleCsvOpen}
          >
            <FaUsers size={50} className="transition-colors duration-300" />
            <p className="mt-2">CSV File</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="filled" color="red" onClick={() => onClose()}>
            Cancel
          </Button>
        </div>
      </Modal>

      <SingleUser isOpen={isSingleUserOpen} onClose={() => setIsSingleUserOpen(false)} />
      <CsvFile isOpen={isCsvOpen} onClose={() => setIsCsvOpen(false)} />
    </>
  );
};

export default AddMemberModal;
