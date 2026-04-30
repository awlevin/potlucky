export const FOOTER_TAGLINES = [
  "Made with care for friends who feast together",
  "For tables that get a little louder near dessert",
  "For the ones who linger past the last bite",
  "Built for long dinners and longer stories",
  "A love letter to people who cook for each other",
  "For full tables and fuller hearts",
  "Where every chair pulls up a little closer",
  "For potlucks, picnics, and second helpings",
  "For the cooks, the showers-up, the bread-bringers",
  "Made for nights nobody wants to end",
  "For kitchens that smell like company",
  "For friends who always set one more place",
  "For the slow Sunday kind of hungry",
  "Cooked up for chosen family",
];

export function pickRandomFooterTagline(): string {
  const idx = Math.floor(Math.random() * FOOTER_TAGLINES.length);
  return FOOTER_TAGLINES[idx];
}
