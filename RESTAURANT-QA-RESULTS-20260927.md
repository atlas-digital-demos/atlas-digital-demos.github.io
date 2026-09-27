# Local quality checks - 2026-09-27

The isolated 2026-09-27 builds are committed on branch `fix/premium-restaurant-media-20260927`, not deployed to Pages. Do not hand out guessed Pages URLs or the one-hour anonymous Netlify Drop URL. Original review files and main branch remain unchanged.

| Review | Local HTML | External JS | Customer-photo zoom MP4 | Desktop ScrollTrigger count | Routen auf 393px | Desktop/phone/iPad hero | Console/overflow |
|---|---:|---:|---:|---:|---|---|---|
| Buchenauerhof | 708 B | 1,429,723 B | 525,943 B | 42 | Home, Speisekarte, Feste, Kontakt, Impressum, Datenschutz | visually checked | none / 0 px |
| Himmel & Ähd | 722 B | 1,428,234 B | 666,270 B | 42 | same | visually checked | none / 0 px |
| Szültenbürger | 735 B | 1,433,985 B | 465,328 B | 42 | same | screenshots taken, review pending | none / 0 px |

`npm run build` in each separate React source archive invokes `build-gate.py`; it rejects base64 images/fonts/video, missing hashed JS, missing playable customer-specific MP4 or poster, excessive HTML/JS/video. `RESTAURANT-ASSET-PATHS.py` checks local CSS/JS/HTML references for missing deployed assets. Runtime checks are separate, not replaced by these static assertions.

Root cause: earlier previews were packaged as one HTML by embedding 29-33 WebP images and fonts directly, bypassing the separate-asset build and budget gate. The copied React source did not actually render a video; its archived older MP4 for Himmel was Szültenbürger footage and not safe to reuse. Existing Peperoncino source created only 24 scroll triggers; no runtime count check stopped it. Isolated V5 builds serve each customer's photos, fonts, CSS, JS and self-photo-derived zoom MP4 separately; 18 additional scroll-controlled scenes bring the measured desktop total to 42. An image zoom is not footage from the customer. Rights for production use still need verification.

Outstanding: authenticated deploy to a durable domain; live QA of every route, asset and visual; preview must not be passed to Michelle until this is done. A design review is not legal clearance for customer production, and only Benjamin can decide final customer release.
