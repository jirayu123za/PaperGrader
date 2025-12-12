import React from 'react'
import LeftMain from '@/components/STD/SideBar/LeftMain'
import { Box, Flex, ScrollArea } from '@mantine/core'
import { Header } from '@/components/STD/CourseOverView/Header'

export default function StudentCourse({ children }: { children: React.ReactNode }) {
  return (
    <Flex h="100dvh">
      <LeftMain />

      <Flex direction="column" flex={1} miw={0} mih={0}>
        <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
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
  )
}
