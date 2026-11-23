// Pantallas principales (Quincena, Horarios, Pagos, Ajustes, Por obra) y el enlace de eventos.
'use strict';

function statusBadge(r) {
  return (
    '<span class="pill ' +
    (r.status === 'Ausente' ? 'absent' : !r.status ? 'unrecorded' : '') +
    '">' +
    esc(r.status || 'Sin registrar') +
    '</span>'
  );
}

function warn(s) {
  if (loadError)
    return '<div class="warn">No se pudo leer el archivo guardado. Tus datos no se sobrescribieron. Restaurá una copia desde Ajustes.</div>';
  if (!state.rules.length && !state.rows.some(r => r.status))
    return (
      '<section class="welcome"><img src="' +
      (window.LOGO_URI || '') +
      '" alt=""><h2>¡Hola! Empecemos</h2><p>Dos pasos y la app calcula sola cuánto te deben cada quincena.</p><button class="primary" data-action="rule">' +
      icon('pay') +
      ' 1. Cargá cuánto te pagan</button><button data-action="new">' +
      icon('plus') +
      ' 2. Registrá tu primer día</button><small>Tus datos quedan solo en este teléfono.</small></section>'
    );
  if (!state.rules.length)
    return '<div class="warn">Falta tu tarifa para calcular cuánto te corresponde.<br><button data-action="rule">Cargar tarifa</button></div>';
  if (s.missing) return '<div class="warn">' + s.missing + ' jornadas sin tarifa. Los importes son parciales.</div>';
  return '';
}

function rowCards(rows) {
  return rows
    .map(r => {
      const c = Core.calc(r, state.rules);
      return (
        '<button class="day" data-edit="' +
        r.date +
        '"><span class="datebox"><small>' +
        dayName(r.date) +
        '</small><b>' +
        r.date.slice(8) +
        '</b></span><span class="dayinfo"><strong>' +
        esc(r.place || (r.status ? 'Jornada' : 'Sin registrar')) +
        '</strong><small>' +
        (Core.holidayOf(state.settings, r.date) ? '<i class="hol">Feriado</i> ' : '') +
        (r.start
          ? esc(r.start) + ' – ' + esc(r.end) + (r.overnight ? ' (+1 día)' : '') + ' · ' + hrs(c.hours)
          : r.status || 'Tocá para completar') +
        '</small></span><span class="daymeta">' +
        (r.status === 'Presente' && c.configured ? '<span class="cash">' + money(c.total) + '</span><br>' : '') +
        (r.multiplier && r.multiplier !== 1 && (r.status === 'Presente' || r.paid)
          ? '<span class="pill mult">' + multLabel(r.multiplier) + '</span> '
          : '') +
        statusBadge(r) +
        '</span></button>'
      );
    })
    .join('');
}

function go(t) {
  tabName = t;
  location.hash = t;
  render();
  window.scrollTo(0, 0);
}

function render() {
  appearance();
  let s;
  try {
    s = summary();
  } catch (e) {
    $('month').value = today().slice(0, 7);
    s = summary();
  }
  document.querySelectorAll('nav [data-tab]').forEach(b => {
    const on = b.dataset.tab === tabName;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'page' : 'false');
  });
  $('title').textContent = {
    summary: 'Tu quincena',
    hours: 'Horarios',
    pay: 'Pagos',
    settings: 'Ajustes',
    guide: 'Guía de uso',
    stats: 'Por obra',
  }[tabName];
  const d = new Date(month() + '-02T12:00:00'),
    cur = today();
  $('periodTitle').textContent = part() === 'all' ? 'Mes completo' : part() + 'ª quincena';
  $('periodSub').textContent =
    (month().slice(0, 4) === cur.slice(0, 4)
      ? d.toLocaleDateString('es-AR', { month: 'long' })
      : d.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }).replace('.', '')) +
    (part() === '1' ? ' · 1 al 15' : part() === '2' ? ' · 16 al ' + Core.dates(month()).length : '');
  document.querySelectorAll('[data-part]').forEach(b => b.setAttribute('aria-pressed', b.dataset.part === part()));
  $('today').hidden = month() === cur.slice(0, 7) && part() === (+cur.slice(8) <= 15 ? '1' : '2');
  $('periodBar').hidden = ['settings', 'guide', 'stats'].includes(tabName);
  $('content').innerHTML =
    (['guide', 'stats'].includes(tabName) ? '' : warn(s)) +
    (tabName === 'summary'
      ? summaryView(s)
      : tabName === 'hours'
        ? hoursView()
        : tabName === 'pay'
          ? payView(s)
          : tabName === 'guide'
            ? guideView()
            : tabName === 'stats'
              ? statsView()
              : settingsView());
  bind();
}

