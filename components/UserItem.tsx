import { useEffect, useState } from "react";
import {
  ListItem,
  Text,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { User } from "@/types";

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
    <ListItem
      key={user.id}
      onClick={() => claimUser(user.id)}
      backgroundColor={isSelectedUser ? "green.100" : "gray.100"}
      display="flex"
      mr={5}
      rounded={20}
      px={2}
      py={1}
      alignItems="center"
      _hover={{ backgroundColor: isSelectedUser ? "green.200" : "gray.200" }}
      role={"button"}
      mt={2}
    >
      <Text fontSize="small">{user.name}</Text>
      <Tooltip
        label={"Confirm delete"}
        isDisabled={!isClicked}
        hasArrow
        placement="top"
      >
        <IconButton
          aria-label={`Remove ${user.name}`}
          size="xs"
          variant="text"
          onClick={handleDelete}
          _hover={{
            backgroundColor: isSelectedUser ? "green.300" : "red.100",
          }}
          icon={isClicked ? <CheckIcon /> : <DeleteIcon />}
        />
      </Tooltip>
    </ListItem>
  );
};

export default UserItem; 