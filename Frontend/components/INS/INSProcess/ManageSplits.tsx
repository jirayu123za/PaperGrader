import React from 'react';
import dayjs from 'dayjs';
import { Badge, Box, Flex, Select, Table, TextInput, Image, Text, Pagination, Autocomplete, ActionIcon, Stack, ScrollArea, useCombobox, Combobox } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { IconSearch, IconEdit } from '@tabler/icons-react';
import { RiDeleteBinLine } from "react-icons/ri";
import { useRouter } from 'next/router';
import { useFetchStudentsList } from '../../../hooks/ManageScan/useFetchStudentsList';
import { useStudentsListStore } from '../../../store/ManageScan/useStudentsListStore';
import { useFetchSubmissionsList } from '../../../hooks/ManageScan/useFetchSubmissionsList';

export const ManageSplits = () => {
    const router = useRouter();
    const { assignment_id, course_id } = router.query;
    const { isLoading: isLoadingStudents, error: errorStudents } = useFetchStudentsList(course_id as string, assignment_id as string);
    const { isLoading: isLoadingSubmissions, error: errorSubmissions } = useFetchSubmissionsList(course_id as string, assignment_id as string);
    const { studentsList, submissionsList, searchQuery, setSearchQuery, filterStatus, setFilterStatus, pageSize, setPageSize } = useStudentsListStore();

    const submissions = submissionsList.map(sub => ({
        ...sub,
        imageUrl: 'https://placehold.co/400x150',
        graded: sub.has_assigned ? 75 : 0, 
    }));

    const filteredSubmissions = submissions.filter((sub) => {
        if (filterStatus === 'All') return true;
        return sub.has_assigned === (filterStatus === 'true');
    });

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('MMM DD, YYYY [at] hh:mm A');
    };

    const totalPages = Math.ceil(filteredSubmissions.length / pageSize);
    const pagination = usePagination({
        total: totalPages,
        initialPage: 1,
        siblings: 1,
        boundaries: 1,
    });

    const paginatedData = filteredSubmissions.slice(
        (pagination.active - 1) * pageSize,
        pagination.active * pageSize
    );
    
    const message = `Showing ${pageSize * (pagination.active - 1) + 1} – ${Math.min(filteredSubmissions.length, pageSize * pagination.active)} of ${filteredSubmissions.length}`;
    const combobox = useCombobox();
    
    // const handleStudentNameChange = (id: string, name: string) => {
    //     setSubmissions((prev) =>
    //         prev.map((submission) => (submission.id === id ? { ...submission, studentName: name } : submission))
    //     );
    // };

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
                <Text pl="xs">
                    <Text span fw={700}>{`${submissions.length}`}</Text> Submissions - 
                    <Text span fw={700}>{`${submissions.filter(s => s.full_name).length}`}</Text> Students Have Been Matched
                </Text>    
                {filteredSubmissions.length > 0 && (            
                    <Flex align="center" gap="sm">
                        <Select
                            placeholder="Select Status"
                            value={filterStatus.toString()}
                            onChange={(value) => setFilterStatus(value as 'All' | 'true' | 'false')}
                            data={[
                                { value: 'All', label: 'All' },
                                { value: 'true', label: 'Already-assigned' },
                                { value: 'false', label: 'Unassigned' },
                            ]}
                            w="200px"
                        />
                        <TextInput
                            placeholder="Search student name"
                            leftSection={<IconSearch size={14} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            w="250px"
                        />
                    </Flex>
                )}
            </Flex>

            <Box>
                {filteredSubmissions.length > 0 && (
                    <ScrollArea h="612px">
                        <Table highlightOnHover w="100%" miw='900px'>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w='30%'>Name & ID Region</Table.Th>
                                    <Table.Th w="20%">Student</Table.Th>
                                    <Table.Th w="15%">Sections Submitted</Table.Th>
                                    <Table.Th w="15%">Submission Time</Table.Th>
                                    <Table.Th w="10%" ta='center'>Graded</Table.Th>
                                    <Table.Th w="10%" ta='center'>Delete Submission</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {paginatedData.map((submission) => (
                                    <Table.Tr key={submission.submission_id}>
                                        <Table.Td>
                                            <Image src={submission.imageUrl} alt="Submission" w='600px' h='100px' />
                                        </Table.Td>
                                        <Table.Td>
                                            {submission.full_name? (
                                                <Stack gap={1}>
                                                    <Flex align="center">
                                                        <Text>{submission.full_name}</Text>
                                                        <ActionIcon variant="transparent" ml={8} aria-label="Edit Student Name" className='cursor-pointer'>
                                                            <IconEdit size={16}/>
                                                        </ActionIcon>
                                                    </Flex>
                                                    <Text size='sm' c="dimmed">{submission.student_code}</Text>
                                                </Stack>
                                            ) : (
                                                <Autocomplete
                                                    placeholder="Select student or enter name"
                                                    styles={{
                                                        option: {
                                                        minHeight: '40px',
                                                        },
                                                    }}
                                                    data={autocompleteData}
                                                    limit={10}
                                                    maxDropdownHeight={200}
                                                    comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                                />                                        
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {submission.section_name !== '-' ? (
                                                <Text>{submission.section_name}</Text>
                                            ) : (
                                                <></>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Text>{formatDate(submission.submitted_at)}</Text>
                                        </Table.Td>
                                        <Table.Td ta='center'>
                                            <Badge w={52} color={submission.graded > 0 ? 'orange' : 'red'}>
                                                {submission.graded}%
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td ta='center'>
                                            <ActionIcon variant="transparent" aria-label="Delete Submission">
                                                <RiDeleteBinLine size={20} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}

                {filteredSubmissions.length > 0 && (       
                    <Flex justify="space-between" mt="xs" align="center">
                        <Flex flex={1} justify="center">
                            <Pagination 
                                total={totalPages} 
                                siblings={1}
                                boundaries={1}
                                value={pagination.active} 
                                onChange={pagination.setPage} 
                            />
                        </Flex>
                        <Flex align="center" justify="flex-end" gap="sm" w="auto">
                            <Text size="sm" c="dimmed">
                                {message}
                            </Text>
                            <Combobox
                                size='sm'
                                store={combobox}
                                withinPortal={false}
                                onOptionSubmit={(value) => setPageSize(Number(value))}
                                >
                                <Combobox.Target>
                                    <TextInput
                                    value={pageSize}
                                    onChange={(event) => setPageSize(Number(event.currentTarget.value))}
                                    rightSection={<Combobox.Chevron />}
                                    onClick={() => combobox.openDropdown()}
                                    />
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>
                                    {['5', '10', '15'].map((size) => (
                                        <Combobox.Option key={size} value={size}>
                                        {size}
                                        </Combobox.Option>
                                    ))}
                                    </Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                        </Flex>
                    </Flex>
                )}
            </Box>
        </Box>
    );
};
