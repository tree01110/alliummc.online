
function copyIP(){
 navigator.clipboard.writeText('play.alliummc.online');
 const e=document.getElementById('copyText'); if(e){e.textContent='COPIED';setTimeout(()=>e.textContent='COPY IP',1400)}
}
const sectionInfo={
 content:['CONTENT MODS','Gameplay, engineering, magic, building, mobs, world generation and exploration.'],
 dependencies:['DEPENDENCIES & LIBRARIES','APIs, libraries and framework mods required by the pack.'],
 client:['CLIENT-SIDE','Visual, performance and quality-of-life mods used by the client.'],
 server:['SERVER-SIDE','Server administration, world management, performance and infrastructure.']
};
function cleanFile(s){
 return s.replace(/\.jar$/i,'').replace(/[-_](?:neoforge|forge)?[-_]?\d.*$/i,'').replace(/[-_]/g,' ').trim();
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function loadMods(){
 const root=document.getElementById('modSections'); if(!root||!window.ALLIUM_MODS)return;
 for(const key of ['content','dependencies','client','server']){
   const mods=window.ALLIUM_MODS.filter(x=>x.section===key);
   const sec=document.createElement('div'); sec.className='mod-section';
   sec.innerHTML=`<div class="mod-head"><div><h3>${sectionInfo[key][0]}</h3><p>${sectionInfo[key][1]}</p></div><span class="mod-count">${mods.length} MODS</span></div><div class="mod-grid" id="grid-${key}"></div>`;
   root.appendChild(sec);
   const grid=sec.querySelector('.mod-grid');
   for(const m of mods){
     const name=cleanFile(m.file);
     const a=document.createElement('a'); a.className='mod-tile'; a.dataset.id=m.id||'';
     a.href=m.id?`https://modrinth.com/project/${m.id}`:`https://modrinth.com/mods?q=${encodeURIComponent(name)}`;
     a.target='_blank'; a.rel='noopener';
     a.innerHTML=`<div class="fallback">${esc(name)}</div><div class="tip"><b>${esc(name)}</b><span>${m.id?'Loading official project information…':'Custom/server utility. Click to search for its project page.'}</span><em>OPEN PROJECT ↗</em></div>`;
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
         el.innerHTML=`${p.icon_url?`<img loading="lazy" src="${esc(p.icon_url)}" alt="${esc(p.title)}">`:`<div class="fallback">${esc(p.title)}</div>`}<div class="tip"><b>${esc(p.title)}</b><span>${esc(p.description||'View this project on Modrinth.')}</span><em>VIEW ON MODRINTH ↗</em></div>`;
       });
     }
   }catch(e){console.warn('Modrinth metadata failed',e)}
 }
}
document.addEventListener('DOMContentLoaded',loadMods);
