// Tus datos: copias, restauración, Google Drive e importación de Excel/JSON.
'use strict';

function dataSummary() {
  const last = Number(prefsGet('last-backup') || 0),
    days = last ? Math.floor((Date.now() - last) / 864e5) : null,
    n = state.rows.filter(r => r.status).length,
    kb = Math.max(1, Math.round(JSON.stringify(state).length / 1024));
  return (
    '<div class="data-sum"><div><b>' +
    n +
    '</b><small>días</small></div><div><b>' +
    state.payments.length +
    '</b><small>cobros</small></div><div><b>' +
    state.rules.length +
    '</b><small>tarifas</small></div><div><b>' +
    kb +
    ' KB</b><small>tamaño</small></div></div>' +
    (n && (days === null || days > 14)
      ? '<button type="button" class="warn backup-warn" data-action="backup">' +
        icon('undo') +
        '<span><b>' +
        (days === null ? 'Nunca exportaste una copia' : 'Última copia hace ' + days + ' días') +
        '</b><small>Tocá para guardar una ahora en Archivos o Drive.</small></span></button>'
      : last
        ? '<p class="ok-line">' + icon('check') + ' Última copia exportada ' + rel(last) + '</p>'
        : '')
  );
}

function backupsForm() {
  let list = [];
  try {
    list = window.Android
      ? JSON.parse(Android.backups())
      : JSON.parse(localStorage.getItem('mq-history') || '[]').map(x => ({ at: x.at, id: String(x.at) }));
  } catch (e) {}
  modal(
    '<h2>Copias de seguridad</h2>' +
      dataSummary() +
      '<p class="muted">La copia completa (.json) guarda todo: jornadas, tarifas, cobros, ajustes y preferencias. Guardala en Drive o mandátela por mail.</p><div class="actions"><button class="primary" data-action="backup">' +
      icon('share') +
      ' Exportar copia completa</button><button data-action="import">' +
      icon('file') +
      ' Restaurar archivo</button></div><h3>Versiones automáticas</h3><p class="muted">Antes de cada cambio se guarda una versión en este teléfono. Tocá una para ver qué tiene antes de restaurarla.</p>' +
      list
        .slice(0, 10)
        .map(
          x =>
            '<button class="listitem" data-backup="' +
            esc(x.id) +
            '">' +
            icon('undo') +
            '<span>' +
            esc(rel(x.at)) +
            '<small>' +
            esc(new Date(x.at).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })) +
            '</small></span>' +
            icon('arrow') +
            '</button>',
        )
        .join('') +
      (!list.length ? '<p class="empty">Se crearán al guardar cambios.</p>' : '') +
      '<div class="warn">Las versiones automáticas se borran si desinstalás la app. La copia exportada no.</div>',
  );
  document.querySelectorAll('[data-backup]').forEach(
    b =>
      (b.onclick = () => {
        try {
          const raw = window.Android
            ? Android.readBackup(b.dataset.backup)
            : JSON.parse(localStorage.getItem('mq-history') || '[]').find(x => String(x.at) === b.dataset.backup).data;
          restorePreview(Core.migrate(JSON.parse(raw)));
        } catch (e) {
          toast('No se pudo leer esa copia.');
        }
      }),
  );
}

