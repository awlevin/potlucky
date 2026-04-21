/**
 * Dish Gallery — mock data
 *
 * Temporary fixture data to drive the Dish Gallery UI. Once the feature is
 * productionized this will be replaced by Firestore-backed data. The shapes
 * here are deliberately close to what the real schema will look like so the
 * UI code doesn't have to change when we swap in the real source.
 */

import type { Food } from "@/types";

export type Course = NonNullable<Food["type"]>;
export type Season = "spring" | "summer" | "fall" | "winter";
export type DishPhotoStatus = "approved" | "pending" | "flagged";

export interface DishPhoto {
  id: string;
  /** Unsplash / picsum URL — use the high-quality source variant. */
  src: string;
  alt: string;
  /** Who brought this specific instance. */
  bringer: string;
  bringerInitial: string;
  /** Room slug so we can deep-link back to the potluck it appeared at. */
  potluckSlug: string;
  /** Human-readable name of the potluck. */
  potluckName: string;
  /** ISO date string. */
  date: string;
  caption?: string;
  status: DishPhotoStatus;
  /** Rough palette hint for skeleton backgrounds. */
  accent: string;
}

export interface DishAppearance {
  potluckSlug: string;
  potluckName: string;
  themeSlug?: string;
  themeName?: string;
  date: string;
  bringer: string;
}

export interface GalleryDish {
  slug: string;
  name: string;
  /** Short, warm, one-line. Appears under the hero. */
  tagline: string;
  course: Course;
  /** Dietary tags mirror /src/types DietaryRestriction. */
  tags: string[];
  /** Seasons this dish trends in — drives the season filter. */
  seasons: Season[];
  /** Theme slugs this dish is associated with (`/ideas/<slug>`). */
  themeSlugs: string[];
  /** How many distinct potlucks this dish has appeared at. */
  appearances: number;
  /** Times someone has saved this dish to a potluck they're planning. */
  saves: number;
  /** Photos — first photo is treated as the hero. */
  photos: DishPhoto[];
  /** Every potluck this dish ever appeared at, newest first. */
  history: DishAppearance[];
  /** Dishes that look suspiciously similar — dedupe candidates. */
  dedupeCandidates?: Array<{
    slug: string;
    name: string;
    similarity: number;
  }>;
  /** Who first brought this dish to Potlucky. */
  originalBringer?: string;
  originalPotluckName?: string;
  /** Free-text note — bringer stories, family history. */
  note?: string;
}

/** Small helper to keep URLs readable. */
/**
 * Every ID here has been eyeballed from images.unsplash.com at 220px — they
 * all resolve to food that plausibly matches the dish. Future real data
 * replaces this entirely. Keep the two-letter-prefix id convention so
 * components can hash a bringer-byline seed off `photo.id`.
 */
const unsplash = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Hand-verified Unsplash IDs, grouped by dish.
const PHOTO = {
  pecanPie: [
    "photo-1606890737304-57a1ca8a5b62", // deep chocolate-toned slice
    "photo-1519996409144-56c88c9aa612", // rustic pie-adjacent
    "photo-1601000938259-9e92002320b2", // dessert plate
    "photo-1551024601-bec78aea704b", // dessert
  ],
  lasagna: [
    "photo-1574894709920-11b28e7367e3", // dark saucy stew
    "photo-1594007654729-407eedc4be65", // pasta
  ],
  sweetPotato: [
    "photo-1574672280600-4accfa5b6f98", // casserole
    "photo-1606756790138-261d2b21cd75", // baked side
    "photo-1540189549336-e6e99c3679fe", // plate
  ],
  mash: [
    "photo-1540189549336-e6e99c3679fe", // creamy side
    "photo-1606756790138-261d2b21cd75",
  ],
  burgers: [
    "photo-1568901346375-23c9450c58cd", // smash burger
    "photo-1565958011703-44f9829ba187", // burger
  ],
  margarita: [
    "photo-1514362545857-3bc16c4c7d1b", // margarita with salt
    "photo-1556855810-ac404aa91e85", // cocktail glass
  ],
  salad: [
    "photo-1540420773420-3366772f4999", // salad bowl
    "photo-1512621776951-a57141f2eefd", // salad
  ],
  deviledEggs: [
    "photo-1567620905732-2d1ec7ab7445", // deviled eggs
    "photo-1587132137056-bfbf0166836e", // egg yolks
    "photo-1546833999-b9f581a1996d", // eggs
  ],
  sangria: [
    "photo-1556855810-ac404aa91e85", // generic pretty cocktail (sangria photo rot)
  ],
  carrots: [
    "photo-1598170845058-32b9d6a5da37", // roasted carrots
    "photo-1590779033100-9f60a05a013d", // rainbow veg
  ],
  focaccia: [
    "photo-1519915028121-7d3463d20b13", // warm baked thing
  ],
  greenBean: [
    "photo-1604152135912-04a022e23696", // green bean casserole
  ],
};

