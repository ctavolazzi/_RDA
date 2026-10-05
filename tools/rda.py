#!/usr/bin/env python3
"""
rda.py: the one tool for running an RDA episode, start to publish.

Stdlib only. Run from the repo root:

  python tools/rda.py idea "land surveyor exam, stakes: eat a cricket"   # park an idea, no ceremony
  python tools/rda.py new nursing-entrance            # scaffold episodes/001-nursing-entrance/
  python tools/rda.py status                          # where things stand and the next step
  python tools/rda.py exam freeze                     # validate, hash, seal the key, write the card
  python tools/rda.py exam check                      # prove on camera the exam did not change
  python tools/rda.py clock start 360                 # live countdown for the screen capture
  python tools/rda.py clock stop                      # record when the test finished
  python tools/rda.py score                           # enter answers, get the score, write result.json
  python tools/rda.py handoff                         # scaffold videos/rda-NNN/ here and export episode.json
  python tools/rda.py log "filmed the cookie b-roll"  # dated receipt in the episode log

Every command works on the latest numbered episode unless --episode NNN-slug is given.
Nothing here needs an API key. Exam generation is a separate, later tool.
"""
import argparse
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPISODES = os.path.join(ROOT, "episodes")
TEMPLATE = os.path.join(EPISODES, "_template")
IDEAS = os.path.join(ROOT, "docs", "ideas.md")
LETTERS = ("A", "B", "C", "D")


# ── small helpers ─────────────────────────────────────────────────────────────
def now():
    return dt.datetime.now().astimezone().replace(microsecond=0)


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def load_json(path):
    return json.loads(read(path))


