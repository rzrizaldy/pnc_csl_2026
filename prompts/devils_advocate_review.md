# Prompt: devil's-advocate review of Family Table (CSL 2026)

Copy everything below the line into a fresh agent session opened in `~/CodeFolder/pnc_csl_2026`.

---

You are reviewing a student team's entry to the 2026 CSL case competition, sponsored by PNC. Your job is to be the **devil's advocate**: find every reason this could lose, before the judges do. You are not here to encourage. Be specific, be fair, and back every criticism with evidence from the files.

Take four perspectives, one after another:
1. **CSL judge** scoring against the rubric below.
2. **PNC Private Bank executive** deciding whether to fund a pilot.
3. **PNC compliance / legal officer** (privacy, advice, conflicts of interest).
4. **UX researcher** who has interviewed family-business owners and heirs.

## The competition (what the entry must do)
- **Prompt:** design an AI-powered platform with a Client/Family Experience and an Advisor Workbench that helps PNC Private Bank keep client relationships and capture next-gen assets during a family financial transition. The chosen scenario is the sale of a family-owned business.
- **Deliverables:** an 8–10 slide PDF deck and a 2-minute video. Due Wed Oct 28, 11:59 PM ET.
- **Scoring:** Customer Discovery 20% · Product Design & Dual-Sided UX 25% · Secret Sauce & Defensibility 20% · Pitch & Storytelling 20% · Business Thesis & Adoption Hypotheses 15%.
- **Rules:**
  - Be specific about AI: no vague "AI-powered", and say where a human oversees it.
  - Cite external data.
  - Core concepts must come from the team.

## Scan this folder first (read, don't skim)
- `README.md`, `docs/TEAM_NOTES.md`, `current-context-what-next.md`: the team's own account. Treat these as claims to verify, not facts.
- `index.html`, `case.html`, `architecture.html`, `site.css`: the public showcase. Live at https://rzrizaldy.github.io/pnc_csl_2026/.
- `prototype/` (`index.html`, `app.js`, `data.js`, `styles.css`): the clickable prototype. `data.js` holds every number and all simulated AI answers.
- `prototype/shots/`: screenshots. `*_m.png` are mobile.
- `slides/claude_deck/`: the consulting slides (7 HTML slides + `deck.json`). `slides/secret_sauce/build_secret_sauce.py` is an older PPTX version.
- `video/archive/VIDEO_PLAN.md`, `video/archive/RECORDING_SCRIPT_v5.md`: the 2-minute video plan and script (not yet recorded).

Run the prototype and click through it as each persona: Alex, Walt, Dale, Kyle, Sloane. Do it at phone width (390px) and desktop width.

```bash
python3 -m http.server 4311
```

Then open http://localhost:4311/prototype/?reset#/

## What to attack

1. **Customer discovery (20%).** Is there any primary research: interviews, quotes, numbers from real people? Or is it all PNC papers plus a TV show? How would a judge score it as it stands? What is the minimum that would move the score?
2. **The Succession framing.**
   - Is it a memorable hook, or a gimmick that replaces real discovery?
   - Check every plot claim on `case.html` against reliable sources (episode titles, who did what).
   - Does a billion-dollar media empire map credibly to a $48M freight company?
   - Is there any IP or trademark risk in how it's used?
3. **Core assumption: honest private answers.** Would an heir really tell their father's bank what they think? Who is the advisor's client: Walt or the family? What happens when Sloane's shared answer reveals a conflict Alex then acts on?
4. **Compliance and legal.**
   - Using commercial-banking transaction data to trigger Private Bank outreach (GLBA, internal information barriers, customer consent).
   - Whether the assistant's answers amount to legal or tax advice.
   - Fiduciary and conflict-of-interest problems in advising several family members at once.
   - Record-keeping for AI outputs.
5. **AI specificity and honesty.**
   - Is each AI component concrete (inputs, outputs, human check)?
   - Is anything AI-washed, where a rule or a human would do?
   - Is "simulated Claude/GPT" acceptable, or does it look like a demo with no substance?
   - Is the sale-likelihood model plausible? What training data would PNC need, and how many labelled exits exist?
6. **Secret sauce (20%).** Could JPMorgan, Morgan Stanley at Work, Carta or an RIA copy this in six months? Is "PNC banks the business" really unique, given most mid-market companies bank with more than one institution?
7. **Business thesis (15%).**
   - Check the money logic: $27.0M net proceeds retained, $9–10M to heirs.
   - How many qualifying sales does PNC see per year? `TEAM_NOTES` / the team doc cite 1,800–3,500 US lower-middle-market family-business sales a year.
   - What does it cost to build and run?
   - Are the three pilot hypotheses testable and the right ones?
8. **Product and UX (25%).**
   - Is the dual-sided journey clear in under 60 seconds?
   - Is a family app the right channel for a once-in-a-lifetime, 12–24-month event?
   - Does the "adaptive UI" add value, or is it complexity?
   - Mobile quality, accessibility, and copy tone.
   - Does it still look generic or "AI-generated" anywhere?
9. **Internal consistency.**
   - Do numbers match across `data.js`, the slides, the site and the video script? Check proceeds, the gift split, the 3-of-5 claim and the stats.
   - Are the persona names consistent? The Canva deck still uses a Wilson family; the prototype uses the Hales.
10. **Pitch and video (20%).**
    - Does the 226-word script hook in the first 10 seconds?
    - Does it fit 2:00?
    - Does it demo the product, or just narrate slides?
    - What would make a judge stop watching?

## Rules for you
- **Do not edit any file.** This is a review only.
- **Cite evidence** as `path:line` or a URL for every claim. Label each point **Verified** (you checked it) or **Suspected** (you're inferring).
- **No generic advice** ("do more user research"). Say exactly what to change, and where.
- **Steelman before you attack.** For each section, give the strongest version of the team's argument in one sentence, then break it.
- If you find a factual error (a stat, a plot point, a calculation), show the correct value and its source.

## Output format
1. **Verdict** (3 sentences): would this make the finals as it stands? What is the single biggest reason it might not?
2. **Scorecard:** a table with each rubric criterion, a likely score out of 10, the evidence, and the one change that would raise it most.
3. **Kill shots:** the 5 weaknesses most likely to cost points, ranked by expected score impact.
4. **Judge Q&A:** the 8 hardest questions a judge or PNC executive would ask, each with the best honest answer the team could give today, and what they'd need to answer it well.
5. **Factual and consistency errors:** a numbered list, each with location and fix.
6. **Fix list for the next 24 hours:** at most 10 items, each tagged with impact (H/M/L), effort (hours) and owner role (product, research, data/AI, pitch). Order by impact ÷ effort.
