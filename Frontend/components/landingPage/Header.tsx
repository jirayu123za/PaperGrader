import { Button, Flex, Group, Text, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import SignUp from "../Login/SignUp";

export const Header = () => {
  const [signUpOpened, { open: openSignUp, close: closeSignUp }] = useDisclosure(false);

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
        <Button className="shadow-md" onClick={openSignUp}>
          Sign Up
        </Button>
      </Group>

      <SignUp opened={signUpOpened} onClose={closeSignUp} />
    </Flex>
  );
};