function restorePreview(candidate, meta) {
  Core.validateState(candidate);
  const c = Core.migrate(candidate),
    n = x => x.rows.filter(r => r.status).length,
    opt = (k, t, d, on) =>
      '<label class="check switch"><span><b>' +
      t +
      '</b><small>' +
      d +
      '</small></span><input type="checkbox" role="switch" name="' +
      k +
      '" ' +
      (on ? 'checked' : '') +
      '></label>',
    themes = { system: 'Sistema', light: 'Claro', dark: 'Oscuro', amoled: 'AMOLED' },
    cs = c.settings;
  modal(
    '<h2>Restaurar copia</h2>' +
      (meta ? '<p class="muted">Copia del ' + esc(meta) + '</p>' : '') +
      '<div class="data-sum"><div><b>' +
      n(c) +
      '</b><small>días</small></div><div><b>' +
      c.payments.length +
      '</b><small>cobros</small></div><div><b>' +
      c.rules.length +
      '</b><small>tarifas</small></div><div><b>' +
      c.adjustments.length +
      '</b><small>ajustes</small></div></div><p class="muted">En este teléfono: ' +
      n(state) +
      ' días, ' +
      state.payments.length +
      ' cobros, ' +
      state.rules.length +
      ' tarifas.</p><form id="restoreForm"><fieldset class="segs"><legend>Cómo aplicar</legend><div class="seg-radio two-col"><label class="chip-radio"><input type="radio" name="mode" value="merge" checked><span>Combinar</span></label><label class="chip-radio"><input type="radio" name="mode" value="replace"><span>Reemplazar</span></label></div><small id="modeHelp"></small></fieldset><h3>Datos</h3>' +
      opt('rows', 'Jornadas', 'Días, horarios, lugares y plantilla', 1) +
      opt('rules', 'Tarifas', 'Vigencias y aumentos', 1) +
      opt('money', 'Cobros, ajustes y cierres', 'Lo que te pagaron y los descuentos', 1) +
      '<h3>Preferencias</h3><p class="muted">Apagadas: se mantienen las de este teléfono.</p>' +
      opt('profile', 'Perfil', esc([cs.name, cs.job, cs.employer].filter(Boolean).join(' · ') || 'Sin nombre'), 0) +
      opt(
        'appearance',
        'Apariencia',
        'Tema ' + (themes[cs.theme] || cs.theme) + ' · color ' + esc((ACCENT[cs.accent] || ACCENT.teal)[0]),
        0,
      ) +
      opt('reminders', 'Recordatorios', cs.reminder ? 'Activo · ' + esc(cs.reminderTime) : 'Desactivados', 0) +
      '<div class="preview" id="restorePv"></div><p id="formError" class="error" role="alert"></p><div class="actions"><button class="primary" type="submit">Restaurar</button><button type="button" data-close>Cancelar</button></div><small>Antes de aplicar se guarda una versión del estado actual: podés deshacerlo.</small></form>',
  );
  const f = $('restoreForm'),
    read = () => {
      const d = new FormData(f),
        parts = {};
      for (const k of ['rows', 'rules', 'money', 'profile', 'appearance', 'reminders']) parts[k] = d.has(k);
      return { mode: d.get('mode'), parts };
    };
  function pv() {
    const o = read();
    $('modeHelp').textContent =
      o.mode === 'merge'
        ? 'Agrega lo que falta y no toca lo que ya cargaste en este teléfono.'
        : 'Lo elegido queda exactamente como en la copia; se pierde lo que no esté en ella.';
    try {
      const { stats: st } = Core.restore(state, c, o),
        L = [];
      if (o.parts.rows)
        L.push(
          st.rows[0] + ' días nuevos' + (o.mode === 'replace' ? ' · ' + st.rows[1] + ' cambiados o quitados' : ''),
        );
      if (o.parts.rules)
        L.push(
          o.mode === 'replace' ? 'Tarifas: ' + st.rules[1] + ' → ' + st.rules[0] : st.rules[0] + ' tarifas nuevas',
        );
      if (o.parts.money)
        L.push(
          o.mode === 'replace'
            ? 'Cobros y ajustes: los de la copia (' + st.money[0] + ')'
            : st.money[0] + ' cobros/ajustes nuevos',
        );
      const pf = ['profile', 'appearance', 'reminders'].filter(k => o.parts[k]);
      L.push(
        pf.length
          ? 'Se restauran: ' +
              pf.map(k => ({ profile: 'perfil', appearance: 'apariencia', reminders: 'recordatorios' })[k]).join(', ')
          : 'Tu tema, perfil y recordatorios no cambian',
      );
      $('restorePv').innerHTML = L.map(esc).join('<br>');
      f.querySelector('[type=submit]').disabled = !Object.values(o.parts).some(Boolean);
    } catch (e) {
      $('restorePv').textContent = e.message;
    }
  }
  f.onchange = pv;
  pv();
  f.onsubmit = e => {
    e.preventDefault();
    const o = read();
    if (
      o.mode === 'replace' &&
      (o.parts.rows || o.parts.money) &&
      !confirm('Reemplazar borra de este teléfono lo que no esté en la copia. ¿Seguir?')
    )
      return;
    const was = loadError;
    try {
      const r = Core.restore(was ? Core.migrate({ version: 1, rows: [], rules: [], payments: [] }) : state, c, o);
      loadError = false;
      if (mutate(() => (state = r.state), 'Copia restaurada.')) {
        if (o.parts.reminders && window.Android) Android.configureReminder(JSON.stringify(state.settings));
        closeModal();
      } else loadError = was;
    } catch (e) {
      loadError = was;
      formError(e);
    }
  };
}

