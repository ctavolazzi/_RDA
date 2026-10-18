# How to make a genuinely engaging current-event video

Written 2026-10-18 for CT: "Carefully consider how to make an actually genuinely engaging video about a current event.
Complete with overlays, fair use footage, cutouts, transitions, interview clips, and more."

This is a plan, not a finished video. It is in four parts: what makes this kind of video work, a worked example on a
real story from this week, the toolkit and rights rules, and where and how it actually gets made (this cloud session
cannot fetch any footage; measured below). Facts about the news are from search results on 2026-10-18 and are marked
"verify on script day": the article pages themselves could not be opened from here.

## The short version

1. **An angle, not a recap.** A recap is a commodity; every outlet has one by the next morning. The video is built
   around one question the headline raises and does not answer, and it answers it.
2. **CT on camera, in his own voice.** For news, trust is the product. A real person with a reason to have an opinion
   (he runs an automation company and teaches AI tools) is the moat, and his commentary is also what makes the
   borrowed footage fair use. The free synthetic narrator is for explainers, not for this.
3. **Original beats borrowed.** Two short interviews he records himself, and his own footage, are worth more than any
   amount of other people's clips. Borrowed footage is the evidence being discussed, never filler.
4. **Receipts on screen.** Every number and claim gets a source tag. When sources disagree, show both. This fits the
   channel's existing look ("With receipts") and is the honest way to do news.
5. **Make it where the footage is.** This container is blocked from every footage host tested; production runs on
   CT's machine with Claude Code, using the same repo and pipeline.

## What makes a current-event video engaging (and what does not)

| Works | Why | Does not work |
| --- | --- | --- |
| A question in the first 10 seconds, answered near the end | An open loop is the main reason people keep watching | "Today we're going to talk about..." |
| A gap between the headline and the truth | Viewers came from the headline; the gap is new information | Repeating the headline at length |
| The strongest moving image first (cold open) | The first seconds decide whether the viewer stays | A logo, an intro, a "hey guys" |
| A change on screen every 3 to 6 seconds, a pattern break every 30 to 45 | Attention resets; each break is a new reason to stay | Long static talking head, or constant random motion |
| Real people saying real things (interviews) | Faces and disagreement are what news is made of | Quoting people in text only |
| Stakes for the viewer ("what this means for you") | Turns news into something useful | Industry news with no "so what" |
| A clear take, labeled as a take | Gives the video a point of view and a reason to comment | Fake neutrality, or opinion presented as fact |
| A payoff that calls back to the cold open | Closes the loop; the ending feels earned | Fading out with "let me know in the comments" |

Length for a news explainer on a new channel: about 6 to 8 minutes. Long enough to go past the headline, short enough
that every beat earns its place. Cut anything that does not move the question forward.

## Picking the event

Score each candidate 1 to 5. A good pick has no 1s.

| Criterion | Question |
| --- | --- |
| Fresh, with a tail | Did it happen in the last 7 days, and will people still search for it in 2 to 4 weeks? |
| A gap to explain | Is there something the headline gets wrong, leaves out, or cannot answer? |
| Visuals exist | Is there footage, product shots, charts, places to show? |
| Standing | Does CT have a real reason to speak about it (automation, robots, AI tools, farming)? |
| Original access | Can he get an interview, a hands-on, or his own footage within 2 days? |
| Sensitivity | Politics, health, a tragedy or a named private person? Then more care, or a different pick |

### Candidates this week (search results, 2026-10-18; verify on script day)

