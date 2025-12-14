import { Header } from '@/components/INS/INSDashBoard/Header';
import { LeftMain } from '@/components/LeftINS/LeftMain';
import { Box, Flex, ScrollArea } from '@mantine/core';

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex h="100dvh">
      <LeftMain />

      <Flex direction="column" flex={1} miw={0} mih={0}>
        <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "#f9f9f7",
          }}
        >
          <Header />
        </Box>

        <ScrollArea>
          <Box px="xl" py="xl" style={{ minHeight: "100%" }}>
            {children}
          </Box>
        </ScrollArea>
      </Flex>
    </Flex>
  );
}