function cloudForm() {
  let info = { connected: false, status: '' };
  try {
    if (window.Android?.cloudInfo) info = JSON.parse(Android.cloudInfo());
  } catch (e) {}
  modal(
    '<h2>Google Drive y archivos</h2><p class="muted">Elegí un archivo de respaldo en Google Drive desde el selector de Android. Necesitás tener Drive instalado y tu cuenta iniciada.</p><div class="preview">' +
      icon(info.connected ? 'file' : 'cloud') +
      ' <strong>' +
      (info.connected ? 'Respaldo vinculado' : 'Sin archivo vinculado') +
      '</strong><small>' +
      esc(info.name || 'Vos elegís la cuenta y la carpeta desde Archivos.') +
      '</small></div><p class="muted" id="cloudStatus">' +
      esc(cloudMessage || info.status || 'Tus datos siguen guardados en este teléfono.') +
      '</p><div class="actions">' +
      (info.connected
        ? '<button class="primary" id="cloudWrite">Actualizar respaldo</button><button id="cloudRead">Leer copia vinculada</button><button id="cloudDisconnect">Desvincular</button>'
        : '<button class="primary" id="cloudCreate">Crear respaldo vinculado</button><button id="cloudChoose">Vincular archivo existente</button>') +
      '</div><div class="info">Se actualiza al guardar cambios y al abrir la app. El proveedor de archivos administra la subida y su demora. Esto es un respaldo de este teléfono, no una fusión automática entre varios dispositivos.</div><small>Si el archivo cambió afuera, se detiene la escritura y podés revisar ambas copias. Para editar desde varios teléfonos simultáneamente hace falta la integración OAuth de Drive, todavía no configurada.</small>',
  );
  if (!window.Android) {
    $('cloudStatus').textContent =
      'Disponible en la APK Android. Desde esta vista podés exportar e importar archivos manualmente.';
    for (const id of ['cloudCreate', 'cloudChoose']) if ($(id)) $(id).disabled = true;
    return;
  }
  if ($('cloudCreate'))
    $('cloudCreate').onclick = () => {
      try {
        save();
        Android.cloudConnect(true);
      } catch (e) {
        toast(e.message);
      }
    };
  if ($('cloudChoose'))
    $('cloudChoose').onclick = () => {
      try {
        save();
        Android.cloudConnect(false);
      } catch (e) {
        toast(e.message);
      }
    };
  if ($('cloudWrite')) $('cloudWrite').onclick = () => Android.cloudSync();
  if ($('cloudRead')) $('cloudRead').onclick = () => Android.cloudRead();
  if ($('cloudDisconnect'))
    $('cloudDisconnect').onclick = () => {
      Android.cloudDisconnect();
      cloudMessage = '';
      cloudForm();
    };
}

window.onCloudStatus = s => {
  cloudMessage = s;
  if ($('cloudStatus')) $('cloudStatus').textContent = s;
};

window.onCloudRead = raw => {
  try {
    restorePreview(Core.migrate(JSON.parse(raw)));
  } catch (e) {
    toast('La copia vinculada no es válida: ' + e.message);
  }
};

window.onCloudConflict = () => {
  cloudMessage = 'El archivo vinculado cambió. Se detuvo la escritura para protegerlo.';
  modal(
    '<h2>El respaldo cambió afuera</h2><p>Tu teléfono y el archivo vinculado tienen versiones diferentes. No se sobrescribió el archivo.</p><div class="actions"><button id="inspectCloud">Revisar copia del archivo</button><button id="exportLocal">Exportar mi copia local</button><button id="replaceCloud" class="danger">Reemplazar archivo con mi copia</button></div><small>Antes de reemplazarlo, revisá la otra copia. Para conservar ambas, exportá un respaldo separado.</small>',
  );
  $('inspectCloud').onclick = () => Android.cloudRead();
  $('exportLocal').onclick = () => action('backup');
  $('replaceCloud').onclick = () => {
    if (confirm('¿Reemplazar el archivo vinculado por los datos de este teléfono?')) {
      Android.cloudReplace();
      closeModal();
    }
  };
};

function excelDate(v) {
  if (v instanceof Date)
    return [v.getFullYear(), String(v.getMonth() + 1).padStart(2, '0'), String(v.getDate()).padStart(2, '0')].join('-');
  if (typeof v === 'number') {
    const p = XLSX.SSF.parse_date_code(v);
    return p ? `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}` : '';
  }
  const s = String(v || '').trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s.slice(6) + '-' + s.slice(3, 5) + '-' + s.slice(0, 2);
  return s;
}

