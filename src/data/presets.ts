import { Food, DietaryRestriction } from "@/types";
import { nanoid } from "nanoid";

export interface PresetDish {
  title: string;
  type: Food["type"];
  attributes?: DietaryRestriction[];
}

export interface PresetMarketing {
  slug: string;
  headline: string;
  subheadline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface PotluckPreset {
  id: string;
  name: string;
  emoji: string;
  date?: string;
  dishes: PresetDish[];
  marketing?: PresetMarketing;
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
    marketing: {
      slug: "cinco-de-mayo-potluck",
      headline: "Cinco de Mayo Potluck Planner",
      subheadline: "Plan a festive Cinco de Mayo potluck in seconds. Share a curated menu of tacos, guac, margaritas and more — then let friends claim dishes with one tap.",
      metaTitle: "Cinco de Mayo Potluck Planner — Free Sign-Up Sheet & Menu Ideas",
      metaDescription: "Free Cinco de Mayo potluck sign-up sheet. 12 curated dishes (tacos, guac, enchiladas, margaritas) with dietary tags. Share a link, claim dishes, no accounts needed.",
      keywords: ["cinco de mayo potluck", "cinco de mayo menu", "taco party sign up", "cinco de mayo food ideas"],
    },
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
    marketing: {
      slug: "mothers-day-brunch-potluck",
      headline: "Mother's Day Brunch Potluck Planner",
      subheadline: "A lovely Mother's Day brunch, organized in a minute. Hand-picked menu of quiche, parfaits, mimosas, and more — everyone signs up for what they'll bring.",
      metaTitle: "Mother's Day Brunch Potluck Sign-Up — Free Planner & Menu",
      metaDescription: "Free Mother's Day brunch potluck sign-up sheet. 11 curated brunch dishes (quiche, eggs benedict, mimosas) with dietary tags. Share a link and claim dishes instantly.",
      keywords: ["mother's day brunch potluck", "mother's day brunch ideas", "brunch sign up sheet", "mother's day menu"],
    },
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
    marketing: {
      slug: "memorial-day-cookout-potluck",
      headline: "Memorial Day Cookout Potluck Planner",
      subheadline: "Kick off summer with a ready-made Memorial Day cookout menu. Share a link, claim dishes, and show up hungry — no spreadsheets required.",
      metaTitle: "Memorial Day Cookout Potluck Sign-Up — Free Planner & Menu",
      metaDescription: "Free Memorial Day cookout potluck sign-up. 12 classic BBQ dishes (burgers, ribs, potato salad, apple pie) with dietary tags. One-click to share with friends.",
      keywords: ["memorial day cookout potluck", "memorial day bbq ideas", "cookout sign up sheet", "summer potluck menu"],
    },
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
    marketing: {
      slug: "4th-of-july-bbq-potluck",
      headline: "4th of July BBQ Potluck Planner",
      subheadline: "Celebrate Independence Day with the easiest BBQ potluck ever. Pre-built menu of hot dogs, sliders, mac & cheese, and red-white-and-blue desserts.",
      metaTitle: "4th of July BBQ Potluck Sign-Up — Free Planner & Menu Ideas",
      metaDescription: "Free 4th of July BBQ potluck sign-up sheet. 12 crowd-favorite dishes (hot dogs, pulled pork, mac & cheese, trifle) with dietary tags. Share, claim, feast.",
      keywords: ["4th of july potluck", "july 4th bbq ideas", "independence day menu", "fourth of july potluck sign up"],
    },
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
    marketing: {
      slug: "halloween-potluck",
      headline: "Halloween Party Potluck Planner",
      subheadline: "Throw a spooky potluck with zero stress. Curated menu of mummy dogs, spider web dip, ghost cookies, and witch's brew punch — share and sign up in seconds.",
      metaTitle: "Halloween Potluck Sign-Up — Free Planner, Spooky Menu Ideas",
      metaDescription: "Free Halloween party potluck sign-up sheet. 12 festive dishes (mummy dogs, spider web dip, candy apples, witch's brew) with dietary tags. Share and claim with one click.",
      keywords: ["halloween potluck", "halloween party food", "spooky potluck menu", "halloween sign up sheet"],
    },
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
    marketing: {
      slug: "thanksgiving-potluck",
      headline: "Thanksgiving Potluck Planner",
      subheadline: "The easiest way to organize a Thanksgiving feast with family and friends. A full menu of turkey, sides, and pies — everyone signs up for what they'll bring.",
      metaTitle: "Thanksgiving Potluck Sign-Up Sheet — Free Planner & Menu",
      metaDescription: "Free Thanksgiving potluck sign-up sheet. 14 classic dishes (turkey, stuffing, mashed potatoes, pies) with dietary tags. Share a link and claim dishes — no accounts.",
      keywords: ["thanksgiving potluck", "thanksgiving potluck sign up sheet", "thanksgiving menu planner", "thanksgiving dinner sign up"],
    },
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
    marketing: {
      slug: "friendsgiving-potluck",
      headline: "Friendsgiving Potluck Planner",
      subheadline: "Friendsgiving, sorted. A crowd-pleasing menu of comfort food — lasagna, mac & cheese, tiramisu — ready to share. Everyone picks a dish, you host the feast.",
      metaTitle: "Friendsgiving Potluck Sign-Up — Free Planner & Food List",
      metaDescription: "Free Friendsgiving potluck sign-up sheet. 12 crowd-pleaser dishes (lasagna, mac & cheese, tiramisu) with dietary tags. Share a link, claim dishes, no accounts.",
      keywords: ["friendsgiving potluck", "friendsgiving food list", "friendsgiving sign up", "friendsgiving menu ideas"],
    },
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
    marketing: {
      slug: "christmas-dinner-potluck",
      headline: "Christmas Dinner Potluck Planner",
      subheadline: "Host a Christmas dinner without the stress. A festive menu of prime rib, scalloped potatoes, yule log, and mulled wine — ready for everyone to sign up.",
      metaTitle: "Christmas Dinner Potluck Sign-Up — Free Planner & Menu Ideas",
      metaDescription: "Free Christmas dinner potluck sign-up sheet. 12 holiday dishes (prime rib, scalloped potatoes, yule log, eggnog) with dietary tags. Share a link and claim dishes.",
      keywords: ["christmas potluck", "christmas dinner sign up", "holiday potluck menu", "christmas dinner ideas"],
    },
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
    marketing: {
      slug: "super-bowl-potluck",
      headline: "Super Bowl Party Potluck Planner",
      subheadline: "Game-day food, zero coordination pain. Curated menu of wings, nachos, sliders, and 7-layer dip — share a link and everyone claims what they're bringing.",
      metaTitle: "Super Bowl Potluck Sign-Up — Free Party Planner & Menu",
      metaDescription: "Free Super Bowl potluck sign-up sheet. 12 game-day dishes (wings, nachos, sliders, chili) with dietary tags. Share a link, friends claim dishes, no app needed.",
      keywords: ["super bowl potluck", "super bowl party food", "game day potluck sign up", "super bowl menu ideas"],
    },
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
    marketing: {
      slug: "plant-based-potluck",
      headline: "Plant-Based Potluck Planner",
      subheadline: "A fully plant-based potluck menu that everyone can enjoy. Curated vegan dishes with dietary tags (gluten-free, nut-free) so nobody is left guessing.",
      metaTitle: "Vegan Potluck Sign-Up — Plant-Based Menu Planner (Free)",
      metaDescription: "Free vegan potluck sign-up sheet. 12 plant-based dishes (mushroom bolognese, chickpea curry, coconut panna cotta) with full dietary tags. Share, claim, eat.",
      keywords: ["vegan potluck", "plant-based potluck menu", "vegan potluck ideas", "plant-based dishes to share"],
    },
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
    marketing: {
      slug: "pizza-night-potluck",
      headline: "Pizza Night Potluck Planner",
      subheadline: "Host an easy pizza night potluck. Pre-built menu of margherita, pepperoni, BBQ chicken, antipasto, cannoli, and more — everyone picks what they bring.",
      metaTitle: "Pizza Night Potluck Sign-Up — Free Menu & Planner",
      metaDescription: "Free pizza night potluck sign-up sheet. 12 Italian favorites (3 pizzas, bruschetta, caprese, cannoli) with dietary tags. Share, claim, buon appetito.",
      keywords: ["pizza night potluck", "pizza party sign up", "italian potluck menu", "pizza potluck ideas"],
    },
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

/** Get a preset by its marketing slug. Returns undefined if not found. */
export function getPresetBySlug(slug: string): PotluckPreset | undefined {
  return presets.find((p) => p.marketing?.slug === slug);
}

/** All presets that have marketing metadata (i.e. have a landing page). */
export function getMarketablePresets(): PotluckPreset[] {
  return presets.filter((p) => p.marketing);
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
