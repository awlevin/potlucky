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
      style={{ flex: 1 }}
    >
      <Box textAlign="center" p={6}>
        <Text fontSize="3rem" mb={3}>
          {step.emoji}
        </Text>
        <Box
          rounded="full"
          w={6}
          h={6}
          bg="brand.500"
          color="white"
          fontSize="sm"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb={3}
        >
          {step.number}
        </Box>
        <Text fontWeight={600} mb={2}>
          {step.title}
        </Text>
        <Text fontSize="sm" color="text.muted">
          {step.description}
        </Text>
      </Box>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <Box bg="bg.muted" py={16} px={4}>
      <Box maxW="4xl" mx="auto">
        <Heading as="h2" size="lg" textAlign="center" mb={8}>
          How It Works
        </Heading>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={8}
          justifyContent="center"
        >
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </Flex>
      </Box>
    </Box>
  );
}
