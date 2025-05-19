'use client'
import React from 'react'
import SubmissionBoxes from './SubmissionBoxes';
import { Box, Checkbox, Flex, Select, Table, Text, TextInput, ActionIcon, Autocomplete, ScrollArea, Button, Transition, Alert, Skeleton, Tooltip } from '@mantine/core';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import { IoMdCheckmark } from "react-icons/io";
import { TfiReload } from "react-icons/tfi";
import { useStudentsListStore } from '@/store/ManageScan/useStudentsListStore';
import { useFetchManageOCR } from '@/hooks/ManageScan/useFetchManageOCR';
import { useManageOCRStore } from '@/store/ManageScan/useManageOCRStore';

type Props = {
    course_id: string;
    assignment_id: string;
};

export const ManageOCR: React.FC<Props> = ({ course_id, assignment_id })  => {
  const { isFetching: isFetchingOCRData, refetch: refetchOCRData, isLoading: isLoadingOCRData, error: errorOCRData } = useFetchManageOCR(course_id, assignment_id, { queryKey: ['ocr_data', course_id, assignment_id], enabled: false });
  const { ocrData, matchedStudents, setMatchedStudent, selectedRows, toggleSelectedRow, toggleSelectAll } = useManageOCRStore();
  const { studentsList } = useStudentsListStore();
  const isAllSelected = selectedRows.length === ocrData.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < ocrData.length;
  
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
                                <Table.Th>
                                    <Flex align="center" gap="sm">
                                        <Checkbox
                                            checked={isAllSelected}
                                            indeterminate={isSomeSelected}
                                            onChange={() => toggleSelectAll(ocrData.map((item) => item.submission_id))}
                                        />
                                        Select                                    
                                    </Flex>
                                </Table.Th>
                                <Table.Th w={420}>Student's name & id</Table.Th>
                                <Table.Th pl={80} w={380}>Example</Table.Th>
                                <Table.Th>Match with</Table.Th>
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
                                    <Table.Tr key={item.submission_id}
                                        style={{
                                            backgroundColor: selectedRows.includes(item.submission_id)
                                            ? 'var(--mantine-color-blue-light)'
                                            : undefined,
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <Table.Td>
                                            <Checkbox 
                                                checked={selectedRows.includes(item.submission_id)}
                                                onChange={() => toggleSelectedRow(item.submission_id)}
                                            />
                                        </Table.Td>

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
                                            <Autocomplete
                                                placeholder="Match student"
                                                w={240}
                                                styles={{
                                                    option: {
                                                        minHeight: '40px',
                                                    },
                                                }}
                                                data={autocompleteData}
                                                defaultValue={
                                                    // (() => {
                                                    //   const matchedStudent = studentsList.find(
                                                    //     (student) => student.personal_data_id === item.personal_data_id
                                                    //   );
                                                    //   return matchedStudent?.full_name ?? '';
                                                    // })()
                                                      (() => {
                                                        const matchedStudent = matchedStudents[item.submission_id];
                                                        if (matchedStudent) {
                                                        return matchedStudent.name;
                                                        }
                                                        const studentFromList = studentsList.find(
                                                        (student) => student.personal_data_id === item.personal_data_id
                                                        );
                                                        return studentFromList?.full_name ?? '';
                                                    })()
                                                }
                                                limit={10}
                                                maxDropdownHeight={200}
                                                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                                onOptionSubmit={(value) => {
                                                    const selectedStudent = studentsList.find(student => student.personal_data_id === value);
                                                    if (selectedStudent) {
                                                        // updateSubmission({
                                                        //     submission_id: submission.submission_id,
                                                        //     assignment_id: assignment_id as string,
                                                        //     personal_data_id: selectedStudent.personal_data_id,
                                                        // });
                                                        setMatchedStudent(item.submission_id, {
                                                            name: selectedStudent.full_name,
                                                            student_code: selectedStudent.student_code,
                                                        });
                                                        console.log(`Selected student: ${selectedStudent.full_name}`);
                                                    }
                                                }}
                                            />
                                            <Text size='sm' c="dimmed" pt={2} pl={12}>
                                                Student ID:{' '}
                                                {
                                                    matchedStudents[item.submission_id]?.student_code ??
                                                    (item.is_match ? item.best_match_id : '-')
                                                }
                                            </Text>
                                        </Table.Td>
                                        
                                        {/* Submission Time */}
                                        <Table.Td>
                                            <Text size="sm">{item.submitted_at}</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                <Transition mounted={selectedRows.length > 0} transition="fade" duration={200} timingFunction="ease">
                    {(styles) => (
                        <Flex mt="sm" gap="sm" style={styles}>
                        <Button variant="outline" color="#4644ab" leftSection={<IoMdCheckmark size={18}/>}>
                            Confirm Selected
                        </Button>
                        <Button variant="outline" color="red" leftSection={<IconTrash size={18}/>}>
                            Delete Selected
                        </Button>
                        </Flex>
                    )}
                </Transition>
            </>
            )}
        </Box>
    </Box>
  )
}
