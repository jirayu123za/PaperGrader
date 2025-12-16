import { Header } from '@/components/INS/INSStatistics/Header';
import { Box, Flex, ScrollArea } from '@mantine/core';

export default function StatisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex h="100dvh">
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
          <Box 
            px={{ base: "md", md: "xl" }}
            py={{ base: "md", md: "xl" }}
            pb={80}
            style={{ minHeight: "100%" }}
          >
            {children}
          </Box>
        </ScrollArea>
      </Flex>
    </Flex>
  );
}