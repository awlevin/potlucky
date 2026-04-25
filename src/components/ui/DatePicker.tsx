"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type ParsedValue = {
  date?: Date;
  time?: { hour12: number; minute: number; meridiem: "AM" | "PM" };
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(t: { hour12: number; minute: number; meridiem: "AM" | "PM" }): string {
  return `${t.hour12}:${pad2(t.minute)} ${t.meridiem}`;
}

export function formatDateValue(
  d: Date,
  t?: { hour12: number; minute: number; meridiem: "AM" | "PM" },
): string {
  const datePart = formatDate(d);
  return t ? `${datePart} · ${formatTime(t)}` : datePart;
}

export function parseDateValue(value?: string): ParsedValue {
  if (!value) return {};
  const [datePart, timePart] = value.split(" · ").map((s) => s.trim());

  let date: Date | undefined;
  const parsed = new Date(datePart);
  if (!Number.isNaN(parsed.getTime())) {
    date = startOfDay(parsed);
  }

  let time: ParsedValue["time"] | undefined;
  if (timePart) {
    const m = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) {
      const hour12 = Number(m[1]);
      const minute = Number(m[2]);
      const meridiem = m[3].toUpperCase() as "AM" | "PM";
      if (hour12 >= 1 && hour12 <= 12 && minute >= 0 && minute < 60) {
        time = { hour12, minute, meridiem };
      }
    }
  }

  return { date, time };
}

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  triggerProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">;
  ariaLabel?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  triggerClassName,
  triggerProps,
  ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseDateValue(value), [value]);
  const hasValue = Boolean(parsed.date);

  const [viewYear, setViewYear] = useState<number>(() =>
    parsed.date?.getFullYear() ?? new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    parsed.date?.getMonth() ?? new Date().getMonth(),
  );

  const [showTime, setShowTime] = useState<boolean>(Boolean(parsed.time));
  const [timeHour, setTimeHour] = useState<string>(
    parsed.time ? String(parsed.time.hour12) : "6",
  );
  const [timeMinute, setTimeMinute] = useState<string>(
    parsed.time ? pad2(parsed.time.minute) : "00",
  );
  const [meridiem, setMeridiem] = useState<"AM" | "PM">(
    parsed.time?.meridiem ?? "PM",
  );

  // Re-sync view + time fields each time the picker opens, so a value edited
  // externally between opens (or stale defaults from the last edit session)
  // doesn't leak into the new view.
  useEffect(() => {
    if (!open) return;
    const base = parsed.date ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setShowTime(Boolean(parsed.time));
    if (parsed.time) {
      setTimeHour(String(parsed.time.hour12));
      setTimeMinute(pad2(parsed.time.minute));
      setMeridiem(parsed.time.meridiem);
    } else {
      setTimeHour("6");
      setTimeMinute("00");
      setMeridiem("PM");
    }
  }, [open, parsed]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const buildTime = useCallback((): ParsedValue["time"] | undefined => {
    if (!showTime) return undefined;
    const h = Number(timeHour);
    const m = Number(timeMinute);
    if (!Number.isFinite(h) || h < 1 || h > 12) return undefined;
    if (!Number.isFinite(m) || m < 0 || m > 59) return undefined;
    return { hour12: h, minute: m, meridiem };
  }, [showTime, timeHour, timeMinute, meridiem]);

  // Close commits the in-flight time edit; time fields don't write through
  // on every keystroke, so otherwise typing a time and clicking outside
  // would lose the edit.
  const closeAndCommit = useCallback(() => {
    if (parsed.date) {
      onChange(formatDateValue(parsed.date, buildTime()));
    }
    setOpen(false);
  }, [parsed.date, buildTime, onChange]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = wrapperRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        closeAndCommit();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndCommit();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeAndCommit]);

  const commit = useCallback(
    (date: Date, time: ParsedValue["time"]) => {
      onChange(formatDateValue(date, time));
    },
    [onChange],
  );

  const handlePickDay = (day: Date) => {
    const time = buildTime();
    commit(day, time);
    if (!showTime) {
      setOpen(false);
    }
  };

  const handlePickToday = () => {
    handlePickDay(today);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleDone = () => {
    closeAndCommit();
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Build the 6-week calendar grid for the visible month.
  const daysGrid = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
    }
    return cells;
  }, [viewYear, viewMonth]);

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  const previewValue = useMemo(() => {
    if (!parsed.date) return "";
    return formatDateValue(parsed.date, buildTime());
  }, [parsed.date, buildTime]);

  const triggerLabel = value || placeholder;

  return (
    <div className="datepicker" ref={wrapperRef}>
      <button
        type="button"
        className={triggerClassName ?? "datepicker-trigger"}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-empty={!hasValue ? "true" : undefined}
        {...triggerProps}
      >
        {triggerLabel}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="datepicker-panel"
            role="dialog"
            aria-label="Pick a date"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="datepicker-header">
              <button
                type="button"
                className="datepicker-nav"
                onClick={goPrevMonth}
                aria-label="Previous month"
              >
                <LuChevronLeft />
              </button>
              <span className="datepicker-month">{monthLabel}</span>
              <button
                type="button"
                className="datepicker-nav"
                onClick={goNextMonth}
                aria-label="Next month"
              >
                <LuChevronRight />
              </button>
            </div>

            <div className="datepicker-weekdays">
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="datepicker-weekday">
                  {d}
                </span>
              ))}
            </div>

            <div className="datepicker-grid">
              {daysGrid.map((day, i) => {
                const inMonth = day.getMonth() === viewMonth;
                const isToday = isSameDay(day, today);
                const isSelected = parsed.date ? isSameDay(day, parsed.date) : false;
                return (
                  <button
                    key={`${viewYear}-${viewMonth}-${i}`}
                    type="button"
                    className="datepicker-day"
                    data-outside={!inMonth ? "true" : undefined}
                    data-today={isToday ? "true" : undefined}
                    data-selected={isSelected ? "true" : undefined}
                    onClick={() => handlePickDay(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="datepicker-time-row">
              {showTime ? (
                <div className="datepicker-time-edit">
                  <span className="datepicker-time-label">at</span>
                  <input
                    className="datepicker-time-input"
                    inputMode="numeric"
                    aria-label="Hour"
                    value={timeHour}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                      setTimeHour(raw);
                    }}
                    onBlur={() => {
                      const n = Number(timeHour);
                      if (!Number.isFinite(n) || n < 1) setTimeHour("12");
                      else if (n > 12) setTimeHour("12");
                      else setTimeHour(String(n));
                    }}
                  />
                  <span className="datepicker-time-colon">:</span>
                  <input
                    className="datepicker-time-input"
                    inputMode="numeric"
                    aria-label="Minute"
                    value={timeMinute}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                      setTimeMinute(raw);
                    }}
                    onBlur={() => {
                      const n = Number(timeMinute);
                      if (!Number.isFinite(n) || n < 0) setTimeMinute("00");
                      else if (n > 59) setTimeMinute("59");
                      else setTimeMinute(pad2(n));
                    }}
                  />
                  <div
                    className="datepicker-meridiem"
                    role="group"
                    aria-label="AM or PM"
                  >
                    <button
                      type="button"
                      className="datepicker-meridiem-btn"
                      data-active={meridiem === "AM" ? "true" : undefined}
                      onClick={() => setMeridiem("AM")}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className="datepicker-meridiem-btn"
                      data-active={meridiem === "PM" ? "true" : undefined}
                      onClick={() => setMeridiem("PM")}
                    >
                      PM
                    </button>
                  </div>
                  <button
                    type="button"
                    className="datepicker-time-remove"
                    onClick={() => {
                      setShowTime(false);
                      if (parsed.date && parsed.time) commit(parsed.date, undefined);
                    }}
                    aria-label="Remove time"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="datepicker-time-add"
                  onClick={() => setShowTime(true)}
                >
                  + Add a time
                </button>
              )}
            </div>

            <div className="datepicker-footer">
              <button
                type="button"
                className="datepicker-link"
                onClick={handlePickToday}
              >
                Today
              </button>
              {hasValue && (
                <button
                  type="button"
                  className="datepicker-link datepicker-link-danger"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
              <span className="datepicker-spacer" />
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleDone}
                disabled={!hasValue}
              >
                Done
              </button>
            </div>

            {previewValue && (
              <div className="datepicker-preview" aria-live="polite">
                {previewValue}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
