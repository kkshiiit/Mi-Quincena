// Ventanas y formularios: día, cobro, ajuste, tarifas, recordatorios, perfil, funciones opcionales.
'use strict';

function modal(html) {
  if (locked) return;
  lastFocus = document.activeElement;
  if (!$('dialog').dataset.kb) {
    $('dialog').dataset.kb = 1;
    $('dialog').addEventListener('focusin', e => {
      const t = e.target;
      if (t.matches('input:not([type=checkbox]):not([type=radio]),textarea'))
        setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'auto' }), 280);
    });
  }
  $('modal').innerHTML =
    '<button class="close" type="button" data-close aria-label="Cerrar">' +
    icon('close') +
    '</button>' +
    html.replace('<h2>', '<h2 id="modalTitle">');
  if (!$('dialog').open) $('dialog').showModal();
  $('modal').scrollTop = 0;
  document.querySelectorAll('[data-close]').forEach(b => (b.onclick = closeModal));
  bind($('modal'));
}

function closeModal() {
  $('dialog').close();
  if (lastFocus?.isConnected) lastFocus.focus();
}

function field(label, name, type, value, attrs = '') {
  const im = type === 'number' ? ' inputmode="' + (/step="1"/.test(attrs) ? 'numeric' : 'decimal') + '"' : '';
  return (
    '<label>' +
    label +
    '<input name="' +
    name +
    '" type="' +
    type +
    '" value="' +
    esc(value) +
    '" ' +
    attrs +
    im +
    '></label>'
  );
}

function select(label, name, options, value) {
  return (
    '<label>' +
    label +
    '<select name="' +
    name +
    '">' +
    options
      .map(([v, t]) => '<option value="' + esc(v) + '" ' + (v === value ? 'selected' : '') + '>' + esc(t) + '</option>')
      .join('') +
    '</select></label>'
  );
}

function formError(e) {
  if ($('formError')) $('formError').textContent = e.message || e;
  else toast(e.message || e);
}

function formEnd(text = 'Guardar') {
  return (
    '<p id="formError" class="error" role="alert"></p><div class="actions"><button class="primary" type="submit">' +
    text +
    '</button><button type="button" data-close>Cancelar</button></div>'
  );
}

function rowFrom(f) {
  const on = f.get('status') === 'Presente',
    brk = f.get('brk'),
    bm =
      brk == null
        ? Number(f.get('breakMinutes') || 0)
        : brk === 'custom'
          ? Number(f.get('breakCustom') || 0)
          : Number(brk);
  return {
    date: f.get('date'),
    place: String(f.get('place') || '').trim(),
    start: on ? f.get('start') || '' : '',
    end: on ? f.get('end') || '' : '',
    status: f.get('status') || '',
    note: String(f.get('note') || '').trim(),
    breakMinutes: on ? bm : 0,
    overnight: on && f.has('overnight'),
    paid: !on && f.has('paid'),
    multiplier: (m => (m === 1 ? undefined : m))(
      f.get('mult') === 'custom'
        ? Number(String(f.get('multCustom') || '').replace(',', '.'))
        : Number(f.get('mult') || 1),
    ),
  };
}

function placeList() {
  const m = new Map();
  for (const r of state.rows) {
    const p = String(r.place || '').trim();
    if (!p) continue;
    const k = Core.norm(p),
      e = m.get(k) || { p, n: 0, last: '' };
    e.n++;
    if (r.date > e.last) {
      e.last = r.date;
      e.p = p;
    }
    m.set(k, e);
  }
  return [...m.values()].sort((a, b) => b.n - a.n || b.last.localeCompare(a.last)).map(e => e.p);
}

function dayTitle(d) {
  if (!Core.validDate(d)) return '';
  const w = new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
    h = Core.holidayOf(state.settings, d);
  return w[0].toUpperCase() + w.slice(1) + (h ? ' · Feriado: ' + h.name : '');
}

