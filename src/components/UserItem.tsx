"use client"

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { LuDelete, LuCheck } from "react-icons/lu";
import { User } from "@/types";
import { Tooltip } from "@/components/ui/tooltip";

interface UserItemProps {
  user: User;
  claimUser: (id: string) => void;
  removeUser: (id: string) => void;
  isSelectedUser: boolean;
}

const UserItem = ({
  user,
  claimUser,
  removeUser,
  isSelectedUser,
}: UserItemProps) => {
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
      removeUser(user.id);
    }
  };

  return (
    <Flex
      onClick={() => claimUser(user.id)}
      bg={isSelectedUser ? "accent.100" : "bg.muted"}
      border="1.5px solid"
      borderColor={isSelectedUser ? "accent.500" : "border.default"}
      display="flex"
      rounded="xl"
      px={3}
      py={1.5}
      alignItems="center"
      gap={1.5}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: isSelectedUser ? "accent.600" : "brand.300",
        bg: isSelectedUser ? "accent.200" : "bg.elevated",
      }}
      role="button"
    >
      {isSelectedUser && (
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg="accent.500"
          flexShrink={0}
        />
      )}
      <Text
        fontSize="sm"
        fontWeight={isSelectedUser ? 600 : 400}
        color={isSelectedUser ? "accent.800" : "text.primary"}
      >
        {user.name}
      </Text>
      <Tooltip
        content={"Confirm delete"}
        disabled={!isClicked}
        showArrow
        positioning={{ placement: "top" }}
      >
        <IconButton
          aria-label={`Remove ${user.name}`}
          size="xs"
          variant="ghost"
          onClick={handleDelete}
          opacity={isClicked ? 1 : 0}
          _groupHover={{ opacity: 1 }}
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
  );
};

export default UserItem;
