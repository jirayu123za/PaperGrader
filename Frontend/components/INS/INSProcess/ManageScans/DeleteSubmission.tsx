'use client'
import React from 'react'
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon, Button, Flex, Modal, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

type Props = {
  assignment_id: string;
  submission_id: string;
  submission_name?: string;
};

export const DeleteSubmission: React.FC<Props> = ({ assignment_id, submission_id, submission_name }) => {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <div className='group'>
            <Modal
                opened={opened}
                onClose={close}
                size={'md'}
                transitionProps={{ transition: 'rotate-left' }}
                title="Delete Submission"
            >
                <Text size="sm">
                    Are you sure you want to delete this submission? (<Text span c="red" fw={700}>{submission_name}</Text>) This action cannot be undone.
                </Text>
                <Flex justify="flex-end" mt="md" gap="xs">
                    <Button variant="outline" color="gray" onClick={close}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={() => {
                        // Add your delete submission logic here
                        close();
                    }}>
                        Delete
                    </Button>
                </Flex>
            </Modal>
            <ActionIcon 
                variant="subtle" 
                color="red" 
                onClick={open} 
                title="Delete" 
                className='group-hover:opacity-100 opacity-0 transition-opacity duration-200'
            >
                <IconTrash size={14} />
            </ActionIcon>        
        </div>
    )
}