async function editRow(date) {
  let existing = state.rows.find(x => x.date === date),
    r = clone(existing || blank(date));
  let draft;
  try {
    draft = JSON.parse(prefsGet('draft-row') || 'null');
  } catch (e) {}
  if (
    draft &&
    draft.original === date &&
    (await ask('Hay cambios sin guardar de este día. ¿Querés retomarlos?', {
      ok: 'Retomar',
      cancel: 'Empezar de nuevo',
    }))
  )
    r = draft.row;
  if (!r.status) r.status = 'Presente';
  const m = r.multiplier || 1,
    isCustom = ![1, 1.5, 2, 3].includes(m),
    bk = r.breakMinutes || 0,
    bkCustom = ![0, 30, 60].includes(bk),
    places = placeList(),
    isNew = !existing?.status,
    t0 = today(),
    y = new Date();
  y.setDate(y.getDate() - 1);
  const ayer = [y.getFullYear(), String(y.getMonth() + 1).padStart(2, '0'), String(y.getDate()).padStart(2, '0')].join(
      '-',
    ),
    radios = (n, opts, v) =>
      opts
        .map(
          ([k, t]) =>
            '<label class="chip-radio"><input type="radio" name="' +
            n +
            '" value="' +
            esc(k) +
            '" ' +
            (String(k) === String(v) ? 'checked' : '') +
            '><span>' +
            t +
            '</span></label>',
        )
        .join('');
  modal(
    '<h2>' +
      (isNew ? 'Registrar día' : 'Editar día') +
      '</h2><form id="rowForm" autocomplete="off">' +
      '<div class="step"><div class="step-h"><b>1</b>¿Qué día?</div><div class="date-row"><input name="date" type="date" value="' +
      esc(r.date) +
      '" required aria-label="Fecha">' +
      (isNew
        ? '<button type="button" class="mini" data-day="' +
          t0 +
          '">Hoy</button><button type="button" class="mini" data-day="' +
          ayer +
          '">Ayer</button>'
        : '') +
      '</div><small id="dayName"></small></div>' +
      '<div class="step"><div class="step-h"><b>2</b>¿Trabajaste?</div><div class="wrap">' +
      radios(
        'status',
        [
          ['Presente', 'Sí, trabajé'],
          ['Ausente', 'Falté'],
          ['Franco', 'Franco'],
          ['Feriado', 'Feriado'],
          ['Licencia', 'Licencia'],
        ].concat(r.status === '' ? [['', 'Sin registrar']] : []),
        r.status,
      ) +
      '</div></div>' +
      '<div id="suggest" class="suggest" hidden></div>' +
      '<div id="workFields"><div class="step"><div class="step-h"><b>3</b>¿Dónde?</div><input name="place" type="text" maxlength="200" value="' +
      esc(r.place) +
      '" placeholder="Escribí la obra o el lugar" aria-label="Lugar u obra" enterkeyhint="next"><div id="placeSug" class="sug-row"></div></div>' +
      '<div class="step"><div class="step-h"><b>4</b>Horario</div><div class="two"><label>Entraste a las<input name="start" type="time" value="' +
      esc(r.start) +
      '"></label><label>Saliste a las<input name="end" type="time" value="' +
      esc(r.end) +
      '"></label></div><label class="check" id="nightRow"><input name="overnight" type="checkbox" ' +
      (r.overnight ? 'checked' : '') +
      '>Saliste al día siguiente (turno noche)</label><div class="sub-label">Descanso que no te pagan</div><div class="wrap">' +
      radios(
        'brk',
        [
          [0, 'Sin descanso'],
          [30, '30 min'],
          [60, '1 h'],
          ['custom', 'Otro'],
        ],
        bkCustom ? 'custom' : bk,
      ) +
      '</div><label id="brkCustomWrap">Minutos de descanso<input name="breakCustom" type="number" inputmode="numeric" min="0" max="1439" step="1" value="' +
      (bkCustom ? bk : '') +
      '"></label></div></div>' +
      '<label class="check switch" id="paidField"><span><b>¿Te pagan este día igual?</b><small>Para feriados o licencias pagas (tarifa por día)</small></span><input name="paid" type="checkbox" role="switch" ' +
      (r.paid ? 'checked' : '') +
      '></label>' +
      '<div class="step" id="multField"><div class="step-h"><b>5</b>¿Cómo te pagan este día?</div><div class="wrap">' +
      radios(
        'mult',
        [
          [1, 'Normal'],
          [1.5, '×1,5'],
          [2, 'Doble ×2'],
          [3, 'Triple ×3'],
          ['custom', 'Otro'],
        ],
        isCustom ? 'custom' : m,
      ) +
      '</div><label id="multCustomWrap">Multiplicador<input name="multCustom" type="text" inputmode="decimal" value="' +
      (isCustom ? String(m).replace('.', ',') : '') +
      '" placeholder="Ej.: 1,75"></label></div>' +
      '<details class="adv"' +
      (r.note ? ' open' : '') +
      '><summary>Notas (opcional)</summary><textarea name="note" maxlength="2000" aria-label="Notas">' +
      esc(r.note) +
      '</textarea></details>' +
      '<div id="rowWarn" class="warn" hidden></div><div class="preview day-sum" id="rowPreview" aria-live="polite"></div>' +
      formEnd(isNew ? 'Guardar día' : 'Guardar cambios') +
      '<div class="actions secondary"><button type="button" id="useUsual">' +
      icon('copy') +
      ' Como el último día</button>' +
      (!isNew
        ? '<button type="button" id="duplicateRow">Duplicar</button><button type="button" id="deleteRow" class="danger">Eliminar</button>'
        : '') +
      '</div></form>',
  );
  const form = $('rowForm'),
    el = form.elements;
  let dismissed = false;
  function sugPlaces() {
    const q = Core.norm(el.place.value),
      list = places.filter(p => !q || (Core.norm(p).includes(q) && Core.norm(p) !== q)).slice(0, 8);
    $('placeSug').innerHTML = list
      .map(p => '<button type="button" class="mini" data-place="' + esc(p) + '">' + esc(p) + '</button>')
      .join('');
    $('placeSug')
      .querySelectorAll('[data-place]')
      .forEach(
        b =>
          (b.onclick = () => {
            el.place.value = b.dataset.place;
            sugPlaces();
            preview();
            saveDraft();
          }),
      );
  }
  function suggest(v) {
    const sp = Core.specialFor(state.settings, v.date),
      box = $('suggest'),
      on =
        (v.status === 'Presente' || v.paid) && sp && !dismissed && (v.multiplier || 1) === 1 && !existing?.multiplier;
    box.hidden = !on;
    if (on) {
      box.innerHTML =
        '<span>' +
        icon('trend') +
        '<b>' +
        esc(sp.reason) +
        '</b> ¿Te lo pagan ' +
        multLabel(sp.mult) +
        '?</span><div><button type="button" class="mini" id="sgYes">Sí, ' +
        multLabel(sp.mult) +
        '</button><button type="button" class="mini ghost" id="sgNo">No</button></div>';
      $('sgYes').onclick = () => {
        const pre = [1.5, 2, 3].includes(sp.mult);
        form.querySelector('[name=mult][value="' + (pre ? sp.mult : 'custom') + '"]').checked = true;
        if (!pre) el.multCustom.value = String(sp.mult).replace('.', ',');
        dismissed = true;
        preview();
        saveDraft();
      };
      $('sgNo').onclick = () => {
        dismissed = true;
        preview();
      };
    }
  }
  function preview() {
    const fd = new FormData(form),
      v = rowFrom(fd),
      active = v.status === 'Presente';
    $('dayName').textContent = dayTitle(v.date);
    $('workFields').hidden = !active;
    $('paidField').hidden = active;
    $('multField').hidden = !active && !v.paid;
    $('multCustomWrap').hidden = fd.get('mult') !== 'custom';
    $('brkCustomWrap').hidden = fd.get('brk') !== 'custom';
    $('nightRow').classList.toggle('on', !!el.overnight.checked);
    suggest(v);
    const ws = state.settings.checks ? Core.rowWarnings(v, today()) : [];
    $('rowWarn').hidden = !ws.length;
    $('rowWarn').innerHTML = ws.map(w => '⚠️ ' + esc(w)).join('<br>');
    try {
      Core.validateRow(v);
      const c = Core.calc(v, state.rules),
        old = existing?.status ? Core.calc(existing, state.rules).total : null;
      $('rowPreview').innerHTML = active
        ? '<span>' +
          esc(v.start) +
          ' a ' +
          esc(v.end) +
          (v.overnight ? ' (+1 día)' : '') +
          '</span><b>' +
          compactHours(c.hours) +
          (c.extra ? ' · ' + hm(c.extra) + ' extra' : '') +
          (c.multiplier && c.multiplier !== 1 ? ' · ' + multLabel(c.multiplier) : '') +
          '</b><strong>' +
          (c.configured ? money(c.total) : 'Sin tarifa') +
          '</strong>' +
          (old != null && c.configured && old !== c.total ? '<small>Antes: ' + money(old) + '</small>' : '')
        : '<span>' +
          esc(v.status) +
          (v.paid ? ' · pago' : ' · sin pago') +
          '</span>' +
          (v.paid && c.configured ? '<strong>' + money(c.total) + '</strong>' : '');
    } catch (e) {
      $('rowPreview').innerHTML =
        '<span>' + esc(active && !v.start ? 'Completá entrada y salida.' : e.message) + '</span>';
    }
  }
  function saveDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      try {
        const row = rowFrom(new FormData(form));
        prefsSet('draft-row', JSON.stringify(row) === initial ? '' : JSON.stringify({ original: date, row }));
      } catch (e) {}
    }, 300);
  }
  form.querySelectorAll('[data-day]').forEach(
    b =>
      (b.onclick = () => {
        el.date.value = b.dataset.day;
        dismissed = false;
        preview();
        saveDraft();
      }),
  );
  el.place.addEventListener('input', sugPlaces);
  el.place.addEventListener('focus', sugPlaces);
  sugPlaces();
  const onEdit = e => {
    const t = e && e.target;
    if (t && (t.name === 'start' || t.name === 'end') && el.start.value && el.end.value)
      el.overnight.checked = el.end.value <= el.start.value;
    if (t && t.name === 'date') dismissed = false;
    preview();
    saveDraft();
  };
  form.oninput = onEdit;
  form.onchange = onEdit;
  preview();
  const initial = JSON.stringify(rowFrom(new FormData(form)));
  form.onsubmit = async e => {
    e.preventDefault();
    try {
      const v = rowFrom(new FormData(form));
      if (v.status === 'Presente' && !v.start) throw Error('Completá a qué hora entraste y saliste.');
      Core.validateRow(v);
      guardDates([date, v.date]);
      if (v.date !== date && state.rows.some(x => x.date === v.date && (x.status || x.place || x.note)))
        throw Error('Ese día ya tiene datos. Abrilo desde Horarios para editarlo.');
      const ws = state.settings.checks ? Core.rowWarnings(v, today()) : [];
      if (
        ws.length &&
        !(await ask('• ' + ws.join('\n• '), {
          title: 'Revisá antes de guardar',
          ok: 'Guardar igual',
          cancel: 'Corregir',
        }))
      )
        return;
      if (
        mutate(
          () => {
            state.rows = state.rows.filter(x => x.date !== date && x.date !== v.date);
            state.rows.push(v);
          },
          'Día guardado: ' + dateLabel(v.date) + '.',
        )
      ) {
        clearTimeout(draftTimer);
        prefsSet('draft-row', '');
        closeModal();
      }
    } catch (e) {
      formError(e);
    }
  };
  $('useUsual').onclick = () => {
    const recent = state.rows
      .filter(x => x.status === 'Presente' && x.date !== el.date.value)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!recent) return formError('Todavía no hay otro día para copiar.');
    form.querySelector('[name=status][value=Presente]').checked = true;
    el.place.value = recent.place;
    el.start.value = recent.start;
    el.end.value = recent.end;
    el.overnight.checked = recent.overnight;
    const b = recent.breakMinutes || 0,
      bc = ![0, 30, 60].includes(b);
    form.querySelector('[name=brk][value="' + (bc ? 'custom' : b) + '"]').checked = true;
    el.breakCustom.value = bc ? b : '';
    sugPlaces();
    preview();
    saveDraft();
  };
  if ($('deleteRow'))
    $('deleteRow').onclick = async () => {
      try {
        guardDates([date]);
        if (
          await ask('Se recalculan horas y pagos. Podés deshacerlo.', {
            title: '¿Eliminar este día?',
            ok: 'Eliminar',
            danger: true,
          })
        )
          if (mutate(() => (state.rows = state.rows.filter(x => x.date !== date)), 'Día eliminado.')) {
            clearTimeout(draftTimer);
            prefsSet('draft-row', '');
            closeModal();
          }
      } catch (e) {
        formError(e);
      }
    };
  if ($('duplicateRow'))
    $('duplicateRow').onclick = () => {
      const src = rowFrom(new FormData(form)),
        nx = new Date(date + 'T12:00:00');
      nx.setDate(nx.getDate() + 1);
      const def = [
        nx.getFullYear(),
        String(nx.getMonth() + 1).padStart(2, '0'),
        String(nx.getDate()).padStart(2, '0'),
      ].join('-');
      modal(
        '<h2>Duplicar día</h2><p class="muted">' +
          esc(src.place || src.status) +
          (src.start ? ' · ' + esc(src.start) + ' a ' + esc(src.end) : '') +
          '</p><form id="dupForm">' +
          field('Copiar al día', 'target', 'date', def, 'required') +
          formEnd('Duplicar') +
          '</form>',
      );
      $('dupForm').onsubmit = e => {
        e.preventDefault();
        try {
          const target = new FormData(e.target).get('target'),
            v = { ...src, date: target };
          Core.validateRow(v);
          guardDates([target]);
          if (state.rows.some(x => x.date === target && (x.status || x.place || x.note)))
            throw Error('Ese día ya tiene datos.');
          if (
            mutate(
              () => {
                state.rows = state.rows.filter(x => x.date !== target);
                state.rows.push(v);
              },
              'Día copiado al ' + dateLabel(target) + '.',
            )
          )
            closeModal();
        } catch (e) {
          formError(e);
        }
      };
    };
}

