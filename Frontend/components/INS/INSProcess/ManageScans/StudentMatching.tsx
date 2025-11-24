'use client'
import React from 'react'
import dayjs from 'dayjs';
import SubmissionBoxes from './SubmissionBoxes';
import { Box, Flex, Select, Table, Text, TextInput, ActionIcon, Autocomplete, Alert, Skeleton, Tooltip, Stack, Pagination, Title } from '@mantine/core';
import { IconEdit, IconSearch } from '@tabler/icons-react';
import { FaTrash } from "react-icons/fa";
import { TfiReload } from "react-icons/tfi";
import { useStudentsListStore } from '@/store/ManageScan/useStudentsListStore';
import { useStudentMatchingStore } from '@/store/ManageScan/useStudentMatchingStore';
import { useFetchStudentMatching } from '@/hooks/ManageScan/useFetchStudentMatching';
import { useManageSubmissionStore } from '@/store/ManageScan/useManageSubmissionStore ';
import { useUpdateSubmission } from '@/hooks/ManageScan/useUpdateSubmission';
import { useFetchStudentsList } from '@/hooks/ManageScan/useFetchStudentsList';
import { useDebouncedValue, usePagination } from '@mantine/hooks';
import { useOCRDataStore } from '@/store/ManageScan/useOCRDataStore';
import { useFetchOCRProcessing } from '@/hooks/ManageScan/useFetchOCRData';

type Props = {
    course_id: string;
    assignment_id: string;
};

