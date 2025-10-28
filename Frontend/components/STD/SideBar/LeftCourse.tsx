"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { FaUser, FaHome, FaClipboardList, FaRegArrowAltCircleRight } from "react-icons/fa";
import { useDisclosure } from "@mantine/hooks";
import { Button, Divider, Flex, Image, Skeleton, Stack, Text, Title} from "@mantine/core";
import { useFetchStdCourse } from "@/hooks/useFetchCourse";
import { useStdCourseDashboardStore } from "@/store/useCourseStore";
import { useFetchInstructorList } from "@/hooks/useFetchInstructorList";
import { useInstructorListStore } from "@/store/useInstructorListStore";
import AccountMenu from "@/components/Account";

export default function LeftAssignment() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const course_id = params?.course_id as string;
  const { isLoading, error } = useFetchInstructorList(course_id as string);
  const { instructorList } = useInstructorListStore();
  const { isLoading: isCourseLoading, error: errorCourse } = useFetchStdCourse(course_id as string);
  const { course } = useStdCourseDashboardStore();
  const [ activeOption, setActiveOption ] = useState("");
  const [ isCollapsed, {toggle: toggleCollapse} ] = useDisclosure(false);
  const [ expandedName, {toggle: toggleExpandName} ] = useDisclosure(false);

  const icons = {
    home: <FaHome />,
    user: <FaUser />,
    clipboardList: <FaClipboardList />,
  };

  useEffect(() => {
    if (pathname.includes("dashboard")) setActiveOption("dashboard");
    else if (pathname.includes("regrade")) setActiveOption("regrade");
  }, [pathname]);

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: icons.home,
      href: `/student/course/${course_id}/dashboard`,
    },
    {
      key: "regrade",
      label: "Regrade Requests",
      icon: icons.clipboardList,
      href: `/student/overview/${course_id}/regrade`,
    },
  ];

  return (
    <div className={`relative flex flex-col justify-between border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} h-screen`}>
      <Flex justify="space-between" align="center" p={12}
        style={{
          backgroundColor: '#6665AC',
        }}
      >
        {/* Header and Course Name */}
        {!isCollapsed && (
          <Image
            src="/Image/logo-ppgd2.png"
            alt="logo" w={200} h={60} p={2}
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


      {/* Course Information */}
      <Flex direction="column" align="start" p={16}
        style={{
          backgroundColor: "#6665AC",
        }}
      >
        {course ? (
          !isCollapsed && (
            <>
              <Title
                textWrap="balance"
                order={2}
                size={20} 
                px="xs"
                style={{ color: "#F9F9F9", cursor: "pointer" }}
                lineClamp={expandedName ? undefined : 1}
                onClick={toggleExpandName}
              >
                {course.course_name}
              </Title>
              <Text
                size="sm"
                px="xs"
                pt="xs"
                style={{ color: "#E9E9E9" }}
                className={`${isCollapsed ? "hidden" : "block"}`}
              >
                Introduction to {course.course_name}
              </Text>
            </>
          )
        ) : (
          <>
            <Title
              order={2}
              style={{ color: "#F9F9F9" }}
              className={`${isCollapsed ? "hidden" : "block"}`}
            >
              No Course Selected
            </Title>
            <Text
              size="sm"
              style={{ color: "#E9E9E9" }}
              className={`${isCollapsed ? "hidden" : "block"}`}
            >
              Please select a course
            </Text>
          </>
        )}
      </Flex>

      {/* Main Content */}
      <Stack
        p={16}
        gap="xs"
        className="grow"
        style={() => ({
          backgroundColor: "#6665AC",
        })}
      >
        <Divider
          style={{
            backgroundColor: "#E9E9E9",
            display: isCollapsed ? "none" : "block",
          }}
          size="xs"
          pl={16}
          pr={16}
        />

        {menuItems.map((item) => (
          <Button
            key={item.key}
            leftSection={item.icon}
            variant="subtle"
            fullWidth
            styles={{
              root: {
                display: "flex",
                alignItems: 'center',
                justifyContent: isCollapsed ? "center" : "flex-start",
                color: activeOption === item.key ? "#424242" : "#FFFFFF",
                backgroundColor: activeOption === item.key ? "#f8f9fa" : "transparent",
                borderRadius: "8px",
                transition: "background-color 0.3s, color 0.3s",
                paddingLeft: isCollapsed ? 0 : 16,
                paddingRight: isCollapsed ? 0 : 16,
              },
              section: {
                marginRight: isCollapsed ? 0 : 8,
              },
            }}
            onClick={() => {
              setActiveOption(item.key);
              router.push(item.href);
            }}
          >
            {!isCollapsed && <span>{item.label}</span>}
          </Button>
        ))}

        <Divider color="#E9E9E9" size="xs"
          style={{
            display: isCollapsed ? "none" : "block",
          }}
        />

        {!isCollapsed && (
          <>
            <Title order={4} pt={16} style={{ color: "#F9F9F9" }}>
              INSTRUCTOR
            </Title>

            <div className="flex flex-col">
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} visible height={3} width="100%" />
                  ))
                : instructorList &&
                  instructorList.map((instructor) => (
                    <Button
                      variant="transparent"
                      leftSection={icons.user}
                      display="flex"
                      key={instructor.personalData_id}
                      style={{ color: "#F9F9F9" }}
                    >
                      <span>{instructor.instructor_name}</span>
                    </Button>
                  ))}
            </div>
          </>
        )}
      </Stack>

      <Divider
        style={{
          backgroundColor: "#E9E9E9",
          display: isCollapsed ? "none" : "block",
        }}
        size="xs"
      />

      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </div>
  );
}
