// components/landing/LandingHeader.tsx
"use client";

import React from "react";
import { Box, Burger, Button, Container, Group, Image, Menu, NavLink, Paper, Transition } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For instructors", href: "#instructors" },
  { label: "For students", href: "#students" },
];

interface HeaderProps {
  onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignInClick }) => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const isSmall = useMediaQuery("(max-width: 767px)");
  
  const mobileItems = navLinks.map((link) => (
    <NavLink
      key={link.label}
      label={link.label}
      href={link.href}
      onClick={close}
      variant="filled"
      c="#4C6EF5"
    />
  ));

  return (
    <Box
      component="header"
      className="sticky top-0 z-40 border-b border-[#E0E4FF] bg-white/85 backdrop-blur-sm shadow-sm"
    >
      <Container fluid>
        <Group
          justify={isSmall ? "flex-end" : "space-between"}
          align="center"
          pt="sm"
          pb="sm"
          pl="lg"
          pr="lg"
        >
          {!isSmall && (
            <Group gap="xs">
              <Image
                src="/Image/logo-ppgd.png"
                alt="PaperGrader logo"
                mah={60}
                mih={50}
                fit="contain"
              />
            </Group>
          )}

          {/* Desktop nav */}
          <Group
            gap="lg"
            visibleFrom="md"
            justify="space-between"
            wrap="nowrap"
          >
            <Menu shadow="md" width={150} withArrow trigger="hover">
              <Menu.Target>
                <Button
                  variant="subtle"
                  size="sm"
                  miw={94}
                  c="#4C6EF5"
                >
                  Features
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                {navLinks.map((link) => (
                  <Menu.Item
                    key={link.label}
                    component="a"
                    href={link.href}
                  >
                    {link.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

            <Button
              variant="light"
              c="#4C6EF5"
              size="sm"
              miw={84}
              onClick={onSignInClick}
            >
              Sign in
            </Button>

            <Image
              src="/Image/cpe-logo.png"
              alt="CPE CMU logo"
              mah={45}
              fit="contain"
            />
          </Group>

          {/* Mobile nav */}
          <Group hiddenFrom="md">
            <Button
              variant="light"
              size="md"
              onClick={onSignInClick}
              c="#4C6EF5"
            >
              Sign in
            </Button>
            <Burger
              opened={opened}
              onClick={toggle}
              lineSize={5}
              size={36}
              color="#4C6EF5"
              aria-label="Toggle navigation"
            />
          </Group>
        </Group>
      </Container>

      {/* Mobile dropdown */}
      <Transition
        mounted={opened}
        transition="pop-top-right"
        duration={150}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Paper
            style={styles}
            className="md:hidden border-t border-[#E0E4FF] bg-white/95 backdrop-blur-sm"
            radius={0}
          >
            <Container fluid className="py-2">
              {mobileItems}
            </Container>
          </Paper>
        )}
      </Transition>
    </Box>
  );
};