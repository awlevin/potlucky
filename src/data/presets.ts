import { Food } from "@/types";
import { nanoid } from "nanoid";

export interface PotluckPreset {
  id: string;
  name: string;
  emoji: string;
  date?: string;
  dishes: { title: string; type: Food["type"] }[];
}

function dish(title: string, type: Food["type"]): { title: string; type: Food["type"] } {
  return { title, type };
}

export const presets: PotluckPreset[] = [
  {
    id: "easter",
    name: "Easter Potluck",
    emoji: "🐣",
    date: "April 19, 2026",
    dishes: [
      dish("Deviled Eggs", "appetizer"),
      dish("Cheese Board", "appetizer"),
      dish("Honey-Glazed Ham", "main"),
      dish("Lamb Chops", "main"),
      dish("Scalloped Potatoes", "side"),
      dish("Spring Salad", "side"),
      dish("Roasted Asparagus", "side"),
      dish("Hot Cross Buns", "side"),
      dish("Carrot Cake", "dessert"),
      dish("Lemon Bars", "dessert"),
      dish("Sparkling Lemonade", "drink"),
      dish("Rosé", "drink"),
    ],
  },
  {
    id: "cinco-de-mayo",
    name: "Cinco de Mayo Fiesta",
    emoji: "🇲🇽",
    date: "May 5, 2026",
    dishes: [
      dish("Guacamole & Chips", "appetizer"),
      dish("Queso Fundido", "appetizer"),
      dish("Street Tacos", "main"),
      dish("Chicken Enchiladas", "main"),
      dish("Carnitas", "main"),
      dish("Mexican Rice", "side"),
      dish("Elote (Street Corn)", "side"),
      dish("Pico de Gallo", "side"),
      dish("Churros", "dessert"),
      dish("Tres Leches Cake", "dessert"),
      dish("Margaritas", "drink"),
      dish("Horchata", "drink"),
    ],
  },
  {
    id: "mothers-day",
    name: "Mother's Day Brunch",
    emoji: "💐",
    date: "May 10, 2026",
    dishes: [
      dish("Fruit & Yogurt Parfaits", "appetizer"),
      dish("Smoked Salmon Crostini", "appetizer"),
      dish("Quiche Lorraine", "main"),
      dish("Eggs Benedict", "main"),
      dish("French Toast Casserole", "main"),
      dish("Mixed Berry Salad", "side"),
      dish("Roasted Potatoes", "side"),
      dish("Scones & Clotted Cream", "dessert"),
      dish("Strawberry Shortcake", "dessert"),
      dish("Mimosas", "drink"),
      dish("Fresh-Squeezed OJ", "drink"),
    ],
  },
  {
    id: "memorial-day",
    name: "Memorial Day Cookout",
    emoji: "🇺🇸",
    date: "May 25, 2026",
    dishes: [
      dish("Spinach Artichoke Dip", "appetizer"),
      dish("Pigs in a Blanket", "appetizer"),
      dish("Burgers", "main"),
      dish("BBQ Ribs", "main"),
      dish("Grilled Chicken", "main"),
      dish("Coleslaw", "side"),
      dish("Potato Salad", "side"),
      dish("Corn on the Cob", "side"),
      dish("Baked Beans", "side"),
      dish("Watermelon Slices", "dessert"),
      dish("Apple Pie", "dessert"),
      dish("Lemonade", "drink"),
    ],
  },
  {
    id: "4th-of-july",
    name: "4th of July BBQ",
    emoji: "🎆",
    date: "July 4, 2026",
    dishes: [
      dish("Caprese Skewers", "appetizer"),
      dish("Buffalo Chicken Dip", "appetizer"),
      dish("Hot Dogs", "main"),
      dish("Pulled Pork Sliders", "main"),
      dish("Grilled Sausages", "main"),
      dish("Mac & Cheese", "side"),
      dish("Cornbread", "side"),
      dish("Pasta Salad", "side"),
      dish("Red, White & Blue Trifle", "dessert"),
      dish("Brownies", "dessert"),
      dish("Sweet Tea", "drink"),
      dish("Beer", "drink"),
    ],
  },
  {
    id: "halloween",
    name: "Halloween Party",
    emoji: "🎃",
    date: "October 31, 2026",
    dishes: [
      dish("Mummy Jalapeño Poppers", "appetizer"),
      dish("Spider Web Dip", "appetizer"),
      dish("Monster Meatball Subs", "main"),
      dish("Witch's Brew Chili", "main"),
      dish("Jack-o-Lantern Stuffed Peppers", "main"),
      dish("Graveyard Taco Dip", "side"),
      dish("Mummy Hot Dogs", "side"),
      dish("Candy Apples", "dessert"),
      dish("Pumpkin Cupcakes", "dessert"),
      dish("Ghost Cookies", "dessert"),
      dish("Apple Cider", "drink"),
      dish("Witch's Brew Punch", "drink"),
    ],
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving Feast",
    emoji: "🦃",
    date: "November 26, 2026",
    dishes: [
      dish("Cheese & Crackers", "appetizer"),
      dish("Butternut Squash Soup", "appetizer"),
      dish("Roast Turkey", "main"),
      dish("Honey-Glazed Ham", "main"),
      dish("Stuffing", "side"),
      dish("Mashed Potatoes & Gravy", "side"),
      dish("Cranberry Sauce", "side"),
      dish("Green Bean Casserole", "side"),
      dish("Sweet Potato Casserole", "side"),
      dish("Dinner Rolls", "side"),
      dish("Pumpkin Pie", "dessert"),
      dish("Pecan Pie", "dessert"),
      dish("Apple Cider", "drink"),
      dish("Wine", "drink"),
    ],
  },
  {
    id: "friendsgiving",
    name: "Friendsgiving",
    emoji: "🤗",
    dishes: [
      dish("Bruschetta", "appetizer"),
      dish("Hummus & Pita", "appetizer"),
      dish("Lasagna", "main"),
      dish("Mac & Cheese", "main"),
      dish("Caesar Salad", "side"),
      dish("Garlic Bread", "side"),
      dish("Roasted Vegetables", "side"),
      dish("Mashed Potatoes", "side"),
      dish("Tiramisu", "dessert"),
      dish("Chocolate Chip Cookies", "dessert"),
      dish("Sangria", "drink"),
      dish("Sparkling Water", "drink"),
    ],
  },
  {
    id: "christmas",
    name: "Christmas Dinner",
    emoji: "🎄",
    date: "December 25, 2026",
    dishes: [
      dish("Shrimp Cocktail", "appetizer"),
      dish("Brie & Cranberry Bites", "appetizer"),
      dish("Prime Rib", "main"),
      dish("Roast Chicken", "main"),
      dish("Scalloped Potatoes", "side"),
      dish("Roasted Brussels Sprouts", "side"),
      dish("Glazed Carrots", "side"),
      dish("Dinner Rolls", "side"),
      dish("Yule Log Cake", "dessert"),
      dish("Gingerbread Cookies", "dessert"),
      dish("Eggnog", "drink"),
      dish("Mulled Wine", "drink"),
    ],
  },
  {
    id: "super-bowl",
    name: "Super Bowl Party",
    emoji: "🏈",
    date: "February 7, 2027",
    dishes: [
      dish("Buffalo Wings", "appetizer"),
      dish("Nachos Supreme", "appetizer"),
      dish("Seven-Layer Dip", "appetizer"),
      dish("Pulled Pork Sliders", "main"),
      dish("Chili", "main"),
      dish("Pizza Rolls", "main"),
      dish("Loaded Potato Skins", "side"),
      dish("Jalapeño Poppers", "side"),
      dish("Brownies", "dessert"),
      dish("Cookies", "dessert"),
      dish("Beer", "drink"),
      dish("Soda", "drink"),
    ],
  },
];

