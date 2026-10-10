// AWE Faith public prayer intake. Only reviewed, explicitly consented material is returned.
const allowedOrigin = "https://awemissions.github.io";
const apiUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const table = apiUrl + "/rest/v1/awe_prayer_submissions";
const cors = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
  "Vary": "Origin",
};
const response = (status: number, obj: unknown) => new Response(JSON.stringify(obj), {
  status,
  headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});
const dbHeaders = () => ({
  "apikey": serviceKey,
  "Authorization": "Bearer " + serviceKey,
  "Content-Type": "application/json",
});
async function selectRows(q: string) {
  const r = await fetch(table + "?" + q, { headers: dbHeaders(), cache: "no-store" });
  if (!r.ok) throw new Error("Database unavailable");
  return await r.json();
}
async function hashIp(ip: string) {
  const bytes = new TextEncoder().encode(serviceKey + ":awe-faith:" + ip);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,"0")).join("");
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (!apiUrl || !serviceKey) return response(503, {error:"Prayer service is not configured"});
  // Browser-origin restriction limits unintended embeds. Server-side abuse is handled by throttling below.
  const origin = req.headers.get("origin");
  if (origin && origin !== allowedOrigin) return response(403,{error:"Origin not allowed"});
  try {
    if (req.method === "GET") {
      const prayers = await selectRows("select=id,name,title,body,created_at&kind=eq.prayer&status=eq.approved&public_consent=eq.true&order=created_at.desc&limit=40");
      if (!prayers.length) return response(200, {prayers:[]});
      const ids = prayers.map((p: {id:string})=>p.id).filter((s: string)=>uuidPattern.test(s));
      const comments = ids.length ? await selectRows("select=id,parent_id,name,body&kind=eq.comment&status=eq.approved&public_consent=eq.true&parent_id=in.("+ids.join(",")+")&order=created_at.asc&limit=200") : [];
      return response(200, {prayers:prayers.map((p:{id:string;name:string;title:string;body:string})=>({id:p.id,name:p.name,title:p.title,body:p.body,comments:comments.filter((c:{parent_id:string})=>c.parent_id===p.id).map((c:{name:string;body:string})=>({name:c.name,body:c.body}))}))});
    }
    if (req.method !== "POST") return response(405,{error:"Method not allowed"});
    if (Number(req.headers.get("content-length")||0)>7500) return response(413,{error:"Request too large"});
    let input: Record<string,unknown>;
    try { input = await req.json(); } catch { return response(400,{error:"Invalid request"}); }
    if (!input || typeof input !== "object") return response(400,{error:"Invalid request"});
    // Honeypot for unsophisticated bots. Do not persist.
    if (typeof input.website === "string" && input.website.trim()) return response(201,{ok:true,message:"Request received."});
    const kind = input.kind === "comment" ? "comment" : "prayer";
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const body = typeof input.body === "string" ? input.body.trim() : "";
    const publicConsent = input.public_consent === true;
    const parentId = typeof input.parent_id === "string" ? input.parent_id : "";
    if(name.length>80 || title.length>120 || body.length<2 || body.length>(kind==="comment"?1000:2000)) return response(400,{error:"Please check the name and request length."});
    if(kind==="comment" && (!uuidPattern.test(parentId)||!publicConsent)) return response(400,{error:"Comment permission or prayer request is missing."});
    if(kind==="comment"){
      const parent=await selectRows("select=id&id=eq."+parentId+"&kind=eq.prayer&status=eq.approved&public_consent=eq.true&limit=1");
      if(!parent.length) return response(404,{error:"That prayer is no longer public."});
    }
    const forwarded=(req.headers.get("x-forwarded-for")||req.headers.get("cf-connecting-ip")||"unknown").split(",")[0].trim().slice(0,100);
    const fingerprint=await hashIp(forwarded);
    const since=new Date(Date.now()-60*60*1000).toISOString();
    const recent=await selectRows("select=id&ip_hash=eq."+fingerprint+"&created_at=gte."+encodeURIComponent(since)+"&limit=6");
    if(recent.length>=5) return response(429,{error:"Too many submissions from this connection. Please try again later."});
    const submission={
      kind,name,title:kind==="prayer"?title:"",
      body,public_consent:kind==="comment"?true:publicConsent,
      parent_id:kind==="comment"?parentId:null,ip_hash:fingerprint,status:"pending"
    };
    const saved=await fetch(table,{method:"POST",headers:{...dbHeaders(),"Prefer":"return=minimal"},body:JSON.stringify(submission)});
    if(!saved.ok) {
      console.error("Prayer intake save failed",saved.status);
      return response(503,{error:"Could not save this request. Please try again."});
    }
    return response(201,{ok:true,message:kind==="comment"?"Your encouragement was sent for review.":publicConsent?"Your prayer request was received for review before any public sharing.":"Your private prayer request was received."});
  } catch (error) {
    console.error("Prayer service error",error instanceof Error?error.message:"unknown");
    return response(503,{error:"Prayer service temporarily unavailable."});
  }
});