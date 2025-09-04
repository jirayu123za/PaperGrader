'use client'

import React from 'react';
import { TextInput, Flex, Text, Loader, Box, Tooltip, ActionIcon } from '@mantine/core';
import { Editor } from '../../Create/Editor.tsx/AssignmentEditor';
import { useAssignmentSettingFormStore, useAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { FaSlidersH } from 'react-icons/fa';

const BasicSettings: React.FC = () => {
    const { values, reset } = useAssignmentSettingFormStore();
    const { showToolbar, toggleToolbar } = useAssignmentSettingStore();
    const [ isLoading, setIsLoading ] = React.useState(true);
      
    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);
    
    if (isLoading) {
        return (
            <Flex justify="center" align="center" py="md" h='500px'>
                <Loader color="blue" />
            </Flex>
        );
    }
    
    return (
        <Box mih={500}>
            <Flex direction="column" gap="md">
                <TextInput
                    label="Assignment Name"
                    placeholder="Enter assignment name"
                    required
                    value={values.assignmentName}
                    onChange={(event) => 
                        useAssignmentSettingFormStore.getState().setField('assignmentName', event.currentTarget.value)
                    }
                />

                <Flex direction="column" gap="4px">
                    <Flex direction="row" align="center" gap="2px">
                        <Text size="sm" fw={500}>
                            Assignment Description
                        </Text>
                        <Tooltip label={showToolbar ? "Hide toolbar" : "Show toolbar"} position="right" withArrow>
                            <ActionIcon
                                onClick={toggleToolbar}
                                variant="transparent"
                                color="gray"
                                size="sm"
                            >
                                <FaSlidersH size={14} />
                            </ActionIcon>
                        </Tooltip>
                    </Flex>
                    <Editor/>                        
                </Flex>
            </Flex>
        </Box>
    );
};

export default BasicSettings;
