# 🥧 Potlucky

**The friendliest way to plan a potluck.**

Three steps. One feast. Zero spreadsheets.

---

Potlucky is a no-sign-up potluck planner. Start a room, share the link,
watch your friends claim dishes in real time. Everyone shows up hungry,
nobody shows up with a third bowl of pasta salad.

## ✨ What it does

- 🚪 **One-click rooms.** No logins, no accounts. Hit the button, get a
  link like `potlucky.com/potlucks/pumpkin-pleasant-9x2Qk`, and share it.
- 🎃 **Preset menus.** Thanksgiving, Friendsgiving, Cinco de Mayo, pizza
  night — pre-filled menus you can tweak.
- 🍰 **Live dish claiming.** Friends pick what they're bringing. Everyone
  sees updates instantly (Firestore under the hood).
- 🧑‍🍳 **AI sous-chef.** Stuck on what to bring? Claude suggests dishes
  that fit the vibe, plus walks you through a full recipe.
- 🛒 **Auto shopping list.** Every ingredient, combined and checkable.
- 📱 **Looks good on the phone you're holding at the grocery store.**

## 🚀 Getting Started

```bash
yarn install
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) and start a
potluck. That's it. You're done. Go eat.

### Environment

You'll want a `.env.local` with:

- `NEXT_PUBLIC_FIREBASE_*` — Firebase web SDK config (for the realtime
  room state)
- `ANTHROPIC_API_KEY` — for the dish suggestions and recipe wizard

Feature flags (all default off — set to `1` to enable):

- `NEXT_PUBLIC_FEATURE_DISH_GALLERY` — the Dish Gallery / recipe-archive
  feature: `/gallery` + `/gallery/[slug]`, the NavMenu Archive link,
  dish-photo strips on `/ideas/[slug]`, and the post-event upload prompt
  on `/potlucks/[roomId]`.

## 🧰 Under the hood

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Chakra UI v3](https://chakra-ui.com/) + [Framer Motion](https://www.framer.com/motion/)
- [Firestore](https://firebase.google.com/docs/firestore) for realtime room state
- [Anthropic SDK](https://docs.anthropic.com/) powering the sous-chef
- Deployed on [Vercel](https://vercel.com/)

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `yarn dev` | Start the dev server |
| `yarn build` | Build for production |
| `yarn start` | Run the production build |
| `yarn lint` | Lint the codebase |

---

Made with 🧈 and friends.
