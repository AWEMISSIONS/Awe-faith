const fallbackCatalog={updated:'2026-10-10',studies:[
{id:'one-year-word',title:'365 One Year in the Word',tag:'Daily Bible study',audience:'Start anywhere',description:'A daily 30-minute ESV devotional with Scripture, historical context, cross-references, notes, and progress tracking.',url:'https://one-year-in-the-word.heath-tolley.chatgpt.site',kind:'study',badge:'Build a daily rhythm'},
{id:'hidden-heart',title:'Hidden in My Heart',tag:'Scripture memory',audience:'All ages',description:'Practice Scripture memory with verse-building, missing-word, and reference-match rounds in KJV.',url:'https://awemissions.github.io/Awe-faith/hidden-in-my-heart/',kind:'study',action:'Practice Scripture'},
{id:'revealed',title:'REVEALED — Bible & History Challenge',tag:'Bible & History study',audience:'Teens, adults & Bible study groups',description:'Explore 605 Bible and history question rounds across three learning tracks, with Scripture references, answers and explanations. Track your discoveries and challenge friends.',url:'https://awemissions.github.io/Revealed/',kind:'study',action:'Study & review'}
],games:[
{id:'bible-journey',title:'Bible Journey: Match & Discover',tag:'Bible story game',audience:'All ages',description:'Match story pairs across twelve Bible story boards, reveal Scripture and context, and play offline after installation.',url:'https://awemissions.github.io/bible_journey/',kind:'game'},
{id:'church-challenge',title:'Church Challenge',tag:'Bible quiz game',audience:'Friends & groups',description:'Create and share Scripture-based quiz challenges, including review quizzes for a Bible passage or chapter.',url:'https://awemissions.github.io/Church-Challenge/',kind:'game'},
{id:'kingdom-builders',title:'Kingdom Builders',tag:'Christian village stewardship game',audience:'All ages',description:'Make faithful choices around service, wisdom, mercy, and stewardship while building a Christian village.',url:'https://kingdom-builders.heath-tolley.chatgpt.site',kind:'game'},
{id:'verse-sprint',title:'Bible Verse Sprint',tag:'Quick Bible quiz',audience:'New and growing readers',description:'A fast Bible quiz to review key verses.',url:'https://awemissions.github.io/Awe-faith/bible-verse-sprint/',kind:'game'}
],products:[],resources:[]};
const safeUrl=(value)=>{try{const u=new URL(value,location.href);return ['https:','http:'].includes(u.protocol)?u.href:'#'}catch{return '#'}};
function card(item,index){const isGame=item.kind==='game';return `<article class="resource-card"><div class="resource-icon" aria-hidden="true">${isGame?'✦':'▤'}</div><div><h3>${escapeText(item.title)}</h3><div class="resource-meta">${escapeText(item.tag||'Bible resource')} · ${escapeText(item.audience||'All ages')}</div><p>${escapeText(item.description||'Open this resource to explore.')}</p><a class="card-link" data-analytics-resource="${escapeText(item.id)}" target="_blank" rel="noopener" href="${safeUrl(item.url)}">${escapeText(item.action|| (isGame?'Play now':'Open study'))}</a></div></article>`}
function productCard(item){return `<article class="product-card"><div><strong>${escapeText(item.title)}</strong>${item.price?`<span>${escapeText(item.price)}</span>`:''}<p>${escapeText(item.description||'AWE Missions merchandise')}</p></div><a href="${safeUrl(item.url)}" target="_blank" rel="noopener">View item</a></article>`}
function serviceCard(item){return `<article class="service-card"><strong>${escapeText(item.title)}</strong>${item.category?`<span>${escapeText(item.category)}</span>`:''}<p>${escapeText([item.address,item.description].filter(Boolean).join(' · '))}</p>${item.phone?`<a href="tel:${escapeText(item.phone.replace(/[^+0-9]/g,''))}">${escapeText(item.phone)}</a>`:''}${item.url?`<a href="${safeUrl(item.url)}" target="_blank" rel="noopener">More information</a>`:''}</article>`}
function escapeText(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function loadCatalog(){const status=document.getElementById('catalogStatus');try{const res=await fetch('./catalog.json?fresh='+Date.now(),{cache:'no-store'});if(!res.ok)throw Error('Catalog unavailable');const c=await res.json();document.getElementById('studyCards').innerHTML=(c.studies||[]).map(card).join('')||'<p>New study resources are being prepared.</p>';document.getElementById('gameCards').innerHTML=(c.games||[]).map(card).join('')||'<p>New Bible games are being prepared.</p>';document.getElementById('gamesJumpCount').textContent=(c.games||[]).length+' '+((c.games||[]).length===1?'game':'games');document.getElementById('updatedDate').textContent=c.updated||'recently';document.getElementById('resourceCards').innerHTML=(c.resources||[]).map(serviceCard).join('');status.textContent='Current resources loaded';}catch{document.getElementById('studyCards').innerHTML=fallbackCatalog.studies.map(card).join('');document.getElementById('gameCards').innerHTML=fallbackCatalog.games.map(card).join('');document.getElementById('gamesJumpCount').textContent=fallbackCatalog.games.length+' games';document.getElementById('resourceCards').innerHTML='';status.textContent='Showing saved resource links; live catalog could not refresh';}}
const APP_SHARE_URL='https://awemissions.github.io/Awe-faith/';
const shareMessage='Explore AWE Faith & Service for Bible study, games, and ways to serve: '+APP_SHARE_URL;
const sharePanel=document.getElementById('sharePanel');
function openSharePanel(){sharePanel.hidden=false;document.getElementById('closeShare').focus()}
async function shareApp(){if(navigator.share){try{await navigator.share({title:'AWE Missions | Faith & Service',text:'Explore Bible study, games, and ways to serve with AWE Missions.',url:APP_SHARE_URL});return}catch(error){if(error&&error.name==='AbortError')return}}openSharePanel()}
document.querySelectorAll('[data-share-app]').forEach(button=>button.addEventListener('click',shareApp));
document.getElementById('closeShare').addEventListener('click',()=>{sharePanel.hidden=true});
document.getElementById('textShareLink').href='sms:?body='+encodeURIComponent(shareMessage);
document.getElementById('emailShareLink').href='mailto:?subject='+encodeURIComponent('AWE Faith & Service app')+'&body='+encodeURIComponent(shareMessage);
document.getElementById('copyShareLink').addEventListener('click',async()=>{const input=document.getElementById('shareUrl');const status=document.getElementById('shareStatus');try{await navigator.clipboard.writeText(APP_SHARE_URL);status.textContent='App link copied. Paste it into a text or email.'}catch{input.focus();input.select();const copied=document.execCommand('copy');status.textContent=copied?'App link copied. Paste it into a text or email.':'Select and copy the app link above.'}});
const place=document.getElementById('place');let query='food banks food pantry food drive near';function updateSearch(){const where=place.value.trim()||'me';const q=encodeURIComponent(`${query} ${where}`);document.getElementById('mapSearch').href=`https://www.google.com/maps/search/${q}`;document.getElementById('211Search').href=`https://www.211.org/search?search=${encodeURIComponent(`${query.replace(' near','')} ${where}`)}`;document.getElementById('findHelp').href=`https://www.findhelp.org/search_results/${encodeURIComponent(where)}?postal=${encodeURIComponent(where)}&term=${encodeURIComponent(query.replace(' near',''))}`}
place.addEventListener('input',updateSearch);document.querySelectorAll('#serviceChips button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#serviceChips button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');query=btn.dataset.query;updateSearch()}));document.getElementById('locationBtn').addEventListener('click',()=>{const hint=document.getElementById('placeHint');if(!navigator.geolocation){hint.textContent='Location is not available in this browser. Enter a city or ZIP instead.';return}hint.textContent='Finding your location…';navigator.geolocation.getCurrentPosition(pos=>{place.value=`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;hint.textContent='Your location is used only to build the search you choose. Nothing is saved.';updateSearch()},()=>{hint.textContent='Location permission was unavailable. Enter a city or ZIP instead.'},{timeout:9000,maximumAge:300000})});
let installPrompt;document.getElementById('installBtn').addEventListener('click',()=>{if(!installPrompt)alert('On Android, open your browser menu and choose Install app or Add to Home screen.')});window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;const b=document.getElementById('installBtn');b.addEventListener('click',async()=>{if(!installPrompt){alert('On Android, open your browser menu and choose Install app or Add to Home screen.');return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;b.classList.add('hidden')},{once:true})});

const PRAYER_API='https://ueethdfucapmdwuananu.supabase.co/functions/v1/awe-prayer';
async function prayerRequest(payload){
  const result=await fetch(PRAYER_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
  const body=await result.json().catch(()=>({}));
  if(!result.ok)throw new Error(body.error||'Could not send request. Please try again.');
  return body;
}
async function loadPrayerWall(){
  const wall=document.getElementById('prayerWallPosts');
  try {
    const response=await fetch(PRAYER_API,{cache:'no-store'});
    if(!response.ok)throw Error('Service temporarily unavailable');
    const data=await response.json();
    const prayers=Array.isArray(data.prayers)?data.prayers:[];
    if(!prayers.length){wall.innerHTML='<div class="wall-empty"><strong>No public requests yet.</strong><p>Requests appear here only when approved for public sharing. You can send a private request below.</p></div>';return}
    wall.innerHTML=prayers.map(item=>{
      let isMarked=false;try{isMarked=localStorage.getItem('awe-prayed:'+item.id)==='true'}catch{}
      const comments=Array.isArray(item.comments)?item.comments:[];
      return '<article class="prayer-post"><div class="prayer-post-copy"><p class="eyebrow">Prayer request</p><h3>'+escapeText(item.title||'Please pray')+'</h3><p>'+escapeText(item.body||'')+'</p><small>'+(item.name?escapeText(item.name):'Shared anonymously')+'</small></div><button class="button outline prayed-button" type="button" data-pray="'+escapeText(item.id)+'" aria-pressed="'+isMarked+'">'+(isMarked?'I prayed ✓':'I prayed')+'</button><div class="approved-comments"><h4>Encouragement</h4>'+(comments.length?comments.map(c=>'<p class="approved-comment"><span>'+escapeText(c.name||'A friend')+':</span> '+escapeText(c.body||'')+'</p>').join(''):'<p class="no-comments">You can send an encouraging comment for review.</p>')+'</div><form class="wall-comment-form" data-prayer-id="'+escapeText(item.id)+'"><label>Leave an encouraging comment</label><input name="name" maxlength="80" autocomplete="name" placeholder="Name (optional)"><textarea name="comment" required minlength="2" maxlength="1000" rows="3" placeholder="Write a kind, supportive message"></textarea><div class="form-honeypot" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div><button class="button outline" type="submit">Send comment for review</button><p class="small-status" role="status" aria-live="polite"></p></form></article>';
    }).join('');
  }catch{wall.innerHTML='<p class="wall-error">The Prayer Wall is temporarily unavailable. Private requests can still be attempted below.</p>'}
}
const wallPosts=document.getElementById('prayerWallPosts');
wallPosts.addEventListener('click',event=>{
  const button=event.target.closest('[data-pray]');if(!button)return;
  const key='awe-prayed:'+button.dataset.pray;const next=button.getAttribute('aria-pressed')!=='true';
  try{if(next)localStorage.setItem(key,'true');else localStorage.removeItem(key)}catch{}
  button.setAttribute('aria-pressed',String(next));button.textContent=next?'I prayed ✓':'I prayed';
});
wallPosts.addEventListener('submit',async event=>{
  const form=event.target.closest('.wall-comment-form');if(!form)return;
  event.preventDefault();
  const button=form.querySelector('button[type=submit]');const status=form.querySelector('[role=status]');
  button.disabled=true;status.textContent='Sending encouragement…';
  try {
    const data=await prayerRequest({kind:'comment',parent_id:form.dataset.prayerId,name:form.elements.name.value.trim(),body:form.elements.comment.value.trim(),public_consent:true,website:form.elements.website.value});
    status.textContent=data.message||'Sent for review.';form.elements.comment.value='';
  } catch(error) { status.textContent=error.message||'Unable to send.'; }
  finally{button.disabled=false}
});
const prayerForm=document.getElementById('wallRequestForm');
const visibilityChoices=[...prayerForm.querySelectorAll('input[name=prayerVisibility]')];
const consentRow=document.getElementById('publicConsentRow');
const consentInput=document.getElementById('wallRequestConsent');
const prayerSend=document.getElementById('prayerSendButton');
function updatePrayerVisibility(){
  const isPublic=prayerForm.querySelector('input[name=prayerVisibility]:checked')?.value==='public';
  consentRow.hidden=!isPublic;consentInput.required=isPublic;
  if(!isPublic)consentInput.checked=false;
  prayerSend.textContent=isPublic?'Send request for review':'Send private request';
}
visibilityChoices.forEach(input=>input.addEventListener('change',updatePrayerVisibility));
updatePrayerVisibility();
prayerForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const isPublic=prayerForm.querySelector('input[name=prayerVisibility]:checked')?.value==='public';
  if(isPublic&&!consentInput.checked){document.getElementById('wallRequestStatus').textContent='Please confirm permission for public sharing.';return}
  const status=document.getElementById('wallRequestStatus');
  prayerSend.disabled=true;status.textContent='Sending your request securely…';
  try{
    const body=await prayerRequest({kind:'prayer',name:document.getElementById('wallRequestName').value.trim(),title:document.getElementById('wallRequestTitle').value.trim(),body:document.getElementById('wallRequestText').value.trim(),public_consent:isPublic&&consentInput.checked,website:document.getElementById('wallRequestWebsite').value});
    status.textContent=body.message||'Your request was received.';
    prayerForm.reset();updatePrayerVisibility();
  }catch(error){status.textContent=error.message||'Could not send. You can use the email link below.'}
  finally{prayerSend.disabled=false}
});
loadPrayerWall();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));loadCatalog();updateSearch();

const mainNav=document.getElementById('mainNav');
const tabsShell=document.querySelector('.tabs-shell');
const tabsScrollCue=document.getElementById('tabsScrollCue');
function updateTabsScrollCue(){const overflowing=mainNav.scrollWidth>mainNav.clientWidth+2;const atEnd=mainNav.scrollLeft+mainNav.clientWidth>=mainNav.scrollWidth-2;const atStart=mainNav.scrollLeft<=2;tabsShell.classList.toggle('is-scrollable',overflowing);tabsShell.classList.toggle('at-end',atEnd);tabsShell.classList.toggle('at-start',atStart);tabsScrollCue.hidden=!overflowing;tabsScrollCue.textContent=atEnd?'‹':'›';tabsScrollCue.setAttribute('aria-label',atEnd?'Scroll navigation left to see earlier tabs':'Scroll navigation right to see more tabs');tabsScrollCue.title=atEnd?'Earlier menu options':'More menu options'}
tabsScrollCue.addEventListener('click',()=>{const atEnd=mainNav.scrollLeft+mainNav.clientWidth>=mainNav.scrollWidth-2;mainNav.scrollBy({left:(atEnd?-1:1)*Math.max(160,mainNav.clientWidth*.7),behavior:'smooth'})});
mainNav.addEventListener('scroll',updateTabsScrollCue,{passive:true});
window.addEventListener('resize',updateTabsScrollCue);
requestAnimationFrame(updateTabsScrollCue);

/* Simple page routing keeps the public site URL while showing one focused page at a time. */
(function(){
  const views=[...document.querySelectorAll('.page-view[data-page]')];
  const aliases={home:'home',everything:'explore',explore:'explore',service:'explore',prayer:'prayer',prayerIntake:'prayer-request','prayer-wall':'prayer-request',study:'learn',studyCards:'learn',storyTime:'learn',games:'learn',whoBehindAwe:'awe-people',whatAweMeans:'awe-meaning',whatsNew:'whatsNew'};
  const navForPage={home:'home',explore:'explore',learn:'study',whatsNew:'whatsNew'};
  let activePage='home';
  function showPage(){
    const key=decodeURIComponent(location.hash.slice(1));
    const target=key?document.getElementById(key):null;
    const page=target?.closest('.page-view[data-page]')?.dataset.page||aliases[key]||activePage;
    activePage=page;
    views.forEach(view=>{view.hidden=view.dataset.page!==page});
    document.querySelectorAll('#mainNav a').forEach(link=>{
      const active=link.getAttribute('href')==='#'+(navForPage[page]||'');
      if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    const currentView=views.find(view=>view.dataset.page===page);
    if(!key||key==='home'){window.scrollTo({top:0,behavior:'auto'});return}
    if(target){
      const pageEntry=['explore','prayer','study','whoBehindAwe','whatAweMeans','whatsNew'].includes(key);
      (pageEntry?currentView:target)?.scrollIntoView({block:'start',behavior:'auto'});
    }else if(currentView)currentView.scrollIntoView({block:'start',behavior:'auto'});
  }
  window.addEventListener('hashchange',showPage);
  showPage();
})();




/* AWE Faith discovery, return visits, and release history. No accounts or background notifications. */
(function(){
  const read=(key,fallback='')=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
  const guide=document.getElementById('firstVisitGuide');
  if(guide&&read('awe.faith.guide.dismissed')!=='yes')guide.hidden=false;
  document.getElementById('guideDismiss')?.addEventListener('click',()=>{if(guide)guide.hidden=true;write('awe.faith.guide.dismissed','yes')});
  const recentBox=document.getElementById('resumeSection');
  const recentLink=document.getElementById('resumeLink');
  const recentHelp=document.getElementById('resumeHelp');
  function showRecent(){
    try {
      const item=JSON.parse(read('awe.faith.recent','null'));
      if(!item||!item.url||!/^https?:\/\//.test(item.url))return;
      const parsed=new URL(item.url,location.href);
      if(!['https:','http:'].includes(parsed.protocol))return;
      recentBox.hidden=false;recentLink.href=parsed.href;
      recentLink.target=parsed.origin===location.origin&&parsed.pathname===location.pathname?'_self':'_blank';
      if(recentLink.target==='_blank')recentLink.rel='noopener';
      recentLink.textContent='Open '+item.title+' →';
      recentHelp.textContent='Last opened: '+item.title+'. Your progress inside games and studies is managed by each resource.';
    } catch {}
  }
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[data-analytics-resource],a[data-track-return]');
    if(!a)return;
    const title=a.dataset.resourceTitle||a.closest('.resource-card')?.querySelector('h3')?.textContent||a.textContent.trim();
    const id=a.dataset.analyticsResource||a.dataset.trackReturn;
    const href=a.href;
    if(!/^https?:\/\//.test(href))return;
    write('awe.faith.recent',JSON.stringify({id,title,url:href,at:new Date().toISOString()}));
    showRecent();
  });
  showRecent();

  const list=document.getElementById('updatesList');
  const bellDot=document.getElementById('updateDot');
  const updatesStatus=document.getElementById('updatesStatus');
  const notice=document.getElementById('newContentNotice');
  const noticeText=document.getElementById('newContentText');
  const preference=document.getElementById('updatesOnOpen');
  preference.checked=read('awe.faith.notice.enabled','yes')!=='no';
  preference.addEventListener('change',()=>{write('awe.faith.notice.enabled',preference.checked?'yes':'no');renderUpdates();updatesStatus.textContent=preference.checked?'In-app update notices are on.':'In-app update notices are off.'});
  let current=null;
  function renderUpdates(){
    if(!current)return;
    const seen=read('awe.faith.update.seen');
    const unseen=seen!==current.version;
    bellDot.hidden=!unseen;
    list.innerHTML=current.items.map((item,index)=>'<article class="update-item'+(unseen&&index===0?' is-new':'')+'"><div class="update-item-meta"><span>'+escapeText(item.category)+'</span><time>'+escapeText(item.date)+'</time></div><h3>'+escapeText(item.title)+'</h3><p>'+escapeText(item.description)+'</p><a href="'+safeUrl(item.url)+'">Explore '+escapeText(item.category)+' →</a></article>').join('');
    const dismissed=read('awe.faith.update.dismissed');
    notice.hidden=!unseen||!preference.checked||dismissed===current.version;
    noticeText.textContent=current.items[0]?.title||'New content is available.';
  }
  document.getElementById('markUpdatesSeen').addEventListener('click',()=>{
    if(!current)return;write('awe.faith.update.seen',current.version);
    updatesStatus.textContent='All available updates marked as read.';renderUpdates()
  });
  document.getElementById('dismissNotice').addEventListener('click',()=>{
    if(current)write('awe.faith.update.dismissed',current.version);
    notice.hidden=true
  });
  // Opening the update panel acknowledges the release on this device.
  function acknowledge(){
    if(!current)return;
    write('awe.faith.update.seen',current.version);
    updatesStatus.textContent='You are viewing the latest changes.';
    renderUpdates();
  }
  document.querySelectorAll('a[href="#whatsNew"]').forEach(link=>link.addEventListener('click',()=>setTimeout(acknowledge,0)));
  async function checkReleases(){
    try{
      const r=await fetch('./updates.json?now='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw Error('Could not check updates');
      current=await r.json();
      if(!Array.isArray(current.items))throw Error('Missing updates');
      renderUpdates();
      if(location.hash==='#whatsNew')acknowledge();
    }catch{list.textContent='Update history is temporarily unavailable. Please check again soon.'}
  }
  checkReleases();
  const readyBanner=document.getElementById('updateReady');
  document.getElementById('reloadApp').addEventListener('click',()=>location.reload());
  document.getElementById('remindLater').addEventListener('click',()=>{readyBanner.hidden=true});
  if('serviceWorker' in navigator){
    const hadController=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.ready.then(reg=>{
      reg.update().catch(()=>{});
      const showReady=()=>{readyBanner.hidden=false};
      if(reg.waiting)showReady();
      reg.addEventListener('updatefound',()=>{
        const installing=reg.installing;
        if(installing)installing.addEventListener('statechange',()=>{
          if(installing.state==='installed'&&navigator.serviceWorker.controller)showReady()
        });
      });
    }).catch(()=>{});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      // The new worker is active. Never show a fake update on first-ever install.
      if(hadController)readyBanner.hidden=false;
    });
  }
})();
