"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Editable,
  EditableValueChangeDetails,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import { useFoods } from "@/hooks/useFoods";
import { useRealtimeData } from "@/lib/firebase/firestore/brains";
import { handleEnterKeyPress } from "@/utils/misc";
import { ISetPrevRoomProps } from "@/components/SetPreviousRooms";
import { FoodList } from "@/components/FoodList";
import { UserList } from "@/components/UserList";
import { IdentityGate } from "@/components/IdentityGate";
import { IdentityBar } from "@/components/IdentityBar";
import { IRoomObj } from "@/types";
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
    currUser,
    identityResolved,
    selectIdentity,
    createAndSelectIdentity,
    switchIdentity,
    removeUser,
    addUser,
  } = useUsers({ data, addData, roomId });

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

  // Show identity gate if data loaded but identity not yet resolved
  const showIdentityGate = !loadingRoom && data && !identityResolved;

  return (
    <main>
      <SetPrevRooms
        ready={!!data}
        roomId={roomId}
        roomName={data?.name || ""}
      />

      {showIdentityGate && (
        <IdentityGate
          users={data?.users || []}
          onSelectExisting={selectIdentity}
          onCreateNew={createAndSelectIdentity}
        />
      )}

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
            {/* Identity Bar */}
            {currUser && identityResolved && (
              <IdentityBar user={currUser} onSwitch={switchIdentity} />
            )}

            {/* Room Header */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
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
                    py={1}
                    px={2}
                  />
                  <Editable.Input
                    fontFamily="var(--font-fraunces), Georgia, serif"
                  />
                  <Editable.Control />
                </Editable.Root>
              )}
              <button
                className="btn btn-outline btn-xs"
                onClick={handleShare}
              >
                <LuShare2 />
                Share Link
              </button>
            </div>

            {/* Guests Section */}
            <SectionCard>
              <SectionHeader emoji="👥" title="Guests" />

              {data?.users?.length ? (
                <div style={{ marginBottom: "16px" }}>
                  <UserList
                    data={data}
                    claimUser={() => {}}
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