def save_json(path, data):
    write(path, json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()


def die(msg, code=1):
    print(f"rda: {msg}", file=sys.stderr)
    sys.exit(code)


# ── episodes ──────────────────────────────────────────────────────────────────
def list_episodes(root=None):
    base = root or EPISODES
    if not os.path.isdir(base):
        return []
    eps = [d for d in os.listdir(base) if re.match(r"^\d{3}-", d) and os.path.isdir(os.path.join(base, d))]
    return sorted(eps)


def resolve_episode(name=None, root=None):
    base = root or EPISODES
    eps = list_episodes(base)
    if name:
        if name not in eps:
            die(f"no episode {name!r}. Have: {', '.join(eps) or 'none'}")
        return os.path.join(base, name)
    if not eps:
        die("no episodes yet. Start one: python tools/rda.py new <slug>")
    return os.path.join(base, eps[-1])


def ep_paths(ep):
    return {
        "dir": ep,
        "name": os.path.basename(ep),
        "card": os.path.join(ep, "exam", "exam-card.md"),
        "exam": os.path.join(ep, "exam", "exam.json"),
        "key": os.path.join(ep, "exam", "key.json"),
        "questions": os.path.join(ep, "exam", "questions.md"),
        "frozen": os.path.join(ep, "exam", "FROZEN.json"),
        "answers": os.path.join(ep, "exam", "answers.json"),
        "result": os.path.join(ep, "result.json"),
        "script": os.path.join(ep, "script", "script.md"),
        "notion": os.path.join(ep, "notion.json"),
        "log": os.path.join(ep, "LOG.md"),
    }


def cmd_new(args):
    slug = re.sub(r"[^a-z0-9]+", "-", args.slug.lower()).strip("-")
    if not slug:
        die("slug must contain letters or digits")
    eps = list_episodes(args.root)
    n = (int(eps[-1][:3]) + 1) if eps else 1
    name = f"{n:03d}-{slug}"
    dest = os.path.join(args.root or EPISODES, name)
    tmpl = os.path.join(args.root or EPISODES, "_template") if args.root else TEMPLATE
    if os.path.exists(dest):
        die(f"{dest} already exists")
    shutil.copytree(tmpl, dest)
    for rel in ("script/script.md", "notion.json", "result.json", "exam/exam-card.md"):
        p = os.path.join(dest, rel)
        if os.path.exists(p):
            write(p, read(p).replace("NNN-slug", name).replace("NNN", f"{n:03d}"))
    write(os.path.join(dest, "LOG.md"),
          f"# {name}: production log\n\nEvery timestamp here is when it happened, not when it was planned.\n\n"
          f"- {now().isoformat()}  episode created\n")
    print(f"created {os.path.relpath(dest, ROOT)}")
    print("next: fill exam/exam-card.md, then put the exam in exam/exam.json")


def cmd_log(args):
    p = ep_paths(resolve_episode(args.episode, args.root))
    line = f"- {now().isoformat()}  {args.text.strip()}\n"
    with open(p["log"], "a", encoding="utf-8") as f:
        f.write(line)
    print(line.rstrip())


def cmd_idea(args):
    path = args.ideas or IDEAS
    if not os.path.exists(path):
        write(path, "# Ideas inbox\n\nParked as they come. Promote one to docs/backlog.md when it is scored.\n\n")
    line = f"- {now().date().isoformat()}  {args.text.strip()}\n"
    with open(path, "a", encoding="utf-8") as f:
        f.write(line)
    print(f"parked in {os.path.relpath(path, ROOT)}")


# ── exam ──────────────────────────────────────────────────────────────────────
def validate_exam(exam):
    """Mirror of schemas/exam.schema.json, without a jsonschema dependency. Returns a list of problems."""
    errs = []
    if not isinstance(exam, dict):
        return ["exam.json must be an object"]
    meta = exam.get("meta")
    if not isinstance(meta, dict):
        errs.append("meta missing")
        meta = {}
    for k in ("title", "origin", "time_limit_minutes", "pass_line"):
        if k not in meta:
            errs.append(f"meta.{k} missing")
    if meta.get("origin") not in ("real", "real-adapted", "ai-generated"):
        errs.append("meta.origin must be real, real-adapted or ai-generated")
    if meta.get("origin") in ("real", "real-adapted") and not meta.get("source"):
        errs.append("meta.source is required for a real exam")
    pl = meta.get("pass_line") or {}
    if not (isinstance(pl, dict) and isinstance(pl.get("correct"), int) and isinstance(pl.get("of"), int)):
        errs.append("meta.pass_line needs integer correct and of")
    elif pl["correct"] > pl["of"]:
        errs.append("meta.pass_line.correct is larger than of")
    bp = exam.get("blueprint")
    if not (isinstance(bp, list) and bp):
        errs.append("blueprint must be a non-empty list")
    items = exam.get("items")
    if not (isinstance(items, list) and items):
        errs.append("items must be a non-empty list")
        return errs
    ids = set()
    for i, it in enumerate(items):
        tag = f"items[{i}]"
        if not isinstance(it, dict):
            errs.append(f"{tag} is not an object")
            continue
        # A real exam's official key rarely comes with per-item rationales, and filling them in
        # would be inventing. Only a generated exam must carry them (they are what gets verified).
        required = ("id", "topic", "difficulty", "stem", "options", "answer")
        if meta.get("origin") == "ai-generated":
            required += ("rationale", "source_citation")
        for k in required:
            if not it.get(k):
                errs.append(f"{tag}.{k} missing or empty")
        if it.get("id") in ids:
            errs.append(f"{tag}.id {it.get('id')!r} is a duplicate")
        ids.add(it.get("id"))
        if it.get("difficulty") not in ("easy", "medium", "hard"):
            errs.append(f"{tag}.difficulty must be easy, medium or hard")
        opts = it.get("options")
        if not (isinstance(opts, dict) and set(opts) == set(LETTERS) and all(opts.values())):
            errs.append(f"{tag}.options must have exactly A, B, C, D, all non-empty")
        if it.get("answer") not in LETTERS:
            errs.append(f"{tag}.answer must be A, B, C or D")
    if isinstance(pl, dict) and isinstance(pl.get("of"), int) and pl["of"] != len(items):
        errs.append(f"meta.pass_line.of is {pl['of']} but there are {len(items)} items")
    return errs


def cmd_exam_freeze(args):
    p = ep_paths(resolve_episode(args.episode, args.root))
    if os.path.exists(p["frozen"]):
        die(f"already frozen (see {os.path.relpath(p['frozen'], ROOT)}). A frozen exam does not change.")
    if not os.path.exists(p["exam"]):
        die(f"no exam at {os.path.relpath(p['exam'], ROOT)}")
    try:
        exam = load_json(p["exam"])
    except json.JSONDecodeError as e:
        die(f"exam.json is not valid JSON: {e}")
    errs = validate_exam(exam)
    if errs:
        print("exam.json is not ready to freeze:", file=sys.stderr)
        for e in errs:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)
    digest = sha256(p["exam"])
    when = now().isoformat()
    save_json(p["key"], {it["id"]: it["answer"] for it in exam["items"]})
    write(p["questions"], question_sheet(exam, digest))
    save_json(p["frozen"], {"sha256": digest, "frozen_at": when, "items": len(exam["items"]),
                            "pass_line": exam["meta"]["pass_line"], "origin": exam["meta"]["origin"]})
    if os.path.exists(p["result"]):
        r = load_json(p["result"])
        r.setdefault("exam", {}).update({"origin": exam["meta"]["origin"], "sha256": digest, "frozen_at": when})
        r.setdefault("challenge", {})["time_limit_minutes"] = exam["meta"]["time_limit_minutes"]
        r["challenge"]["pass_line"] = exam["meta"]["pass_line"]
        save_json(p["result"], r)
    if os.path.exists(p["card"]):
        card = read(p["card"])
        card = re.sub(r"(\| SHA-256 of `exam\.json` \|)[^\n]*", rf"\1 `{digest}` |", card)
        card = re.sub(r"(\| Frozen at \(commit and time\) \|)[^\n]*", rf"\1 {when} |", card)
        write(p["card"], card)
    append_log(p, f"exam frozen, sha256 {digest[:12]}..., {len(exam['items'])} items, "
                  f"pass line {exam['meta']['pass_line']['correct']} of {exam['meta']['pass_line']['of']}")
    print(f"frozen     {digest}")
    print(f"questions  {os.path.relpath(p['questions'], ROOT)}  (the test sheet, no answers)")
    print("the host never opens exam.json or key.json: both contain the answers")
    print("next: commit exam/, then record B1 and B2 before studying")


