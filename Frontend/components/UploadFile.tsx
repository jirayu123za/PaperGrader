import React from 'react';
import { useFileStore } from '../store/useFileStore';
import { FileInput, Group, Text, Box } from '@mantine/core';
import { FaRegFilePdf } from "react-icons/fa6";
import { rem } from '@mantine/core';

const UploadFile: React.FC = () => {
  const { files, setFiles, templateFile, setTemplateFile, clearFiles } = useFileStore();
  const icon = <FaRegFilePdf style={{ width: rem(18).toString(), height: rem(18).toString() }} />;

  const handleTemplateFileChange = (newFile: File | null) => {
    if (newFile) {
      setTemplateFile(newFile); // Set the template file
      if (!files.find((file) => file.name === newFile.name)) {
        setFiles([...files, newFile]); // Add the template file to files if not already present
      }
      console.log('Template file uploaded and set to:', newFile.name); // Log template file
    }
  };

  const handleAdditionalFilesChange = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => file instanceof File && !files.find((f) => f.name === file.name));
    setFiles([...files, ...validFiles]); // Update store with new files
    console.log('Additional files uploaded:', validFiles.map((file) => file.name)); // Log additional files
  };

  return (
    <Box>
      {/* Template File Upload Section */}
      <Box mb="md">
        <Text size="sm" fw={500}>
          Template File
        </Text>
        <Group>
          <FileInput
            leftSection={icon}
            placeholder="Select Template File"
            accept=".pdf"
            onChange={(file) => handleTemplateFileChange(file)}
          />
        </Group>
        <Box mt="md">
          {templateFile ? (
            <Text size="sm" color="blue">
              {templateFile.name} (Template)
            </Text>
          ) : (
            <Text color="dimmed" size="sm">
              No template file selected.
            </Text>
          )}
        </Box>
      </Box>

      {/* Additional Files Upload Section */}
      <Box>
        <Text size="sm" fw={500}>
          Additional Files
        </Text>
        <Group>
          <FileInput
            leftSection={icon}
            placeholder="Select Additional Files"
            accept=".pdf"
            multiple
            onChange={(files) =>
              handleAdditionalFilesChange(files ? Array.from(files) : [])
            }
          />
        </Group>

        <Box mt="md">
          {files.length > 0 ? (
            <Box>
              {files.map((file, index) => (
                <Text key={index} size="sm" color={file === templateFile ? 'blue' : 'black'}>
                  {file.name} {file === templateFile && '(Template)'}
                </Text>
              ))}
            </Box>
          ) : (
            <Text color="dimmed" size="sm">
              No files uploaded.
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UploadFile;