function guardRules(start) {
  if (state.closed.some(k => Core.dates(k.slice(0, 7), k.slice(8)).some(d => d >= start)))
    throw Error('Este cambio afecta una quincena cerrada. Reabrila desde Pagos antes de modificar tarifas.');
}

function extraTxt(r) {
  return r.extraCalc === 'percent'
    ? '+' + r.extraPct + ' % (' + money(Core.round(Core.extraRate(r))) + '/h)'
    : r.extra
      ? money(r.extra) + '/h'
      : 'no se paga';
}

function ratesView() {
  const t = today(),
    cur = Core.ruleFor(state.rules, t),
    ranges = Core.ruleRanges(state.rules).reverse(),
    used = from =>
      state.rows.filter(r => (r.status === 'Presente' || r.paid) && Core.ruleFor(state.rules, r.date)?.from === from)
        .length;
  modal(
    '<h2>Tarifas por vigencia</h2><p class="muted">Cada tarifa rige desde su fecha hasta el día anterior a la siguiente. Los días ya registrados usan la tarifa de su fecha.</p>' +
      (cur
        ? '<div class="rate-hero"><small>Vigente hoy</small><strong>' +
          money(cur.rate) +
          ' <span>/ ' +
          UNIT[cur.mode] +
          '</span></strong><div class="rate-facts"><span>Hora normal<b>' +
          money(Core.round(Core.hourValue(cur))) +
          '</b></span><span>Hora extra<b>' +
          (cur.extraCalc === 'percent' || cur.extra ? money(Core.round(Core.extraRate(cur))) : '—') +
          '</b></span><span>Jornada<b>' +
          compactHours(cur.hours) +
          '</b></span></div></div><div class="actions"><button class="primary" id="raiseRule">' +
          icon('trend') +
          ' Registrar aumento</button><button id="newRule">' +
          icon('plus') +
          ' Nueva</button></div>'
        : '<div class="empty">' +
          icon('pay') +
          '<p>' +
          (state.rules.length ? 'No hay tarifa vigente hoy.' : 'Todavía no cargaste tu tarifa.') +
          '</p><small>Sin tarifa la app cuenta horas, pero no plata.</small></div><div class="actions"><button class="primary" id="newRule">' +
          icon('plus') +
          ' Cargar tarifa</button></div>') +
      (ranges.length
        ? '<h3>Historial</h3><ol class="timeline">' +
          ranges
            .map(({ rule: r, to, change }) => {
              const st =
                  r === cur
                    ? '<span class="pill">Vigente</span>'
                    : r.from > t
                      ? '<span class="pill future">Futura</span>'
                      : '<span class="pill unrecorded">Anterior</span>',
                n = used(r.from);
              return (
                '<li><button type="button" class="rate-card' +
                (r === cur ? ' current' : '') +
                '" data-rule="' +
                r.from +
                '"><span class="rate-top"><strong>' +
                money(r.rate) +
                ' <small>/ ' +
                UNIT[r.mode] +
                '</small></strong>' +
                st +
                '</span><small>' +
                dateLabel(r.from) +
                ' → ' +
                (to ? dateLabel(to) : 'sin fin') +
                '</small><small>Jornada ' +
                compactHours(r.hours) +
                ' · Extra ' +
                extraTxt(r) +
                ' · ' +
                n +
                (n === 1 ? ' día' : ' días') +
                ' registrados</small>' +
                (change != null && change !== 0
                  ? '<span class="delta ' +
                    (change > 0 ? 'up' : 'down') +
                    '">' +
                    pctTxt(change) +
                    ' vs. anterior</span>'
                  : '') +
                '</button></li>'
              );
            })
            .join('') +
          '</ol>'
        : '') +
      '<div class="info"><b>¿Te pagaron doble un día?</b> No cambies la tarifa: abrí ese día y elegí <b>Doble ×2</b> en “Pago del día”.</div>',
  );
  $('newRule').onclick = () => ruleForm();
  if ($('raiseRule')) $('raiseRule').onclick = () => raiseForm(cur);
}

function raiseForm(cur) {
  const next = new Date();
  next.setDate(next.getDate() <= 15 ? 16 : 1);
  if (next.getDate() === 1) next.setMonth(next.getMonth() + 1);
  const nd = [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, '0'),
    String(next.getDate()).padStart(2, '0'),
  ].join('-');
  modal(
    '<h2>Registrar aumento</h2><p class="muted">Crea una nueva vigencia a partir de la tarifa actual (' +
      money(cur.rate) +
      ' / ' +
      UNIT[cur.mode] +
      '). Los días anteriores no cambian.</p><form id="raiseForm"><fieldset class="segs"><legend>Tipo de aumento</legend><div class="seg-radio two-col">' +
      [
        ['pct', 'Porcentaje'],
        ['amount', 'Nuevo importe'],
      ]
        .map(
          ([v, t], i) =>
            '<label class="chip-radio"><input type="radio" name="kind" value="' +
            v +
            '" ' +
            (i ? '' : 'checked') +
            '><span>' +
            t +
            '</span></label>',
        )
        .join('') +
      '</div></fieldset><label id="pctWrap">Aumento (%)<input name="pct" type="number" inputmode="decimal" step="0.01" min="0.01" max="1000" placeholder="Ej.: 10"></label><label id="amtWrap">Nuevo importe (ARS)<input name="amount" type="number" inputmode="decimal" step="0.01" min="0.01" max="1000000000"></label>' +
      field('Desde', 'from', 'date', nd, 'required') +
      (cur.extraCalc !== 'percent' && cur.extra
        ? '<label class="check"><input type="checkbox" name="extraToo" checked>Aumentar también la hora extra en la misma proporción</label>'
        : '') +
      '<div class="preview" id="raisePreview"></div>' +
      formEnd('Crear vigencia') +
      '</form>',
  );
  const f = $('raiseForm');
  function val() {
    const d = new FormData(f),
      k = d.get('kind'),
      rate = k === 'pct' ? Core.round(cur.rate * (1 + Number(d.get('pct')) / 100)) : Number(d.get('amount')),
      ratio = rate / cur.rate;
    return {
      ...cur,
      calculationVersion: 2,
      from: d.get('from'),
      rate,
      extra: d.has('extraToo') ? Core.round(cur.extra * ratio) : cur.extra,
    };
  }
  function pv() {
    const k = new FormData(f).get('kind');
    $('pctWrap').hidden = k !== 'pct';
    $('amtWrap').hidden = k === 'pct';
    try {
      const v = val();
      Core.validateRule(v);
      if (!(v.rate > 0)) throw Error('Completá el aumento.');
      $('raisePreview').innerHTML =
        '<small>Desde ' +
        dateLabel(v.from) +
        '</small>' +
        money(cur.rate) +
        ' → <strong>' +
        money(v.rate) +
        '</strong><small>' +
        pctTxt(Core.round((v.rate / cur.rate - 1) * 100)) +
        (v.extra !== cur.extra ? ' · extra ' + money(v.extra) + '/h' : '') +
        '</small>';
    } catch (e) {
      $('raisePreview').textContent = e.message;
    }
  }
  f.oninput = pv;
  f.onchange = pv;
  pv();
  f.onsubmit = e => {
    e.preventDefault();
    try {
      const v = val();
      if (!(v.rate > 0)) throw Error('Completá el aumento.');
      Core.validateRule(v);
      if (state.rules.some(x => x.from === v.from))
        throw Error('Ya hay una tarifa que empieza ese día. Editala desde el historial.');
      guardRules(v.from);
      if (mutate(() => (state.rules = state.rules.concat(v)), 'Aumento registrado desde ' + dateLabel(v.from) + '.'))
        ratesView();
    } catch (e) {
      formError(e);
    }
  };
}

