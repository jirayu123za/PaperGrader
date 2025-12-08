import { Card, Skeleton } from '@mantine/core'
import React from 'react'

export const LoadingAssignmentList = () => {
  return (
    <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} shadow="sm" padding="lg" radius="md" withBorder>
            <Skeleton height={40} width="100%" />
            </Card>
        ))}
    </div>
  )
}
