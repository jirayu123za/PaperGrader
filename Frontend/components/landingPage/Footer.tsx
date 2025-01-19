import { Container, Flex, Text, Group, ActionIcon, Image, Divider, Anchor } from "@mantine/core";
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import React from "react";

const data = [
    {
      title: 'About',
      links: [
        { label: 'Features', link: '#' },
        { label: 'Pricing', link: '#' },
        { label: 'Support', link: '#' },
        { label: 'Forums', link: '#' },
      ],
    },
    {
      title: 'Project',
      links: [
        { label: 'Contribute', link: '#' },
        { label: 'Media assets', link: '#' },
        { label: 'Changelog', link: '#' },
        { label: 'Releases', link: '#' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Join Discord', link: '#' },
        { label: 'Follow on Twitter', link: '#' },
        { label: 'Email newsletter', link: '#' },
        { label: 'GitHub discussions', link: '#' },
      ],
    },
];
  
export const Footer = () => {
    const groups = data.map((group) => {
        const links = group.links.map((link, index) => (
          <Anchor
            key={index}
            href={link.link}
            c="dimmed"
            size="sm"
            underline="hover"
            style={{ display: "block", marginTop: "4px" }}
          >
            {link.label}
          </Anchor>
        ));
    
        return (
          <div key={group.title}>
            <Text fz="lg" fw={500} mt="md" c="#495057" style={{ minWidth: "160px" }}>
                {group.title}
            </Text>
            {links}
          </div>
        );
    });
    
  return (
    <>
        <Container fluid>
            <Group pt="xl" pb="xl" gap="xl" justify="space-between" align="flex-start">
                <Image src="/Image/logo-ppgd.png" alt="logo" w={500} />
                <Flex gap="xl">{groups}</Flex>
            </Group>
        </Container>

        <Container fluid>
            <Divider mt="md" mb="md"/>
            <Group py="md" gap="xl" justify="space-between">
                <Text c="dimmed" size="sm" ta="center">
                    © 2024 Paper Grader. All rights reserved.
                </Text>

                <Group gap="md" justify="flex-end" wrap="nowrap">
                    <Anchor href="#" target="_blank">
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandTwitter size={18} stroke={1.5} />
                        </ActionIcon>
                    </Anchor>
                    <Anchor href="#" target="_blank">
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandYoutube size={18} stroke={1.5} />
                        </ActionIcon>
                    </Anchor>
                    <Anchor href="#" target="_blank">
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandInstagram size={18} stroke={1.5} />
                        </ActionIcon>
                    </Anchor>
                </Group>
            </Group>
        </Container>
    </>
  );
};