function ruleForm(from) {
  const r = state.rules.find(x => x.from === from) || {
      from: today(),
      mode: 'day',
      rate: '',
      extra: 0,
      extraCalc: 'amount',
      extraPct: 50,
      hours: 8,
      dayPolicy: 'full',
      monthPolicy: 'calendar',
      extraMode: 'duration',
      scheduleStart: '08:00',
      scheduleEnd: '16:00',
    },
    xc = r.extraCalc || 'amount',
    radios = (n, opts, v) =>
      '<div class="seg-radio' +
      (opts.length === 2 ? ' two-col' : '') +
      '">' +
      opts
        .map(
          ([k, t]) =>
            '<label class="chip-radio"><input type="radio" name="' +
            n +
            '" value="' +
            k +
            '" ' +
            (v === k ? 'checked' : '') +
            '><span>' +
            t +
            '</span></label>',
        )
        .join('') +
      '</div>';
  modal(
    '<h2>' +
      (from ? 'Editar tarifa' : 'Nueva tarifa') +
      '</h2><form id="ruleForm"><fieldset class="segs"><legend>¿Cómo te pagan?</legend>' +
      radios(
        'mode',
        [
          ['day', 'Por día'],
          ['hour', 'Por hora'],
          ['month', 'Mensual'],
        ],
        r.mode,
      ) +
      '</fieldset>' +
      field(
        'Importe base (ARS)',
        'rate',
        'number',
        r.rate,
        'min="0" max="1000000000" step="0.01" required placeholder="Ej.: 50000"',
      ) +
      field('Vigente desde', 'from', 'date', r.from, 'required') +
      '<fieldset class="segs"><legend>Hora extra</legend>' +
      radios(
        'extraCalc',
        [
          ['amount', 'Monto fijo'],
          ['percent', 'Recargo %'],
        ],
        xc,
      ) +
      '</fieldset><div class="two">' +
      field('Jornada normal (h)', 'hours', 'number', r.hours, 'min="0.01" max="24" step="0.01" required') +
      '<label id="extraWrap">Hora extra (ARS)<input name="extra" type="number" inputmode="decimal" min="0" max="1000000000" step="0.01" value="' +
      esc(r.extra) +
      '"></label><label id="pctWrap">Recargo (%)<input name="extraPct" type="number" inputmode="decimal" min="0" max="1000" step="0.01" value="' +
      esc(r.extraPct ?? 50) +
      '"></label>' +
      '</div><details class="adv"><summary>Opciones avanzadas</summary>' +
      select(
        'Pago diario',
        'dayPolicy',
        [
          ['full', 'Jornada completa siempre'],
          ['half', 'Media jornada si trabajás la mitad o menos'],
          ['proportional', 'Proporcional a las horas normales'],
        ],
        r.dayPolicy || 'full',
      ) +
      select(
        'Reparto mensual',
        'monthPolicy',
        [
          ['calendar', 'Por días calendario'],
          ['halves', 'Mitad en cada quincena'],
        ],
        r.monthPolicy || 'calendar',
      ) +
      select(
        'Cuándo hay horas extra',
        'extraMode',
        [
          ['duration', 'Lo que pase la jornada normal'],
          ['schedule', 'Lo trabajado fuera de un horario fijo'],
        ],
        r.extraMode || 'duration',
      ) +
      '<div class="two" id="scheduleFields">' +
      field('Inicio habitual', 'scheduleStart', 'time', r.scheduleStart || '08:00') +
      field('Fin habitual', 'scheduleEnd', 'time', r.scheduleEnd || '16:00') +
      '</div></details><small id="ruleHelp"></small><div id="rulePreview" class="preview"></div>' +
      formEnd('Guardar tarifa') +
      (from
        ? '<button type="button" class="danger" id="deleteRule">' + icon('trash') + ' Eliminar tarifa</button>'
        : '') +
      '</form>',
  );
  const f = $('ruleForm');
  function value() {
    const d = new FormData(f);
    return {
      calculationVersion: 2,
      from: d.get('from'),
      mode: d.get('mode'),
      rate: Number(d.get('rate')),
      hours: Number(d.get('hours')),
      extra: Number(d.get('extra') || 0),
      extraCalc: d.get('extraCalc'),
      extraPct: Number(d.get('extraPct') || 0),
      dayPolicy: d.get('dayPolicy'),
      monthPolicy: d.get('monthPolicy'),
      extraMode: d.get('extraMode'),
      scheduleStart: d.get('scheduleStart'),
      scheduleEnd: d.get('scheduleEnd'),
    };
  }
  function preview() {
    const v = value();
    f.elements.rate.closest('label').firstChild.textContent =
      { day: 'Importe por día', hour: 'Importe por hora', month: 'Sueldo mensual' }[v.mode] + ' (ARS)';
    $('extraWrap').hidden = v.extraCalc !== 'amount';
    $('pctWrap').hidden = v.extraCalc !== 'percent';
    f.elements.dayPolicy.closest('label').hidden = v.mode !== 'day';
    f.elements.monthPolicy.closest('label').hidden = v.mode !== 'month';
    $('scheduleFields').hidden = v.extraMode !== 'schedule';
    $('ruleHelp').textContent =
      v.mode === 'month'
        ? 'Valor hora = sueldo ÷ (' +
          Core.MONTH_DAYS +
          ' × jornada). Las ausencias no se descuentan solas: usá un ajuste.'
        : v.mode === 'day'
          ? 'Valor hora = importe del día ÷ jornada normal.'
          : 'Las horas normales se pagan al valor hora; las extra, con su propio valor.';
    try {
      Core.validateRule(v);
      const day = end =>
          Core.calc(
            {
              date: v.from,
              status: 'Presente',
              start: '08:00',
              end,
              breakMinutes: 0,
              overnight: false,
              place: '',
              note: '',
            },
            [v],
          ).total,
        endFor = h => {
          const m = 480 + Math.round(h * 60);
          return m >= 1440 ? null : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
        },
        e1 = endFor(v.hours),
        e2 = endFor(v.hours + 2);
      const candidate = { ...state, rules: state.rules.filter(x => x.from !== from).concat(v) },
        sNew = Core.summarize(candidate, month(), part()).total,
        sOld = summary().total;
      $('rulePreview').innerHTML =
        '<small>Valor hora ' +
        money(Core.round(Core.hourValue(v))) +
        ' · hora extra ' +
        money(Core.round(Core.extraRate(v))) +
        '</small>' +
        (v.mode !== 'month' && e1
          ? '<div class="line"><span>Día de ' + compactHours(v.hours) + '</span><b>' + money(day(e1)) + '</b></div>'
          : '') +
        (v.mode !== 'month' && e2
          ? '<div class="line"><span>Día de ' +
            compactHours(v.hours + 2) +
            ' (2 h extra)</span><b>' +
            money(day(e2)) +
            '</b></div>'
          : '') +
        '<div class="line"><span>Período visible</span><b>' +
        (sNew !== sOld ? money(sOld) + ' → ' : '') +
        money(sNew) +
        '</b></div>';
    } catch (e) {
      $('rulePreview').textContent = e.message;
    }
  }
  f.oninput = preview;
  f.onchange = preview;
  preview();
  f.onsubmit = async e => {
    e.preventDefault();
    try {
      const v = value();
      Core.validateRule(v);
      if (state.rules.some(x => x.from === v.from && x.from !== from))
        throw Error('Ya existe una tarifa con esa fecha.');
      guardRules([from, v.from].filter(Boolean).sort()[0]);
      if (
        from &&
        !(await ask(
          'Editar una tarifa recalcula todos los días desde ' +
            dateLabel([from, v.from].sort()[0]) +
            '. Si es un aumento, mejor usá “Registrar aumento”. ¿Guardar igual?',
          { title: '¿Editar esta tarifa?', ok: 'Guardar igual', cancel: 'Volver' },
        ))
      )
        return;
      if (mutate(() => (state.rules = state.rules.filter(x => x.from !== from).concat(v)), 'Tarifa guardada.'))
        ratesView();
    } catch (e) {
      formError(e);
    }
  };
  if ($('deleteRule'))
    $('deleteRule').onclick = async () => {
      try {
        guardRules(from);
        if (
          await ask('Los días que la usaban pasan a la tarifa anterior.', {
            title: '¿Eliminar esta tarifa?',
            ok: 'Eliminar',
            danger: true,
          })
        )
          if (mutate(() => (state.rules = state.rules.filter(x => x.from !== from)), 'Tarifa eliminada.')) ratesView();
      } catch (e) {
        formError(e);
      }
    };
}

