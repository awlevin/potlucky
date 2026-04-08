"use client"

import { useEffect, useState } from "react";
import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { LuDelete, LuCheck } from "react-icons/lu";
import { Food, User } from "@/types";
import { Tooltip } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

interface FoodListProps {
  foods: Food[];
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  users: User[] | undefined;
  currUser: User | undefined;
}

export const FoodList = ({
  foods,
  claimFood,
  removeFood,
  users,
  currUser
}: FoodListProps) => {
  return (
    <Flex
      flexDirection="row"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <AnimatePresence>
        {foods.map((food) => {
          const userClaimedBy = users?.find((u) => u.id === food.claimedBy);
          const isForSelectedUser =
            Boolean(food.claimedBy && food.claimedBy === currUser?.id);

          return (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <FoodItemRow
                food={food}
                claimFood={claimFood}
                removeFood={removeFood}
                userClaimedBy={userClaimedBy}
                isForSelectedUser={isForSelectedUser}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Flex>
  );
};

interface FoodItemRowProps {
  food: Food;
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  userClaimedBy: User | undefined;
  isForSelectedUser: boolean;
}

const FoodItemRow = ({
  food,
  claimFood,
  removeFood,
  userClaimedBy,
  isForSelectedUser,
}: FoodItemRowProps) => {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isClicked) {
      setIsClicked(true);
    } else {
      removeFood(food.id);
    }
  };

  const isUnclaimed = !userClaimedBy;
  const isClaimedByOther = !!userClaimedBy && !isForSelectedUser;

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Flex
        onClick={() => claimFood(food.id)}
        bg={
          isForSelectedUser
            ? "accent.50"
            : isClaimedByOther
              ? "bg.muted"
              : "bg.surface"
        }
        border={
          isForSelectedUser
            ? "1.5px solid"
            : isUnclaimed
              ? "1.5px dashed"
              : "1.5px solid"
        }
        borderColor={
          isForSelectedUser
            ? "accent.400"
            : "border.default"
        }
        rounded="xl"
        px={3}
        py={2}
        alignItems="center"
        gap={2}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: isForSelectedUser ? "accent.500" : "brand.300",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        role="button"
      >
        <Text
          fontSize="sm"
          fontWeight={isForSelectedUser ? 600 : 400}
          color={
            isForSelectedUser
              ? "accent.800"
              : isUnclaimed
                ? "text.secondary"
                : "text.primary"
          }
        >
          {food.title}
        </Text>
        {isClaimedByOther && userClaimedBy && (
          <Box
            bg="brand.50"
            color="brand.700"
            fontSize="xs"
            fontWeight={600}
            px={1.5}
            py={0.5}
            rounded="md"
            whiteSpace="nowrap"
          >
            {userClaimedBy.name}
          </Box>
        )}
        {isForSelectedUser && userClaimedBy && (
          <Box
            bg="accent.100"
            color="accent.700"
            fontSize="xs"
            fontWeight={600}
            px={1.5}
            py={0.5}
            rounded="md"
            whiteSpace="nowrap"
          >
            {userClaimedBy.name}
          </Box>
        )}
        <Tooltip
          content={"Confirm delete"}
          disabled={!isClicked}
          showArrow
          positioning={{ placement: "top" }}
        >
          <IconButton
            aria-label={`Remove ${food.title}`}
            size="xs"
            variant="ghost"
            onClick={handleDelete}
            opacity={isClicked ? 1 : 0}
            transition="opacity 0.2s"
            color={isClicked ? "warm.500" : "warm.400"}
            _hover={{
              bg: isClicked ? "warm.50" : "bg.muted",
            }}
            css={{
              ".chakra-flex:hover &": {
                opacity: 1,
              },
            }}
          >
            {isClicked ? <LuCheck /> : <LuDelete />}
          </IconButton>
        </Tooltip>
      </Flex>
    </motion.div>
  );
};
