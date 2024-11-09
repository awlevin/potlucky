"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Container,
  Button,
  Input,
  // Spinner,
  Text,
  Collapsible,
  Editable,
  EditableValueChangeDetails,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import { useFoods } from "@/hooks/useFoods";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useRealtimeData } from "@/lib/firebase/firestore/brains";
import { handleEnterKeyPress } from "@/utils/misc";
import { ISetPrevRoomProps } from "@/components/SetPreviousRooms";
import { FoodList } from "@/components/FoodList";
import { UserList } from "@/components/UserList";
import { IRoomObj } from "@/types";

const SetPrevRooms = dynamic<ISetPrevRoomProps>(
  () =>
    import("@/components/SetPreviousRooms").then(
      (mod) => mod.default as React.ComponentType<ISetPrevRoomProps>
    ),
  {
    ssr: false,
  }
);

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const {
    data,
    loading: loadingRoom,
    updateData: addData,
  } = useRealtimeData<IRoomObj>("rooms", roomId);

  // State to track if user has claimed food before
  const [hasClaimedFoodBefore, setHasClaimedFoodBefore] = useState(false);

  // Using custom hooks
  const {
    userInput,
    setUserInput,
    hasClaimedUserBefore,
    currUser,
    claimUser,
    removeUser,
    addUser,
  } = useUsers({ data, addData });

  const {
    foodInput,
    setFoodInput,
    addFood,
    removeFood,
    claimFood,
  } = useFoods({
    data,
    addData,
    currUser,
    hasClaimedFoodBefore,
    setHasClaimedFoodBefore,
  });

  const {
    hasCompletedOnboardingBefore,
    isOnboardingComplete,
  } = useOnboarding({ hasClaimedUserBefore, hasClaimedFoodBefore });

  const changeRoomName = (data: EditableValueChangeDetails) => {
    addData({
      name: data.value,
    });
  };

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
          <Editable.Root
            defaultValue={data?.name || data?.id}
            textAlign={"center"}
            as="h1"
            fontWeight="bold"
            fontSize="x-large"
            onValueCommit={changeRoomName}
          >
            <Editable.Preview
              _hover={{ color: "gray.500", cursor: "pointer" }}
            />
            <Editable.Input />
            <Editable.Control />
          </Editable.Root>
        )}
        {loadingRoom ? (
          <>
            {/* <Spinner mb={2} /> */}
            <Text>Loading...</Text>
          </>
        ) : (
          <>
            {!hasCompletedOnboardingBefore && (
              <>
                <Collapsible.Root
                  open={!hasClaimedUserBefore && !data?.users.length}
                  // transition={{ exit: { delay: 0.5 } }}
                >
                  <Text fontWeight="light" fontSize="xs" mb={1}>
                    Add a friend to get started!
                  </Text>
                </Collapsible.Root>
                <Collapsible.Root
                  open={!hasClaimedUserBefore && Boolean(data?.users.length)}
                  // transition={{ enter: { delay: 0.5 } }}
                >
                  <Text fontWeight="light" fontSize="xs" mb={1}>
                    Now tap them to continue.
                  </Text>
                </Collapsible.Root>
              </>
            )}
            <UserList
              data={data}
              claimUser={claimUser}
              currUser={currUser}
              removeUser={removeUser}
            />
            {/* <InputGroup size="sm" maxWidth={"xs"} mb={6}> */}
              <Input
                placeholder="Add friends here 🫂"
                pr="4.5rem"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleEnterKeyPress(addUser)}
              />
              {/* <InputRightElement width="6.5rem"> */}
                <Button
                  onClick={addUser}
                  h="1.75rem"
                  size="xs"
                  disabled={!userInput}
                >
                  Add Friend
                </Button>
              {/* </InputRightElement> */}
            {/* </InputGroup> */}
            Foods:
            <Collapsible.Root
              open={
                hasClaimedUserBefore &&
                !hasClaimedFoodBefore &&
                Boolean(!data?.foods.length) &&
                !hasCompletedOnboardingBefore
              }
              // transition={{ enter: { delay: 0.5 }, exit: { delay: 0.5 } }}
            >
              <Text fontWeight="light" fontSize="xs" mb={1}>
                Now add a food item, please.
              </Text>
            </Collapsible.Root>
            <Collapsible.Root
              open={
                hasClaimedUserBefore &&
                !hasClaimedFoodBefore &&
                Boolean(data?.foods.length) &&
                !hasCompletedOnboardingBefore
              }
              // transition={{ enter: { delay: 0.5 } }}
            >
              <Text fontWeight="light" fontSize="xs" mb={1}>
                Now tap the food to claim it!
              </Text>
            </Collapsible.Root>
            <Collapsible.Root
              open={Boolean(data?.foods?.length)}
              // transition={{ enter: { delay: 0.5 } }}
            >
              <FoodList
                foods={data?.foods || []}
                claimFood={claimFood}
                removeFood={removeFood}
                users={data?.users}
                currUser={currUser}
              />
            </Collapsible.Root>
            {/* <InputGroup size="sm" maxWidth={"xs"}> */}
              <Input
                placeholder="Add food here 😋"
                pr="4.5rem"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                onKeyDown={handleEnterKeyPress(addFood)}
              />
              {/* <InputRightElement width="6.5rem"> */}
                <Button
                  onClick={addFood}
                  h="1.75rem"
                  size="xs"
                  disabled={!foodInput}
                >
                  Add Food
                </Button>
              {/* </InputRightElement> */}
            {/* </InputGroup> */}
          </>
        )}
      </Container>
    </main>
  );
}