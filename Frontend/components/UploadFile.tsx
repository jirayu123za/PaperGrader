import React from 'react';
import { useFileStore } from '../store/useFileStore';
import {FileInput,Text,Box,ActionIcon,Flex,rem,} from '@mantine/core';
import { FaRegFilePdf } from 'react-icons/fa6';
import { IconX } from '@tabler/icons-react';

const UploadFile: React.FC = () => {
  const {files,setFiles,templateFile,setTemplateFile,clearFiles,removeFile,} = useFileStore();

  const icon = (
    <FaRegFilePdf
      style={{
        width: rem(18).toString(),
        height: rem(18).toString(),
      }}
    />
  );

  const handleTemplateFileChange = (newFile: File | null) => {
    if (newFile) {
      const oldTemplate = templateFile;


      let updated = files;
      if (oldTemplate) {
        updated = updated.filter((f) => f.name !== oldTemplate.name);
      }


      updated = [...updated, newFile];


      setFiles(updated);
      setTemplateFile(newFile);
    }
  };


  const handleAdditionalFilesChange = (newFiles: File[]) => {
    const valid = newFiles.filter(
      (f) => f instanceof File && !files.find((old) => old.name === f.name)
    );
    setFiles([...files, ...valid]);
  };

  
  const additionalFiles = templateFile
    ? files.filter((f) => f.name !== templateFile.name)
    : files;

  return (
    <Box>
      {/* Template File */}
      <Box mb="md">
        <Text size="sm" fw={500}>
          Template File
        </Text>
        <FileInput
          leftSection={icon}
          placeholder="Select Template File"
          accept=".pdf"
          onChange={handleTemplateFileChange}
        />
        <Box mt="md">
          {templateFile ? (
            <Text size="sm" color="blue">
              {templateFile.name}
            </Text>
          ) : (
            <Text color="dimmed" size="sm">
              No template file selected.
            </Text>
          )}
        </Box>
      </Box>

      {/* Additional Files */}
      <Box>
        <Text size="sm" fw={500}>
          Additional Files
        </Text>
        <FileInput
          leftSection={icon}
          placeholder="Select Additional Files"
          accept=".pdf"
          multiple
          onChange={(fs) =>
            handleAdditionalFilesChange(fs ? Array.from(fs) : [])
          }
        />

        <Box mt="md">
          {additionalFiles.length > 0 ? (
            additionalFiles.map((file, idx) => (
              <Box key={idx} mb="xs">
                <Flex justify="space-between" align="center">
                  <Text size="sm">{file.name}</Text>
                  <ActionIcon size="sm" onClick={() => removeFile(file)}>
                    <IconX size={16} />
                  </ActionIcon>
                </Flex>
              </Box>
            ))
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
