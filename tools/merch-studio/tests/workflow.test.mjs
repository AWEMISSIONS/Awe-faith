import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server.mjs';

test('Full draft and Printful mapping workflow with simulated providers and no network access',async()=>{
 const original=globalThis.fetch;let created=0,mapped=0;const captured=[];
 const png=Buffer.alloc(24);Buffer.from('89504e470d0a1a0a','hex').copy(png);png.writeUInt32BE(1800,16);png.writeUInt32BE(2400,20);const art='data:image/png;base64,'+png.toString('base64');
 globalThis.fetch=async(url,options={})=>{
   const ok=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
   if(url==='https://api.printful.com/stores')return ok({result:[{id:8,type:'shopify',name:'Test Printful'}]});
   if(url==='https://api.printful.com/products/71')return ok({result:{product:{id:71},variants:[{id:101,color:'Black',size:'M'}]}});
   if(url==='https://api.printful.com/mockup-generator/printfiles/71')return ok({result:{printfiles:[{id:1,width:1800,height:2400,dpi:150}],variant_printfiles:[{variant_id:101,placements:{front:1,back:1,sleeve_left:1,sleeve_right:1}}]}});
   if(url==='https://api.printful.com/sync/products/@42')return ok({result:{sync_variants:[{id:55,external_id:'43'}]}});
   if(url==='https://api.printful.com/sync/variant/55'){
     if(options.method==='PUT'){mapped++;captured.push(JSON.parse(options.body));return ok({result:{sync_variant:{synced:true}}})}
     return ok({result:{sync_variant:{synced:true}}});
   }
   if(url==='https://uploads.example.test/asset'){assert.ok(options.body instanceof FormData);return new Response('',{status:201})}
   if(url==='https://test-store.myshopify.com/admin/api/2026-10/graphql.json'){
     const {query,variables}=JSON.parse(options.body);
     if(query.includes('shop{name'))return ok({data:{shop:{name:'Test Shopify'}}});
     if(query.includes('stagedUploadsCreate'))return ok({data:{stagedUploadsCreate:{stagedTargets:[{url:'https://uploads.example.test/asset',resourceUrl:'https://assets.example.test/image',parameters:[]}],userErrors:[]}}});
     if(query.includes('fileCreate'))return ok({data:{fileCreate:{files:[{id:'gid://shopify/MediaImage/1'}],userErrors:[]}}});
     if(query.includes('node(id:'))return ok({data:{node:{fileStatus:'READY',image:{url:'https://cdn.shopify.com/test.png'}}}});
     if(query.includes('productSet')){created++;captured.push(variables.input);return ok({data:{productSet:{product:{id:'gid://shopify/Product/42',title:'Test tee',status:'DRAFT',variants:{nodes:[{id:'gid://shopify/ProductVariant/43',selectedOptions:[{name:'Color',value:'Black'},{name:'Size',value:'M'}]}]}},userErrors:[]}}})}
   }
   throw Error('Unexpected simulated request: '+url);
 };
 try{
   await api('/api/connect/shopify',{domain:'test-store.myshopify.com',token:'fake-test-token'});
   await api('/api/connect/printful',{token:'fake-test-token',storeId:8});
   const design={projectId:'isolated-test',title:'Test tee',price:29,rights:true,colors:['Black'],sizes:['M'],catalogId:71,variantMap:{'Black|M':101}};
   await assert.rejects(api('/api/draft',{design,confirm:false}),/confirm/);
   await assert.rejects(api('/api/draft',{design:{...design,variantMap:{'Black|M':999}},confirm:true,artwork:{front:art}}),/mapping/);
   const result=await api('/api/draft',{design,confirm:true,artwork:{front:art},mockup:art});
   assert.equal(result.product.status,'DRAFT');assert.equal(created,1);
   await api('/api/draft',{design,confirm:true,artwork:{front:art},mockup:art});assert.equal(created,1,'retry does not duplicate a known draft');
   const synced=await api('/api/sync',{projectId:design.projectId,confirm:true});assert.equal(mapped,1);assert.equal(synced.results[0].ok,true);assert.equal(captured.at(-1).variant_id,101);assert.equal(captured.at(-1).files[0].type,'front');assert.equal(captured[0].status,'DRAFT');
   const four={...design,projectId:'four-area-test',sides:{sleeve_left:{text:'FORGIVEN'},sleeve_right:{text:'FORGIVEN'}}};
   await assert.rejects(api('/api/draft',{design:four,confirm:true,artwork:{front:art,back:art}}),/Missing artwork/);
   const bad=Buffer.from(png);bad.writeUInt32BE(900,16);
   await assert.rejects(api('/api/draft',{design:four,confirm:true,artwork:{front:art,back:art,sleeve_left:'data:image/png;base64,'+bad.toString('base64'),sleeve_right:art}}),/dimensions/);
   await api('/api/draft',{design:four,confirm:true,artwork:{front:art,back:art,sleeve_left:art,sleeve_right:art},mockup:art});
   await api('/api/sync',{projectId:four.projectId,confirm:true});
   assert.deepEqual(captured.at(-1).files.map(x=>x.type),['front','back','sleeve_left','sleeve_right']);
 }finally{globalThis.fetch=original}
});