def question_sheet(exam, digest):
    """The only exam file the host reads: stems and options, no answers, no rationales."""
    m = exam["meta"]
    pl = m["pass_line"]
    out = [f"# {m['title']}", "",
           f"{len(exam['items'])} questions. Pass line: {pl['correct']} of {pl['of']}. "
           f"Time limit for study and test: {m['time_limit_minutes']} minutes.", "",
           f"Exam SHA-256: `{digest}`", "",
           "Write down a letter per question id, then run `python tools/rda.py score`.", ""]
    for n, it in enumerate(exam["items"], 1):
        out += ["---", "", f"**{n}. ({it['id']})** {it['stem']}", ""]
        out += [f"- **{k}.** {it['options'][k]}" for k in LETTERS]
        out.append("")
    return "\n".join(out)


def check_frozen(p):
    """Returns (ok, message)."""
    if not os.path.exists(p["frozen"]):
        return False, "not frozen"
    if not os.path.exists(p["exam"]):
        return False, "exam.json is missing"
    want = load_json(p["frozen"])["sha256"]
    have = sha256(p["exam"])
    return (have == want), (f"OK  {have}" if have == want else f"CHANGED  frozen {want}  now {have}")


def cmd_exam_check(args):
    p = ep_paths(resolve_episode(args.episode, args.root))
    ok, msg = check_frozen(p)
    print(msg)
    sys.exit(0 if ok else 1)


# ── clock ─────────────────────────────────────────────────────────────────────
def fmt_hms(seconds):
    seconds = max(0, int(seconds))
    return f"{seconds // 3600:02d}:{seconds % 3600 // 60:02d}:{seconds % 60:02d}"


def cmd_clock_start(args):
    p = ep_paths(resolve_episode(args.episode, args.root))
    r = load_json(p["result"])
    ch = r.setdefault("challenge", {})
    minutes = args.minutes or ch.get("time_limit_minutes")
    if not minutes:
        die("give the minutes (rda clock start 360) or freeze an exam with a time limit first")
    if ch.get("started_at"):
        start = dt.datetime.fromisoformat(ch["started_at"])
        print(f"resuming the clock started at {ch['started_at']}")
    else:
        start = now()
        ch["started_at"] = start.isoformat()
        ch["time_limit_minutes"] = minutes
        save_json(p["result"], r)
        append_log(p, f"clock started, {minutes} minutes")
    end = start + dt.timedelta(minutes=minutes)
    print(f"study window: {minutes} min, ends {end.isoformat()}   (Ctrl-C hides the clock, it keeps counting)")
    try:
        while True:
            left = (end - now()).total_seconds()
            print(f"\r  TIME LEFT  {fmt_hms(left)}   ", end="", flush=True)
            if left <= 0:
                print("\n  TIME.")
                break
            time.sleep(1 if args.tick is None else args.tick)
            if args.once:
                print()
                break
    except KeyboardInterrupt:
        print("\nclock hidden. It is still running from", ch["started_at"])


