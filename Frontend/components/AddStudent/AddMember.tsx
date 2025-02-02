import React from 'react';
import SingleUser from './SingleUser';
import { Modal, Button, Divider, Alert } from '@mantine/core';
import { FaUser, FaUsers } from "react-icons/fa";
import { IconInfoCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { MdOutlineGroupAdd } from 'react-icons/md';
import { SelectMethods } from './SelectMethods';

const AddMemberModal: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [singleUserOpened, { open: openSingleUser, close: closeSingleUser }] = useDisclosure(false);
  const [selectMethodsOpened, { open: openSelectMethods, close: closeSelectMethods }] = useDisclosure(false);
  const addPersonIcon = <MdOutlineGroupAdd size={18} />;

  return (
    <>
      <Button onClick={open} leftSection={addPersonIcon} color='#4C6EF5'>
        Add Members
      </Button>
      
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
            <FaUser size={40} className="transition-colors duration-300" />
            <p className="mt-2">Single User</p>
          </div>

          <Divider orientation="vertical" />

          <div
            className="flex flex-col items-center cursor-pointer hover:text-blue-500"
            onClick={() => {
              openSelectMethods();
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
      <SelectMethods 
        isOpen={selectMethodsOpened} 
        onClose={closeSelectMethods}
      />
    </>
  );
};

export default AddMemberModal;
