const BASE=new URL('./',self.registration.scope).pathname;
const CACHE='awe-faith-shell-v38';
const APP_FILES=['apphub/index.html','apphub/styles.css','apphub/app.js','watchmen/index.html','watchmen/styles.css','watchmen/app.js','hidden-in-my-heart/index.html','hidden-in-my-heart/styles.css','hidden-in-my-heart/app.js','bible-verse-sprint/index.html','bible-verse-sprint/styles.css','bible-verse-sprint/app.js','one-year-in-the-word/index.html','one-year-in-the-word/styles.css','one-year-in-the-word/app.js','sat-vocabulary-sprint/index.html','sat-vocabulary-sprint/styles.css','sat-vocabulary-sprint/app.js','daber-hebrew-coach/index.html','daber-hebrew-coach/styles.css','daber-hebrew-coach/app.js','asl-sign-coach/index.html','asl-sign-coach/styles.css','asl-sign-coach/app.js','off-market-deal-finder/index.html','off-market-deal-finder/styles.css','off-market-deal-finder/app.js','kdp-launch-assistant/index.html','kdp-launch-assistant/styles.css','kdp-launch-assistant/app.js','jobpilot-ai/index.html','jobpilot-ai/styles.css','jobpilot-ai/app.js','po-ai-daily/index.html','po-ai-daily/styles.css','po-ai-daily/app.js','sellsnap/index.html','sellsnap/styles.css','sellsnap/app.js','pulse-path/index.html','pulse-path/styles.css','pulse-path/app.js','megastats-predictor/index.html','megastats-predictor/styles.css','megastats-predictor/app.js','family-budget/index.html','family-budget/styles.css','family-budget/app.js'];
const OPTIONAL=APP_FILES.map(p=>BASE+p);
const CORE=['','index.html','styles.css','app.js','analytics.js','updates.json','awe-fundraising-banner-v1-2-5.webp','catalog.json','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','awe-logo-mark.png'].map(p=>BASE+p);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(CORE.map(url=>cache.add(url)));
  // Preserve offline access to linked learning tools without failing installation if one is missing.
  await Promise.allSettled(OPTIONAL.map(url=>cache.add(url)));
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
      try{const cache=await caches.open(CACHE);await cache.put(req,result.clone())}catch{}
    }
    return result;
  };
  if(networkFirst)event.respondWith(fetchAndCache().catch(async()=>{
    const cached=await caches.match(req,{ignoreSearch:true});
    return cached||new Response('You are offline. Reconnect and try again.',{status:503});
  }));
  else event.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetchAndCache()));
});