def cmd_clock_stop(args):
    p = ep_paths(resolve_episode(args.episode, args.root))
    r = load_json(p["result"])
    ch = r.setdefault("challenge", {})
    if not ch.get("started_at"):
        die("the clock was never started")
    if ch.get("test_finished_at"):
        die(f"already stopped at {ch['test_finished_at']}")
    stop = now()
    ch["test_finished_at"] = stop.isoformat()
    used = (stop - dt.datetime.fromisoformat(ch["started_at"])).total_seconds()
    save_json(p["result"], r)
    append_log(p, f"test finished, {fmt_hms(used)} after the clock started")
    print(f"stopped. elapsed {fmt_hms(used)} of {ch.get('time_limit_minutes')} min")


# ── score ─────────────────────────────────────────────────────────────────────
def score_answers(exam, key, answers):
    """Pure function. Returns the result block written to result.json."""
    by_topic = {}
    correct = 0
    for it in exam["items"]:
        t = by_topic.setdefault(it["topic"], {"questions": 0, "correct": 0, "missed": []})
        t["questions"] += 1
        if answers.get(it["id"]) == key[it["id"]]:
            correct += 1
            t["correct"] += 1
        else:
            t["missed"].append(it["id"])
    pl = exam["meta"]["pass_line"]
    return {
        "correct": correct,
        "of": len(exam["items"]),
        "pass_line": pl,
        "outcome": "pass" if correct >= pl["correct"] else "fail",
        "by_topic": by_topic,
        "unanswered": [it["id"] for it in exam["items"] if it["id"] not in answers],
    }


def cmd_score(args):
    p = ep_paths(resolve_episode(args.episode, args.root))
    ok, msg = check_frozen(p)
    if not ok:
        die(f"exam is not frozen and intact ({msg}). Freeze it first.")
    exam = load_json(p["exam"])
    key = load_json(p["key"])
    if args.answers:
        answers = load_json(args.answers)
    elif os.path.exists(p["answers"]) and not args.interactive:
        answers = load_json(p["answers"])
        print(f"using {os.path.relpath(p['answers'], ROOT)}")
    else:
        answers = {}
        print("type the letter you answered for each question (blank = unanswered)\n")
        for it in exam["items"]:
            while True:
                a = input(f"  {it['id']}  {it['stem'][:70]}\n      > ").strip().upper()
                if a in LETTERS or a == "":
                    break
                print("      A, B, C, D or blank")
            if a:
                answers[it["id"]] = a
        save_json(p["answers"], answers)
    bad = {k: v for k, v in answers.items() if v not in LETTERS or k not in key}
    if bad:
        die(f"answers has entries that are not A to D or not in the exam: {bad}")
    s = score_answers(exam, key, answers)
    r = load_json(p["result"])
    r["score"] = {"correct": s["correct"], "of": s["of"], "scorer_output_captured": True,
                  "by_topic": s["by_topic"], "unanswered": s["unanswered"]}
    r["outcome"] = s["outcome"]
    save_json(p["result"], r)
    append_log(p, f"scored {s['correct']} of {s['of']}, {s['outcome'].upper()}")
    # This block is what the camera sees. Keep it plain.
    print()
    print("  =====================================")
    print(f"   {exam['meta']['title']}")
    print(f"   SCORE   {s['correct']} of {s['of']}")
    print(f"   PASS LINE   {s['pass_line']['correct']} of {s['pass_line']['of']}")
    print(f"   RESULT   {s['outcome'].upper()}")
    print("  =====================================")
    print()
    for topic, t in s["by_topic"].items():
        print(f"  {t['correct']:>3}/{t['questions']:<3} {topic}")
    if s["unanswered"]:
        print(f"\n  unanswered: {', '.join(s['unanswered'])}")


