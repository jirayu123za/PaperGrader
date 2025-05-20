'use client'
import React from 'react'
import SubmissionBoxes from './SubmissionBoxes';
import { Box, Flex, Select, Table, Text, TextInput, ActionIcon, Autocomplete, ScrollArea, Alert, Skeleton, Tooltip } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { FaTrash } from "react-icons/fa";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { TfiReload } from "react-icons/tfi";
import { useStudentsListStore } from '@/store/ManageScan/useStudentsListStore';
import { useFetchManageOCR } from '@/hooks/ManageScan/useFetchManageOCR';
import { useManageOCRStore } from '@/store/ManageScan/useManageOCRStore';

type Props = {
    course_id: string;
    assignment_id: string;
};

export const StudentMatching2: React.FC<Props> = ({ course_id, assignment_id })  => {
  const { isFetching: isFetchingOCRData, refetch: refetchOCRData, isLoading: isLoadingOCRData, error: errorOCRData } = useFetchManageOCR(course_id, assignment_id, { queryKey: ['ocr_data', course_id, assignment_id], enabled: false });
  const { ocrData, matchedStudents, setMatchedStudent } = useManageOCRStore();
  const { studentsList } = useStudentsListStore();

  const getMatchedStudentName = (submission_id: string, personal_data_id: string | null): string => {
    const matchedStudent = matchedStudents[submission_id];
        if (matchedStudent) return matchedStudent.name;
    const studentFromList = studentsList.find(
        (student) => student.personal_data_id === personal_data_id
    );
    return studentFromList?.full_name ?? '';
  };

  const handleSelectStudent = (submission_id: string, value: string) => {
    if (value === '') {
        setMatchedStudent(submission_id, { name: '', student_code: '' });
        console.log(`Cleared selection for submission: ${submission_id}`);
        return;
    }

    const selectedStudent = studentsList.find(student => student.personal_data_id === value);
    if (selectedStudent) {
        setMatchedStudent(submission_id, {
            name: selectedStudent.full_name,
            student_code: selectedStudent.student_code,
        });
        console.log(`Selected student: ${selectedStudent.full_name}`);
    }
  };

  const handleOptionSubmit = (submission_id: string, value: string) => {
    const selectedStudent = studentsList.find(student => student.personal_data_id === value);
    if (selectedStudent) {
        // updateSubmission({
        //     submission_id: submission_id,
        //     assignment_id: assignment_id,
        //     personal_data_id: selectedStudent.personal_data_id,
        // });
        setMatchedStudent(submission_id, {
            name: selectedStudent.full_name,
            student_code: selectedStudent.student_code,
        });
        console.log(`Confirmed student: ${selectedStudent.full_name}`);
    }
  };

  const autocompleteData = [
    {
      group: 'Unassigned to submission',
      items: studentsList
        .filter((student) => !student.has_submission)
        .map((student) => ({
          value: student.personal_data_id,
          label: student.full_name,
          student,
        })),
    },
    {
      group: 'Already assigned to submission',
      items: studentsList
        .filter((student) => student.has_submission)
        .map((student) => ({
          value: student.personal_data_id,
          label: student.full_name,
          student,
          disabled: true,
        })),
    },
  ];

  return (
    <Box maw='100%'>
        <Flex align="center" mb="sm" justify="space-between">
            <Flex align="center" gap="xs">
                <Text pl="xs">
                    <Text span fw={700}>{`${ocrData.length}`}</Text> Submissions need confirmation
                </Text>
                <Tooltip label="Use OCR" position="right" withArrow>
                    <ActionIcon color="blue" variant="subtle" 
                        onClick={() => {
                            console.log('Use OCR clicked');
                            refetchOCRData();
                        }}
                        disabled={isFetchingOCRData}
                        loading={isFetchingOCRData}
                    >
                        <TfiReload size={20} />
                    </ActionIcon>
                </Tooltip>
            </Flex>

            {/* Condition to show*/}
            <Flex align="center" gap="sm">
                <Select
                    placeholder="Select Status"
                    w="200px"
                />
                <TextInput
                    placeholder="Search student name"
                    leftSection={<IconSearch size={14} />}
                    w="250px"
                />
            </Flex>
        </Flex>

        <Box>
            {/* Condition to show tb*/}
            {ocrData.length === 0 ? (
                <Flex direction="column" align="center" justify="center" h={350}>
                    <Alert color="red" radius="md" w={400} p="lg" ta="center">
                        <Text size="sm" mb={8}>
                            No OCR submissions found.
                        </Text>
                        <Flex align="center" justify="center" gap="xs">
                            <Text size="sm">Please click the reload icon</Text>
                                <TfiReload size={16} color='#0390fc'/>
                            <Text size="sm">to refresh the list.</Text>
                        </Flex>
                    </Alert>
              </Flex>
            ) : (
                <>
                <ScrollArea h={500}>
                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={420}>Name & ID Region</Table.Th>
                                <Table.Th pl={80} w={380}>OCR data</Table.Th>
                                <Table.Th w={380}>Match with</Table.Th>
                                <Table.Th>Section submitted</Table.Th>
                                <Table.Th>Submission time</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        
                        <Table.Tbody>
                            {isLoadingOCRData ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>
                                        <Skeleton height={20} width={20} />
                                    </Table.Td>
                                    <Table.Td>
                                        <Flex>
                                            <Skeleton height={100} width={210} />
                                            <Skeleton height={100} width={210} />
                                        </Flex>
                                    </Table.Td>
                                    <Table.Td>
                                        <Flex direction="column" gap={4}>
                                            <Skeleton height={16} width={100} />
                                            <Skeleton height={14} width={120} />
                                        </Flex>
                                    </Table.Td>
                                    <Table.Td>
                                        <Flex direction="column" gap={4}>
                                            <Skeleton height={36} width={200} />
                                            <Skeleton height={14} width={100} ml={12} />
                                        </Flex>
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton height={16} width="60%" />
                                    </Table.Td>
                                </Table.Tr>
                                ))
                            ) : (
                                ocrData.map((item) => (
                                    <Table.Tr 
                                        key={item.submission_id}
                                        className="group"
                                    >
                                        {/* Image x2 */}
                                        <Table.Td maw="260px">
                                            <SubmissionBoxes submissionBoxesURL={[item.url_id_file, item.url_name_file]} />
                                        </Table.Td>

                                        <Table.Td pl={80}>
                                            <Tooltip.Floating label={`Similarity: ${(item.similarity * 100).toFixed(2)}%`}>                                           
                                                <Flex direction="column" gap="xs">
                                                    <Text size="sm" fw={500}>{item.best_match_name}</Text>
                                                    <Text size="sm" c="dimmed">Student ID: {item.best_match_id}</Text>
                                                </Flex>
                                            </Tooltip.Floating>
                                        </Table.Td>

                                        {/* Autocomplete Match with Student Name */}
                                        <Table.Td>
                                            <Flex align="center" gap="xs" className="relative">

                                            <Autocomplete
                                                placeholder="Match student"
                                                w={240}
                                                styles={{
                                                    option: {
                                                        minHeight: '40px',
                                                    },
                                                }}
                                                data={autocompleteData}
                                                defaultValue={getMatchedStudentName(item.submission_id, item.personal_data_id)}
                                                limit={10}
                                                maxDropdownHeight={200}
                                                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                                onChange={(value) => handleSelectStudent(item.submission_id, value)}
                                                onOptionSubmit={(value) => handleOptionSubmit(item.submission_id, value)}
                                            />

                                            {item.is_match ? (
                                                <ActionIcon
                                                    color="green"
                                                    variant="transparent"
                                                    className="ml-1"
                                                    onClick={() => {
                                                        console.log('Checkmark icon clicked');
                                                    }}
                                                >
                                                    <IoCheckmarkDoneSharp size={24}/>
                                                </ActionIcon>
                                            ) : null}
                                            </Flex>

                                            <Text size='sm' c="dimmed" pt={2} pl={12}>
                                                Student ID:{' '}
                                                {
                                                    matchedStudents[item.submission_id]?.student_code ??
                                                    (item.is_match ? item.best_match_id : '-')
                                                }
                                            </Text>
                                        </Table.Td>

                                        {/* Section submitted */}
                                        <Table.Td>
                                            <Flex>
                                              <Text size='sm' c="dimmed">-</Text>  
                                            </Flex>
                                        </Table.Td>
                       
                                        {/* Submission Time */}
                                        <Table.Td>
                                            <Text size="sm">{item.submitted_at}</Text>
                                        </Table.Td>

                                       {/* Trash Icon */}
                                        <Table.Td ta="center">
                                            <ActionIcon color="red" variant="subtle" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <FaTrash size={16} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </>
            )}
        </Box>
    </Box>
  )
}
