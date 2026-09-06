# Deploying kenyaIsNepal.org

This project is a Next.js application backed by Supabase. Add the following
non-secret settings in the deployment environment:

```text
NEXT_PUBLIC_SUPABASE_URL=https://bdgdvukotgrytactwses.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable Supabase key>
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service-role key>
NEXT_PUBLIC_SITE_URL=https://kenyaIsNepal.org
ADMIN_EMAIL=admin@kenyaisnepal.org
```

Never commit `.env.local` or paste a service-role key into a repository,
README, setup page, or client-side code. Configure the server-only key through
Vercel's encrypted environment-variable settings.

## Deploy

1. Run the SQL in `supabase/schema.sql` in the target Supabase project.
2. Create the administrator in Supabase Auth and confirm the account there.
3. Create the public `kenyaisnepal` Storage bucket.
4. Add the environment variables above in Vercel.
5. Import the repository into Vercel using the Next.js framework preset.
6. Open `/setup` after deployment, run the connection test, and then open `/admin`.