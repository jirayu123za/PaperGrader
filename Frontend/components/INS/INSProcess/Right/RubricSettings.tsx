'use client';

import { useState } from 'react';
import { Popover, Button, Radio, Text, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { IoIosSettings } from "react-icons/io";
import { useDisclosure } from '@mantine/hooks';

export function RubricSettings() {
  const [opened, { close, toggle }] = useDisclosure(false);
  const [scoringMethod, setScoringMethod] = useState<string | null>(null);

  return (
    <Popover
      width={380}
      position="bottom"
      withArrow
      arrowSize={14}
      shadow="xs"
      offset={-2}
      opened={opened}
      onClose={close}
    >
      <Popover.Target>
        <Button
          leftSection={<IoIosSettings size={18} />}
          variant="transparent"
          color="#495057"
          p={0}
          onClick={toggle}
        >
          Rubric Settings
        </Button>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Set rubric settings for this question."
          color="blue"
        />

        <Text size="sm" fw={500} p="8px">Select Scoring Method:</Text>

        <Radio.Group
          name="scoring-method"
          value={scoringMethod}
          onChange={setScoringMethod}
          className="pl-4 pr-4 pb-2"
        >
          <Radio
            value="negative"
            label="Negative scoring (points are subtracted from 5.0)"
            classNames={{
              root: 'mb-2 hover:text-blue-600 transition-colors',
            }}
          />
          <Radio
            value="positive"
            label="Positive scoring (points are added to 0)"
            classNames={{
              root: 'mb-2 hover:text-blue-600 transition-colors',
            }}
          />
        </Radio.Group>
      </Popover.Dropdown>
    </Popover>
  );
}
