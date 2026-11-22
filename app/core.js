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
  for(const k of ['reduceTransparency','reduceMotion','reminder','placeStats'])if(c[k]!==undefined&&typeof c[k]!=='boolean')throw Error('Preferencia inválida');
  if(c.reminderTime!==undefined)minutes(c.reminderTime);
  if(c.specialPay!==undefined){const p=c.specialPay;if(typeof p!=='object'||!p||typeof p.enabled!=='boolean'||['sunday','saturday','holiday'].some(k=>!Number.isFinite(p[k])||p[k]<0||p[k]>10))throw Error('Pago especial inválido');}
  if(c.holidays!==undefined&&(!Array.isArray(c.holidays)||c.holidays.length>500||c.holidays.some(h=>!h||!validDate(h.date)||typeof h.name!=='string'||h.name.length>80)))throw Error('Feriados inválidos');
  if(c.checks!==undefined&&typeof c.checks!=='boolean')throw Error('Preferencia inválida');
  if(c.payday!==undefined){const p=c.payday;if(typeof p!=='object'||!p||typeof p.enabled!=='boolean'||typeof p.notify!=='boolean'||!Number.isInteger(p.first)||!Number.isInteger(p.second)||p.first<1||p.first>31||p.second<1||p.second>31||!['same','next'].includes(p.firstMonth)||!['same','next'].includes(p.secondMonth)||!Number.isInteger(p.hour)||p.hour<0||p.hour>23)throw Error('Día de cobro inválido');}
  if(c.reminderDays!==undefined&&(!Array.isArray(c.reminderDays)||c.reminderDays.some(d=>!Number.isInteger(d)||d<0||d>6)))throw Error('Días de recordatorio inválidos');
 }
 if(s.templates!==undefined){if(!Array.isArray(s.templates)||s.templates.length>100)throw Error('Plantillas inválidas');for(const t of s.templates)validateRow({...t,date:'2026-01-01',note:'',status:'Presente'});}
 return s;
}
function migrate(s){validateState(s);const n=JSON.parse(JSON.stringify(s));n.version=2;n.settings=Object.assign({specialPay:{enabled:false,sunday:2,saturday:1,holiday:2},holidays:HOLIDAYS.map(h=>({...h})),checks:true,placeStats:true,payday:{enabled:false,notify:true,first:20,firstMonth:'same',second:5,secondMonth:'next',hour:9},theme:'system',accent:'teal',employer:'',job:'',reduceTransparency:false,reduceMotion:false,name:'',reminder:false,reminderTime:'18:00',reminderDays:[1,2,3,4,5]},n.settings||{});n.adjustments=n.adjustments||[];n.closed=n.closed||[];n.templates=n.templates||[];n.payments=n.payments.map(p=>({...p,allocatedDate:allocatedDate(p)}));return n;}
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
// Restauración selectiva: cada parte se reemplaza, se combina o se conserva la del teléfono.
const PREF_GROUPS={features:['specialPay','holidays','checks','payday','placeStats'],profile:['name','job','employer'],appearance:['theme','accent','reduceTransparency','reduceMotion'],reminders:['reminder','reminderTime','reminderDays']};
function restore(current,candidate,{mode='replace',parts={}}={}){const cur=JSON.parse(JSON.stringify(current)),cand=migrate(candidate),out=cur,has=r=>r&&(r.status||r.place||r.note),st={rows:[0,0],rules:[0,0],money:[0,0]};
 if(parts.rows){const map=new Map(cur.rows.map(r=>[r.date,r]));for(const r of cand.rows){if(!has(r))continue;const old=map.get(r.date);if(!has(old)){map.set(r.date,r);st.rows[0]++}else if(mode==='replace'&&JSON.stringify(old)!==JSON.stringify(r)){map.set(r.date,r);st.rows[1]++}}if(mode==='replace')for(const [d,r] of map)if(has(r)&&!cand.rows.some(x=>x.date===d&&has(x))){map.delete(d);st.rows[1]++}out.rows=[...map.values()];out.templates=cand.templates.length&&(mode==='replace'||!cur.templates.length)?cand.templates:cur.templates}
 if(parts.rules){if(mode==='replace'){st.rules=[cand.rules.length,cur.rules.length];out.rules=cand.rules}else for(const r of cand.rules)if(!out.rules.some(x=>x.from===r.from)){out.rules.push(r);st.rules[0]++}}
 if(parts.money){if(mode==='replace'){out.payments=cand.payments;out.adjustments=cand.adjustments;out.closed=cand.closed;st.money=[cand.payments.length+cand.adjustments.length,0]}else{for(const k of ['payments','adjustments'])for(const x of cand[k])if(!out[k].some(y=>y.id===x.id)){out[k].push(x);st.money[0]++}out.closed=[...new Set([...out.closed,...cand.closed])]}}
 for(const g in PREF_GROUPS)if(parts[g])for(const k of PREF_GROUPS[g])if(cand.settings[k]!==undefined)out.settings[k]=cand.settings[k];
 validateState(out);return {state:out,stats:st};}
