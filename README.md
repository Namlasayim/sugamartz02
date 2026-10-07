# Rang Art Gallery

A React/Vite gallery whose public content and admin edits are backed by Supabase.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and add the project URL and anon key.
3. In Supabase SQL Editor, run `supabase/schema.sql`.
4. Create an admin user in Supabase Authentication.
5. Start the app:

```bash
npm install
npm run dev
```

The public gallery is available at `/`. The content manager is at `/admin` and requires the Supabase Auth user created in step 4.

## Dynamic content

`settings` stores the single artist profile row. `paintings` stores all artwork metadata and public ordering. Painting images are uploaded to the public `paintings` Storage bucket and their URLs are stored in `paintings.image_url`.

The public page fetches both tables on load. Admin saves use Supabase mutations, and the page refetches after each save or delete, so changes appear without a redeploy.

Do not put a Supabase service-role key in `.env` or browser code. The current RLS admin policies allow authenticated users; for production, restrict those policies to your admin user or an admin role.
