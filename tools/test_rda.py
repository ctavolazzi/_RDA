#!/usr/bin/env python3
"""
Assert-based checks for tools/rda.py. Run from the repo root:

    python tools/test_rda.py

Every check asserts, so a regression exits non-zero. Several checks are controls: they plant a
bad input and assert the tool refuses it. If a control stops failing the way it should, the rest
of the file stops being evidence. Nothing here touches the real episodes/ folder.
"""
import contextlib
import io
import json
import os
import shutil
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import rda  # noqa: E402

ROOT = os.path.dirname(HERE)


def good_exam(n=4):
    topics = ["Anatomy", "Pharmacology"]
    items = []
    for i in range(n):
        items.append({
            "id": f"q{i + 1}", "topic": topics[i % 2], "difficulty": "easy",
            "stem": f"Question {i + 1}?", "options": {"A": "a", "B": "b", "C": "c", "D": "d"},
            "answer": "ABCD"[i % 4], "rationale": "because", "source_citation": "Ref 1",
        })
    return {
        "meta": {"title": "Sample Exam", "origin": "real", "source": "Publisher X", "year": 2019,
                 "time_limit_minutes": 360, "pass_line": {"correct": 3, "of": n}},
        "blueprint": [{"topic": "Anatomy", "weight_percent": 50}, {"topic": "Pharmacology", "weight_percent": 50}],
        "items": items,
    }


def run(argv):
    """Run the CLI, capture stdout, return (exit_code, output)."""
    out = io.StringIO()
    code = 0
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
        try:
            rda.main(argv)
        except SystemExit as e:
            code = e.code if isinstance(e.code, int) else 1
    return code, out.getvalue()


