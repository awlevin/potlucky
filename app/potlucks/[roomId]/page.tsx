"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Food } from "@/types";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import { useFoods } from "@/hooks/useFoods";
import { useRealtimeData } from "@/lib/firebase/firestore/brains";
import { handleEnterKeyPress } from "@/utils/misc";
import { ISetPrevRoomProps } from "@/components/SetPreviousRooms";
import { FoodList } from "@/components/FoodList";
import { UserList } from "@/components/UserList";
import { ProgressBar } from "@/components/ProgressBar";
import { IdentityGate } from "@/components/IdentityGate";
import { IdentityBar } from "@/components/IdentityBar";
import { EventHeader } from "@/components/EventHeader";
import { SummaryPanel } from "@/components/SummaryPanel";
import { DishSuggestion } from "@/components/DishSuggestion";
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
  const [selectedCategory, setSelectedCategory] = useState<Food["type"]>("main");
  const [noteInput, setNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

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
    addFoodDirect,
    removeFood,
    claimFood,
  } = useFoods({
    data,
    addData,
    currUser,
    hasClaimedFoodBefore,
    setHasClaimedFoodBefore,
  });

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

            {/* Event Header */}
            {data && (
              <EventHeader data={data} addData={addData} />
            )}

            {/* Summary Panel */}
            {data && (
              <SummaryPanel
                foods={data.foods || []}
                users={data.users || []}
                currUser={currUser}
                roomName={data.name || ""}
              />
            )}

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

              <ProgressBar foods={data?.foods || []} />

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

              <DishSuggestion
                foods={data?.foods || []}
                onAdd={(title, category) => addFoodDirect(title, category)}
              />

              <div className="category-selector">
                {(
                  [
                    { key: "appetizer", label: "Appetizer" },
                    { key: "main", label: "Main" },
                    { key: "side", label: "Side" },
                    { key: "dessert", label: "Dessert" },
                    { key: "drink", label: "Drink" },
                  ] as { key: Food["type"]; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    className={`category-pill ${selectedCategory === key ? "category-pill-selected" : ""}`}
                    onClick={() => setSelectedCategory(key)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
                <button
                  className="note-toggle"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  type="button"
                  title="Add a note"
                >
                  📝
                </button>
              </div>
              <div className="input-row">
                <input
                  className="input"
                  placeholder="Add a dish..."
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  onKeyDown={handleEnterKeyPress(() => {
                    addFood(selectedCategory, noteInput || undefined);
                    setNoteInput("");
                  })}
                />
                <button
                  className="btn"
                  onClick={() => {
                    addFood(selectedCategory, noteInput || undefined);
                    setNoteInput("");
                  }}
                  disabled={!foodInput}
                >
                  Add
                </button>
              </div>
              {showNoteInput && (
                <input
                  className="input note-input"
                  placeholder="Add a note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={handleEnterKeyPress(() => {
                    if (foodInput) {
                      addFood(selectedCategory, noteInput || undefined);
                      setNoteInput("");
                    }
                  })}
                />
              )}
            </SectionCard>
          </>
        )}
      </div>
    </main>
  );
}