// Feriados nacionales de Argentina precargados (editables por el usuario; el gobierno puede moverlos).
const HOLIDAYS=[['2026-01-01','Año Nuevo'],['2026-02-16','Carnaval'],['2026-02-17','Carnaval'],['2026-03-23','Feriado puente'],['2026-03-24','Día de la Memoria'],['2026-04-02','Malvinas'],['2026-04-03','Viernes Santo'],['2026-05-01','Día del Trabajador'],['2026-05-25','Revolución de Mayo'],['2026-06-15','Paso a la Inmortalidad de Güemes'],['2026-06-20','Día de la Bandera'],['2026-07-09','Día de la Independencia'],['2026-07-10','Feriado puente'],['2026-08-17','Paso a la Inmortalidad de San Martín'],['2026-10-12','Diversidad Cultural'],['2026-11-23','Soberanía Nacional'],['2026-12-07','Feriado puente'],['2026-12-08','Inmaculada Concepción'],['2026-12-25','Navidad'],['2027-01-01','Año Nuevo'],['2027-02-08','Carnaval'],['2027-02-09','Carnaval'],['2027-03-24','Día de la Memoria'],['2027-03-26','Viernes Santo'],['2027-04-02','Malvinas'],['2027-05-01','Día del Trabajador'],['2027-05-25','Revolución de Mayo'],['2027-06-20','Día de la Bandera'],['2027-06-21','Paso a la Inmortalidad de Güemes'],['2027-07-09','Día de la Independencia'],['2027-08-16','Paso a la Inmortalidad de San Martín'],['2027-10-11','Diversidad Cultural'],['2027-11-22','Soberanía Nacional'],['2027-12-08','Inmaculada Concepción'],['2027-12-25','Navidad']].map(([date,name])=>({date,name}));
function weekday(date){return new Date(date+'T12:00:00Z').getUTCDay();}
function holidayOf(settings,date){return (settings&&settings.holidays||[]).find(h=>h.date===date)||null;}
// Sugerencia de pago especial para una fecha (nunca se aplica sola): {mult, reason} o null.
function specialFor(settings,date){const p=settings&&settings.specialPay;if(!p||!p.enabled||!validDate(date))return null;const h=holidayOf(settings,date);if(h&&p.holiday>1)return {mult:p.holiday,reason:'Feriado: '+h.name};const w=weekday(date);if(w===0&&p.sunday>1)return {mult:p.sunday,reason:'Domingo'};if(w===6&&p.saturday>1)return {mult:p.saturday,reason:'Sábado'};return null;}
// Avisos de posibles errores de carga de una jornada.
function rowWarnings(r,todayStr){const w=[];if(!r||!validDate(r.date))return w;if(todayStr&&r.date>todayStr&&r.status==='Presente')w.push('Es una fecha futura.');if(r.status==='Presente'&&r.start&&r.end){const d=minutes(r.end)-minutes(r.start)+(r.overnight?1440:0),net=d-(r.breakMinutes||0);if(net>14*60)w.push('Jornada de más de 14 h: revisá entrada y salida.');if(net<60)w.push('Jornada de menos de 1 h.');if(r.breakMinutes>=180)w.push('Descanso de 3 h o más.');if(r.overnight&&d>16*60)w.push('Salida al día siguiente con más de 16 h: ¿marcaste bien la salida?');}if(r.status==='Presente'&&!String(r.place||'').trim())w.push('Falta el lugar u obra.');return w;}
// Días pasados del período sin registrar.
function missingDays(state,month,part,todayStr){const map=new Map(state.rows.map(r=>[r.date,r]));return dates(month,part).filter(d=>d<todayStr&&!(map.get(d)||{}).status);}
// Estadísticas por lugar u obra entre dos fechas (inclusive).
function placeStats(state,from,to){const by=new Map;let tot={days:0,hours:0,extra:0,total:0};for(const r of state.rows){if(r.status!=='Presente'||r.date<from||r.date>to)continue;const c=calc(r,state.rules),k=String(r.place||'').trim()||'Sin lugar',key=norm(k);let e=by.get(key);if(!e){e={place:k,days:0,hours:0,extra:0,total:0,first:r.date,last:r.date,special:0};by.set(key,e)}e.days++;e.hours+=c.hours;e.extra+=c.extra;e.total+=c.total;if(r.multiplier&&r.multiplier!==1)e.special++;if(r.date<e.first)e.first=r.date;if(r.date>e.last)e.last=r.date;tot.days++;tot.hours+=c.hours;tot.extra+=c.extra;tot.total+=c.total;}const list=[...by.values()].map(e=>({...e,total:round(e.total),avgHours:e.hours/e.days,share:tot.days?e.days/tot.days:0})).sort((a,b)=>b.days-a.days||b.hours-a.hours);tot.total=round(tot.total);return {list,tot};}
// Próximas fechas de cobro según la configuración: [{date, key, label}].
function paydays(payday,fromDate,n=6){const out=[];if(!payday||!validDate(fromDate))return out;let [y,m]=fromDate.split('-').map(Number);m-=2;for(let i=0;out.length<n&&i<24;i++){const mm=m+Math.floor(i/2),part=i%2?'2':'1',base=new Date(Date.UTC(y,mm,1)),bm=base.getUTCFullYear()+'-'+String(base.getUTCMonth()+1).padStart(2,'0'),pm=(part==='1'?payday.firstMonth:payday.secondMonth)==='next'?new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()+1,1)):base,day=part==='1'?payday.first:payday.second,last=new Date(Date.UTC(pm.getUTCFullYear(),pm.getUTCMonth()+1,0)).getUTCDate(),date=pm.getUTCFullYear()+'-'+String(pm.getUTCMonth()+1).padStart(2,'0')+'-'+String(Math.min(day,last)).padStart(2,'0');if(date>=fromDate)out.push({date,key:bm+':'+part});}return out.sort((a,b)=>a.date.localeCompare(b.date));}
const api={HOLIDAYS,weekday,holidayOf,specialFor,rowWarnings,missingDays,placeStats,paydays,PREF_GROUPS,restore,MONTH_DAYS,hourValue,extraRate,ruleRanges,ACCENTS,statuses,round,minutes,validDate,validateRow,validateRule,ruleFor,calc,dates,summarize,validateState,migrate,allocatedDate,monthlyDay,periodKey,relevantRules,prevPeriod,history,carryOver,norm,searchText,matches};if(typeof module!=='undefined')module.exports=api;root.Core=api;
})(typeof window!=='undefined'?window:globalThis);
