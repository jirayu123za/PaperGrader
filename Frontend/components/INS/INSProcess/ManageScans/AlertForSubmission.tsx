'use client'
import React from 'react'
import { Alert, Box, Flex, Text, Anchor } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

export const AlertForSubmission = () => {
  return (
    <Box w='50%'>
        <Alert
            icon={<IconAlertCircle size={15} />}
            color="yellow"
            p="md"
            mb={4}
        >
            <Flex align="center">
            <Text size="sm" mr={6} lineClamp={1}>
                Proposed scan splits: 
            </Text>
            <Text size="sm" lineClamp={1}>
                Proposed scan splits will likely be more accurate if you first set up the{' '}
                <Anchor
                    // href={`/courses/${course_id}/process/${assignment_id}/CreateOutline`}
                    style={{ textDecoration: 'underline', fontSize: '0.80rem' }}
                >
                Assignment outline
                </Anchor>
                .
            </Text>
            </Flex>
        </Alert>

        <Alert
            icon={<IconAlertCircle size={15} />}
            color="blue"
            p="md"
            mb="xs"
        >
            <Flex align="center">
            <Text size="sm" mr={6} lineClamp={1}>
                Scanning tips:
            </Text>
            <Text size="sm" lineClamp={1}>
                For more information on scanning best practices, see our{' '}
                <Anchor 
                href="/scanning-tips" 
                style={{ textDecoration: 'underline', fontSize: '0.80rem' }}
                >
                Scanning tips
                </Anchor>
                .
            </Text>
            </Flex>
        </Alert>
    </Box>
  )
}