# ── handoff ───────────────────────────────────────────────────────────────────
def cmd_handoff(args):
    p = ep_paths(resolve_episode(args.episode, args.root))
    # The production pipeline lives in this repo (vendored from claude-youtube-editor on 2026-10-05),
    # so the default target is the repo root. A path still works, for a separate pipeline checkout.
    pipeline = os.path.abspath(args.pipeline or ROOT)
    if not os.path.isdir(os.path.join(pipeline, "videos")):
        die(f"{pipeline} does not look like a pipeline checkout (no videos/ folder)")
    r = load_json(p["result"])
    if r.get("score", {}).get("correct") is None:
        die("no score in result.json yet. The handoff happens after the test.")
    project = f"rda-{p['name'][:3]}"
    dest = os.path.join(pipeline, "videos", project)
    copied = []
    for src, rel in ((p["script"], "script/script.md"), (p["notion"], "notion.json")):
        d = os.path.join(dest, rel)
        if os.path.exists(d):
            print(f"kept    {os.path.relpath(d, pipeline)} (already there, not overwritten)")
        elif os.path.exists(src):
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copy2(src, d)
            copied.append(rel)
    frozen = load_json(p["frozen"]) if os.path.exists(p["frozen"]) else {}
    episode = {
        "episode": p["name"],
        "exam": {"origin": frozen.get("origin"), "sha256": frozen.get("sha256"), "items": frozen.get("items")},
        "challenge": r.get("challenge", {}),
        "score": r.get("score", {}),
        "outcome": r.get("outcome"),
        "payoff": r.get("payoff", {}),
    }
    ej = os.path.join(dest, "work", "episode.json")
    save_json(ej, episode)
    r["pipeline_project"] = f"videos/{project}"
    save_json(p["result"], r)
    append_log(p, f"handed off to {r['pipeline_project']}")
    for rel in copied:
        print(f"copied  videos/{project}/{rel}")
    print(f"wrote   videos/{project}/work/episode.json  (score, pass line, timings, topic tally for the cards)")
    where = "" if pipeline == os.path.abspath(ROOT) else f", in {os.path.basename(pipeline)}"
    print(f"\nnext{where}: drop the footage in videos/{project}/ and run /clean-cut")


# ── status ────────────────────────────────────────────────────────────────────
def append_log(p, text):
    if os.path.exists(p["log"]):
        with open(p["log"], "a", encoding="utf-8") as f:
            f.write(f"- {now().isoformat()}  {text}\n")


def has_todo(path):
    return os.path.exists(path) and "TODO" in read(path)


def status_lines(p):
    """Returns (lines, next_step). Reads disk only, so it works whatever order things happened in."""
    lines = []
    nxt = None

    def mark(ok, text, step=None):
        nonlocal nxt
        lines.append(f"  [{'x' if ok else ' '}] {text}")
        if not ok and nxt is None and step:
            nxt = step

    r = load_json(p["result"]) if os.path.exists(p["result"]) else {}
    frozen_ok, frozen_msg = check_frozen(p)

    mark(not has_todo(p["card"]), "exam card filled",
         "fill exam/exam-card.md (exam, source, time limit, pass line, stakes)")
    mark(os.path.exists(p["exam"]), "exam.json on disk",
         "write exam/exam.json (a real exam with its key, validated by freeze)")
    mark(frozen_ok, f"exam frozen and intact ({frozen_msg})",
         "python tools/rda.py exam freeze, then commit exam/")
    ch = r.get("challenge", {})
    mark(bool(ch.get("started_at")), "clock started" + (f" at {ch['started_at']}" if ch.get("started_at") else ""),
         "record B1 and B2 on camera, then: python tools/rda.py clock start <minutes>")
    mark(bool(ch.get("test_finished_at")), "test finished",
         "take the test, then: python tools/rda.py clock stop")
    sc = r.get("score", {})
    scored = sc.get("correct") is not None
    mark(scored, "scored" + (f": {sc['correct']} of {sc['of']}, {str(r.get('outcome')).upper()}" if scored else ""),
         "python tools/rda.py score  (then film the payoff that actually happened)")
    mark(bool(r.get("payoff", {}).get("filmed")), "payoff filmed",
         "film the payoff b-roll, then set payoff.filmed true in result.json")
    mark(not has_todo(p["script"]), "script written (no TODO left)",
         "write script/script.md from the result and the debrief")
    mark(bool(r.get("pipeline_project")), "handed off" + (f" to {r['pipeline_project']}" if r.get("pipeline_project") else ""),
         "python tools/rda.py handoff")
    if nxt is None:
        nxt = ("produce it: /clean-cut, /make-tsx, /suggest-sfx, /packaging, tools/master_audio.py, then tools/yt_upload.py. "
               "Before publishing: set the paid promotion toggle in YouTube Studio by hand (the upload plan has no field for it).")
    return lines, nxt


