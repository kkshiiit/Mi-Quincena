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
