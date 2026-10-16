from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
p=Path('outputs/printful-artwork')
def letter(text,w,h):
 f=ImageFont.truetype('C:/Windows/Fonts/ARIALNB.TTF',1000);b=f.getbbox(text);im=Image.new('RGBA',(b[2]-b[0]+20,b[3]-b[1]+20));ImageDraw.Draw(im).text((10-b[0],10-b[1]),text,font=f,fill='#111015');return im.crop(im.getbbox()).resize((w,h),Image.Resampling.LANCZOS)
im=Image.new('RGBA',(4800,6000));im.alpha_composite(letter('RGIV',3600,2400),(600,850));d=ImageDraw.Draw(im)
for txt,y,size in [('EPHESIANS',3500,100),('2:8–9',3650,85),('AWE FAITH',4830,70)]:
 f=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',size);d.text((2400,y),txt,font=f,fill='#111015',anchor='mt')
im.alpha_composite(Image.open('outputs/designs/awefaith-app-qr.png').convert('RGBA'),(1995,3850));im.save(p/'forgiven-wrap-back-v8.png',dpi=(300,300))
for side,txt,angle in [('left','FO',90),('right','EN',-90)]:
 im=Image.new('RGBA',(2400,6000));im.alpha_composite(letter(txt,4600,1800).rotate(angle,expand=True),(300,800));im.save(p/f'forgiven-wrap-{side}-v8.png',dpi=(300,300))
