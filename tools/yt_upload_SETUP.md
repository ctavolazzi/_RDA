# YouTube upload — one-time setup (~10 min)

`yt_upload.py` uploads a short or long-form video from a `publish.json` plan as a **private
draft**; you publish or schedule it in Studio. This setup only has to be done once, and it
needs your browser — so you run it, not the agent.

## 1. Install the client libraries (once)

```
pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
```

## 2. Make a Google Cloud project + enable the API

1. Go to https://console.cloud.google.com/ and create a project (any name, e.g. "lwh-uploader").
2. APIs & Services → **Enable APIs and Services** → search **"YouTube Data API v3"** → Enable.

## 3. OAuth consent screen (once)

1. APIs & Services → **OAuth consent screen** → User type **External** → fill app name + your
   email → Save.
2. **Test users** → add your own Google account (the one that owns the channel). While the app is
   in "Testing" you don't need Google's verification for your own account.
3. Scopes: you can leave default; the tool requests the YouTube scopes at run time.

## 4. Create the OAuth credential

1. APIs & Services → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. Application type: **Desktop app** → Create.
3. **Download JSON** → save it here in the repo as: `.youtube/client_secret.json`
   (create the `.youtube/` folder at the repo root — it's gitignored, never committed).

## 5. Authorize (once)

```
python tools/yt_upload.py auth
```

A browser opens → pick your channel's Google account → allow. A token is saved to
`.youtube/token.json` and reused forever after (auto-refreshes). Confirm it's the right channel:

```
python tools/yt_upload.py whoami
```

## Then, per video

> **Run inside the venv.** The Google libraries are installed in `venv`, not system Python, so
> use `venv\Scripts\python.exe tools/yt_upload.py …` (or activate the venv first). `--dry-run`
> works from any Python since it doesn't import them; the real upload needs the venv.

I author a `publish.json` from the packaging files (title, description, tags, thumbnail), you
review, and either you or I run:

```
python tools/yt_upload.py upload shorts/ch-3-honeypot/publish.json --dry-run   # preview
python tools/yt_upload.py upload shorts/ch-3-honeypot/publish.json             # upload draft
```

It prints a Studio link. Open it, review, hit **Publish** or **Schedule**. Done.

## Notes / limits

- **Draft only, by design.** Uploads land private. Publishing/scheduling public is a click in
  Studio. (An unaudited API project *forces* uploads private anyway; to schedule public straight
  from the API later, the project must pass YouTube's one-time compliance audit — then set
  `"publishAt"` in the plan.)
- **Quota:** standard allocation is 10,000 units/day; an upload costs ~100 units (dropped from
  1,600 on 2025-12-04) → ~100 uploads/day. BUT some new projects start at **0 "Queries per day"**
  (check APIs & Services → YouTube Data API v3 → Quotas). If it's 0, no call works — see the
  troubleshooting note at the bottom.
- **Custom thumbnail** needs a phone-verified channel; if the API thumbnail call is gated for
  Shorts on your account, the tool warns and you set the cover in Studio (upload `ch-N-cover.png`).
- **Shorts vs long:** same command. YouTube classifies a Short by shape (vertical, ≤3 min) — no
  flag needed. `#Shorts` in the description/title helps.

## Troubleshooting — "quotaExceeded" / "Queries per day = 0"

The API is enabled but the project's daily quota is 0, so every call fails. Fixes, fastest first:
1. **Use an older Google Cloud project** if you have one (from past work). Switch the project
   picker to it, enable YouTube Data API v3, create a new OAuth Desktop client there, re-download
   `client_secret.json`, re-run `auth`. Older projects usually have the full 10,000 — check its
   Quotas page shows "Queries per day" = 10,000 first. No audit, works immediately.
2. **Give a brand-new project ~24–48h and recheck** the "Queries per day" value — it sometimes
   populates from 0 to 10,000 on its own.
3. **Submit the YouTube API Services Audit & Quota Extension Form** if it stays 0. This grants the
   10,000 quota AND lifts the unaudited-project private-lock (so you also get direct public
   scheduling). Takes days–weeks.
