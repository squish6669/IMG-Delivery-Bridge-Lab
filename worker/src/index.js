const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
const cors={
  'access-control-allow-origin':'*',
  'access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers':'content-type,x-img-workspace'
};
const now=()=>new Date().toISOString();
const clean=s=>String(s??'').trim();

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
    try {
      if(url.pathname==='/health') return json({ok:true,service:'img-delivery-bridge',time:now()},200,cors);
      if(!url.pathname.startsWith('/deliveries')) return json({error:'not_found'},404,cors);
      const workspace=clean(request.headers.get('x-img-workspace')||url.searchParams.get('workspace'));
      if(!workspace) return json({error:'workspace_required'},400,cors);

      const match=url.pathname.match(/^\/deliveries\/([^/]+)$/);
      const id=match?decodeURIComponent(match[1]):null;

      if(request.method==='GET' && !id){
        const status=clean(url.searchParams.get('status'));
        let stmt='SELECT * FROM deliveries WHERE workspace_id=?';
        const args=[workspace];
        if(status){stmt+=' AND status=?';args.push(status)}
        stmt+=' ORDER BY CASE WHEN scheduled_at IS NULL OR scheduled_at="" THEN 1 ELSE 0 END, scheduled_at ASC, created_at DESC';
        const result=await env.DB.prepare(stmt).bind(...args).all();
        return json({ok:true,deliveries:result.results||[]},200,cors);
      }

      if(request.method==='POST' && !id){
        const body=await request.json();
        const rid=crypto.randomUUID();
        const ts=now();
        const row={
          id:rid,workspace_id:workspace,status:'scheduled',scheduled_at:clean(body.scheduled_at),
          recipient_name:clean(body.recipient_name),recipient_email:clean(body.recipient_email),
          location:clean(body.location),ticket:clean(body.ticket),equipment:clean(body.equipment),
          notes:clean(body.notes),delivered_by:clean(body.delivered_by),created_at:ts,updated_at:ts,completed_at:null
        };
        if(!row.recipient_name) return json({error:'recipient_name_required'},400,cors);
        await env.DB.prepare(`INSERT INTO deliveries
          (id,workspace_id,status,scheduled_at,recipient_name,recipient_email,location,ticket,equipment,notes,delivered_by,created_at,updated_at,completed_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
          row.id,row.workspace_id,row.status,row.scheduled_at,row.recipient_name,row.recipient_email,row.location,row.ticket,row.equipment,row.notes,row.delivered_by,row.created_at,row.updated_at,row.completed_at
        ).run();
        return json({ok:true,delivery:row},201,cors);
      }

      if(request.method==='PUT' && id){
        const current=await env.DB.prepare('SELECT * FROM deliveries WHERE id=? AND workspace_id=?').bind(id,workspace).first();
        if(!current) return json({error:'not_found'},404,cors);
        const body=await request.json();
        const next={...current};
        for(const k of ['scheduled_at','recipient_name','recipient_email','location','ticket','equipment','notes','delivered_by','status','completed_at']){
          if(Object.prototype.hasOwnProperty.call(body,k)) next[k]=body[k]===null?null:clean(body[k]);
        }
        if(!next.recipient_name) return json({error:'recipient_name_required'},400,cors);
        next.updated_at=now();
        if(next.status==='completed' && !next.completed_at) next.completed_at=next.updated_at;
        await env.DB.prepare(`UPDATE deliveries SET status=?,scheduled_at=?,recipient_name=?,recipient_email=?,location=?,ticket=?,equipment=?,notes=?,delivered_by=?,updated_at=?,completed_at=? WHERE id=? AND workspace_id=?`).bind(
          next.status,next.scheduled_at,next.recipient_name,next.recipient_email,next.location,next.ticket,next.equipment,next.notes,next.delivered_by,next.updated_at,next.completed_at,id,workspace
        ).run();
        return json({ok:true,delivery:next},200,cors);
      }

      if(request.method==='DELETE' && id){
        await env.DB.prepare('DELETE FROM deliveries WHERE id=? AND workspace_id=?').bind(id,workspace).run();
        return json({ok:true},200,cors);
      }

      return json({error:'method_not_allowed'},405,cors);
    } catch (err) {
      return json({error:'server_error',message:String(err&&err.message||err)},500,cors);
    }
  }
};
