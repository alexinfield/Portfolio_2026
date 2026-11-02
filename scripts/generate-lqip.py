"""Generate lib/lqip.json: a tiny pre-blurred WebP placeholder (data URI) for every raster image the
site renders (case panels, home covers, Info artwork, video posters, Personal media).

Offline step (Pillow with WebP), re-run after adding or replacing images:
    python3 scripts/generate-lqip.py
Each placeholder is decoded from the smallest existing variant of its image, resized to 24 px wide,
lightly blurred and saved as WebP (q40), so it upscales as a soft blur, not blocks. Images with real
transparency inside the frame get no placeholder, so a loaded image always paints exactly as before.
"""
import base64, io, json, re
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
RASTER = re.compile(r'''/assets/[^"'`\s)]+?\.(?:png|jpe?g|webp|avif|gif)''', re.I)
WIDTH = 24

def used_sources():
    found = set()
    for path in [*ROOT.glob('app/**/*.tsx'), *ROOT.glob('lib/*.ts'), *ROOT.glob('lib/*.json')]:
        if path.name == 'lqip.json': continue
        found.update(RASTER.findall(path.read_text(encoding='utf-8')))
    personal = json.loads((ROOT / 'lib/personal.json').read_text())
    def visit(media):
        if media.get('kind') == 'image': found.add('/assets/personal/' + media['src'])
        if media.get('poster'): visit(media['poster'])
    for item in personal['items']:
        if item.get('hidden'): continue
        visit(item['cover']); [visit(m) for m in item['gallery']]
    return sorted(found)

def decode_input(source):
    """Smallest decodable file for this image: -wNNN.webp siblings first, then the file itself."""
    file = PUBLIC / source.lstrip('/')
    base = re.sub(r'(-w\d+)?\.[^.]+$', '', file.name)
    siblings = sorted(file.parent.glob(base + '-w*.webp'), key=lambda p: int(re.search(r'-w(\d+)\.webp$', p.name).group(1)))
    for candidate in [*siblings, file]:
        try:
            image = Image.open(candidate); image.load(); return image
        except Exception:
            continue
    return None

def has_interior_alpha(image):
    if image.mode not in ('RGBA', 'LA', 'PA') and 'transparency' not in image.info: return False
    alpha = image.convert('RGBA').getchannel('A')
    w, h = alpha.size; pad = max(2, round(min(w, h) * 0.01))
    inner = alpha.crop((pad, pad, w - pad, h - pad))
    low = sum(count for value, count in enumerate(inner.histogram()) if value < 250)
    return low > inner.size[0] * inner.size[1] * 0.002

def placeholder(image):
    rgb = image.convert('RGB')
    height = max(1, round(WIDTH * rgb.height / rgb.width))
    small = rgb.resize((WIDTH, height), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    out = io.BytesIO(); small.save(out, 'WEBP', quality=40, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()

def main():
    result, skipped = {}, {}
    for source in used_sources():
        if not (PUBLIC / source.lstrip('/')).exists(): skipped[source] = 'missing'; continue
        image = decode_input(source)
        if image is None: skipped[source] = 'undecodable'; continue
        if has_interior_alpha(image): skipped[source] = 'transparent'; continue
        result[source] = placeholder(image)
    (ROOT / 'lib/lqip.json').write_text(json.dumps({'width': WIDTH, 'images': result, 'skipped': skipped}, indent=1, sort_keys=True) + '\n')
    sizes = [len(v) for v in result.values()]
    print(f'{len(result)} placeholders, {len(skipped)} skipped, data URI chars: max {max(sizes)}, mean {sum(sizes)//len(sizes)}')
    for key, why in skipped.items(): print('  skipped', why, key)

if __name__ == '__main__':
    main()
