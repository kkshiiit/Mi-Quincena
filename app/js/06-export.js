// Compartir y exportar: texto, imagen, PDF y Excel desde un único modelo.
'use strict';

function shareOpts() {
  const d = { pending: true, total: true, paid: true, detail: true };
  try {
    return Object.assign(d, JSON.parse(prefsGet('share-opts') || '{}'));
  } catch (e) {
    return d;
  }
}

function rangeLabel() {
  const ds = Core.dates(month(), part());
  return dateLabel(ds[0]).slice(0, 5) + ' al ' + dateLabel(ds[ds.length - 1]);
}

// Atajos de qué incluir al compartir.
const SHARE_PRESETS = [
  [
    'claim',
    'Reclamar lo que me deben',
    'Pendiente, lo cobrado y el detalle por día',
    { pending: true, total: false, paid: true, detail: true },
  ],
  [
    'full',
    'Resumen completo',
    'Todo: generado, cobrado, pendiente y detalle',
    { pending: true, total: true, paid: true, detail: true },
  ],
  [
    'hours',
    'Solo horas, sin plata',
    'Días, horarios y horas, sin importes',
    { pending: false, total: false, paid: false, detail: true },
  ],
];
function sharePeriod(kind) {
  const t = today(),
    k = Core.periodKey(t);
  if (kind === 'now') ($('month').value = t.slice(0, 7)), ($('part').value = k.slice(8));
  if (kind === 'prev') {
    const p = Core.prevPeriod(k);
    ($('month').value = p.slice(0, 7)), ($('part').value = p.slice(8));
  }
  if (kind === 'month') $('part').value = 'all';
  render();
  shareSheet();
}
function shareSheet() {
  const o = shareOpts(),
    s = summary(),
    n = selectedRows().filter(r => r.status).length,
    t = today(),
    nowK = Core.periodKey(t),
    prevK = Core.prevPeriod(nowK),
    curK = part() === 'all' ? 'all' : month() + ':' + part(),
    same = (a, b) => ['pending', 'total', 'paid', 'detail'].every(k => !!a[k] === !!b[k]),
    preset = (SHARE_PRESETS.find(x => same(x[3], o)) || [])[0];
  modal(
    '<h2>Compartir</h2>' +
      '<div class="sub-label">Período</div><div class="wrap share-period">' +
      [
        ['now', 'Esta quincena', curK === nowK],
        ['prev', 'Quincena anterior', curK === prevK],
        ['month', 'Mes completo', curK === 'all'],
      ]
        .map(
          ([k, l, on]) =>
            '<button type="button" class="mini' + (on ? ' on' : '') + '" data-sp="' + k + '">' + l + '</button>',
        )
        .join('') +
      '</div><p class="muted share-range">' +
      esc(periodLabel()) +
      ' · ' +
      esc(rangeLabel()) +
      ' · ' +
      n +
      (n === 1 ? ' jornada' : ' jornadas') +
      '</p>' +
      '<div class="sub-label">Qué mandar</div><div class="presets">' +
      SHARE_PRESETS.map(
        ([k, t, d]) =>
          '<button type="button" class="preset' +
          (preset === k ? ' on' : '') +
          '" data-preset="' +
          k +
          '"><b>' +
          t +
          '</b><small>' +
          d +
          '</small></button>',
      ).join('') +
      '</div><details class="adv"' +
      (preset ? '' : ' open') +
      '><summary>Elegir a mano' +
      (preset ? '' : ' (personalizado)') +
      '</summary><div class="switches">' +
      [
        ['pending', s.balance < 0 ? 'Saldo a tu favor' : 'Pendiente de cobro', money(Math.abs(s.balance))],
        ['total', 'Generado total', money(s.total)],
        ['paid', 'Cobrado con porcentaje', money(s.paid) + ' · ' + pctOf(s) + ' %'],
        ['detail', 'Detalle por día', n + (n === 1 ? ' jornada' : ' jornadas')],
      ]
        .map(
          ([k, t, d]) =>
            '<label class="check switch"><span><b>' +
            t +
            '</b><small>' +
            d +
            '</small></span><input type="checkbox" role="switch" data-opt="' +
            k +
            '" ' +
            (o[k] ? 'checked' : '') +
            '></label>',
        )
        .join('') +
      '</div></details><div class="sub-label">Formato</div><div class="formats">' +
      [
        ['text', 'share', 'WhatsApp o texto', 'Mensaje listo para enviar'],
        ['image', 'image', 'Imagen', 'Tarjeta para chats o estados'],
        ['pdf', 'file', 'PDF', 'Recibo con firmas, para mandar o imprimir'],
        ['xlsx', 'table', 'Excel', 'Planilla con totales'],
      ]
        .map(
          ([f, ic, t, d]) =>
            '<button type="button" class="format" data-format="' +
            f +
            '">' +
            icon(ic) +
            '<b>' +
            t +
            '</b><small>' +
            d +
            '</small></button>',
        )
        .join('') +
      '</div><button type="button" id="copyShare" class="link">' +
      icon('copy') +
      ' Copiar el texto</button>',
  );
  const read = () => {
    const v = {};
    document.querySelectorAll('[data-opt]').forEach(i => (v[i.dataset.opt] = i.checked));
    return v;
  };
  const savePrefs = v => prefsSet('share-opts', JSON.stringify(v));
  document.querySelectorAll('[data-opt]').forEach(i => (i.onchange = () => (savePrefs(read()), shareSheet())));
  document
    .querySelectorAll('[data-preset]')
    .forEach(b => (b.onclick = () => (savePrefs(SHARE_PRESETS.find(x => x[0] === b.dataset.preset)[3]), shareSheet())));
  document.querySelectorAll('[data-sp]').forEach(b => (b.onclick = () => sharePeriod(b.dataset.sp)));
  document.querySelectorAll('[data-format]').forEach(
    b =>
      (b.onclick = async () => {
        const v = read(),
          f = b.dataset.format;
        if (!n && v.detail && !v.pending && !v.total && !v.paid) return toast('No hay días cargados en este período.');
        b.disabled = true;
        b.classList.add('busy');
        try {
          if (f === 'text') shareTextOut(shareTextBody(v));
          if (f === 'image') shareImage(v);
          if (f === 'pdf') await exportPdf(v);
          if (f === 'xlsx') await exportExcel(v.total || v.paid || v.pending ? 'pay' : 'hours', v);
        } finally {
          b.disabled = false;
          b.classList.remove('busy');
        }
      }),
  );
  $('copyShare').onclick = () => {
    const t = shareTextBody(read());
    if (window.Android?.copyText) {
      Android.copyText(t);
      toast('Texto copiado.');
    } else if (navigator.clipboard)
      navigator.clipboard.writeText(t).then(
        () => toast('Texto copiado.'),
        () => toast('No se pudo copiar.'),
      );
    else toast('No se pudo copiar.');
  };
}

