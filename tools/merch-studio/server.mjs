import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {buildProduct, validateDesign, placements} from './shared.mjs';

const root=dirname(fileURLToPath(import.meta.url)), port=Number(process.env.PORT||4178);
const origin=`http://127.0.0.1:${port}`, csrf=randomBytes(32).toString('hex');
const state={shop:null, printful:null, drafts:new Map(),busy:false};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function request(url,options={}){
  const r=await fetch(url,{...options,signal:AbortSignal.timeout(60000)});
  let data; try{data=await r.json()}catch{throw Error(`Remote service returned HTTP ${r.status}.`)}
  if(!r.ok)throw Error(`Remote service returned HTTP ${r.status}. Check credentials and permissions.`);
  return data;
}
async function gql(query,variables={},auth=state.shop){
  if(!auth)throw Error('Connect Shopify first.');
  const d=await request(`https://${auth.domain}/admin/api/2026-10/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':auth.token},body:JSON.stringify({query,variables})});
  if(d.errors?.length)throw Error(d.errors.map(x=>x.message).join('; '));
  for(const v of Object.values(d.data||{}))if(v?.userErrors?.length)throw Error(v.userErrors.map(x=>x.message).join('; '));
  return d.data;
}
async function pf(path,method='GET',body,auth=state.printful){
  if(!auth)throw Error('Connect Printful first.');
  const d=await request(`https://api.printful.com${path}`,{method,headers:{Authorization:`Bearer ${auth.token}`,'X-PF-Store-Id':String(auth.storeId||''),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(d.code>=400)throw Error(d.result||'Printful rejected the request.');
  return d.result;
}
async function uploadPNG(data,name){
  if(!/^data:image\/png;base64,/.test(data||''))throw Error('A PNG export is required.');
  const bytes=Buffer.from(data.split(',')[1],'base64');
  if(bytes.length>20*1024*1024)throw Error('PNG exceeds 20 MB.');
  const d=await gql('mutation($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl parameters{name value}} userErrors{message}}}',{input:[{filename:name,mimeType:'image/png',resource:'IMAGE',httpMethod:'POST',fileSize:String(bytes.length)}]});
  const t=d.stagedUploadsCreate.stagedTargets[0], u=new URL(t.url);
  if(u.protocol!=='https:')throw Error('Unexpected upload destination.');
  const form=new FormData();t.parameters.forEach(x=>form.append(x.name,x.value));form.append('file',new Blob([bytes],{type:'image/png'}),name);
  const r=await fetch(t.url,{method:'POST',body:form,signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error('Artwork upload failed.');
  const created=await gql('mutation($files:[FileCreateInput!]!){fileCreate(files:$files){files{id} userErrors{message}}}',{files:[{originalSource:t.resourceUrl,contentType:'IMAGE',alt:name}]});
  const id=created.fileCreate.files[0].id;
  for(let i=0;i<20;i++){
    const f=await gql('query($id:ID!){node(id:$id){... on MediaImage{fileStatus image{url}}}}',{id});
    if(f.node?.fileStatus==='FAILED')throw Error('Shopify could not process the uploaded image.');
    if(f.node?.fileStatus==='READY'&&f.node.image?.url)return f.node.image.url;
    await sleep(1500);
  }
  throw Error('Shopify is still processing artwork. Check Shopify Files before retrying.');
}
export async function api(path,b){
  if(path==='/api/status')return{csrf,shop:state.shop?{domain:state.shop.domain,name:state.shop.name}:null,printful:state.printful?{storeId:state.printful.storeId,name:state.printful.name}:null};
  if(path==='/api/disconnect'){state.shop=null;state.printful=null;state.drafts.clear();return{ok:true}}
  if(path==='/api/connect/shopify'){
    const domain=String(b.domain||'').trim().toLowerCase();
    if(!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain))throw Error('Use your exact store-name.myshopify.com domain, without https://.');
    let token=b.token;
    if(!token){
      if(!b.clientId||!b.clientSecret)throw Error('Enter your Shopify app client ID and client secret.');
      const d=await request(`https://${domain}/admin/oauth/access_token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:b.clientId,client_secret:b.clientSecret})});token=d.access_token;
    }
    const auth={domain,token};const d=await gql('{shop{name myshopifyDomain}}',{},auth);auth.name=d.shop.name;if(state.shop?.domain!==domain)state.drafts.clear();state.shop=auth;return{name:auth.name};
  }
  if(path==='/api/connect/printful'){
    const auth={token:b.token,storeId:b.storeId};if(!auth.token)throw Error('Enter a Printful private token.');
    const stores=await pf('/stores','GET',null,auth);
    if(!auth.storeId)return{stores};
    const store=stores.find(x=>String(x.id)===String(auth.storeId));if(!store)throw Error('That store is not accessible to this token.');
    if(!/shopify/i.test(store.type||''))throw Error('Select the Printful store connected to Shopify.');
    auth.name=store.name;if(String(state.printful?.storeId)!==String(auth.storeId))state.drafts.clear();state.printful=auth;return{name:store.name};
  }
  if(path==='/api/catalog')return await pf('/products');
  if(path==='/api/product'){
    const id=Number(b.id);if(!Number.isInteger(id)||id<1)throw Error('Invalid product.');
    const product=await pf(`/products/${id}`);const print=await pf(`/mockup-generator/printfiles/${id}`);return{...product,print};
  }
  if(path==='/api/draft'){
    validateDesign(b.design);if(!b.confirm)throw Error('Review and confirm before creating a draft.');
    if(!state.shop||!state.printful)throw Error('Connect both accounts first.');
    if(!Number.isInteger(Number(b.design.catalogId))||Number(b.design.catalogId)<1)throw Error('Select a live Printful garment.');
    const live=await pf(`/products/${Number(b.design.catalogId)}`);
    const templates=await pf(`/mockup-generator/printfiles/${Number(b.design.catalogId)}`);
    for(const color of b.design.colors)for(const size of b.design.sizes){
      const variant=live.variants.find(x=>x.color===color&&x.size===size);
      if(!variant||Number(b.design.variantMap?.[`${color}|${size}`])!==variant.id)throw Error('Variant mapping is no longer valid. Reload the catalog.');
      const variantPlacements=templates.variant_printfiles?.find(x=>x.variant_id===variant.id)?.placements;
      for(const which of placements){
        if(which!=='front'&&!b.artwork?.[which]){if(b.design.sides?.[which]?.src||b.design.sides?.[which]?.text?.trim())throw Error('Missing artwork for '+which);continue;}
        const template=templates.printfiles?.find(x=>x.id===variantPlacements?.[which]);
        const png=String(b.artwork?.[which]||'');
        if(!/^data:image\/png;base64,/.test(png))throw Error('Exported PNG artwork is required.');
        const bytes=Buffer.from(png.split(',')[1],'base64');
        if(bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG artwork.');
        if(!template||bytes.readUInt32BE(16)!==template.width||bytes.readUInt32BE(20)!==template.height)throw Error('Print file dimensions do not match the selected Printful variants.');
        if(which.startsWith('sleeve')&&b.design.minimumSleeveInches&&template.height/template.dpi<b.design.minimumSleeveInches)throw Error('The live sleeve template is too short for this design. Finish with a long sleeve placement in Printful.');
        const declared=b.design.dimensions?.[which];
        if(declared&&(declared.width!==template.width||declared.height!==template.height||declared.dpi!==template.dpi))throw Error('Reload the live print dimensions before uploading.');
      }
    }
    const key=b.design.projectId;
    if(state.drafts.has(key)){
      const existing=state.drafts.get(key);if(JSON.stringify(existing.design)!==JSON.stringify(b.design))throw Error('This project already has a draft. Save changes as a new project before creating another.');return existing;
    }
    if(state.busy)throw Error('An operation is running. Please wait.');state.busy=true;
    try{
      const files={};for(const which of placements)files[which]=b.artwork[which]?await uploadPNG(b.artwork[which],`${key}-${which}.png`):null;
      const mockup=await uploadPNG(b.mockup,`${key}-preview.png`);
      const input=buildProduct(b.design,mockup);
      const d=await gql('mutation($input:ProductSetInput!){productSet(input:$input,synchronous:true){product{id title status variants(first:250){nodes{id selectedOptions{name value}}}} userErrors{message}}}',{input});
      const product=d.productSet.product;if(!product)throw Error('Shopify did not return a product.');
      const result={product,files,design:b.design,adminUrl:`https://${state.shop.domain}/admin/products/${product.id.split('/').pop()}`,syncResults:[]};state.drafts.set(key,result);return result;
    }finally{state.busy=false}
  }
  if(path==='/api/sync'){
    const draft=state.drafts.get(b.projectId);if(!draft)throw Error('Create the draft in this session first.');
    if(!b.confirm)throw Error('Confirm the selected Printful store and variant mapping first.');
    if(state.busy)throw Error('An operation is running. Please wait.');state.busy=true;
    try{
      const productId=draft.product.id.split('/').pop();
      let synced;
      try{synced=await pf(`/sync/products/@${productId}`)}catch{throw Error('Printful has not imported this draft yet. Refresh products in Printful, then retry. If drafts are not imported, finish setup in the Printful dashboard before making the product available for sale.');}
      const catalog=await pf(`/products/${draft.design.catalogId}`),results=[];
      for(const v of draft.product.variants.nodes){
        const color=v.selectedOptions.find(x=>x.name==='Color')?.value,size=v.selectedOptions.find(x=>x.name==='Size')?.value;
        const target=catalog.variants.find(x=>x.color===color&&x.size===size);const external=v.id.split('/').pop();
        const sync=synced.sync_variants?.find(x=>String(x.external_id)===external);
        if(!target||!sync){results.push({color,size,ok:false,message:'Variant missing in Printful. Refresh the connected store.'});continue}
        const expected=draft.design.variantMap?.[`${color}|${size}`];
        if(Number(expected)!==target.id){results.push({color,size,ok:false,message:'Catalog mapping changed. Review in Printful.'});continue}
        try{
          const files=placements.filter(k=>draft.files[k]).map(type=>({type,url:draft.files[type]}));
          await pf(`/sync/variant/${sync.id}`,'PUT',{variant_id:target.id,files,retail_price:String(draft.design.price)});
          const check=await pf(`/sync/variant/${sync.id}`);
          const sv=check.sync_variant||check;
          results.push({color,size,ok:!!sv.synced,message:sv.synced?'Mapped; review print placement in Printful.':'Mapping sent; Printful verification pending.'});
        }catch(e){results.push({color,size,ok:false,message:e.message})}
      }
      draft.syncResults=results;return{results,adminUrl:draft.adminUrl};
    }finally{state.busy=false}
  }
  throw Error('Unknown action.');
}
const server=http.createServer(async(req,res)=>{
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
  try{
    if(req.headers.host!==`127.0.0.1:${port}`){json(403,{error:'Invalid host.'});return}
    if(req.headers.origin&&req.headers.origin!==origin){json(403,{error:'Invalid origin.'});return}
    const path=new URL(req.url,origin).pathname;
    if(path.startsWith('/api/')){
      if(path==='/api/status'&&req.method==='GET'){json(200,await api(path,{}));return}
      if(req.method!=='POST'||req.headers['x-studio-token']!==csrf){json(403,{error:'Reload the studio and try again.'});return}
      let raw='',length=0;for await(const chunk of req){length+=chunk.length;if(length>90*1024*1024)throw Error('Request too large.');raw+=chunk}
      json(200,await api(path,JSON.parse(raw||'{}')));return;
    }
    const preset=/^\/presets\/(forgiven|action-worship-encourage)\.json$/.test(path)?path.slice(1):null;
    const concept=/^\/concepts\/(forgiven|action-worship-encourage|printful-worship-back|printful-forgiven-front|printful-forgiven-wrap)\.png$/.test(path)?path.slice(1):null;
    const file=concept||preset||({'/':'index.html','/app.js':'app.js','/style.css':'style.css','/shared.mjs':'../shared.mjs'})[path];
    if(!file){res.writeHead(404);res.end('Not found');return}
    const content=await readFile(resolve(root,'public',file));
    res.writeHead(200,{'Content-Type':file.endsWith('.png')?'image/png':file.endsWith('.json')?'application/json':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"});res.end(content);
  }catch(e){json(400,{error:e.message?.replace(/(shpat_|shpss_)[A-Za-z0-9]+/g,'[redacted]')||'Action failed.'})}
});
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  server.listen(port,'127.0.0.1',()=>{console.log(`AweFaith Studio: ${origin}\nLocal only. Close this window to stop. Credentials stay in memory.`);if(process.argv.includes('--open'))spawn('cmd.exe',['/c','start','',origin],{windowsHide:true,stdio:'ignore'})});
  server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Studio is already open at ${origin}.`:'Unable to start the local studio.');process.exitCode=1});
}
