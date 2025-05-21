'use client'
import React from 'react'
import dayjs from 'dayjs';
import SubmissionBoxes from './SubmissionBoxes';
import { Box, Flex, Select, Table, Text, TextInput, ActionIcon, Autocomplete, ScrollArea, Alert, Skeleton, Tooltip, Stack, LoadingOverlay } from '@mantine/core';
import { IconEdit, IconSearch } from '@tabler/icons-react';
import { FaTrash } from "react-icons/fa";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { TfiReload } from "react-icons/tfi";
import { useStudentsListStore } from '@/store/ManageScan/useStudentsListStore';
import { useStudentMatchingStore } from '@/store/ManageScan/useStudentMatchingStore';
import { useFetchStudentMatching } from '@/hooks/ManageScan/ีuseFetchStudentMatching';
import { useManageSubmissionStore } from '@/store/ManageScan/useManageSubmissionStore ';
import { useUpdateSubmission } from '@/hooks/ManageScan/useUpdateSubmission';
import { useFetchStudentsList } from '@/hooks/ManageScan/useFetchStudentsList';

type Props = {
    course_id: string;
    assignment_id: string;
};

export const StudentMatching: React.FC<Props> = ({ course_id, assignment_id })  => {
  const { isLoading: isLoadingStudentsList, error: errorStudentsList, refetch: refetchStudentsList } = useFetchStudentsList(course_id as string, assignment_id as string);
  const { studentsList } = useStudentsListStore();
  const { isFetching: isFetchingStudentMatchingData, refetch: refetchStudentMatchingData, isLoading: isLoadingStudentMatchingData, error: errorStudentMatchingData } = useFetchStudentMatching(course_id, assignment_id, { queryKey: ['submissions', course_id, assignment_id], enabled: false });
  const { studentMatchingData, matchedStudents, setMatchedStudent, searchQuery, setSearchQuery, filterStatus, setFilterStatus } = useStudentMatchingStore();
  const { editableSubmissionID, setEditableSubmissionID } = useManageSubmissionStore();
  const { mutate: updateSubmission, isPending } = useUpdateSubmission();

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
        console.log(`Submission ID: ${submission_id}, Personal Data ID: ${value}`);
        return;
    }

    const selectedStudent = studentsList.find(student => student.personal_data_id === value);
    if (selectedStudent) {
        setMatchedStudent(submission_id, {
            name: selectedStudent.full_name,
            student_code: selectedStudent.student_code,
        });
        console.log(`Selected student: ${selectedStudent.full_name}`);
        console.log(`Submission ID: ${submission_id}, Personal Data ID: ${selectedStudent.personal_data_id}`)
    }
  };

  const handleOptionSubmit = (submission_id: string, value: string) => {
    const selectedStudent = studentsList.find(student => student.personal_data_id === value);
    if (selectedStudent) {
        updateSubmission({
            submission_id: submission_id,
            assignment_id: assignment_id,
            personal_data_id: selectedStudent.personal_data_id,
        });
        setMatchedStudent(submission_id, {
            name: selectedStudent.full_name,
            student_code: selectedStudent.student_code,
        });
        console.log(`Confirmed student: ${selectedStudent.full_name}`);
        console.log(`Submission ID: ${submission_id}, Personal Data ID: ${selectedStudent.personal_data_id}`);

        setEditableSubmissionID(null);
    }
  };

  const handleEditClick = (submission_id: string) => {
    setEditableSubmissionID(submission_id);
  };

  const handleAutocompleteBlur = (submission_id: string) => {
    if (editableSubmissionID === submission_id) {
      setEditableSubmissionID(null);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY [at] hh:mm A');
  };

  const hasAssigned = studentMatchingData.filter(s => s.has_assigned).length;

  const handleConfirmMatchedStudent = (submission_id: string, personal_data_id: string | null) => {
    const name = getMatchedStudentName(submission_id, personal_data_id);

    if (!name) {
       alert(`No matched name for submission: ${submission_id}`); return;
    }

    const student = studentsList.find((s) => s.full_name === name);

    if (!student) {
       alert("Student not found from matched name"); return;
    }

    updateSubmission({
        submission_id,
        assignment_id,
        personal_data_id: student.personal_data_id,
    });

    setMatchedStudent(submission_id, {
        name: student.full_name,
        student_code: student.student_code,
    });

    setEditableSubmissionID(null);
    console.log("Updated via Checkmark for", student.full_name);
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

  const filteredSubmissions = studentMatchingData.filter((item) => {
    if (filterStatus === 'true' && !item.has_assigned) return false;
    if (filterStatus === 'false' && item.has_assigned) return false;
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = item.full_name.toLowerCase().includes(searchLower);
    const codeMatch = item.student_code.toLowerCase().includes(searchLower);
    return nameMatch || codeMatch;
  });

  return (
    <Box maw='100%'>
        <Flex align="center" mb="sm" justify="space-between">
            <Flex align="center" gap="xs">
                <Text pl="xs">
                    <Text span fw={700}>{`${studentMatchingData.length}`}</Text> Submissions - 
                    <Text span fw={700}>{hasAssigned}</Text> Students Have Been Matched
                </Text>
                <Tooltip label="Use OCR" position="right" withArrow>
                    <ActionIcon 
                        color="blue" 
                        variant="subtle" 
                        aria-label="Click to use OCR"
                        onClick={() => {
                            console.log('Use OCR clicked');
                            refetchStudentMatchingData();
                        }}
                        disabled={isFetchingStudentMatchingData}
                        loading={isFetchingStudentMatchingData}
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
                    value={filterStatus}
                    onChange={(value) => setFilterStatus(value as 'All' | 'true' | 'false')}
                    data={[
                        { value: 'All', label: 'All' },
                        { value: 'true', label: 'Matched only' },
                        { value: 'false', label: 'Unmatched only' },
                    ]}
                />
                <TextInput
                    placeholder="Search student name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={14} />}
                    w="250px"
                />
            </Flex>
        </Flex>

        <Box>
            {/* Condition to show tb*/}
            {studentMatchingData.length === 0 ? (
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
                                <Table.Th>Match with</Table.Th>
                                <Table.Th>Submission time</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        
                        <Table.Tbody>
                            {isLoadingStudentMatchingData ? (
                                Array.from({ length: 4 }).map((_, index) => (
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
                                filteredSubmissions.map((item) => (
                                    
                                    <Table.Tr 
                                        key={item.submission_id}
                                        className="group"
                                    >
                                        {/* Image x2 */}
                                        <Table.Td maw="260px">
                                            <SubmissionBoxes submissionBoxesURL={[item.url_file_id, item.url_file_name]} />
                                        </Table.Td>

                                        <Table.Td pl={80}>
                                            {item.has_assigned !== true ? (
                                                <Tooltip.Floating label={`Similarity: ${(item.similarity * 100).toFixed(2)}%`}>
                                                    <Flex direction="column" gap="xs">
                                                    <Text size="sm" fw={500}>{item.best_match_name}</Text>
                                                    <Text size="sm" c="dimmed">Student ID: {item.best_match_id}</Text>
                                                    </Flex>
                                                </Tooltip.Floating>
                                            ) : (
                                                <Flex direction="column" gap="xs">
                                                    <Text size="sm" fw={500} c="cyan">Already matching</Text>
                                                    <Text size="sm" c="dimmed">Section submitted: {item.section_name}</Text>
                                                </Flex>
                                            )}
                                        </Table.Td>

                                        {/* Autocomplete Match with Student Name */}
                                        <Table.Td>
                                            {item.has_assigned !== true || editableSubmissionID === item.submission_id ? (
                                                <>
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
                                                            onBlur={() => handleAutocompleteBlur(item.submission_id)}
                                                            autoFocus={editableSubmissionID === item.submission_id}
                                                        />

                                                        {item.is_match ? (
                                                            <ActionIcon
                                                                color="green"
                                                                variant="transparent"
                                                                className="ml-1"
                                                                aria-label="Click to confirm match"
                                                                onClick={() => handleConfirmMatchedStudent(item.submission_id, item.personal_data_id)}
                                                                loading={isPending}
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
                                                </>
                                            ) : (
                                                <Stack gap={1}>
                                                    <Flex align="center">
                                                        <Text>{item.full_name}</Text>
                                                        <ActionIcon 
                                                            variant="transparent" 
                                                            ml={8} 
                                                            aria-label="Edit Student Name"
                                                            className='cursor-pointer'
                                                            onClick={() => handleEditClick(item.submission_id)}
                                                        >
                                                            <IconEdit size={16}/>
                                                        </ActionIcon>
                                                    </Flex>
                                                    <Text size='sm' c="dimmed">Student ID: {item.student_code}</Text>
                                                </Stack>
                                            )}
                                        </Table.Td>
                       
                                        {/* Submission Time */}
                                        <Table.Td>
                                            <Text size="sm">{formatDate(item.submitted_at)}</Text>
                                        </Table.Td>

                                       {/* Trash Icon */}
                                        <Table.Td ta="center">
                                            <ActionIcon 
                                                color="red" 
                                                variant="subtle" 
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                aria-label="Delete submission"
                                            >
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