/** Convert a preset's dish list into Food objects with unique IDs. */
export function presetToFoods(preset: PotluckPreset): Food[] {
  return preset.dishes.map((d) => ({
    id: nanoid(),
    title: d.title,
    type: d.type,
    claimedBy: null,
  }));
}

/**
 * Return presets relevant to the current date — upcoming holidays
 * within the next ~90 days, plus undated/evergreen ones.
 * Falls back to all presets if fewer than 3 are upcoming.
 */
export function getUpcomingPresets(now: Date = new Date()): PotluckPreset[] {
  const MS_PER_DAY = 86_400_000;
  const LOOKAHEAD_DAYS = 90;

  const scored = presets.map((p) => {
    if (!p.date) {
      // Undated presets (Friendsgiving) get a neutral score — always eligible
      return { preset: p, daysUntil: LOOKAHEAD_DAYS / 2 };
    }
    const eventDate = new Date(p.date);
    const diff = (eventDate.getTime() - now.getTime()) / MS_PER_DAY;
    return { preset: p, daysUntil: diff };
  });

  // Include events that are upcoming (within lookahead) or happened very recently (within 3 days)
  const upcoming = scored
    .filter((s) => s.daysUntil >= -3 && s.daysUntil <= LOOKAHEAD_DAYS)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  if (upcoming.length >= 3) {
    return upcoming.map((s) => s.preset);
  }

  // If not enough upcoming, return all presets sorted by proximity
  return scored
    .sort((a, b) => Math.abs(a.daysUntil) - Math.abs(b.daysUntil))
    .map((s) => s.preset);
}
