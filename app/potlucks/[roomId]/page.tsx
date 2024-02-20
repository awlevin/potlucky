"use client";
import { modifyItemById } from "@/utils/modifyItemById";
import { nanoid } from "nanoid";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Container,
  Button,
  List,
  ListItem,
  Input,
  InputGroup,
  InputRightElement,
  Editable,
  EditablePreview,
  EditableInput,
  Spinner,
  Text,
  useToast,
  IconButton,
  Collapse,
} from "@chakra-ui/react";
import { DeleteIcon, CheckIcon } from "@chakra-ui/icons"
import dynamic from "next/dynamic";
import { ISetPrevRoomProps } from "@/components/SetPreviousRooms";
import { WithId, useRealtimeData } from "@/firebase/firestore/brains";
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
  const [hasClaimedUserBefore, setHasClaimedUserBefore] = useState(false);
  const toast = useToast();

  const [currUser, setCurrUser] = useState<IRoomObj["users"][0]>();
  const claimUser = (id: string) => {
    setHasClaimedUserBefore(true);
    if (currUser?.id === id) {
      setCurrUser(undefined);
    } else {
      const foundUser = data?.users?.find((u) => u.id === id);
      setCurrUser(foundUser);
    }
  };

  const removeUser = (id: string) => {
    if (currUser?.id === id) {
      setCurrUser(undefined);
    }
    addData({
      ...data,
      users: data?.users?.filter((u) => u.id !== id),
      foods: data?.foods?.map((food) => {
        if (food.claimedBy === id) {
          return { ...food, claimedBy: null };
        }
        return food;
      }),
    });
  }

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
      toast({
        description: "Pick a user first you silly little goofball",
        status: "error",
        isClosable: true,
      })
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
          <>
            <Spinner mb={2} />
            <Text>loading...</Text>
          </>
        ) : (
          <>
            {
              <Collapse in={!hasClaimedUserBefore}>
                <Text fontWeight="light" fontSize="xs" mb={1}>
                  click a user to get started
                </Text>
              </Collapse>
            }
            <UserList
              data={data}
              claimUser={claimUser}
              currUser={currUser}
              removeUser={removeUser}
            />
            <InputGroup size="sm" maxWidth={"xs"} mb={6}>
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
          </>
        )}
      </Container>
    </main>
  );
}

const UserList = ({
  data,
  claimUser,
  currUser,
  removeUser,
}: {
  data: WithId<IRoomObj> | null;
  claimUser: (id: string) => void;
  currUser: User | undefined;
  removeUser: (id: string) => void;
}) => {
  return (
    <List display="flex" flexDirection="row" alignItems="center" mb={2} maxWidth={"md"} flexWrap={"wrap"} justifyContent={"space-around"}>
      {Boolean(data?.users?.length) &&
        data?.users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            claimUser={claimUser}
            isSelectedUser={currUser?.id === user.id}
            removeUser={removeUser}
          />
        ))}
    </List>
  );
};

const UserItem = ({
  user,
  claimUser,
  removeUser,
  isSelectedUser
}: {
  user: User;
  claimUser: (id: string) => void;
  removeUser: (id: string) => void;
  isSelectedUser: boolean,
}) => {

  const [isClicked, setIsClicked] = useState(false);
  useEffect(() => {
    if (isClicked) {
      setTimeout(() => {
        setIsClicked(false);
      }, 2000)
    }
  }, [isClicked])

  const handleDelete = () => {
    if (!isClicked) {
      setIsClicked(true);
      toast({
        title: `click again to remove ${user.name}`,
        description: `they'll prob take it personally`,
        status: "warning",
        position: "top-right"
      })
    } else {
      removeUser(user.id);
    }
  }
  const toast = useToast();

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
      <IconButton
        aria-label={`remove ${user.name}`}
        size="xs"
        variant="text"
        onClick={handleDelete}
        _hover={{ backgroundColor: "red.100" }}
      >
        {isClicked ? <CheckIcon /> : <DeleteIcon />}
      </IconButton>
    </ListItem>
  );
};
