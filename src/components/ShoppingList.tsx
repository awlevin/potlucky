"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingItem } from "@/types";
import { toaster } from "@/components/ui/toaster";

interface ShoppingListProps {
  items: ShoppingItem[];
  roomId: string;
}

type AisleGroup = { aisle: string; items: ShoppingItem[] };

export function ShoppingList({ items, roomId }: ShoppingListProps) {
  const [copied, setCopied] = useState(false);

  // Load checked state from localStorage
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(`potlucky-shopping-checked-${roomId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Group by aisle
  const aisleGroups: AisleGroup[] = useMemo(() => {
    const map: Record<string, ShoppingItem[]> = {};
    const order: string[] = [];
    for (const item of items) {
      const aisle = item.aisle || "Other";
      if (!map[aisle]) {
        map[aisle] = [];
        order.push(aisle);
      }
      map[aisle].push(item);
    }
    return order.map((aisle) => ({ aisle, items: map[aisle] }));
  }, [items]);

  const toggleCheck = (itemKey: string) => {
    setChecked((prev) => {
      const next = { ...prev };
      if (next[itemKey]) delete next[itemKey];
      else next[itemKey] = true;
      try {
        localStorage.setItem(
          `potlucky-shopping-checked-${roomId}`,
          JSON.stringify(next)
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const lines: string[] = ["## Shopping List", ""];
    for (const group of aisleGroups) {
      lines.push(`### ${group.aisle}`);
      for (const item of group.items) {
        const isChecked = !!checked[`${item.aisle}-${item.item}`];
        lines.push(`- [${isChecked ? "x" : " "}] ${item.quantity} ${item.item}`);
      }
      lines.push("");
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n").trimEnd());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toaster.create({ title: "Failed to copy", type: "error" });
    }
  };

  const checkedCount = Object.keys(checked).length;
  const totalCount = items.length;

  return (
    <motion.div
      className="shopping-list"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="shopping-list-header">
        <h4 className="shopping-list-title">
          <span>🛒</span> Shopping List
        </h4>
        {checkedCount > 0 && (
          <span className="shopping-list-progress">
            {checkedCount}/{totalCount} items
          </span>
        )}
      </div>

      <div className="shopping-list-body">
        {aisleGroups.map((group, aisleIdx) => (
          <motion.div
            key={group.aisle}
            className="shopping-aisle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + aisleIdx * 0.05, duration: 0.3 }}
          >
            <div className="shopping-aisle-header">{group.aisle}</div>
            {group.items.map((item: ShoppingItem, i: number) => {
              const key = `${item.aisle}-${item.item}`;
              const isChecked = !!checked[key];
              return (
                <button
                  key={i}
                  className={`shopping-item${isChecked ? " shopping-item-checked" : ""}`}
                  onClick={() => toggleCheck(key)}
                >
                  <span
                    className={`shopping-checkbox${isChecked ? " shopping-checkbox-checked" : ""}`}
                  >
                    {isChecked ? "✓" : ""}
                  </span>
                  <span className="shopping-item-qty">{item.quantity}</span>
                  <span className="shopping-item-name">{item.item}</span>
                </button>
              );
            })}
          </motion.div>
        ))}
      </div>

      <div className="shopping-list-footer">
        <button
          className={`btn btn-sm btn-outline shopping-copy-btn${copied ? " shopping-copy-btn-copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy list"}
        </button>
      </div>
    </motion.div>
  );
}
