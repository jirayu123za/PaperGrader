import { Box, Checkbox, Flex, Select, Table, Text, TextInput, Image, ActionIcon, Autocomplete, ScrollArea } from '@mantine/core';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react'

type Props = {
    course_id: string;
    assignment_id: string;
};

export const ManageOCR: React.FC<Props> = ({ course_id, assignment_id })  => {
  const ocrData = [
    { id: 1, name: 'John Doe', status: 'Completed', submissionTime: '2024-04-27 10:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 2, name: 'Jane Smith', status: 'Pending', submissionTime: '2024-04-27 11:00', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 3, name: 'Alice Johnson', status: 'In Progress', submissionTime: '2024-04-27 11:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 4, name: 'John Doe', status: 'Completed', submissionTime: '2024-04-27 10:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 5, name: 'Jane Smith', status: 'Pending', submissionTime: '2024-04-27 11:00', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 6, name: 'Alice Johnson', status: 'In Progress', submissionTime: '2024-04-27 11:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 7, name: 'John Doe', status: 'Completed', submissionTime: '2024-04-27 10:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 8, name: 'Jane Smith', status: 'Pending', submissionTime: '2024-04-27 11:00', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 9, name: 'Alice Johnson', status: 'In Progress', submissionTime: '2024-04-27 11:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
  ];

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const isAllSelected = selectedRows.length === ocrData.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < ocrData.length;

  const toggleRow = (id: number) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === ocrData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(ocrData.map((item) => item.id));
    }
  };
  
  return (
    <Box maw='100%'>
        <Flex align="center" mb="sm" justify="space-between">
            <Text pl="xs">
                <Text span fw={700}>{`${ocrData.length}`}</Text> Submissions need confirmation
            </Text>

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
            <ScrollArea h={500}>
                <Table highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>
                                <Flex align="center" gap="sm">
                                    <Checkbox
                                        checked={isAllSelected}
                                        indeterminate={isSomeSelected}
                                        onChange={toggleSelectAll}
                                    />
                                    Select                                    
                                </Flex>
                            </Table.Th>
                            <Table.Th>Student's name & id</Table.Th>
                            <Table.Th>Match with</Table.Th>
                            <Table.Th>Submission time</Table.Th>
                            <Table.Th>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    
                    <Table.Tbody>
                        {ocrData.map((item) => (
                            <Table.Tr key={item.id}
                                style={{
                                    backgroundColor: selectedRows.includes(item.id)
                                    ? 'var(--mantine-color-blue-light)'
                                    : undefined,
                                }}
                            >
                                {/* Checkbox */}
                                <Table.Td>
                                    <Checkbox 
                                        checked={selectedRows.includes(item.id)}
                                        onChange={() => toggleRow(item.id)}
                                    />
                                </Table.Td>

                                {/* Image x2 */}
                                <Table.Td>
                                    <Flex>
                                        <Image src={item.img1} alt="Image1" maw='210px' mah='100px'/>
                                        <Image src={item.img2} alt="Image2" maw='210px' mah='100px'/>
                                    </Flex>
                                </Table.Td>

                                {/* Autocomplete Match with Student Name */}
                                <Table.Td>
                                    <Autocomplete
                                        placeholder="Match student"
                                        data={['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown']} // mock ตัวอย่าง
                                        defaultValue={item.name}
                                        w={200}
                                    />
                                </Table.Td>

                                {/* Submission Time */}
                                <Table.Td>
                                    <Text size="sm">{item.submissionTime}</Text>
                                </Table.Td>

                                {/* Delete */}
                                <Table.Td>
                                    <ActionIcon color="red" variant="subtle">
                                        <IconTrash size={20} />
                                    </ActionIcon>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Box>

    </Box>
  )
}
