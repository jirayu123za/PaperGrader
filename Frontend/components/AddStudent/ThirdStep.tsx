"use client";

import React, { useEffect } from "react";
import useCSVdataStore from "../../store/add member/useCSVdataStore";
import { useForm } from "@mantine/form";
import { Box, Flex, Radio, RadioGroup, Select, Table, Text } from "@mantine/core";

export const ThirdStep = () => {
  const csvData = useCSVdataStore((state) => state.csvData);
  const csvHeaders = csvData?.columns || [];
  const { setFormValues } = useCSVdataStore();
  
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      section: '',
      role: 'STUDENT',
    },
    validate: {
      firstName: (value) => (value ? null : 'First Name is required'),
      lastName: (value) => (value ? null : 'Last Name is required'),
      email: (value) => (value ? null : 'Email is required'),
      section: (value) => (value ? null : 'Section is required'),
    },
  });

  useEffect(() => {
    if (csvData) {
      const columnData = {
        first_name: csvData.data.map((row) => row[form.values.firstName]),
        last_name: csvData.data.map((row) => row[form.values.lastName]),
        email: csvData.data.map((row) => row[form.values.email]),
        section: csvData.data.map((row) => row[form.values.section]),
        student_code: csvData.data.map((row) => row[form.values.studentId]),
        role_type: form.values.role,
      };
      setFormValues(columnData);
    }
  }, [form.values, csvData, setFormValues]);

  const renderPreviewRows = () => {
    const previewRows = csvData?.data.slice(0, 3) || [];
    return previewRows.map((row, index) => (
      <Table.Tr key={index}>
        <Table.Td style={{ textAlign: 'left', paddingLeft: 16 }}>{row[form.values.firstName] || '-'}</Table.Td>
        <Table.Td style={{ textAlign: 'left', paddingLeft: 16 }}>{row[form.values.lastName] || '-'}</Table.Td>
        <Table.Td style={{ textAlign: 'left', paddingLeft: 16 }}>{row[form.values.email] || '-'}</Table.Td>
        <Table.Td style={{ textAlign: 'left', paddingLeft: 16 }}>{row[form.values.section] || '-'}</Table.Td>
        <Table.Td style={{ textAlign: 'left', paddingLeft: 16 }}>{row[form.values.studentId] || '-'}</Table.Td>
      </Table.Tr>
    ));
  };
  
  return (
    <Box pt={30} mr={20} ml={20}>
      {/* Part of Column and Table */}
      <Table striped withColumnBorders verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Select
                label="First Name"
                placeholder="Select a first name column"
                required
                withAsterisk
                clearable
                data={csvHeaders}
                {...form.getInputProps('firstName')}
              />
            </Table.Th>
            <Table.Th>
              <Select
                label="Last Name"
                placeholder="Select a last name column"
                required
                withAsterisk
                clearable
                data={csvHeaders}
                {...form.getInputProps('lastName')}
              />
            </Table.Th>
            <Table.Th>
              <Select
                label="Email"
                placeholder="Select an email column"
                required
                withAsterisk
                clearable
                data={csvHeaders}
                {...form.getInputProps('email')}
              />
            </Table.Th>
            <Table.Th>
              <Select
                label="Section"
                placeholder="Select a section column"
                required
                withAsterisk
                clearable
                data={csvHeaders}
                {...form.getInputProps('section')}
              />
            </Table.Th>
            <Table.Th>
              <Select
                label="Student ID (Optional)"
                placeholder="Select a student id column"
                required
                withAsterisk={false}
                clearable
                data={csvHeaders}
                {...form.getInputProps('studentId')}
              />
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>

        {renderPreviewRows()}
        {csvData && csvData.data.length > 3 && (
          <Table.Tr>
            <Table.Td colSpan={5}>
              <Text c="dimmed" size="sm">
                ... and {csvData.data.length - 3} other rows
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
        </Table.Tbody>
      </Table>

      {/* Radio Role */}
      <Flex justify="flex-start" align="flex-start" mt="md">
        <RadioGroup
          label="Role"
          ta="left"
          required
          withAsterisk
          {...form.getInputProps('role')}
        >
          <Flex direction="row" gap="sm" mt='xs'>
            <Radio value="STUDENT" label="Student" />
            <Radio value="INSTRUCTOR" label="Instructor" disabled />
            <Radio value="TA" label="TA" disabled />
          </Flex>
        </RadioGroup>
      </Flex>
    </Box>
  );
};
