(function(root){
'use strict';
const ACCENTS=['teal','blue','violet','pink','orange','green','amber','red'];
const statuses=['','Presente','Ausente','Franco','Feriado','Licencia'];
// Redondeo a centavos simétrico: -1,005 → -1,01 igual que 1,005 → 1,01.
const round=n=>{const r=Math.sign(n)*Math.round((Math.abs(n)+Number.EPSILON)*100)/100;return r===0?0:r};
// Horas de referencia para pasar un sueldo mensual a valor hora (25 jornadas × horas normales, criterio usual de 200 h para 8 h).
const MONTH_DAYS=25;
const limit=1000000000;
function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s&&+s.slice(0,4)>=1900&&+s.slice(0,4)<=2200;}
function minutes(t){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(t))throw Error('Horario inválido');return Number(t.slice(0,2))*60+Number(t.slice(3));}
function validateRow(r){
 if(!r||!validDate(r.date))throw Error('Fecha inválida');
 if(typeof r.overnight!=='boolean'||!statuses.includes(r.status))throw Error('Asistencia o turno inválido');
 if(typeof r.place!=='string'||typeof r.note!=='string'||r.place.length>200||r.note.length>2000)throw Error('Texto de jornada inválido');
 if(!Number.isInteger(r.breakMinutes)||r.breakMinutes<0)throw Error('Descanso inválido');
 if((r.start&&!r.end)||(!r.start&&r.end))throw Error('Completá entrada y salida');
 if(r.start){let d=minutes(r.end)-minutes(r.start)+(r.overnight?1440:0);if(d<=0||d>1440)throw Error('Revisá los horarios o marcá salida al día siguiente');if(r.breakMinutes>=d)throw Error('El descanso debe ser menor que la jornada');}
 else if(r.breakMinutes)throw Error('El descanso requiere horarios');
 if(r.status!=='Presente'&&(r.start||r.end))throw Error('Los horarios requieren asistencia Presente');
 if(r.status==='Presente'&&!r.start)throw Error('Una jornada presente requiere entrada y salida');
 if(r.paid!==undefined&&typeof r.paid!=='boolean')throw Error('Estado de pago inválido');
 if(r.multiplier!==undefined&&(!Number.isFinite(r.multiplier)||r.multiplier<=0||r.multiplier>10))throw Error('Multiplicador de pago inválido (entre 0,1 y 10)');
 return r;
}
function ruleFor(rules,date){return [...rules].sort((a,b)=>b.from.localeCompare(a.from)).find(r=>r.from<=date);}
function validateRule(r){
 if(!r||!validDate(r.from)||!['day','hour','month'].includes(r.mode))throw Error('Tarifa inválida');
 for(const k of ['rate','extra','hours'])if(!Number.isFinite(r[k])||r[k]<0||r[k]>limit)throw Error('Importes fuera de rango');
 if(r.hours<=0||r.hours>24)throw Error('Jornada normal: entre 0 y 24 horas');
 if(r.dayPolicy&&!['full','half','proportional'].includes(r.dayPolicy))throw Error('Regla diaria inválida');
 if(r.monthPolicy&&!['calendar','halves'].includes(r.monthPolicy))throw Error('Regla mensual inválida');
 if(r.extraMode&&!['duration','schedule'].includes(r.extraMode))throw Error('Regla extra inválida');
 if(r.extraCalc&&!['amount','percent'].includes(r.extraCalc))throw Error('Tipo de hora extra inválido');
 if(r.extraCalc==='percent'&&(!Number.isFinite(r.extraPct)||r.extraPct<0||r.extraPct>1000))throw Error('Recargo de hora extra: entre 0 % y 1000 %');
 if(r.extraMode==='schedule'){minutes(r.scheduleStart);minutes(r.scheduleEnd);if(r.scheduleStart===r.scheduleEnd)throw Error('La franja normal debe tener una duración');}
 return r;
}
// Valor de una hora normal según la modalidad.
function hourValue(rule){return rule.mode==='hour'?rule.rate:rule.mode==='day'?rule.rate/rule.hours:rule.rate/(rule.hours*MONTH_DAYS);}
// Valor de una hora extra: monto fijo, o valor hora × (1 + recargo %).
function extraRate(rule){return rule.extraCalc==='percent'?hourValue(rule)*(1+rule.extraPct/100):rule.extra;}
function calc(r,rules){
 const worked=r.status==='Presente'&&r.start&&r.end?minutes(r.end)-minutes(r.start)+(r.overnight?1440:0)-(r.breakMinutes||0):0;
 const hours=worked/60,rule=ruleFor(rules,r.date);
 if(!rule)return {hours,normal:0,extra:0,base:0,extraPay:0,total:0,configured:false};
 let extraMinutes=Math.max(0,worked-Math.round(rule.hours*60));
 if(rule.extraMode==='schedule'&&worked){const a=minutes(r.start),b=minutes(r.end)+(r.overnight?1440:0),s=minutes(rule.scheduleStart);let e=minutes(rule.scheduleEnd);if(e<=s)e+=1440;let overlap=0;for(const shift of [-1440,0,1440])overlap+=Math.max(0,Math.min(b,e+shift)-Math.max(a,s+shift));extraMinutes=Math.max(0,(b-a-overlap)-(r.breakMinutes||0));}
 const extra=extraMinutes/60,normal=hours-extra;
 let base=0;
 if(rule.mode==='day'&&(r.status==='Presente'||r.paid===true)){
  let factor=1;if(r.status==='Presente'&&rule.dayPolicy==='half')factor=hours<=rule.hours/2?0.5:1;
  if(r.status==='Presente'&&rule.dayPolicy==='proportional')factor=Math.min(1,normal/rule.hours);
  base=rule.rate*factor;
 }else if(rule.mode==='hour')base=normal*rule.rate;
 const mult=r.multiplier||1;base*=mult;
 const xr=extraRate(rule),legacyTotal=round(base+extra*xr*mult),extraPay=round(extra*xr*mult);base=round(base);
 return {hours,normal,extra,base,extraPay,multiplier:mult,total:rule.calculationVersion===2?round(base+extraPay):legacyTotal,configured:true};
}
function dates(month,part='all'){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||!['1','2','all'].includes(part)||!validDate(month+'-01'))throw Error('Período inválido');
 const [y,m]=month.split('-').map(Number),n=new Date(y,m,0).getDate();return Array.from({length:n},(_,i)=>month+'-'+String(i+1).padStart(2,'0')).filter(d=>part==='all'||(Number(d.slice(8))<=15?'1':'2')===part);
}
function allocatedDate(p){return p.allocatedDate||p.date;}
function monthlyDay(rule,date){const month=date.slice(0,7),day=Number(date.slice(8)),count=dates(month).length,cents=Math.round(rule.rate*100);let pool=cents,n=count,index=day;if(rule.monthPolicy==='halves'){pool=day<=15?Math.ceil(cents/2):Math.floor(cents/2);n=day<=15?15:count-15;index=day<=15?day:day-15;}return (Math.floor(pool/n)+(index<=pool%n?1:0))/100;}
function summarize(state,month,part='all'){
 const ds=dates(month,part),lookup=new Map(state.rows.map(r=>[r.date,r]));let sum={days:0,hours:0,normal:0,extra:0,base:0,extraPay:0,paid:0,adjustments:0,missing:0,unrecorded:0};
 for(const date of ds){const r=lookup.get(date)||{date,status:'',start:'',end:'',breakMinutes:0},c=calc(r,state.rules);sum.days+=r.status==='Presente'?1:0;sum.unrecorded+=!r.status?1:0;sum.hours+=c.hours;sum.normal+=c.normal;sum.extra+=c.extra;sum.base+=c.base;sum.extraPay+=c.extraPay;if((r.status==='Presente'||r.paid)&&!c.configured)sum.missing++;const rule=ruleFor(state.rules,date);if(rule&&rule.mode==='month'){const d=monthlyDay(rule,date);sum.base+=d;if(r.status==='Presente'&&r.multiplier&&r.multiplier!==1)sum.base+=round(d*(r.multiplier-1));}}
 for(const p of state.payments)if(ds.includes(allocatedDate(p)))sum.paid+=p.amount;
 for(const a of state.adjustments||[])if(ds.includes(a.date))sum.adjustments+=a.amount;
 for(const k of ['base','extraPay','paid','adjustments'])sum[k]=round(sum[k]);sum.total=round(sum.base+sum.extraPay+sum.adjustments);sum.balance=round(sum.total-sum.paid);return sum;
}
function validateState(s){
 if(!s||![1,2].includes(s.version)||!Array.isArray(s.rows)||!Array.isArray(s.rules)||!Array.isArray(s.payments))throw Error('No es una copia de Mi Quincena');
 if(s.rows.length>100000||s.rules.length>10000||s.payments.length>100000)throw Error('Archivo demasiado grande');
 let seen=new Set;for(const r of s.rows){validateRow(r);if(seen.has(r.date))throw Error('Fechas duplicadas');seen.add(r.date);}
 seen=new Set;for(const r of s.rules){validateRule(r);if(seen.has(r.from))throw Error('Vigencias duplicadas');seen.add(r.from);}
 seen=new Set;for(const p of s.payments){if(!validDate(p.date)||!validDate(allocatedDate(p))||!Number.isFinite(p.amount)||p.amount<=0||p.amount>limit||typeof p.note!=='string'||p.note.length>2000||typeof p.id!=='string'||seen.has(p.id))throw Error('Cobro inválido');seen.add(p.id);}
 if(s.adjustments!==undefined){if(!Array.isArray(s.adjustments)||s.adjustments.length>100000)throw Error('Ajustes inválidos');seen=new Set;for(const a of s.adjustments){if(!validDate(a.date)||!Number.isFinite(a.amount)||Math.abs(a.amount)>limit||!a.amount||typeof a.note!=='string'||!a.note.trim()||typeof a.id!=='string'||seen.has(a.id))throw Error('Ajuste inválido');seen.add(a.id);}}
 if(s.closed!==undefined&&(!Array.isArray(s.closed)||s.closed.some(k=>!/^\d{4}-\d{2}:[12]$/.test(k)||!validDate(k.slice(0,7)+'-01'))))throw Error('Cierres inválidos');
 if(s.settings!==undefined){
  if(typeof s.settings!=='object'||!s.settings||Array.isArray(s.settings))throw Error('Preferencias inválidas');
  const c=s.settings;
  if(c.theme!==undefined&&!['system','light','dark','amoled'].includes(c.theme))throw Error('Tema inválido');
  for(const k of ['name','employer','job'])if(c[k]!==undefined&&(typeof c[k]!=='string'||c[k].length>80))throw Error('Perfil inválido');
  if(c.accent!==undefined&&!ACCENTS.includes(c.accent))throw Error('Color de acento inválido');
  if(c.defaultPart!==undefined&&!['auto','all'].includes(c.defaultPart))throw Error('Preferencia de período inválida');
  for(const k of ['reduceTransparency','reduceMotion','reminder'])if(c[k]!==undefined&&typeof c[k]!=='boolean')throw Error('Preferencia inválida');
  if(c.reminderTime!==undefined)minutes(c.reminderTime);
  if(c.reminderDays!==undefined&&(!Array.isArray(c.reminderDays)||c.reminderDays.some(d=>!Number.isInteger(d)||d<0||d>6)))throw Error('Días de recordatorio inválidos');
 }
 if(s.templates!==undefined){if(!Array.isArray(s.templates)||s.templates.length>100)throw Error('Plantillas inválidas');for(const t of s.templates)validateRow({...t,date:'2026-01-01',note:'',status:'Presente'});}
 return s;
}
function migrate(s){validateState(s);const n=JSON.parse(JSON.stringify(s));n.version=2;n.settings=Object.assign({theme:'system',accent:'teal',employer:'',job:'',reduceTransparency:false,reduceMotion:false,name:'',reminder:false,reminderTime:'18:00',reminderDays:[1,2,3,4,5]},n.settings||{});n.adjustments=n.adjustments||[];n.closed=n.closed||[];n.templates=n.templates||[];n.payments=n.payments.map(p=>({...p,allocatedDate:allocatedDate(p)}));return n;}
function periodKey(date){return date.slice(0,7)+':'+(+date.slice(8)<=15?'1':'2');}
// Vigencias en orden con su fecha final (día anterior a la siguiente).
function ruleRanges(rules){const l=[...rules].sort((a,b)=>a.from.localeCompare(b.from));return l.map((r,i)=>{let to='';if(l[i+1]){const d=new Date(l[i+1].from+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);to=d.toISOString().slice(0,10);}const prev=l[i-1];return {rule:r,to,change:prev&&prev.mode===r.mode&&prev.rate?round((r.rate/prev.rate-1)*100):null};});}
function relevantRules(rules,month,part){const ds=dates(month,part),keys=new Set(ds.map(d=>ruleFor(rules,d)?.from));return rules.filter(r=>keys.has(r.from));}
function prevPeriod(k){if(k.endsWith(':2'))return k.slice(0,7)+':1';const [y,m]=k.slice(0,7).split('-').map(Number),d=new Date(y,m-2,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+':2';}
// Last n quincenas ending at key (inclusive), oldest first.
function history(state,key,n=6){const out=[];let k=key;for(let i=0;i<n;i++){out.unshift({key:k,...summarize(state,k.slice(0,7),k.slice(8))});k=prevPeriod(k);}return out;}
// Unpaid balance of every quincena before key that has any record.
function carryOver(state,key){const keys=new Set([...state.rows.filter(r=>r.status).map(r=>periodKey(r.date)),...state.payments.map(p=>periodKey(allocatedDate(p))),...(state.adjustments||[]).map(a=>periodKey(a.date))]);let total=0,periods=0;for(const k of keys)if(k<key){const b=summarize(state,k.slice(0,7),k.slice(8)).balance;if(b>0.004){total+=b;periods++;}}return {total:round(total),periods};}
const DAYS=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'],MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function norm(t){return String(t??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();}
function dateWords(d){if(!validDate(d))return '';const [y,m,dd]=d.split('-'),wd=new Date(d+'T12:00:00Z').getUTCDay();return [d,dd+'/'+m+'/'+y,dd+'/'+m,+dd+'/'+(+m),DAYS[wd],MONTHS[+m-1],y].join(' ');}
function amountWords(n){const a=Math.abs(n),i=Math.trunc(a);return [String(i),String(a),i.toLocaleString('es-AR'),i.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.')].join(' ');}
// Haystack for search: kind is 'row' | 'payment' | 'adjustment'.
function searchText(kind,o){if(kind==='row')return norm([dateWords(o.date),o.place,o.note,o.status||'sin registrar',o.start,o.end,o.multiplier>1?(o.multiplier===2?'doble x2':'x'+o.multiplier):''].join(' '));if(kind==='payment')return norm(['cobro',dateWords(o.date),dateWords(allocatedDate(o)),amountWords(o.amount),o.note].join(' '));return norm(['ajuste',dateWords(o.date),amountWords(o.amount),o.note].join(' '));}
function matches(hay,q){const words=norm(q).split(/\s+/).filter(Boolean);return words.length>0&&words.every(w=>hay.includes(w));}
const api={MONTH_DAYS,hourValue,extraRate,ruleRanges,ACCENTS,statuses,round,minutes,validDate,validateRow,validateRule,ruleFor,calc,dates,summarize,validateState,migrate,allocatedDate,monthlyDay,periodKey,relevantRules,prevPeriod,history,carryOver,norm,searchText,matches};if(typeof module!=='undefined')module.exports=api;root.Core=api;
})(typeof window!=='undefined'?window:globalThis);
