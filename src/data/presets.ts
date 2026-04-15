import { Food, DietaryRestriction } from "@/types";
import { nanoid } from "nanoid";

export interface PresetDish {
  title: string;
  type: Food["type"];
  attributes?: DietaryRestriction[];
}

export interface PotluckPreset {
  id: string;
  name: string;
  emoji: string;
  date?: string;
  dishes: PresetDish[];
}

function dish(
  title: string,
  type: Food["type"],
  attributes?: DietaryRestriction[],
): PresetDish {
  return attributes ? { title, type, attributes } : { title, type };
}

export const presets: PotluckPreset[] = [
  {
    id: "cinco-de-mayo",
    name: "Cinco de Mayo Fiesta",
    emoji: "🇲🇽",
    date: "May 5, 2026",
    dishes: [
      dish("Guacamole & Chips", "appetizer", ["vegan", "gluten-free"]),
      dish("Queso Fundido", "appetizer", ["vegetarian"]),
      dish("Street Tacos", "main"),
      dish("Chicken Enchiladas", "main"),
      dish("Carnitas", "main", ["gluten-free", "dairy-free"]),
      dish("Mexican Rice", "side", ["vegan", "gluten-free"]),
      dish("Elote (Street Corn)", "side", ["vegetarian", "gluten-free"]),
      dish("Pico de Gallo", "side", ["vegan", "gluten-free"]),
      dish("Churros", "dessert", ["vegetarian"]),
      dish("Tres Leches Cake", "dessert", ["vegetarian"]),
      dish("Margaritas", "drink", ["vegan", "gluten-free"]),
      dish("Horchata", "drink", ["vegan", "dairy-free"]),
    ],
  },
  {
    id: "mothers-day",
    name: "Mother's Day Brunch",
    emoji: "💐",
    date: "May 10, 2026",
    dishes: [
      dish("Fruit & Yogurt Parfaits", "appetizer", ["vegetarian", "gluten-free"]),
      dish("Smoked Salmon Crostini", "appetizer"),
      dish("Quiche Lorraine", "main", ["vegetarian"]),
      dish("Eggs Benedict", "main"),
      dish("French Toast Casserole", "main", ["vegetarian"]),
      dish("Mixed Berry Salad", "side", ["vegan", "gluten-free"]),
      dish("Roasted Potatoes", "side", ["vegan", "gluten-free"]),
      dish("Scones & Clotted Cream", "dessert", ["vegetarian"]),
      dish("Strawberry Shortcake", "dessert", ["vegetarian"]),
      dish("Mimosas", "drink", ["vegan", "gluten-free"]),
      dish("Fresh-Squeezed OJ", "drink", ["vegan", "gluten-free"]),
    ],
  },
  {
    id: "memorial-day",
    name: "Memorial Day Cookout",
    emoji: "🇺🇸",
    date: "May 25, 2026",
    dishes: [
      dish("Spinach Artichoke Dip", "appetizer", ["vegetarian"]),
      dish("Pigs in a Blanket", "appetizer"),
      dish("Burgers", "main"),
      dish("BBQ Ribs", "main", ["gluten-free", "dairy-free"]),
      dish("Grilled Chicken", "main", ["gluten-free", "dairy-free"]),
      dish("Coleslaw", "side", ["vegetarian", "gluten-free"]),
      dish("Potato Salad", "side", ["vegetarian", "gluten-free"]),
      dish("Corn on the Cob", "side", ["vegan", "gluten-free"]),
      dish("Baked Beans", "side", ["vegan", "gluten-free"]),
      dish("Watermelon Slices", "dessert", ["vegan", "gluten-free"]),
      dish("Apple Pie", "dessert", ["vegetarian"]),
      dish("Lemonade", "drink", ["vegan", "gluten-free"]),
    ],
  },
  {
    id: "4th-of-july",
    name: "4th of July BBQ",
    emoji: "🎆",
    date: "July 4, 2026",
    dishes: [
      dish("Caprese Skewers", "appetizer", ["vegetarian", "gluten-free"]),
      dish("Buffalo Chicken Dip", "appetizer"),
      dish("Hot Dogs", "main"),
      dish("Pulled Pork Sliders", "main"),
      dish("Grilled Sausages", "main", ["gluten-free", "dairy-free"]),
      dish("Mac & Cheese", "side", ["vegetarian"]),
      dish("Cornbread", "side", ["vegetarian"]),
      dish("Pasta Salad", "side", ["vegetarian"]),
      dish("Red, White & Blue Trifle", "dessert", ["vegetarian"]),
      dish("Brownies", "dessert", ["vegetarian"]),
      dish("Sweet Tea", "drink", ["vegan", "gluten-free"]),
      dish("Beer", "drink", ["vegan"]),
    ],
  },
  {
    id: "halloween",
    name: "Halloween Party",
    emoji: "🎃",
    date: "October 31, 2026",
    dishes: [
      dish("Mummy Jalapeño Poppers", "appetizer"),
      dish("Spider Web Dip", "appetizer", ["vegetarian"]),
      dish("Monster Meatball Subs", "main"),
      dish("Witch's Brew Chili", "main"),
      dish("Jack-o-Lantern Stuffed Peppers", "main", ["vegetarian"]),
      dish("Graveyard Taco Dip", "side"),
      dish("Mummy Hot Dogs", "side"),
      dish("Candy Apples", "dessert", ["vegan", "gluten-free"]),
      dish("Pumpkin Cupcakes", "dessert", ["vegetarian"]),
      dish("Ghost Cookies", "dessert", ["vegetarian"]),
      dish("Apple Cider", "drink", ["vegan", "gluten-free"]),
      dish("Witch's Brew Punch", "drink", ["vegan", "gluten-free"]),
    ],
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving Feast",
    emoji: "🦃",
    date: "November 26, 2026",
    dishes: [
      dish("Cheese & Crackers", "appetizer", ["vegetarian"]),
      dish("Butternut Squash Soup", "appetizer", ["vegetarian", "gluten-free"]),
      dish("Roast Turkey", "main", ["gluten-free", "dairy-free"]),
      dish("Honey-Glazed Ham", "main", ["gluten-free", "dairy-free"]),
      dish("Stuffing", "side", ["vegetarian"]),
      dish("Mashed Potatoes & Gravy", "side", ["vegetarian", "gluten-free"]),
      dish("Cranberry Sauce", "side", ["vegan", "gluten-free"]),
      dish("Green Bean Casserole", "side", ["vegetarian"]),
      dish("Sweet Potato Casserole", "side", ["vegetarian", "gluten-free"]),
      dish("Dinner Rolls", "side", ["vegetarian"]),
      dish("Pumpkin Pie", "dessert", ["vegetarian"]),
      dish("Pecan Pie", "dessert", ["vegetarian"]),
      dish("Apple Cider", "drink", ["vegan", "gluten-free"]),
      dish("Wine", "drink", ["vegan", "gluten-free"]),
    ],
  },
  {
    id: "friendsgiving",
    name: "Friendsgiving",
    emoji: "🤗",
    dishes: [
      dish("Bruschetta", "appetizer", ["vegan"]),
      dish("Hummus & Pita", "appetizer", ["vegan"]),
      dish("Lasagna", "main", ["vegetarian"]),
      dish("Mac & Cheese", "main", ["vegetarian"]),
      dish("Caesar Salad", "side", ["vegetarian"]),
      dish("Garlic Bread", "side", ["vegetarian"]),
      dish("Roasted Vegetables", "side", ["vegan", "gluten-free"]),
      dish("Mashed Potatoes", "side", ["vegetarian", "gluten-free"]),
      dish("Tiramisu", "dessert", ["vegetarian"]),
      dish("Chocolate Chip Cookies", "dessert", ["vegetarian"]),
      dish("Sangria", "drink", ["vegan", "gluten-free"]),
      dish("Sparkling Water", "drink", ["vegan", "gluten-free"]),
    ],
  },
  {
    id: "christmas",
    name: "Christmas Dinner",
    emoji: "🎄",
    date: "December 25, 2026",
    dishes: [
      dish("Shrimp Cocktail", "appetizer", ["gluten-free", "dairy-free"]),
      dish("Brie & Cranberry Bites", "appetizer", ["vegetarian"]),
      dish("Prime Rib", "main", ["gluten-free", "dairy-free"]),
      dish("Roast Chicken", "main", ["gluten-free", "dairy-free"]),
      dish("Scalloped Potatoes", "side", ["vegetarian", "gluten-free"]),
      dish("Roasted Brussels Sprouts", "side", ["vegan", "gluten-free"]),
      dish("Glazed Carrots", "side", ["vegan", "gluten-free"]),
      dish("Dinner Rolls", "side", ["vegetarian"]),
      dish("Yule Log Cake", "dessert", ["vegetarian"]),
      dish("Gingerbread Cookies", "dessert", ["vegetarian"]),
      dish("Eggnog", "drink", ["vegetarian", "gluten-free"]),
      dish("Mulled Wine", "drink", ["vegan", "gluten-free"]),
    ],
  },
  {
    id: "super-bowl",
    name: "Super Bowl Party",
    emoji: "🏈",
    date: "February 7, 2027",
    dishes: [
      dish("Buffalo Wings", "appetizer", ["gluten-free", "dairy-free"]),
      dish("Nachos Supreme", "appetizer"),
      dish("Seven-Layer Dip", "appetizer", ["vegetarian", "gluten-free"]),
      dish("Pulled Pork Sliders", "main"),
      dish("Chili", "main", ["gluten-free", "dairy-free"]),
      dish("Pizza Rolls", "main"),
      dish("Loaded Potato Skins", "side", ["gluten-free"]),
      dish("Jalapeño Poppers", "side"),
      dish("Brownies", "dessert", ["vegetarian"]),
      dish("Cookies", "dessert", ["vegetarian"]),
      dish("Beer", "drink", ["vegan"]),
      dish("Soda", "drink", ["vegan", "gluten-free"]),
    ],
  },
  {
    id: "plant-based",
    name: "Plant-Based Feast",
    emoji: "🌱",
    dishes: [
      dish("Stuffed Grape Leaves", "appetizer", ["vegan", "gluten-free"]),
      dish("White Bean & Roasted Garlic Dip", "appetizer", ["vegan", "gluten-free", "nut-free"]),
      dish("Mushroom Bolognese", "main", ["vegan", "dairy-free"]),
      dish("Coconut Chickpea Curry", "main", ["vegan", "gluten-free", "nut-free"]),
      dish("Black Bean Tacos", "main", ["vegan", "gluten-free", "nut-free"]),
      dish("Rainbow Grain Bowl", "side", ["vegan", "nut-free"]),
      dish("Charred Broccolini", "side", ["vegan", "gluten-free", "nut-free"]),
      dish("Roasted Beet Salad", "side", ["vegan", "gluten-free"]),
      dish("Mango Coconut Panna Cotta", "dessert", ["vegan", "gluten-free"]),
      dish("Dark Chocolate Avocado Mousse", "dessert", ["vegan", "gluten-free", "dairy-free"]),
      dish("Hibiscus Agua Fresca", "drink", ["vegan", "gluten-free", "nut-free"]),
      dish("Oat Milk Chai", "drink", ["vegan", "dairy-free", "nut-free"]),
    ],
  },
  {
    id: "pizza-night",
    name: "Pizza Night",
    emoji: "🍕",
    dishes: [
      dish("Bruschetta", "appetizer", ["vegan"]),
      dish("Caprese Salad", "appetizer", ["vegetarian", "gluten-free"]),
      dish("Garlic Knots", "appetizer", ["vegetarian"]),
      dish("Margherita Pizza", "main", ["vegetarian"]),
      dish("Pepperoni Pizza", "main"),
      dish("BBQ Chicken Pizza", "main"),
      dish("Caesar Salad", "side", ["vegetarian"]),
      dish("Antipasto Platter", "side", ["gluten-free"]),
      dish("Cannoli", "dessert", ["vegetarian"]),
      dish("Gelato", "dessert", ["vegetarian", "gluten-free"]),
      dish("Italian Soda", "drink", ["vegan", "gluten-free"]),
      dish("Wine", "drink", ["vegan", "gluten-free"]),
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
    ...(d.attributes?.length ? { attributes: d.attributes } : {}),
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
      // Undated presets get a neutral score — always eligible
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
