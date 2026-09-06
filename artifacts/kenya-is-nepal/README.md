# kenyaIsNepal.org

**Two civilizations, one family.** A full-stack humanitarian donation platform from the East African Youth Solidarity Initiative in Kipsaraman, West Pokot Border, standing with Nepal.

## What is included

- Next.js App Router with TypeScript and Tailwind CSS
- Supabase Postgres persistence for donations, prayers, comments, uploads, updates, configuration, and admin logs
- Supabase Storage uploads for gallery images, receipts, and transparency documents
- Supabase Auth admin sign-in at `/admin`
- Server-side admin checks, RLS policies, M-Pesa code validation and uniqueness, rate limiting, moderation, stats, CSV export, and public transparency pages
- Responsive parchment/editorial design across Home, Our Story, Field Updates, Gallery, Transparency, Community, and Admin

## Supabase setup

1. In the Supabase SQL editor for the connected project, run the complete [`supabase/schema.sql`](./supabase/schema.sql) file. It creates the tables, indexes, RLS policies, default config row, and public `kenyaisnepal` Storage bucket.
2. Create the admin user in Supabase Auth with the email configured as `ADMIN_EMAIL` (default: `admin@kenyaisnepal.org`). Set a strong password and enable email confirmation according to your project policy.
3. Add these workspace/Vercel variables:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=https://kenyaIsNepal.org
   ADMIN_EMAIL=admin@kenyaisnepal.org
   ```

   `NEXT_PUBLIC_SUPABASE_URL` must be the full project URL, not a database connection string, dashboard URL, or project reference by itself. Never commit or paste the service-role key into source code.

4. Sign into `/admin` and fill in the verified payment identifiers, goal, contact details, and home statement before publishing donation instructions.

## Local development

```bash
pnpm install
pnpm --filter @workspace/kenya-is-nepal run dev
```

The app uses the managed `PORT` value. Do not add Supabase credentials to the repository; use Replit Secrets for development and Vercel environment variables for Preview/Production.

## Deploy on Vercel

1. Import the repository into Vercel.
2. Set the variables above for Preview and Production.
3. Use the standard Next.js build command (`pnpm --filter @workspace/kenya-is-nepal run build`) and start command (`pnpm --filter @workspace/kenya-is-nepal run serve`).
4. Connect the `kenyaIsNepal.org` domain in Vercel.
5. After deployment, test `/`, `/community`, `/admin`, a donation submission, an admin verification, and a Storage upload.

The frontend uses no localStorage as its source of truth. Public content is read from Supabase; new donations, prayers, and comments remain unverified/unapproved until the admin reviews them.