function exModel(o) {
  const s = summary(),
    st = state.settings,
    ds = Core.dates(month(), part()),
    by = (a, b) => a.date.localeCompare(b.date),
    m = new Date(month() + '-02T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
    rows = selectedRows()
      .filter(r => r.status)
      .map(r => {
        const c = Core.calc(r, state.rules),
          pays = r.status === 'Presente' || r.paid;
        return {
          r,
          c,
          date: dateLabel(r.date),
          short: dateLabel(r.date).slice(0, 5),
          wd: dayName(r.date).replace('.', ''),
          place: r.place || (r.status === 'Presente' ? 'Jornada' : r.status),
          time: r.start ? r.start + '–' + r.end + (r.overnight ? ' (+1)' : '') : '',
          hours: r.start ? compactHours(c.hours) : '',
          extra: c.extra ? hm(c.extra) : '',
          mult: r.multiplier && r.multiplier !== 1 && pays ? multLabel(r.multiplier) : '',
          total: c.configured && pays ? c.total : null,
        };
      });
  return {
    o,
    s,
    mOn: !!(o.total || o.paid || o.pending),
    rows,
    pays: state.payments.filter(p => ds.includes(Core.allocatedDate(p))).sort(by),
    adjs: state.adjustments.filter(a => ds.includes(a.date)).sort(by),
    rule: Core.ruleFor(state.rules, ds[ds.length - 1]),
    name: st.name || '',
    role: [st.job, st.employer].filter(Boolean).join(' · '),
    part: part() === 'all' ? 'Mes completo' : part() + 'ª quincena',
    month: m,
    range: rangeLabel(),
    pct: pctOf(s),
    special: 0,
    monthly: state.rules.some(r => r.mode === 'month'),
    file: (ext, extra = '') =>
      ['Mi-Quincena', month(), part() === 'all' ? 'mes' : part() + 'a-quincena', slug(st.name || ''), extra]
        .filter(Boolean)
        .join('_') +
      '.' +
      ext,
  };
}

function rateLine(x) {
  const r = x.rule;
  return r
    ? money(r.rate) +
        ' por ' +
        UNIT[r.mode] +
        ' · jornada ' +
        compactHours(r.hours) +
        ' · hora extra ' +
        (r.extraCalc === 'percent' || r.extra ? money(Core.round(Core.extraRate(r))) : 'no se paga')
    : 'Sin tarifa';
}

function shareTextBody(o) {
  const x = exModel(o),
    s = x.s,
    L = ['*' + x.part + ' de ' + x.month + '* (' + x.range + ')'];
  if (x.name) L.push('👤 ' + x.name + (x.role ? ' — ' + x.role : ''));
  L.push(
    '🗓️ ' +
      s.days +
      (s.days === 1 ? ' día trabajado' : ' días trabajados') +
      ' · ⏱️ ' +
      compactHours(s.hours) +
      (s.extra ? ' (' + compactHours(s.extra) + ' extra)' : ''),
  );
  const sp = x.rows.filter(r => r.mult).length;
  if (sp && !o.detail) L.push('⭐ ' + sp + (sp === 1 ? ' día con pago especial' : ' días con pago especial'));
  if (x.mOn) L.push('');
  if (o.total) {
    L.push('💰 *Generado:* ' + money(s.total));
    for (const a of x.adjs) L.push('   ' + (a.amount < 0 ? '➖ ' : '➕ ') + a.note + ': ' + sMoney(a.amount));
  }
  if (o.paid && (s.paid || o.total)) L.push('✅ *Cobrado:* ' + money(s.paid) + (o.total ? ' (' + x.pct + ' %)' : ''));
  if (o.pending) L.push((s.balance < 0 ? '🟢 *A mi favor:* ' : '⏳ *Me deben:* ') + money(Math.abs(s.balance)));
  if (o.detail && x.rows.length) {
    L.push('', '*Detalle*');
    for (const r of x.rows)
      L.push(
        '• ' +
          r.wd +
          ' ' +
          r.short +
          ' · ' +
          (r.time ? r.place + ' · ' + r.time + ' (' + r.hours + ')' : r.r.status + (r.r.paid ? ' (pago)' : '')) +
          (r.mult ? ' · ' + r.mult : '') +
          (x.mOn && r.total != null ? ' → ' + money(r.total) : ''),
      );
  }
  if (o.paid && x.pays.length) {
    L.push('', '*Cobros*');
    for (const p of x.pays)
      L.push('• ' + dateLabel(p.date).slice(0, 5) + ' · ' + (p.note || 'Cobro') + ' · ' + money(p.amount));
  }
  if (x.mOn && (s.missing || !state.rules.length)) L.push('', '⚠️ Cálculo parcial: faltan tarifas.');
  return L.join('\n');
}

function shareTextOut(text) {
  if (window.Android) Android.shareText(text);
  else if (navigator.share)
    navigator.share({ text }).catch(e => {
      if (e.name !== 'AbortError') toast('No se pudo compartir. Usá Copiar el texto.');
    });
  else {
    navigator.clipboard?.writeText(text);
    toast('Texto copiado. Pegalo en WhatsApp.');
  }
}

function shareImage(o) {
  try {
    const x = exModel(o),
      s = x.s,
      W = 1080,
      F = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
      ROW = 78,
      list = o.detail ? x.rows : [],
      fixed =
        430 +
        60 +
        (o.pending ? 154 : 0) +
        (o.paid ? 70 : 0) +
        (o.total || o.paid ? 120 : 0) +
        70 +
        130 +
        (o.total && x.adjs.length ? 60 : 0) +
        110 +
        60,
      maxRows = Math.max(0, Math.floor((1920 - fixed - 70) / ROW)),
      shown = list.slice(-maxRows),
      H = Math.max(1350, fixed + (shown.length ? 70 + shown.length * ROW : 0)),
      c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d'),
      font = (w, px) => (g.font = w + ' ' + px + 'px ' + F),
      rr = (x0, y0, w, h, r) => {
        g.beginPath();
        g.roundRect ? g.roundRect(x0, y0, w, h, r) : g.rect(x0, y0, w, h);
      },
      fit = (t, w) => {
        t = String(t);
        if (g.measureText(t).width <= w) return t;
        while (t.length > 1 && g.measureText(t + '…').width > w) t = t.slice(0, -1);
        return t + '…';
      },
      ac = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      dark = '#0a5a53';
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0a6f66');
    bg.addColorStop(1, '#14a294');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.16)';
    rr(80, 80, 96, 96, 28);
    g.fill();
    if (logoImg.complete && logoImg.naturalWidth) {
      g.save();
      rr(80, 80, 96, 96, 24);
      g.clip();
      g.drawImage(logoImg, 80, 80, 96, 96);
      g.restore();
    }
    g.fillStyle = '#fff';
    font(700, 44);
    g.fillText(fit(x.name || 'Mi Quincena', 780), 204, 122);
    font(500, 30);
    g.fillStyle = 'rgba(255,255,255,.85)';
    g.fillText(fit(x.role || 'Resumen de trabajo', 780), 204, 166);
    g.fillStyle = '#fff';
    font(800, 76);
    g.fillText(x.part, 80, 320);
    font(500, 36);
    g.fillStyle = 'rgba(255,255,255,.9)';
    g.fillText(x.month + ' · ' + x.range, 80, 374);
    const cx = 60,
      cy = 430,
      cw = W - 120,
      ch = H - cy - 60,
      px = cx + 60,
      iw = cw - 120;
    g.fillStyle = '#fff';
    rr(cx, cy, cw, ch, 48);
    g.fill();
    let y = cy + 90;
    if (o.pending) {
      g.fillStyle = '#4b5b66';
      font(600, 34);
      g.fillText(s.balance < 0 ? 'Saldo a tu favor' : 'Pendiente de cobro', px, y);
      y += 104;
      g.fillStyle = dark;
      font(800, 96);
      g.fillText(money(Math.abs(s.balance)), px, y);
      y += 50;
    }
    if (o.paid) {
      g.fillStyle = '#e3e9ee';
      rr(px, y, iw, 22, 11);
      g.fill();
      if (x.pct) {
        g.fillStyle = '#14a294';
        rr(px, y, Math.max(22, (iw * x.pct) / 100), 22, 11);
        g.fill();
      }
      y += 70;
    }
    const stats = [];
    if (o.total) stats.push(['Generado', money(s.total)]);
    if (o.paid) stats.push(['Cobrado · ' + x.pct + ' %', money(s.paid)]);
    if (stats.length) {
      const colW = iw / stats.length;
      stats.forEach(([l, v], i) => {
        g.fillStyle = '#4b5b66';
        font(600, 30);
        g.fillText(l, px + i * colW, y);
        g.fillStyle = '#0f1e29';
        font(800, 46);
        g.fillText(fit(v, colW - 20), px + i * colW, y + 58);
      });
      y += 120;
    }
    if (o.total && x.adjs.length) {
      g.fillStyle = '#4b5b66';
      font(500, 28);
      g.fillText(fit('Incluye ajustes: ' + x.adjs.map(a => a.note + ' ' + sMoney(a.amount)).join(' · '), iw), px, y);
      y += 60;
    }
    g.strokeStyle = '#e3e9ee';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(px, y);
    g.lineTo(px + iw, y);
    g.stroke();
    y += 70;
    [
      ['Jornadas', String(s.days)],
      ['Horas', compactHours(s.hours)],
      ['Extras', s.extra ? compactHours(s.extra) : '0 h'],
    ].forEach(([l, v], i) => {
      const xx = px + (i * iw) / 3;
      g.fillStyle = '#4b5b66';
      font(600, 30);
      g.fillText(l, xx, y);
      g.fillStyle = '#0f1e29';
      font(800, 40);
      g.fillText(fit(v, iw / 3 - 16), xx, y + 54);
    });
    y += 130;
    if (shown.length) {
      g.fillStyle = '#0f1e29';
      font(700, 32);
      g.fillText(list.length > shown.length ? 'Últimas ' + shown.length + ' jornadas' : 'Jornadas', px, y);
      y += 56;
      for (const r of shown) {
        g.fillStyle = '#eef3f2';
        rr(px - 16, y - 38, iw + 32, ROW - 10, 18);
        g.fill();
        g.fillStyle = '#0f1e29';
        font(700, 28);
        const yy = r.time ? y - 6 : y + 6;
        g.fillText(r.wd + ' ' + r.short, px, y + 6);
        font(500, 28);
        g.fillStyle = '#33434e';
        g.fillText(fit(r.place, x.mOn ? iw - 420 : iw - 200), px + 150, yy);
        if (r.time) {
          g.fillStyle = '#6b7b86';
          font(500, 22);
          g.fillText(r.time + ' · ' + r.hours + (r.extra ? ' · extra ' + r.extra : ''), px + 150, y + 22);
        }
        g.textAlign = 'right';
        if (r.mult) {
          g.fillStyle = '#a2421b';
          font(800, 26);
          g.fillText(r.mult, px + iw - (x.mOn && r.total != null ? 230 : 0), y + 6);
        }
        if (x.mOn && r.total != null) {
          g.fillStyle = '#0f1e29';
          font(700, 28);
          g.fillText(money(r.total), px + iw, y + 6);
        }
        g.textAlign = 'left';
        y += ROW;
      }
    }
    g.fillStyle = '#8a99a4';
    font(500, 26);
    g.fillText('Emitido el ' + dateLabel(today()), px, cy + ch - 44);
    download(x.file('png'), 'image/png', c.toDataURL('image/png').split(',')[1]);
  } catch (e) {
    toast('No se pudo crear la imagen: ' + e.message);
  }
}