function qLabel(k) {
  return (
    k.slice(8) +
    'ª ' +
    new Date(k.slice(0, 7) + '-02T12:00:00')
      .toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
      .replace('.', '')
  );
}

function qLong(k) {
  return (
    k.slice(8) +
    'ª quincena de ' +
    new Date(k.slice(0, 7) + '-02T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  );
}

function payKeys(extra) {
  const set = new Set();
  let k = Core.periodKey(today());
  for (let i = 0; i < 4; i++) {
    set.add(k);
    k = Core.prevPeriod(k);
  }
  const ks = new Set([...state.rows.filter(r => r.status).map(r => Core.periodKey(r.date))]);
  for (const x of ks) if (Core.summarize(state, x.slice(0, 7), x.slice(8)).balance > 0.004) set.add(x);
  if (extra) set.add(extra);
  return [...set].sort().reverse().slice(0, 8);
}

function paymentForm(id, amount, key) {
  const p = state.payments.find(x => x.id === id),
    k0 = p ? Core.periodKey(Core.allocatedDate(p)) : key || (part() === 'all' ? Core.periodKey(today()) : currentKey()),
    keys = payKeys(k0),
    bal = k => {
      const s = Core.summarize(state, k.slice(0, 7), k.slice(8));
      return Core.round(s.balance + (p && Core.periodKey(Core.allocatedDate(p)) === k ? p.amount : 0));
    },
    t0 = today(),
    yd = new Date();
  yd.setDate(yd.getDate() - 1);
  const ayer = [
    yd.getFullYear(),
    String(yd.getMonth() + 1).padStart(2, '0'),
    String(yd.getDate()).padStart(2, '0'),
  ].join('-');
  modal(
    '<h2>' +
      (id ? 'Editar cobro' : 'Registrar cobro') +
      '</h2><form id="paymentForm" autocomplete="off">' +
      '<div class="step"><div class="step-h"><b>1</b>¿Qué quincena te pagaron?</div><div class="q-grid">' +
      keys
        .map(k => {
          const b = bal(k);
          return (
            '<label class="q-opt"><input type="radio" name="qk" value="' +
            k +
            '" ' +
            (k === k0 ? 'checked' : '') +
            '><span><b>' +
            qLabel(k) +
            '</b><small>' +
            (b > 0.004 ? 'Te deben ' + money(b) : b < -0.004 ? 'A favor ' + money(-b) : 'Al día') +
            '</small></span></label>'
          );
        })
        .join('') +
      '</div></div>' +
      '<div class="step"><div class="step-h"><b>2</b>¿Cuánto cobraste?</div><input name="amount" type="number" inputmode="decimal" min="0.01" max="1000000000" step="0.01" value="' +
      esc(p ? p.amount : amount ? Core.round(amount) : '') +
      '" placeholder="$ 0,00" required aria-label="Importe"><div class="wrap"><button type="button" class="mini" id="payAllBtn"></button></div></div>' +
      '<div class="step"><div class="step-h"><b>3</b>¿Cuándo te lo dieron?</div><div class="date-row"><input name="date" type="date" value="' +
      esc(p ? p.date : t0) +
      '" required aria-label="Fecha del cobro"><button type="button" class="mini" data-pday="' +
      t0 +
      '">Hoy</button><button type="button" class="mini" data-pday="' +
      ayer +
      '">Ayer</button></div><small>El día real en que recibiste la plata (puede ser después de la quincena).</small></div>' +
      '<div class="step"><div class="step-h"><b>4</b>¿Cómo? <small>(opcional)</small></div><div class="wrap">' +
      ['Efectivo', 'Transferencia', 'Mercado Pago', 'Adelanto']
        .map(t => '<button type="button" class="mini" data-how="' + t + '">' + t + '</button>')
        .join('') +
      '</div><input name="note" type="text" maxlength="2000" value="' +
      esc(p ? p.note : '') +
      '" placeholder="Detalle" aria-label="Detalle"></div>' +
      '<div class="preview" id="paymentPreview"></div>' +
      formEnd(id ? 'Guardar cambios' : 'Guardar cobro') +
      (id
        ? '<button type="button" id="deletePayment" class="danger">' + icon('trash') + ' Eliminar cobro</button>'
        : '') +
      '</form>',
  );
  const f = $('paymentForm'),
    el = f.elements,
    qk = () => new FormData(f).get('qk');
  function pv() {
    const k = qk(),
      b = bal(k),
      a = Number(el.amount.value || 0),
      rest = Core.round(b - a);
    $('payAllBtn').textContent = b > 0.004 ? 'Todo lo que te deben: ' + money(b) : 'Esta quincena está al día';
    $('payAllBtn').disabled = !(b > 0.004);
    $('paymentPreview').innerHTML =
      '<span>' +
      esc(qLong(k)) +
      '</span>' +
      (a > 0
        ? '<strong>' +
          (rest > 0.004
            ? 'Queda debiendo ' + money(rest)
            : rest < -0.004
              ? 'Quedás ' + money(-rest) + ' a favor'
              : 'Queda saldada ✓') +
          '</strong>'
        : '<span>Te deben ' + money(Math.max(0, b)) + '</span>');
  }
  $('payAllBtn').onclick = () => {
    el.amount.value = bal(qk());
    pv();
  };
  f.querySelectorAll('[data-pday]').forEach(
    b =>
      (b.onclick = () => {
        el.date.value = b.dataset.pday;
      }),
  );
  f.querySelectorAll('[data-how]').forEach(
    b =>
      (b.onclick = () => {
        el.note.value = b.dataset.how;
      }),
  );
  f.oninput = pv;
  f.onchange = pv;
  pv();
  f.onsubmit = e => {
    e.preventDefault();
    try {
      const k = qk(),
        v = {
          id: id || uid(),
          date: el.date.value,
          allocatedDate: k.slice(0, 7) + (k.endsWith(':2') ? '-16' : '-01'),
          amount: Number(el.amount.value),
          note: el.note.value.trim(),
        };
      if (!Core.validDate(v.date)) throw Error('Elegí el día en que cobraste.');
      if (!(v.amount > 0)) throw Error('Poné cuánto cobraste.');
      if (
        mutate(
          () => (state.payments = state.payments.filter(x => x.id !== id).concat(v)),
          'Cobro guardado en la ' + qLong(k) + '.',
        )
      )
        closeModal();
    } catch (e) {
      formError(e);
    }
  };
  if ($('deletePayment'))
    $('deletePayment').onclick = async () => {
      if (
        await ask('Ese importe vuelve a quedar pendiente.', {
          title: '¿Eliminar el cobro?',
          ok: 'Eliminar',
          danger: true,
        })
      )
        if (mutate(() => (state.payments = state.payments.filter(x => x.id !== id)), 'Cobro eliminado.')) closeModal();
    };
}

function adjustmentForm(id) {
  const a = state.adjustments.find(x => x.id === id) || {
    date: month() + (part() === '2' ? '-16' : '-01'),
    amount: '',
    note: '',
  };
  modal(
    '<h2>Ajuste o adicional</h2><form id="adjustForm">' +
      field('Fecha del período', 'date', 'date', a.date, 'required') +
      field(
        'Importe (negativo para descuento)',
        'amount',
        'number',
        a.amount,
        'min="-1000000000" max="1000000000" step="0.01" required',
      ) +
      field('Motivo obligatorio', 'note', 'text', a.note, 'required maxlength="2000"') +
      formEnd('Guardar ajuste') +
      (id ? '<button type="button" id="deleteAdjustment" class="danger">Eliminar ajuste</button>' : '') +
      '</form>',
  );
  $('adjustForm').onsubmit = e => {
    e.preventDefault();
    try {
      const f = new FormData(e.target),
        v = { id: id || uid(), date: f.get('date'), amount: Number(f.get('amount')), note: f.get('note').trim() };
      guardDates([a.date, v.date]);
      if (mutate(() => (state.adjustments = state.adjustments.filter(x => x.id !== id).concat(v)))) closeModal();
    } catch (e) {
      formError(e);
    }
  };
  if ($('deleteAdjustment'))
    $('deleteAdjustment').onclick = async () => {
      try {
        guardDates([a.date]);
        if (
          await ask('Se recalcula lo generado de la quincena.', {
            title: '¿Eliminar este ajuste?',
            ok: 'Eliminar',
            danger: true,
          })
        )
          if (mutate(() => (state.adjustments = state.adjustments.filter(x => x.id !== id)))) closeModal();
      } catch (e) {
        formError(e);
      }
    };
}

function batchForm() {
  const t = state.templates[0] || { place: '', start: '08:00', end: '16:00', breakMinutes: 0, overnight: false };
  modal(
    '<h2>Plantilla de jornada</h2><p class="muted">Elegí solo los días que efectivamente trabajaste. No se reemplazan jornadas ya registradas.</p><form id="batchForm">' +
      field('Lugar / actividad', 'place', 'text', t.place, 'maxlength="200" required') +
      '<div class="two">' +
      field('Entrada', 'start', 'time', t.start, 'required') +
      field('Salida', 'end', 'time', t.end, 'required') +
      '</div>' +
      field(
        'Descanso no pago (minutos)',
        'breakMinutes',
        'number',
        t.breakMinutes,
        'min="0" max="1439" step="1" required',
      ) +
      '<label class="check"><input type="checkbox" name="overnight" ' +
      (t.overnight ? 'checked' : '') +
      '>Salida al día siguiente</label><h3>' +
      esc(periodLabel()) +
      '</h3><div class="batchdays">' +
      selectedRows()
        .map(
          r =>
            '<label class="check"><input type="checkbox" name="days" value="' +
            r.date +
            '" ' +
            (r.status || r.place || r.note ? 'disabled' : '') +
            '>' +
            r.date.slice(8) +
            ' ' +
            dayName(r.date) +
            '</label>',
        )
        .join('') +
      '</div><div class="preview" id="batchPreview">Seleccioná las fechas.</div>' +
      formEnd('Revisar y cargar días') +
      '<button type="button" id="saveTemplate">Guardar solo plantilla</button></form>',
  );
  const form = $('batchForm');
  function val() {
    const f = new FormData(form);
    return {
      place: f.get('place').trim(),
      start: f.get('start'),
      end: f.get('end'),
      breakMinutes: Number(f.get('breakMinutes')),
      overnight: f.has('overnight'),
    };
  }
  function rows() {
    return new FormData(form).getAll('days').map(date => ({ ...blank(date), ...val(), status: 'Presente' }));
  }
  form.oninput = () => {
    try {
      const rs = rows();
      rs.forEach(Core.validateRow);
      $('batchPreview').textContent =
        rs.length +
        ' jornadas · ' +
        hrs(rs.reduce((n, r) => n + Core.calc(r, state.rules).hours, 0)) +
        ' · ' +
        money(rs.reduce((n, r) => n + Core.calc(r, state.rules).total, 0)) +
        ' de base diaria/horaria y extras.';
    } catch (e) {
      $('batchPreview').textContent = e.message;
    }
  };
  form.onsubmit = async e => {
    e.preventDefault();
    try {
      const rs = rows();
      if (!rs.length) throw Error('Elegí al menos un día.');
      rs.forEach(Core.validateRow);
      guardDates(rs.map(r => r.date));
      if (
        !(await ask(
          '¿Cargar ' +
            rs.length +
            ' jornadas?\n' +
            rs.map(r => dateLabel(r.date) + ' ' + r.start + '–' + r.end).join('\n'),
          { ok: 'Cargar días' },
        ))
      )
        return;
      if (
        mutate(() => {
          const ds = new Set(rs.map(r => r.date));
          state.rows = state.rows.filter(r => !ds.has(r.date)).concat(rs);
          state.templates = [val()];
        })
      )
        closeModal();
    } catch (e) {
      formError(e);
    }
  };
  $('saveTemplate').onclick = () => {
    try {
      Core.validateRow({ ...blank(today()), ...val(), status: 'Presente' });
      if (mutate(() => (state.templates = [val()]), 'Plantilla guardada.')) closeModal();
    } catch (e) {
      formError(e);
    }
  };
}

const WD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  WDL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function nextReminder(time, days) {
  if (!days.length || !/^\d\d:\d\d$/.test(time)) return '';
  const now = new Date(),
    [h, m] = time.split(':').map(Number);
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(h, m, 0, 0);
    if (d > now && days.includes(d.getDay()))
      return (i === 0 ? 'hoy' : i === 1 ? 'mañana' : 'el ' + WDL[d.getDay()]) + ' a las ' + time;
  }
  return '';
}

function remindersForm() {
  const st = state.settings,
    days = st.reminderDays || [];
  modal(
    '<h2>Recordatorios</h2><p class="muted">Un aviso para que no te olvides de cargar tu jornada. Android puede demorarlo unos minutos para ahorrar batería.</p><form id="reminderForm"><label class="check switch"><span><b>Recordarme cargar el día</b><small id="remNext"></small></span><input type="checkbox" role="switch" name="enabled" ' +
      (st.reminder ? 'checked' : '') +
      '></label><div id="remBody">' +
      field('Hora del aviso', 'time', 'time', st.reminderTime || '18:00', 'required') +
      '<div class="wrap">' +
      ['13:00', '17:00', '18:00', '20:00', '22:00']
        .map(t => '<button type="button" class="mini" data-time="' + t + '">' + t + '</button>')
        .join('') +
      '</div><fieldset class="segs"><legend>Días</legend><div class="wrap days">' +
      [1, 2, 3, 4, 5, 6, 0]
        .map(
          i =>
            '<label class="chip-radio"><input type="checkbox" name="days" value="' +
            i +
            '" ' +
            (days.includes(i) ? 'checked' : '') +
            '><span>' +
            WD[i] +
            '</span></label>',
        )
        .join('') +
      '</div><div class="wrap">' +
      [
        ['work', 'Lun a vie', [1, 2, 3, 4, 5]],
        ['six', 'Lun a sáb', [1, 2, 3, 4, 5, 6]],
        ['all', 'Todos', [0, 1, 2, 3, 4, 5, 6]],
        ['we', 'Fin de semana', [0, 6]],
      ]
        .map(([k, t, d]) => '<button type="button" class="mini" data-days="' + d.join(',') + '">' + t + '</button>')
        .join('') +
      '</div></fieldset><div class="info">Consejo: poné la hora en que normalmente terminás de trabajar. Si ya cargaste el día, ignorá el aviso.</div></div>' +
      formEnd('Guardar') +
      '</form>',
  );
  const f = $('reminderForm');
  function pv() {
    const d = new FormData(f),
      on = d.has('enabled'),
      ds = d.getAll('days').map(Number),
      n = nextReminder(d.get('time'), ds);
    $('remBody').classList.toggle('dim', !on);
    $('remNext').textContent = !on ? 'Desactivado' : !ds.length ? 'Elegí al menos un día' : 'Próximo aviso: ' + n;
  }
  f.querySelectorAll('[data-time]').forEach(
    b =>
      (b.onclick = () => {
        f.elements.time.value = b.dataset.time;
        pv();
      }),
  );
  f.querySelectorAll('[data-days]').forEach(
    b =>
      (b.onclick = () => {
        const d = b.dataset.days.split(',');
        f.querySelectorAll('[name=days]').forEach(i => (i.checked = d.includes(i.value)));
        pv();
      }),
  );
  f.oninput = pv;
  f.onchange = pv;
  pv();
  f.onsubmit = e => {
    e.preventDefault();
    try {
      const d = new FormData(f),
        enabled = d.has('enabled'),
        days = d.getAll('days').map(Number).sort();
      if (enabled && !days.length) throw Error('Elegí al menos un día.');
      if (enabled && !window.Android) throw Error('Las notificaciones funcionan en la app de Android.');
      if (
        mutate(
          () => {
            state.settings.reminder = enabled;
            state.settings.reminderTime = d.get('time');
            state.settings.reminderDays = days;
          },
          enabled ? 'Recordatorio activado: ' + nextReminder(d.get('time'), days) + '.' : 'Recordatorio desactivado.',
        )
      ) {
        if (window.Android) Android.configureReminder(JSON.stringify(state.settings));
        closeModal();
      }
    } catch (e) {
      formError(e);
    }
  };
}

async function featureToggle(b) {
  const k = b.dataset.feature,
    on = b.checked;
  if (k === 'checks' || k === 'placeStats')
    return mutate(() => (state.settings[k] = on), on ? 'Activado.' : 'Desactivado.');
  if (k === 'specialPay') {
    if (
      on &&
      !(await ask(
        'Cuando cargues un domingo, sábado o feriado, la app te va a PREGUNTAR si lo pagan distinto. Nunca lo aplica sola. ¿Activar?',
        { title: 'Pago especial', ok: 'Activar' },
      ))
    ) {
      b.checked = false;
      return;
    }
    return mutate(
      () => (state.settings.specialPay.enabled = on),
      on ? 'Pago especial: te vamos a preguntar.' : 'Pago especial desactivado.',
    );
  }
  if (k === 'payday') {
    if (
      on &&
      !(await ask(
        'Vas a ver un aviso en Quincena cuando llegue el día de cobro' +
          (window.Android ? ' y una notificación del teléfono' : '') +
          '. ¿Activar?',
        { title: 'Aviso de día de cobro', ok: 'Activar' },
      ))
    ) {
      b.checked = false;
      return;
    }
    if (
      mutate(
        () => (state.settings.payday.enabled = on),
        on ? 'Aviso de cobro activado.' : 'Aviso de cobro desactivado.',
      )
    )
      syncNative();
  }
  if (k === 'secure') {
    prefsSet('secure', on ? '1' : '');
    syncNative();
    toast(on ? 'La app se oculta en recientes y no permite capturas.' : 'Ocultar en recientes desactivado.');
  }
  if (k === 'lock') {
    if (on) pinSetup(b);
    else {
      b.checked = true;
      pinVerify('Quitar bloqueo', () => {
        prefsSet('pin', '');
        prefsSet('bio', '');
        prefsSet('pin-fails', '0');
        prefsSet('pin-until', '0');
        toast('Bloqueo desactivado.');
        render();
      });
    }
  }
  if (k === 'bio') {
    if (on) {
      b.checked = false;
      if (!bioReady()) return toast('Este teléfono no tiene huella configurada.');
      bioEnroll = ok => {
        if (ok) {
          prefsSet('bio', '1');
          toast('Desbloqueo con huella activado.');
        } else toast('No se activó la huella.');
        render();
      };
      Android.bioAuth();
    } else {
      prefsSet('bio', '');
      toast('Huella desactivada. Se va a pedir el PIN.');
    }
  }
}

function functionsSection() {
  const st = state.settings,
    sw = (k, t, d, on, more) =>
      '<div class="feat"><label class="check switch"><span><b>' +
      t +
      '</b><small>' +
      d +
      '</small></span><input type="checkbox" role="switch" data-feature="' +
      k +
      '" ' +
      (on ? 'checked' : '') +
      '></label>' +
      (more
        ? '<button type="button" class="link" data-action="' +
          more +
          '">' +
          (more === 'stats' ? 'Ver por obra' : 'Configurar') +
          ' ' +
          icon('arrow') +
          '</button>'
        : '') +
      '</div>',
    sp = st.specialPay,
    pd = st.payday;
  return (
    '<section class="panel group"><h2>Funciones</h2><p class="muted">Cada una se prende y se apaga por separado.</p>' +
    sw(
      'specialPay',
      'Pago especial en domingos y feriados',
      sp.enabled
        ? 'Te pregunta al cargar · domingo ' +
            (sp.sunday > 1 ? multLabel(sp.sunday) : 'normal') +
            ' · feriado ' +
            (sp.holiday > 1 ? multLabel(sp.holiday) : 'normal')
        : 'Apagado',
      sp.enabled,
      'specialCfg',
    ) +
    sw('checks', 'Avisos de errores de carga', 'Jornadas muy largas, sin lugar, días sin registrar', st.checks) +
    sw(
      'payday',
      'Aviso de día de cobro',
      pd.enabled
        ? '1ª: día ' +
            pd.first +
            (pd.firstMonth === 'next' ? ' del mes siguiente' : '') +
            ' · 2ª: día ' +
            pd.second +
            (pd.secondMonth === 'next' ? ' del mes siguiente' : '')
        : 'Apagado',
      pd.enabled,
      'paydayCfg',
    ) +
    sw('placeStats', 'Resumen por obra en Quincena', 'Días, horas y extras en cada obra', st.placeStats, 'stats') +
    sw(
      'secure',
      'Ocultar en apps recientes',
      'Tapa la app en recientes y bloquea capturas de pantalla',
      prefsGet('secure') === '1',
    ) +
    sw(
      'lock',
      'Bloqueo con PIN',
      'Pide el PIN al abrir y al volver después de 1 minuto. 5 errores = esperar',
      !!prefsGet('pin'),
    ) +
    (prefsGet('pin') && bioReady()
      ? sw('bio', 'Desbloquear con huella', 'Si la huella falla, podés usar el PIN', prefsGet('bio') === '1')
      : '') +
    '</section>'
  );
}

function specialForm() {
  const sp = clone(state.settings.specialPay),
    hol = clone(state.settings.holidays),
    opts = [
      [1, 'Normal'],
      [1.5, '×1,5'],
      [2, '×2'],
      [3, '×3'],
    ],
    row = (k, t) =>
      '<div class="sub-label">' +
      t +
      '</div><div class="seg-radio four">' +
      opts
        .map(
          ([v, l]) =>
            '<label class="chip-radio"><input type="radio" name="' +
            k +
            '" value="' +
            v +
            '" ' +
            (sp[k] === v ? 'checked' : '') +
            '><span>' +
            l +
            '</span></label>',
        )
        .join('') +
      '</div>',
    yrs = [...new Set(hol.map(h => h.date.slice(0, 4)))].sort();
  modal(
    '<h2>Pago especial</h2><p class="muted">Cuando cargues uno de estos días, la app te muestra “¿Te lo pagan ×2?”. Vos confirmás; nunca se aplica solo.</p><form id="spForm">' +
      row('sunday', 'Domingos') +
      row('saturday', 'Sábados') +
      row('holiday', 'Feriados') +
      '<h3>Feriados cargados</h3><p class="muted">Precargados los nacionales de Argentina ' +
      yrs.join(' y ') +
      '. Revisalos: el gobierno puede mover fechas. Podés sumar los de tu provincia o convenio.</p><div id="holList" class="hol-list"></div><div class="two">' +
      field('Fecha', 'hdate', 'date', '', '') +
      field('Nombre', 'hname', 'text', '', 'maxlength="80" placeholder="Ej.: Día del Constructor"') +
      '</div><button type="button" id="holAdd">' +
      icon('plus') +
      ' Agregar feriado</button>' +
      formEnd('Guardar') +
      '</form>',
  );
  const draw = () => {
    $('holList').innerHTML =
      hol
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(
          (h, i) =>
            '<div class="line"><span>' +
            dateLabel(h.date) +
            ' · ' +
            esc(h.name) +
            '</span><button type="button" class="link danger" data-hdel="' +
            i +
            '" aria-label="Quitar">' +
            icon('close') +
            '</button></div>',
        )
        .join('') || '<p class="empty">Sin feriados.</p>';
    $('holList')
      .querySelectorAll('[data-hdel]')
      .forEach(
        b =>
          (b.onclick = () => {
            hol.splice(+b.dataset.hdel, 1);
            draw();
          }),
      );
  };
  draw();
  $('holAdd').onclick = () => {
    const f = $('spForm').elements,
      d = f.hdate.value,
      n = f.hname.value.trim() || 'Feriado';
    if (!Core.validDate(d)) return formError('Elegí la fecha del feriado.');
    if (hol.some(h => h.date === d)) return formError('Ese día ya está.');
    hol.push({ date: d, name: n });
    f.hdate.value = '';
    f.hname.value = '';
    formError('');
    draw();
  };
  $('spForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (
      mutate(() => {
        state.settings.specialPay = {
          ...state.settings.specialPay,
          sunday: Number(f.get('sunday')),
          saturday: Number(f.get('saturday')),
          holiday: Number(f.get('holiday')),
        };
        state.settings.holidays = hol;
      }, 'Pago especial guardado.')
    )
      closeModal();
  };
}

