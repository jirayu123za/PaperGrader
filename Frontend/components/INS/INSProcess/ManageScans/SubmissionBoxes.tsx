"use client";
import React from "react";
import { Container, Box, Image, Flex, Center, Text } from "@mantine/core";

interface SubmissionBoxesProps {
  submissionBoxesURL: string[];
}

const SubmissionBoxes: React.FC<SubmissionBoxesProps> = ({ submissionBoxesURL }) => {
  const validURLs = submissionBoxesURL.filter((url) => typeof url === 'string' && url.trim() !== '');

  return (
    <Container>
      {validURLs.length === 0 ? (
        <Center mih={100} bg="#f8f9fa" style={{ border: '1px dashed #ccc', borderRadius: 4 }}>
          <Text size="sm" c="dimmed">
            This submission was uploaded directly by the student.
          </Text>
        </Center>
      ) : (
        <Flex className="border-1 border-dashed border-gray-300 p-0">
          {submissionBoxesURL.map((url, index) => (
            <Box
              key={index}
              mih={100}
            >
              <Image
                src={url}
                alt={`submission-box-${index + 1}`}
                w="100%"
                h="100%"
                fit="contain"
                loading="lazy"
                fallbackSrc="https://placehold.co/200x100?text=No+Image"
              />
            </Box>
          ))}
        </Flex>
      )}
    </Container>
  );
};

export default SubmissionBoxes;