async function exportExcel(mode, o = shareOpts()) {
  try {
    await loadLib('xlsx.full.min.js');
    const x = exModel(o),
      s = x.s,
      wb = XLSX.utils.book_new(),
      MONEY = '"$" #,##0.00;[Red]-"$" #,##0.00',
      HM = '[h]:mm',
      DATE = 'dd/mm/yyyy',
      pay = mode === 'pay',
      setFmt = (ws, col, r0, r1, z) => {
        for (let r = r0; r <= r1; r++) {
          const a = col + r;
          if (ws[a] && typeof ws[a].v === 'number') ws[a].z = z;
        }
      },
      d = t => new Date(t + 'T12:00:00');
    const header = [
        'FECHA',
        'DÍA',
        'LUGAR / ACTIVIDAD',
        'ENTRADA',
        'SALIDA',
        'ASISTENCIA',
        'OBSERVACIONES',
        'DESCANSO (min)',
        'SALIDA DÍA SIGUIENTE',
        'DÍA PAGO',
        'PAGO DEL DÍA',
      ].concat(pay ? ['HORAS', 'HORAS NORMALES', 'HORAS EXTRAS', 'BASE (ARS)', 'EXTRAS (ARS)', 'TOTAL DÍA (ARS)'] : []),
      data = [
        [[x.name, x.role].filter(Boolean).join(' · ') || 'Mi Quincena', x.part + ' de ' + x.month + ' · ' + x.range],
        header,
      ];
    for (const r of selectedRows()) {
      const c = Core.calc(r, state.rules),
        paysDay = r.status === 'Presente' || r.paid,
        row = [
          d(r.date),
          dayName(r.date).replace('.', ''),
          r.place || '',
          r.start ? Core.minutes(r.start) / 1440 : null,
          r.end ? Core.minutes(r.end) / 1440 : null,
          r.status || '',
          r.note || '',
          r.breakMinutes || 0,
          r.overnight ? 'Sí' : '',
          r.paid ? 'Sí' : '',
          r.multiplier && r.multiplier !== 1 ? r.multiplier : 1,
        ];
      if (pay)
        row.push(
          c.hours ? c.hours / 24 : null,
          c.normal ? c.normal / 24 : null,
          c.extra ? c.extra / 24 : null,
          paysDay && c.configured ? c.base : null,
          paysDay && c.configured && c.extraPay ? c.extraPay : null,
          paysDay && c.configured ? c.total : null,
        );
      data.push(row);
    }
    const last = data.length;
    if (pay)
      data.push([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        { f: 'SUM(L3:L' + last + ')' },
        { f: 'SUM(M3:M' + last + ')' },
        { f: 'SUM(N3:N' + last + ')' },
        { f: 'SUM(O3:O' + last + ')' },
        { f: 'SUM(P3:P' + last + ')' },
        { f: 'SUM(Q3:Q' + last + ')' },
      ]);
    const ws = XLSX.utils.aoa_to_sheet(data, { cellDates: true });
    ws['!cols'] = [12, 7, 28, 9, 9, 12, 30, 10, 10, 9, 10, 10, 10, 10, 14, 14, 15].map(w => ({ wch: w }));
    ws['!merges'] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 6 } }];
    setFmt(ws, 'A', 3, last, DATE);
    for (const c of ['D', 'E']) setFmt(ws, c, 3, last, 'hh:mm');
    setFmt(ws, 'K', 3, last, '0.##"×"');
    if (pay) {
      for (const c of ['L', 'M', 'N']) setFmt(ws, c, 3, last + 1, HM);
      for (const c of ['O', 'P', 'Q']) setFmt(ws, c, 3, last + 1, MONEY);
      for (const c of ['L', 'M', 'N', 'O', 'P', 'Q'])
        if (ws[c + (last + 1)]) ws[c + (last + 1)].z = ['L', 'M', 'N'].includes(c) ? HM : MONEY;
    }
    ws['!autofilter'] = { ref: 'A2:' + XLSX.utils.encode_col(header.length - 1) + last };
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
    if (pay) {
      const liq = [
          ['CONCEPTO', 'VALOR'],
          ['Período', x.part + ' de ' + x.month + ' (' + x.range + ')'],
          ['Jornadas', s.days],
          ['Horas trabajadas', s.hours / 24],
          ['Horas extra', s.extra / 24],
          ['Base (incluye sueldo mensual)', s.base],
          ['Pago de horas extra', s.extraPay],
          ['Ajustes y adicionales', s.adjustments],
          ['Generado', s.total],
          ['Cobrado', s.paid],
          ['Cobrado (%)', x.pct / 100],
          [s.balance < 0 ? 'Saldo a favor' : 'Pendiente de cobro', Math.abs(s.balance)],
          ['Tarifa vigente', rateLine(x)],
          ['Días sin tarifa', s.missing],
        ],
        ls = XLSX.utils.aoa_to_sheet(liq);
      ls['!cols'] = [{ wch: 30 }, { wch: 48 }];
      for (const r of [4, 5]) ls['B' + r].z = HM;
      for (const r of [6, 7, 8, 9, 10, 12]) ls['B' + r].z = MONEY;
      ls.B11.z = '0%';
      XLSX.utils.book_append_sheet(wb, ls, 'Liquidación');
      const rr = Core.ruleRanges(state.rules).map(({ rule: r, to }) => [
          d(r.from),
          to ? d(to) : 'sin fin',
          { day: 'Por día', hour: 'Por hora', month: 'Mensual' }[r.mode],
          r.rate,
          r.hours,
          Core.round(Core.hourValue(r)),
          r.extraCalc === 'percent' ? 'Recargo ' + r.extraPct + ' %' : 'Monto fijo',
          Core.round(Core.extraRate(r)),
        ]),
        ts = XLSX.utils.aoa_to_sheet(
          [['DESDE', 'HASTA', 'MODALIDAD', 'IMPORTE', 'JORNADA (h)', 'VALOR HORA', 'TIPO EXTRA', 'HORA EXTRA']].concat(
            rr,
          ),
          { cellDates: true },
        );
      ts['!cols'] = [12, 12, 12, 14, 11, 14, 16, 14].map(w => ({ wch: w }));
      setFmt(ts, 'A', 2, rr.length + 1, DATE);
      setFmt(ts, 'B', 2, rr.length + 1, DATE);
      for (const c of ['D', 'F', 'H']) setFmt(ts, c, 2, rr.length + 1, MONEY);
      XLSX.utils.book_append_sheet(wb, ts, 'Tarifas');
      const pr = x.pays.map(p => [d(p.date), d(Core.allocatedDate(p)), p.note || 'Cobro', p.amount]),
        cs = XLSX.utils.aoa_to_sheet(
          [['FECHA REAL', 'IMPUTADO A', 'DETALLE', 'IMPORTE']].concat(pr, [
            ['TOTAL', '', '', { f: 'SUM(D2:D' + (pr.length + 1) + ')' }],
          ]),
          { cellDates: true },
        );
      cs['!cols'] = [12, 12, 30, 16].map(w => ({ wch: w }));
      setFmt(cs, 'A', 2, pr.length + 1, DATE);
      setFmt(cs, 'B', 2, pr.length + 1, DATE);
      for (let r = 2; r <= pr.length + 2; r++) if (cs['D' + r]) cs['D' + r].z = MONEY;
      XLSX.utils.book_append_sheet(wb, cs, 'Cobros');
      const ar = x.adjs.map(a => [d(a.date), a.note, a.amount]),
        as = XLSX.utils.aoa_to_sheet(
          [['FECHA', 'MOTIVO', 'IMPORTE']].concat(ar, [['TOTAL', '', { f: 'SUM(C2:C' + (ar.length + 1) + ')' }]]),
          { cellDates: true },
        );
      as['!cols'] = [12, 34, 16].map(w => ({ wch: w }));
      setFmt(as, 'A', 2, ar.length + 1, DATE);
      for (let r = 2; r <= ar.length + 2; r++) if (as['C' + r]) as['C' + r].z = MONEY;
      XLSX.utils.book_append_sheet(wb, as, 'Ajustes');
    }
    download(
      x.file('xlsx', pay ? '' : 'horarios'),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      XLSX.write(wb, { type: 'base64', bookType: 'xlsx', cellDates: true }),
    );
  } catch (e) {
    toast('Error al exportar: ' + e.message);
  }
}

