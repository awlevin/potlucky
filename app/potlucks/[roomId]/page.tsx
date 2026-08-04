"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Food } from "@/types";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import { useFoods } from "@/hooks/useFoods";
import { useRoom, useRoomWithLocation } from "@/hooks/useRoom";
import { useAuth } from "@/components/AuthProvider";
import { AuthPrompt } from "@/components/AuthPrompt";
import { publicRoomToLegacy } from "@/lib/data/legacy-shim";
import { applyPresetAction } from "./actions";
import { handleEnterKeyPress } from "@/utils/misc";
import { ISetPrevRoomProps } from "@/components/SetPreviousRooms";
import { FoodList } from "@/components/FoodList";
import { IdentityGate } from "@/components/IdentityGate";
import { EventHeader } from "@/components/EventHeader";
import { SummaryPanel } from "@/components/SummaryPanel";
import { DishSuggestion } from "@/components/DishSuggestion";
import { PresetPicker } from "@/components/PresetPicker";
import { RecipeWizard } from "@/components/RecipeWizard";
import { getHostUsers, formatHostsByline } from "@/utils/hosts";
import {
  PostEventUploadPrompt,
  type ClaimedDish,
} from "@/components/gallery/PostEventUploadPrompt";
import { featureFlags } from "@/lib/featureFlags";

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
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { room, loading: loadingRoom } = useRoom(roomId);
  // The location-bearing fetch only succeeds for members; for non-members
  // the public-view fetch (useRoom) already drives the UI.
  const { room: memberRoom } = useRoomWithLocation(roomId);
  const data = useMemo(() => {
    if (!room) return null;
    const legacy = publicRoomToLegacy(room);
    if (memberRoom?.location) legacy.location = memberRoom.location;
    return legacy;
  }, [room, memberRoom]);

  const [hasClaimedFoodBefore, setHasClaimedFoodBefore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Food["type"]>("main");
  const [selectedAttributes, setSelectedAttributes] = useState<NonNullable<Food["attributes"]>>([]);
  const [noteInput, setNoteInput] = useState("");

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
    updateDietary,
  } = useUsers({ data, roomId });

  const {
    foodInput,
    setFoodInput,
    addFood,
    addFoodDirect,
    removeFood,
    updateFood,
    claimFood,
  } = useFoods({
    data,
    currUser,
    roomId,
    hasClaimedFoodBefore,
    setHasClaimedFoodBefore,
  });

  // Show identity gate if data loaded but identity not yet resolved
  const showIdentityGate = !loadingRoom && data && !identityResolved;

  const hosts = getHostUsers(data?.users, data?.hostIds);
  const primaryHostName = hosts[0]?.name;
  const viewerIsHost = Boolean(
    currUser && hosts.some((h) => h.id === currUser.id)
  );
  const eventHasPassed = data?.date
    ? new Date(data.date).getTime() < Date.now()
    : false;
  const showFarewell = Boolean(eventHasPassed && hosts.length > 0);

  return (
    <main>
      <SetPrevRooms
        ready={!!data}
        roomId={roomId}
        roomName={data?.name || ""}
        hostName={
          data?.hostIds?.length && data?.users?.length
            ? data.users.find((u) => u.id === data.hostIds?.[0])?.name
            : undefined
        }
      />

      {showIdentityGate && !authLoading && (
        user ? (
          // Signed in but not yet a member — show the existing gate but
          // hide the legacy "I'm one of these people" picker (user always
          // joins as themselves; selecting another user would be
          // impersonation).
          <IdentityGate
            users={[]}
            hostIds={data?.hostIds}
            onSelectExisting={selectIdentity}
            onCreateNew={createAndSelectIdentity}
          />
        ) : (
          <div className="identity-overlay">
            <div className="card identity-card" style={{ textAlign: "center", padding: "32px 28px" }}>
              <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 600, fontSize: "1.5rem", marginBottom: "8px" }}>
                Sign in to join
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "20px", lineHeight: 1.5 }}>
                Drop your number to claim a dish, edit the menu, or see the address.
              </p>
              <AuthPrompt
                message=""
                next={`/potlucks/${roomId}`}
                linkLabel="sign in →"
              />
            </div>
          </div>
        )
      )}

      <div className="room-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

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
          </div>
        ) : (
          <>
            {showFarewell && (
              <div className="host-farewell">
                <span aria-hidden="true">✦</span>
                <span>
                  Thanks for hosting, {formatHostsByline(hosts)}. 🍲
                </span>
              </div>
            )}

            {/* Event Header — identity + event details + guests consolidated */}
            {data && (
              <EventHeader
                data={data}
                currUser={currUser}
                identityResolved={identityResolved}
                onSwitch={switchIdentity}
                onUpdateDietary={updateDietary}
                removeUser={removeUser}
                userInput={userInput}
                setUserInput={setUserInput}
                addUser={addUser}
              />
            )}

            {/* Menu Section */}
            <SectionCard>
              <SectionHeader emoji="🍴" title="Menu" />

              {data?.foods?.length ? (
                <div style={{ marginBottom: "16px" }}>
                  <FoodList
                    foods={data.foods}
                    claimFood={claimFood}
                    removeFood={removeFood}
                    updateFood={updateFood}
                    users={data?.users}
                    currUser={currUser}
                  />
                </div>
              ) : (
                <PresetPicker
                  onApply={(foods, name, date) => {
                    const presetFoods = foods.map((f) => ({
                      title: f.title,
                      type: f.type ?? null,
                      notes: f.notes ?? null,
                      attributes: f.attributes ?? [],
                    }));
                    applyPresetAction(roomId, {
                      foods: presetFoods,
                      ...(name && !data?.name ? { name } : {}),
                      ...(date && !data?.date ? { date } : {}),
                    }).catch((err) => console.error("[applyPreset]", err));
                  }}
                  hostName={primaryHostName}
                  viewerIsHost={viewerIsHost}
                />
              )}

              <DishSuggestion
                foods={data?.foods || []}
                onAdd={(title, category) => addFoodDirect(title, category)}
              />

              <div className="input-row">
                <input
                  className="input"
                  placeholder="Add a dish..."
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  onKeyDown={handleEnterKeyPress(() => {
                    addFood(selectedCategory, selectedAttributes, noteInput || undefined);
                    setNoteInput("");
                  })}
                />
                <button
                  className="btn"
                  onClick={() => {
                    addFood(selectedCategory, selectedAttributes, noteInput || undefined);
                    setNoteInput("");
                  }}
                  disabled={!foodInput}
                >
                  Add
                </button>
              </div>
              {foodInput && (
                <div className="add-dish-options">
                  <div className="add-dish-row">
                    <span className="add-dish-label">Category</span>
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
                    </div>
                  </div>
                  <div className="add-dish-row">
                    <span className="add-dish-label">Tags</span>
                    <div className="dietary-tags">
                      {(
                        [
                          { key: "vegetarian", label: "🌱 Veg" },
                          { key: "vegan", label: "🌿 Vegan" },
                          { key: "gluten-free", label: "GF" },
                          { key: "nut-free", label: "🥜✕" },
                          { key: "dairy-free", label: "🥛✕" },
                        ] as { key: NonNullable<Food["attributes"]>[number]; label: string }[]
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          className={`dietary-tag ${selectedAttributes.includes(key) ? "dietary-tag-selected" : ""}`}
                          onClick={() =>
                            setSelectedAttributes((prev) =>
                              prev.includes(key)
                                ? prev.filter((a) => a !== key)
                                : [...prev, key]
                            )
                          }
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="add-dish-row">
                    <span className="add-dish-label">Note</span>
                    <input
                      className="input note-input"
                      placeholder="e.g., Homemade, serves 8"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      onKeyDown={handleEnterKeyPress(() => {
                        if (foodInput) {
                          addFood(selectedCategory, selectedAttributes, noteInput || undefined);
                          setNoteInput("");
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Recipe Wizard */}
            {data && currUser && (() => {
              const myDishes = (data.foods || []).filter((f) => {
                const claimers = Array.isArray(f.claimedBy)
                  ? f.claimedBy
                  : f.claimedBy
                    ? [f.claimedBy]
                    : [];
                return claimers.includes(currUser.id);
              });
              return myDishes.length > 0 ? (
                <RecipeWizard
                  myDishes={myDishes}
                  users={data.users || []}
                  currUser={currUser}
                  roomId={roomId}
                />
              ) : null;
            })()}

            {/* Post-event photo upload prompt. Shown once the event has
                passed, or on demand via ?post=1 for preview / dogfooding. */}
            {(() => {
              if (!featureFlags.dishGallery) return null;
              if (!data || !currUser) return null;
              const forcePreview = searchParams?.get("post") === "1";
              const hasPassed = data.date
                ? new Date(data.date).getTime() < Date.now()
                : false;
              if (!forcePreview && !hasPassed) return null;

              const claimed: ClaimedDish[] = (data.foods || [])
                .filter((f) => {
                  const cs = Array.isArray(f.claimedBy)
                    ? f.claimedBy
                    : f.claimedBy
                      ? [f.claimedBy]
                      : [];
                  return cs.includes(currUser.id);
                })
                .map((f) => ({ id: f.id, title: f.title }));

              if (claimed.length === 0) return null;

              return (
                <PostEventUploadPrompt
                  potluckName={data.name || "this potluck"}
                  eventDate={data.date ?? new Date().toISOString()}
                  claimedDishes={claimed}
                  userName={currUser.name}
                />
              );
            })()}

            {/* Summary Panel — after menu */}
            {data && (
              <SummaryPanel
                foods={data.foods || []}
                users={data.users || []}
                currUser={currUser}
                roomName={data.name || ""}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

