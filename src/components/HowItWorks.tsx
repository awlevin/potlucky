"use client";

import { useRef } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    emoji: "📝",
    number: "1",
    title: "Start a Potluck",
    description:
      "Create a potluck in one click. Give it a fun name or keep the random one!",
  },
  {
    emoji: "👯",
    number: "2",
    title: "Share & Claim Dishes",
    description:
      "Share the link with friends. Everyone picks what they're bringing.",
  },
  {
    emoji: "🍽️",
    number: "3",
    title: "Enjoy the Feast",
    description:
      "Show up hungry. Every dish is accounted for — no duplicate salads!",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      style={{ flex: 1, minWidth: 0 }}
    >
      <Box
        textAlign="center"
        p={8}
        bg="bg.surface"
        rounded="2xl"
        border="1px solid"
        borderColor="border.default"
        boxShadow="0 2px 8px rgba(0,0,0,0.04)"
        height="100%"
      >
        <Text fontSize="2.5rem" mb={3}>
          {step.emoji}
        </Text>
        <Box
          rounded="lg"
          w={8}
          h={8}
          bg="brand.500"
          color="white"
          fontSize="sm"
          fontWeight={700}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb={3}
        >
          {step.number}
        </Box>
        <Text
          fontFamily="var(--font-fraunces), serif"
          fontWeight={500}
          fontSize="lg"
          mb={2}
        >
          {step.title}
        </Text>
        <Text fontSize="sm" color="text.secondary" lineHeight="1.6">
          {step.description}
        </Text>
      </Box>
    </motion.div>
  );
}

function StepDivider() {
  return (
    <Box
      display={{ base: "none", md: "flex" }}
      alignItems="center"
      px={1}
    >
      <Text color="text.muted" fontSize="xl" letterSpacing="0.2em">
        ---
      </Text>
    </Box>
  );
}

export default function HowItWorks() {
  return (
    <Box bg="bg.canvas" py={16} px={4}>
      <Box maxW="4xl" mx="auto">
        <Heading
          as="h2"
          size="lg"
          fontFamily="var(--font-fraunces), serif"
          textAlign="center"
          mb={3}
        >
          How It Works
        </Heading>
        <Box
          w={12}
          h="2px"
          bg="brand.400"
          mx="auto"
          mt={1}
          mb={10}
        />
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: 6, md: 4 }}
          justifyContent="center"
          alignItems={{ base: "stretch", md: "stretch" }}
        >
          {steps.map((step, index) => (
            <Box key={step.number} display="contents">
              <StepCard step={step} index={index} />
              {index < steps.length - 1 && <StepDivider />}
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}