function paydayForm() {
  const pd = clone(state.settings.payday),
    mo = (k, v) =>
      '<select name="' +
      k +
      '" aria-label="Mes"><option value="same" ' +
      (v === 'same' ? 'selected' : '') +
      '>del mismo mes</option><option value="next" ' +
      (v === 'next' ? 'selected' : '') +
      '>del mes siguiente</option></select>',
    day = (k, v) =>
      '<input name="' +
      k +
      '" type="number" inputmode="numeric" min="1" max="31" step="1" value="' +
      v +
      '" aria-label="Día">';
  modal(
    '<h2>Día de cobro</h2><p class="muted">¿Qué día te pagan cada quincena? Ese día vas a ver el aviso con lo que te deben.</p><form id="pdForm"><div class="step"><div class="step-h"><b>1ª</b>Quincena del 1 al 15</div><div class="pd-row">Te la pagan el día ' +
      day('first', pd.first) +
      mo('firstMonth', pd.firstMonth) +
      '</div></div><div class="step"><div class="step-h"><b>2ª</b>Quincena del 16 a fin de mes</div><div class="pd-row">Te la pagan el día ' +
      day('second', pd.second) +
      mo('secondMonth', pd.secondMonth) +
      '</div></div><label class="check switch"><span><b>Notificación del teléfono</b><small>' +
      (window.Android ? 'Un aviso ese día (sin mostrar importes)' : 'Disponible en la app de Android') +
      '</small></span><input type="checkbox" role="switch" name="notify" ' +
      (pd.notify ? 'checked' : '') +
      '></label><label>A partir de las<select name="hour">' +
      Array.from(
        { length: 24 },
        (_, h) =>
          '<option value="' +
          h +
          '" ' +
          (h === pd.hour ? 'selected' : '') +
          '>' +
          String(h).padStart(2, '0') +
          ':00</option>',
      ).join('') +
      '</select></label><div class="preview" id="pdPv"></div>' +
      formEnd('Guardar') +
      '</form>',
  );
  const f = $('pdForm'),
    val = () => {
      const d = new FormData(f);
      return {
        ...state.settings.payday,
        first: Number(d.get('first')),
        second: Number(d.get('second')),
        firstMonth: d.get('firstMonth'),
        secondMonth: d.get('secondMonth'),
        notify: d.has('notify'),
        hour: Number(d.get('hour')),
      };
    },
    pv = () => {
      const v = val();
      $('pdPv').innerHTML =
        '<span>Próximos cobros</span>' +
        Core.paydays(v, today(), 4)
          .map(x => '<div class="line"><span>' + esc(qLong(x.key)) + '</span><b>' + dateLabel(x.date) + '</b></div>')
          .join('');
    };
  f.oninput = pv;
  f.onchange = pv;
  pv();
  f.onsubmit = e => {
    e.preventDefault();
    const v = val();
    if ([v.first, v.second].some(n => !Number.isInteger(n) || n < 1 || n > 31))
      return formError('El día tiene que ser entre 1 y 31.');
    if (mutate(() => (state.settings.payday = v), 'Día de cobro guardado.')) {
      syncNative();
      closeModal();
    }
  };
}

