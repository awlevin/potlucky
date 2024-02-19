"use client";
import { useAddData } from "@/firebase/firestore/addData";
import { useSnapshot } from "@/firebase/firestore/onSnapshot";
import { modifyItemById } from "@/utils/modifyItemById";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
import {
  Container,
  Button,
  Heading,
  List,
  ListItem,
  Box,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
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

export function handleEnterKeyPress<T = Element>(f: () => void){
  return handleKeyPress<T>(f, "Enter")
}

function handleKeyPress<T = Element>(f: () => void, key: string){
  return (e: KeyboardEvent<T>) => {
      if(e.key === key){
          f()
      }
  }
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const { addData, loading: loadingNewFood } = useAddData();
  const { data, loading: loadingRoom } = useSnapshot<IRoomObj>(
    "rooms",
    roomId as string
  );

  const [_, setPrevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", []);
  useEffect(() => {
    if (!!data) {
      setPrevRooms((prevRooms) => {
        if (prevRooms.some((room) => room.id === roomId)) {
          return prevRooms;
        }
        return [...prevRooms, { id: roomId, name: data.name || data.id }];
      });
    }
  }, [data]);

  const [userInput, setUserInput] = useState("");
  const [foodInput, setFoodInput] = useState("");

  const [currUser, setCurrUser] = useState<IRoomObj["users"][0]>();
  const claimUser = (id: string) => {
    if (currUser?.id === id) {
      setCurrUser(undefined);
    } else {
      const foundUser = data?.users?.find((u) => u.id === id);
      setCurrUser(foundUser);
    }
  };

  const addFood = async () => {
    await addData("rooms", roomId as string, {
      ...data,
      foods: [
        ...(data?.foods || []),
        { id: nanoid(5), title: foodInput } as Food,
      ],
    });

    setFoodInput("");
  };
  const addUser = async () => {
    await addData("rooms", roomId as string, {
      ...data,
      users: [
        ...(data?.users || []),
        { id: nanoid(5), name: userInput } as User,
      ],
    });

    setUserInput("");
  };

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
  };

  console.log({ userInput, foodInput })

  return (
    <main>
      <Container
        display="flex"
        flexDirection="column"
        alignItems="center"
        maxWidth="lg"
      >
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
            <InputGroup size="sm" maxWidth={"xs"}>
              <Input
                placeholder="add user"
                pr="4.5rem"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleEnterKeyPress(addUser)}
              />
              <InputRightElement width="4.5rem">
                <Button onClick={addUser} h="1.75rem" size="xs" disabled={true}>
                  add user
                </Button>
              </InputRightElement>
            </InputGroup>
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
        <InputGroup size="sm" maxWidth={"xs"}>
          <Input
            placeholder="add food"
            pr="4.5rem"
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            onKeyDown={handleEnterKeyPress(addFood)}
          />
          <InputRightElement width="4.5rem">
            <Button
              onClick={addFood}
              h="1.75rem"
              size="xs"
              disabled={!foodInput}
            >
              add food
            </Button>
          </InputRightElement>
        </InputGroup>
      </Container>
    </main>
  );
}