def main():
    tmp = tempfile.mkdtemp(prefix="rda-test-")
    try:
        eps = os.path.join(tmp, "episodes")
        os.makedirs(eps)
        shutil.copytree(os.path.join(ROOT, "episodes", "_template"), os.path.join(eps, "_template"))
        ideas = os.path.join(tmp, "ideas.md")
        base = ["--root", eps, "--ideas", ideas]

        # status with nothing
        code, out = run(base + ["status"])
        assert code == 0 and "no episodes yet" in out, out

        # idea: zero ceremony, appends
        code, out = run(base + ["idea", "surveyor exam, stakes: a cricket"])
        assert code == 0 and os.path.exists(ideas)
        run(base + ["idea", "second one"])
        assert sum(1 for l in open(ideas, encoding="utf-8") if l.startswith("- ")) == 2

        # new: numbers from 001, substitutes NNN, starts a log
        code, out = run(base + ["new", "Nursing Entrance!"])
        assert code == 0 and "001-nursing-entrance" in out, out
        ep = os.path.join(eps, "001-nursing-entrance")
        assert json.load(open(os.path.join(ep, "result.json")))["episode"] == "001-nursing-entrance"
        assert "RDA 001" in open(os.path.join(ep, "script", "script.md"), encoding="utf-8").read()
        assert os.path.exists(os.path.join(ep, "LOG.md"))
        code, out = run(base + ["new", "second"])
        assert "002-second" in out
        shutil.rmtree(os.path.join(eps, "002-second"))

        # status before anything: first unchecked item is the card
        code, out = run(base + ["status"])
        assert "[ ] exam card filled" in out and "next: fill exam/exam-card.md" in out, out

        p = rda.ep_paths(ep)

        # CONTROL: freeze refuses a missing exam
        code, out = run(base + ["exam", "freeze"])
        assert code == 1 and "no exam" in out, out

        # CONTROL: freeze refuses a bad exam (missing citation, answer E, wrong pass_line.of, real w/o source)
        bad = good_exam()
        del bad["items"][0]["source_citation"]
        bad["items"][1]["answer"] = "E"
        bad["meta"]["pass_line"]["of"] = 99
        del bad["meta"]["source"]
        rda.save_json(p["exam"], bad)
        code, out = run(base + ["exam", "freeze"])
        assert code == 1, out
        for needle in ("answer must be", "pass_line.of is 99", "meta.source is required"):
            assert needle in out, (needle, out)
        assert not os.path.exists(p["frozen"]) and not os.path.exists(p["key"])

        # CONTROL: validate_exam catches a duplicate id
        dup = good_exam()
        dup["items"][1]["id"] = "q1"
        assert any("duplicate" in e for e in rda.validate_exam(dup))
        assert rda.validate_exam(good_exam()) == []

        # a real exam's official key has no rationales: valid without them (inventing them is not allowed)
        bare = good_exam()
        for it in bare["items"]:
            del it["rationale"], it["source_citation"]
        assert rda.validate_exam(bare) == [], rda.validate_exam(bare)
        # CONTROL: the same bare items are refused when the exam is generated
        bare["meta"]["origin"] = "ai-generated"
        errs = rda.validate_exam(bare)
        assert any("rationale" in e for e in errs) and any("source_citation" in e for e in errs), errs

        # the schema agrees with the tool on both cases (only when jsonschema is installed)
        try:
            import jsonschema
            schema = json.load(open(os.path.join(ROOT, "schemas", "exam.schema.json")))
            v = jsonschema.Draft202012Validator(schema)
            bare["meta"]["origin"] = "real"
            assert not list(v.iter_errors(bare))
            bare["meta"]["origin"] = "ai-generated"
            assert any("rationale" in e.message for e in v.iter_errors(bare))
            assert not list(v.iter_errors(good_exam()))
        except ImportError:
            pass

        # --episode works after the verb, not only before it
        code, out = run(base + ["status", "--episode", "001-nursing-entrance"])
        assert code == 0 and "001-nursing-entrance" in out, out

        # freeze a good exam: key sealed, hash recorded in FROZEN, result.json and the card
        rda.save_json(p["exam"], good_exam())
        code, out = run(base + ["exam", "freeze"])
        assert code == 0 and "frozen" in out, out
        frozen = json.load(open(p["frozen"]))
        assert frozen["sha256"] == rda.sha256(p["exam"]) and frozen["items"] == 4
        assert json.load(open(p["key"])) == {"q1": "A", "q2": "B", "q3": "C", "q4": "D"}
        r = json.load(open(p["result"]))
        assert r["exam"]["sha256"] == frozen["sha256"] and r["challenge"]["pass_line"] == {"correct": 3, "of": 4}
        card = open(p["card"], encoding="utf-8").read()
        assert frozen["sha256"] in card and "| SHA-256 of `exam.json` | TODO" not in card

        # the question sheet is what the host reads: every stem and option, and CONTROL: no answer leaks
        sheet = open(p["questions"], encoding="utf-8").read()
        for it in good_exam()["items"]:
            assert it["stem"] in sheet and f"({it['id']})" in sheet
        assert frozen["sha256"] in sheet
        # good_exam's rationale is "because" and its citation is "Ref 1"; neither may appear
        assert "because" not in sheet and "Ref 1" not in sheet, sheet
        # the key is A, B, C, D in order; the sheet must not pair an id with its answer letter
        assert '"answer"' not in sheet and "Answer:" not in sheet and "correct:" not in sheet.lower(), sheet

        # CONTROL: a second freeze is refused
        code, out = run(base + ["exam", "freeze"])
        assert code == 1 and "already frozen" in out, out

        # check: OK, then CONTROL: tamper one answer and check must say CHANGED
        code, out = run(base + ["exam", "check"])
        assert code == 0 and out.startswith("OK"), out
        tampered = json.load(open(p["exam"]))
        tampered["items"][0]["answer"] = "B"
        rda.save_json(p["exam"], tampered)
        code, out = run(base + ["exam", "check"])
        assert code == 1 and "CHANGED" in out, out
        # CONTROL: score refuses a tampered exam
        code, out = run(base + ["score", os.devnull])
        assert code == 1 and "not frozen and intact" in out, out
        rda.save_json(p["exam"], good_exam())        # restore, same bytes, same hash
        assert run(base + ["exam", "check"])[0] == 0

        # clock: start writes started_at once, stop writes test_finished_at once
        code, out = run(base + ["clock", "start", "--once", "--tick", "0"])
        assert code == 0 and "TIME LEFT" in out, out
        started = json.load(open(p["result"]))["challenge"]["started_at"]
        assert started
        run(base + ["clock", "start", "--once", "--tick", "0"])
        assert json.load(open(p["result"]))["challenge"]["started_at"] == started
        code, out = run(base + ["clock", "stop"])
        assert code == 0 and json.load(open(p["result"]))["challenge"]["test_finished_at"]
        assert run(base + ["clock", "stop"])[0] == 1

        # score: pure function, then CLI with an answers file
        s = rda.score_answers(good_exam(), {"q1": "A", "q2": "B", "q3": "C", "q4": "D"},
                              {"q1": "A", "q2": "B", "q3": "D"})
        assert s["correct"] == 2 and s["outcome"] == "fail" and s["unanswered"] == ["q4"]
        assert s["by_topic"]["Anatomy"] == {"questions": 2, "correct": 1, "missed": ["q3"]}
        ans = os.path.join(tmp, "answers.json")
        rda.save_json(ans, {"q1": "A", "q2": "B", "q3": "C", "q4": "A"})
        code, out = run(base + ["score", ans])
        assert code == 0 and "SCORE   3 of 4" in out and "RESULT   PASS" in out, out
        r = json.load(open(p["result"]))
        assert r["score"]["correct"] == 3 and r["outcome"] == "pass" and r["score"]["scorer_output_captured"]
        # CONTROL: a bad letter in the answers file is refused
        rda.save_json(ans, {"q1": "Z"})
        assert run(base + ["score", ans])[0] == 1

        # handoff: CONTROL refuses a non-pipeline path, then scaffolds and exports, and never overwrites
        code, out = run(base + ["handoff", tmp])
        assert code == 1 and "does not look like" in out, out
        pipe = os.path.join(tmp, "pipeline")
        os.makedirs(os.path.join(pipe, "videos"))
        code, out = run(base + ["handoff", pipe])
        assert code == 0, out
        proj = os.path.join(pipe, "videos", "rda-001")
        assert os.path.exists(os.path.join(proj, "script", "script.md"))
        assert os.path.exists(os.path.join(proj, "notion.json"))
        ej = json.load(open(os.path.join(proj, "work", "episode.json")))
        assert ej["score"]["correct"] == 3 and ej["outcome"] == "pass" and ej["exam"]["sha256"] == frozen["sha256"]
        assert json.load(open(p["result"]))["pipeline_project"] == "videos/rda-001"
        with open(os.path.join(proj, "notion.json"), "w", encoding="utf-8") as f:
            f.write("{\"edited\": true}")
        code, out = run(base + ["handoff", pipe])
        assert code == 0 and "kept" in out and json.load(open(os.path.join(proj, "notion.json"))) == {"edited": True}

        # with no path, handoff targets this repo itself (the pipeline is vendored in), via rda.ROOT
        home = os.path.join(tmp, "home")
        os.makedirs(os.path.join(home, "videos"))
        saved_root, rda.ROOT = rda.ROOT, home
        try:
            code, out = run(base + ["handoff"])
        finally:
            rda.ROOT = saved_root
        assert code == 0 and os.path.exists(os.path.join(home, "videos", "rda-001", "work", "episode.json")), out
        assert "next: drop the footage in videos/rda-001/" in out, out

        # log appends; status reflects everything and shows the pipeline next step
        code, out = run(base + ["log", "filmed the cookie"])
        assert code == 0 and "filmed the cookie" in open(p["log"], encoding="utf-8").read()
        code, out = run(base + ["status"])
        assert "[x] exam frozen and intact" in out and "[x] scored: 3 of 4, PASS" in out, out
        assert "[x] handed off to videos/rda-001" in out and "[ ] payoff filmed" in out, out
        # the card still has TODOs, so that is the first open item whatever else is done
        assert "[ ] exam card filled" in out and "next: fill exam/exam-card.md" in out, out
        with open(p["card"], "w", encoding="utf-8") as f:
            f.write(open(p["card"], encoding="utf-8").read().replace("TODO", "filled"))
        code, out = run(base + ["status"])
        assert "[x] exam card filled" in out and "next: film the payoff" in out, out

        # every video ships with a thumbnail: status will not say "finish and ship" until one exists
        r = json.load(open(p["result"]))
        r["payoff"]["filmed"] = True
        rda.save_json(p["result"], r)
        with open(p["script"], "w", encoding="utf-8") as f:
            f.write("# script, written")
        pk = os.path.join(home, "videos", "rda-001", "packaging")
        saved_root, rda.ROOT = rda.ROOT, home
        try:
            code, out = run(base + ["status"])
            assert "[ ] thumbnail made" in out and "next: produce it:" in out and "thumbnail" in out.split("next:")[1], out
            # CONTROL: things that are not thumbnails do not count
            os.makedirs(os.path.join(pk, "thumbs"))
            for decoy in ("notes.md", "A.png"):          # wrong type, and an image without the thumb- prefix
                open(os.path.join(pk, decoy), "w").close()
            code, out = run(base + ["status"])
            assert "[ ] thumbnail made" in out and "finish and ship" not in out, out
            open(os.path.join(pk, "thumb-A.jpg"), "w").close()
            code, out = run(base + ["status"])
            assert "[x] thumbnail made (1 in videos/rda-001/packaging/)" in out, out
            assert "next: finish and ship" in out, out
            # a /thumbnail render in packaging/thumbs/ counts too
            open(os.path.join(pk, "thumbs", "B.png"), "w").close()
            assert "[x] thumbnail made (2 in" in run(base + ["status"])[1]
        finally:
            rda.ROOT = saved_root

        # no dashes in anything the tool prints or writes
        for path in (p["log"], p["card"], p["frozen"], ideas):
            text = open(path, encoding="utf-8").read()
            assert chr(0x2013) not in text and chr(0x2014) not in text, path

        print("ok: all rda checks passed")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
