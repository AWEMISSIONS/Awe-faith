from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from reportlab.graphics.barcode import qr
import json,base64,io,math,textwrap

out=Path('outputs/designs'); presets=Path('outputs/awefaith-studio/public/presets')
INK='#eee8db'; DARK='#454345'; URL='https://awemissions.github.io/Awe-faith/'
def font(size,bold=True):return ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if bold else 'arial.ttf'),size)
def centered(im,text,y,size,maxwidth,fill=INK):
 d=ImageDraw.Draw(im); f=font(size)
 while d.textbbox((0,0),text,font=f)[2]>maxwidth:size-=1;f=font(size)
 d.text((im.width/2,y),text,font=f,fill=fill,anchor='mt')
def save(im,path):im.save(path,dpi=(300,300))
def data(im):
 b=io.BytesIO();im.save(b,format='PNG',dpi=(300,300));return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()

# Freshly drawn ring-and-cross logo. No source pixels are reused.
logo=Image.new('RGBA',(1200,1200));d=ImageDraw.Draw(logo)
ring='WORSHIP + ENCOURAGE + ACTION + '
for i,c in enumerate(ring):
 angle=-100+i*360/len(ring);rad=math.radians(angle)
 letter=Image.new('RGBA',(140,140));ImageDraw.Draw(letter).text((70,70),c,font=font(66),fill=INK,anchor='mm')
 letter=letter.rotate(-angle-90,resample=Image.Resampling.BICUBIC)
 x=600+385*math.cos(rad);y=490+385*math.sin(rad);logo.alpha_composite(letter,(round(x-letter.width/2),round(y-letter.height/2)))