export const StudentMatching: React.FC<Props> = ({ course_id, assignment_id })  => {
  const { isLoading: isLoadingStudentsList, error: errorStudentsList, refetch: refetchStudentsList } = useFetchStudentsList(course_id as string, assignment_id as string);
  const { withSubmission, withoutSubmission } = useStudentsListStore();
  const { isFetching: isFetchingStudentMatchingData, refetch: refetchStudentMatchingData, isLoading: isLoadingStudentMatchingData, error: errorStudentMatchingData } = useFetchStudentMatching(course_id, assignment_id);
  const { studentMatchingData, searchQuery, setSearchQuery, filterStatus, setFilterStatus, pageSize, setPageSize, setIsPageChanging, isPageChanging } = useStudentMatchingStore();
  const { isFetching: isFetchingOCRData, refetch: refetchOCRData, isLoading: isLoadingOCRData } = useFetchOCRProcessing(course_id as string, assignment_id as string);
  const { ocrProcessingData } = useOCRDataStore();
  const { editableSubmissionID, setEditableSubmissionID } = useManageSubmissionStore();
  const { mutate: updateSubmission, isPending } = useUpdateSubmission(course_id, assignment_id);
  const [ debouncedSearch ] = useDebouncedValue(searchQuery, 200);

  const handleEditClick = (submission_id: string) => {
    setEditableSubmissionID(submission_id);
  };

  const handleAutocompleteBlur = (submission_id: string) => {
    if (editableSubmissionID === submission_id) {
      setEditableSubmissionID(null);
    }
  };

  const handleUpdateSubmission = (submission_id: string, personal_data_id: string) => {
    updateSubmission({
        submission_id: submission_id,
        assignment_id: assignment_id,
        personal_data_id: personal_data_id,
        matched_by: 'manual',
    });
  }

  const handleMatchedSubmission = (submission_id: string, personal_data_id: string) => {
    updateSubmission({
        submission_id: submission_id,
        assignment_id: assignment_id,
        personal_data_id: personal_data_id,
        matched_by: 'manual',
    });
  }
    
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY [at] hh:mm A');
  };

  const hasAssigned = studentMatchingData.filter(s => s.has_assigned).length;

  const autocompleteData = [
    {
      group: 'Unassigned to submission',
      items: withoutSubmission
        .map((withoutSubmission) => ({
          value: withoutSubmission.personal_data_id,
          label: withoutSubmission.full_name,
          student: withoutSubmission,
        })),
    },
    {
      group: 'Already assigned to submission',
      items: withSubmission
        .map((withSubmission) => ({
          value: withSubmission.personal_data_id,
          label: withSubmission.full_name,
          student: withSubmission,
          disabled: true,
        })),
    },
  ];

  const filteredSubmissions = studentMatchingData.filter((item) => {
    if (filterStatus === 'true' && !item.has_assigned) return false;
    if (filterStatus === 'false' && item.has_assigned) return false;
    const searchLower = debouncedSearch.toLowerCase();
    const nameMatch = item.full_name.toLowerCase().includes(searchLower);
    const codeMatch = item.student_code.toLowerCase().includes(searchLower);
    return nameMatch || codeMatch;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / pageSize);
  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
  });
  
  const startIndex = (pagination.active - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setIsPageChanging(true);
    pagination.setPage(page);

    setTimeout(() => {
        setIsPageChanging(false);
    }, 300);
  };

  return (
    <Box maw='100%'>
        <Flex align="center" mb="sm" justify="space-between">
            <Flex align="center" gap="xs">
                <Text pl="xs" lineClamp={1}>
                    <Text span fw={700}>{`${studentMatchingData.length}`}</Text> Submissions - 
                    <Text span fw={700}>{hasAssigned}</Text> Students Have Been Matched
                </Text>
                <Tooltip label="Use OCR" position="right" withArrow>
                    <ActionIcon 
                        color="blue" 
                        variant="subtle" 
                        aria-label="Click to use OCR"
                        onClick={() => {
                            refetchOCRData();
                        }}
                        disabled={isFetchingOCRData || isLoadingOCRData}
                        loading={isFetchingOCRData || isLoadingOCRData}
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
                    onChange={(e) => {
                        setSearchQuery(e.currentTarget.value);
                        pagination.setPage(1);
                    }}
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
                <Table.ScrollContainer h={620} minWidth={800} >
                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w="40%">
                                    <Title order={6} lineClamp={1}>Name & ID Region</Title>
                                </Table.Th>
                                <Table.Th pl={80}>
                                    <Title order={6} lineClamp={1}>Match with</Title>
                                </Table.Th>
                                <Table.Th pl={80}>
                                    <Title order={6} lineClamp={1}>Auto matching</Title>
                                </Table.Th>
                                <Table.Th pl={80}>
                                    <Title order={6} lineClamp={1}>Submission time</Title>
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        
                        <Table.Tbody>
                            {isLoadingStudentMatchingData || isFetchingStudentMatchingData || isPageChanging ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td maw="260px">
                                            <Flex>
                                                <Skeleton height={100} width={210} />
                                                <Skeleton height={100} width={210} />
                                            </Flex>
                                        </Table.Td>

                                        <Table.Td pl={80}>
                                            <Skeleton height={36} width={240} radius="sm" />
                                            <Skeleton height={16} width={160} mt={8} />
                                        </Table.Td>

                                        <Table.Td pl={80}>
                                            <Skeleton height={16} width={120} mb={4} />
                                            <Skeleton height={16} width={140} />
                                        </Table.Td>

                                        <Table.Td pl={80}>
                                            <Skeleton height={16} width={160} />
                                        </Table.Td>

                                        <Table.Td ta="center">
                                            <Skeleton height={16} width={16} circle />
                                        </Table.Td>
                                    </Table.Tr>
                                    ))
                            ) : (
                                paginatedSubmissions.map((item) => (
                                    <Table.Tr 
                                        key={item.submission_id}
                                        className="group"
                                    >
                                        {/* Image x2 */}
                                        <Table.Td maw="300px">
                                            <SubmissionBoxes submissionBoxesURL={[item.url_file_id, item.url_file_name]} />
                                        </Table.Td>

                                        {/* Autocomplete Match with Student Name */}
                                        <Table.Td pl={80}>
                                            {!item.has_assigned? (() => {
                                                const ocr = ocrProcessingData.find((ocr) => ocr.submission_id === item.submission_id);
                                                return (
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
                                                                defaultValue={ocr?.best_match_name}
                                                                limit={10}
                                                                maxDropdownHeight={200}
                                                                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                                                onOptionSubmit={(value) => handleMatchedSubmission(item.submission_id, value)}
                                                                onBlur={() => handleAutocompleteBlur(item.submission_id)}
                                                                autoFocus={editableSubmissionID === item.submission_id}
                                                            />
                                                        </Flex>

                                                        <Text size='sm' c="dimmed" pt={2} pl={12}>
                                                            Student ID:{' '}
                                                            {ocr?.best_match_id}
                                                        </Text>
                                                    </>
                                                );
                                            })() : editableSubmissionID === item.submission_id ? (
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
                                                            defaultValue={item.full_name}
                                                            limit={10}
                                                            maxDropdownHeight={200}
                                                            comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                                            onOptionSubmit={(value) => handleUpdateSubmission(item.submission_id, value)}
                                                            onBlur={() => handleAutocompleteBlur(item.submission_id)}
                                                            autoFocus={editableSubmissionID === item.submission_id}
                                                        />
                                                    </Flex>

                                                    <Text size='sm' c="dimmed" pt={2} pl={12}>
                                                        Student ID:{' '}
                                                        {item.student_code}
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

                                        <Table.Td pl={80}>
                                            {item.has_assigned !== true ? (
                                                <Text size="sm" fw={500} c="red" lineClamp={1}>Not Matched</Text>
                                            ) : (
                                                <Flex direction="column" gap="xs">
                                                      <Flex align="center" gap='2px'>
                                                        <Text size="sm" fw={500} c="green" lineClamp={1}>Matched</Text>
                                                        <Text size="xs" c="dimmed" lineClamp={1}>({item.matched_by})</Text>
                                                    </Flex>
                                                    <Text size="sm" c="dimmed" lineClamp={1}>Section submitted: {item.section_name}</Text>
                                                </Flex>
                                            )}
                                        </Table.Td>
                       
                                        {/* Submission Time */}
                                        <Table.Td pl={80}>
                                            <Text size="sm" lineClamp={1}>{formatDate(item.submitted_at)}</Text>
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
                </Table.ScrollContainer>
                
                <Flex justify="end" align="center">
                    <Text size="sm" c="dimmed" mr="xs">
                        Rows per page
                    </Text>
                    <Select
                        size='xs'
                        w={80}
                        value={pageSize.toString()}
                        onChange={(val) => {
                            setIsPageChanging(true);
                            setPageSize(Number(val));
                            pagination.setPage(1);
                            setTimeout(() => {
                                setIsPageChanging(false);
                            }, 300);
                        }}
                        data={['5', '10', '50', '75', '100'].map((v) => ({ value: v, label: v }))}
                    />
                    <Box ml="md">
                        <Pagination
                            size={"sm"}
                            withEdges
                            total={totalPages}
                            value={pagination.active}
                            onChange={handlePageChange}
                        />
                    </Box>
                </Flex>
            </>
            )}
        </Box>
    </Box>
  )
}
