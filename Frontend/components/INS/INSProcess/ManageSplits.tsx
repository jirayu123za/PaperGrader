import { Anchor, Badge, Box, Flex, Select, Table, TextInput, Image, Group, Text, Pagination } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { IconSearch, IconEdit } from '@tabler/icons-react';
import React, { useState } from 'react';

interface SubmissionData {
    id: string;
    imageUrl: string;
    studentName: string | null;
    sectionsSubmitted: string;
    submissionTime: string;
    graded: number;
    status: 'All' | 'Auto-Assigned' | 'Unassigned';
}

const mockSubmissions: SubmissionData[] = Array.from({ length: 35 }, (_, i) => ({
    id: (i + 1).toString(),
    imageUrl: 'https://placehold.co/400x150',
    studentName: i % 3 === 0 ? `User ${i + 1}` : null,
    sectionsSubmitted: i % 4 === 0 ? `${801 + (i % 3)}` : '-',
    submissionTime: `Dec ${10 + (i % 10)} 05:46 PM`,
    graded: i % 2 === 0 ? 25 : 0,
    status: i % 2 === 0 ? 'Auto-Assigned' : 'Unassigned',
}));

export const ManageSplits = () => {
    const [submissions, setSubmissions] = useState(mockSubmissions);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Auto-Assigned' | 'Unassigned'>('All');

    const filteredSubmissions = submissions.filter((sub) => 
        (filterStatus === 'All' || sub.status === filterStatus) &&
        (!searchQuery || sub.studentName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const pageSize = 5;
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

    const handleStudentNameChange = (id: string, name: string) => {
        setSubmissions((prev) =>
            prev.map((submission) => (submission.id === id ? { ...submission, studentName: name } : submission))
        );
    };

    return (
        <Box maw='100%'>
            <Flex align="center" mb="sm" justify="space-between">
                <Text pl="xs">
                    <Text span fw={700}>{`${submissions.length}`}</Text> Submissions - 
                    <Text span fw={700}>{`${submissions.filter(s => s.studentName).length}`}</Text> Students Have Been Matched
                </Text>                
                <Flex align="center" gap="sm">
                    <Select
                        placeholder="Select Status"
                        value={filterStatus}
                        onChange={(value) => setFilterStatus(value as 'All' | 'Auto-Assigned' | 'Unassigned')}
                        data={[
                            { value: 'All', label: 'All' },
                            { value: 'Auto-Assigned', label: 'Auto-Assigned' },
                            { value: 'Unassigned', label: 'Unassigned' },
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
            </Flex>

            <Box>
                <Table highlightOnHover w="100%" miw='900px'>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w='30%'>Name & ID Region</Table.Th>
                            <Table.Th w="20%">Student</Table.Th>
                            <Table.Th w="15%">Sections Submitted</Table.Th>
                            <Table.Th w="15%">Submission Time</Table.Th>
                            <Table.Th w="10%">Graded</Table.Th>
                            <Table.Th w="10%">Details</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {paginatedData.map((submission) => (
                            <Table.Tr key={submission.id}>
                                <Table.Td>
                                    <Image src={submission.imageUrl} alt="Submission" w='600px' h='100px' />
                                </Table.Td>
                                <Table.Td>
                                    {submission.studentName ? (
                                        <Flex align="center">
                                            <Text>{submission.studentName}</Text>
                                            <IconEdit size={14} style={{ marginLeft: '8px', cursor: 'pointer' }} />
                                        </Flex>
                                    ) : (
                                        <TextInput
                                            placeholder="Enter student name"
                                            value={submission.studentName || ''}
                                            onChange={(e) => handleStudentNameChange(submission.id, e.currentTarget.value)}
                                        />
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    {submission.sectionsSubmitted !== '-' ? (
                                        <Text>{submission.sectionsSubmitted}</Text>
                                    ) : (
                                        <Select
                                            placeholder="Select section"
                                            data={['801', '802', '803']}
                                            onChange={(value) => handleStudentNameChange(submission.id, value || '')}
                                        />
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Text>{submission.submissionTime}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={submission.graded > 0 ? 'orange' : 'red'}>
                                        {submission.graded}%
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Anchor href="#">Show Details</Anchor>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                <Flex justify="center" mt="xs">
                    <Pagination 
                        total={totalPages} 
                        siblings={1}
                        boundaries={1}
                        value={pagination.active} 
                        onChange={pagination.setPage} 
                    />
                </Flex>
            </Box>
        </Box>
    );
};
