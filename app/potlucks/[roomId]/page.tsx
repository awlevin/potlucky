"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Container,
  Button,
  Input,
  Box,
  Flex,
  Text,
  Heading,
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
import { Skeleton } from "@/components/ui/skeleton";
import { toaster } from "@/components/ui/toaster";
import { LuShare2 } from "react-icons/lu";

const SetPrevRooms = dynamic<ISetPrevRoomProps>(
  () =>
    import("@/components/SetPreviousRooms").then(
      (mod) => mod.default as React.ComponentType<ISetPrevRoomProps>
    ),
  {
    ssr: false,
  }
);

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      bg="bg.surface"
      rounded="2xl"
      border="1px solid"
      borderColor="border.default"
      p={6}
    >
      {children}
    </Box>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <Heading
      as="h3"
      size="sm"
      fontFamily="var(--font-fraunces), serif"
      fontWeight={500}
      mb={4}
      display="flex"
      alignItems="center"
      gap={2}
    >
      <Text fontSize="lg">{emoji}</Text>
      {title}
    </Heading>
  );
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const {
    data,
    loading: loadingRoom,
    updateData: addData,
  } = useRealtimeData<IRoomObj>("rooms", roomId);

  const [hasClaimedFoodBefore, setHasClaimedFoodBefore] = useState(false);

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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toaster.create({
        title: "Link copied!",
        description: "Share it with your friends.",
        type: "success",
      });
    } catch {
      toaster.create({
        title: "Couldn't copy link",
        description: url,
        type: "error",
      });
    }
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
        maxW="2xl"
        py={8}
        px={{ base: 4, md: 6 }}
        gap={6}
      >
        {loadingRoom ? (
          <Flex direction="column" gap={6}>
            <Skeleton height="40px" rounded="xl" width="60%" mx="auto" />
            <Skeleton height="200px" rounded="2xl" />
            <Skeleton height="200px" rounded="2xl" />
          </Flex>
        ) : (
          <>
            {/* Room Header */}
            <Flex direction="column" alignItems="center" gap={3}>
              {data && (
                <Editable.Root
                  defaultValue={data?.name || data?.id}
                  textAlign="center"
                  fontSize="2xl"
                  fontWeight="600"
                  onValueCommit={changeRoomName}
                >
                  <Editable.Preview
                    fontFamily="var(--font-fraunces), Georgia, serif"
                    _hover={{ color: "text.secondary", cursor: "pointer" }}
                    py={1}
                    px={2}
                  />
                  <Editable.Input
                    fontFamily="var(--font-fraunces), Georgia, serif"
                  />
                  <Editable.Control />
                </Editable.Root>
              )}
              <Button
                size="xs"
                variant="outline"
                onClick={handleShare}
              >
                <LuShare2 />
                Share Link
              </Button>
            </Flex>

            {/* Guests Section */}
            <SectionCard>
              <SectionHeader emoji="👥" title="Guests" />

              {!hasCompletedOnboardingBefore && (
                <>
                  <Collapsible.Root
                    open={!hasClaimedUserBefore && !data?.users.length}
                  >
                    <Text fontWeight="light" fontSize="xs" color="text.muted" mb={2}>
                      Add a friend to get started!
                    </Text>
                  </Collapsible.Root>
                  <Collapsible.Root
                    open={!hasClaimedUserBefore && Boolean(data?.users.length)}
                  >
                    <Text fontWeight="light" fontSize="xs" color="text.muted" mb={2}>
                      Now tap them to continue.
                    </Text>
                  </Collapsible.Root>
                </>
              )}

              {data?.users?.length ? (
                <Box mb={4}>
                  <UserList
                    data={data}
                    claimUser={claimUser}
                    currUser={currUser}
                    removeUser={removeUser}
                  />
                </Box>
              ) : (
                <Box
                  textAlign="center"
                  py={8}
                  mb={4}
                  border="2px dashed"
                  borderColor="border.default"
                  rounded="xl"
                >
                  <Text color="text.muted" fontSize="sm">
                    No guests yet. Add someone below!
                  </Text>
                </Box>
              )}

              <Flex gap={2}>
                <Input
                  flex="1"
                  placeholder="Add a guest..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleEnterKeyPress(addUser)}
                />
                <Button
                  onClick={addUser}
                  size="md"
                  disabled={!userInput}
                  flexShrink={0}
                >
                  Add
                </Button>
              </Flex>
            </SectionCard>

            {/* Menu Section */}
            <SectionCard>
              <SectionHeader emoji="🍴" title="Menu" />

              {!hasCompletedOnboardingBefore && (
                <>
                  <Collapsible.Root
                    open={
                      hasClaimedUserBefore &&
                      !hasClaimedFoodBefore &&
                      Boolean(!data?.foods.length)
                    }
                  >
                    <Text fontWeight="light" fontSize="xs" color="text.muted" mb={2}>
                      Now add a food item, please.
                    </Text>
                  </Collapsible.Root>
                  <Collapsible.Root
                    open={
                      hasClaimedUserBefore &&
                      !hasClaimedFoodBefore &&
                      Boolean(data?.foods.length)
                    }
                  >
                    <Text fontWeight="light" fontSize="xs" color="text.muted" mb={2}>
                      Now tap the food to claim it!
                    </Text>
                  </Collapsible.Root>
                </>
              )}

              {data?.foods?.length ? (
                <Box mb={4}>
                  <FoodList
                    foods={data.foods}
                    claimFood={claimFood}
                    removeFood={removeFood}
                    users={data?.users}
                    currUser={currUser}
                  />
                </Box>
              ) : (
                <Box
                  textAlign="center"
                  py={8}
                  mb={4}
                  border="2px dashed"
                  borderColor="border.default"
                  rounded="xl"
                >
                  <Text color="text.muted" fontSize="sm">
                    No dishes yet. Add something delicious!
                  </Text>
                </Box>
              )}

              <Flex gap={2}>
                <Input
                  flex="1"
                  placeholder="Add a dish..."
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  onKeyDown={handleEnterKeyPress(addFood)}
                />
                <Button
                  onClick={addFood}
                  size="md"
                  disabled={!foodInput}
                  flexShrink={0}
                >
                  Add
                </Button>
              </Flex>
            </SectionCard>
          </>
        )}
      </Container>
    </main>
  );
}
