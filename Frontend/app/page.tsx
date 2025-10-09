"use client";

import { useEffect } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Header } from "../components/landingPage/Header";
import { HeroSection } from "../components/landingPage/HeroSection";
import { Footer } from "../components/landingPage/Footer";
import SignUp from "../components/Login/SignUp";

export default function LandingPage() {
  const [SignUpOpened, { open: openSignUp, close: closeSignUp }] = useDisclosure(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) { openSignUp(); }
  }, [openSignUp]);

  return (
    <AppShell
      header={{ height: 80 }}
      footer={{ height: "auto", offset: false }}
      styles={{
        main: { backgroundColor: "#ffffff" },
        header: { backgroundColor: "#f8f9fa" },
        footer: { backgroundColor: "#141414" },
      }}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main 
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}>
        <HeroSection />
      </AppShell.Main>
        
      <footer className="w-full pl-16 pr-16 pt-8 justify-center display-flex bg-slate-100">
        <Footer />
      </footer>

      <SignUp opened={SignUpOpened} onClose={closeSignUp} />
    </AppShell>
  );
}
