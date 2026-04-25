export const RECIPE_LOADING_MESSAGES = [
  "Stirring in the details…",
  "Whisking up something tasty…",
  "Preheating the oven…",
  "Chopping fresh ideas…",
  "Simmering on low…",
  "Folding in the good stuff…",
  "Toasting the spices…",
  "Letting the dough rise…",
  "Setting the table…",
  "Plating it up…",
  "Tasting for seasoning…",
  "Sharpening the knives…",
  "Mise en place…",
  "Reducing the sauce…",
  "Marinating the flavors…",
  "Kneading it together…",
  "Sautéing the aromatics…",
  "Garnishing the plate…",
  "Pulling it from the oven…",
  "Bringing it to a boil…",
  "Sprinkling the magic…",
  "Picking the freshest herbs…",
];

export function pickRandomLoadingMessage(): string {
  const idx = Math.floor(Math.random() * RECIPE_LOADING_MESSAGES.length);
  return RECIPE_LOADING_MESSAGES[idx];
}
