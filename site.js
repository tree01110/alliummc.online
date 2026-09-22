
function copyIP(){
 navigator.clipboard.writeText('play.alliummc.online');
 const e=document.getElementById('copyText'); if(e){e.textContent='COPIED';setTimeout(()=>e.textContent='COPY IP',1400)}
}
const sectionInfo={
 content:['CONTENT MODS','Everything that adds actual content to the pack.'],
 client:['CLIENT-SIDE','Client-only performance, visual and QOL mods.'],
 dependencies:['DEPENDENCIES & LIBRARIES','Required by other mods. Not particularly exciting.'],
 server:['SERVER-SIDE','Server utilities, performance and administration.']
};
function cleanFile(s){
 return s.replace(/\.jar$/i,'')
 .replace(/[-_](?:neoforge|forge)?[-_]?(?:mc)?\d[\w.+-]*$/i,'')
 .replace(/[-_]/g,' ').replace(/\s+/g,' ').trim();
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tileContents(title, icon, desc, source='PROJECT'){
 return `<div class="mod-name">${esc(title)}</div><div class="mod-icon-wrap">${
   icon?`<img loading="lazy" src="${esc(icon)}" alt="${esc(title)}" onerror="this.src='/assets/allium-season-13-logo.png'">`
       :`<img loading="lazy" src="/assets/allium-season-13-logo.png" alt="">`
 }<div class="tip"><b>${esc(title)}</b><span>${esc(desc||'Project information unavailable.')}</span><em>VIEW ${esc(source)} ↗</em></div></div>`;
}
async function searchModrinth(el, name){
 try{
   const r=await fetch('https://api.modrinth.com/v2/search?limit=1&query='+encodeURIComponent(name));
   if(!r.ok)return false;
   const data=await r.json(), hit=data.hits&&data.hits[0];
   if(!hit)return false;
   el.href='https://modrinth.com/project/'+hit.project_id;
   el.innerHTML=tileContents(hit.title,hit.icon_url,hit.description,'ON MODRINTH');
   return true;
 }catch{return false}
}
async function loadMods(){
 const root=document.getElementById('modSections'); if(!root||!window.ALLIUM_MODS)return;
 for(const key of ['content','client','dependencies','server']){
   const mods=window.ALLIUM_MODS.filter(x=>x.section===key);
   const sec=document.createElement('div'); sec.className='mod-section';
   sec.innerHTML=`<div class="mod-head"><div><h3>${sectionInfo[key][0]}</h3><p>${sectionInfo[key][1]}</p></div><span class="mod-count">${mods.length} MODS</span></div><div class="mod-grid"></div>`;
   root.appendChild(sec);
   const grid=sec.querySelector('.mod-grid');
   for(const mod of mods){
     const name=cleanFile(mod.file);
     const a=document.createElement('a'); a.className='mod-tile'; a.dataset.id=mod.id||''; a.dataset.name=name;
     a.href=mod.id?`https://modrinth.com/project/${mod.id}`:`https://modrinth.com/mods?q=${encodeURIComponent(name)}`;
     a.target='_blank'; a.rel='noopener';
     a.innerHTML=tileContents(name,null,mod.id?'Loading project information…':'Looking for the project page…');
     grid.appendChild(a);
   }
 }
 const ids=[...new Set(window.ALLIUM_MODS.map(x=>x.id).filter(Boolean))];
 for(let i=0;i<ids.length;i+=50){
   try{
     const r=await fetch('https://api.modrinth.com/v2/projects?ids='+encodeURIComponent(JSON.stringify(ids.slice(i,i+50))));
     if(!r.ok)continue;
     for(const p of await r.json()){
       document.querySelectorAll(`.mod-tile[data-id="${CSS.escape(p.id)}"]`).forEach(el=>{
         el.href='https://modrinth.com/mod/'+p.slug;
         el.innerHTML=tileContents(p.title,p.icon_url,p.description,'ON MODRINTH');
       });
     }
   }catch(e){console.warn('Modrinth metadata failed',e)}
 }
 // Server-only/custom entries often had no stored project ID. Search Modrinth by name.
 const unmatched=[...document.querySelectorAll('.mod-tile:not([data-id]),.mod-tile[data-id=""]')];
 for(const el of unmatched) await searchModrinth(el,el.dataset.name);
}
document.addEventListener('DOMContentLoaded',loadMods);

async function loadLiveStats(){
 const mc=document.getElementById('mcPlayers'), state=document.getElementById('serverState');
 if(mc){
  try{
   const r=await fetch('https://api.mcstatus.io/v2/status/java/play.alliummc.online');
   const d=await r.json();
   mc.textContent=d.online ? `${d.players.online} / ${d.players.max}` : 'Offline'; if(state) state.textContent=d.online?'ONLINE':'OFFLINE';
  }catch{mc.textContent='Unavailable';if(state)state.textContent='UNKNOWN'}
 }
 const dm=document.getElementById('discordMembers'), dol=document.getElementById('discordOnline');
 if(dm){
  try{
   const r=await fetch('https://discord.com/api/v10/invites/eySfvMJ?with_counts=true');
   const d=await r.json();
   dm.textContent=(d.approximate_member_count ?? '—').toLocaleString?.() || d.approximate_member_count || '—';
   if(dol) dol.textContent=`${(d.approximate_presence_count ?? '—').toLocaleString?.() || d.approximate_presence_count || '—'} online`;
  }catch{dm.textContent='Unavailable';if(dol)dol.textContent='Discord'}
 }
}
document.addEventListener('DOMContentLoaded',loadLiveStats);
