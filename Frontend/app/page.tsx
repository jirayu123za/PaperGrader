// app/page.tsx
"use client";

import { useEffect } from "react";
import { Box, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import SignIn from "@/components/Login/SignIn";
import SignUp from "@/components/Login/SignUp";

export default function LandingPage() {
  const [signInOpened, { open: openSignIn, close: closeSignIn }] = useDisclosure(false);
  const [signUpOpened, { open: openSignUp, close: closeSignUp }] = useDisclosure(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("token")) {
      openSignUp();
    }
  }, [openSignUp]);

  return (
    <>
      <Box className="h-screen overflow-hidden bg-[#F7F7FF] text-slate-900">
        <ScrollArea
          type="auto"
          h="100vh"
          scrollbarSize={8}
          scrollHideDelay={600}
          styles={{
            viewport: { scrollBehavior: "smooth" },
          }}
        >
          <Header onSignInClick={openSignIn} />

          <main>
            <HeroSection
              onSecondaryCtaClick={openSignIn}
            />
            <FeaturesSection />
            <HowItWorksSection />
          </main>

          <Footer />
        </ScrollArea>
      </Box>

      {/* Modals */}
      <SignIn opened={signInOpened} onClose={closeSignIn} />
      <SignUp opened={signUpOpened} onClose={closeSignUp} />
    </>
  );
}
