import { FaUserCircle, FaQuestionCircle, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { RiArrowUpSFill, RiArrowDownSFill } from "react-icons/ri";
import { useFetchLogout } from '../hooks/useFetchLogout';
import { Button, Text, Popover } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";

interface AccountMenuProps {
  isCollapsed: boolean;
}

export default function AccountMenu({ isCollapsed }: AccountMenuProps) {
  const { mutate: logout, isPending: isPendingLogout } = useFetchLogout();
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const iconFaUserCircle = <FaUserCircle size={18} />;
  const iconFaQuestionCircle = <FaQuestionCircle size={16} />;
  const iconFaEdit = <FaEdit size={16} />;
  const iconFaSignOutAlt = <FaSignOutAlt size={16} />;
  const iconRiArrowUpSFill = <RiArrowUpSFill size={16} />;
  const iconRiArrowDownSFill = <RiArrowDownSFill size={16} />;

  return (
    <Popover
      position="top-start"
      withArrow
      shadow="md"
      width={isCollapsed ? 160 : 260}
      opened={opened}
      onChange={(o) => (o ? open() : close())}
    >
      <Popover.Target>
        <Button
          h={40}
          variant="default"
          fullWidth
          radius="0"
          color="black"
          onClick={toggle}
          leftSection={iconFaUserCircle}
          rightSection={!isCollapsed ? (opened ? iconRiArrowUpSFill : iconRiArrowDownSFill) : undefined}
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: "space-between",
              textAlign: 'left',
              paddingLeft: isCollapsed ? '20px' : '20px',
            },
          }}
        >
          {!isCollapsed && <Text size="sm" fw={600}>Account</Text>}
        </Button>
      </Popover.Target>

      <Popover.Dropdown p={2}>
          <Button
            variant="subtle"
            color="rgba(80, 89, 80, 1)"
            fullWidth
            leftSection={iconFaQuestionCircle}
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: isCollapsed ? '12px' : '20px',
              },
            }}
          >
            <Text size="sm" fw={600}>Help</Text>
          </Button>
          <Button
            variant="subtle"
            color="rgba(80, 89, 80, 1)"
            fullWidth
            leftSection={iconFaEdit}
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: isCollapsed ? '12px' : '20px',
              },
            }}
          >
            <Text size="sm" fw={600}>Edit Account</Text>
          </Button>
          <Button
            variant="subtle"
            color="red"
            fullWidth
            leftSection={iconFaSignOutAlt}
            onClick={() => logout()}
            loading={isPendingLogout}
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: isCollapsed ? '12px' : '20px',
              },
            }}
          >
            <Text size="sm" fw={600}>Log Out</Text>
          </Button>
      </Popover.Dropdown>
    </Popover>
  );
}
