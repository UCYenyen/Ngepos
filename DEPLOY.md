# Deployment (Docker + GHCR + GitHub Actions)

On every push to `master`, GitHub Actions builds a Docker image, pushes it to the
GitHub Container Registry (GHCR), then SSHes into your VPS and restarts the app.
**All real secrets live only in the `.env` file on your VPS** — they are never
stored in the repo or in GitHub.

## How environment variables are handled

There are two kinds of env vars, and they're handled differently:

| Kind | Examples | Where it lives | Why |
|------|----------|----------------|-----|
| **Public, build-time** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_XENDIT_KEY` | GitHub repo **Variables** | Next.js inlines `NEXT_PUBLIC_*` into the browser bundle at build time. These are public by design (the anon key is sent to every visitor's browser), so they are **not secrets**. |
| **Server, runtime** | `SUPABASE_SERVICE_ROLE_KEY`, `XENDIT_SECRET_KEY`, `RESEND_API_KEY`, `FONNTE_API_KEY`, `SUPABASE_DB_URL`, `CRON_SECRET`, everything else | **`.env` on the VPS only** | Injected into the container at runtime by `docker compose` (`env_file: .env`). Never baked into the image, never sent to GitHub. |

This is exactly what you asked for: your secrets stay in the VPS `.env`, and you
do **not** put them in GitHub repository secrets.

## One-time GitHub setup

In your repo → **Settings → Secrets and variables → Actions**:

**Variables** tab (these are public client config, not secrets):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_XENDIT_KEY`

**Secrets** tab (deploy infrastructure only — no app env here):
- `VPS_HOST` — your server IP/hostname (e.g. `72.62.121.86`)
- `VPS_USER` — SSH user (e.g. `root` or `deploy`)
- `VPS_SSH_KEY` — a private SSH key whose public half is in the VPS's `~/.ssh/authorized_keys`
- `VPS_PORT` — *(optional)* SSH port, defaults to `22`

The workflow deploys into `/var/www/` on the VPS — that's where `docker-compose.yml`
and `.env` must live.

`GITHUB_TOKEN` is provided automatically and is what pushes to GHCR — you don't create it.

## One-time VPS setup

1. Install Docker + the compose plugin:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
2. Create the app directory and drop in two files:
   ```bash
   mkdir -p ~/ngepos && cd ~/ngepos
   # copy this repo's docker-compose.yml here
   # create .env here with ALL your env (the same vars as .env.example)
   ```
   Your `~/ngepos/.env` is the single source of truth for runtime config.
3. The image is private by default. Either:
   - **Make the GHCR package public** (the image contains no server secrets — only
     the public `NEXT_PUBLIC_*` values are baked in), so the VPS can pull freely; or
   - Keep it private and log in once on the VPS with a Personal Access Token that
     has `read:packages`:
     ```bash
     echo "<YOUR_PAT>" | docker login ghcr.io -u UCYenyen --password-stdin
     ```
   (CI deploys log in automatically with `GITHUB_TOKEN`, so the pipeline works
   regardless of this — this step is only for manual `docker compose pull` on the box.)

That's it. Push to `master` and the app deploys.

## Manual operations (on the VPS)

```bash
cd ~/ngepos
docker compose pull          # fetch the latest image from GHCR
docker compose up -d         # (re)start with the current .env
docker compose logs -f web   # tail logs
```

Roll back to a specific build (every commit is tagged `sha-<commit>` in GHCR):
```bash
NGEPOS_IMAGE=ghcr.io/ucyenyen/ngepos:sha-<commit> docker compose up -d
```

## Notes

- The container serves on port **3000**. Put Nginx/Caddy/Traefik in front for TLS,
  or map a different host port in `docker-compose.yml`.
- A health endpoint is exposed at **`/api/health`** (used by the compose healthcheck).
- **Database migrations are not run by the container.** Apply `supabase/migrations/*`
  to your Postgres separately (e.g. `psql "$SUPABASE_DB_URL" -f supabase/migrations/<file>.sql`).
- If a product/QRIS image is ever served from a host other than your Supabase URL,
  add that host to `images.remotePatterns` in `next.config.ts`.