async function exportPdf(o = shareOpts()) {
  try {
    await loadLib('jspdf.umd.min.js');
    const x = exModel(o),
      s = x.s,
      { jsPDF } = window.jspdf,
      doc = new jsPDF({ unit: 'mm', format: 'a4' }),
      W = 210,
      M = 15,
      TEAL = [11, 111, 102],
      INK = [20, 35, 45],
      MUTED = [95, 110, 120],
      LINE = [222, 229, 234];
    let y = 0;
    const A = t =>
        String(t ?? '')
          .normalize('NFC')
          .replace(/[–—−]/g, '-')
          .replace(/[  ]/g, ' ')
          .replace(/→/g, '>')
          .replace(/…/g, '...'),
      T = (t, x0, yy, op) => doc.text(Array.isArray(t) ? t.map(A) : A(t), x0, yy, op),
      col = c => doc.setTextColor(...c),
      fnt = (b, sz) => {
        doc.setFont('helvetica', b ? 'bold' : 'normal');
        doc.setFontSize(sz);
      },
      head = () => {
        doc.setFillColor(...TEAL);
        doc.rect(0, 0, W, 34, 'F');
        col([255, 255, 255]);
        fnt(1, 19);
        T('Resumen de ' + (part() === 'all' ? 'mes' : 'quincena'), M, 14);
        fnt(0, 10);
        T([x.name, x.role].filter(Boolean).join(' · ') || 'Mi Quincena', M, 21);
        T(x.part + ' de ' + x.month + ' · ' + x.range, M, 27);
        fnt(0, 9);
        T('Emitido ' + dateLabel(today()), W - M, 14, { align: 'right' });
        col(INK);
        y = 44;
      },
      ensure = h => {
        if (y + h > 278) {
          doc.addPage();
          head();
        }
      },
      h2 = t => {
        ensure(14);
        fnt(1, 12);
        col(INK);
        T(t, M, y);
        y += 6;
      },
      table = (cols, rows, opt = {}) => {
        const widths = cols.map(c => c[1]),
          xs = widths.reduce((a, w, i) => (a.push((a[i - 1] ?? M) + (i ? widths[i - 1] : 0)), a), []);
        xs[0] = M;
        for (let i = 1; i < xs.length; i++) xs[i] = xs[i - 1] + widths[i - 1];
        const cell = (t, i, yy, b) => {
          const right = cols[i][2] === 'r',
            w = widths[i] - 3;
          fnt(b, 8.5);
          let tt = doc.splitTextToSize(A(t), w)[0] || '';
          T(tt, right ? xs[i] + widths[i] - 1.5 : xs[i] + 1.5, yy, right ? { align: 'right' } : undefined);
        };
        const hdr = () => {
          doc.setFillColor(224, 241, 238);
          doc.rect(M, y - 4.6, W - 2 * M, 7, 'F');
          col(TEAL);
          cols.forEach((c, i) => cell(c[0], i, y, 1));
          col(INK);
          y += 7;
        };
        ensure(16);
        hdr();
        rows.forEach((r, ri) => {
          if (y + 6 > 278) {
            doc.addPage();
            head();
            hdr();
          }
          if (ri % 2) {
            doc.setFillColor(247, 250, 250);
            doc.rect(M, y - 4.4, W - 2 * M, 6.4, 'F');
          }
          col(r.muted ? MUTED : INK);
          r.cells.forEach((t, i) => cell(t, i, y, r.bold));
          y += 6.4;
        });
        if (opt.total) {
          doc.setDrawColor(...TEAL);
          doc.setLineWidth(0.4);
          doc.line(M, y - 4, W - M, y - 4);
          col(INK);
          opt.total.forEach((t, i) => t !== '' && cell(t, i, y + 0.6, 1));
          y += 7;
        }
        y += 4;
      };
    head();
    // Tarjetas
    const cards = [];
    if (o.total) cards.push(['Generado', money(s.total)]);
    if (o.paid) cards.push(['Cobrado · ' + x.pct + ' %', money(s.paid)]);
    if (o.pending) cards.push([s.balance < 0 ? 'A tu favor' : 'Pendiente', money(Math.abs(s.balance)), 1]);
    cards.push(['Jornadas · horas', s.days + ' · ' + compactHours(s.hours)]);
    const cw = (W - 2 * M - (cards.length - 1) * 4) / cards.length;
    cards.forEach(([l, v, hi], i) => {
      const cx = M + i * (cw + 4);
      if (hi) {
        doc.setFillColor(...TEAL);
      } else doc.setFillColor(240, 245, 245);
      doc.roundedRect(cx, y, cw, 20, 3, 3, 'F');
      col(hi ? [220, 245, 240] : MUTED);
      fnt(0, 8);
      T(l, cx + 4, y + 7);
      col(hi ? [255, 255, 255] : INK);
      fnt(1, cards.length > 3 ? 11 : 13);
      T(doc.splitTextToSize(A(v), cw - 6)[0], cx + 4, y + 15);
    });
    y += 30;
    if (x.mOn) {
      h2('Liquidación');
      const L = [
        [
          'Base (' +
            s.days +
            (s.days === 1 ? ' jornada' : ' jornadas') +
            (x.monthly ? ', incluye sueldo mensual' : '') +
            ')',
          money(s.base),
        ],
        ['Horas extra (' + compactHours(s.extra) + ')', money(s.extraPay)],
      ];
      if (s.adjustments) L.push(['Ajustes y adicionales', sMoney(s.adjustments)]);
      L.push(['Generado', money(s.total)]);
      if (o.paid) L.push(['Cobrado', sMoney(-s.paid)]);
      fnt(0, 10);
      for (const [l, v] of L) {
        ensure(8);
        col(INK);
        fnt(l === 'Generado', 10);
        T(l, M, y);
        T(v, W - M, y, { align: 'right' });
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        doc.line(M, y + 2.4, W - M, y + 2.4);
        y += 7.4;
      }
      if (o.pending) {
        ensure(12);
        y += 2;
        doc.setFillColor(224, 241, 238);
        doc.roundedRect(M, y - 5.5, W - 2 * M, 10, 2, 2, 'F');
        col(TEAL);
        fnt(1, 12);
        T(s.balance < 0 ? 'Saldo a tu favor' : 'Pendiente de cobro', M + 3, y + 1.2);
        T(money(Math.abs(s.balance)), W - M - 3, y + 1.2, { align: 'right' });
        y += 12;
      }
      col(MUTED);
      fnt(0, 8.5);
      ensure(8);
      T('Tarifa vigente: ' + rateLine(x), M, y);
      y += 9;
    }
    if (o.detail && x.rows.length) {
      h2('Jornadas');
      const cols = [
        ['Fecha', 20],
        ['Día', 11],
        ['Lugar / actividad', x.mOn ? 50 : 72],
        ['Horario', 27],
        ['Horas', 20],
        ['Extra', 17],
        ['Pago', 13, 'r'],
      ].concat(x.mOn ? [['Total', W - 2 * M - 158, 'r']] : []);
      table(
        cols,
        x.rows.map(r => ({
          muted: r.r.status !== 'Presente',
          cells: [r.date, r.wd, r.place, r.time || r.r.status, r.hours || '—', r.extra || '—', r.mult || '—'].concat(
            x.mOn ? [r.total != null ? money(r.total) : '—'] : [],
          ),
        })),
        {
          total: ['Total', '', s.days + ' jornadas', '', compactHours(s.hours), compactHours(s.extra), ''].concat(
            x.mOn ? [money(Core.round(x.rows.reduce((n, r) => n + (r.total || 0), 0)))] : [],
          ),
        },
      );
    }
    if (o.total && x.adjs.length) {
      h2('Ajustes');
      table(
        [
          ['Fecha', 25],
          ['Motivo', W - 2 * M - 60],
          ['Importe', 35, 'r'],
        ],
        x.adjs.map(a => ({ cells: [dateLabel(a.date), a.note, sMoney(a.amount)] })),
        { total: ['Total', '', sMoney(s.adjustments)] },
      );
    }
    if (o.paid && x.pays.length) {
      h2('Cobros');
      table(
        [
          ['Fecha', 25],
          ['Imputado a', 25],
          ['Detalle', W - 2 * M - 85],
          ['Importe', 35, 'r'],
        ],
        x.pays.map(p => ({
          cells: [dateLabel(p.date), dateLabel(Core.allocatedDate(p)), p.note || 'Cobro', money(p.amount)],
        })),
        { total: ['Total', '', '', money(s.paid)] },
      );
    }
    if (y + 16 > 282) {
      doc.addPage();
      head();
    }
    y = Math.min(280, y + 14);
    doc.setDrawColor(150, 160, 165);
    doc.setLineWidth(0.3);
    doc.line(M, y, M + 70, y);
    doc.line(W - M - 70, y, W - M, y);
    col(MUTED);
    fnt(0, 8.5);
    T(x.name || 'Trabajador/a', M, y + 5);
    T('Recibí conforme / Empleador', W - M, y + 5, { align: 'right' });
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      fnt(0, 7.5);
      col(MUTED);
      T(
        'Generado con Mi Quincena según los registros cargados por el usuario. No es un recibo de sueldo oficial.',
        M,
        290,
      );
      T('Página ' + i + ' de ' + n, W - M, 290, { align: 'right' });
    }
    download(x.file('pdf'), 'application/pdf', doc.output('datauristring').split(',')[1]);
  } catch (e) {
    toast('No se pudo crear el PDF: ' + e.message);
  }
}
