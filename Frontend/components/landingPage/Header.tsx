"use client";

import { Button, Flex, Group, Text, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import SignIn from "../Login/SignIn";

export const Header = () => {
  const [signInOpened, { open: openSignIn, close: closeSignIn }] = useDisclosure(false);

  return (
    <Flex justify="space-between" align="center" px="lg" h={80}>
      <Image src="/Image/logo-ppgd.png" alt="logo" w="auto" h={80} p={8} />
      <Group gap="xl" p={8}>
        <Text component="a" href="#" className="text-gray-700">
          Get start
        </Text>
        <Text component="a" href="#" className="text-gray-700">
          Get demo
        </Text>
        <Button color="#4877E0" className="shadow-sm" onClick={openSignIn}>
          Sign In
        </Button>
      </Group>

      <SignIn opened={signInOpened} onClose={closeSignIn} />
    </Flex>
  );
};