function profileForm() {
  const st = state.settings,
    worked = state.rows.filter(r => r.status === 'Presente').sort((a, b) => a.date.localeCompare(b.date)),
    places = new Set(worked.map(r => r.place).filter(Boolean)).size;
  modal(
    '<h2>Tu perfil</h2><p class="muted">Aparece en los recibos, PDF, Excel e imágenes que compartís.</p><form id="profileForm">' +
      field('Nombre y apellido', 'name', 'text', st.name || '', 'maxlength="80" autocomplete="name"') +
      field('Puesto u oficio', 'job', 'text', st.job || '', 'maxlength="80" placeholder="Ej.: Repartidor, Cajera…"') +
      field('Empleador o empresa', 'employer', 'text', st.employer || '', 'maxlength="80"') +
      formEnd('Guardar perfil') +
      '</form><h3>Tu historial</h3><div class="grid stats"><div class="metric"><small>Jornadas</small><b>' +
      worked.length +
      '</b></div><div class="metric"><small>Lugares</small><b>' +
      places +
      '</b></div><div class="metric"><small>Desde</small><b>' +
      (worked[0] ? dateLabel(worked[0].date).slice(0, 5) + '/' + worked[0].date.slice(2, 4) : '—') +
      '</b></div></div>',
  );
  $('profileForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (
      mutate(() => {
        for (const k of ['name', 'job', 'employer']) state.settings[k] = String(f.get(k) || '').trim();
      }, 'Perfil guardado.')
    )
      closeModal();
  };
}

