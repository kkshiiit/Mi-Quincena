// Utilidades: formato, íconos, fechas, colores de acento, carga diferida de librerías y descargas.
'use strict';

const APP_VERSION = '3.9.3';

const $ = id => document.getElementById(id),
  esc = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    ),
  money = n =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n),
  hrs = n => Math.floor(Math.round(n * 60) / 60) + ' h ' + String(Math.round(n * 60) % 60).padStart(2, '0') + ' min';

const compactHours = n => {
  const m = Math.round(n * 60);
  return Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + String(m % 60).padStart(2, '0') + ' min' : '');
};

const paths = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M20 20l-4.2-4.2',
  image: 'M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6 M16 9.5v.01',
  table: 'M3 4h18v16H3z M3 10h18 M3 15h18 M9 4v16',
  doc: 'M6 2h8l4 4v16H6z M14 2v5h4 M9 12h6 M9 16h6 M9 8h2',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 21V5 M8 7h7',
  help: 'M9.1 9a3 3 0 1 1 4 2.8c-.7.3-1.1.9-1.1 1.7V14 M12 17.5v.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  left: 'M15 5l-7 7 7 7',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21a8 8 0 0 1 16 0',
  adjust: 'M4 7h10 M18 7h2 M4 17h4 M12 17h8 M16 5v4 M10 15v4',
  summary: 'M3 5h18v14H3z M3 10h18 M8 14h3',
  hours: 'M12 8v4l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  pay: 'M5 3h14v18l-3-2-4 2-4-2-3 2z M9 8h6 M9 12h6',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
  phone: 'M7 2h10v20H7z M10 18h4',
  cloud: 'M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13 0 5 5 0 0 1 0 10 M12 10v10 M8 14l4-4 4 4',
  plus: 'M12 5v14 M5 12h14',
  close: 'M6 6l12 12 M18 6 6 18',
  arrow: 'M9 5l7 7-7 7',
  file: 'M6 2h8l4 4v16H6z M14 2v5h4 M9 12h6 M9 16h6',
  copy: 'M8 8h13v13H8z M16 8V3H3v13h5',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M20 4l-2 2 M6 18l-2 2',
  bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z M10 21h4',
  check: 'M5 12l4 4L19 6',
  lock: 'M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4',
  undo: 'M8 4 3 9l5 5 M3 9h11a6 6 0 0 1 0 12',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 14h10l1-14 M10 11v6 M14 11v6',
  trend: 'M3 17l6-6 4 4 8-8 M15 7h6v6',
  share:
    'M15 6l-6 5 M9 13l6 5 M19 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4 M5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4 M19 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
};

const icon = k =>
    '<svg class="svg" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (paths[k] || paths.file) + '"/></svg>',
  uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2),
  today = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  },
  clone = x => JSON.parse(JSON.stringify(x));

const ACCENT = {
  teal: ['Turquesa', '#0a6f66', '#14a294', '#6fe0d1', '#3fc1b2'],
  blue: ['Azul', '#1d5fd1', '#3b82f6', '#8ab4ff', '#5b93f5'],
  violet: ['Violeta', '#6741c9', '#8b5cf6', '#c3a9ff', '#a07cf5'],
  pink: ['Rosa', '#b8326e', '#e0528f', '#ff9ec7', '#f06aa4'],
  orange: ['Naranja', '#b4530f', '#ea7a2a', '#ffb37a', '#f5944f'],
  green: ['Verde', '#23753a', '#3aa856', '#8fe3a3', '#5cc979'],
  amber: ['Ámbar', '#8a6100', '#c48a00', '#ffd36b', '#f0b83a'],
  red: ['Rojo', '#b3261e', '#e0453a', '#ffaaa3', '#f07a70'],
};

const logoImg = new Image();

logoImg.src = window.LOGO_URI || '';

const rel = ts => {
    const m = Math.round((Date.now() - ts) / 60000);
    return m < 1
      ? 'recién'
      : m < 60
        ? 'hace ' + m + ' min'
        : m < 1440
          ? 'hace ' + Math.round(m / 60) + ' h'
          : 'hace ' + Math.round(m / 1440) + (Math.round(m / 1440) === 1 ? ' día' : ' días');
  },
  pctTxt = n => (n > 0 ? '+' : '') + String(n).replace('.', ',') + ' %';

const multLabel = m => '×' + String(m).replace('.', ','),
  UNIT = { day: 'día', hour: 'hora', month: 'mes' };

const dayName = d => new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short' }),
  dateLabel = d => d.slice(8) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4),
  periodLabel = () =>
    new Date(month() + '-02T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) +
    ' · ' +
    (part() === 'all' ? 'mes completo' : part() + 'ª quincena');

const libs = {};

function loadLib(src) {
  return (
    libs[src] ||
    (libs[src] = new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = () => {
        delete libs[src];
        ko(Error('No se pudo cargar ' + src));
      };
      document.head.appendChild(s);
    }))
  );
}

const pctOf = s => (s.total > 0 ? Math.min(100, Math.round((s.paid / s.total) * 100)) : 0);

const hm = n => {
    const m = Math.round(n * 60);
    return m < 60 ? m + ' min' : compactHours(n);
  },
  sMoney = n => (n < 0 ? '− ' + money(-n) : money(n)),
  slug = t =>
    Core.norm(t)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

const ymd = d =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');

const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');

const mmss = ms => {
  const t = Math.ceil(ms / 1000);
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
};

function utf8b64(s) {
  const bytes = new TextEncoder().encode(s);
  let b = '';
  for (let i = 0; i < bytes.length; i += 8192) b += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(b);
}

function download(name, mime, data) {
  try {
    if (window.Android) {
      Android.exportFile(name, mime, data);
      return;
    }
    const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0)),
      url = URL.createObjectURL(new Blob([bytes], { type: mime })),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    toast('No se pudo exportar: ' + e.message);
  }
}
