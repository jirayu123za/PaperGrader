"use client";

import react from "react";
import { useRouter, useParams } from "next/navigation";
import AccountMenu from "../../Account";
import {
  FaUser,
  FaHome,
  FaClipboardList,
  FaRegArrowAltCircleRight,
} from "react-icons/fa";
import { useFetchInstructorList } from "../../../hooks/useFetchInstructorList";
import { useStdCourseDashboardStore } from "../../../store/useCourseStore";
import { useInstructorListStore } from "../../../store/useInstructorListStore";
import { useFetchStdCourse } from "../../../hooks/useFetchCourse";
import { useDisclosure } from "@mantine/hooks";
import {
  Button,
  Divider,
  Flex,
  Image,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export default function LeftAssignment() {
  const router = useRouter();
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading, error } = useFetchInstructorList(course_id as string);
  const { instructorList } = useInstructorListStore();
  const { isLoading: isCourseLoading, error: errorCourse } = useFetchStdCourse(
    course_id as string
  );
  const { course } = useStdCourseDashboardStore();
  const [isCollapsed, { toggle: toggleCollapse }] = useDisclosure(false);

  const icons = {
    home: <FaHome />,
    user: <FaUser />,
    clipboardList: <FaClipboardList />,
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


      {/* Course Information */}
      <Flex
        direction="column"
        align="start"
        p={16}
        style={{
          backgroundColor: "#6665AC",
        }}
      >
        {course ? (
          <>
            <Title
              order={2}
              style={{ color: "#F9F9F9" }}
              className={`${isCollapsed ? "hidden" : "block"}`}
            >
              {course.course_name}
            </Title>
            <Text
              size="sm"
              style={{ color: "#E9E9E9" }}
              className={`${isCollapsed ? "hidden" : "block"}`}
            >
              Introduction to {course.course_name}
            </Text>
          </>
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
            router.push(`/student/overview/${course_id}/dashboard`);
          }}
        >
          {!isCollapsed && <span>Dashboard</span>}
        </Button>

        <Button
          // disabled={!course}
          leftSection={icons.clipboardList}
          variant="subtle"
          style={() => ({
            color: "#F9F9F9",
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            // router.push(`/student/${studentId}/regrade`);
            console.log("Regrade Requests");
          }}
        >
          {!isCollapsed && <span>Regrade Requests</span>}
        </Button>

        <Divider
          style={{
            backgroundColor: "#E9E9E9",
            display: isCollapsed ? "none" : "block",
          }}
          size="xs"
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
