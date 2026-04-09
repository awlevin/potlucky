"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Collapsible,
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
import { EventHeader } from "@/components/EventHeader";
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

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h3 className="section-label">
      <span style={{ fontSize: "1.125rem" }}>{emoji}</span>
      {title}
    </h3>
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

  return (
    <main>
      <SetPrevRooms
        ready={!!data}
        roomId={roomId}
        roomName={data?.name || ""}
      />
      <div className="room-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {loadingRoom ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                height: "40px",
                borderRadius: "var(--radius)",
                background: "var(--color-border-subtle)",
                width: "60%",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                height: "200px",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-border-subtle)",
              }}
            />
            <div
              style={{
                height: "200px",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-border-subtle)",
              }}
            />
          </div>
        ) : (
          <>
            {/* Event Header */}
            {data && (
              <EventHeader data={data} addData={addData} />
            )}

            {/* Guests Section */}
            <SectionCard>
              <SectionHeader emoji="👥" title="Guests" />

              {!hasCompletedOnboardingBefore && (
                <>
                  <Collapsible.Root
                    open={!hasClaimedUserBefore && !data?.users.length}
                  >
                    <p style={{ fontWeight: 300, fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                      Add a friend to get started!
                    </p>
                  </Collapsible.Root>
                  <Collapsible.Root
                    open={!hasClaimedUserBefore && Boolean(data?.users.length)}
                  >
                    <p style={{ fontWeight: 300, fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                      Now tap them to continue.
                    </p>
                  </Collapsible.Root>
                </>
              )}

              {data?.users?.length ? (
                <div style={{ marginBottom: "16px" }}>
                  <UserList
                    data={data}
                    claimUser={claimUser}
                    currUser={currUser}
                    removeUser={removeUser}
                  />
                </div>
              ) : (
                <div className="empty-state">
                  No guests yet. Add someone below!
                </div>
              )}

              <div className="input-row">
                <input
                  className="input"
                  placeholder="Add a guest..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleEnterKeyPress(addUser)}
                />
                <button
                  className="btn"
                  onClick={addUser}
                  disabled={!userInput}
                >
                  Add
                </button>
              </div>
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
                    <p style={{ fontWeight: 300, fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                      Now add a food item, please.
                    </p>
                  </Collapsible.Root>
                  <Collapsible.Root
                    open={
                      hasClaimedUserBefore &&
                      !hasClaimedFoodBefore &&
                      Boolean(data?.foods.length)
                    }
                  >
                    <p style={{ fontWeight: 300, fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                      Now tap the food to claim it!
                    </p>
                  </Collapsible.Root>
                </>
              )}

              {data?.foods?.length ? (
                <div style={{ marginBottom: "16px" }}>
                  <FoodList
                    foods={data.foods}
                    claimFood={claimFood}
                    removeFood={removeFood}
                    users={data?.users}
                    currUser={currUser}
                  />
                </div>
              ) : (
                <div className="empty-state">
                  No dishes yet. Add something delicious!
                </div>
              )}

              <div className="input-row">
                <input
                  className="input"
                  placeholder="Add a dish..."
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  onKeyDown={handleEnterKeyPress(addFood)}
                />
                <button
                  className="btn"
                  onClick={addFood}
                  disabled={!foodInput}
                >
                  Add
                </button>
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </main>
  );
}
