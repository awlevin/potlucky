"use client";
import { useEffect, useRef, useState } from "react";
import {
  Editable,
  EditableValueChangeDetails,
} from "@chakra-ui/react";
import { LuShare2, LuCheck, LuX } from "react-icons/lu";
import { QRCodeSVG } from "qrcode.react";
import { IRoomObj, User, DietaryRestriction } from "@/types";
import { toaster } from "@/components/ui/toaster";
import { updateRoomMetadataAction } from "../../app/potlucks/[roomId]/actions";
import { DietaryBadges } from "@/components/IdentityGate";
import { DatePicker } from "@/components/ui/DatePicker";
import { UserList } from "@/components/UserList";
import { handleEnterKeyPress } from "@/utils/misc";
import { AnimatePresence, motion } from "framer-motion";
import {
  getHostUsers,
  formatHostsByline,
  formatHostsPossessive,
} from "@/utils/hosts";

const DIETARY_OPTIONS: { key: DietaryRestriction; label: string; emoji: string }[] = [
  { key: "vegetarian", label: "Vegetarian", emoji: "🌱" },
  { key: "vegan", label: "Vegan", emoji: "🌿" },
  { key: "gluten-free", label: "Gluten-free", emoji: "GF" },
  { key: "nut-free", label: "Nut-free", emoji: "🥜✕" },
  { key: "dairy-free", label: "Dairy-free", emoji: "🥛✕" },
];

interface EventHeaderProps {
  data: IRoomObj;
  currUser?: User;
  identityResolved?: boolean;
  onSwitch?: () => void;
  onUpdateDietary?: (restrictions: DietaryRestriction[], note?: string) => void;
  removeUser?: (id: string) => void;
  userInput?: string;
  setUserInput?: (v: string) => void;
  addUser?: () => void;
  refetch?: () => Promise<void>;
}

