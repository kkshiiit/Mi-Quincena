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
    p.on('dialog', d => { errs.push('diálogo nativo: ' + d.message()); d.dismiss(); });
    await p.goto(URL);
    await p.evaluate(() => { state.rules = [{ from: '2026-01-01', mode: 'day', rate: 50000, extra: 0, extraCalc: 'percent', extraPct: 50, hours: 8, calculationVersion: 2 }]; save(); });
    const overflow = tag => p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth).then(o => o && fail(width + 'px desborde en ' + tag));
    for (const t of ['summary', 'hours', 'pay', 'settings', 'stats', 'guide']) { await p.evaluate(t => go(t), t); await overflow(t); }
    for (const f of ['editRow(today())', 'paymentForm()', 'adjustmentForm()', 'ratesView()', 'ruleForm()', 'remindersForm()', 'backupsForm()', 'profileForm()', 'specialForm()', 'paydayForm()', 'shareSheet()', 'aboutForm()']) {
      await p.evaluate(f => { if ($('dialog').open) $('dialog').close(); eval(f); }, f);
      const ov = await p.evaluate(() => { const d = $('dialog'); if (d.scrollWidth <= d.clientWidth + 1) return ''; const r = d.getBoundingClientRect().right; const el = [...d.querySelectorAll('*')].find(e => e.getBoundingClientRect().right > r + 1); return el ? el.tagName + '.' + el.className + ' «' + el.textContent.trim().slice(0, 30) + '»' : '?'; });
      if (ov) fail(width + 'px desborde en ' + f + ': ' + ov);
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
    // Diálogos de confirmación propios (sin confirm/prompt nativos).
    const askVisible = () => p.evaluate(() => !!document.getElementById('ask')?.open);
    await p.evaluate(() => editRow('2026-11-10'));
    await p.waitForSelector('#deleteRow');
    await p.click('#deleteRow');
    if (!(await askVisible()) || !(await p.evaluate(() => $('dialog').open))) fail('confirmación no aparece encima del formulario');
    await p.click('#askNo');
    if (!(await p.evaluate(() => state.rows.some(r => r.date === '2026-11-10')))) fail('cancelar borró el día');
    await p.click('#deleteRow'); await p.keyboard.press('Escape');
    if (!(await p.evaluate(() => state.rows.some(r => r.date === '2026-11-10')))) fail('Escape borró el día');
    await p.click('#deleteRow'); await p.click('#askOk');
    if (await p.evaluate(() => state.rows.some(r => r.date === '2026-11-10' && r.status))) fail('confirmar no borró el día');
    await p.evaluate(() => { if ($('dialog').open) closeModal(); go('settings'); });
    await p.click('[data-feature=specialPay]'); await p.click('#askNo');
    if (await p.evaluate(() => state.settings.specialPay.enabled)) fail('cancelar activó pago especial');
    await p.click('[data-feature=specialPay]'); await p.click('#askOk');
    if (!(await p.evaluate(() => state.settings.specialPay.enabled))) fail('no activó pago especial');
    await p.evaluate(() => { action('wipe'); }); await p.fill('#askIn', 'hola'); await p.click('#askOk');
    if (!(await p.evaluate(() => state.rules.length))) fail('borró sin escribir BORRAR');
    await p.evaluate(() => { action('wipe'); }); await p.fill('#askIn', 'borrar'); await p.click('#askOk');
    if (await p.evaluate(() => state.rules.length)) fail('no borró con BORRAR');
    if (await p.evaluate(() => /confirm\(|prompt\(/.test([...document.scripts].map(s => s.text).join('')))) fail('quedan diálogos nativos');
    // Espera del PIN: cambiar la hora no la acorta; reiniciar el teléfono la reinicia completa.
    const clk = await p.evaluate(() => {
      let E = 1e6, B = 3; const real = Date.now, keep = window.Android;
      window.Android = { clock: () => JSON.stringify({ e: E, boot: B }), preference: k => localStorage.getItem('mq-' + k) || '', preferenceSave: (k, v) => localStorage.setItem('mq-' + k, v) };
      pinLockSet(30000); Date.now = () => real() + 3600e3; const a = pinWait(); Date.now = real;
      E += 10000; const b = pinWait(); B = 4; E = 10; const c = pinWait(); pinLockSet(0); window.Android = keep;
      return [a, b, c];
    });
    if (clk.join() !== '30000,20000,30000') fail('espera del PIN con reloj: ' + clk);
    // Desbloqueo rápido: no pide PIN si volvés antes del tiempo elegido; al reiniciar, siempre.
    const away = await p.evaluate(() => {
      let E = 5e6, B = 2; const keep = window.Android;
      window.Android = { clock: () => JSON.stringify({ e: E, boot: B }), preference: k => localStorage.getItem('mq-' + k) || '', preferenceSave: (k, v) => localStorage.setItem('mq-' + k, v) };
      const r = [];
      prefsSet('lock-after', '300'); markAway(); E += 120000; r.push(shouldLock(true));
      E += 240000; r.push(shouldLock(true));
      prefsSet('lock-after', '0'); markAway(); E += 1000; r.push(shouldLock(false));
      prefsSet('lock-after', '300'); markAway(); B = 3; E = 10; r.push(shouldLock(true));
      prefsSet('lock-after', ''); window.Android = keep; return r;
    });
    if (away.join() !== 'false,true,true,true') fail('desbloqueo rápido: ' + away);
    if (errs.length) fail(width + 'px errores: ' + errs.join(' | '));
    await p.close();
  }
  await browser.close();
  if (!process.exitCode) console.log('ui ok');
})();
