import { useEffect } from "react";
import { AppShell, Button, Grid, Group, List, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SignUp from "../components/SignUp";
import SignIn from "../components/SignIn";
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
    //   <div className="min-h-screen flex flex-col justify-between bg-[#f5f5dc]">
    //     <header className="flex items-center justify-between p-4 bg-[#edf4e0]">
    //       <div className="text-xl font-bold bg-white p-2 text-black">LOGO</div>
    //       <nav className="flex space-x-8">
    //         <a href="#" className="text-gray-700">Get start</a>
    //         <a href="#" className="text-gray-700">Get demo</a>
    //       </nav>
    //       <div className="flex space-x-4 ">
    //         <Button className="bg-[#b7410e] text-[#fffffe]" onClick={openSignUp}>Sign Up</Button>
    //       </div>
    //     </header>

    //     <main className="flex-grow flex justify-center items-center bg-[#f5f5dc]">
    //       <h1 className="text-6xl font-bold text-black">BACKGROUND</h1>
    //     </main>

    //     <footer className="flex justify-between items-center p-4 bg-[#edf4e0]">
    //       <div className="text-xl font-bold bg-white p-2 text-black">LOGO</div>
    //       <div className="flex space-x-8">
    //         <div>
    //           <h2 className="font-bold text-black">Features</h2>
    //           <ul className="text-gray-700">
    //             <li>Feature one</li>
    //             <li>Feature two</li>
    //             <li>Feature three</li>
    //           </ul>
    //         </div>
    //         <div>
    //           <h2 className="font-bold text-black">Resources</h2>
    //           <ul className="text-gray-700">
    //             <li>Blog post name list goes here</li>
    //             <li>Blog post name list goes here</li>
    //             <li>See all resources </li>
    //           </ul>
    //         </div>
    //       </div>
    //     </footer>

    //     <div className="text-center py-4 text-sm bg-[#fffffe] text-black">
    //       copyright © 2024 company name
    //     </div>

    //     {/* คอมโพเนนต์ Login Popup */}
    //     <SignIn opened={SignInOpened} onClose={closeSignIn} />
    //     <SignUp opened={signUpOpened} onClose={closeSignUp} />
    //   </div>
    // );
    <AppShell
      header={{ height: 80 }}
      footer={{ height: 120 }}
      styles={{
        main: { backgroundColor: "#f5f5dc" },
        header: { backgroundColor: "#edf4e0" },
        footer: { backgroundColor: "#edf4e0" },
      }}
    >
      <AppShell.Header className="flex justify-between items-center px-5">
        <Title className="text-black">LOGO</Title>
        <Group gap="xl">
          <Text component="a" href="#" className="text-gray-700">
            Get start
          </Text>
          <Text component="a" href="#" className="text-gray-700">
            Get demo
          </Text>
          <Button className='shadow-md' onClick={openSignUp}>Sign Up</Button>
        </Group>
      </AppShell.Header>

      {/* Main Content Section */}
      <AppShell.Main className="flex-grow flex justify-center items-center">
        <Title className="text-6xl font-bold text-black">BACKGROUND</Title>
      </AppShell.Main>

      {/* Footer Section */}
      <AppShell.Footer className="flex justify-between items-center px-5">
        <Grid overflow="hidden">
          <Grid.Col>
            <Title className="text-black">LOGO</Title>
            <Text className="text-gray-700">© 2024 Paper Grader</Text>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col>
            <Text fw={700} className="font-bold text-black">
              Features
            </Text>
            <ul className="text-gray-700 space-y-1">
              <li>Feature one</li>
              <li>Feature two</li>
              <li>Feature three</li>
            </ul>
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col>
            <Text fw={700} className="font-bold text-black">
              Resources
            </Text>
            <ul className="text-gray-700 space-y-1">
              <li>Blog post name list goes here</li>
              <li>Blog post name list goes here</li>
              <li>See all resources</li>
            </ul>
          </Grid.Col>
        </Grid>
      </AppShell.Footer>

      <SignIn opened={SignInOpened} onClose={closeSignIn} />
      <SignUp opened={signUpOpened} onClose={closeSignUp} />
    </AppShell>
  );
}