// ---------------------------------------------------------------------------
// Dishes
// ---------------------------------------------------------------------------

export const galleryDishes: GalleryDish[] = [
  {
    slug: "aunt-sues-pecan-pie",
    name: "Aunt Sue's Pecan Pie",
    tagline:
      "Bourbon-kissed, always the last slice to go. A Thanksgiving ringer since 2022.",
    course: "dessert",
    tags: ["vegetarian"],
    seasons: ["fall", "winter"],
    themeSlugs: ["thanksgiving-potluck", "friendsgiving-potluck"],
    appearances: 7,
    saves: 142,
    originalBringer: "Sarah Whitfield",
    originalPotluckName: "Whitfield Friendsgiving 2022",
    note:
      "The bourbon is non-negotiable. Sarah's aunt has made this every Thanksgiving since 1987 — the recipe lives on an index card with a coffee ring in the corner.",
    photos: [
      {
        id: "pp-1",
        src: unsplash(PHOTO.pecanPie[0]),
        alt: "Pecan pie brought by Sarah to Friendsgiving 2025",
        bringer: "Sarah Whitfield",
        bringerInitial: "S",
        potluckSlug: "pleasant-pumpkin-a3f9k",
        potluckName: "Friendsgiving at Sarah's",
        date: "2025-11-27",
        caption: "This year's version — I let the bourbon sit a little longer.",
        status: "approved",
        accent: "#8B4513",
      },
      {
        id: "pp-2",
        src: unsplash(PHOTO.pecanPie[1]),
        alt: "Pecan pie brought by Marcus to Thanksgiving 2024",
        bringer: "Marcus Okoye",
        bringerInitial: "M",
        potluckSlug: "cheesy-baked-k2p5x",
        potluckName: "Okoye Family Thanksgiving",
        date: "2024-11-28",
        caption: "Got the recipe from Sarah. Not as good as hers — don't tell.",
        status: "approved",
        accent: "#A0522D",
      },
      {
        id: "pp-3",
        src: unsplash(PHOTO.pecanPie[2]),
        alt: "Pecan pie brought by Priya to Friendsgiving 2023",
        bringer: "Priya Shah",
        bringerInitial: "P",
        potluckSlug: "milky-oily-j8d4w",
        potluckName: "Block Friendsgiving '23",
        date: "2023-11-25",
        status: "approved",
        accent: "#7A3E20",
      },
      {
        id: "pp-4",
        src: unsplash(PHOTO.pecanPie[3]),
        alt: "Pecan pie, close up of the filling",
        bringer: "Sarah Whitfield",
        bringerInitial: "S",
        potluckSlug: "baked-smooth-mq3n7",
        potluckName: "Friendsgiving 2024",
        date: "2024-11-23",
        status: "approved",
        accent: "#6B3410",
      },
    ],
    history: [
      {
        potluckSlug: "pleasant-pumpkin-a3f9k",
        potluckName: "Friendsgiving at Sarah's",
        themeSlug: "friendsgiving-potluck",
        themeName: "Friendsgiving",
        date: "2025-11-27",
        bringer: "Sarah Whitfield",
      },
      {
        potluckSlug: "cheesy-baked-k2p5x",
        potluckName: "Okoye Family Thanksgiving",
        themeSlug: "thanksgiving-potluck",
        themeName: "Thanksgiving",
        date: "2024-11-28",
        bringer: "Marcus Okoye",
      },
      {
        potluckSlug: "baked-smooth-mq3n7",
        potluckName: "Friendsgiving 2024",
        themeSlug: "friendsgiving-potluck",
        themeName: "Friendsgiving",
        date: "2024-11-23",
        bringer: "Sarah Whitfield",
      },
      {
        potluckSlug: "milky-oily-j8d4w",
        potluckName: "Block Friendsgiving '23",
        themeSlug: "friendsgiving-potluck",
        themeName: "Friendsgiving",
        date: "2023-11-25",
        bringer: "Priya Shah",
      },
    ],
    dedupeCandidates: [
      { slug: "pecan-pie-classic", name: "Pecan Pie (Classic)", similarity: 0.92 },
      { slug: "maple-pecan-pie", name: "Maple Pecan Pie", similarity: 0.74 },
    ],
  },
  {
    slug: "nonnas-lasagna",
    name: "Nonna's Sunday Lasagna",
    tagline: "Six layers. Three cheeses. Worth the hour you'll spend in line.",
    course: "main",
    tags: ["vegetarian"],
    seasons: ["fall", "winter"],
    themeSlugs: ["italian-night", "birthday-potluck"],
    appearances: 5,
    saves: 98,
    originalBringer: "Luca Ricci",
    originalPotluckName: "Ricci Birthday Dinner",
    photos: [
      {
        id: "ln-1",
        src: unsplash(PHOTO.lasagna[0]),
        alt: "Lasagna bubbling out of the oven",
        bringer: "Luca Ricci",
        bringerInitial: "L",
        potluckSlug: "oily-plump-t4b2q",
        potluckName: "Ricci Birthday 2025",
        date: "2025-03-14",
        caption: "Nonna would approve. (She wouldn't.)",
        status: "approved",
        accent: "#C8442C",
      },
      {
        id: "ln-2",
        src: unsplash(PHOTO.lasagna[1]),
        alt: "Slice of lasagna on a plate",
        bringer: "Elena Moretti",
        bringerInitial: "E",
        potluckSlug: "smooth-baked-p9w3x",
        potluckName: "Italian Night at Elena's",
        date: "2025-01-18",
        status: "approved",
        accent: "#B8391E",
      },
    ],
    history: [
      {
        potluckSlug: "oily-plump-t4b2q",
        potluckName: "Ricci Birthday 2025",
        themeSlug: "birthday-potluck",
        themeName: "Birthday",
        date: "2025-03-14",
        bringer: "Luca Ricci",
      },
      {
        potluckSlug: "smooth-baked-p9w3x",
        potluckName: "Italian Night at Elena's",
        themeSlug: "italian-night",
        themeName: "Italian Night",
        date: "2025-01-18",
        bringer: "Elena Moretti",
      },
    ],
  },
  {
    slug: "sweet-potato-casserole",
    name: "Sweet Potato Casserole",
    tagline: "Marshmallow top, toasted within an inch of its life. Thanksgiving non-negotiable.",
    course: "side",
    tags: ["vegetarian", "gluten-free"],
    seasons: ["fall", "winter"],
    themeSlugs: ["thanksgiving-potluck", "friendsgiving-potluck"],
    appearances: 9,
    saves: 201,
    photos: [
      {
        id: "sp-1",
        src: unsplash(PHOTO.sweetPotato[0]),
        alt: "Sweet potato casserole with toasted marshmallows",
        bringer: "Jordan Park",
        bringerInitial: "J",
        potluckSlug: "plump-cheesy-r5n8v",
        potluckName: "Park Thanksgiving",
        date: "2025-11-27",
        status: "approved",
        accent: "#D17836",
      },
      {
        id: "sp-2",
        src: unsplash(PHOTO.sweetPotato[1]),
        alt: "Sweet potato casserole close-up",
        bringer: "Chloe Nguyen",
        bringerInitial: "C",
        potluckSlug: "baked-cheesy-f7m3q",
        potluckName: "Friendsgiving '24",
        date: "2024-11-23",
        status: "approved",
        accent: "#E09040",
      },
      {
        id: "sp-3",
        src: unsplash(PHOTO.sweetPotato[2]),
        alt: "Sweet potato casserole baked",
        bringer: "Devon Rivers",
        bringerInitial: "D",
        potluckSlug: "pumpkin-smooth-g2t9c",
        potluckName: "Rivers Thanksgiving",
        date: "2023-11-23",
        status: "approved",
        accent: "#BA6020",
      },
    ],
    history: [
      {
        potluckSlug: "plump-cheesy-r5n8v",
        potluckName: "Park Thanksgiving",
        themeSlug: "thanksgiving-potluck",
        themeName: "Thanksgiving",
        date: "2025-11-27",
        bringer: "Jordan Park",
      },
      {
        potluckSlug: "baked-cheesy-f7m3q",
        potluckName: "Friendsgiving '24",
        themeSlug: "friendsgiving-potluck",
        themeName: "Friendsgiving",
        date: "2024-11-23",
        bringer: "Chloe Nguyen",
      },
      {
        potluckSlug: "pumpkin-smooth-g2t9c",
        potluckName: "Rivers Thanksgiving",
        themeSlug: "thanksgiving-potluck",
        themeName: "Thanksgiving",
        date: "2023-11-23",
        bringer: "Devon Rivers",
      },
    ],
  },
  {
    slug: "brown-butter-mashed-potatoes",
    name: "Brown Butter Mashed Potatoes",
    tagline: "More butter than is reasonable. Thank us later.",
    course: "side",
    tags: ["vegetarian", "gluten-free"],
    seasons: ["fall", "winter"],
    themeSlugs: ["thanksgiving-potluck", "friendsgiving-potluck"],
    appearances: 4,
    saves: 67,
    photos: [
      {
        id: "mp-1",
        src: unsplash(PHOTO.mash[0]),
        alt: "Brown butter mashed potatoes in a cast-iron skillet",
        bringer: "Theo Blackwood",
        bringerInitial: "T",
        potluckSlug: "oily-plump-t4b2q",
        potluckName: "Ricci Birthday 2025",
        date: "2025-03-14",
        status: "approved",
        accent: "#E8C070",
      },
    ],
    history: [
      {
        potluckSlug: "oily-plump-t4b2q",
        potluckName: "Ricci Birthday 2025",
        date: "2025-03-14",
        bringer: "Theo Blackwood",
      },
    ],
  },
  {
    slug: "smash-burgers",
    name: "Cast-Iron Smash Burgers",
    tagline: "Thin, lacy-edged, American-cheese-melted. The cookout anchor.",
    course: "main",
    tags: [],
    seasons: ["summer"],
    themeSlugs: ["memorial-day-cookout-potluck", "july-4th-potluck"],
    appearances: 6,
    saves: 118,
    photos: [
      {
        id: "sb-1",
        src: unsplash(PHOTO.burgers[0]),
        alt: "Smash burger with American cheese",
        bringer: "Andre Watts",
        bringerInitial: "A",
        potluckSlug: "pumpkin-oily-h9k2m",
        potluckName: "Memorial Day Cookout '25",
        date: "2025-05-25",
        status: "approved",
        accent: "#8B2500",
      },
      {
        id: "sb-2",
        src: unsplash(PHOTO.burgers[1]),
        alt: "Double smash burger close-up",
        bringer: "Mia Chen",
        bringerInitial: "M",
        potluckSlug: "smooth-cheesy-d3x7p",
        potluckName: "July 4th at Mia's",
        date: "2025-07-04",
        status: "approved",
        accent: "#A23810",
      },
    ],
    history: [
      {
        potluckSlug: "pumpkin-oily-h9k2m",
        potluckName: "Memorial Day Cookout '25",
        themeSlug: "memorial-day-cookout-potluck",
        themeName: "Memorial Day",
        date: "2025-05-25",
        bringer: "Andre Watts",
      },
      {
        potluckSlug: "smooth-cheesy-d3x7p",
        potluckName: "July 4th at Mia's",
        themeSlug: "july-4th-potluck",
        themeName: "July 4th",
        date: "2025-07-04",
        bringer: "Mia Chen",
      },
    ],
  },
  {
    slug: "margarita-pitcher",
    name: "Spicy Margarita Pitcher",
    tagline: "Fresh lime, jalapeño-infused tequila, a fat salt rim.",
    course: "drink",
    tags: ["vegan", "gluten-free"],
    seasons: ["spring", "summer"],
    themeSlugs: ["cinco-de-mayo-potluck"],
    appearances: 4,
    saves: 89,
    photos: [
      {
        id: "mg-1",
        src: unsplash(PHOTO.margarita[0]),
        alt: "Spicy margarita with a salt rim",
        bringer: "Paulo Ferreira",
        bringerInitial: "P",
        potluckSlug: "cheesy-milky-q8w2n",
        potluckName: "Cinco de Mayo Block Party",
        date: "2025-05-05",
        status: "approved",
        accent: "#B4D038",
      },
      {
        id: "mg-2",
        src: unsplash(PHOTO.margarita[1]),
        alt: "Pitcher of margaritas",
        bringer: "Naomi Clarke",
        bringerInitial: "N",
        potluckSlug: "plump-baked-j4m6r",
        potluckName: "Cinco at Naomi's",
        date: "2024-05-05",
        status: "approved",
        accent: "#9FBE30",
      },
    ],
    history: [
      {
        potluckSlug: "cheesy-milky-q8w2n",
        potluckName: "Cinco de Mayo Block Party",
        themeSlug: "cinco-de-mayo-potluck",
        themeName: "Cinco de Mayo",
        date: "2025-05-05",
        bringer: "Paulo Ferreira",
      },
      {
        potluckSlug: "plump-baked-j4m6r",
        potluckName: "Cinco at Naomi's",
        themeSlug: "cinco-de-mayo-potluck",
        themeName: "Cinco de Mayo",
        date: "2024-05-05",
        bringer: "Naomi Clarke",
      },
    ],
  },
  {
    slug: "kale-caesar",
    name: "Kale Caesar with Sourdough Croutons",
    tagline: "Massaged lacinato, anchovy-forward dressing, hand-torn croutons.",
    course: "side",
    tags: ["vegetarian"],
    seasons: ["spring", "summer", "fall"],
    themeSlugs: ["italian-night", "dinner-party"],
    appearances: 3,
    saves: 44,
    photos: [
      {
        id: "kc-1",
        src: unsplash(PHOTO.salad[0]),
        alt: "Kale Caesar salad in a wooden bowl",
        bringer: "Iris Holloway",
        bringerInitial: "I",
        potluckSlug: "smooth-baked-p9w3x",
        potluckName: "Italian Night at Elena's",
        date: "2025-01-18",
        status: "approved",
        accent: "#4A6B2E",
      },
    ],
    history: [
      {
        potluckSlug: "smooth-baked-p9w3x",
        potluckName: "Italian Night at Elena's",
        themeSlug: "italian-night",
        themeName: "Italian Night",
        date: "2025-01-18",
        bringer: "Iris Holloway",
      },
    ],
  },
  {
    slug: "deviled-eggs",
    name: "Smoky Paprika Deviled Eggs",
    tagline: "The first thing to disappear at every potluck since 2021.",
    course: "appetizer",
    tags: ["vegetarian", "gluten-free"],
    seasons: ["spring", "summer", "fall", "winter"],
    themeSlugs: ["thanksgiving-potluck", "memorial-day-cookout-potluck", "friendsgiving-potluck"],
    appearances: 11,
    saves: 176,
    photos: [
      {
        id: "de-1",
        src: unsplash(PHOTO.deviledEggs[0]),
        alt: "Deviled eggs with smoked paprika",
        bringer: "Quinn Delgado",
        bringerInitial: "Q",
        potluckSlug: "baked-cheesy-f7m3q",
        potluckName: "Friendsgiving '24",
        date: "2024-11-23",
        status: "approved",
        accent: "#E6B84C",
      },
      {
        id: "de-2",
        src: unsplash(PHOTO.deviledEggs[1]),
        alt: "Platter of deviled eggs",
        bringer: "Rhea Kapoor",
        bringerInitial: "R",
        potluckSlug: "pumpkin-oily-h9k2m",
        potluckName: "Memorial Day Cookout '25",
        date: "2025-05-25",
        status: "approved",
        accent: "#D4A035",
      },
      {
        id: "de-3",
        src: unsplash(PHOTO.deviledEggs[2]),
        alt: "Deviled eggs arranged on a slate platter",
        bringer: "Sam Okafor",
        bringerInitial: "S",
        potluckSlug: "cheesy-baked-k2p5x",
        potluckName: "Okoye Family Thanksgiving",
        date: "2024-11-28",
        status: "approved",
        accent: "#C48A28",
      },
    ],
    history: [
      {
        potluckSlug: "baked-cheesy-f7m3q",
        potluckName: "Friendsgiving '24",
        themeSlug: "friendsgiving-potluck",
        themeName: "Friendsgiving",
        date: "2024-11-23",
        bringer: "Quinn Delgado",
      },
      {
        potluckSlug: "pumpkin-oily-h9k2m",
        potluckName: "Memorial Day Cookout '25",
        themeSlug: "memorial-day-cookout-potluck",
        themeName: "Memorial Day",
        date: "2025-05-25",
        bringer: "Rhea Kapoor",
      },
      {
        potluckSlug: "cheesy-baked-k2p5x",
        potluckName: "Okoye Family Thanksgiving",
        themeSlug: "thanksgiving-potluck",
        themeName: "Thanksgiving",
        date: "2024-11-28",
        bringer: "Sam Okafor",
      },
    ],
  },
  {
    slug: "apple-cider-sangria",
    name: "Apple Cider Sangria",
    tagline: "Cinnamon sticks, pink lady apples, a whole bottle of rosé.",
    course: "drink",
    tags: ["vegan", "gluten-free"],
    seasons: ["fall"],
    themeSlugs: ["friendsgiving-potluck", "thanksgiving-potluck"],
    appearances: 3,
    saves: 52,
    photos: [
      {
        id: "cs-1",
        src: unsplash(PHOTO.sangria[0]),
        alt: "Apple cider sangria in a glass pitcher",
        bringer: "Lea Tremblay",
        bringerInitial: "L",
        potluckSlug: "pleasant-pumpkin-a3f9k",
        potluckName: "Friendsgiving at Sarah's",
        date: "2025-11-27",
        status: "approved",
        accent: "#B8572E",
      },
    ],
    history: [
      {
        potluckSlug: "pleasant-pumpkin-a3f9k",
        potluckName: "Friendsgiving at Sarah's",
        themeSlug: "friendsgiving-potluck",
        themeName: "Friendsgiving",
        date: "2025-11-27",
        bringer: "Lea Tremblay",
      },
    ],
  },
  {
    slug: "honey-roasted-carrots",
    name: "Honey-Roasted Rainbow Carrots",
    tagline: "Thyme, flake salt, a drizzle of chili-honey. Sleeper hit.",
    course: "side",
    tags: ["vegetarian", "gluten-free"],
    seasons: ["spring", "fall", "winter"],
    themeSlugs: ["easter-potluck", "thanksgiving-potluck"],
    appearances: 4,
    saves: 61,
    photos: [
      {
        id: "hc-1",
        src: unsplash(PHOTO.carrots[0]),
        alt: "Honey-roasted rainbow carrots on a sheet pan",
        bringer: "Yusuf Amari",
        bringerInitial: "Y",
        potluckSlug: "plump-cheesy-r5n8v",
        potluckName: "Park Thanksgiving",
        date: "2025-11-27",
        status: "approved",
        accent: "#D97B2E",
      },
      {
        id: "hc-2",
        src: unsplash(PHOTO.carrots[1]),
        alt: "Rainbow carrots served family-style",
        bringer: "Harper Lindqvist",
        bringerInitial: "H",
        potluckSlug: "smooth-pleasant-c2n5x",
        potluckName: "Easter at Harper's",
        date: "2025-04-20",
        status: "approved",
        accent: "#C56A1E",
      },
    ],
    history: [
      {
        potluckSlug: "plump-cheesy-r5n8v",
        potluckName: "Park Thanksgiving",
        themeSlug: "thanksgiving-potluck",
        themeName: "Thanksgiving",
        date: "2025-11-27",
        bringer: "Yusuf Amari",
      },
      {
        potluckSlug: "smooth-pleasant-c2n5x",
        potluckName: "Easter at Harper's",
        themeSlug: "easter-potluck",
        themeName: "Easter",
        date: "2025-04-20",
        bringer: "Harper Lindqvist",
      },
    ],
  },
  {
    slug: "focaccia",
    name: "Rosemary Sea-Salt Focaccia",
    tagline: "Dimpled, golden, still warm from the oven.",
    course: "appetizer",
    tags: ["vegan"],
    seasons: ["spring", "summer", "fall", "winter"],
    themeSlugs: ["italian-night", "dinner-party"],
    appearances: 5,
    saves: 73,
    photos: [
      {
        id: "fc-1",
        src: unsplash(PHOTO.focaccia[0]),
        alt: "Rosemary focaccia on parchment",
        bringer: "Elena Moretti",
        bringerInitial: "E",
        potluckSlug: "smooth-baked-p9w3x",
        potluckName: "Italian Night at Elena's",
        date: "2025-01-18",
        status: "approved",
        accent: "#D9A848",
      },
    ],
    history: [
      {
        potluckSlug: "smooth-baked-p9w3x",
        potluckName: "Italian Night at Elena's",
        themeSlug: "italian-night",
        themeName: "Italian Night",
        date: "2025-01-18",
        bringer: "Elena Moretti",
      },
    ],
  },
  {
    slug: "green-bean-casserole",
    name: "Green Bean Casserole",
    tagline: "Crispy onions on top. You know the one.",
    course: "side",
    tags: ["vegetarian"],
    seasons: ["fall", "winter"],
    themeSlugs: ["thanksgiving-potluck"],
    appearances: 4,
    saves: 39,
    photos: [
      {
        id: "gb-1",
        src: unsplash(PHOTO.greenBean[0]),
        alt: "Green bean casserole with crispy onions",
        bringer: "Mack Jensen",
        bringerInitial: "M",
        potluckSlug: "cheesy-baked-k2p5x",
        potluckName: "Okoye Family Thanksgiving",
        date: "2024-11-28",
        status: "approved",
        accent: "#6B7F3A",
      },
    ],
    history: [
      {
        potluckSlug: "cheesy-baked-k2p5x",
        potluckName: "Okoye Family Thanksgiving",
        themeSlug: "thanksgiving-potluck",
        themeName: "Thanksgiving",
        date: "2024-11-28",
        bringer: "Mack Jensen",
      },
    ],
  },
];

