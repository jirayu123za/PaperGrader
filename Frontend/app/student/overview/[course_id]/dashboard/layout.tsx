import React from 'react'
import LeftAssignment from '@/components/STD/SideBar/LeftCourse'
import { Container, Flex } from '@mantine/core'

export default function StudentCourseDashboard({ children }: { children: React.ReactNode }) {
  return (
    <Container fluid>
      <Flex>
        <LeftAssignment/>
        <main className="flex-grow min-h-screen">
          {children}
        </main>
      </Flex>
    </Container>
  )
}

