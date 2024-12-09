import { useState } from 'react';
import { FaBars, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { GiClockwiseRotation } from "react-icons/gi";
import { IoStatsChart } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { Button, Container, Divider, Flex, Stack, Title, Transition, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import AccountMenu from '../Account';
import Link from 'next/link';

interface LeftProcessProps {
  assignment_name: string;
  process_id: string;
}

export default function LeftProcess({ assignment_name, process_id }: LeftProcessProps) {
  const [isCollapsed, { toggle }] = useDisclosure(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['Edit Outline']);
  const faIcon = <FaBars size={18} className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`} />;
  const faArrowLeft = <FaArrowLeft size={18}/>;
  const giClockwiseRotation = <GiClockwiseRotation size={18}/>;
  const ioStatsChart = <IoStatsChart size={18}/>;
  const ioMdSettings = <IoMdSettings size={18}/>;
  const router = useRouter();
  const { course_id } = router.query;

  const toggleOption = (option: string) => {
    setSelectedOptions((prevOptions) =>
      prevOptions.includes(option)
        ? prevOptions.filter((opt) => opt !== option)
        : [...prevOptions, option]
    );
  };

  return (
    <Container
      className={`relative h-screen flex flex-col border-r border-gray-300 ${
        isCollapsed ? 'w-16 p-4' : 'w-64 p-6'
      } bg-gray-100`}
    >
      {/* Top: Logo and Button Collapse */}
      <Stack>
        <Flex className="items-center justify-between mb-4">
          <div
            className={`bg-gray-200 rounded transition-opacity duration-300 ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
          >
            Logo
          </div>
          <Button
            onClick={toggle}
            variant="transparent"
            color="black"
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: isCollapsed ? '6px' : '12px',
              },
            }}
          >
            {faIcon}
          </Button>
        </Flex>

        {/* Button back to course */}
        <Button
          variant="transparent"
          leftSection={faArrowLeft}
          color="black"
          className={`transition-all duration-300 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              textAlign: 'left',
              paddingLeft: isCollapsed ? '6px' : '12px',
            },
          }}
        >
          <Transition
            mounted={!isCollapsed}
            transition="fade"
            duration={300}
            timingFunction="ease"
          >         
          {(styles) => isCollapsed ? <Title size="md" style={styles}></Title> : <Title size="md" style={styles}>Back to this course</Title>}
          </Transition> 
        </Button>

        {/* Assignment's name */}
        <Transition
          mounted={!isCollapsed}
          transition="fade"
          duration={300}
          timingFunction="ease"
        >         
          {(styles) => isCollapsed ? <></> : <Title size="h4" className="pl-2 mb-4" style={styles}>{assignment_name}</Title>}
        </Transition>         

        {/* Options menu */}
        <Stack gap={4}>
          {[
            'Edit Outline',
            'Create rubric',
            'Manage Scans',
            'Manage Submissions',
            'Grade Submissions',
          ].map((option) => (
            <Link
              key={option}
              href={
                option === 'Edit Outline'
                  ? `/courses/${course_id}/process/${process_id}/CreateOutline`
                  : option === 'Manage Submissions'
                  ? `/courses/${course_id}/process/${process_id}/Submissions`
                  : '#'
              }
              passHref
            >
              <Button
                variant="subtle"
                color="rgba(80, 89, 80, 1)"
                fullWidth
                onClick={() => toggleOption(option)}
                className="transition-all duration-300"
                styles={{
                  root: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    paddingLeft: isCollapsed ? '6px' : '12px',
                  },
                }}
              >
                {selectedOptions.includes(option) ? (
                  <FaCheckCircle className="w-4 h-4 text-green-500 mr-2"/>
                ) : (
                  <div className="w-4 h-4 border border-black rounded-full bg-white mr-2"></div>
                )}
                <Transition
                  mounted={!isCollapsed}
                  transition="fade"
                  duration={300}
                  timingFunction="ease"
                >         
                  {(styles) => isCollapsed ? <></> : <Text size='sm' fw={500} style={styles}>{option}</Text>}
                </Transition>  
              </Button>
            </Link>
          ))}
        </Stack>

      {/* Divider and Footer */}
      <div className="mt-auto">
        <Divider size="sm" className="mb-4" />
          <Button
            variant="subtle"
            color="rgba(80, 89, 80, 1)"
            leftSection={giClockwiseRotation}
            fullWidth
            className="transition-all duration-300"
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: isCollapsed ? '6px' : '12px',
              },
            }}
          >
            <Transition
              mounted={!isCollapsed}
              transition="fade"
              duration={300}
              timingFunction="ease"
            >         
              {(styles) => isCollapsed ? <></> : <Text size='sm' fw={500} style={styles}>Regrade Requests</Text>}
            </Transition>  
          </Button>
          <Button
            variant="subtle"
            color="rgba(80, 89, 80, 1)"
            leftSection={ioStatsChart}
            fullWidth
            className="transition-all duration-300"
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: isCollapsed ? '6px' : '12px',
              },
            }}
          >
            <Transition
              mounted={!isCollapsed}
              transition="fade"
              duration={300}
              timingFunction="ease"
            >         
              {(styles) => isCollapsed ? <></> : <Text size='sm' fw={500} style={styles}>Statistics</Text>}
            </Transition> 
          </Button>
          <Button
            variant="subtle"
            color="rgba(80, 89, 80, 1)"
            leftSection={ioMdSettings}
            fullWidth
            className="transition-all duration-300"
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: isCollapsed ? '6px' : '12px',
              },
            }}
          >
            <Transition
              mounted={!isCollapsed}
              transition="fade"
              duration={300}
              timingFunction="ease"
            >         
              {(styles) => isCollapsed ? <></> : <Text size='sm' fw={500} style={styles}>Settings</Text>}
            </Transition>             
          </Button>
          <AccountMenu isCollapsed={isCollapsed} />
      </div>
    </Stack>
    </Container>
  );
}
