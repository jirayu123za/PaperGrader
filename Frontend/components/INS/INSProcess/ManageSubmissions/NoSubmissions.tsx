'use client'
import React from 'react'
import { Flex, Text, Image, Button } from '@mantine/core'
import { useParams, useRouter } from 'next/navigation'
import { IoChevronBackOutline } from "react-icons/io5";

export const NoSubmissions = () => {
  const router = useRouter();
  const { course_id, assignment_id } = useParams() as { course_id: string; assignment_id: string };
  const handleBack = () => {
    router.push(`/instructor/course/${course_id}/process/${assignment_id}/manage-submissions`);
  }
  
  return (
    <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
      <Image
        src="/Image/table/upload_file.svg"
        alt="No question"
        w="auto"
        h={200}
        fit="contain"
        fallbackSrc="https://placehold.co/200x200?text=Placeholder"
      />
      <Text size="lg" fw={500} mt="md">
        There are no submissions to grade.
      </Text>
      <Text size="sm" c="dimmed">
        Upload and split scans to start grading.
      </Text>
      <Button mt="lg" onClick={handleBack} leftSection={<IoChevronBackOutline />} variant="light" color="blue">
        Back to manage submissions
      </Button>
    </Flex>
  )
}