function aboutForm() {
  modal(
    '<h2>Acerca de Mi Quincena</h2><p class="muted">Versión ' +
      APP_VERSION +
      '. Sin publicidad, sin analíticas, sin cuenta. Tus datos quedan en este teléfono.</p><h3>Rutina recomendada</h3><ol><li>Configurá tu tarifa y su fecha de vigencia.</li><li>Registrá cada día con el botón +: lugar, entrada, salida y si te pagan distinto (doble, ×1,5).</li><li>Cuando te pagan, cargá el cobro en Pagos.</li><li>Cerrá la quincena cuando esté revisada.</li><li>Exportá una copia de seguridad de vez en cuando.</li></ol><p class="muted">Un día sin registrar no es una falta. Cerrar una quincena bloquea cambios en jornadas y tarifas; podés seguir cargando cobros.</p><button type="button" class="wide" data-action="guide">' +
      icon('book') +
      ' Abrir la guía de uso</button>',
  );
}

function carryForm() {
  const key = part() === 'all' ? month() + ':1' : currentKey(),
    keys = new Set([
      ...state.rows.filter(r => r.status).map(r => Core.periodKey(r.date)),
      ...state.payments.map(p => Core.periodKey(Core.allocatedDate(p))),
      ...state.adjustments.map(a => Core.periodKey(a.date)),
    ]),
    list = [...keys]
      .filter(k => k < key)
      .sort()
      .reverse()
      .map(k => ({ k, s: Core.summarize(state, k.slice(0, 7), k.slice(8)) }))
      .filter(x => x.s.balance > 0.004);
  modal(
    '<h2>Saldo de quincenas anteriores</h2><p class="muted">Quincenas con importe generado que todavía no registraste como cobrado. Tocá una para ir a sus pagos.</p>' +
      list
        .map(
          x =>
            '<button class="listitem" data-goto="' +
            x.k +
            '">' +
            icon('pay') +
            '<span><strong>' +
            money(x.s.balance) +
            '</strong><small>' +
            new Date(x.k.slice(0, 7) + '-02T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) +
            ' · ' +
            x.k.slice(8) +
            'ª quincena · generado ' +
            money(x.s.total) +
            '</small></span>' +
            icon('arrow') +
            '</button>',
        )
        .join(''),
  );
  document.querySelectorAll('[data-goto]').forEach(
    b =>
      (b.onclick = () => {
        $('month').value = b.dataset.goto.slice(0, 7);
        $('part').value = b.dataset.goto.slice(8);
        closeModal();
        go('pay');
      }),
  );
}