function excelTime(v) {
  if (v == null || v === '') return '';
  if (v instanceof Date) return String(v.getHours()).padStart(2, '0') + ':' + String(v.getMinutes()).padStart(2, '0');
  if (typeof v === 'number') {
    const m = Math.round((v % 1) * 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  return m ? m[1].padStart(2, '0') + ':' + m[2] : s;
}

function excelRows(b64, mapping) {
  const wb = XLSX.read(b64, { type: 'base64', cellDates: true }),
    rows = [],
    errors = [],
    seen = new Set();
  for (const name of wb.SheetNames) {
    if (['Liquidación', 'Tarifas', 'Cobros', 'Ajustes'].includes(name)) continue;
    const values = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null });
    let map = mapping || {
      date: 0,
      place: 2,
      start: 3,
      end: 4,
      status: 5,
      note: 6,
      breakMinutes: 7,
      overnight: 8,
      paid: -1,
    };
    for (let i = 0; i < values.length; i++) {
      const a = values[i];
      if (!mapping && a.some(x => String(x).trim().toUpperCase() === 'FECHA')) {
        const norm = a.map(x =>
          String(x || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toUpperCase(),
        );
        const find = (names, fallback) => {
          const x = norm.findIndex(v => names.includes(v));
          return x < 0 ? fallback : x;
        };
        map = {
          date: find(['FECHA'], 0),
          place: find(['LUGAR / ACTIVIDAD', 'LUGAR', 'ACTIVIDAD'], 2),
          start: find(['ENTRADA'], 3),
          end: find(['SALIDA'], 4),
          status: find(['ASISTENCIA'], 5),
          note: find(['OBSERVACIONES'], 6),
          breakMinutes: find(['DESCANSO (MIN)', 'DESCANSO'], -1),
          overnight: find(['SALIDA DIA SIGUIENTE'], -1),
          paid: find(['DIA PAGO'], -1),
          mult: find(['PAGO DEL DIA'], -1),
        };
        continue;
      }
      const date = excelDate(a[map.date]);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        if (i > 1 && a[map.date] && a.slice(2, 6).some(x => x != null) && String(a[map.date]).match(/\d/))
          errors.push(name + ' fila ' + (i + 1) + ': fecha no reconocida');
        continue;
      }
      try {
        const raw = String(a[map.status] || '').trim(),
          status = Core.statuses.find(s => s.toLowerCase() === raw.toLowerCase());
        if (status === undefined) throw Error('Asistencia desconocida: ' + raw);
        const r = {
          date,
          place: String(a[map.place] || ''),
          start: excelTime(a[map.start]),
          end: excelTime(a[map.end]),
          status,
          note: String(a[map.note] || ''),
          breakMinutes: Number(a[map.breakMinutes] || 0),
          overnight: [true, 'true', 'Sí', 'SI', 'Si', 1].includes(a[map.overnight]),
          paid: [true, 'true', 'Sí', 'SI', 'Si', 1].includes(a[map.paid]),
          ...(map.mult >= 0 && Number(a[map.mult]) && Number(a[map.mult]) !== 1
            ? { multiplier: Number(a[map.mult]) }
            : {}),
        };
        Core.validateRow(r);
        if (seen.has(date)) throw Error('Fecha repetida en el archivo');
        seen.add(date);
        rows.push(r);
      } catch (e) {
        errors.push(name + ' fila ' + (i + 1) + ': ' + e.message);
      }
    }
  }
  return { rows, errors };
}

