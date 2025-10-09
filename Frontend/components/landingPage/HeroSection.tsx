"use client";

import React from 'react'
import SignIn from '../Login/SignIn';
import { Button, Card, Container, Divider, Flex, SimpleGrid, Text } from '@mantine/core'
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import { IconCookie, IconGauge, IconUser } from '@tabler/icons-react';

const mockData = [
    {
      title: 'Extreme performance',
      description:
        'This dust is actually a powerful poison that will even make a pro wrestler sick, Regice cloaks itself with frigid air of -328 degrees Fahrenheit',
      icon: IconGauge,
    },
    {
      title: 'Privacy focused',
      description:
        'People say it can run at the same speed as lightning striking, Its icy body is so cold, it will not melt even if it is immersed in magma',
      icon: IconUser,
    },
    {
      title: 'No third parties',
      description:
        'They’re popular, but they’re rare. Trainers who show them off recklessly may be targeted by thieves',
      icon: IconCookie,
    },
];

export const HeroSection = () => {
  const [signInOpened, { open: openSignIn, close: closeSignIn }] = useDisclosure(false);
  //   const { height, width } = useViewportSize(); may be used later

  const features = mockData.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" padding="xl">
      <feature.icon size={50} stroke={1.5} color='#1c7ed6'/>
      <Text fz="lg" fw={500} mt="md" c="#495057">
        {feature.title}
      </Text>

      <Divider size="md" mt="sm" w="20%" color="#74c0fc" />
      
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));
    
  return (
    <>
    <Container 
        fluid 
        style={{
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "80vh",
            width: "100vw",
          }}
        >
        <Flex direction="column" align="center" justify="center" style={{ textAlign: "center", width: "100%", maxWidth: "1200px", padding: "1rem", }}>
            <Text 
                size="64px" w="100%" fw={500} c="#424242"
                style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)", wordWrap: "break-word", lineHeight: "1.25" }}
              >
              Transform the way you grade easier than ever with{" "}
              <span className="bg-linear-to-r from-[#B7410E] to-[#F0A369] bg-clip-text text-transparent font-semibold"
              >
                PaperGrader
              </span>
            </Text>
            <Text size="xl" c="#495057" mt="md" fw={400}>
              Simplify scoring and grading in one platform with tools designed for convenience. Whether it's setting customizable rubrics, displaying detailed scores, or managing the grading system, PaperGrader supports instructors and students at every step.
            </Text>
            <Button className='shadow-sm mt-6' color='#4877E0' size="lg" radius="xl" onClick={openSignIn}>
              Get Started
            </Button>
        </Flex>
    </Container>

    <Container
        size="lg" py="xl" 
        style={{
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "start",
            minHeight: "50vh",
            width: "100vw",
          }}
    >
        <Text 
            ta="start" size="48px" fw={600} c="#1c7ed6" mb="lg" mt="lg"
            style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)" }}
            >
            Instructor
        </Text>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {features}
        </SimpleGrid>
    </Container>

    <Container
        size="lg" py="xl" 
        style={{
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "start",
            minHeight: "50vh",
            width: "100vw",
            overflow: "hidden",
          }}
    >
        <Text 
            ta="start" size="48px" fw={600} c="#1c7ed6" mb="lg" mt="lg"
            style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)" }}
            >
            Student
        </Text>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {features}
        </SimpleGrid>
    </Container>

    <SignIn opened={signInOpened} onClose={closeSignIn} />
    </>
  )
}
