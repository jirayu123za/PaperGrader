"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaBook,
  FaCog,
  FaUser,
  FaRegArrowAltCircleRight,
} from "react-icons/fa";
import { useDisclosure } from "@mantine/hooks";
import { Button, Flex, Image, Stack } from "@mantine/core";
import AccountMenu from "../../Account";
import { usePathname } from "next/navigation";

export default function LeftMain() {
  const router = useRouter();
  const [isCollapsed, { toggle: toggleCollapse }] = useDisclosure(false);
  const pathname = usePathname();

  const [activeOption, setActiveOption] = useState("");

  const icons = {
    home: <FaHome />,
    book: <FaBook />,
    cog: <FaCog />,
    user: <FaUser />,
  };

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: icons.home,
      href: `/student/overview`,
    },
    {
      key: "courses",
      label: "Courses",
      icon: icons.book,
      href: `/student/overview/course`,
    },
    {
      key: "settings",
      label: "Settings",
      icon: icons.cog,
      href: `/student/settings`,
    },
  ];

  useEffect(() => {
    if (pathname.includes("course")) setActiveOption("courses");
    else if (pathname.includes("overview")) setActiveOption("dashboard");
    else if (pathname.includes("settings")) setActiveOption("settings");
  }, [pathname]);

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
              color: "#f1f3f8",
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
        style={{
          backgroundColor: "#6665AC",
        }}
      >
        {menuItems.map((item) => (
          <Button
            key={item.key}
            leftSection={item.icon}
            variant="subtle"
            styles={{
              root: {
                display: "flex",
                justifyContent: isCollapsed ? "center" : "flex-start",
                color: activeOption === item.key ? "#424242" : "#FFFFFF",
                backgroundColor:
                  activeOption === item.key ? "#f8f9fa" : "transparent",
                borderRadius: "8px",
                transition: "background-color 0.3s, color 0.3s",
              },
              section: {
                marginRight: isCollapsed ? 0 : 8,
              },
            }}
            onClick={() => {
              setActiveOption(item.key);
              // ปุ่ม Settings จะไม่เปลี่ยนหน้า
              if (item.key !== "settings") {
                router.push(item.href);
              }
            }}
          >
            {!isCollapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </Stack>

      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </div>
  );
}
