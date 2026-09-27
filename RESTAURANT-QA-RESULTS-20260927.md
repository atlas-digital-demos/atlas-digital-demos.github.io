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

## Client-motif regression, 17:50 CEST

The local hero screenshot revealed the large glossy chili inherited from Peperoncino on all three restaurant copies. That is a cross-client error, not an acceptable restaurant-specific motif. Each new isolated source now uses a WebGL-rendered round photo medallion with a separate original restaurant food image: Buchenauerhof's own regional main course (`grana.webp`); Himmel & Ähd's dish and fries (`pizza.webp` despite an inherited filename); Szültenbürger's own plate (`antipasti.webp`). Chili component and image assets were removed from the new folders; loader icon was replaced by the restaurant name, and client-facing Peperoncino-Design text replaced. The medallion preserves the moving scroll anchor and WebGL canvas while avoiding foreign-client iconography.

The new static gate rejects Peperoncino/Brühl/chili client-facing source tokens and copied `chili*.webp` assets. This is an automated guard, not a substitute for viewing the pixels and confirming provenance. Following the initial QA failure and repair, all three builds and asset paths were rechecked; desktop local runtime still recorded 42 ScrollTriggers and a playing restaurant-specific MP4; phone/iPad 34 triggers, no observed 4xx/console errors or horizontal overflow. Pixel review of desktop/phone/iPad revealed the round medallion partly obscured the headline and had a horizontal brown strip across its center. This was **not accepted**: the diameter and placement were reduced, the geometry oriented, and the build gate rerun. A fresh pixel inspection of the smaller geometry remains required. The builds remain local and are not ready to distribute.
