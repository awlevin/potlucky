// Rotating empty-state copy for the room menu when no dishes are on the list yet.
// Two flavors: one when the viewer is the host (calls them to lead), and one
// for guests (encourages them to bring the first dish to the host's table).
// Voice: warm, food-loving, slightly playful. No emojis.

export const EMPTY_MENU_MESSAGES_HOST = [
  "Empty plates, full possibilities — kick things off with a dish.",
  "Nothing on the menu yet. First dish gets the spotlight.",
  "A blank menu is the best kind of menu. What are you bringing?",
  "Set the tone — drop the first dish on the table.",
  "The menu's wide open. Claim your dish before someone else does.",
  "First dish wins bragging rights. What's it gonna be?",
  "An empty menu is a delicious invitation. Start it off.",
  "No dishes yet — be the one who starts the menu.",
  "The table's set. Now it just needs food.",
  "Crack open the menu with something you love to make.",
  "Nothing here yet. Plant your flag with the opening dish.",
  "The first dish always sets the vibe. Pick a good one.",
  "Empty menu, big appetite. Kick it off.",
];

// {host} is replaced with the host's name (e.g. "Aaron"). Phrasing assumes
// the bare name fits naturally — e.g. "for {host}" → "for Aaron".
export const EMPTY_MENU_MESSAGES_GUEST_WITH_HOST = [
  "Empty plates, full possibilities — be the first to bring something for {host}.",
  "Nothing on the menu yet. Start it off for {host}.",
  "First dish wins bragging rights at {host}'s potluck.",
  "Be the one who starts the menu for {host}.",
  "An empty menu is a delicious invitation — bring something for {host}'s table.",
  "Nobody's claimed a dish for {host} yet. That's your move.",
  "The menu at {host}'s is wide open. Pick something good.",
  "Set the tone for {host}'s potluck with the first dish.",
  "{host}'s table is empty. Time to fill it.",
  "Bring the dish that gets {host}'s potluck rolling.",
  "Be the first to fill {host}'s menu with something tasty.",
  "{host} hasn't seen a dish yet — surprise them with yours.",
];

export const EMPTY_MENU_MESSAGES_GUEST = [
  "Empty plates, full possibilities. Add something delicious.",
  "No dishes yet. Be the one who starts the menu.",
  "First dish wins bragging rights.",
  "An empty menu is a delicious invitation.",
  "The table's set — now it just needs food.",
  "Nothing here yet. Plant your flag with the opening dish.",
  "Set the tone with the first dish.",
  "Empty menu, big appetite. Kick it off.",
  "Be the first to bring something tasty.",
  "Nobody's claimed a dish yet. That's your move.",
  "The menu's wide open. Pick something you love to make.",
  "Crack open the menu with a dish that means something.",
];

function pick<T>(list: readonly T[]): T {
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

/**
 * Returns a random empty-menu prompt tailored to the viewer's role.
 * - Viewer is the host → host-leaning call-to-action.
 * - Viewer is a guest with a known host name → prompt with `{host}` interpolated.
 * - Viewer is a guest with no host name → generic guest prompt.
 */
export function pickEmptyMenuMessage(args: {
  viewerIsHost?: boolean;
  hostName?: string;
}): string {
  if (args.viewerIsHost) {
    return pick(EMPTY_MENU_MESSAGES_HOST);
  }
  if (args.hostName) {
    return pick(EMPTY_MENU_MESSAGES_GUEST_WITH_HOST).replace(
      /\{host\}/g,
      args.hostName,
    );
  }
  return pick(EMPTY_MENU_MESSAGES_GUEST);
}
