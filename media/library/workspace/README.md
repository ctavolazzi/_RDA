# Workspace kit — Hasan's canonical AI-generated workspace

The reusable SET for b-roll across all videos (Shorts factory + long-form inserts). Iterated
during the Block 30 pilot to Hasan's verdicts; **`w3-establishing.png` is the canonical plate.**

**The set is Hasan's REAL room** (derived from his real reference photo in
`media/library/faces/`): grey-blue wall · tall dracaena plant on the left · white wall-mounted
AC unit high on the wall · plain WHITE desk (his desk is white in reality — his note,
2026-08-13) · 24" monitor with a dark orange-accented code editor · plain keyboard, mouse,
phone face down, glass of water, small notebook, charging cable · ordinary office chair ·
soft uneven daylight, lived-in, nothing styled.

| File | Status | What |
|---|---|---|
| `w3-establishing.png` | **CANONICAL** | 16:9 plate of the real-room set, no people. Gemini API (`gen_thumbnail.py`), ref = Hasan's real photo |
| `w2-establishing.jpg` | deprecated | ordinary-room draft, pre-real-photo (wrong wall/desk) |
| `w1-establishing.jpg` | deprecated | first draft — Hasan's verdict: "too impressive", over-styled (fairy lights, curated shelf; mug reads 'EREATOR') |

**How to generate Hasan-in-the-workspace stills (the locked v3 recipe):**
1. Identity anchor = a REAL photo from `media/library/faces/` (never the synthetic
   `ref-vertical.png` alone — one synthetic selfie cannot hold identity through scene
   generations; this was the v2 failure).
2. Refs, in order: real photo (subject) → `w3-establishing.png` (setting) → best prior
   person-still (composition cascade).
3. Wardrobe by prompt (olive green crew-neck tee for the Shorts, matching the cam bursts).
4. Engine: Gemini API via `tools/gen_thumbnail.py --ref a --ref b --ref c --aspect 9:16`.
   The agy skill (`google-sdk-gen-img`) is free on the Ultra sub but FAILS on person-photo
   refs (observed 2026-08-13) — use it only for people-free plates.
