#!/usr/bin/env python3
"""Regenerate the ADT English audio with selected East African voices."""

import argparse
import asyncio
import json
import os
import re
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "content" / "i18n" / "en"
AUDIO_DIR = I18N / "audio"
PRIMARY_VOICE = "en-TZ-ImaniNeural"
SECONDARY_VOICE = "en-KE-ChilembaNeural"
RATE = "-5%"

# Chausiku's reported explanation is the book's only continuous spoken passage.
DIALOGUE_IDS = {
    *(f"pg035_n{number:04d}" for number in range(6, 11)),
    *(f"pg035_n{number:04d}_easy_read" for number in range(6, 11)),
}

# Short printed labels need a spoken form that is useful to a listener.
SPOKEN_OVERRIDES = {
    **{f"pg010_n{number:04d}": f"Picture {letter}" for number, letter in zip(
        (13, 16, 20, 23, 27, 30), "abcdef")},
    **{f"pg011_n{number:04d}": f"Picture {letter}" for number, letter in zip(
        (3, 5, 7, 9, 11, 13, 15), "ghijklm")},
    **{f"pg014_n{number:04d}": f"Picture {letter}" for number, letter in zip(
        (15, 18, 22, 25), "abcd")},
    **{f"pg015_n{number:04d}": f"Picture {letter}" for number, letter in zip(
        (5, 8, 12, 15, 19, 22, 26, 29), "efghijkl")},
    "pg018_n0004": "Picture number 1 a", "pg018_n0006": "Picture b",
    "pg018_n0008": "Picture number 2 a", "pg018_n0010": "Picture b",
    "pg018_n0012": "Picture number 3", "pg018_n0014": "Picture number 4",
    "pg018_n0016": "Picture number 5",
    **{f"pg021_n{number:04d}": f"Safety sign {letter}" for number, letter in zip(
        (18, 20, 22), "abc")},
    "pg022_n0011": "Picture number 1", "pg022_n0013": "Picture number 2",
    "pg023_n0002": "Picture number 3 a", "pg023_n0003": "Picture b",
    "pg023_n0004": "Picture number 4 a", "pg023_n0005": "Picture b",
    "pg023_n0006": "Picture number 5", "pg023_n0007": "Picture number 6",
    **{f"pg025_n{number:04d}": f"Safety sign {letter}" for number, letter in zip(
        (2, 4, 6, 8, 10, 12, 14, 16, 18), "abcdefghi")},
    **{f"pg027_n{number:04d}": f"Picture {letter}" for number, letter in zip(
        (2, 4, 6, 8, 10, 12, 14, 16), "abcdefgh")},
    **{f"pg028_n{number:04d}": f"Picture {letter}" for number, letter in zip(
        (2, 4, 6, 8, 10, 12, 14, 16), "ijklmnop")},
    **{f"pg034_n{number:04d}": f"Picture {letter}" for number, letter in zip(
        (5, 7, 9, 11), "abcd")},
    "pg037_n0010": "Picture a",
    "pg038_n0002": "Picture b",
    "pg036_n0006": "One",
    "pg036_n0009": "Two",
    "pg036_n0012": "Three",
}


async def synthesize(item, texts, semaphore, retries):
    text_id, filename = item
    base_id = text_id.removesuffix("_easy_read")
    text = SPOKEN_OVERRIDES.get(text_id, SPOKEN_OVERRIDES.get(base_id, texts.get(text_id)))
    if not isinstance(text, str) or not text.strip():
        return text_id, False, "missing or empty text"
    # Prevent TTS from reading the endpoints as words or abbreviations.
    text = re.sub(
        r"\bpictures a up to m\b",
        "pictures labelled A through M",
        text,
        flags=re.IGNORECASE,
    )
    voice = SECONDARY_VOICE if text_id in DIALOGUE_IDS else PRIMARY_VOICE
    target = AUDIO_DIR / filename
    temporary = target.with_name(target.name + ".regenerating")
    async with semaphore:
        for attempt in range(1, retries + 1):
            try:
                temporary.unlink(missing_ok=True)
                await asyncio.wait_for(
                    edge_tts.Communicate(text, voice, rate=RATE).save(str(temporary)),
                    timeout=90,
                )
                if temporary.stat().st_size < 1000:
                    raise RuntimeError("generated file is too small")
                os.replace(temporary, target)
                return text_id, True, voice
            except Exception as exc:
                temporary.unlink(missing_ok=True)
                if attempt == retries:
                    return text_id, False, str(exc)
                await asyncio.sleep(min(2 ** attempt, 12))


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--concurrency", type=int, default=6)
    parser.add_argument("--retries", type=int, default=5)
    parser.add_argument("ids", nargs="*", help="Optional text IDs to regenerate")
    args = parser.parse_args()
    texts = json.loads((I18N / "texts.json").read_text())
    audios = json.loads((I18N / "audios.json").read_text())
    if len(set(audios.values())) != len(audios):
        raise RuntimeError("audios.json contains duplicate output filenames")

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    semaphore = asyncio.Semaphore(args.concurrency)
    selected = audios.items() if not args.ids else ((text_id, audios[text_id]) for text_id in args.ids)
    tasks = [asyncio.create_task(synthesize(item, texts, semaphore, args.retries))
             for item in selected]
    completed = primary = secondary = 0
    failures = []
    for task in asyncio.as_completed(tasks):
        text_id, ok, detail = await task
        if ok:
            completed += 1
            primary += detail == PRIMARY_VOICE
            secondary += detail == SECONDARY_VOICE
            if completed % 50 == 0:
                print(f"Generated {completed}/{len(tasks)}", flush=True)
        else:
            failures.append((text_id, detail))
            print(f"FAILED {text_id}: {detail}", flush=True)

    report = {
        "total_mapped": len(tasks),
        "generated": completed,
        "primary_voice": PRIMARY_VOICE,
        "primary_files": primary,
        "secondary_voice": SECONDARY_VOICE,
        "secondary_files": secondary,
        "rate": RATE,
        "failures": failures,
    }
    if not args.ids:
        (AUDIO_DIR / "voice-generation-report.json").write_text(
            json.dumps(report, indent=2) + "\n"
        )
    print(json.dumps(report, indent=2), flush=True)
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
