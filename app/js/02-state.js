// Estado de la app: carga, guardado validado, deshacer, avisos, período visible y apariencia.
'use strict';

let state,
  tabName = 'summary',
  loadError = false,
  undoState = null,
  draftTimer,
  cloudTimer,
  cloudMessage = '',
  lastFocus;

try {
  const raw = window.Android ? Android.load() : localStorage.getItem('miquincena-v1');
  state = Core.migrate(raw ? JSON.parse(raw) : { version: 1, rows: SEED, rules: [], payments: [] });
} catch (e) {
  loadError = true;
  state = Core.migrate({ version: 1, rows: [], rules: [], payments: [] });
}

function prefsGet(k) {
  try {
    return window.Android ? Android.preference(k) : localStorage.getItem('mq-' + k) || '';
  } catch (e) {
    return '';
  }
}

function prefsSet(k, v) {
  if (window.Android) Android.preferenceSave(k, v);
  else localStorage.setItem('mq-' + k, v);
}

function save() {
  if (loadError) throw Error('No se pudo leer tu copia. Restaurá un respaldo antes de editar.');
  Core.validateState(state);
  const raw = JSON.stringify(state);
  if (window.Android) {
    const result = Android.save(raw);
    if (result !== 'ok') throw Error(result);
  } else {
    const old = localStorage.getItem('miquincena-v1');
    if (old && old !== raw) {
      let h = JSON.parse(localStorage.getItem('mq-history') || '[]');
      h.unshift({ at: Date.now(), data: old });
      localStorage.setItem('mq-history', JSON.stringify(h.slice(0, 8)));
    }
    localStorage.setItem('miquincena-v1', raw);
  }
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => {
    if (window.Android && Android.cloudInfo) Android.cloudSync();
  }, 2500);
}

function mutate(fn, message = 'Guardado. Totales actualizados.') {
  const old = clone(state);
  try {
    fn();
    save();
  } catch (e) {
    state = old;
    toast(e.message);
    return false;
  }
  undoState = old;
  try {
    render();
    toast(message, true);
  } catch (e) {
    console.error(e);
    toast('Se guardó, pero la pantalla no se pudo actualizar. Cerrá y abrí la app.');
  }
  return true;
}

function undo() {
  if (!undoState) return;
  const next = undoState;
  if (mutate(() => (state = next), 'Cambio deshecho.')) undoState = null;
}

function toast(s, canUndo = false) {
  $('toast').innerHTML = '<span>' + esc(s) + '</span>' + (canUndo ? '<button id="undoButton">Deshacer</button>' : '');
  $('toast').style.display = 'block';
  if ($('undoButton')) $('undoButton').onclick = undo;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => ($('toast').style.display = 'none'), canUndo ? 9000 : 5500);
}

function month() {
  return $('month').value || today().slice(0, 7);
}

function part() {
  return $('part').value;
}

function summary() {
  return Core.summarize(state, month(), part());
}

function blank(date) {
  return { date, place: '', start: '', end: '', status: '', note: '', breakMinutes: 0, overnight: false };
}

function selectedRows() {
  const map = new Map(state.rows.map(r => [r.date, r]));
  return Core.dates(month(), part()).map(d => map.get(d) || blank(d));
}

function guardDates(ds) {
  const locked = [...new Set(ds.map(Core.periodKey))].filter(k => state.closed.includes(k));
  if (locked.length) throw Error('Período cerrado. Reabrilo desde Pagos antes de modificarlo.');
}

function appearance() {
  const t = state.settings.theme,
    sys = matchMedia('(prefers-color-scheme: dark)').matches,
    mode = t === 'amoled' ? 'amoled' : t === 'dark' || (t !== 'light' && sys) ? 'dark' : 'light',
    dark = mode !== 'light',
    root = document.documentElement;
  root.dataset.theme = dark ? 'dark' : 'light';
  root.classList.toggle('amoled', mode === 'amoled');
  const ac = ACCENT[state.settings.accent] || ACCENT.teal;
  if (window.__boot !== mode) {
    window.__boot = mode;
    try {
      prefsSet('theme-cache', mode);
    } catch (e) {}
  }
  root.style.setProperty('--accent', dark ? ac[3] : ac[1]);
  root.style.setProperty('--accent-2', dark ? ac[4] : ac[2]);
  root.style.setProperty('--on-accent', dark ? '#0b1513' : '#ffffff');
  document.body.classList.toggle('no-glass', !!state.settings.reduceTransparency);
  document.body.classList.toggle('reduce-motion', !!state.settings.reduceMotion);
  document.querySelector('meta[name=theme-color]').content =
    mode === 'amoled' ? '#000000' : dark ? '#070c14' : '#e9eef6';
  if (window.Android) {
    if (Android.setDarkColor) Android.setDarkColor(mode === 'amoled' ? -16777216 : -16315372);
    if (Android.setTheme) Android.setTheme(dark);
  }
}

function currentKey() {
  return month() + ':' + (part() === 'all' ? '2' : part());
}
