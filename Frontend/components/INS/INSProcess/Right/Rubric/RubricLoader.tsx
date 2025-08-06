"use client"

import React from 'react';
import { Flex, Loader } from '@mantine/core'

export const RubricLoader = () => {
  return (
    <Flex justify="center" align="center" h={300}>
        <Loader color="violet" type='bars' />
    </Flex>
  )
}

