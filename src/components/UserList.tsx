import { Box, Collapsible, List } from "@chakra-ui/react";
import { WithId } from "@/lib/firebase/firestore/brains";
import { IRoomObj, User } from "@/types";
import UserItem from "@/components/UserItem";

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
  return (
    <Collapsible.Root open={Boolean(data?.users?.length)}>
      <Box
        as="ul"
        display="flex"
        flexDirection="row"
        alignItems="center"
        mb={2}
        maxWidth={"md"}
        flexWrap={"wrap"}
        justifyContent={"space-around"}
      >
        <List.Root>
          {data?.users.map((user) => (
            // <ScaleFade key={user.id} in={!!user} unmountOnExit>
            <UserItem
              key={user.id}
              user={user}
              claimUser={claimUser}
              isSelectedUser={currUser?.id === user.id}
              removeUser={removeUser}
            />
            // </ScaleFade>
          ))}
        </List.Root>
      </Box>
    </Collapsible.Root>
  );
};
