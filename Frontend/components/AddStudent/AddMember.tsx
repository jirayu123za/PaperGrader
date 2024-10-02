import React, { useState } from 'react';
import { Modal, Button } from '@mantine/core';
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
          <Button onClick={handleSingleUserOpen}>Single User</Button>
          <Button onClick={handleCsvOpen}>CSV File</Button>
        </div>
      </Modal>

      {/* ดึงมาใช้ */}
      <SingleUser isOpen={isSingleUserOpen} onClose={() => setIsSingleUserOpen(false)} />
      <CsvFile isOpen={isCsvOpen} onClose={() => setIsCsvOpen(false)} />
    </>
  );
};

export default AddMemberModal;