| Story | Gap to explain | Fit | Sensitivity |
| --- | --- | --- | --- |
| **A $2,490 humanoid robot** (Faraday Future / FF EAI Robotics' FF Nova, launched about Oct 15, plus a $299 Nova Mini for kids) | The price is real; reports put it at 49.7 cm tall and 2.8 kg, 100 invitation-only units, no consumer date | Strong: consumer-grade autonomous devices are exactly Johnny Autoseed's subject | Low |
| **How many humanoids were actually shipped?** IDC: about 25,000 in H1 2026, China about 78%. Smart Analytics Global: about 19,100, China over 97% | Two research firms disagree by about 6,000 units and on China's share | Strong, and it pairs with the story above | Low |
| AI-generated midterm campaign ads (NYT: over $137M spent, about 70% unlabeled) | What a label would change, how to spot one | Medium (AI) | High: politics, with the election on Nov 3 |
| Crop robotics shakeout (400 companies tracked, 20% exited since 2024; FIRA USA in Yakima Oct 20 to 22) | Which farm robots survive, and why | Very on-brand, smaller audience | Low |

**Recommendation: the first two together.** "The $2,490 humanoid is real. Here's the catch," with the shipment
numbers as the bigger story behind it. It is fresh, it has a clear gap (the size), it fits the channel, and nothing
about it is sensitive. RoboBusiness is in Santa Clara Oct 20 to 21, a drive from Chico: filming on the floor there would
give original interviews and footage, the strongest possible version. That is CT's call (time, ticket).

## The worked example: "The $2,490 Humanoid Robot Is Real. Here's the Catch."

**The question:** what do you actually get for $2,490, and what does it say about where humanoid robots really are?
**The take (CT's, to be his words):** cheap humanoids are real and useful for learning, and they are not chore robots;
the useful home automation today is narrower and already here.
**Thumbnail:** CT's real face looking down at a tiny robot cutout standing next to a ruler; three words, "THAT'S IT?",
not repeated in the title. Honest because the video shows the size. Checked at 320 px wide.
**Disclosure:** when Johnny Autoseed or FarmBot comes up, CT says on screen that he runs Johnny Autoseed.

| Time | Beat | Picture | Sound |
| --- | --- | --- | --- |
| 0:00 to 0:07 | Cold open | The launch footage's most physical moment (reports say it recovers after being knocked over; use that if the footage shows it), about 5 s, framed with a source tag. Freeze. A price tag "$2,490" slaps on; red pen circles it | Clip's own sound low, never its music; a hit on the tag |
| 0:07 to 0:35 | Hook | CT on camera (cut out over the paper background). "A humanoid robot for $2,490. There's a catch, and it isn't the price." Three real headlines fly in as paper cutouts | Music bed starts low under his voice |
| 0:35 to 1:20 | What launched | Spec card builds line by line (joints, ROS 2, 100 units, invite only), each with a receipt tag; the $299 Nova Mini card | Soft clicks per line |
| 1:20 to 1:50 | The catch | Scale reveal: the robot cutout next to a 1 m ruler and a person's silhouette, settling at 49.7 cm. "It's knee high." | Riser into a hit on the number |
| 1:50 to 3:00 | Why that is still interesting | Interview 1 (a robotics teacher or a small-humanoid owner): what a 50 cm humanoid is good for. Lower third, captions, their own robot on camera | Bed ducked under the interview |
| 3:00 to 4:20 | The bigger story | "25,000 robots shipped in six months. Or 19,100." Two bar charts that disagree, each with its receipt; a map for China's share, 78% against 97%; CT on why counts differ (say "likely" unless a source explains it) | Paper slides between charts |
| 4:20 to 5:40 | Will one do your chores? | A reality board: what runs in homes today (robot vacuums, robot mowers, a FarmBot) against what is still a demo. CT's own FarmBot footage. Interview 2 (a FarmBot owner or a grower) | |
| 5:40 to 6:30 | CT's take | On camera, plainly labeled as his view: what to watch next (RoboBusiness, FIRA, the consumer launch with no date yet) | Bed lifts slightly between points |
| 6:30 to 7:00 | Payoff | Callback: the robot gets up again. "Humanoids can get up off the floor now. The question is when they'll carry anything." End card | Closing hit, bed out |

Every beat changes the picture within 3 to 6 seconds, and every chapter boundary is a pattern break (a paper slide,
a scale reveal, a chart).

## The toolkit, and how each piece gets built

| Element | What it looks like | How we build it | Status |
| --- | --- | --- | --- |
| Host A-roll | CT on camera, sometimes cut out over the paper background | His camera, then `/clean-cut` | Exists |
| Footage, framed | A clip inside a paper or screen frame, punched in on the detail being discussed, with a source tag | Remotion `FramedClip` over the cut, baked with `tools/bake.py` | Build (component) |
| Cutouts | People and robots lifted from stills: white stroke, soft shadow, slight tilt, two-layer parallax; torn-paper edges | `rembg` locally (MIT; installs from PyPI, models from GitHub, both checked reachable here) or Canva's remove-background; a `CutoutLayer` component | Build (`tools/cutout.py`, component) |
| Moving cutouts | CT or a robot cut out of video | A plain or green background when filming; a video matting model (for example RobustVideoMatting) when not | Build, only if needed |
| Overlays | Lower thirds, source receipts, quote cards, price tag, spec cards, red-pen circles and underlines | Remotion, in the RDA look (`remotion/src/lib/rda.tsx`), baked as alpha `.mov` | Kit exists; news pieces to add |
| Scale compare | An object cut out next to a ruler and a silhouette, settling at its real size | Remotion component | Build |
| Charts and maps | Bars that build; a map with one region lit | Remotion; the `dataviz` skill's rules; Natural Earth (public domain) for map shapes | Build |
| Captions | Word-timed, key words in the accent color | Transcript (AssemblyAI in `/clean-cut`) into a captions component | Build (component) |
| Interviews | A card with the guest, name and role lower third, captions; a split screen when two sources disagree | Recorded locally on both ends, then `/clean-cut` | Exists (cut); build (card) |
| Transitions | Only at real boundaries: a paper slide for chapters, a cut on motion, sound that starts before the picture (J-cut) | Remotion and the cut | Partly exists |
| Sound | Voice first; music about 18 dB under it; effects on slams, pens, paper, one riser per reveal | `/suggest-sfx`, style bible section 7, `tools/master_audio.py` (-16 LUFS) | Exists |
| Thumbnail | Real face, one object, three words, checked at 320 px | `/thumbnail` with CT's face kit and a Gemini key, or Canva | Exists |

No glitch transitions under a voice (the brand file: it reads as noise), no random zooms, no stock "whoosh" on every
cut. Motion has to mean something, as in the explainer.

## Interviews

- **Record your own; they are the best part of the video.** Two guests, 15 to 20 minutes each, for 2 or 3 soundbites
  of 8 to 20 seconds. Remote is fine: a tool that records each side locally (Riverside, or Zoom with local recording),
  plus the guest's phone propped up as a backup.
- **Ask for stories and showing, not opinions:** "Show me the robot. What did it do the first day? What surprised
  you? What can't it do? What would you tell someone about to spend $2,490?"
- **Get a signed appearance release** before using anyone's face or voice. A short form is enough.
- **Sourced interview clips** (a company's launch remarks, a public talk) follow the fair use rules below and are
  labeled with who, where and when.
- **Never fabricate.** No AI voice or face of a real person, no reenactment shown as real, no quote that was not said
  as shown. If something is an illustration, it says so on screen.

## Fair use and rights (practical rules, not legal advice)

US fair use weighs four things: the purpose (commentary and criticism count for a lot), the nature of the work, how
much is used, and the effect on the original's market. There is no number of seconds that is automatically safe.

**For every borrowed clip:**

1. It is the thing being talked about, not decoration. Commentary is over it or right after it.
2. Use the shortest length that makes the point; a few seconds is usually enough.
3. Transform it on screen: framed, cropped to the detail, annotated, captioned.
4. Credit it on screen (a source tag) and in the description.
5. Never use the source's music, a whole segment, or the clip as background filler.
6. Log it: source URL, owner, the time range used, its length, and the comment it supports.

**Where footage comes from, best first:**

1. Ours: CT's camera, his FarmBot, screen recordings, interviews with a release.
2. Public domain: works of the US federal government (NASA, USDA and others; check each item's credit).
3. Licensed: Pexels and Pixabay free licenses (Johnny Autoseed already uses Pexels); paid stock for anything key.
4. Creative Commons with attribution (Wikimedia Commons); avoid NonCommercial licenses on a monetized video.
5. Company press kits and media B-roll released for editorial use (read the terms).
6. Short excerpts of company launch videos and social posts, under fair use, following the six rules above.
7. Avoid: TV network news footage, other creators' videos used as B-roll, and any music. These draw automatic claims
   and have the weakest fair use case when used as filler.

**Content ID:** claims are automatic and do not judge fair use. A dispute goes to the claimant; pushing a rejected
dispute to appeal can lead to a takedown request and a copyright strike. So dispute only clips that clearly meet the
six rules, and keep the log, which is the evidence. **AI disclosure:** YouTube asks creators to label realistic
altered or synthetic content; generated illustrations stay obviously illustrations and are labeled.

## Accuracy

- A claims table in the script: every claim, its source, and the date it was checked. Numbers come from the source,
  not from memory or estimate (the repo's rule: nothing estimated is shown as measured).
- Company statements are labeled as the company's claims ("the company says the first under $2,500").
- When sources disagree, show both and say so. That is the IDC versus Smart Analytics beat.
- Check every claim again on publish day; news moves. A correction, if one is needed, goes in a pinned comment and
  the description.

## Where it gets made

Measured in this cloud container on 2026-10-18: the network policy denied every footage host tried (`www.youtube.com`,
`i.ytimg.com`, `upload.wikimedia.org`, `commons.wikimedia.org`, `archive.org`, `images-assets.nasa.gov`,
`www.c-span.org`, `www.whitehouse.gov`, `www.loc.gov`, `www.pexels.com`, `videos.pexels.com`, `pixabay.com`,
`cdn.pixabay.com`). News articles could be searched but not opened. PyPI works (`yt-dlp` 2026.8.19 and `rembg`
2.0.85 downloaded), and GitHub release files work (the `rembg` model answered 206).

So the footage-led steps run on CT's machine, with Claude Code there and this repo: downloading clips, cutting the
A-roll and interviews, and the final render. Overlays, cutouts from stills, captions, sound and the thumbnail can be
built in either place. The other route is widening this environment's network access (the cloud environment menu in the session's title
bar, Edit, Network access) to the hosts above. Raw footage is never committed (`.gitignore` already covers it).

**To build before the first one (in this order):**

1. `tools/fetch_footage.py`: downloads only the time range used (`yt-dlp --download-sections`) and refuses to save a
   clip without a rights log row (URL, owner, range, purpose). The log is `videos/<p>/rights.csv`, committed.
2. `tools/cutout.py`: a still to a cutout PNG with alpha (`rembg`), with an optional white stroke.
3. News pieces for the kit: `FramedClip`, `SourceTag`, `LowerThird`, `QuoteCard`, `PriceTag`, `ScaleCompare`,
   `CutoutLayer`, `SplitScreen`, `ChapterCard`, `Captions`. Each one rendered as a still and read before use.
4. A rights and claims check in the release step: no clip without a log row, no on-screen number without a source.

## Schedule (news has a window)

The launch was about Oct 15. A considered explainer still lands well within about a week.

| Day | Work |
| --- | --- |
| Sun Oct 19 | Pick and angle (CT), title and thumbnail concept, research, claims table, book two interviews, list footage |
| Mon Oct 20 | Interviews (or RoboBusiness), CT's A-roll, FarmBot footage, download and log clips |
| Tue Oct 21 | Clean cut, overlays, cutouts, charts |
| Wed Oct 22 | Sound, thumbnail, claims checked again, master, review |
| Thu Oct 23 | Publish (CT's word) |

## What only CT can do

1. Pick the story and the take. The recommendation above is a recommendation.
2. Be on camera and say it in his own words.
3. Reach two guests, and decide whether to go to RoboBusiness.
4. Approve every claim and publish.

Everything else (packaging, research, claims table, footage list, overlays, cutouts, charts, captions, sound, the
thumbnail build and the checks) can be prepared before he films, so filming day is only filming.
