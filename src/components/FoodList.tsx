import { useEffect, useState } from "react";
import { List, Text, IconButton } from "@chakra-ui/react";
import { LuDelete, LuCheck } from "react-icons/lu";
import { Food, User } from "@/types";
import { Tooltip } from "@/components/ui/tooltip";

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
    <List.Root
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
          <FoodItemRow
            key={food.id}
            food={food}
            claimFood={claimFood}
            removeFood={removeFood}
            userClaimedBy={userClaimedBy}
            isForSelectedUser={isForSelectedUser}
          />
        );
      })}
    </List.Root>
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
    <List.Item
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
          _hover={{
            backgroundColor: isForSelectedUser ? "green.300" : "red.100",
          }}
        >
          {isClicked ? <LuCheck /> : <LuDelete />}
        </IconButton>
      </Tooltip>
    </List.Item>
  );
};