export function EventHeader({
  data,
  currUser,
  identityResolved,
  onSwitch,
  onUpdateDietary,
  removeUser,
  userInput = "",
  setUserInput,
  addUser,
  refetch,
}: EventHeaderProps) {
  const updateMeta = async (patch: { name?: string; date?: string; location?: string }) => {
    try {
      await updateRoomMetadataAction(data.id, patch);
      await refetch?.();
    } catch (err) {
      toaster.create({
        title: "Couldn't save",
        description: err instanceof Error ? err.message : "Try signing in.",
        type: "error",
      });
    }
  };
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState(data.location || "");
  const [editingDiet, setEditingDiet] = useState(false);
  const [selectedRestrictions, setSelectedRestrictions] = useState<DietaryRestriction[]>(
    currUser?.dietaryRestrictions || []
  );
  const [dietNoteInput, setDietNoteInput] = useState(currUser?.dietaryNote || "");
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const guestInputRef = useRef<HTMLInputElement>(null);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const hosts = getHostUsers(data.users, data.hostIds);
  const hostsByline = formatHostsByline(hosts);
  const hostsPossessive = formatHostsPossessive(hosts);
  const viewerIsHost = Boolean(currUser && hosts.some((h) => h.id === currUser.id));
  const soloHostIsViewer = viewerIsHost && hosts.length === 1;

  const handleNativeShare = async () => {
    const title = data.name
      ? data.name
      : hostsByline
        ? `${hostsPossessive} potluck`
        : "Potluck";
    const text = viewerIsHost
      ? "You're throwing a potluck — share the link with your guests."
      : hostsByline
        ? `${hostsByline} is throwing a potluck — come bring a dish 🍲`
        : `Join ${data.name || "our potluck"} on Potlucky`;
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
    } catch {
      // user cancelled — ignore
    }
  };

  const changeRoomName = (details: EditableValueChangeDetails) => {
    updateMeta({ name: details.value });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toaster.create({
        title: "Couldn't copy link",
        description: shareUrl,
        type: "error",
      });
    }
  };

  const handleDateChange = (next: string) => {
    updateMeta({ date: next });
  };

  const saveLocation = () => {
    updateMeta({ location: locationInput.trim() });
    setIsEditingLocation(false);
  };

  const toggleRestriction = (key: DietaryRestriction) => {
    setSelectedRestrictions((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  };

  const handleDietSave = () => {
    onUpdateDietary?.(selectedRestrictions, dietNoteInput.trim() || undefined);
    setEditingDiet(false);
  };

  const handleDietCancel = () => {
    setSelectedRestrictions(currUser?.dietaryRestrictions || []);
    setDietNoteInput(currUser?.dietaryNote || "");
    setEditingDiet(false);
  };

  const handleGuestAdd = () => {
    addUser?.();
    setTimeout(() => guestInputRef.current?.focus(), 0);
  };

  return (
    <div className="card event-header">
      {/* Identity line — subtle, inside the card */}
      {currUser && identityResolved && (
        <div className="event-header-identity">
          <span>
            You&apos;re{" "}
            <strong>{currUser.name}</strong>
            {viewerIsHost && <span className="host-mark">host</span>}
            <DietaryBadges
              restrictions={currUser.dietaryRestrictions}
              note={currUser.dietaryNote}
              size="sm"
            />
          </span>
          <span className="event-header-identity-actions">
            {!editingDiet && (
              <button
                className="event-header-link"
                onClick={() => setEditingDiet(true)}
              >
                Diet
              </button>
            )}
            <button className="event-header-link" onClick={onSwitch}>
              Not you?
            </button>
          </span>
        </div>
      )}

      {/* Diet editor — expands inline */}
      <AnimatePresence>
        {editingDiet && (
          <motion.div
            className="event-header-diet-edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="dietary-picker dietary-picker-compact">
              {DIETARY_OPTIONS.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  className={`dietary-picker-chip dietary-picker-chip-sm ${
                    selectedRestrictions.includes(key) ? "dietary-picker-chip-selected" : ""
                  }`}
                  onClick={() => toggleRestriction(key)}
                  type="button"
                >
                  <span className="dietary-picker-emoji">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <input
              className="input"
              placeholder="Other restrictions..."
              value={dietNoteInput}
              onChange={(e) => setDietNoteInput(e.target.value)}
              style={{ marginTop: "8px", fontSize: "0.8125rem" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button className="btn btn-sm" onClick={handleDietSave}>Save</button>
              <button className="btn btn-sm btn-ghost" onClick={handleDietCancel}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event name — de-emphasized when still using auto-generated id */}
      <div
        className={`event-header-name${!data.name ? " event-header-name-untitled" : ""}`}
      >
        <Editable.Root
          defaultValue={data.name || data.id}
          textAlign="center"
          fontSize={data.name ? "2xl" : "md"}
          fontWeight={data.name ? "600" : "500"}
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
        {hostsByline && !soloHostIsViewer && (
          <div className="event-host-sub">
            <span aria-hidden="true" style={{ fontStyle: "normal" }}>✦</span>{" "}
            hosted by {hostsByline}
          </div>
        )}
      </div>

      {/* Date and Location row */}
      <div className="event-header-details">
        <div className="event-header-field">
          <span className="event-header-icon">📅</span>
          <DatePicker
            value={data.date}
            onChange={handleDateChange}
            placeholder="When?"
            triggerClassName={`event-header-value${!data.date ? " event-header-placeholder" : ""}`}
            ariaLabel="Pick a date"
          />
        </div>

        <div className="event-header-field">
          <span className="event-header-icon">📍</span>
          {isEditingLocation ? (
            <input
              className="input event-header-input"
              placeholder="Where?"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onBlur={saveLocation}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveLocation();
                if (e.key === "Escape") {
                  setLocationInput(data.location || "");
                  setIsEditingLocation(false);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              className={`event-header-value${!data.location ? " event-header-placeholder" : ""}`}
              onClick={() => setIsEditingLocation(true)}
            >
              {data.location || "Where?"}
            </button>
          )}
        </div>
      </div>

      {/* Guests + share — consolidated footer */}
      <div className="event-header-guests">
        <div className="guests-row">
          {data?.users?.length ? (
            <UserList
              data={data as any}
              claimUser={() => {}}
              currUser={currUser}
              removeUser={removeUser || (() => {})}
            />
          ) : null}

          {showGuestInput ? (
            <div className="add-guest-inline">
              <input
                ref={guestInputRef}
                className="input"
                placeholder="Name..."
                value={userInput}
                onChange={(e) => setUserInput?.(e.target.value)}
                onKeyDown={handleEnterKeyPress(handleGuestAdd)}
                onBlur={() => { if (!userInput) setShowGuestInput(false); }}
              />
              <button
                className="btn btn-sm"
                onClick={handleGuestAdd}
                disabled={!userInput}
              >
                Add
              </button>
            </div>
          ) : (
            <button
              className="add-guest-trigger"
              onClick={() => {
                setShowGuestInput(true);
                setTimeout(() => guestInputRef.current?.focus(), 0);
              }}
              type="button"
            >
              + Add guest
            </button>
          )}
        </div>

        <button
          className={`btn btn-outline btn-xs${showShare ? " share-btn-active" : ""}`}
          onClick={() => setShowShare((v) => !v)}
        >
          {showShare ? <LuX /> : <LuShare2 />}
          {showShare ? "Close" : "Share"}
        </button>
      </div>

      {/* Share panel — progressive disclosure */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            className="share-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="share-panel-inner">
              <p className="share-panel-label">
                {hostsPossessive
                  ? `Invite friends to ${hostsPossessive} potluck`
                  : "Scan to join"}
              </p>

              <motion.div
                className="share-qr-frame"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <QRCodeSVG
                  value={shareUrl}
                  size={152}
                  bgColor="transparent"
                  fgColor="#292524"
                  level="M"
                  imageSettings={{
                    src: "",
                    height: 0,
                    width: 0,
                    excavate: false,
                  }}
                />
              </motion.div>

              <motion.div
                className="share-url-row"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.25 }}
              >
                {canShare && (
                  <button
                    className="btn btn-sm share-copy-btn"
                    onClick={handleNativeShare}
                  >
                    <LuShare2 /> Share
                  </button>
                )}
                <button
                  className={`btn btn-sm share-copy-btn${copied ? " share-copied" : ""}`}
                  onClick={handleCopyLink}
                >
                  {copied ? <><LuCheck /> Copied</> : "Copy Link"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
