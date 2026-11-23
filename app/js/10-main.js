// Arranque: acciones, botones fijos y primer dibujo. Se carga último.
'use strict';

async function action(a) {
  if (a === 'new') editRow(today());
  if (a === 'rule') ruleForm();
  if (a === 'rates') ratesView();
  if (a === 'payment') paymentForm();
  if (a === 'adjustment') adjustmentForm();
  if (a === 'batch') batchForm();
  if (a === 'appearance') go('settings');
  if (a === 'profile') profileForm();
  if (a === 'specialCfg') specialForm();
  if (a === 'paydayCfg') paydayForm();
  if (a === 'stats') {
    if ($('dialog').open) closeModal();
    go('stats');
  }
  if (a === 'about') aboutForm();
  if (a === 'payAll') paymentForm(null, summary().balance);
  if (a === 'exportXlsx') exportExcel('pay');
  if (a === 'reminders') remindersForm();
  if (a === 'backups') backupsForm();
  if (a === 'cloud') cloudForm();
  if (a === 'help') profileForm();
  if (a === 'share') shareSheet();
  if (a === 'guide') {
    if ($('dialog').open) closeModal();
    go('guide');
  }
  if (a === 'carry') carryForm();
  if (a === 'wipe') {
    const t = await ask(
      'Se borran jornadas, tarifas, cobros y ajustes (no tus preferencias). Podés deshacerlo enseguida, pero exportá una copia antes.',
      { title: '¿Borrar todos los datos?', input: 'Escribí BORRAR', ok: 'Borrar todo', danger: true },
    );
    if (t && t.trim().toUpperCase() === 'BORRAR')
      mutate(() => {
        state.rows = [];
        state.rules = [];
        state.payments = [];
        state.adjustments = [];
        state.closed = [];
        state.templates = [];
      }, 'Datos borrados.');
  }
  if (a === 'backup') {
    prefsSet('last-backup', String(Date.now()));
    if (tabName === 'settings') setTimeout(render, 0);
  }
  if (a === 'backup')
    download(
      'Mi-Quincena_respaldo_' + today() + '.json',
      'application/json',
      utf8b64(
        JSON.stringify(
          { ...state, exportedAt: new Date().toISOString(), app: 'Mi Quincena ' + APP_VERSION + '' },
          null,
          2,
        ),
      ),
    );
  if (a === 'import') {
    if (window.Android) Android.importFile();
    else $('file').click();
  }
  if (a === 'closePeriod') {
    const key = month() + ':' + part(),
      closed = state.closed.includes(key);
    if (
      await ask(
        closed
          ? '¿Reabrir esta quincena para corregir registros?'
          : '¿Cerrar esta quincena? No marca el saldo como cobrado. Se bloquean cambios en jornadas, ajustes y tarifas.',
        { title: closed ? 'Reabrir quincena' : 'Cerrar quincena', ok: closed ? 'Reabrir' : 'Cerrar' },
      )
    )
      mutate(
        () => {
          state.closed = closed ? state.closed.filter(k => k !== key) : state.closed.concat(key);
        },
        closed ? 'Quincena reabierta.' : 'Quincena cerrada.',
      );
  }
}

document.querySelectorAll('nav [data-tab]').forEach(b => {
  b.querySelector('span').innerHTML = icon(b.dataset.tab);
  b.onclick = () => go(b.dataset.tab);
});

document.querySelector('nav .fab i').innerHTML = icon('plus');

document.querySelector('.logo').innerHTML = '<img src="' + (window.LOGO_URI || '') + '" alt="">';

$('searchBtn').innerHTML = icon('search');

$('searchBtn').onclick = openSearch;

$('searchClose').innerHTML = icon('left');

$('searchClose').onclick = closeSearch;

$('searchInput').oninput = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 120);
};

$('prev').innerHTML = icon('left');

$('next').innerHTML = icon('arrow');

$('prev').onclick = () => shift(-1);

$('next').onclick = () => shift(1);

$('periodPick').onclick = () => {
  try {
    $('month').showPicker();
  } catch (e) {
    $('month').focus();
    $('month').click();
  }
};

document.querySelectorAll('[data-part]').forEach(
  b =>
    (b.onclick = () => {
      $('part').value = b.dataset.part;
      render();
    }),
);

$('month').value = today().slice(0, 7);

$('part').value = +today().slice(8) <= 15 ? '1' : '2';

$('month').onchange = render;

$('today').onclick = () => {
  $('month').value = today().slice(0, 7);
  $('part').value = +today().slice(8) <= 15 ? '1' : '2';
  render();
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('search').hidden) closeSearch();
});

window.onhashchange = () => {
  const t = location.hash.slice(1);
  if (['summary', 'hours', 'pay', 'settings', 'guide', 'stats'].includes(t) && t !== tabName) {
    tabName = t;
    render();
  }
};

$('dialog').addEventListener('close', () => {
  if (lastFocus?.isConnected) lastFocus.focus();
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', appearance);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.Android?.cloudSync) Android.cloudSync();
});

render();

syncNative();

lockScreen();
