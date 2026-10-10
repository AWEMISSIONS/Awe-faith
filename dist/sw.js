const BASE=new URL('./',self.registration.scope).pathname;
const CACHE='awe-faith-shell-v21';
const CORE=['','index.html','styles.css','app.js','analytics.js','updates.json','catalog.json','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'].map(p=>BASE+p);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(CORE.map(url=>cache.add(url)));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('awe-faith-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;
  const networkFirst=req.mode==='navigate'||/\.(html|css|js|json|webmanifest)$/.test(url.pathname)||url.pathname===BASE;
  const fetchAndCache=async()=>{
    const result=await fetch(req);
    if(result.ok&&result.type==='basic'){
      const cache=await caches.open(CACHE);await cache.put(req,result.clone());
    }
    return result;
  };
  if(networkFirst)event.respondWith(fetchAndCache().catch(async()=>{
    const cached=await caches.match(req,{ignoreSearch:true});
    return cached||new Response('You are offline. Reconnect and try again.',{status:503});
  }));
  else event.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetchAndCache()));
});