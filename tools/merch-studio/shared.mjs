export function validateDesign(d){
  if(!d?.title?.trim())throw Error('Add a product title.');
  if(!Number.isFinite(Number(d.price))||Number(d.price)<=0)throw Error('Enter a positive retail price.');
  if(!d.colors?.length||!d.sizes?.length||d.colors.length*d.sizes.length>100)throw Error('Select 1–100 color/size combinations.');
  if(!d.projectId||!/^[a-zA-Z0-9-]+$/.test(d.projectId))throw Error('Invalid project ID.');
  if(!d.rights)throw Error('Confirm that you have permission to use your artwork on merchandise.');
  if(d.catalogId){for(const color of d.colors)for(const size of d.sizes)if(!d.variantMap?.[`${color}|${size}`])throw Error(`Unavailable combination: ${color} / ${size}.`)}
  if(d.qr&&d.sides?.back?.src){
    const a=d.dimensions?.back,s=d.sides.back;
    const scale=Math.min(a.width*s.scale/100/d.qr.sourceWidth,a.height/(d.qr.sourceHeight||4800));
    if(d.qr.pixels*scale/a.dpi<d.qr.minimumInches)throw Error('The app QR code would print smaller than 2 inches. Increase the back artwork size or choose a larger print area.');
  }
  if(d.minimumSleeveInches)for(const k of ['sleeve_left','sleeve_right']){
    const a=d.dimensions?.[k];if(d.sides?.[k]?.src&&a&&a.height/a.dpi<d.minimumSleeveInches)throw Error('This design needs a long sleeve print area. Use Printful’s long-sleeve editor or choose another garment.');
  }
}
export function buildProduct(d,mockup){
  validateDesign(d);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return{title:d.title.trim(),descriptionHtml:`<p>${escape(d.description||'').replace(/\n/g,'<br>')}</p>`,vendor:'AweFaith / AweMissions',productType:productTypes[d.productCategory||'tshirt']||'T-Shirt',status:'DRAFT',tags:['AweFaith','AweMissions'],productOptions:[{name:'Color',position:1,values:d.colors.map(name=>({name}))},{name:'Size',position:2,values:d.sizes.map(name=>({name}))}],...(mockup?{files:[{originalSource:mockup,contentType:'IMAGE',alt:`${d.title} — illustrative preview`}]}:{}),variants:d.colors.flatMap((color,ci)=>d.sizes.map((size,si)=>({optionValues:[{optionName:'Color',name:color},{optionName:'Size',name:size}],price:Number(d.price).toFixed(2),sku:`AF-${d.projectId.slice(0,8)}-${ci+1}-${si+1}`,inventoryPolicy:'DENY',inventoryItem:{tracked:true,requiresShipping:true}})))};
}
export function csv(d){
  validateDesign(d);const p=buildProduct(d);const header=['Handle','Title','Body (HTML)','Vendor','Type','Tags','Published','Option1 Name','Option1 Value','Option2 Name','Option2 Value','Variant SKU','Variant Price','Variant Inventory Tracker','Variant Inventory Qty','Variant Inventory Policy','Variant Fulfillment Service','Variant Requires Shipping','Status'];
  const handle=`awefaith-${d.projectId.toLowerCase()}`;
  const rows=p.variants.map((v,i)=>[handle,i===0?p.title:'',i===0?p.descriptionHtml:'',i===0?p.vendor:'',i===0?p.productType:'',i===0?'AweFaith, AweMissions':'','FALSE','Color',v.optionValues[0].name,'Size',v.optionValues[1].name,v.sku,v.price,'shopify','0','deny','manual','TRUE','draft']);
  return[header,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
}
export const productTypes={tshirt:'T-Shirt',sweatshirt:'Sweatshirt',hoodie:'Hoodie'};
export function catalogCategory(product){
  const name=[product.title,product.type_name,product.type,product.model].filter(Boolean).join(' ');
  if(/hoodie|hooded/i.test(name))return 'hoodie';
  if(/sweat\s*shirt|crew\s*neck.*(?:fleece|sweat)|fleece.*crew\s*neck/i.test(name))return 'sweatshirt';
  if(/t[ -]?shirt|tee\b/i.test(name))return 'tshirt';
  return null;
}

export const placements=['front','back','sleeve_left','sleeve_right'];
