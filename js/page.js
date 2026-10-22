/* Modularix — inner pages: nav marker and scroll spy, quote CTA, compact menu, clock, drawing field. Shared by company.html and the legal pages. */
(function(){
  'use strict';
  const doc=document.documentElement;
  if(/[?&]review\b/.test(location.search)) doc.classList.add('review');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

  /* ---------- nav: the page's own chapter (data-here: Company, Legal) is open; the red marker follows the section in view */
  const rail=document.getElementById('navrail'), marker=document.getElementById('marker');
  const here=rail.querySelector('[data-here]'), chLink=here.querySelector(':scope > a');
  const subs=[...here.querySelectorAll('.subs a')].map(a=>({a,el:document.querySelector(a.getAttribute('href'))}));
  let cur;
  function placeMarker(){
    const rr=rail.getBoundingClientRect(), ar=(cur?cur.a:chLink).getBoundingClientRect();
    if(cur){ marker.style.width='5px'; marker.style.height=(ar.height-6)+'px'; marker.style.top=(ar.top-rr.top+3)+'px'; }
    else { marker.style.width='12px'; marker.style.height='12px'; marker.style.top=(ar.top-rr.top+ar.height/2-6)+'px'; }
    marker.style.opacity=1;
  }
  function active(){
    const line=innerHeight*.42; let hit=null;
    for(const s of subs) if(s.el.getBoundingClientRect().top<=line) hit=s;
    if(hit!==cur){ cur=hit; subs.forEach(s=>s.a.classList.toggle('on',s===hit)); placeMarker();
      pmSubs.forEach(a=>a.classList.toggle('on',!!hit&&a.getAttribute('href')===hit.a.getAttribute('href')));
      document.getElementById('f-sec').textContent=hit?hit.el.dataset.sec:here.dataset.here; }
  }

  /* chapter rules and week bars draw in once a section enters */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -25% 0px'});
  document.querySelectorAll('.sec').forEach(s=>io.observe(s));

  /* ---------- quote CTA expands in place */
  const cta=document.getElementById('cta'), ctaBtn=document.getElementById('ctaBtn');
  function setCta(o){ cta.classList.toggle('open',o); ctaBtn.setAttribute('aria-expanded',o); if(o) setTimeout(()=>document.getElementById('f-name').focus(),reduced?0:300); }
  ctaBtn.addEventListener('click',()=>setCta(true));
  document.getElementById('xBtn').addEventListener('click',()=>{setCta(false);ctaBtn.focus();});

  /* ---------- compact menu: built from the rail, as on the home page (product items, not Modules / Add-ons) */
  const pull=document.getElementById('pMenu'), tbMenu=document.getElementById('tbMenu'), pmNav=document.getElementById('pmNav');
  pmNav.innerHTML='<ol>'+[...rail.querySelectorAll('.nav .ch')].map(c=>{const a=c.querySelector(':scope > a'), subs=[...c.querySelectorAll('.subs li:not(.base) > a')];
    return `<li class="pm-ch${c===here?' on':''}"><a href="${a.getAttribute('href')}">${a.innerHTML}</a>`+
      (subs.length?`<ul>${subs.map(x=>`<li><a href="${x.getAttribute('href')}">${x.firstChild.textContent}</a></li>`).join('')}</ul>`:'')+'</li>';}).join('')+'</ol>';
  const pmSubs=[...pmNav.querySelectorAll('.pm-ch.on ul a')];
  function setPull(o){ pull.classList.toggle('open',o); tbMenu.setAttribute('aria-expanded',o); tbMenu.textContent=o?'Close':'Menu'; document.body.classList.toggle('pulled',o); }
  tbMenu.addEventListener('click',()=>setPull(!pull.classList.contains('open')));
  pull.addEventListener('click',e=>{ if(e.target.closest('a')) setPull(false); });

  /* ---------- clock */
  const clk=document.getElementById('m-clk');
  const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Bucharest',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  if(clk){ const tick=()=>{clk.textContent=fmt.format(new Date());}; tick(); setInterval(tick,1000); } /* legal pages have no telemetry */

  /* ---------- drawing field. Everything is a function of the field size and the scroll progress p (0 → 1):
     a dot grid, a dial off the bottom-right corner that turns with p, and the module's six layers as isometric slabs
     that separate as p grows, each with a leader to its name. The layer nearest p is lit. */
  const svg=document.getElementById('art'), NS='http://www.w3.org/2000/svg', yRead=document.getElementById('f-y'), layNo=document.getElementById('f-ln'), layNm=document.getElementById('f-lnm');
  const LAYERS=['Structure','Envelope','Power','Cooling','Compute','Protection'];
  const L=16.35, W=3.2, C=Math.cos(Math.PI/6);
  let fw=0, fh=0, dial, slabs=[];
  const el=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag); for(const k in attrs) n.setAttribute(k,attrs[k]); (parent||svg).appendChild(n); return n;};
  const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');

  function build(){
    const r=svg.getBoundingClientRect(); fw=r.width; fh=r.height; svg.textContent=''; slabs=[];
    if(fw<60) return;
    svg.setAttribute('viewBox',`0 0 ${fw} ${fh}`);
    const defs=el('defs',{});
    const pat=el('pattern',{id:'dg',width:20,height:20,patternUnits:'userSpaceOnUse'},defs); el('circle',{cx:1,cy:1,r:.9,class:'dots'},pat);
    const rg=el('radialGradient',{id:'fm',cx:'50%',cy:'45%',r:'70%'},defs);
    el('stop',{offset:'0','stop-color':'#fff','stop-opacity':'1'},rg); el('stop',{offset:'1','stop-color':'#fff','stop-opacity':'0'},rg);
    const mk=el('mask',{id:'fmk'},defs); el('rect',{width:fw,height:fh,fill:'url(#fm)'},mk);
    el('rect',{width:fw,height:fh,fill:'url(#dg)',mask:'url(#fmk)'});
    /* soft glow behind the stack */
    const gg=el('radialGradient',{id:'gl'},defs);
    el('stop',{offset:'0','stop-color':'#0098f8','stop-opacity':'.16'},gg); el('stop',{offset:'1','stop-color':'#0098f8','stop-opacity':'0'},gg);
    el('ellipse',{cx:fw*.5,cy:fh*.46,rx:fw*.7,ry:fh*.32,fill:'url(#gl)'});

    /* dial: centre off the bottom-right corner, rings and a tick ring that turns with scroll */
    const R=Math.max(fw*1.05,fh*.42), cx=fw*.92, cy=fh*1.02;
    el('circle',{cx,cy,r:R*1.22,class:'ring d'}); el('circle',{cx,cy,r:R*.72,class:'ring'}); el('circle',{cx,cy,r:R*.5,class:'ring d'});
    dial=el('g',{}); dial.dataset.c=cx+' '+cy;
    el('circle',{cx,cy,r:R,class:'ring'},dial);
    for(let i=0;i<180;i++){ const a=i*2*Math.PI/180, mj=i%15===0, r0=R, r1=R+(mj?14:i%5===0?8:4);
      el('line',{x1:cx+Math.cos(a)*r0,y1:cy+Math.sin(a)*r0,x2:cx+Math.cos(a)*r1,y2:cy+Math.sin(a)*r1,class:'tk'+(mj?' mj':'')},dial); }

    /* six slabs; geometry set per frame in draw() */
    const s=(fw*.5)/((L+W)*C);
    for(let i=0;i<LAYERS.length;i++){
      const g=el('g',{});
      slabs.push({g,s,hid:el('polygon',{class:'sl hid'},g),side:el('polygon',{class:'sl'},g),side2:el('polygon',{class:'sl'},g),top:el('polygon',{class:'sl top'},g),
        ld:el('polyline',{class:'ld'},g),lt:Object.assign(el('text',{class:'lt'},g),{textContent:''})});
      slabs[i].lt.textContent=String(i+1).padStart(2,'0');
    }
    dimL=el('polyline',{class:'dm'}); dimT=el('text',{class:'dmt'});
    draw();
  }
  let dimL,dimT;
  function draw(){
    const max=document.documentElement.scrollHeight-innerHeight, sy=scrollY, p=max>0?clamp(sy/max,0,1):0;
    doc.style.setProperty('--sy',Math.round(sy));
    yRead.textContent=String(Math.round(sy)).padStart(4,'0');
    if(!slabs.length) return;
    const [cx,cy]=dial.dataset.c.split(' ').map(Number);
    dial.setAttribute('transform',`rotate(${(-p*60).toFixed(2)} ${cx} ${cy})`);
    const s=slabs[0].s, th=.42, gap=1.2+p*2.6, n=slabs.length;
    const stackH=(n*th+(n-1)*gap)*s, ox=fw*.5, oy=fh*.48+stackH*.5;
    /* iso projection; x across the module (W), y along it (L), z up */
    const P=(x,y,z)=>[ox+(x-y)*C*s, oy+(x+y)*.5*s-z*s];
    const lit=Math.round(p*(n-1)), labX=Math.max(22,fw*.07);
    let topZ=0;
    slabs.forEach((sl,i)=>{
      const z0=i*(th+gap), z1=z0+th; topZ=z1;
      const x0=-W/2,x1=W/2,y0=-L/2,y1=L/2;
      sl.top.setAttribute('points',pts([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)]));
      sl.side.setAttribute('points',pts([P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z1),P(x1,y0,z1)]));
      sl.side2.setAttribute('points',pts([P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)]));
      sl.hid.setAttribute('points',pts([P(x0,y0,z0),P(x1,y0,z0),P(x1,y1,z0),P(x0,y1,z0)]));
      sl.top.classList.toggle('on',i===lit);
      /* leader from the slab's far-left corner out to the label at the field's left margin */
      const a=P(x0,y1,z1), ly=a[1]-10;
      sl.ld.setAttribute('points',pts([a,[a[0]-10,ly],[labX+22,ly]]));
      sl.lt.setAttribute('x',labX); sl.lt.setAttribute('y',ly+3);
      sl.lt.classList.toggle('on',i===lit);
    });
    /* dimension line on the right: overall stack height, grows as the layers separate */
    const b=P(W/2,-L/2,0), t=P(W/2,-L/2,topZ), dx=b[0]+18;
    dimL.setAttribute('points',pts([[dx-4,b[1]],[dx+4,b[1]],[dx,b[1]],[dx,t[1]],[dx-4,t[1]],[dx+4,t[1]]]));
    const my=(b[1]+t[1])/2; dimT.setAttribute('x',dx+12); dimT.setAttribute('y',my); dimT.setAttribute('text-anchor','middle'); dimT.setAttribute('transform',`rotate(-90 ${dx+12} ${my})`); dimT.textContent='Δ '+(gap*1000).toFixed(0)+' mm';
    if(layNo.textContent!==String(lit+1).padStart(2,'0')){ layNo.textContent=String(lit+1).padStart(2,'0'); layNm.textContent=LAYERS[lit]; }
  }

  let raf=0;
  addEventListener('scroll',()=>{ if(!raf) raf=requestAnimationFrame(()=>{raf=0; draw(); active();}); },{passive:true});
  addEventListener('resize',()=>{ build(); placeMarker(); });
  here.querySelector('.subs').addEventListener('transitionend',placeMarker);
  (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{ build(); active(); placeMarker(); });
  addEventListener('load',placeMarker);
  build(); active(); placeMarker();
})();
