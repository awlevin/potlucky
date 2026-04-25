"use client"

import { useEffect, useRef, useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { Food, User } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

const ATTRIBUTE_BADGES: Record<NonNullable<Food["attributes"]>[number], { emoji: string; label: string; pillLabel: string }> = {
  vegetarian: { emoji: "\u{1F331}", label: "Vegetarian", pillLabel: "🌱 Veg" },
  vegan: { emoji: "\u{1F33F}", label: "Vegan", pillLabel: "🌿 Vegan" },
  "gluten-free": { emoji: "GF", label: "Gluten-free", pillLabel: "GF" },
  "nut-free": { emoji: "\u{1F95C}\u2715", label: "Nut-free", pillLabel: "🥜✕" },
  "dairy-free": { emoji: "\u{1F95B}\u2715", label: "Dairy-free", pillLabel: "🥛✕" },
};

const CATEGORY_ORDER: { key: NonNullable<Food["type"]>; label: string; pillLabel: string; emoji: string }[] = [
  { key: "appetizer", label: "Appetizers", pillLabel: "Appetizer", emoji: "🥗" },
  { key: "main", label: "Mains", pillLabel: "Main", emoji: "🍖" },
  { key: "side", label: "Sides", pillLabel: "Side", emoji: "🥘" },
  { key: "dessert", label: "Desserts", pillLabel: "Dessert", emoji: "🍰" },
  { key: "drink", label: "Drinks", pillLabel: "Drink", emoji: "🥤" },
];

interface FoodListProps {
  foods: Food[];
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  updateFood?: (
    id: string,
    patch: Partial<Pick<Food, "type" | "attributes" | "notes" | "title">>
  ) => void;
  users: User[] | undefined;
  currUser: User | undefined;
}

export const FoodList = ({
  foods,
  claimFood,
  removeFood,
  updateFood,
  users,
  currUser,
}: FoodListProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Group foods by category
  const grouped = CATEGORY_ORDER.map(({ key, label, emoji }) => ({
    key,
    label,
    emoji,
    items: foods
      .filter((f) => f.type === key)
      .sort((a, b) => a.title.localeCompare(b.title)),
  })).filter((g) => g.items.length > 0);

  // Collect any foods without a recognized category
  const uncategorized = foods.filter(
    (f) => !f.type || !CATEGORY_ORDER.some((c) => c.key === f.type)
  );
  if (uncategorized.length > 0) {
    grouped.push({
      key: "other" as NonNullable<Food["type"]>,
      label: "Other",
      emoji: "📋",
      items: uncategorized.sort((a, b) => a.title.localeCompare(b.title)),
    });
  }

  // Check if any food has dietary attributes (to show the legend)
  const hasAnyAttributes = foods.some((f) => f.attributes && f.attributes.length > 0);
  // Collect only the attributes that are actually used
  const usedAttributes = new Set<string>();
  foods.forEach((f) => f.attributes?.forEach((a) => usedAttributes.add(a)));

  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      const next = !prev;
      if (!next) setExpandedRowId(null);
      return next;
    });
  };

  return (
    <div>
      <div className={`menu-list ${isEditMode ? "menu-list-editing" : ""}`}>
        <div className="menu-edit-toggle-row">
          <button
            type="button"
            className={`menu-edit-toggle ${isEditMode ? "menu-edit-toggle-active" : ""}`}
            onClick={toggleEditMode}
            aria-pressed={isEditMode}
          >
            {isEditMode ? "Done" : "Edit"}
          </button>
        </div>
        {grouped.map((group) => (
          <div key={group.key} className="menu-group">
            <div className="menu-group-header">
              <span className="menu-group-emoji">{group.emoji}</span>
              <span className="menu-group-label">{group.label}</span>
              <span className="menu-group-count">{group.items.length}</span>
            </div>
            <AnimatePresence initial={false}>
              {group.items.map((food) => {
                // Normalize claimedBy to array for multi-claimer support
                const claimerIds = Array.isArray(food.claimedBy)
                  ? food.claimedBy
                  : food.claimedBy
                  ? [food.claimedBy]
                  : [];
                const claimers = claimerIds
                  .map((uid) => users?.find((u) => u.id === uid))
                  .filter(Boolean) as User[];
                const isMine = Boolean(currUser && claimerIds.includes(currUser.id));
                return (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MenuRow
                      food={food}
                      claimFood={claimFood}
                      removeFood={removeFood}
                      updateFood={updateFood}
                      claimers={claimers}
                      isMine={isMine}
                      currUser={currUser}
                      isEditMode={isEditMode}
                      isExpanded={expandedRowId === food.id}
                      onToggleExpand={() =>
                        setExpandedRowId((curr) => (curr === food.id ? null : food.id))
                      }
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Dietary legend — only show if at least one food has attributes */}
      {hasAnyAttributes && (
        <div className="dietary-legend">
          {Object.entries(ATTRIBUTE_BADGES)
            .filter(([key]) => usedAttributes.has(key))
            .map(([key, { emoji, label }]) => (
              <span key={key} className="dietary-legend-item">
                <span className="food-badge">{emoji}</span> {label}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

interface MenuRowProps {
  food: Food;
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  updateFood?: (
    id: string,
    patch: Partial<Pick<Food, "type" | "attributes" | "notes" | "title">>
  ) => void;
  claimers: User[];
  isMine: boolean;
  currUser: User | undefined;
  isEditMode: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const MenuRow = ({
  food,
  claimFood,
  removeFood,
  updateFood,
  claimers,
  isMine,
  currUser,
  isEditMode,
  isExpanded,
  onToggleExpand,
}: MenuRowProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isEditMode) setIsConfirmingDelete(false);
  }, [isEditMode]);

  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
    } else {
      removeFood(food.id);
    }
  };

  const handleRowActivate = () => {
    if (isEditMode) {
      onToggleExpand();
    } else {
      claimFood(food.id);
    }
  };

  const isUnclaimed = claimers.length === 0;

  const rowClasses = [
    "menu-row",
    isMine ? "menu-row-mine" : "",
    isUnclaimed ? "menu-row-unclaimed" : "",
    isEditMode ? "menu-row-edit" : "",
    isExpanded ? "menu-row-expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Build claimer display
  const claimerParts: { name: string; isYou: boolean }[] = claimers.map((u) => ({
    name: u.name,
    isYou: Boolean(currUser && u.id === currUser.id),
  }));
  // Put "you" first if present
  claimerParts.sort((a, b) => (a.isYou ? -1 : b.isYou ? 1 : 0));

  return (
    <div className="menu-row-wrapper">
      <div
        className={rowClasses}
        onClick={handleRowActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRowActivate();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isEditMode ? isExpanded : undefined}
      >
        <div className="menu-dish-info">
          <div className="menu-dish-name">
            {food.title}
            {food.attributes?.map((attr) => (
              <span key={attr} className="food-badge" title={ATTRIBUTE_BADGES[attr]?.label || attr}>
                {ATTRIBUTE_BADGES[attr]?.emoji || attr}
              </span>
            ))}
          </div>
          {food.notes && (
            <div className="menu-dish-note">{food.notes}</div>
          )}
        </div>

        {!isEditMode && (
          isUnclaimed ? (
            <span className="menu-claimer menu-claimer-none">&mdash;</span>
          ) : (
            <span className="menu-claimer">
              {claimerParts.map((c, i) => (
                <span key={c.name}>
                  {i > 0 && <span className="menu-claimer-sep">, </span>}
                  <span className={c.isYou ? "menu-claimer-you" : "menu-claimer-other"}>
                    {c.isYou ? "you" : c.name}
                  </span>
                </span>
              ))}
            </span>
          )
        )}

        {isEditMode && (
          <span className={`menu-row-chevron ${isExpanded ? "menu-row-chevron-open" : ""}`} aria-hidden="true">
            ›
          </span>
        )}

        <button
          aria-label={
            isConfirmingDelete ? `Confirm delete ${food.title}` : `Remove ${food.title}`
          }
          className={`menu-delete ${isConfirmingDelete ? "menu-delete-confirm" : ""}`}
          onClick={handleDelete}
          type="button"
        >
          {isConfirmingDelete ? (
            <span className="menu-delete-confirm-label">Tap to delete</span>
          ) : (
            <LuTrash2 size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isEditMode && isExpanded && (
          <motion.div
            key="editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <RowEditor
              food={food}
              onChange={(patch) => updateFood?.(food.id, patch)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface RowEditorProps {
  food: Food;
  onChange: (patch: Partial<Pick<Food, "type" | "attributes" | "notes" | "title">>) => void;
}

const RowEditor = ({ food, onChange }: RowEditorProps) => {
  const [noteDraft, setNoteDraft] = useState(food.notes ?? "");
  const noteCommitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest values for unmount flush (avoids stale closure)
  const latestNote = useRef(noteDraft);
  const latestSavedNote = useRef(food.notes ?? "");
  const onChangeRef = useRef(onChange);

  latestNote.current = noteDraft;
  latestSavedNote.current = food.notes ?? "";
  onChangeRef.current = onChange;

  useEffect(() => {
    setNoteDraft(food.notes ?? "");
  }, [food.notes]);

  useEffect(() => {
    return () => {
      if (noteCommitTimer.current) {
        clearTimeout(noteCommitTimer.current);
        noteCommitTimer.current = null;
      }
      if (latestNote.current !== latestSavedNote.current) {
        onChangeRef.current({ notes: latestNote.current });
      }
    };
  }, []);

  const currentAttrs = food.attributes ?? [];

  const toggleAttribute = (key: NonNullable<Food["attributes"]>[number]) => {
    const next = currentAttrs.includes(key)
      ? currentAttrs.filter((a) => a !== key)
      : [...currentAttrs, key];
    onChange({ attributes: next });
  };

  const setCategory = (key: NonNullable<Food["type"]>) => {
    if (food.type === key) return;
    onChange({ type: key });
  };

  const handleNoteChange = (value: string) => {
    setNoteDraft(value);
    if (noteCommitTimer.current) clearTimeout(noteCommitTimer.current);
    noteCommitTimer.current = setTimeout(() => {
      onChange({ notes: value });
    }, 400);
  };

  const handleNoteBlur = () => {
    if (noteCommitTimer.current) {
      clearTimeout(noteCommitTimer.current);
      noteCommitTimer.current = null;
    }
    if ((noteDraft ?? "") !== (food.notes ?? "")) {
      onChange({ notes: noteDraft });
    }
  };

  return (
    <div className="row-editor" onClick={(e) => e.stopPropagation()}>
      <div className="row-editor-inner">
        <div className="row-editor-section">
          <span className="row-editor-label">Category</span>
          <div className="row-editor-pills">
            {CATEGORY_ORDER.map(({ key, pillLabel }) => (
              <button
                key={key}
                type="button"
                className={`category-pill ${food.type === key ? "category-pill-selected" : ""}`}
                onClick={() => setCategory(key)}
              >
                {pillLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="row-editor-section">
          <span className="row-editor-label">Tags</span>
          <div className="row-editor-pills">
            {Object.entries(ATTRIBUTE_BADGES).map(([key, { pillLabel }]) => {
              const k = key as NonNullable<Food["attributes"]>[number];
              const selected = currentAttrs.includes(k);
              return (
                <button
                  key={key}
                  type="button"
                  className={`dietary-tag ${selected ? "dietary-tag-selected" : ""}`}
                  onClick={() => toggleAttribute(k)}
                  aria-pressed={selected}
                >
                  {pillLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="row-editor-section">
          <span className="row-editor-label">Note</span>
          <input
            className="input note-input"
            placeholder="e.g., Homemade, serves 8"
            value={noteDraft}
            onChange={(e) => handleNoteChange(e.target.value)}
            onBlur={handleNoteBlur}
          />
        </div>
      </div>
    </div>
  );
};
