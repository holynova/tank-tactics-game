"""Normalize AI-generated raster assets. This only slices, aligns and encodes images; it does not draw artwork."""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'source-art'
DEST = ROOT / 'public' / 'art'
DEST.mkdir(parents=True, exist_ok=True)
STRIPS = {'tank-red-drive': 4, 'tank-blue-drive': 4, 'fx-explosion': 6, 'fx-splash': 6, 'fx-muzzle': 4, 'fx-dust': 4}
report = []

def bbox(img):
    return img.getchannel('A').point(lambda a: 255 if a > 12 else 0).getbbox()

for path in sorted(SOURCE.glob('*.png')):
    name = path.stem
    img = Image.open(path)
    if name in STRIPS:
        count = STRIPS[name]
        rgba = img.convert('RGBA')
        slots = [rgba.crop((round(i*img.width/count), 0, round((i+1)*img.width/count), img.height)) for i in range(count)]
        boxes = [bbox(slot) for slot in slots]
        if any(box is None for box in boxes):
            raise ValueError(f'Empty animation frame: {name}')
        # One shared scale for the complete strip. Unit frames share the same center anchor.
        content_width = max(box[2]-box[0] for box in boxes)
        content_height = max(box[3]-box[1] for box in boxes)
        size = 192 if name.startswith('tank') else 160
        scale = min((size-16)/content_width, (size-16)/content_height)
        sheet = Image.new('RGBA', (size*count,size))
        for i, (slot, box) in enumerate(zip(slots,boxes)):
            if name.startswith('tank'):
                content = slot.crop(box)
                frame = content.resize((round(content.width*scale),round(content.height*scale)), Image.Resampling.NEAREST)
                offset = ((size-frame.width)//2, (size-frame.height)//2)
            else:
                # Effects must grow over time, so do not scale individual frames up to a common size.
                # The original fixed slot center and common crop bounds preserve changing effect size.
                union = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
                content = slot.crop(union)
                scale_fx = min((size-12)/content.width,(size-12)/content.height)
                frame = content.resize((round(content.width*scale_fx),round(content.height*scale_fx)),Image.Resampling.NEAREST)
                offset = ((size-frame.width)//2, (size-frame.height)//2)
            sheet.alpha_composite(frame, (size*i+offset[0],offset[1]))
        sheet.save(DEST / f'{name}.webp', lossless=True, method=6)
        if name.startswith('tank'):
            # Use the same seed as the loop's first frame to avoid an idle-to-moving model pop.
            sheet.crop((0,0,size,size)).save(DEST / f'{name.removesuffix("-drive")}.webp', lossless=True,method=6)
        report.append({'name':name,'frames':count,'frameSize':size,'boxes':boxes})
    elif name.startswith('tank'):
        continue
    elif name.startswith('ship') or name in ('fx-wake', 'fx-shell'):
        rgba=img.convert('RGBA')
        content=rgba.crop(bbox(rgba))
        size=192
        ratio=min((size-12)/content.width,(size-12)/content.height)
        frame=content.resize((round(content.width*ratio),round(content.height*ratio)),Image.Resampling.NEAREST)
        normalized=Image.new('RGBA',(size,size))
        normalized.alpha_composite(frame,((size-frame.width)//2,(size-frame.height)//2))
        normalized.save(DEST/f'{name}.webp',lossless=True,method=6)
    else:
        target = (1536,1024) if name.startswith('scene') else (640,640)
        img.convert('RGB').resize(target,Image.Resampling.LANCZOS).save(DEST/f'{name}.webp',quality=90,method=6)

(ROOT/'source-art'/'normalization-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
manifest=[]
for path in sorted(DEST.glob('*.webp')):
    img=Image.open(path)
    manifest.append({'file':path.name,'width':img.width,'height':img.height,'bytes':path.stat().st_size,
        'frames':STRIPS.get(path.stem,1),'source':'source-art/'+(path.stem+'-drive' if path.stem in ('tank-red','tank-blue') else path.stem)+'.png'})
    print(f'{path.name}: {img.width}x{img.height}, {path.stat().st_size//1024} KiB')
(DEST/'manifest.json').write_text(json.dumps({'generator':'ChatGPT built-in imagegen','assets':manifest},indent=2),encoding='utf8')