d.polygon([(572,220),(628,220),(615,340),(805,330),(805,385),(615,375),(600,785),(585,375),(395,385),(395,330),(585,340)],fill=INK)
d.line([(583,230),(600,240),(600,365),(785,365)],fill='#ffffff',width=8)
centered(logo,'A.W.E. Missions',1000,104,1100)
save(logo,out/'awe-missions-logo.png')
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><defs><path id="ring" d="M600 105a385 385 0 1 1 -1 0"/></defs><g fill="#eee8db"><text font-family="Arial,sans-serif" font-size="66" font-weight="700" letter-spacing="5"><textPath href="#ring" textLength="2350" lengthAdjust="spacing">WORSHIP + ENCOURAGE + ACTION +</textPath></text><path d="M572 220h56l-13 120 190-10v55l-190-10-15 410-15-410-190 10v-55l190 10Z"/><text x="600" y="1085" text-anchor="middle" font-family="Arial,sans-serif" font-size="104" font-weight="700">A.W.E. Missions</text></g></svg>'''
(out/'awe-missions-logo.svg').write_text(svg,encoding='utf-8')

q=qr.QrCodeWidget(URL,barLevel='H');q.qr.make();matrix=q.qr.modules;n=len(matrix);module=18;quiet=4
code=Image.new('RGB',((n+quiet*2)*module,)*2,'white');d=ImageDraw.Draw(code)
for y,row in enumerate(matrix):
 for x,v in enumerate(row):
  if v:d.rectangle(((x+quiet)*module,(y+quiet)*module,(x+quiet+1)*module-1,(y+quiet+1)*module-1),fill='black')
save(code,out/'awefaith-app-qr.png')

verse=['For by grace are ye saved through faith; and that not of yourselves:',
       'it is the gift of God: Not of works, lest any man should boast.']
for key,heading in [('forgiven','FORGIVEN'),('action-worship-encourage','ACTION – WORSHIP – ENCOURAGE')]:
 folder=out/key;folder.mkdir(exist_ok=True)
 front=Image.new('RGBA',(3600,4800));front.alpha_composite(logo.resize((1050,1050),Image.Resampling.LANCZOS),(1275,300))
 back=Image.new('RGBA',(3600,4800))
 if key=='forgiven':
  headline=Image.new('RGBA',(5000,1000));centered(headline,heading,0,900,4800)
  bounds=headline.getbbox();headline=headline.crop(bounds).resize((3300,750),Image.Resampling.LANCZOS);back.alpha_composite(headline,(150,500))
 else:
  for word,y in zip(['ACTION','WORSHIP','ENCOURAGE'],[240,650,1060]):centered(back,word,y,450,3300)
  # The words replace FORGIVEN, keeping the verse and QR in identical locations.
 for text,y in zip(verse,[1850,1960]):centered(back,text,y,78,3280)
 centered(back,'EPHESIANS 2:8–9 · KJV',2130,85,3200)
 back.alpha_composite(code.convert('RGBA'),((3600-code.width)//2,2480))
 centered(back,'EXPLORE THE AWE FAITH APP',3380,70,3000)
 centered(back,'AWE FAITH / A.W.E. MISSIONS',3540,65,3000)
 sleeves=[]
 for side in ['sleeve_left','sleeve_right']:
  im=Image.new('RGBA',(1200,3600));strip=Image.new('RGBA',(3000,850))
  if key=='forgiven':centered(strip,heading,130,570,2900)
  else:
   # Three large words run shoulder to cuff, separated by small cross marks.
   for text,x in [('ACTION',500),('WORSHIP',1500),('ENCOURAGE',2500)]:
    word=Image.new('RGBA',(960,650));centered(word,text,200,210,940);strip.alpha_composite(word,(x-480,100))
  strip=strip.rotate(-90,expand=True);im.alpha_composite(strip,((1200-strip.width)//2,250));sleeves.append(im)
 images={'front':front,'back':back,'sleeve_left':sleeves[0],'sleeve_right':sleeves[1]}
 for k,im in images.items():save(im,folder/(k+'.png'))
 dim={k:{'width':im.width,'height':im.height,'dpi':300} for k,im in images.items()}
 state={'version':1,'projectId':'awe-'+key+'-20261015','productCategory':'hoodie','title':'AWE Faith '+heading+' Hoodie — Charcoal Concept','description':heading+'. A.W.E. Missions logo on the front; statement lettering on the back and both sleeves. Ephesians 2:8–9 (KJV) and a scannable link to the AWE Faith app below. Charcoal design target. Final fit, fabric, sizes, print method and color depend on the selected live Printful garment.','price':69,'cost':50,'colors':['Charcoal'],'sizes':['S','M','L','XL','2XL'],'shirtColor':'Charcoal','rights':False,'catalogId':None,'variantMap':{},'garmentName':None,'dimensions':dim,'qr':{'url':URL,'side':'back','sourceWidth':3600,'pixels':code.width,'minimumInches':2},'sides':{k:{'src':data(im),'text':'','scale':100,'x':50,'y':50,'textY':64,'font':'sans-serif','ink':INK,'textSize':76} for k,im in images.items()}}
 state['minimumSleeveInches']=8
 state['qr']['sourceHeight']=4800
 (presets/(key+'.json')).write_text(json.dumps(state),encoding='utf-8')
 (folder/(key+'.awefaith.json')).write_text(json.dumps(state,indent=2),encoding='utf-8')

# Clean technical mockups rendered from the same print files, not an imagined production photo.
sheet=Image.new('RGB',(2000,1500),'#f6f4ee');d=ImageDraw.Draw(sheet)
def garment(x,y,key,side):
 im=Image.new('RGBA',(620,1050));g=ImageDraw.Draw(im)
 g.polygon([(160,150),(65,195),(10,750),(100,775),(155,350),(155,920),(465,920),(465,350),(520,775),(610,750),(555,195),(460,150)],fill=DARK)
 g.rounded_rectangle((210,30,410,210),70,fill=DARK,outline='#666366',width=3)
 plate=Image.open(out/key/(side+'.png'));plate.thumbnail((270,480));im.alpha_composite(plate,(175,255))
 if side=='back':
  for name,x0 in [('sleeve_left',28),('sleeve_right',515)]:
   sleeve=Image.open(out/key/(name+'.png'));sleeve.thumbnail((65,420));im.alpha_composite(sleeve,(x0,310))
 else:g.line([(220,740),(200,840),(420,840),(400,740)],fill='#777377',width=3)
 sheet.paste(im,(x,y),im)
garment(10,200,'forgiven','front');garment(680,200,'forgiven','back');garment(1350,200,'action-worship-encourage','back')
d.text((60,45),'AWE FAITH / WEAR THE MISSION',font=font(52),fill='#252b27')
d.text((60,120),'Charcoal concepts • Separate front, back and sleeve prints',font=font(30,False),fill='#555855')
for x,label in [(130,'SHARED FRONT LOGO'),(790,'FORGIVEN'),(1430,'ACTION / WORSHIP / ENCOURAGE')]:d.text((x,1260),label,font=font(25),fill='#252b27')
d.text((60,1370),'ILLUSTRATIVE PLACEMENT STUDY • Final garment, print size and mockups require Printful verification.',font=font(25,False),fill='#555855')
save(sheet,out/'hoodie-designs-preview.png')
print('Created both four-area projects, logo masters, QR and placement preview. QR payload:',URL)
