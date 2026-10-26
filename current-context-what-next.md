# Family Table (CSL 2026): current context and what next

Updated 2026-10-26 evening ET. This file is overwritten, not appended.

## Current deliverable
- **Deadline:** Wed Oct 28, 11:59 PM ET. Submit a deck PDF (8–10 slides) plus a 2-min video (MP4 or a Drive link anyone can open).
- **Rizaldy's scope** (confirmed by Rizaldy): prototype, the 2-min video, the Secret Sauce slide. The video is Loom-style with Nindy's voice and face.
- **Prototype:** `prototype/`, 8 routes plus 4 `story/*` cards used only in the video. Screenshots at 1920×1080 are in `prototype/shots/`.
- **Showcase:** `index.html` at the repo root, for GitHub Pages (`.nojekyll` present).
- **Slides:** Claude Slides artifact https://claude.ai/artifact/B7bV9cQnWU4FCvbQWLHYf2, 5 slides: cover, family, advisor, sauce, privacy (backup).
  - The source is copied to `slides/claude_deck/`.
  - It is private until Rizaldy shares it from the page.
- **Editable PPTX alternative:** `slides/secret_sauce.pptx` from `build_secret_sauce.py`. Canva's API rejects PPTX uploads, so import it by drag-and-drop in the Canva editor.
- **Video:** plan only. See `video/VIDEO_PLAN.md` and `video/RECORDING_SCRIPT.md` (11 lines, 250 words, about 1:52).
  - Rizaldy said to plan it first; don't build the render pipeline until the script is locked.

## Conventions
- **Design system:** PNC Private Bank (annaboyle-design.com/pncpb-designsystems), as Rizaldy requested. Tokens live at the top of `prototype/styles.css`:
  - navy `#10214D` / `#1A2B5C`, orange `#EF6A00`, page `#F2F3F5`, link `#2A6EBB`
  - data viz `#6F9A4B` `#424B5A` `#6593C9` `#6D4AA0`
  - notification banners: ok / attn / req / rec / info
  - Barlow stands in for DIN
  - corners at 3px radius
- **Slides:** consulting style (Rizaldy asked for it, not "AI-ish"). Action-title sentences at 48px, an uppercase tracker in `#B84F00`, a footer source line at 24px, page `#F5F6F8`.
- **Family member colours:** Margaret `#424B5A`, Tom `#8C929B`, Ryan `#6F9A4B`, Emma `#6D4AA0`, Jake `#6593C9`.
- **Illustrative numbers** (`prototype/data.js`):
  - offer $42.0M; earnout $6.0M, contingent; debt $3.1M; fees $1.3M; tax $6.9M → net $24.7M
  - split: spend $8.0M, gift $9.0M, invest $7.7M
- **Divergence:** (max − min) / 4. Fairness is 1.00 and role is 0.75.

## Decisions and why
- **Repo location:** moved out of OneDrive to `~/CodeFolder/pnc_csl_2026` for git (Rizaldy asked). The OneDrive folder is now empty.
- **No real PNC logo.** The mark is our own circle/triangle icon. The UI reads "Student concept · fictional family and figures".
- **Stats used** (only these): 80–90% net worth, 75% regret (Paper 2), 13% next-gen confidence. All are from PNC papers in the team doc. Don't add uncited numbers.
- **Product name:** "Family Table" is a working name pending a team decision (TEAM_NOTES D1).

## Do not touch
- `prototype/data.js` figures are internally consistent (the waterfall sums and the option splits total $9.0M). Change them only as a set.
- The Canva deck `DAHY7Vfs02I` belongs to the team; don't edit it without asking.

## Environment gotchas
- **Repo:** https://github.com/rzrizaldy/pnc_csl_2026 (public). Pages serves `main` root at https://rzrizaldy.github.io/pnc_csl_2026/.
- **ffmpeg has no drawtext or subtitles filter**, so captions are rendered in the page. `geq` and `alphamerge` are available for the face bubble.
- **Playwright headless shell:** `~/Library/Caches/ms-playwright/chromium_headless_shell-1234/...`, using `playwright-core@1.48.2` in `video/src/node_modules` (gitignored).
- **Previewing the PPTX:** `qlmanage -t -s 1600 -o <dir> file.pptx`. Quick Look substitutes Times for Barlow.
- **Browser pane** can't drive `file://` pages. Serve with `python3 -m http.server 4311` from the repo root.

## Verification completed
- `node shots.js` rendered all 12 routes with zero console or page errors. The screenshots were reviewed visually after the restyle.
- The showcase full-page screenshot rendered with no errors.
- The Quick Look render of `secret_sauce.pptx` showed no overlaps.
- The Claude slides were published. They were **not** visually checked: the Slides type says not to verify unless asked.

## Next steps
1. Add the Pages link to the team deck (slide 7 or 8 footer) so judges can click through.
2. The team reviews the script by Tue noon. Then build `video/src/{narration.json,tts.py,render.js,ingest.py,make_music.py}` following `VIDEO_PLAN.md` §5, and render the TTS draft.
3. Nindy records Tue 6 PM. Ingest and render the final; upload to Drive with link sharing (ask Rizaldy first).
4. Interviews: still the biggest scoring gap (20%). See TEAM_NOTES §4.
