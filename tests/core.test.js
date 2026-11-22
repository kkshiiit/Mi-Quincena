// Run: node core.test.js
const assert = require('assert');
const Core = require('../app/core.js');

assert.strictEqual(Core.prevPeriod('2026-03:2'), '2026-03:1');
assert.strictEqual(Core.prevPeriod('2026-03:1'), '2026-02:2');
assert.strictEqual(Core.prevPeriod('2026-01:1'), '2025-12:2');

const state = Core.migrate({
  version: 1,
  rules: [{ from: '2026-01-01', mode: 'day', rate: 1000, extra: 0, hours: 8 }],
  rows: [
    { date: '2026-01-05', place: '', start: '08:00', end: '16:00', status: 'Presente', note: '', breakMinutes: 0, overnight: false },
    { date: '2026-01-20', place: '', start: '08:00', end: '16:00', status: 'Presente', note: '', breakMinutes: 0, overnight: false },
    { date: '2026-02-03', place: '', start: '08:00', end: '16:00', status: 'Presente', note: '', breakMinutes: 0, overnight: false },
  ],
  payments: [{ id: 'a', date: '2026-01-16', allocatedDate: '2026-01-01', amount: 1000, note: '' }],
});

const h = Core.history(state, '2026-02:1', 3);
assert.deepStrictEqual(h.map(x => x.key), ['2026-01:1', '2026-01:2', '2026-02:1']);
assert.deepStrictEqual(h.map(x => x.total), [1000, 1000, 1000]);

// 2026-01:1 fully paid, 2026-01:2 owes 1000; current period excluded.
assert.deepStrictEqual(Core.carryOver(state, '2026-02:1'), { total: 1000, periods: 1 });
console.log('core ok');

// Search
const row = { date: '2026-11-16', place: 'Depósito central', note: 'turno noche', status: 'Presente', start: '08:00', end: '16:00' };
const hay = Core.searchText('row', row);
for (const q of ['lunes', '16/11', '16/11/2026', '2026-11-16', 'deposito', 'Depósito', 'noviembre', '08:00', 'presente', 'lunes deposito'])
  assert.ok(Core.matches(hay, q), 'row should match ' + q);
assert.ok(!Core.matches(hay, 'martes'));
assert.ok(!Core.matches(hay, '   '));
const pay = Core.searchText('payment', { date: '2026-12-02', allocatedDate: '2026-11-16', amount: 52000, note: 'Transferencia' });
for (const q of ['52000', '52.000', 'transferencia', '02/12', 'cobro']) assert.ok(Core.matches(pay, q), 'payment should match ' + q);
// AMOLED theme survives validation
assert.doesNotThrow(() => Core.validateState({ ...state, settings: { ...state.settings, theme: 'amoled' } }));
console.log('search ok');

// Pago multiplicado (doble, 1.5)
const rules2 = [{ from: '2026-01-01', mode: 'day', rate: 1000, extra: 100, hours: 8, calculationVersion: 2 }];
const dbl = { date: '2026-01-05', place: '', start: '08:00', end: '18:00', status: 'Presente', note: '', breakMinutes: 0, overnight: false, multiplier: 2 };
assert.strictEqual(Core.calc(dbl, rules2).total, 2400);
assert.strictEqual(Core.calc({ ...dbl, multiplier: 1.5 }, rules2).total, 1800);
assert.strictEqual(Core.calc({ ...dbl, multiplier: undefined }, rules2).total, 1200);
assert.throws(() => Core.validateRow({ ...dbl, multiplier: 0 }));
assert.throws(() => Core.validateRow({ ...dbl, multiplier: 11 }));
assert.ok(Core.matches(Core.searchText('row', dbl), 'doble'));
const hourRules = [{ from: '2026-01-01', mode: 'hour', rate: 100, extra: 0, hours: 8, calculationVersion: 2 }];
assert.strictEqual(Core.calc({ ...dbl, end: '16:00' }, hourRules).total, 1600);
assert.doesNotThrow(() => Core.validateState({ ...state, settings: { ...state.settings, accent: 'violet', employer: 'X', job: 'Y' } }));
assert.throws(() => Core.validateState({ ...state, settings: { ...state.settings, accent: '#fff' } }));
console.log('multiplier ok');

// Redondeo simétrico
assert.strictEqual(Core.round(1.005), 1.01); assert.strictEqual(Core.round(-1.005), -1.01); assert.ok(Object.is(Core.round(-0.001), 0));
// Hora extra con recargo %
const pr = { from: '2026-01-01', mode: 'day', rate: 8000, extra: 0, hours: 8, extraCalc: 'percent', extraPct: 50, calculationVersion: 2 };
assert.doesNotThrow(() => Core.validateRule(pr));
assert.strictEqual(Core.hourValue(pr), 1000); assert.strictEqual(Core.extraRate(pr), 1500);
assert.strictEqual(Core.calc({ ...dbl, multiplier: undefined }, [pr]).total, 8000 + 2 * 1500);
assert.strictEqual(Core.hourValue({ mode: 'month', rate: 200000, hours: 8 }), 1000);
assert.throws(() => Core.validateRule({ ...pr, extraPct: -1 }));
// Mensual + día doble suma un día extra
const ms = Core.migrate({ version: 1, rules: [{ from: '2026-01-01', mode: 'month', rate: 3100, extra: 0, hours: 8 }], rows: [], payments: [] });
const base = Core.summarize(ms, '2026-01').base;
ms.rows.push({ ...dbl, end: '16:00' });
assert.strictEqual(Core.summarize(ms, '2026-01').base, base + 100);
// Rangos de vigencia
const rr = Core.ruleRanges([{ from: '2026-03-01', mode: 'day', rate: 1100 }, { from: '2026-01-01', mode: 'day', rate: 1000 }]);
assert.strictEqual(rr[0].to, '2026-02-28'); assert.strictEqual(rr[1].to, ''); assert.strictEqual(rr[1].change, 10);
console.log('math ok');

// Restauración selectiva: no cambia el tema si no se pide
{const cur = Core.migrate({ version: 1, rules: [], rows: [{ ...dbl, date: '2026-03-01' }], payments: [] });cur.settings.theme = 'amoled'; cur.settings.accent = 'red';
const bk = Core.migrate({ version: 1, rules: rules2, rows: [{ ...dbl, date: '2026-03-02' }], payments: [{ id: 'z', date: '2026-03-02', amount: 5, note: '' }] }); bk.settings.theme = 'light';
let r = Core.restore(cur, bk, { mode: 'merge', parts: { rows: true, rules: true, money: true } });
assert.strictEqual(r.state.settings.theme, 'amoled'); assert.strictEqual(r.state.settings.accent, 'red'); assert.strictEqual(r.state.rows.length, 2); assert.strictEqual(r.state.payments.length, 1); assert.strictEqual(r.stats.rows[0], 1);
r = Core.restore(cur, bk, { mode: 'replace', parts: { rows: true, appearance: true } });
assert.strictEqual(r.state.rows.length, 1); assert.strictEqual(r.state.settings.theme, 'light'); assert.strictEqual(r.state.rules.length, 0);
console.log('restore ok');}
