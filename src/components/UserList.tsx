"use client"

import { Flex } from "@chakra-ui/react";
import { WithId } from "@/lib/firebase/firestore/brains";
import { IRoomObj, User } from "@/types";
import UserItem from "@/components/UserItem";
import { AnimatePresence, motion } from "framer-motion";

interface UserListProps {
  data: WithId<IRoomObj> | null;
  claimUser: (id: string) => void;
  currUser: User | undefined;
  removeUser: (id: string) => void;
}

export const UserList = ({
  data,
  claimUser,
  currUser,
  removeUser,
}: UserListProps) => {
  if (!data?.users?.length) return null;

  return (
    <Flex
      flexDirection="row"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <AnimatePresence>
        {data.users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <UserItem
              user={user}
              claimUser={claimUser}
              isSelectedUser={currUser?.id === user.id}
              removeUser={removeUser}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Flex>
  );
};
