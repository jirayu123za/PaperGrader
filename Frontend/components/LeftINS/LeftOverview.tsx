import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { Button, Divider, Flex, Image, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AccountMenu from '../Account';

export default function LeftOverview() {
  const [isCollapsed, { toggle }] = useDisclosure(false);

  return (
    <div className={`relative flex flex-col justify-between border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen`}>
      <Flex justify="space-between" align="center" p={12}
        style={{
          backgroundColor: '#f1f3f8',
        }}
      >
        {!isCollapsed && (
          <Image src="/Image/logo-ppgd.png" alt="logo" w={200} h={60} p={2} />
        )}
        <Button
          onClick={toggle}
          variant="transparent"
          radius="md"
          styles={() => ({
            root: {
              border: 'none',
              padding: isCollapsed ? "0 0 0 8px" : "0", 
              height: 'auto',
            },
          })}
        >
          <FaRegArrowAltCircleRight
            size={24}
            style={{
              color: isCollapsed ? '#000000': '#000000',
            }}
            className={`transition-transform duration-300 ${
              isCollapsed ? '' : 'transform rotate-180'
            }`}
          />
        </Button>
      </Flex>
      <Divider />

      <Stack
        className={`flex-grow p-4 ${isCollapsed ? 'items-center' : ''}`}
        style={{
          backgroundColor: '#6665AC',
        }}
      >
        {!isCollapsed && (
          <div>
            <Title order={2} pt={4} style={{ color: '#F9F9F9' }}>
              Your Courses
            </Title>
            <Text size="sm" pt={4} style={{ color: '#E9E9E9'}}
            >
              Welcome to PaperGrader! Click on one of your courses to the right, or on the Account menu below.
            </Text>
          </div>
        )}
      </Stack>

      <Stack>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </div>
  );
}
