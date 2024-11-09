import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  Text,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { ScaleFade } from "@chakra-ui/react";
import { Food, User } from "@/types";

interface FoodItemProps {
  foods: Food[];
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  users: User[] | undefined;
  currUser: User | undefined;
}

export const FoodItem = ({
  foods,
  claimFood,
  removeFood,
  users,
  currUser
}: FoodItemProps) => {
  return (
    <List
      display="flex"
      flexDirection="row"
      alignItems="center"
      mb={2}
      maxWidth={"md"}
      flexWrap={"wrap"}
      justifyContent={"space-around"}
    >
      {foods.map((food) => {
        const userClaimedBy = users?.find((u) => u.id === food.claimedBy);
        const isForSelectedUser =
          Boolean(food.claimedBy && food.claimedBy === currUser?.id);

        return (
          <ScaleFade key={food.id} in={!!food} unmountOnExit>
            <FoodItemRow
              food={food}
              claimFood={claimFood}
              removeFood={removeFood}
              userClaimedBy={userClaimedBy}
              isForSelectedUser={isForSelectedUser}
            />
          </ScaleFade>
        );
      })}
    </List>
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

  return (
    <ListItem
      key={food.id}
      onClick={() => claimFood(food.id)}
      backgroundColor={isForSelectedUser ? "green.100" : "gray.100"}
      display="flex"
      mr={5}
      rounded={20}
      px={2}
      py={1}
      alignItems="center"
      _hover={{
        backgroundColor: isForSelectedUser ? "green.200" : "gray.200",
      }}
      role={"button"}
      mt={2}
    >
      <Text fontSize="small">
        {food.title}
        {userClaimedBy ? ` - ${userClaimedBy.name}` : ""}
      </Text>
      <Tooltip
        label={"Confirm delete"}
        isDisabled={!isClicked}
        hasArrow
        placement="top"
      >
        <IconButton
          aria-label={`Remove ${food.title}`}
          size="xs"
          variant="text"
          onClick={handleDelete}
          _hover={{
            backgroundColor: isForSelectedUser ? "green.300" : "red.100",
          }}
          icon={isClicked ? <CheckIcon /> : <DeleteIcon />}
        />
      </Tooltip>
    </ListItem>
  );
};
