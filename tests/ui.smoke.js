// Prueba de humo de la interfaz con Chromium (Playwright): recorre pantallas y flujos
// principales en varios anchos y falla ante cualquier error de JavaScript o desborde.
// Uso: node tests/ui.smoke.js   (requiere el paquete "playwright")
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'app', 'index.html');
const fail = m => { console.error('✗ ' + m); process.exitCode = 1; };
(async () => {
  const browser = await chromium.launch();
  for (const width of [320, 390, 800]) {
    const p = await browser.newPage({ viewport: { width, height: 760 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    p.on('dialog', d => d.accept('BORRAR'));
    await p.goto(URL);
    await p.evaluate(() => { state.rules = [{ from: '2026-01-01', mode: 'day', rate: 50000, extra: 0, extraCalc: 'percent', extraPct: 50, hours: 8, calculationVersion: 2 }]; save(); });
    const overflow = tag => p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth).then(o => o && fail(width + 'px desborde en ' + tag));
    for (const t of ['summary', 'hours', 'pay', 'settings', 'stats', 'guide']) { await p.evaluate(t => go(t), t); await overflow(t); }
    for (const f of ['editRow(today())', 'paymentForm()', 'adjustmentForm()', 'ratesView()', 'ruleForm()', 'remindersForm()', 'backupsForm()', 'profileForm()', 'specialForm()', 'paydayForm()', 'shareSheet()', 'aboutForm()']) {
      await p.evaluate(f => { if ($('dialog').open) $('dialog').close(); eval(f); }, f);
      if (await p.evaluate(() => $('dialog').scrollWidth > $('dialog').clientWidth + 1)) fail(width + 'px desborde en ' + f);
    }
    await p.evaluate(() => $('dialog').close());
    // Flujo: registrar un día, cobrarlo, exportar y deshacer.
    await p.evaluate(() => editRow('2026-11-10'));
    await p.fill('[name=place]', 'Obra Test'); await p.fill('[name=start]', '08:00'); await p.fill('[name=end]', '18:00');
    await p.click('#rowForm [type=submit]');
    const day = await p.evaluate(() => state.rows.find(r => r.date === '2026-11-10'));
    if (!day || day.place !== 'Obra Test') fail('no se guardó el día');
    const total = await p.evaluate(() => Core.calc(state.rows.find(r => r.date === '2026-11-10'), state.rules).total);
    if (total !== 50000 + 2 * 6250 * 1.5) fail('cálculo del día: ' + total);
    await p.evaluate(() => paymentForm(null, null, '2026-11:1')); await p.click('#payAllBtn'); await p.click('#paymentForm [type=submit]');
    if (await p.evaluate(() => Core.summarize(state, '2026-11', '1').balance) !== 0) fail('el cobro no saldó la quincena');
    await p.evaluate(async () => { window.download = () => {}; const o = { pending: true, total: true, paid: true, detail: true }; $('month').value = '2026-11'; $('part').value = '1'; shareTextBody(o); shareImage(o); await exportPdf(o); await exportExcel('pay', o); await exportDocx(o); });
    if (errs.length) fail(width + 'px errores: ' + errs.join(' | '));
    await p.close();
  }
  await browser.close();
  if (!process.exitCode) console.log('ui ok');
})();
