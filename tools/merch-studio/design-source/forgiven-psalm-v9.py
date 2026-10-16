from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
exec(open('work/forgiven-wrap-v8.py').read().split("im=Image.new('RGBA',(4800")[0])
im=Image.new('RGBA',(4800,6000));im.alpha_composite(letter('RGIV',3600,2400),(600,850));d=ImageDraw.Draw(im)
for txt,y,size in [('P S A L M',3450,260),('32:1',3790,240),('AWE FAITH',5130,85)]:
 f=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',size);d.text((2400,y),txt,font=f,fill='#111015',anchor='mt')
im.alpha_composite(Image.open('outputs/designs/awefaith-app-qr.png').convert('RGBA'),(1995,4150));im.save(p/'forgiven-wrap-back-psalm-v9.png',dpi=(300,300))