export const COURSE_ORDER: Course[] = [
  "appetizer",
  "main",
  "side",
  "dessert",
  "drink",
];

export const COURSE_LABEL: Record<Course, string> = {
  appetizer: "Starters",
  main: "Mains",
  side: "Sides",
  dessert: "Sweets",
  drink: "Drinks",
};

export const COURSE_EMOJI: Record<Course, string> = {
  appetizer: "🥟",
  main: "🍽️",
  side: "🥗",
  dessert: "🍰",
  drink: "🥤",
};

export const SEASON_LABEL: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Autumn",
  winter: "Winter",
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getDishBySlug(slug: string): GalleryDish | undefined {
  return galleryDishes.find((d) => d.slug === slug);
}

/** Dishes that have appeared at a given theme slug, newest-photo-first. */
export function getDishesForTheme(themeSlug: string): GalleryDish[] {
  return galleryDishes
    .filter((d) => d.themeSlugs.includes(themeSlug))
    .sort((a, b) => b.appearances - a.appearances);
}

/** Helper for the theme-page photo strip: flat list of photos for a dish. */
export function getDishPhotosForTheme(
  dishTitle: string,
  themeSlug: string,
): DishPhoto[] {
  const dish = galleryDishes.find(
    (d) =>
      d.themeSlugs.includes(themeSlug) &&
      fuzzyMatchDishName(d.name, dishTitle),
  );
  return dish?.photos ?? [];
}

/** Loose match — lowercased, punctuation-stripped, all words overlap. */
export function fuzzyMatchDishName(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
  const aw = norm(a);
  const bw = norm(b);
  const overlap = aw.filter((w) => bw.includes(w)).length;
  return overlap >= Math.min(aw.length, bw.length, 2);
}

/** For the gallery hero collage — 6 photos, mixed courses. */
export function getHeroCollagePhotos(): DishPhoto[] {
  const picks: DishPhoto[] = [];
  const seenDishes = new Set<string>();
  for (const d of galleryDishes) {
    if (seenDishes.has(d.slug)) continue;
    if (d.photos.length === 0) continue;
    picks.push(d.photos[0]);
    seenDishes.add(d.slug);
    if (picks.length >= 6) break;
  }
  return picks;
}
