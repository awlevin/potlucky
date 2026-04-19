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
