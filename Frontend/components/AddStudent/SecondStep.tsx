"use client";

import React, { useRef } from "react";
import { Box, Text, Group, Paper, Center, Flex, FileInput, Image } from "@mantine/core";
import { IconUpload, IconFileSpreadsheet } from "@tabler/icons-react";
import useTemplateStore from "../../store/BoundingBox/useTemplateStore";
import useCSVdataStore from "../../store/add member/useCSVdataStore";

export const SecondStep = () => {
  const icons = {
    upload: <IconUpload size={40} color="#4C6EF5" />,
    sheet: <IconFileSpreadsheet size={20} color="#4C6EF5" />,
  };
  const templateImages = [
    { id: 1, src: "/Image/selectTemplate/CSV_template.png", alt: "CSV Template" },
    { id: 2, src: "/Image/selectTemplate/PPGD_template.png", alt: "PPGD Template" },
  ];

  const { selectedTemplate } = useTemplateStore();
  const selectedImage = templateImages.find((img) => img.id === selectedTemplate);
  const fileInputRef = useRef<HTMLButtonElement>(null);
  const { selectedFile, setSelectedFile } = useCSVdataStore();

  const handlePaperClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };
  
  return (
    <Center pt={30} ml={20} mr={20}>
      <Box>
        {selectedImage && (
          <Image
            key={selectedImage.id}
            src={selectedImage.src}
            alt={selectedImage.alt}
            mb="xl"
            fit="contain"
            mah={200}
          />
        )}
        <Paper
          withBorder
          bd="2px dashed #4C6EF5"
          bg="#f9fbff"
          p="md"
          radius="md"
          className="cursor-pointer"
          onClick={handlePaperClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FileInput
            ref={fileInputRef}
            display='none'
            accept=".xls,.xlsx"
            onChange={handleFileChange}
          />

          <Flex align="center" justify="center" direction="column" w="100%" h='15rem'>
            {icons.upload}

            <Text c="dimmed" mt="xs">
              Drag and Drop file here or{" "}
              <Text span c="blue" fw={500}>
                Click to Upload
              </Text>
            </Text>

            {selectedFile && (
              <Group mt="md" gap="xs">
                {icons.sheet}
                <Text fw={500}>{selectedFile.name}</Text>
              </Group>
            )}
          </Flex>
        </Paper>

        <Group justify="space-between" mt="sm">
          <Text size="sm" c="dimmed">
            Supported formats: XLS, XLSX
          </Text>
          <Text size="sm" c="dimmed">
            Maximum size: 25MB
          </Text>
        </Group>
      </Box>
    </Center>
  );
};
