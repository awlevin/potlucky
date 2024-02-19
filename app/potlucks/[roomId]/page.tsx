"use client";
import { modifyItemById } from "@/utils/modifyItemById";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Container,
  Button,
  Heading,
  List,
  ListItem,
  Input,
  InputGroup,
  InputRightElement,
  Editable,
  EditablePreview,
  EditableInput,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { ISetPrevRoomProps } from "@/components/SetPreviousRooms";
import { useRealtimeData } from "@/firebase/firestore/brains";
import { handleEnterKeyPress } from "@/utils/misc";
import { EditableControls } from "@/utils/EditableControls";
const SetPrevRooms = dynamic<ISetPrevRoomProps>(
  () =>
  import("@/components/SetPreviousRooms").then(
      // this feels jank but it made typescript stop complaining
      (mod) => mod.default as React.ComponentType<ISetPrevRoomProps>
    ),
  {
    ssr: false,
  }
);

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

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const {
    data,
    loading: loadingRoom,
    updateData: addData,
  } = useRealtimeData<IRoomObj>("rooms", roomId);

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
    setFoodInput("");
    await addData({
      ...data,
      foods: [
        ...(data?.foods || []),
        { id: nanoid(5), title: foodInput } as Food,
      ],
    });
  };

  const addUser = async () => {
    setUserInput("");
    await addData({
      ...data,
      users: [
        ...(data?.users || []),
        { id: nanoid(5), name: userInput } as User,
      ],
    });
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

    addData({
      ...data,
      foods: newFoods,
    });
  };

  const changeRoomName = (newName: string) => {
    addData({
      name: newName
    })
  }

  return (
    <main>
      <SetPrevRooms
        ready={!!data}
        roomId={roomId}
        roomName={data?.name || ""}
      />
      <Container
        display="flex"
        flexDirection="column"
        alignItems="center"
        maxWidth="lg"
      >
        {data && (
          <Editable
            defaultValue={data?.name || data?.id}
            textAlign={"center"}
            as="h1"
            fontWeight="bold"
            fontSize="x-large"
            onSubmit={changeRoomName}
          >
            {(props) => (
              <>
                <EditablePreview
                  _hover={{ color: "gray.500", cursor: "pointer" }}
                />
                <EditableInput />
                <EditableControls {...props} />
              </>
            )}
          </Editable>
        )}
        {loadingRoom ? (
          "loading..."
        ) : (
          <>
            people:
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
