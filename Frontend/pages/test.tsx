import React, { useState } from 'react';
import { Button } from '@mantine/core';
import CreateSection from '../components/Create/CreateSection';

const YourComponent = () => {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <div>
      <Button onClick={() => setModalOpened(true)}>Open Create Section</Button>
      <CreateSection opened={modalOpened} onClose={() => setModalOpened(false)} />
    </div>
  );
};

export default YourComponent;
