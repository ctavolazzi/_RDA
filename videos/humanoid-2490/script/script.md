# The $2,490 humanoid robot: script

Made with the `script-to-render` skill, following `docs/current-event-video.md`. CT, 2026-10-18: "Carefully consider
how to make an actually genuinely engaging video about a current event", then "Give it a shot".

## Brief

For: the channel; a news explainer on this month's cheapest humanoid robot and the bigger story behind it.
Viewer: curious about robots and AI, not an engineer; saw a "$2,490 humanoid" headline.
Length: about two and a half minutes, set by the measured narration. 1920x1080, 30 fps.
Narrator: a scratch voice (Kokoro `af_heart`, free and local, `tools/narrate.py`). Every `Voice:` line below is written
so CT can record it in his own voice later; his clips replace the scratch ones with no other change.
Music: three acts, one library track each (they are 63 s): `docu-pluck` (the product), `tech-pulse` (the numbers),
`cinematic-min` (what it means). Under the voice.
What is real: every number and quote is from the sources table, as reported. No borrowed footage or photos: this
container is blocked from every footage host (see `docs/current-event-video.md`). The robot and the person are
diagrams drawn to scale and labeled as diagrams. Headlines are typeset from their exact titles, with the outlet named.
Not in this cut, and why: launch footage, CT on camera, and interviews. They need CT's machine and CT. The slots
where they go are listed at the end.
Thumbnail hook (not in the title): "THAT'S IT?" next to the robot at real scale.
Disclosure: CT runs Johnny Autoseed, which works with FarmBot; S9 names FarmBot, so S9 says so on screen.

## Claims and sources

Checked 2026-10-18 through search results; the article pages could not be opened from this container. Each claim
had at least two outlets agreeing, except where noted. Re-check on publish day.

| Claim | Source | Note |
| --- | --- | --- |
| FF Nova, $2,490; launched mid-October 2026 by Faraday Future and FF EAI Robotics | TNW; Unite.AI; humanoid.guide; StreetInsider; Runtime Wire | One outlet says Oct 14, the rest Oct 15: say "mid-October" |
| 20 degrees of freedom (2 head, 6 arms, 12 legs); walks, waves, gets back up after being knocked over | Product page, via Unite.AI; humanoid.guide | |
| Supports ROS 2 | Unite.AI; TNW | |
| First 100 units, invitation only, developers and schools | TNW; Unite.AI | |
| Nova Mini for children, $299 | TNW; TechEdge AI; Diario Bitcoin | |
| 49.7 cm tall, 2.8 kg | Product page, via Unite.AI; humanoid.guide | |
| A US gallon of milk weighs about 3.9 kg | 3.785 L x about 1.03 kg/L | Arithmetic |
| H1 2026 shipments: Smart Analytics Global about 19,100 | Bloomberg via Yahoo Finance; TechNode | Aug 2026 |
| H1 2026 shipments: Counterpoint over 22,000 | Counterpoint Research's own release | Aug 19 to 20, 2026 |
| H1 2026 shipments: IDC nearly 25,000 | Forbes; Robotics and Automation News; Humanoids Daily | Sep 30 to Oct 2, 2026 |
| IDC: research and education, performance and display, government data-collection centers were 69% of H1 shipments | BigGo Finance; nai500 | Secondary write-ups only; IDC's own release not found |
| Smart Analytics Global: industrial and commercial over 70% of shipments | Bloomberg via Yahoo Finance | Quote from SAG's founder |
| China: about 78% bought by Chinese customers; over 95% built by Chinese vendors (IDC data) | Forbes; KuCoin | SAG: over 97% built by Chinese makers |
| Full-year forecasts: Counterpoint over 50,000; SAG about 60,000 | Counterpoint; Bloomberg via Yahoo Finance | |

Headlines shown in S1 (exact titles): "Faraday Future unveils a $2,490 humanoid robot for developers and schools" (TNW);
"FFR prices Nova at $2,490 and caps its first run at 100 robots" (Runtime Wire); "FF EAI Robotics launches humanoid
robot at $2,490, acquires FF assets" (StreetInsider).

## Script

### S1 Cold open
On screen: a paper card, "Humanoid robot". A price tag, "$2,490", slaps onto it; red pen circles the price. Three real
headlines arrive as paper cutouts, each with its outlet.
Voice: A humanoid robot, for under twenty-five hundred dollars.
Voice: It launched in mid-October, and every headline led with the price.

