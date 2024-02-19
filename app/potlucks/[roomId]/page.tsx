"use client";
import { useAddData } from "@/firebase/firestore/addData";
import { useSnapshot } from "@/firebase/firestore/onSnapshot";
import { modifyItemById } from "@/utils/modifyItemById";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Button, Heading, List, ListItem } from '@chakra-ui/react'
import { useLocalStorage } from "@uidotdev/usehooks";

type User = {
  id: string;
  name: string; // first and last
  dateJoined: Date; // date joined this room
  lastActive: Date; // last active in this room
  isActive: boolean;
  color: string;
};

type Food = {
  id: string;
  claimedBy?: string | null; // userId or not
  title: string;
  type?: "appetizer" | "entree" | "dessert";
  attributes?: (
    | "vegetarian"
    | "vegan"
    | "keto"
    | "pescatarian"
    | "dairy free"
  )[];
};

interface IRoomObj {
  id: string;
  name: string;
  users: User[];
  foods: Food[];
}

export interface IPrevRoom {
  name: string;
  id: string;
}

const TEST_FOODS: Food[] = [
  { id: "", title: "Salad", type: "appetizer" },
  { id: "", title: "Chicken wings", type: "entree" },
  { id: "", title: "Chocolate cake", type: "dessert" },
];
const getRandFood = () => ({
  ...TEST_FOODS[Math.floor(Math.random() * TEST_FOODS.length)],
  id: nanoid(5),
});

  const TEST_USERS: User[] = [
    {
      id: nanoid(5),
      name: "Aaron",
      color: "lightgray",
      lastActive: new Date(),
      isActive: false,
      dateJoined: new Date(),
    },
    {
      id: nanoid(5),
      name: "Matt",
      color: "lightgray",
      lastActive: new Date(),
      isActive: false,
      dateJoined: new Date(),
    },
    {
      id: nanoid(5),
      name: "James",
      color: "lightgray",
      lastActive: new Date(),
      isActive: false,
      dateJoined: new Date(),
    },
  ];
const getRandUser = () => ({
  ...TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)],
  id: nanoid(5), // do this dynamically
});

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const { addData, loading: loadingNewFood } = useAddData();
  const { data, loading: loadingRoom } = useSnapshot<IRoomObj>(
    "rooms",
    roomId as string
  );

  const [_, setPrevRooms] = useLocalStorage<IPrevRoom[]>(
    "prevRooms",
    []
  );
  useEffect(() => {
    if (!!data) {
      setPrevRooms((prevRooms) => {
        if (prevRooms.some(room => room.id === roomId)) {
          return prevRooms;
        }
        return [...prevRooms, {id: roomId, name: data.name || data.id}];
      });
    }
  }, [data])

  const [currUser, setCurrUser] = useState<IRoomObj["users"][0]>();
  const claimUser = (id: string) => {
    if (currUser?.id === id) {
      setCurrUser(undefined);
    } else {
      const foundUser = data?.users?.find(u => u.id === id);
      setCurrUser(foundUser);
    }
  };

  const addFood = () => {
    addData("rooms", roomId as string, {
      ...data,
      foods: [...(data?.foods || []), getRandFood()],
    });
  }
  const addUser = () => {
    addData("rooms", roomId as string, {
      ...data,
      users: [...(data?.users || []), getRandUser()],
    });
  }

  const claimFood = (id: string) => {
    if (!currUser) {
      console.error("Must claim a user to claim a food");
      return;
    }

    const newFoods = modifyItemById(data?.foods || [], id, (food) => {
      return {
        ...food,
        claimedBy: food.claimedBy === currUser.id ? null : currUser.id,
      };
    });

    addData("rooms", roomId as string, {
      ...data,
      foods: newFoods,
    });
  }

  return (
    <main>
      <Container display="flex" flexDirection="column" alignItems="center">
        <Heading>{data?.name || data?.id}</Heading>
        {loadingRoom ? (
          "loading..."
        ) : (
          <>
            users:
            <List>
              {Boolean(data?.users?.length) &&
                data?.users.map((user) => (
                  <ListItem
                    key={user.id}
                    onClick={() => claimUser(user.id)}
                    style={{
                      backgroundColor:
                        currUser?.id === user.id ? "green" : "inherit",
                    }}
                  >
                    {user.name}
                  </ListItem>
                ))}
            </List>
            <Button onClick={addUser} size="xs">
              add user
            </Button>
          </>
        )}
        {loadingRoom ? (
          "loading..."
        ) : (
          <>
            foods:
            <List>
              {Boolean(data?.foods?.length) &&
                data?.foods.map((food) => (
                  <ListItem key={food.id} onClick={() => claimFood(food.id)}>
                    {Boolean(food.claimedBy) ? "✅" : "❌"} {food.title}{" "}
                    {food.claimedBy &&
                      ` - ${
                        data?.users?.find((u) => u.id === food.claimedBy)?.name // TODO this is hacky and ugly
                      }`}
                  </ListItem>
                ))}
            </List>
          </>
        )}
        <Button onClick={addFood} size="xs">
          add food
        </Button>
      </Container>
    </main>
  );
}
