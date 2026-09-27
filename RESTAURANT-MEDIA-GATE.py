#!/usr/bin/env python3
"""Fail closed on media regressions in an Atlas restaurant-copy review build."""
from pathlib import Path
import re,sys, subprocess
root=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
html=root/'dist/index.html'
if not html.exists(): sys.exit('FAIL: build first, dist/index.html missing')
page=html.read_text()
base=re.search(r'<script[^>]+src="([^"?]+assets/[^"?]+\.js)',page)
if not base: sys.exit('FAIL: hashed external JS missing')
if len(page.encode()) > 100_000: sys.exit('FAIL: HTML exceeds 100 kB')
js=root/'dist/assets'/Path(base.group(1)).name
if not js.exists(): sys.exit(f'FAIL: JS missing {js}')
if any(re.search(r'data:(?:image|font|video)/[^\s"\x27]+;base64,',p.read_text(errors='ignore')) for p in [html,*((root/'dist/assets').glob('*.js')),*((root/'dist/assets').glob('*.css'))]): sys.exit('FAIL: embedded base64 asset')
if js.stat().st_size > 1_700_000: sys.exit('FAIL: initial JS exceeds 1.7 MB')
films=list((root/'dist/reviews/20260927').glob('*/sites/*/hero-zoom-v5.mp4'))
if len(films)!=1: sys.exit(f'FAIL: expected exactly one customer-specific zoom film, got {len(films)}')
film=films[0]
if film.stat().st_size>1_200_000: sys.exit('FAIL: film exceeds 1.2 MB')
check=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(film)],text=True,capture_output=True)
if check.returncode or float(check.stdout)<4: sys.exit('FAIL: video not playable or less than 4s')
slug=film.parents[2].name
source=(root/'src/components/PeperoncinoPage.tsx').read_text()
if f'/reviews/20260927/{slug}/sites/{slug}/hero-zoom-v5.mp4' not in source or '<video className="pc-hero-video-v5"' not in source: sys.exit('FAIL: video not used in hero')
if not (root/'dist/reviews/20260927'/slug/'sites'/slug/'hero.webp').exists(): sys.exit('FAIL: still fallback missing')
print('PASS: hashed external JS/CSS, no embedded base64, one restaurant-specific playable hero zoom, static fallback; HTML',html.stat().st_size,'JS',js.stat().st_size,'MP4',film.stat().st_size)
