# TODO / Ideas

## Dish Gallery

A gallery of every dish that's ever been made on Potlucky.

- Each dish has its own page with photos, the potluck(s) it appeared at, and
  who brought it.
- Tie dishes to event types / preset themes (Thanksgiving, Friendsgiving,
  pizza night, etc.) so the gallery can be browsed by occasion.
- Lots of internal linking between `/ideas/<theme>` pages and dish pages —
  e.g. a Thanksgiving idea page lists real photos of pies people actually
  brought; a dish page links back to every theme it shows up under.
- Doubles as a natural prompt to upload a photo once a dish is done. Future
  potluck-goers see real previews instead of generic stock imagery, which
  also helps people decide what to sign up for.
- Open questions: moderation/approval flow for uploads, attribution, how to
  dedupe near-identical dishes ("Aunt Sue's pecan pie" vs "pecan pie").

## AI recommendations should use event title + description

Once we add the event description feature (host-only editable), make sure all
AI-generated output — especially dish recommendations — takes both the event
title and description into account.

- The description gives way better signal about the *vibe* of the event than
  the title alone: is it a professional work function, a slutty/flirty
  cocktail party, a sloppy college drunk thing, an adult/mature dinner,
  kid-friendly, etc.
- Vibe should meaningfully shift recommendations (e.g. elevated small plates
  and wine pairings for a mature dinner vs. jungle juice and chips for a
  college party).
- Audit every place we call the model for suggestions and make sure the
  event title and description are both in the prompt context.

## Host concept — where it can grow later

The initial host feature ships with a quiet mark, share/OG byline, entry
modal variants, and a host tag. Once hosts exist as a concept, these become
obvious next moves:

- **Nudge / reminder authorship.** "Aaron sent a reminder to bring your
  dishes tomorrow" reads social; a generic system reminder reads like spam.
  Route any future notification copy through the host's name.
- **Location defaults.** Remember the host's address from a previous room
  and pre-fill the location field the first time they set it on a new one.
- **Host-only "close the menu."** Let the host flip the room into a locked
  state that greys out new claims and shows an "it's all set — see you
  there ✦" empty-action state.
- **RSVPs without friction.** Guests who don't want to bring a dish can
  still mark "coming." Hosts care about headcount — surface it to them.
- **Clone past menus.** "Throw another one like last spring's" — let hosts
  duplicate their own past rooms, in the same spirit as the preset cards.
- **Host note at top of room.** One optional line from the host ("bring a
  bottle, park on Elm") that renders under the title, in the OG image, and
  in the share text. Tiny surface, outsized warmth.
