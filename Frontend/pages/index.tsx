import { useEffect } from "react";
import { AppShell, Button, Container, Flex, Grid, Group, Image, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SignUp from "../components/Login/SignUp";
import SignIn from "../components/Login/SignIn";
import "@mantine/core/styles/AppShell.css";
import "@mantine/core/styles/Text.css";

export default function LandingPage() {
  const [SignInOpened, { open: openSignIn, close: closeSignIn }] = useDisclosure(false);
  const [signUpOpened, { open: openSignUp, close: closeSignUp }] = useDisclosure(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      openSignIn();
    }
  }, [openSignIn]);

  return (
    <AppShell
      header={{ height: 80 }}
      footer={{ height: 120 }}
      styles={{
        main: { backgroundColor: "#ffffff" },
        header: { backgroundColor: "#f8f9fa" },
        footer: { backgroundColor: "#141414" },
      }}
    >
      <AppShell.Header>
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
        </Flex>
      </AppShell.Header>

      <AppShell.Main className="flex-col flex justify-center items-center">
      <Container>
        <Flex direction="column" align="center" justify="center" style={{ textAlign: "center" }}>
          <Text size="64px" w={1400} fw={500} c="#424242" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)" }}>
            Transform the way you grade easier than ever
          </Text>
          <div className="flex justify-center items-center mt-6">
            <Text size="64px" w={150} fw={500} h={70} c="#424242" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)" }}>
              with
            </Text>
            <Text
              variant="gradient"
              gradient={{ from: "#B7410E", to: "#F0A369", deg: 45 } }
              size="64px"
              fw={500}
              w="auto"
              h={70}
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)" }}
            >
              PaperGrader
            </Text>
          </div>
          <Text size="xl" c="#495057" mt="md" fw={400}>
            Simplify scoring and grading in one platform with tools designed for convenience. Whether it's setting customizable rubrics, displaying detailed scores, or managing the grading system, PaperGrader supports instructors and students at every step.
          </Text>
          <Button className='shadow-md mt-6' size="lg" radius="xl" onClick={openSignUp}>
            Get Started
          </Button>
        </Flex>

        {/* <Flex direction="column" align="center" justify="center" style={{ textAlign: "center" }}>
          <Title order={2} mt="xl" fw={700} c="#424242">
            Features
          </Title>
          <Grid mt="lg" gutter="lg" justify="center" align="center">
            <Grid.Col span={4}>
              <Flex direction="column" align="center">
                <Title order={3} fw={600} c="#212529">
                  Feature 1
                </Title>
                <Text color="dimmed" align="center">
                  Description of feature 1
                </Text>
              </Flex>
            </Grid.Col>
            <Grid.Col span={4}>
              <Flex direction="column" align="center">
                <Title order={3} fw={600} c="#212529">
                  Feature 2
                </Title>
                <Text color="dimmed" align="center">
                  Description of feature 2
                </Text>
              </Flex>
            </Grid.Col>
            <Grid.Col span={4}>
              <Flex direction="column" align="center">
                <Title order={3} fw={600} c="#212529">
                  Feature 3
                </Title>
                <Text color="dimmed" align="center">
                  Description of feature 3
                </Text>
              </Flex>
            </Grid.Col>
          </Grid>
        </Flex> */}
    
      </Container>
      </AppShell.Main>

      {/* Footer Section */}
      <AppShell.Footer className="flex-grow flex justify-center items-center">
      <Container>
        <Flex direction="column" align="center" justify="center" style={{ textAlign: "center" }}>
          <Text size="20px" c="#ffffff" fw={500}>
            © 2024 Paper Grader
          </Text>
        </Flex>
      </Container>
      </AppShell.Footer>

      <SignIn opened={SignInOpened} onClose={closeSignIn} />
      <SignUp opened={signUpOpened} onClose={closeSignUp} />
    </AppShell>
  );
}
