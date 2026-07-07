# Nagrik Mitra

A civic complaint tracking platform that lets citizens submit local issues (category, location, urgency, description) and follow their progress with a unique tracking ID.

**Live demo:** [prompt-proj-xwyh-1b8exrfo2-abhigyat1211s-projects.vercel.app](https://prompt-proj-xwyh-1b8exrfo2-abhigyat1211s-projects.vercel.app/)

## Features

- 📝 Submit complaints with category, location, urgency level, and description
- 🔎 Track complaint status using a generated tracking ID
- ⚡ Real-time backend powered by Supabase (Postgres)
- 🎨 Smooth UI animations via Framer Motion
- 📱 Responsive, modern interface styled with Tailwind CSS

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4, Framer Motion, Lucide Icons |
| Backend / DB | [Supabase](https://supabase.com) (Postgres + Row Level Security) |
| Hosting | Vercel |

## Project Structure

```
.
├── app/            # Next.js App Router pages & routes
├── components/     # Reusable UI components
├── lib/            # Supabase client & shared utilities
├── public/         # Static assets
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Abhigyat1211/Prompt-Proj.git
cd Prompt-Proj
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these in your Supabase project under **Settings → API**.

### 3. Set up the database

Run the following in the Supabase SQL editor to create the `complaints` table with the required Row Level Security policies:

```sql
create table complaints (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  category text,
  location text,
  urgency text,
  status text default 'Submitted',
  description text,
  created_at timestamptz default now()
);

alter table complaints enable row level security;

create policy "Allow anon insert" on complaints
  for insert to anon with check (true);

create policy "Allow anon select" on complaints
  for select to anon using (true);
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

This project is deployed on [Vercel](https://vercel.com). To deploy your own instance:

1. Push this repo to your GitHub account
2. Import it into Vercel
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables under **Project Settings → Environment Variables**
4. Deploy — Vercel will build and host it automatically

## Roadmap / Ideas

- [ ] Admin dashboard for managing complaint statuses
- [ ] Email/SMS notifications on status updates
- [ ] Map view of complaint locations
- [ ] Authentication for municipal staff

## License

Add a license of your choice (e.g. MIT) if you plan to open-source this.
