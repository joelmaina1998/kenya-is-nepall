# Vercel Deployment

## Dashboard path

1. Open https://vercel.com/new.
2. Import the GitHub repository `joelmaina1998/kenya-is-nepal`.
3. Keep the framework as Next.js and set Root Directory to `artifacts/kenya-is-nepal`.
4. Add these environment-variable names in Vercel's secure UI:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
5. Paste the two Supabase secret values only into Vercel's encrypted environment-variable fields. Do not put them in a file or commit.
6. Deploy and open the generated `.vercel.app` URL.
7. Verify `/setup` and `/admin`.
8. Open Project Settings → Domains and add `kenyaIsNepal.org`.

## CLI alternative

After authenticating the Vercel CLI interactively:

```bash
vercel link --yes --project kenya-is-nepal
vercel --prod
```

Add environment variables with `vercel env add` interactively. Do not pass secret values directly in shell commands or save them in shell history.