function importPreview(b64, mapping) {
  let parsed;
  try {
    parsed = excelRows(b64, mapping);
  } catch (e) {
    toast('Archivo rechazado: ' + e.message);
    return;
  }
  const duplicates = parsed.rows.filter(r =>
      state.rows.some(x => x.date === r.date && (x.status || x.place || x.note)),
    ),
    dupSet = new Set(duplicates.map(r => r.date));
  modal(
    '<h2>Revisar Excel</h2><div class="preview">' +
      parsed.rows.length +
      ' filas válidas · ' +
      duplicates.length +
      ' fechas con datos existentes · ' +
      parsed.errors.length +
      ' errores</div><p class="muted">Revisá los datos antes de incorporarlos. El Excel importa jornadas; tarifas, cobros y preferencias se restauran desde JSON.</p>' +
      (parsed.errors.length
        ? '<details open><summary>Filas que no se importarán</summary><p class="error">' +
          parsed.errors.slice(0, 30).map(esc).join('<br>') +
          '</p></details>'
        : '') +
      select(
        'Si la fecha ya tiene datos',
        'duplicatePolicy',
        [
          ['keep', 'Conservar datos del teléfono'],
          ['replace', 'Reemplazar solo fechas seleccionadas'],
        ],
        'keep',
      ) +
      '<div id="duplicateChoices" hidden>' +
      duplicates
        .map(
          r =>
            '<label class="check"><input type="checkbox" name="replaceDate" value="' +
            r.date +
            '">' +
            dateLabel(r.date) +
            ' · ' +
            esc(r.place) +
            ' · ' +
            esc(r.start) +
            '–' +
            esc(r.end) +
            '</label>',
        )
        .join('') +
      '</div><details><summary>Vista previa de las primeras 10 filas</summary>' +
      parsed.rows
        .slice(0, 10)
        .map(
          r =>
            '<div class="line"><div>' +
            dateLabel(r.date) +
            ' · ' +
            esc(r.place) +
            '<small>' +
            esc(r.start) +
            '–' +
            esc(r.end) +
            ' · ' +
            esc(r.status || 'Sin registrar') +
            '</small></div></div>',
        )
        .join('') +
      '</details><div class="actions"><button class="primary" id="importConfirm" ' +
      (!parsed.rows.length ? 'disabled' : '') +
      '>Importar filas válidas</button><button id="mapColumns">Asignar columnas</button><button data-close>Cancelar</button></div>',
  );
  document.querySelector('[name=duplicatePolicy]').onchange = e =>
    ($('duplicateChoices').hidden = e.target.value !== 'replace');
  $('mapColumns').onclick = () => mappingForm(b64);
  $('importConfirm').onclick = () => {
    try {
      const replacements = new Set([...document.querySelectorAll('[name=replaceDate]:checked')].map(x => x.value)),
        replace = document.querySelector('[name=duplicatePolicy]').value === 'replace',
        add = parsed.rows.filter(r => !dupSet.has(r.date) || (replace && replacements.has(r.date)));
      guardDates(add.map(r => r.date));
      if (!add.length) throw Error('No hay filas nuevas ni reemplazos seleccionados.');
      if (!confirm('¿Importar ' + add.length + ' fechas? Se conservará una copia local anterior.')) return;
      if (
        mutate(() => {
          const ds = new Set(add.map(r => r.date));
          state.rows = state.rows.filter(r => !ds.has(r.date)).concat(add);
        }, 'Excel importado.')
      )
        closeModal();
    } catch (e) {
      toast(e.message);
    }
  };
}

function mappingForm(b64) {
  const wb = XLSX.read(b64, { type: 'base64', cellDates: true }),
    ws = wb.Sheets[wb.SheetNames[0]],
    raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }),
    header = raw.find(a => a.some(x => String(x).toUpperCase() === 'FECHA')) || raw[0] || [],
    options = [
      ['-1', 'No existe'],
      ...Array.from({ length: Math.min(30, Math.max(header.length, 10)) }, (_, i) => [
        String(i),
        XLSX.utils.encode_col(i) + ' · ' + String(header[i] || 'Columna'),
      ]),
    ];
  const fields = [
    ['date', 'Fecha', 0],
    ['place', 'Lugar / actividad', 2],
    ['start', 'Entrada', 3],
    ['end', 'Salida', 4],
    ['status', 'Asistencia', 5],
    ['note', 'Observaciones', 6],
    ['breakMinutes', 'Descanso no pago', 7],
    ['overnight', 'Salida al día siguiente', 8],
    ['paid', 'Día pago', -1],
  ];
  modal(
    '<h2>Asignar columnas</h2><p class="muted">La asignación se aplica a las hojas de asistencia. Fecha y asistencia son obligatorias.</p><form id="mappingForm">' +
      fields.map(([k, t, d]) => select(t, k, options, String(d))).join('') +
      formEnd('Revisar con estas columnas') +
      '</form>',
  );
  $('mappingForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target),
      m = Object.fromEntries([...f].map(([k, v]) => [k, Number(v)]));
    if (m.date < 0 || m.status < 0) return formError('Elegí fecha y asistencia.');
    importPreview(b64, m);
  };
}

window.receiveFile = (name, b64) => {
  try {
    if (b64.length > 14 * 1024 * 1024) throw Error('El archivo supera 10 MB.');
    if (name.toLowerCase().endsWith('.json')) {
      const raw = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)))),
        candidate = Core.migrate(raw);
      restorePreview(
        candidate,
        raw.exportedAt
          ? new Date(raw.exportedAt).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
          : '',
      );
    } else if (name.toLowerCase().endsWith('.xlsx'))
      loadLib('xlsx.full.min.js')
        .then(() => importPreview(b64))
        .catch(e => toast(e.message));
    else throw Error('Elegí un archivo .xlsx o .json');
  } catch (e) {
    toast('Archivo rechazado: ' + e.message);
  }
};

$('file').onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    if (f.size > 10 * 1024 * 1024) throw Error('Máximo 10 MB');
    const b = new Uint8Array(await f.arrayBuffer());
    let s = '';
    for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
    receiveFile(f.name, btoa(s));
  } catch (e) {
    toast(e.message);
  }
  e.target.value = '';
};
