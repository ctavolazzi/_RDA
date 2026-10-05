#!/usr/bin/env python3
"""
yt_stats.py — pull a published video's public metadata + owner analytics from YouTube.

Useful after publishing: check how a video actually performed, or feed a packaging calibration
pass (see .claude/skills/packaging/references/channel-calibration.md).

Two APIs, two different things:
  • Data API      (youtube v3)          → title, publishedAt, duration, views, likes, comments
  • Analytics API (youtubeAnalytics v2) → avg view %, avg view duration, watch time, subs gained

Auth: its own token at core/.youtube/token-analytics.json, with READ-ONLY scopes, so the
upload token (token.json, which holds write scopes) is never touched or invalidated.
One interactive browser consent the first time:

    python tools/yt_stats.py auth

Then:
    python tools/yt_stats.py fetch DTGPI0VVr7Y [--json]

NOTE ON CTR: impressions / impression CTR are NOT exposed by the YouTube Analytics API — they
are YouTube Studio-only, so `ctr` always comes back None and there is no way to automate it.
Everything else is fetched. If you are calibrating /packaging, pull CTR by hand from Studio —
see .claude/skills/packaging/references/channel-calibration.md.

RUN VIA THE VENV PYTHON (google-api-python-client lives there).
"""
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET = YT_DIR / "client_secret.json"
TOKEN = YT_DIR / "token-analytics.json"          # separate from yt_upload's token.json
SCOPES = ["https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/yt-analytics.readonly"]

# Analytics metrics we'd like; impressionClickThroughRate is Studio-only and 400s, so it is not
# requested. Kept here as a comment so nobody "helpfully" re-adds it: impressions, impressionClickThroughRate.
METRICS = "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,subscribersGained"


def get_creds():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    creds = Credentials.from_authorized_user_file(str(TOKEN), SCOPES) if TOKEN.exists() else None
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not CLIENT_SECRET.exists():
            sys.exit(f"missing {CLIENT_SECRET} — see tools/yt_upload_SETUP.md (step 2)")
        creds = InstalledAppFlow.from_client_secrets_file(
            str(CLIENT_SECRET), SCOPES).run_local_server(port=0)
    YT_DIR.mkdir(exist_ok=True)
    TOKEN.write_text(creds.to_json())
    return creds


def _svc(name, version):
    from googleapiclient.discovery import build
    return build(name, version, credentials=get_creds())


def iso8601_to_minutes(dur: str) -> float:
    """PT5M30S -> 5.5"""
    import re
    m = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", dur or "")
    if not m:
        return None
    h, mi, s = (int(x) if x else 0 for x in m.groups())
    return round(h * 60 + mi + s / 60, 1)


def fetch(video_id: str) -> dict:
    from googleapiclient.errors import HttpError

    yt = _svc("youtube", "v3")
    items = yt.videos().list(part="snippet,statistics,contentDetails",
                             id=video_id).execute().get("items", [])
    if not items:
        sys.exit(f"[yt_stats] video {video_id} not found (or not visible to this account)")
    v = items[0]
    sn, st, cd = v["snippet"], v.get("statistics", {}), v["contentDetails"]
    published = sn["publishedAt"]

    out = {
        "videoId": video_id,
        "title": sn["title"],
        "publishedAt": published,
        "durationMin": iso8601_to_minutes(cd.get("duration")),
        "views": int(st["viewCount"]) if "viewCount" in st else None,
        "likes": int(st["likeCount"]) if "likeCount" in st else None,
        "comments": int(st["commentCount"]) if "commentCount" in st else None,
        # analytics-only, filled below
        "avgViewPct": None, "avgViewDurationS": None, "watchTimeH": None,
        "subsGained": None, "ctr": None,  # ctr: Studio-only, never available here
    }

    # Analytics: lifetime = publish date → today. Owner-only; fails cleanly if not the owner.
    import datetime
    start = published[:10]
    end = datetime.date.today().isoformat()
    try:
        ya = _svc("youtubeAnalytics", "v2")
        rows = ya.reports().query(ids="channel==MINE", startDate=start, endDate=end,
                                  metrics=METRICS, filters=f"video=={video_id}").execute()
        if rows.get("rows"):
            cols = [h["name"] for h in rows["columnHeaders"]]
            row = dict(zip(cols, rows["rows"][0]))
            out["avgViewPct"] = round(row.get("averageViewPercentage"), 1) \
                if row.get("averageViewPercentage") is not None else None
            out["avgViewDurationS"] = row.get("averageViewDuration")
            mins = row.get("estimatedMinutesWatched")
            out["watchTimeH"] = round(mins / 60, 1) if mins is not None else None
            out["subsGained"] = row.get("subscribersGained")
    except HttpError as e:
        print(f"[yt_stats] analytics unavailable ({e.status_code}) — public stats only. "
              f"Run `yt_stats.py auth` if you have not consented to the analytics scope.",
              file=sys.stderr)

    return out


def main():
    args = sys.argv[1:]
    if not args or args[0] not in ("auth", "fetch"):
        sys.exit(__doc__)
    if args[0] == "auth":
        get_creds()
        print(f"✓ authorized — token saved to {TOKEN}")
        return
    if len(args) < 2:
        sys.exit("[yt_stats] fetch needs a <videoId>")
    data = fetch(args[1])
    if "--json" in args:
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return
    for k, v in data.items():
        print(f"  {k:<17} {v if v is not None else '—'}")
    if data["ctr"] is None:
        print("\n  note: CTR/impressions are YouTube Studio-only (not in the Analytics API).")


if __name__ == "__main__":
    main()
