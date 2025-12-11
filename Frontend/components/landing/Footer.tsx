// components/landing/LandingFooter.tsx
"use client";

import React from "react";
import { Box, Container, Group, Text, Anchor, SimpleGrid, Image, Stack, Divider } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FaCopyright } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";

const columns = [
  {
    title: "Quick Links",
    links: [
      { label: "Documentation", href: "#features" },
      { label: "Privacy Policy", href: "#how-it-works" },
      { label: "Terms of Service", href: "#instructors" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Contact", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Chiang Mai University",
    links: [
      { label: "Department of Computer Engineering", href: "https://www.cpe.eng.cmu.ac.th/" },
      { label: "Faculty of Engineering", href: "https://eng.cmu.ac.th/" },
      { label: "Chiang Mai University", href: "https://www.cmu.ac.th/" },
    ],
  },
];

export const Footer: React.FC = () => {
  const isSmall = useMediaQuery("(max-width: 768px)");
  
  return (
    <Box className="bg-[#322C5F] text-white border-t border-[#4A418C]">
      <Container fluid>
        <Box className="max-w-[110rem] mx-auto px-8">
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 4 }}
            spacing="xl"
            className="mb-8 mt-8"
          >
            <div>
              <Group gap="xs" mb="sm" align="center" justify="start">
                <Image
                  src="/Image/logo-ppgd.png"
                  alt="PaperGrader logo"
                  mih={30}
                  mah={40}
                  miw={150}
                  maw={150}
                  fit="contain"
                />
              </Group>
              <Text size="sm" c="#CFCBE3">
                A grading platform designed for paper based exams in real
                classrooms.
              </Text>
            </div>

            {isSmall && (
              <Divider
                size="sm"
                my="sm"
                className="opacity-40"
              />
            )}

            {columns.map((col) => (
              <div key={col.title}>
                <Text fw={500} mb="sm">
                  {col.title}
                </Text>

                <Stack gap={4}>
                  {col.links.map((link) => {
                    const isCMUColumn = col.title === "Chiang Mai University";

                    return (
                      <Anchor
                        key={link.label}
                        href={link.href}
                        c="#CFCBE3"
                        size="sm"
                        underline="hover"
                        target={isCMUColumn ? "_blank" : undefined}
                        rel={isCMUColumn ? "noopener noreferrer" : undefined}
                      >
                        <Group gap={4} wrap="nowrap" align="center">
                          <Text lineClamp={1}>{link.label}</Text>
                          {isCMUColumn && <IoMdOpen size={12} />}
                        </Group>
                      </Anchor>
                    );
                  })}
                </Stack>
              </div>
            ))}
          </SimpleGrid>

          <Divider size="sm" my="xl" className="opacity-60" />

          <SimpleGrid
            cols={{ base: 1, sm: 2 }}
            pb="xl"
            spacing="sm"
            verticalSpacing="xs"
          >
            <Group gap={6} align="center">
              <FaCopyright size={10} />
              <Text size="xs" c="#CFCBE3">
                {new Date().getFullYear()} PaperGrader. All rights reserved.
              </Text>
            </Group>

            <Stack
              gap={4}
              align={isSmall ? "flex-start" : "flex-end"}
            >
              <Image
                src="/Image/cpe-logo.png"
                alt="CPE CMU logo"
                mih={30}
                mah={40}
                miw={150}
                maw={150}
                fit="contain"
              />

              <Text
                size="xs"
                c="#CFCBE3"
                ta={isSmall ? "left" : "right"}
                className="leading-snug"
              >
                Designed and developed by the Department of Computer Engineering,
                <br />
                Faculty of Engineering, Chiang Mai University
              </Text>
            </Stack>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};