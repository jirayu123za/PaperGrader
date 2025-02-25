import React from 'react';
import SingleUser from './SingleUser';
import { Menu, Button } from '@mantine/core';
import { FaUser, FaUsers } from "react-icons/fa";
import { MdOutlineGroupAdd } from 'react-icons/md';
import { SelectMethods } from './SelectMethods';
import { useDisclosure } from '@mantine/hooks';

const AddMemberDropdown: React.FC = () => {
  const [singleUserOpened, { open: openSingleUser, close: closeSingleUser }] = useDisclosure(false);
  const [selectMethodsOpened, { open: openSelectMethods, close: closeSelectMethods }] = useDisclosure(false);
  const addPersonIcon = <MdOutlineGroupAdd size={18} />;

  return (
    <>
      {/* Dropdown Menu */}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button leftSection={addPersonIcon} color='#4C6EF5'>
            Add Members
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<FaUser size={16} />}
            onClick={openSingleUser} 
          >
            Single User
          </Menu.Item>
          <Menu.Item
            leftSection={<FaUsers size={16} />}
            onClick={openSelectMethods} 
          >
            Import CSV
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Single user Modal */}  
      <SingleUser isOpen={singleUserOpened} onClose={closeSingleUser} />
      
      {/* CSV File Modal */}
      <SelectMethods isOpen={selectMethodsOpened} onClose={closeSelectMethods} />
    </>
  );
};

export default AddMemberDropdown;
