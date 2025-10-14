# EventCompass (Next.js)

This workspace contains a Next.js app (in `eventcompass/`) that implements a mock Compass Chat UI and a simple backend persistence layer for chats using SQLite + Prisma. The app was scaffolded from Create Next App and extended with Prisma for an MVP server-backed chat store.

This README explains how to start the app locally, initialize the SQLite database using Prisma, and where the key files are located.

## Local development â€” quick start

1. Install dependencies

```powershell
cd eventcompass
npm install
```

2. Generate the Prisma client (after any schema change)

```powershell
npx prisma generate
# or
npm run prisma:generate
```

3. Create the SQLite database and run migrations (first time)

```powershell
npx prisma migrate dev --name init
# or
npm run prisma:migrate
```

This will create `prisma/dev.db` (SQLite) and a `prisma/migrations` folder.

4. Start the dev server

```powershell
npm run dev
```

Open http://localhost:3000 in your browser. The app communicates with these API routes for chat persistence:

- `GET /api/chats` â€” list chats with messages
- `POST /api/chats` â€” create a new chat (optionally with initial messages)
- `GET /api/chats/:id/messages` â€” get a single chat with messages
- `POST /api/chats/:id/messages` â€” append messages to a chat

The UI is in `src/components/CompassChat.tsx` and child components.

## Files added / important locations

- `prisma/schema.prisma` – Legacy Prisma schema from the original SQLite prototype (kept for reference).
- `src/lib/supabase/client.ts` – Browser Supabase client built from the public URL + anon key.
- `src/lib/supabase/server.ts` – Helper that hydrates a request-scoped Supabase client using the active cookies/session.
- `src/app/api/chats/route.ts` – API handler (GET/POST) for listing and creating chats against Supabase.
- `src/app/api/chats/[id]/messages/route.ts` – API handler (GET/POST) for retrieving a chat and appending messages against Supabase.
- `src/components` – React UI components that render the mock chat UI (`CompassChat.tsx`, `Topbar.tsx`, `LeftRail.tsx`, `ChatColumn.tsx`, and `CompassChat.module.css`).

## How the data store works

- Chat APIs now read/write the Supabase `chats` table (JSONB `messages` column) via the helpers in `src/lib/supabase`.
- Events APIs also use the Supabase client to query/update data in the `events` and `event_items` tables.

- Appending messages (`POST /api/chats/:id/messages`) creates `Message` rows associated with a chat inside a transaction and returns the updated chat with messages.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


