# HGI Bills Tracker

Shared closeout bills tracker for the Harbor Gazebo Improvements project (City of Mandeville Project No. 100.23.002). Built for Oel and Willie to rank, mark, comment on, and print outstanding subcontractor and vendor invoices in real time.

- **Live app:** https://hgi-bills-tracker.fly.dev (after deploy)
- **Hosting:** Fly.io (Docker)
- **Storage:** SQLite on a Fly volume

## What's inside

- `server.js` — Express server with `/api/bills` endpoints and SQLite persistence
- `public/index.html` — single-page UI with drag-to-rank, filter toggle, print button, per-edit attribution
- `Dockerfile` — packaging for Fly
- `fly.toml` — Fly app config with persistent volume mounted at `/data`
- `.github/workflows/fly-deploy.yml` — auto-deploy on push to `main`

## First-time deploy

These steps follow the same pattern as `my-tone-rewriter` (Thinking Booth).

1. Create a new private GitHub repo named `hgi-bills-tracker` under `Roms504318`.
2. Push the contents of this folder to it as the initial commit on `main`.
3. From a terminal with `flyctl` installed and logged in:
   ```
   flyctl launch --no-deploy --copy-config --name hgi-bills-tracker --region dfw
   flyctl volumes create hgi_bills_data --region dfw --size 1
   flyctl deploy
   ```
4. Generate a Fly deploy token scoped to this app and add it as a GitHub Actions secret named `FLY_API_TOKEN` at:
   `https://github.com/Roms504318/hgi-bills-tracker/settings/secrets/actions`
5. Done. Future pushes to `main` auto-deploy.

## How to make changes going forward

Same pattern as Thinking Booth: edit on GitHub, commit to `main`, watch the Actions tab, ~2 minutes later it's live.

Common edits:
- UI / styling / labels: `public/index.html`
- Default bills list, API logic: `server.js`
- Deploy config: `fly.toml`

## Resetting the live data

Hit the "Reset to Default" button in the UI, or call:
```
curl -X POST https://hgi-bills-tracker.fly.dev/api/reset -H "Content-Type: application/json" -d '{"updatedBy":"Oel"}'
```

## Cost

Fly free tier covers this easily (256MB RAM machine that auto-stops when idle). The 1GB volume is $0.15/month if it ever exceeds the free tier.
