import { Center, Loader } from '@mantine/core'
import React from 'react'

export const LoadingCourse = () => {
  return (
    <Center style={{ height: '60vh' }}>
      <Loader size="lg" />
    </Center>
  )
}