def cmd_status(args):
    eps = list_episodes(args.root)
    if not eps:
        print("no episodes yet.  python tools/rda.py new <slug>")
        ideas = args.ideas or IDEAS
        if os.path.exists(ideas):
            n = sum(1 for l in read(ideas).splitlines() if l.startswith("- "))
            print(f"{n} idea(s) parked in docs/ideas.md")
        return
    p = ep_paths(resolve_episode(args.episode, args.root))
    print(f"{p['name']}")
    lines, nxt = status_lines(p)
    print("\n".join(lines))
    print(f"\nnext: {nxt}")
    if os.path.exists(p["log"]):
        tail = [l for l in read(p["log"]).splitlines() if l.startswith("- ")][-3:]
        if tail:
            print("\nlog:")
            for l in tail:
                print(" " + l)
    if len(eps) > 1:
        print(f"\nother episodes: {', '.join(e for e in eps if e != p['name'])}")


# ── cli ───────────────────────────────────────────────────────────────────────
def build_parser():
    ap = argparse.ArgumentParser(prog="rda", description="run an RDA episode from idea to handoff")
    ap.add_argument("--root", help=argparse.SUPPRESS)    # tests point this at a temp episodes dir
    ap.add_argument("--ideas", help=argparse.SUPPRESS)
    # --episode lives on every subcommand, so it can go anywhere after the verb: rda status --episode 001-x
    ep = argparse.ArgumentParser(add_help=False)
    ep.add_argument("--episode", help="episode folder name, default: the latest")
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("new", help="scaffold a new episode from the template", parents=[ep]); s.add_argument("slug"); s.set_defaults(fn=cmd_new)
    s = sub.add_parser("status", help="where things stand and the next step", parents=[ep]); s.set_defaults(fn=cmd_status)
    s = sub.add_parser("idea", help="park an idea in docs/ideas.md", parents=[ep]); s.add_argument("text"); s.set_defaults(fn=cmd_idea)
    s = sub.add_parser("log", help="dated note in the episode log", parents=[ep]); s.add_argument("text"); s.set_defaults(fn=cmd_log)

    ex = sub.add_parser("exam", help="freeze or check the exam").add_subparsers(dest="sub", required=True)
    ex.add_parser("freeze", help="validate, hash, seal the key, write the question sheet", parents=[ep]).set_defaults(fn=cmd_exam_freeze)
    ex.add_parser("check", help="recompute the hash", parents=[ep]).set_defaults(fn=cmd_exam_check)

    ck = sub.add_parser("clock", help="the visible study clock").add_subparsers(dest="sub", required=True)
    s = ck.add_parser("start", help="start (or show) the countdown", parents=[ep]); s.add_argument("minutes", nargs="?", type=int)
    s.add_argument("--once", action="store_true", help=argparse.SUPPRESS); s.add_argument("--tick", type=float, help=argparse.SUPPRESS)
    s.set_defaults(fn=cmd_clock_start)
    ck.add_parser("stop", help="record when the test finished", parents=[ep]).set_defaults(fn=cmd_clock_stop)

    s = sub.add_parser("score", help="score the answers against the sealed key", parents=[ep])
    s.add_argument("answers", nargs="?", help="answers JSON {id: letter}; omit to type them in")
    s.add_argument("--interactive", action="store_true", help="type answers even if answers.json exists")
    s.set_defaults(fn=cmd_score)

    s = sub.add_parser("handoff", help="scaffold videos/rda-NNN/ and export episode.json for the cards", parents=[ep])
    s.add_argument("pipeline", nargs="?", help="pipeline checkout to hand off to (default: this repo)"); s.set_defaults(fn=cmd_handoff)
    return ap


def main(argv=None):
    args = build_parser().parse_args(argv)
    args.fn(args)


if __name__ == "__main__":
    main()
