import { Box, Checkbox, Flex, Select, Table, Text, TextInput, Image, ActionIcon, Autocomplete, ScrollArea, Button, Transition, Alert } from '@mantine/core';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import { IoMdCheckmark } from "react-icons/io";
import { TfiReload } from "react-icons/tfi";
import React, { useState } from 'react'

type Props = {
    course_id: string;
    assignment_id: string;
};

export const ManageOCR: React.FC<Props> = ({ course_id, assignment_id })  => {
interface OCRDataItem {
    id: number;
    name: string;
    student_code: number;
    status: string;
    submissionTime: string;
    img1: string;
    img2: string;
}

const ocrData: OCRDataItem[] = [
    { id: 1, name: 'John Doe', student_code: 123456789, status: 'Completed', submissionTime: '2024-04-27 10:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 2, name: 'Jane Smith', student_code: 123456789, status: 'Pending', submissionTime: '2024-04-27 11:00', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 3, name: 'Alice Johnson', student_code: 123456789, status: 'In Progress', submissionTime: '2024-04-27 11:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 4, name: 'John Doe', student_code: 123456789, status: 'Completed', submissionTime: '2024-04-27 10:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 5, name: 'Jane Smith', student_code: 123456789, status: 'Pending', submissionTime: '2024-04-27 11:00', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 6, name: 'Alice Johnson', student_code: 123456789, status: 'In Progress', submissionTime: '2024-04-27 11:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 7, name: 'John Doe', student_code: 123456789, status: 'Completed', submissionTime: '2024-04-27 10:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 8, name: 'Jane Smith', student_code: 123456789, status: 'Pending', submissionTime: '2024-04-27 11:00', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
    { id: 9, name: 'Alice Johnson', student_code: 123456789, status: 'In Progress', submissionTime: '2024-04-27 11:30', img1: 'https://placehold.co/210x100', img2: 'https://placehold.co/210x100' },
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
            <Flex align="center" gap="xs">
                <Text pl="xs">
                    <Text span fw={700}>{`${ocrData.length}`}</Text> Submissions need confirmation
                </Text>
                <ActionIcon color="blue" variant="subtle">
                    <TfiReload size={20} />
                </ActionIcon>
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
                                        onChange={toggleSelectAll}
                                    />
                                    Select                                    
                                </Flex>
                            </Table.Th>
                            <Table.Th>Student's name & id</Table.Th>
                            <Table.Th>Example</Table.Th>
                            <Table.Th>Match with</Table.Th>
                            <Table.Th>Submission time</Table.Th>
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
                                <Table.Td maw="260px">
                                    <Flex>
                                        <Image src={item.img1} alt="Image1" maw='210px' mah='100px'/>
                                        <Image src={item.img2} alt="Image2" maw='210px' mah='100px'/>
                                    </Flex>
                                </Table.Td>

                                <Table.Td>
                                    <Text size="sm">{item.name}</Text>
                                    <Text size="sm" c="dimmed">{item.student_code}</Text>
                                </Table.Td>

                                {/* Autocomplete Match with Student Name */}
                                <Table.Td>
                                    <Autocomplete
                                        placeholder="Match student"
                                        data={['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown']}
                                        defaultValue={item.name}
                                        w={200}
                                    />
                                    <Text size='sm' c="dimmed" pt={2}>{item.student_code}</Text>
                                </Table.Td>

                                {/* Submission Time */}
                                <Table.Td>
                                    <Text size="sm">{item.submissionTime}</Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}
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
