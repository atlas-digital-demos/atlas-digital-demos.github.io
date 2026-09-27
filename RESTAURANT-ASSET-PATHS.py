from pathlib import Path
from urllib.parse import urlparse,unquote
from html.parser import HTMLParser
import re,sys
root=Path(sys.argv[1]).resolve();slug=sys.argv[2]; page=root/'reviews/20260927'/slug/'index.html'
class P(HTMLParser):
 def __init__(self):super().__init__();self.paths=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  for k in ('src','href'):
   if k in attrs: self.paths.append(attrs[k])
p=P();p.feed(page.read_text()); urls=p.paths
for f in (root/'reviews/20260927'/slug/'assets').glob('*.css'):
 urls+=re.findall(r'url\(([^)]+)\)',f.read_text())
for f in (root/'reviews/20260927'/slug/'assets').glob('*.js'):
 s=f.read_text()
 urls+=re.findall(r'/reviews/20260927/[^\s"\x27`<>]+?\.(?:webp|mp4|js|woff2)',s)
missing=[]
for raw in urls:
 u=raw.strip('\'" ')
 if u.startswith(('data:','http:','https:','mailto:','tel:','#','/src/')):continue
 path=urlparse(u).path
 if path.startswith('/'): dest=root/path.lstrip('/')
 else:dest=page.parent/path
 if not dest.is_file():missing.append((u,str(dest)))
if missing:
 print('FAIL missing assets:',*missing[:12],sep='\n');sys.exit(1)
print('PASS',slug,'checked',len(urls),'references')
