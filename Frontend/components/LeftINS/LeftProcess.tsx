import AccountMenu from '../Account';
import Link from 'next/link';
import { FaBars, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { GiClockwiseRotation } from "react-icons/gi";
import { IoStatsChart } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { Button, Container, Divider, Flex, Stack, Title, Transition, Text, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useFetchAssignmentLeft } from '../../hooks/SideBar/useFetchAssignmentLeft';
import { useAssignmentLeftProcessStore } from '../../store/useLeftProcessStore';

export default function LeftProcess() {
  const [isCollapsed, { toggle }] = useDisclosure(false);
  const router = useRouter();
  const faIcon = <FaBars size={18} className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`} />;
  const faArrowLeft = <FaArrowLeft size={18}/>;
  const giClockwiseRotation = <GiClockwiseRotation size={18}/>;
  const ioStatsChart = <IoStatsChart size={18}/>;
  const ioMdSettings = <IoMdSettings size={18}/>;
  const { course_id } = router.query;
  const { assignment_id } = router.query;
  const { isLoading, isSuccess } = useFetchAssignmentLeft(course_id as string, assignment_id as string);
  const { assignmentLeftProcess } = useAssignmentLeftProcessStore();

  const optionsState = {
    editOutline: useDisclosure(false),
    createRubric: useDisclosure(false),
    manageScans: useDisclosure(false),
    manageSubmissions: useDisclosure(false),
    gradeSubmissions: useDisclosure(false),
  };

  const toggleOption = (optionKey: keyof typeof optionsState) => {
    optionsState[optionKey][1].toggle();
  };

  const options = [
    { key: 'editOutline', label: 'Edit Outline', href: `/courses/${course_id}/process/${assignment_id}/CreateOutline` },
    { key: 'createRubric', label: 'Create rubric', href: '/courses/${course_id}/process/${assignment_id}/CreateRubric' },
    { key: 'manageScans', label: 'Manage Scans', href: '#' },
    { key: 'manageSubmissions', label: 'Manage Submissions', href: `/courses/${course_id}/process/${assignment_id}/Submissions` },
    { key: 'gradeSubmissions', label: 'Grade Submissions', href: '#' },
  ];

  return (
    <Container
      className={`relative h-screen flex flex-col border-r border-gray-300 ${
        isCollapsed ? 'w-16 p-4' : 'w-64 p-6'
      } bg-gray-100`}
    >
      {/* Top: Logo and Button Collapse */}
      <Stack>
        <Flex className="items-center justify-between mb-2">
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
          {(styles) => isCollapsed ? <></> : <Title size="h4" className="pl-2 mb-4" style={styles}>{assignmentLeftProcess.assignment_name}</Title>}
        </Transition>         

        {/* Options menu */}
        <Stack gap={4}>
          {options.map((option) => (
            <Link
              key={option.key}
              href={option.href}
              passHref
            >
              <Button
                variant="subtle"
                color="rgba(80, 89, 80, 1)"
                fullWidth
                onClick={() => toggleOption(option.key as keyof typeof optionsState)}
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
                {optionsState[option.key as keyof typeof optionsState][0] ? (
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
                  {(styles) => isCollapsed ? <></> : <Text size='sm' fw={500} style={styles}>{option.label}</Text>}
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
        </div>
      </Stack>
      
      <Group mt="auto">
        <AccountMenu isCollapsed={isCollapsed} />
      </Group>
      
    </Container>
  );
}