function shift(n) {
  let m = month(),
    p = part();
  const [y, mo] = m.split('-').map(Number),
    mk = (yy, mm) => {
      const x = new Date(yy, mm - 1, 1);
      return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0');
    };
  if (p === 'all') m = mk(y, mo + n);
  else {
    const k = (p === '1' ? 0 : 1) + n;
    m = mk(y, mo + Math.floor(k / 2));
    p = String((((k % 2) + 2) % 2) + 1);
  }
  $('month').value = m;
  $('part').value = p;
  render();
}

function carryView() {
  if (!state.rules.length) return '';
  const c = Core.carryOver(state, part() === 'all' ? month() + ':1' : currentKey());
  return c.periods
    ? '<button class="carry" data-action="carry">' +
        icon('pay') +
        '<span><strong>' +
        money(c.total) +
        ' pendiente de antes</strong><small>' +
        c.periods +
        (c.periods > 1 ? ' quincenas anteriores con saldo sin cobrar' : ' quincena anterior con saldo sin cobrar') +
        '</small></span>' +
        icon('arrow') +
        '</button>'
    : '';
}

function chartView() {
  if (!state.rules.length) return '';
  const h = Core.history(state, currentKey(), 6),
    max = Math.max(1, ...h.map(x => Math.max(x.total, x.paid))),
    W = 320,
    H = 140,
    bw = W / h.length,
    y = v => H - (v / max) * H;
  const label = k =>
    new Date(k.slice(0, 7) + '-02T12:00:00').toLocaleDateString('es-AR', { month: 'short' }).replace('.', '') +
    ' ' +
    k.slice(8) +
    'ª';
  const bars = h
    .map((x, i) => {
      const x0 = i * bw + bw * 0.18,
        w = bw * 0.3;
      return (
        '<rect class="b-gen" x="' +
        x0.toFixed(1) +
        '" y="' +
        y(x.total).toFixed(1) +
        '" width="' +
        w.toFixed(1) +
        '" height="' +
        (H - y(x.total)).toFixed(1) +
        '" rx="4"><title>' +
        label(x.key) +
        ': generado ' +
        money(x.total) +
        '</title></rect><rect class="b-paid" x="' +
        (x0 + w + 2).toFixed(1) +
        '" y="' +
        y(x.paid).toFixed(1) +
        '" width="' +
        w.toFixed(1) +
        '" height="' +
        (H - y(x.paid)).toFixed(1) +
        '" rx="4"><title>' +
        label(x.key) +
        ': cobrado ' +
        money(x.paid) +
        '</title></rect><text x="' +
        (i * bw + bw / 2).toFixed(1) +
        '" y="' +
        (H + 16) +
        '" text-anchor="middle">' +
        label(x.key) +
        '</text>'
      );
    })
    .join('');
  const sumHours = h.reduce((n, x) => n + x.hours, 0),
    sumTotal = h.reduce((n, x) => n + x.total, 0);
  return (
    '<section class="panel chart-panel"><h2>Últimas 6 quincenas</h2><div class="legend"><span class="k-gen">Generado</span><span class="k-paid">Cobrado</span></div><svg class="chart" viewBox="0 0 ' +
    W +
    ' ' +
    (H + 22) +
    '" role="img" aria-label="Generado y cobrado de las últimas 6 quincenas">' +
    bars +
    '</svg><div class="line"><span>Promedio por quincena</span><strong>' +
    money(Core.round(sumTotal / h.length)) +
    '</strong></div><div class="line"><span>Horas en 6 quincenas</span><strong>' +
    compactHours(sumHours) +
    '</strong></div><div class="line"><span>Valor medio de tu hora</span><strong>' +
    (sumHours ? money(Core.round(sumTotal / sumHours)) : '—') +
    '</strong></div></section>'
  );
}

