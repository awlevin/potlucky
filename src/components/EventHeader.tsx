"use client";
import { useState } from "react";
import {
  Editable,
  EditableValueChangeDetails,
} from "@chakra-ui/react";
import { LuShare2 } from "react-icons/lu";
import { IRoomObj } from "@/types";
import { toaster } from "@/components/ui/toaster";

interface EventHeaderProps {
  data: IRoomObj;
  addData: (newData: Partial<IRoomObj>) => void;
}

export function EventHeader({ data, addData }: EventHeaderProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [dateInput, setDateInput] = useState(data.date || "");
  const [locationInput, setLocationInput] = useState(data.location || "");

  const changeRoomName = (details: EditableValueChangeDetails) => {
    addData({ name: details.value });
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

  const saveDate = () => {
    const trimmed = dateInput.trim();
    addData({ date: trimmed });
    setIsEditingDate(false);
  };

  const saveLocation = () => {
    const trimmed = locationInput.trim();
    addData({ location: trimmed });
    setIsEditingLocation(false);
  };

  const guestCount = data.users?.length || 0;

  return (
    <div className="card event-header">
      {/* Event name — Chakra Editable */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <Editable.Root
          defaultValue={data.name || data.id}
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
      </div>

      {/* Date and Location row */}
      <div className="event-header-details">
        {/* Date field */}
        <div className="event-header-field">
          <span className="event-header-icon">📅</span>
          {isEditingDate ? (
            <input
              className="input event-header-input"
              placeholder="When? (e.g., Saturday at 6pm)"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              onBlur={saveDate}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveDate();
                if (e.key === "Escape") {
                  setDateInput(data.date || "");
                  setIsEditingDate(false);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              className={`event-header-value${!data.date ? " event-header-placeholder" : ""}`}
              onClick={() => setIsEditingDate(true)}
            >
              {data.date || "When? (e.g., Saturday at 6pm)"}
            </button>
          )}
        </div>

        {/* Location field */}
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

      {/* Bottom row: guest badge + share button */}
      <div className="event-header-footer">
        <span className="badge badge-accent">
          {guestCount} {guestCount === 1 ? "guest" : "guests"}
        </span>
        <button
          className="btn btn-outline btn-xs"
          onClick={handleShare}
        >
          <LuShare2 />
          Share Link
        </button>
      </div>
    </div>
  );
}
