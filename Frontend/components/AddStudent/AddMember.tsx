import React, { useState } from 'react';
import { Modal, Button, Divider } from '@mantine/core';
import { FaUser, FaUsers } from "react-icons/fa";
import SingleUser from './SingleUser';
import CsvFile from './CsvFile';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const [isSingleUserOpen, setIsSingleUserOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

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
      <div className="flex justify-around items-center mt-6">
          <div className="text-center cursor-pointer" onClick={handleSingleUserOpen}>
            <FaUser size={50} />
            <p>Single User</p>
          </div>

          <Divider orientation="vertical" />

          <div className="text-center cursor-pointer" onClick={handleCsvOpen}>
            <FaUsers size={50} />
            <p>CSV File</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="filled" color="red" onClick={() => { onClose(); }}>
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