function paydayBanner() {
  const pd = state.settings.payday;
  if (!pd || !pd.enabled) return '';
  const t = today(),
    from = new Date();
  from.setDate(from.getDate() - 45);
  const f = [
      from.getFullYear(),
      String(from.getMonth() + 1).padStart(2, '0'),
      String(from.getDate()).padStart(2, '0'),
    ].join('-'),
    due = Core.paydays(pd, f, 6)
      .filter(x => x.date <= t)
      .map(x => ({ ...x, b: Core.summarize(state, x.key.slice(0, 7), x.key.slice(8)).balance }))
      .filter(x => x.b > 0.004)
      .pop();
  if (!due) {
    const nx = Core.paydays(pd, t, 1)[0];
    return nx
      ? '<div class="note-line">' +
          icon('bell') +
          ' Próximo cobro: ' +
          (nx.date === t ? 'hoy' : dateLabel(nx.date).slice(0, 5)) +
          ' · ' +
          qLong(nx.key) +
          '</div>'
      : '';
  }
  return (
    '<button class="carry pay-due" data-paydue="' +
    due.key +
    '">' +
    icon('pay') +
    '<span><strong>' +
    (due.date === t ? 'Hoy es día de cobro' : 'Cobro atrasado desde el ' + dateLabel(due.date).slice(0, 5)) +
    '</strong><small>' +
    esc(qLong(due.key)) +
    ' · te deben ' +
    money(due.b) +
    '. Tocá para registrar el cobro.</small></span>' +
    icon('arrow') +
    '</button>'
  );
}

function missingBanner() {
  if (!state.settings.checks) return '';
  const ms = Core.missingDays(state, month(), part(), today());
  return ms.length
    ? '<button class="carry miss" data-go-missing>' +
        icon('hours') +
        '<span><strong>' +
        ms.length +
        (ms.length === 1 ? ' día pasado sin registrar' : ' días pasados sin registrar') +
        '</strong><small>' +
        ms
          .slice(0, 6)
          .map(d => dayName(d).replace('.', '') + ' ' + d.slice(8))
          .join(', ') +
        (ms.length > 6 ? '…' : '') +
        '. Tocá para completarlos.</small></span>' +
        icon('arrow') +
        '</button>'
    : '';
}

function summaryView(s) {
  const rows = selectedRows()
      .filter(r => r.status)
      .reverse()
      .slice(0, 4),
    pct = s.total > 0 ? Math.min(100, Math.round((s.paid / s.total) * 100)) : 0;
  return (
    paydayBanner() +
    missingBanner() +
    carryView() +
    '<div class="dashboard"><div><section class="hero"><div class="hero-label">' +
    (s.balance < 0 ? 'Saldo a tu favor' : 'Pendiente de cobro') +
    '</div><div class="amount">' +
    (state.rules.length ? money(Math.abs(s.balance)) : 'Sin tarifa') +
    '</div><div class="progress" role="progressbar" aria-label="Parte cobrada de lo generado" aria-valuenow="' +
    pct +
    '" aria-valuemin="0" aria-valuemax="100"><i style="width:' +
    pct +
    '%"></i></div><div class="breakdown"><div><small>Generado</small><strong>' +
    money(s.total) +
    '</strong></div><div><small>Cobrado · ' +
    pct +
    '%</small><strong>' +
    money(s.paid) +
    '</strong></div></div><button type="button" class="share-btn" data-action="share">' +
    icon('share') +
    ' Compartir quincena</button></section><div class="grid"><div class="metric"><small>Jornadas</small><b>' +
    s.days +
    '</b></div><div class="metric"><small>Horas</small><b>' +
    compactHours(s.hours) +
    '</b></div><div class="metric"><small>Extras</small><b>' +
    compactHours(s.extra) +
    '</b></div></div></div><section class="panel recent"><div class="panel-head"><h2>Últimos registros</h2>' +
    (rows.length ? '<button class="link" data-go="hours">Ver todos ' + icon('arrow') + '</button>' : '') +
    '</div>' +
    (rows.length
      ? rowCards(rows)
      : '<div class="empty">' +
        icon('hours') +
        '<p>Todavía no hay jornadas en este período.</p><small>Tocá el botón + de abajo para registrar tu primer día.</small></div>') +
    '</section></div>' +
    statsCard() +
    chartView()
  );
}

