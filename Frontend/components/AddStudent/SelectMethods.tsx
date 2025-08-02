"use client";

import React from 'react'
import useCSVdataStore from '../../store/add member/useCSVdataStore';
import useTemplateStore from '../../store/BoundingBox/useTemplateStore';
import { useParams } from 'next/navigation';
import { Box, Modal, Stepper, Flex, Button } from '@mantine/core'
import { FaRegCheckCircle } from 'react-icons/fa';
import { GrTemplate } from 'react-icons/gr';
import { TbFileTypeXls } from "react-icons/tb";
import { LuMousePointer } from 'react-icons/lu';
import { FirstStep } from './FirstStep';
import { SecondStep } from './SecondStep';
import { ThirdStep } from './ThirdStep';
import { useSetState } from '@mantine/hooks';
import { useUploadFile } from '../../hooks/useFetchDataFormFile';
import { useCreateMultipleUser } from '../../hooks/useCreate/useCreateMultipleUser';
import { notifications } from '@mantine/notifications';

interface SelectMethodsProps {  
    isOpen: boolean;
    onClose: () => void;
}  

const SelectMethods: React.FC<SelectMethodsProps> = ({ isOpen, onClose }) => {
    const params = useParams();
    const course_id = params?.course_id as string;
    const uploadFileMutation = useUploadFile();
    const createMultipleUserMutation = useCreateMultipleUser();
    const [state, setState] = useSetState({ active: 0 });
    const { selectedTemplate } = useTemplateStore();    
    const { selectedFile, clearCsvData, setSelectedFile, setCsvData, formValues } = useCSVdataStore();
    
    const handleNext = () => {
        if (state.active === 1) {
            if (selectedFile) {
                uploadFileMutation.mutate({ file: selectedFile }, {
                    onSuccess: (data) => {
                        setCsvData(data);
                        setState({ active: state.active + 1 });
                        notifications.show({
                            title: 'File Uploaded',
                            message: 'Your file has been successfully uploaded.',
                            color: 'green',
                        });
                    },
                    onError: (error) => {
                        notifications.show({
                            title: 'Upload Failed',
                            message: `${error.response?.data?.error}`,
                            color: 'red',
                        });
                    },
                });
            } else {
                notifications.show({
                    title: 'No File Selected',
                    message: 'Please upload a file.',
                    color: 'yellow',
                });
            }
        } else if (state.active === 2) {
            if (formValues) {
                const formData = new FormData();
                formData.append('data', JSON.stringify(formValues));
                createMultipleUserMutation.mutate(
                    { formData, course_id: course_id as string },
                    {
                        onSuccess: () => {
                            notifications.show({
                                title: 'Users Imported',
                                message: 'The users have been successfully imported.',
                                color: 'green',
                            });
                            handleClose();
                        },
                        onError: (error) => {
                            notifications.show({
                                title: 'Import Failed',
                                message: `${error.response?.data?.error}`,
                                color: 'red',
                            });
                        },
                    }
                );
            }
        } else if (state.active < 2) {
            setState({ active: state.active + 1 });
        }
    };

    const handleBack = () => {
        if (state.active > 0) setState({ active: state.active - 1 });
    };

    const handleClose = () => {
        setState({ active: 0 });
        setSelectedFile(null);
        clearCsvData();
        onClose();
    };

    const icons = {
        check: <FaRegCheckCircle size={22} />,
        template: <GrTemplate size={22} />,
        excel: <TbFileTypeXls size={22} />,
        match: <LuMousePointer size={22} />
    };

    const isNextDisabled = 
    (state.active === 0 && !selectedTemplate) ||
    (state.active === 1 && !selectedFile) ||
    (state.active === 2 && createMultipleUserMutation.isPending);

    return (
        <Modal 
            opened={isOpen}
            onClose={handleClose} 
            title="Add multiple students or staff" 
            size="80%"
            transitionProps={{ transition: 'fade', duration: 200 }}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <Stepper
                active={state.active} 
                onStepClick={(step) => setState({ active: step })} 
                allowNextStepsSelect={false} 
                mt='xs' mb='md'
                ml='md' mr='md'
                completedIcon={icons.check}
            >
                <Stepper.Step 
                    label="First step" 
                    description="Select template to upload"
                    icon={icons.template}
                >
                </Stepper.Step>

                <Stepper.Step 
                    label="Second step"
                    description="Upload a XLSX file following the template"
                    icon={icons.excel}
                >
                </Stepper.Step>

                <Stepper.Step 
                    label="Third step" 
                    description="Match columns from your CSV file"
                    icon={icons.match}
                >
                </Stepper.Step>
            </Stepper>

            <Box w='100%' ta='center'>
                {state.active === 0 && <FirstStep />}
                {state.active === 1 && <SecondStep />}
                {state.active === 2 && <ThirdStep />}

                <Flex justify="flex-end" mx="lg" mt="xl" gap="xs">
                    <Button
                        variant="outline"
                        color="gray"
                        onClick={handleBack}
                        disabled={state.active === 0}
                    >
                        Back
                    </Button>
                    <Button
                        variant="filled"
                        color="blue"
                        onClick={handleNext}
                        loading={uploadFileMutation.isPending || createMultipleUserMutation.isPending }
                        disabled={isNextDisabled}
                    >
                        {state.active === 2 ? 'Submit' : state.active === 1 ? 'Upload' : 'Next'}
                    </Button>
                </Flex>
            </Box>
        </Modal>
    )
}

export default SelectMethods;