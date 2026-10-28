# Three slides for the team Canva deck (Rz's pages)

`family_table_3_slides.pptx` holds the three pages for the team deck `DAHY7Vfs02I`, pages 7 to 9:

1. **AI Client & Family Experience.** Five phones: Explore and Onboard as the lead-in, then the core journey of Align, Allocate and Activate.
2. **AI Advisor Workbench.** A table by stage (Explore, Align, Allocate, Activate) showing what the AI does and what Alex decides, plus app screens.
3. **Added Value: The Secret Sauce & Core Innovation.** Three assets, each tagged with the stages it powers, plus the value to the family and to PNC.

Every text box, card, table and band is a native shape, so it stays editable in Canva. Only the app screens are images. The look follows the team deck: cream `#FFF3DE`, orange `#FF6A33`, band `#FFB471`, slate `#344C5F`, Arial. Speaker notes are in each slide.

**Import:** in Canva, drag the .pptx onto the home page or use Create a design › Import file. Then copy the three pages into the team deck.

**Rebuild:**
1. `cd video/src && node slide_shots_canva.js`, with a server on 4311 serving the repo root.
2. `python3 slides/canva/build_canva_slides.py`.

`preview_slide*.png` are approximate renders from `pptx_preview.py`. PowerPoint or Canva may wrap text slightly differently.