let hoursFilter = 'all';

function dayList() {
  const rs = selectedRows().filter(r => hoursFilter === 'all' || r.status === hoursFilter);
  return rs.length ? rowCards(rs) : '<p class="empty">No hay días con ese estado en este período.</p>';
}

function hoursView() {
  const chips = [['all', 'Todos'], ...Core.statuses.map(v => [v, v || 'Sin registrar'])];
  return (
    '<div class="chips" role="group" aria-label="Filtrar por asistencia">' +
    chips
      .map(
        ([v, t]) =>
          '<button class="chip" data-filter="' +
          esc(v) +
          '" aria-pressed="' +
          (hoursFilter === v) +
          '">' +
          esc(t) +
          '</button>',
      )
      .join('') +
    '</div><section class="panel"><div class="panel-head"><h2>Planilla</h2><button class="link" data-action="batch">' +
    icon('copy') +
    ' Cargar varios días</button></div><div id="dayList">' +
    dayList() +
    '</div></section><details><summary>Ver como tabla</summary>' +
    table(false) +
    '</details>'
  );
}

function table(pay) {
  return (
    '<div class="tablewrap" tabindex="0" role="region" aria-label="Planilla desplazable"><table><thead><tr><th>Fecha</th><th>Actividad</th><th>Entrada</th><th>Salida</th><th>Asistencia</th>' +
    (pay ? '<th>Horas</th><th>Extras</th><th>Generado diario</th>' : '<th>Observaciones</th>') +
    '</tr></thead><tbody>' +
    selectedRows()
      .map(r => {
        const c = Core.calc(r, state.rules);
        return (
          '<tr><td><button data-edit="' +
          r.date +
          '">' +
          dateLabel(r.date) +
          '</button></td><td>' +
          esc(r.place) +
          '</td><td>' +
          esc(r.start) +
          '</td><td>' +
          esc(r.end) +
          (r.overnight ? ' +1' : '') +
          '</td><td>' +
          esc(r.status || 'Sin registrar') +
          '</td>' +
          (pay
            ? '<td>' +
              hrs(c.hours) +
              '</td><td>' +
              hrs(c.extra) +
              '</td><td>' +
              (c.configured ? money(c.total) : 'Sin tarifa') +
              '</td>'
            : '<td>' + esc(r.note) + '</td>') +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

function qa(a, ic, t, cls = '') {
  return (
    '<button type="button" class="qa ' +
    cls +
    '" data-action="' +
    a +
    '">' +
    icon(ic) +
    '<span>' +
    t +
    '</span></button>'
  );
}

function payView(s) {
  const ds = Core.dates(month(), part()),
    ps = state.payments.filter(p => ds.includes(Core.allocatedDate(p))),
    adj = state.adjustments.filter(a => ds.includes(a.date)),
    locked = part() !== 'all' && state.closed.includes(month() + ':' + part()),
    pct = pctOf(s),
    moves = [...ps.map(o => ({ k: 'pay', d: o.date, o })), ...adj.map(o => ({ k: 'adj', d: o.date, o }))].sort((x, y) =>
      y.d.localeCompare(x.d),
    ),
    special = selectedRows().filter(
      r => r.multiplier && r.multiplier !== 1 && (r.status === 'Presente' || r.paid),
    ).length;
  return (
    '<section class="hero pay-hero"><div class="hero-label"><span>' +
    (s.balance < 0 ? 'Saldo a tu favor' : 'Pendiente de cobro') +
    '</span>' +
    (part() !== 'all'
      ? '<span class="pill' +
        (locked ? ' locked' : '') +
        '">' +
        icon(locked ? 'lock' : 'check') +
        (locked ? 'Cerrada' : 'Abierta') +
        '</span>'
      : '') +
    '</div><div class="amount">' +
    money(Math.abs(s.balance)) +
    '</div><div class="progress" role="progressbar" aria-label="Parte cobrada" aria-valuenow="' +
    pct +
    '" aria-valuemin="0" aria-valuemax="100"><i style="width:' +
    pct +
    '%"></i></div><div class="breakdown"><div><small>Generado</small><strong>' +
    money(s.total) +
    '</strong></div><div><small>Cobrado · ' +
    pct +
    '%</small><strong>' +
    money(s.paid) +
    '</strong></div></div></section>' +
    '<div class="quick">' +
    qa('payment', 'plus', 'Registrar cobro', 'primary') +
    (s.balance > 0.004 ? qa('payAll', 'check', 'Cobrar saldo') : '') +
    qa('adjustment', 'adjust', 'Ajuste') +
    (part() !== 'all' ? qa('closePeriod', 'lock', locked ? 'Reabrir' : 'Cerrar') : '') +
    '</div>' +
    '<section class="panel liq"><h2>Liquidación</h2>' +
    [
      ['Base · ' + s.days + (s.days === 1 ? ' jornada' : ' jornadas'), s.base],
      ['Extras · ' + compactHours(s.extra), s.extraPay],
      ['Ajustes y adicionales', s.adjustments],
    ]
      .map(([l, v]) => '<div class="line"><span>' + l + '</span><strong>' + money(v) + '</strong></div>')
      .join('') +
    '<div class="line sub"><strong>Generado</strong><strong>' +
    money(s.total) +
    '</strong></div><div class="line"><span>Cobrado</span><strong class="neg">− ' +
    money(s.paid) +
    '</strong></div><div class="line total"><strong>' +
    (s.balance < 0 ? 'A tu favor' : 'Pendiente') +
    '</strong><strong>' +
    money(Math.abs(s.balance)) +
    '</strong></div>' +
    (special
      ? '<small>Incluye ' + special + (special === 1 ? ' día' : ' días') + ' con pago especial (doble, ×1,5…).</small>'
      : '') +
    '</section>' +
    '<section class="panel"><div class="panel-head"><h2>Movimientos</h2>' +
    (moves.length ? '<span class="count">' + moves.length + '</span>' : '') +
    '</div>' +
    (moves.length
      ? moves
          .map(
            ({ k, o }) =>
              '<button class="listitem move" data-' +
              (k === 'pay' ? 'payment' : 'adjustment') +
              '="' +
              esc(o.id) +
              '"><i class="mv mv-' +
              (k === 'pay' ? 'pay' : o.amount < 0 ? 'neg' : 'adj') +
              '">' +
              icon(k === 'pay' ? 'pay' : 'adjust') +
              '</i><span><strong>' +
              esc(o.note || (k === 'pay' ? 'Cobro' : 'Ajuste')) +
              '</strong><small>' +
              (k === 'pay' ? 'Cobro' : 'Ajuste') +
              ' · ' +
              dateLabel(o.date) +
              '</small></span><b class="amt ' +
              (k === 'pay' || o.amount > 0 ? 'pos' : 'neg') +
              '">' +
              (k === 'pay' || o.amount > 0 ? '+ ' : '− ') +
              money(Math.abs(o.amount)) +
              '</b></button>',
          )
          .join('')
      : '<div class="empty">' +
        icon('pay') +
        '<p>Sin cobros ni ajustes en este período.</p><small>Cuando te paguen, tocá “Registrar cobro”.</small></div>') +
    '</section><details><summary>Ver cálculo por jornada</summary>' +
    table(true) +
    '<small>La base mensual y los ajustes están en la liquidación, no en cada fila.</small></details>'
  );
}

function item(k, title, desc, action) {
  return (
    '<button class="listitem" data-action="' +
    action +
    '">' +
    icon(k) +
    '<span>' +
    title +
    '<small>' +
    desc +
    '</small></span>' +
    icon('arrow') +
    '</button>'
  );
}

function settingsView() {
  const st = state.settings,
    g = (t, items) => '<section class="panel group"><h2>' + t + '</h2>' + items.join('') + '</section>',
    cur = Core.ruleFor(state.rules, today()),
    ini = (st.name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
    sub = [st.job, st.employer].filter(Boolean).join(' · ');
  return (
    '<button class="profile-card" data-action="profile"><span class="avatar">' +
    (ini ? esc(ini) : icon('user')) +
    '</span><span><strong>' +
    esc(st.name || 'Tu perfil') +
    '</strong><small>' +
    esc(sub || 'Agregá tu nombre y trabajo para tus recibos') +
    '</small></span>' +
    icon('arrow') +
    '</button><div class="settings-grid">' +
    g('Trabajo y pagos', [
      item(
        'pay',
        'Tarifas',
        cur
          ? money(cur.rate) + ' / ' + UNIT[cur.mode] + ' · vigente'
          : state.rules.length
            ? 'Sin tarifa vigente hoy'
            : 'Configurala primero',
        'rates',
      ),
      item('copy', 'Cargar varios días', 'Plantilla de tu jornada habitual', 'batch'),
      item(
        'bell',
        'Recordatorios',
        st.reminder
          ? 'Activo · ' +
              esc(st.reminderTime) +
              ' · ' +
              ((st.reminderDays || []).length === 7
                ? 'todos los días'
                : (st.reminderDays || []).map(i => WD[i]).join(' '))
          : 'Desactivados',
        'reminders',
      ),
    ]) +
    '<section class="panel group look"><h2>Apariencia</h2><div class="seg-row" role="group" aria-label="Tema">' +
    [
      ['system', 'Sistema'],
      ['light', 'Claro'],
      ['dark', 'Oscuro'],
      ['amoled', 'AMOLED'],
    ]
      .map(
        ([v, t]) =>
          '<button type="button" data-theme-choice="' +
          v +
          '" aria-pressed="' +
          (st.theme === v) +
          '"><i class="sw sw-' +
          v +
          '"></i>' +
          t +
          '</button>',
      )
      .join('') +
    '</div><div class="sub-label">Color de acento</div><div class="accents" role="group" aria-label="Color de acento">' +
    Object.entries(ACCENT)
      .map(
        ([k, v]) =>
          '<button type="button" class="accent-dot" data-accent="' +
          k +
          '" aria-label="' +
          v[0] +
          '" aria-pressed="' +
          ((st.accent || 'teal') === k) +
          '" style="--c:' +
          v[2] +
          '"></button>',
      )
      .join('') +
    '</div><label class="check switch"><span><b>Reducir transparencia</b><small>Superficies sólidas, más contraste y menos consumo</small></span><input type="checkbox" role="switch" data-pref="reduceTransparency" ' +
    (st.reduceTransparency ? 'checked' : '') +
    '></label><label class="check switch"><span><b>Sin animaciones</b><small>Quita las transiciones de ventanas, botones e interruptores. Si tu teléfono tiene “Quitar animaciones” activado, la app ya lo respeta sola</small></span><input type="checkbox" role="switch" data-pref="reduceMotion" ' +
    (st.reduceMotion ? 'checked' : '') +
    '></label></section>' +
    '<section class="panel group"><h2>Tus datos</h2>' +
    dataSummary() +
    [
      item('undo', 'Copias de seguridad', 'Exportar, restaurar y versiones automáticas', 'backups'),
      item('cloud', 'Google Drive', 'Respaldo vinculado que se actualiza solo', 'cloud'),
      item('file', 'Importar', 'Planilla Excel o copia .json', 'import'),
      item('table', 'Exportar período a Excel', 'Horarios y liquidación de ' + esc(periodLabel()), 'exportXlsx'),
      item('trash', 'Borrar todos los datos', 'Empezar de cero (se puede deshacer)', 'wipe'),
    ].join('') +
    '</section>' +
    functionsSection() +
    g('Ayuda', [
      item('book', 'Guía de uso', 'Cómo usar cada función, con ejemplos', 'guide'),
      item('help', 'Acerca de Mi Quincena', 'Versión, privacidad y rutina recomendada', 'about'),
    ]) +
    '</div><p class="footer">Mi Quincena ' +
    APP_VERSION +
    ' · Tus datos se guardan en este teléfono.</p>'
  );
}

function bind(root = document) {
  const on = (q, f) => root.querySelectorAll(q).forEach(b => (b.onclick = () => f(b)));
  on('[data-edit]', b => editRow(b.dataset.edit));
  on('[data-go]', b => go(b.dataset.go));
  on('[data-action]', b => action(b.dataset.action));
  on('[data-rule]', b => ruleForm(b.dataset.rule));
  on('[data-payment]', b => paymentForm(b.dataset.payment));
  on('[data-adjustment]', b => adjustmentForm(b.dataset.adjustment));
  on('[data-theme-choice]', b => mutate(() => (state.settings.theme = b.dataset.themeChoice), 'Tema guardado.'));
  on('[data-accent]', b => mutate(() => (state.settings.accent = b.dataset.accent), 'Color guardado.'));
  root
    .querySelectorAll('[data-pref]')
    .forEach(
      i => (i.onchange = () => mutate(() => (state.settings[i.dataset.pref] = i.checked), 'Preferencia guardada.')),
    );
  on('[data-toc]', b => {
    const d = $('g-' + b.dataset.toc);
    d.open = true;
    d.scrollIntoView({ block: 'start' });
  });
  if (root === document && $('guideQ'))
    $('guideQ').oninput = e => {
      const q = e.target.value;
      let any = false;
      document.querySelectorAll('.guide-sec').forEach(d => {
        const m = !Core.norm(q) || Core.matches(Core.norm(d.textContent), q);
        d.hidden = !m;
        if (m) any = true;
        if (Core.norm(q) && m) d.open = true;
      });
      $('guideNone').hidden = any;
    };
  on('[data-paydue]', b => paymentForm(null, null, b.dataset.paydue));
  on('[data-go-missing]', () => {
    hoursFilter = '';
    go('hours');
  });
  on('[data-stats-range]', b => {
    statsRange = b.dataset.statsRange;
    render();
  });
  on('[data-stats-place]', b => {
    openSearch();
    $('searchInput').value = b.dataset.statsPlace;
    runSearch();
  });
  on('[data-feature]', b => featureToggle(b));
  on('[data-filter]', b => {
    hoursFilter = b.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(c => c.setAttribute('aria-pressed', c === b));
    $('dayList').innerHTML = dayList();
    bind($('dayList'));
  });
}

let statsRange = 'month';

function statsBounds() {
  const t = today(),
    d = new Date(t + 'T12:00:00'),
    y = d.getFullYear();
  if (statsRange === 'q') {
    const ds = Core.dates(t.slice(0, 7), +t.slice(8) <= 15 ? '1' : '2');
    return [ds[0], ds[ds.length - 1], 'Esta quincena'];
  }
  if (statsRange === 'month') return [t.slice(0, 7) + '-01', t, 'Este mes'];
  if (statsRange === '3m') {
    const a = new Date(d);
    a.setMonth(a.getMonth() - 3);
    return [ymd(a), t, 'Últimos 3 meses'];
  }
  if (statsRange === 'year') return [y + '-01-01', t, 'Este año ' + y];
  return ['1900-01-01', '2200-12-31', 'Todo el historial'];
}

function statsView() {
  const [a, b, label] = statsBounds(),
    { list, tot } = Core.placeStats(state, a, b),
    max = Math.max(1, ...list.map(e => e.days)),
    most = list[0],
    ext = [...list].sort((x, y) => y.extra - x.extra)[0],
    long = [...list].sort((x, y) => y.avgHours - x.avgHours)[0];
  return (
    '<button class="link back" data-go="summary">' +
    icon('left') +
    ' Quincena</button><p class="lead">Misma empresa, distintas obras: dónde estuviste, cuántas horas y cuántas extras hiciste en cada una.</p><div class="chips toc">' +
    [
      ['q', 'Quincena'],
      ['month', 'Mes'],
      ['3m', '3 meses'],
      ['year', 'Año'],
      ['all', 'Todo'],
    ]
      .map(
        ([k, t]) =>
          '<button type="button" class="chip" data-stats-range="' +
          k +
          '" aria-pressed="' +
          (statsRange === k) +
          '">' +
          t +
          '</button>',
      )
      .join('') +
    '</div>' +
    (!list.length
      ? '<div class="empty">' +
        icon('hours') +
        '<p>No hay días trabajados en ' +
        esc(label.toLowerCase()) +
        '.</p></div>'
      : '<section class="hero stats-hero"><div class="hero-label"><span>' +
        esc(label) +
        '</span><span class="pill">' +
        list.length +
        (list.length === 1 ? ' obra' : ' obras') +
        '</span></div><div class="grid"><div class="metric"><small>Días</small><b>' +
        tot.days +
        '</b></div><div class="metric"><small>Horas</small><b>' +
        compactHours(tot.hours) +
        '</b></div><div class="metric"><small>Extras</small><b>' +
        compactHours(tot.extra) +
        '</b></div></div>' +
        (state.rules.length
          ? '<div class="line"><span>Generado en días trabajados</span><strong>' + money(tot.total) + '</strong></div>'
          : '') +
        '</section>' +
        '<div class="insights">' +
        [
          most && ['Donde más fuiste', most.place, most.days + (most.days === 1 ? ' día' : ' días')],
          ext && ext.extra > 0 && ['Donde más extras hiciste', ext.place, compactHours(ext.extra)],
          long && list.length > 1 && ['Jornadas más largas', long.place, compactHours(long.avgHours) + ' por día'],
        ]
          .filter(Boolean)
          .map(
            ([t, p, v]) =>
              '<div class="insight"><small>' + t + '</small><b>' + esc(p) + '</b><span>' + v + '</span></div>',
          )
          .join('') +
        '</div>' +
        '<section class="panel"><h2>Por obra</h2>' +
        list
          .map(
            e =>
              '<button type="button" class="place-row" data-stats-place="' +
              esc(e.place) +
              '"><span class="pr-top"><b>' +
              esc(e.place) +
              '</b><span>' +
              e.days +
              (e.days === 1 ? ' día' : ' días') +
              '</span></span><span class="bar"><i style="width:' +
              Math.round((e.days / max) * 100) +
              '%"></i></span><small>' +
              compactHours(e.hours) +
              ' · ' +
              (e.extra ? compactHours(e.extra) + ' extra · ' : '') +
              compactHours(e.avgHours) +
              ' por día' +
              (e.special ? ' · ' + e.special + ' especiales' : '') +
              (state.rules.length ? ' · ' + money(e.total) : '') +
              '</small><small>' +
              (e.first === e.last ? dateLabel(e.first) : dateLabel(e.first) + ' → ' + dateLabel(e.last)) +
              ' · ' +
              Math.round(e.share * 100) +
              ' % de tus días</small></button>',
          )
          .join('') +
        '</section><p class="muted">Tocá una obra para ver todos sus días.</p>')
  );
}

function statsCard() {
  if (!state.settings.placeStats) return '';
  const ds = Core.dates(month(), part()),
    { list } = Core.placeStats(state, ds[0], ds[ds.length - 1]);
  if (!list.length) return '';
  return (
    '<section class="panel"><div class="panel-head"><h2>Por obra</h2><button class="link" data-go="stats">Ver más ' +
    icon('arrow') +
    '</button></div>' +
    list
      .slice(0, 4)
      .map(
        e =>
          '<div class="line"><span>' +
          esc(e.place) +
          '</span><strong>' +
          e.days +
          (e.days === 1 ? ' día' : ' días') +
          ' · ' +
          compactHours(e.hours) +
          '</strong></div>',
      )
      .join('') +
    '</section>'
  );
}
