// Contraste WCAG (4,5:1 texto, 3:1 grande) en 5 temas (incl. Sistema claro/oscuro) × 8 acentos × transparencia sí/no, en 12 pantallas.
const {chromium}=require('playwright');
const AUDIT=()=>{const P=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const v=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return [v[0],v[1],v[2],v.length>3?v[3]:1]};
 const first=img=>{const m=img.match(/rgba?\([^)]+\)/);return m?P(m[0]):null};
 const over=(top,bot)=>{const a=top[3];return [top[0]*a+bot[0]*(1-a),top[1]*a+bot[1]*(1-a),top[2]*a+bot[2]*(1-a),1]};
 const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
 const cr=(a,b)=>{const L1=lum(a),L2=lum(b);return (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)};
 const bgFor=el=>{const chain=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement)chain.unshift(e);let bg=P(getComputedStyle(document.documentElement).backgroundColor)||[255,255,255,1];if(bg[3]<1)bg=over(bg,[255,255,255,1]);
  for(const e of chain){const cs=getComputedStyle(e);if(e.tagName==='DIALOG'){bg=over(P(getComputedStyle(document.body).backgroundColor),bg)}const g=cs.backgroundImage!=='none'?first(cs.backgroundImage):null;const c=g||P(cs.backgroundColor);if(c&&c[3]>0)bg=over(c,bg)}return bg};
 const out=[];const scope=document.querySelector('dialog[open]')||document.getElementById('lock')||document.body;
 for(const el of scope.querySelectorAll('*')){if(el.closest('svg')||el.closest('[hidden]'))continue;const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;const r=el.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)continue;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||+cs.opacity===0)continue;if(el.closest('.welcome')||el.closest('nav')&&!el.closest('.active'))continue;
  let col=P(cs.color);const bg=bgFor(el);if(col[3]<1)col=over(col,bg);const ratio=cr(col,bg),size=parseFloat(cs.fontSize),w=+cs.fontWeight,large=size>=24||(size>=18.66&&w>=700),need=large?3:4.5;
  if(ratio<need){const lab=el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')+' ‹'+(el.parentElement?.className||el.parentElement?.tagName||'').toString().split(' ')[0]+'›';out.push({lab,txt:el.textContent.trim().slice(0,28),ratio:+ratio.toFixed(2),need})}}
 return out};
(async()=>{const b=await chromium.launch();const ACC=['teal','blue','violet','pink','orange','green','amber','red'];const TH=[['light','light'],['dark','dark'],['amoled','dark'],['system','light'],['system','dark']];
 const res={};
 for(const [th,cs] of TH)for(const ng of [0,1]){const p=await b.newPage({viewport:{width:390,height:844},colorScheme:cs});await p.clock.setFixedTime(new Date('2026-11-27T19:00:00'));await p.goto('file://'+require('path').resolve(__dirname,'../../app/index.html'));
  for(const ac of ACC){await p.evaluate(([th,ng,ac])=>{localStorage.clear();const mk=(d,pl,m)=>({date:d,place:pl,start:'08:00',end:'18:00',status:'Presente',note:'',breakMinutes:0,overnight:false,...(m?{multiplier:m}:{})});
   state.rules=[{from:'2026-01-01',mode:'day',rate:50000,extra:0,extraCalc:'percent',extraPct:50,hours:8,calculationVersion:2}];state.rows=[mk('2026-10-06','Obra A'),mk('2026-11-17','Obra B'),mk('2026-11-22','Obra C',2),{date:'2026-11-20',place:'',start:'',end:'',status:'Ausente',note:'',breakMinutes:0,overnight:false}];
   state.payments=[{id:'p',date:'2026-11-25',allocatedDate:'2026-11-16',amount:10000,note:'Efectivo'}];state.adjustments=[{id:'a',date:'2026-11-18',amount:-5000,note:'Adelanto'}];state.closed=['2026-11:1'];
   Object.assign(state.settings,{theme:th,accent:ac,reduceTransparency:!!ng,reduceMotion:true,checks:true});state.settings.payday.enabled=true;state.settings.specialPay.enabled=true;save();$('month').value='2026-11';$('part').value='2';render()},[th,ng,ac]);
   const views={summary:'go("summary")',pay:'go("pay")',hours:'go("hours")',settings:'go("settings")',settings2:'go("settings");scrollTo(0,1400)',rates:'ratesView()',row:'editRow("2026-11-22")',warnrow:'editRow("2026-11-23");setTimeout(()=>{const f=document.querySelector("#rowForm");f.elements.start.value="05:00";f.elements.end.value="21:00";f.dispatchEvent(new Event("input"))},0)',share:'shareSheet()',payform:'paymentForm()',ask:'ask("Se recalculan horas.",{title:"¿Eliminar?",ok:"Eliminar",danger:true})',guide:'go("guide");document.querySelector(".guide-sec").open=true'};
   for(const [vn,code] of Object.entries(views)){await p.evaluate(c=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());scrollTo(0,0);eval(c)},code);await p.waitForTimeout(vn==='warnrow'?120:30);
    const r=await p.evaluate(AUDIT);for(const x of r){const k=th+(th==='system'?'-'+cs:'')+'|'+vn+'|'+x.lab;(res[k]=res[k]||{n:0,min:99,acc:new Set,ng:new Set,txt:x.txt,need:x.need});res[k].n++;res[k].min=Math.min(res[k].min,x.ratio);res[k].acc.add(ac);res[k].ng.add(ng)}}}
  await p.close()}
 const rows=Object.entries(res).sort((a,b)=>a[1].min-b[1].min);for(const [k,v] of rows)console.log(v.min.toFixed(2).padStart(5),'<',v.need,k,'«'+v.txt+'»','acentos:',[...v.acc].join(','),'transp:',[...v.ng].join(''));
 console.log(rows.length?'✗ contraste: '+rows.length+' problemas':'contraste ok (80 combinaciones)');if(rows.length)process.exitCode=1;await b.close()})();
