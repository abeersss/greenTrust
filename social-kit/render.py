# Usage: python3 render.py slides.html  -> renders every <section class="slide" id="sN"> to slideN.jpg (1080x1350)
import sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
p = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'slides.html').resolve()
with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1080, 'height': 1350}, device_scale_factor=1)
    pg.goto(p.as_uri()); pg.wait_for_timeout(800); pg.evaluate("document.fonts.ready")
    n = pg.evaluate("document.querySelectorAll('section.slide').length")
    for i in range(1, n + 1):
        pg.locator(f'#s{i}').screenshot(path=f'slide{i}.png')
        Image.open(f'slide{i}.png').convert('RGB').save(f'slide{i}.jpg', quality=92)
        print(i, pg.evaluate(f"(()=>{{const s=document.getElementById('s{i}');return [s.scrollHeight,s.clientHeight]}})()"))
    print('fonts:', pg.evaluate("[...document.fonts].filter(f=>f.status=='loaded').map(f=>f.family+f.weight).join(',')"))
    b.close()
