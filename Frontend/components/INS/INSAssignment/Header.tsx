import React from 'react'
import { Container, Flex, Text } from "@mantine/core";

export const Header = () => {
  return (
    <Container fluid className="shadow-sm">
      <Flex justify="flex-start" align="baseline" direction="row" gap="xs" py="xs" px="md">
        <Text
            fw={700}
            variant="gradient"
            gradient={{ from: 'rgba(162, 92, 247, 1)', to: 'rgba(83, 72, 156, 1)', deg: 259 }}
            className="drop-shadow-sm"
            style={{
                fontSize: "clamp(20px, 4vw, 38px)",
                lineHeight: 1.2,
            }}
        >
            Assignments list
        </Text>
      </Flex>
    </Container>
  );
};
