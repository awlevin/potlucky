"use client"

import { useEffect, useState } from "react";
import { LuDelete, LuCheck } from "react-icons/lu";
import { User } from "@/types";

interface UserItemProps {
  user: User;
  claimUser: (id: string) => void;
  removeUser: (id: string) => void;
  isSelectedUser: boolean;
}

const UserItem = ({
  user,
  claimUser,
  removeUser,
  isSelectedUser,
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

  return (
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
  );
};

export default UserItem;
