import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateDesign,placements} from '../shared.mjs';
test('Both prepared designs retain four printable areas, a common QR and production guards',async()=>{
 for(const name of ['forgiven','action-worship-encourage']){
  const p=JSON.parse(await readFile(new URL(`../public/presets/${name}.json`,import.meta.url),'utf8'));
  assert.equal(p.rights,false);assert.equal(p.catalogId,null);assert.equal(p.qr.url,'https://awemissions.github.io/Awe-faith/');
  p.rights=true;assert.doesNotThrow(()=>validateDesign(p));
  for(const k of placements){const png=Buffer.from(p.sides[k].src.split(',')[1],'base64');assert.equal(png.readUInt32BE(16),p.dimensions[k].width);assert.equal(png.readUInt32BE(20),p.dimensions[k].height)}
  const reduced=structuredClone(p);reduced.sides.back.scale=50;assert.throws(()=>validateDesign(reduced),/QR code/);
  const short=structuredClone(p);short.dimensions.sleeve_left.height=900;assert.throws(()=>validateDesign(short),/long sleeve/);
 }
});