### S2 Hook
On screen: "There's a catch." Then three totals, each with a question mark: 19,100? 22,000? 25,000?
Voice: There's a catch.
Voice: And behind it is a bigger story: the firms that count these robots can't agree on how many there are, or what they're for.

### S3 What launched
On screen: eyebrow "What launched"; headline "FF Nova". One line per sentence: 20 joints (2 head, 6 arms, 12 legs);
walks, waves, gets back up; runs ROS 2; first 100, invitation only; Nova Mini for kids, $299. Source tag.
Voice: It's called FF Nova, from Faraday Future, the electric car company, and its robotics sister company.
Voice: It has twenty joints. It walks, it waves, and it gets back up after being knocked over.
Voice: It runs ROS 2, a widely used robotics framework.
Voice: The first hundred units are invitation only, for developers and schools.
Voice: And a kids' version, Nova Mini, costs two hundred and ninety-nine dollars.

### S4 The catch
On screen: a ruler; a 175 cm adult (diagram); the robot (diagram) rising to its real height, 49.7 cm, level with the
knee. Then 2.8 kg against a gallon of milk, about 3.9 kg. Label: diagrams, to scale.
Voice: Here's the catch.
Voice: It's forty-nine point seven centimeters tall. About knee high.
Voice: And it weighs two point eight kilos. Less than a gallon of milk.

### S5 Who it's for
On screen: "Built for": classrooms, developers (checked). "Not built for": your kitchen (struck through in red pen).
Voice: That doesn't make it a gimmick.
Voice: A small robot that can fall over and get back up is a good way to learn robotics.
Voice: It's priced for classrooms and developers. Not for your kitchen.

### S6 How many
On screen: a chapter slide, "The bigger story". Three bars build, each with its firm and date: about 19,100; over
22,000; nearly 25,000. A bracket: about 5,900 apart.
Voice: Now, the bigger story.
Voice: How many humanoid robots shipped in the first half of 2026?
Voice: Smart Analytics Global says about nineteen thousand.
Voice: Counterpoint Research says over twenty-two thousand.
Voice: IDC says nearly twenty-five thousand.
Voice: Same six months. Almost six thousand robots apart.

### S7 What for
On screen: two cards. IDC: 69%, research, education, shows, government data collection. Smart Analytics Global: over
70%, industrial and commercial. A red pen question mark between them.
Voice: They don't agree on what the robots are doing, either.
Voice: IDC says sixty-nine percent went to research, education, shows, and government data collection.
Voice: Smart Analytics Global says over seventy percent went to industrial and commercial work.
Voice: Two counts. Two different pictures.

### S8 China
On screen: two cards. "Bought in China: about 78%". "Built by Chinese companies: over 95%". Under them: different
questions. Source tags.
Voice: Even China's share depends on the question.
Voice: About seventy-eight percent were bought in China.
Voice: Over ninety-five percent were built by Chinese companies.
Voice: Both can be true.

### S9 Your chores
On screen: "Working in homes today": robot vacuums, robot lawn mowers, garden robots like FarmBot, each checked. "A
humanoid that does your chores": a red NOT YET stamp. Small disclosure line.
Voice: So, will a humanoid do your chores?
Voice: Not the ones you can buy today.
Voice: The robots already working in homes are narrow: vacuums, lawn mowers, garden robots like FarmBot.
Voice: Each one does a single job, on a schedule.

### S10 What to watch
On screen: "Watch for": Nova shipping past the first 100; the full-year counts, forecast at over 50,000
(Counterpoint) and about 60,000 (Smart Analytics Global).
Voice: What to watch next: whether Nova ships beyond the first hundred.
Voice: And the full-year counts. The forecasts run from over fifty thousand to about sixty thousand.

### S11 Payoff
On screen: the robot diagram tips over and gets back up. "Cheap: yes." "Useful at home: not yet." End line: sources
in the description.
Voice: Humanoid robots just got cheap.
Voice: Getting useful is the next test.

## Slots for the full version (CT's machine)

| Where | What goes there | Rules |
| --- | --- | --- |
| S1, first seconds | The launch video's most physical moment, about 5 s, framed, with a source tag | Fair use checklist in `docs/current-event-video.md`; no source music |
| S2 | CT on camera saying the hook | His own words may differ; the scratch line is a guide |
| S3 | Two or three product shots or launch clips under the spec lines | Press kit first, then short excerpts |
| S5 | Interview 1: a robotics teacher or a small-humanoid owner, 10 to 20 s | Signed release |
| S9 | CT's own FarmBot footage; interview 2, a FarmBot owner or grower | Disclosure stays |
| S10 | CT on camera with his take, labeled as his | |
