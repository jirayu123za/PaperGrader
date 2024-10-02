import React from 'react';
import { Modal, Button, TextInput, RadioGroup, Radio, Checkbox } from '@mantine/core';

interface SingleUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SingleUser: React.FC<SingleUserModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal opened={isOpen} onClose={onClose} title="Add a User">
      <TextInput label="Name" placeholder="John Doe" required />
      <TextInput label="Email Address" placeholder="johndoe@example.com" required className="mt-4" />
      <TextInput label="Student ID # (Optional)" placeholder="12345" className="mt-4" />
      <RadioGroup label="Role" required className="mt-4">
        <Radio value="student" label="Student" />
        <Radio value="instructor" label="Instructor" />
        <Radio value="ta" label="TA" />
        <Radio value="reader" label="Reader" />
      </RadioGroup>
      <Checkbox label="Let user know that they were added to this course" className="mt-4" />
      <div className="flex justify-end mt-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onClose} className="ml-2">Submit</Button>
      </div>
    </Modal>
  );
};

export default SingleUser;
