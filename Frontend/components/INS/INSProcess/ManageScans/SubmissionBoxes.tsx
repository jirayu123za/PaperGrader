"use client";
import React from "react";
import { Container, Box, Image, Flex } from "@mantine/core";

interface SubmissionBoxesProps {
  submissionBoxesURL: string[];
}

const SubmissionBoxes: React.FC<SubmissionBoxesProps> = ({ submissionBoxesURL }) => {
  return (
    <Container>
      <Flex className="border-1 border-dashed border-gray-300 p-0">
        {submissionBoxesURL.map((url, index) => (
          <Box
            key={index}
            w={200}
            h={100}
            style={{
              overflow: 'hidden',
            }}
          >
            <Image
              src={url}
              alt={`submission-box-${index + 1}`}
              width="100%"
              height="100%"
              fallbackSrc="https://placehold.co/200x100?text=No+Image"
            />
          </Box>
        ))}
      </Flex>
    </Container>
  );
};

export default SubmissionBoxes;
