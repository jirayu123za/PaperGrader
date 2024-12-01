import React, { useState } from 'react';
import { Modal, Button, Divider, Alert } from '@mantine/core';
import { FaUser, FaUsers } from "react-icons/fa";
import SingleUser from './SingleUser';
import CsvFile from './CsvFile';
import SelectColumn from './SelectColumn';
import { IconInfoCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

const AddMemberModal: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [singleUserOpened, { open: openSingleUser, close: closeSingleUser }] = useDisclosure(false);
  const [csvOpened, { open: openCsv, close: closeCsv }] = useDisclosure(false);
  const [selectColumnOpened, { open: openSelectColumn, close: closeSelectColumn }] = useDisclosure(false);

  const handleNextFromCsvFile = () => {
    closeCsv();
    openSelectColumn();
  };

  return (
    <>
     <Button onClick={open}>Add Members</Button>
      <Modal opened={opened} onClose={close} title="Add Students or Staff">
        <Alert variant="light" color="blue" icon={<IconInfoCircle />}>
          Add a single user or upload a CSV file to add multiple users at once.
        </Alert>
        <div className="flex justify-around items-center mt-6">
          <div
            className="flex flex-col items-center cursor-pointer hover:text-blue-500"
            onClick={() => {
              openSingleUser();
              close();
            }}
          >
            <FaUser size={50} className="transition-colors duration-300" />
            <p className="mt-2">Single User</p>
          </div>

          <Divider orientation="vertical" />

          <div
            className="flex flex-col items-center cursor-pointer hover:text-blue-500"
            onClick={() => {
              openCsv();
              close();
            }}
          >
            <FaUsers size={50} className="transition-colors duration-300" />
            <p className="mt-2">CSV File</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="filled" color="red" onClick={close}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Single user Modal */}  
      <SingleUser
        isOpen={singleUserOpened}
        onClose={closeSingleUser}
      />
      {/* CSV File Modal */}
      <CsvFile
        isOpen={csvOpened}
        onClose={closeCsv}
        onNext={handleNextFromCsvFile}
      />
      {/* Select Column Modal */}
      <SelectColumn 
        isOpen={selectColumnOpened} 
        onClose={closeSelectColumn} />
    </>
  );
};

export default AddMemberModal;
