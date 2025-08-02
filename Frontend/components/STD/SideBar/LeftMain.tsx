"use client";

import react from "react";
import { useRouter } from "next/navigation";
import {FaHome, FaBook, FaCog, FaUser,FaRegArrowAltCircleRight } from "react-icons/fa";
import { useDisclosure } from "@mantine/hooks";
import { Button, Divider, Flex, Image, Stack } from "@mantine/core";
import AccountMenu from "../../Account";

export default function LeftMain() {
  const router = useRouter();
  const [isCollapsed, { toggle:toggleCollapse }] = useDisclosure(false);

  const icons = {
    home: <FaHome />,
    book: <FaBook />,
    cog: <FaCog />,
    user: <FaUser />,
  };

  return (
    <div
      className={`relative flex flex-col justify-between border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } h-screen`}
    >
      <Flex
        justify="space-between"
        align="center"
        p={12}
        style={{
          backgroundColor: "#6665AC",
        }}
      >
        {/* Header and Course Name */}
        {!isCollapsed && (
          <Image
            src="/Image/logo-ppgd2.png"
            alt="logo"
            w={200}
            h={60}
            p={2}
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push(`/student/overview`);
            }}
          />
        )}
        <Button
                  onClick={toggleCollapse}
                  variant="transparent"
                  radius="md"
                  styles={() => ({
                    root: {
                      border: "none",
                      padding: isCollapsed ? "0 0 0 8px" : "0",
                      height: "auto",
                    },
                  })}
                >
                  <FaRegArrowAltCircleRight
                    size={24}
                    style={{
                      color: isCollapsed ? "#f1f3f8" : "#f1f3f8",
                    }}
                    className={`transition-transform duration-300 ${
                      isCollapsed ? "" : "transform rotate-180"
                    }`}
                  />
                </Button>
      </Flex>

      {/* Main Menu */}
      <Stack
        p={16}
        gap="xs"
        className="grow"
        style={() => ({
          backgroundColor: "#6665AC",
        })}
      >
        <Button
          // disabled={!course}
          leftSection={icons.home}
          variant="subtle"
          style={() => ({
            color: "#F9F9F9",
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            router.push(`/student/overview`);
          }}
        >
          {!isCollapsed && <span>Dashboard</span>}
        </Button>

        <Button
          // disabled={!course}
          leftSection={icons.book}
          variant="subtle"
          style={() => ({
            color: "#F9F9F9",
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            router.push(`/student/overview/course`);
          }}
        >
          {!isCollapsed && <span>Course</span>}
        </Button>

        <Button
          // disabled={!course}
          leftSection={icons.cog}
          variant="subtle"
          style={() => ({
            color: "#F9F9F9",
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            // router.push(`/student/${studentId}/settings`);
            console.log("Settings");
          }}
        >
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </Stack>

      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </div>
  );
}
