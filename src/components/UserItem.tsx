"use client"

import { useEffect, useMemo, useState } from "react";
import { LuDelete, LuCheck } from "react-icons/lu";
import { User } from "@/types";
import { DietaryBadges, DIETARY_OPTIONS } from "@/components/IdentityGate";
import { Tooltip } from "@/components/ui/tooltip";

interface UserItemProps {
  user: User;
  claimUser: (id: string) => void;
  removeUser: (id: string) => void;
  isSelectedUser: boolean;
  isHost?: boolean;
}

const UserItem = ({
  user,
  claimUser,
  removeUser,
  isSelectedUser,
  isHost,
}: UserItemProps) => {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isClicked) {
      setIsClicked(true);
    } else {
      removeUser(user.id);
    }
  };

  const hasDietary = !!(user.dietaryRestrictions?.length || user.dietaryNote);

  const tooltipContent = useMemo(() => {
    if (!hasDietary) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {user.dietaryRestrictions?.map((r) => {
          const opt = DIETARY_OPTIONS.find((o) => o.key === r);
          return (
            <span key={r}>
              {opt?.emoji} {opt?.label || r}
            </span>
          );
        })}
        {user.dietaryNote && (
          <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>
            {user.dietaryNote}
          </span>
        )}
      </div>
    );
  }, [hasDietary, user.dietaryRestrictions, user.dietaryNote]);

  return (
    <Tooltip
      content={tooltipContent}
      disabled={!hasDietary}
      openDelay={500}
      closeDelay={0}
      showArrow
    >
      <div
        className={`pill ${isSelectedUser ? "pill-selected" : ""}`}
        onClick={() => claimUser(user.id)}
        role="button"
        tabIndex={0}
      >
        {isSelectedUser && (
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--color-accent)",
              flexShrink: 0,
            }}
          />
        )}
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: isSelectedUser ? 600 : 400,
          }}
        >
          {user.name}
        </span>
        {isHost && <span className="host-mark">host</span>}
        <DietaryBadges
          restrictions={user.dietaryRestrictions}
          note={user.dietaryNote}
          size="xs"
        />
        <button
          aria-label={`Remove ${user.name}`}
          className={`item-delete-btn ${isClicked ? "confirm" : ""}`}
          onClick={handleDelete}
          type="button"
          title={isClicked ? "Click again to confirm" : `Remove ${user.name}`}
        >
          {isClicked ? <LuCheck /> : <LuDelete />}
        </button>
      </div>
    </Tooltip>
  );
};

export default UserItem;
