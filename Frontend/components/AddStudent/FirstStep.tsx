"use client";

import React from "react";
import useTemplateStore from "../../store/BoundingBox/useTemplateStore";
import { Card, Group, Text, Flex, Image } from "@mantine/core";

export const FirstStep = () => {
  const cardData = [
    {
      id: 1,
      imageSrc: "/Image/selectTemplate/CMU_logo.svg.png",
      title: "CMU",
      description: ".xlsx file from the CMU Registrar's Office",
    },
    {
      id: 2,
      imageSrc: "/Image/selectTemplate/PPGD_3_logo_removebg.png",
      title: "PAPER GRADER",
      description: "template as specified by PAPER GRADER",
    },
  ];

  const { selectedTemplate, setSelectedTemplate } = useTemplateStore();
  
  return (
    <>
      <Group gap="md" ml="lg" mr="lg" justify="start" pt={30}>
        {cardData.map((card) => (
          <Card
            key={card.id}
            shadow="xs"
            padding="lg"
            radius="md"
            w="370px"
            h="150px"
            withBorder
            style={{
              borderColor: selectedTemplate === card.id ? "#4C6EF5" : "#e0e0e0",
              backgroundColor: selectedTemplate === card.id ? "#e8f0fe" : "#ffffff",
              borderWidth: "2px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => {
              setSelectedTemplate(card.id);
              // console.log(selectedTemplate);
            }}
          >
            <Flex align="center" justify="space-between" h="100%" gap="md">
              <Flex direction="column" align="flex-start" justify="center">
                <Text fw={600} c="#5c5f66">
                  {card.title}
                </Text>
                <Text fw={400} size="sm" c="dimmed" ta="left">
                  {card.description}
                </Text>
              </Flex>

              <Image src={card.imageSrc} alt={card.title} w="170px" h="50px" p={2} fit="contain"/>
            </Flex>
          </Card>
        ))}
      </Group>
    </>
  );
};
