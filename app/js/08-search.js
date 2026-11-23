// Buscador global.
'use strict';

let searchTimer;

function openSearch() {
  $('search').hidden = false;
  document.body.classList.add('searching');
  $('searchInput').value = '';
  runSearch();
  setTimeout(() => $('searchInput').focus(), 60);
}

function closeSearch() {
  $('search').hidden = true;
  document.body.classList.remove('searching');
}

function jumpTo(d) {
  $('month').value = d.slice(0, 7);
  $('part').value = +d.slice(8) <= 15 ? '1' : '2';
}

function runSearch() {
  const q = $('searchInput').value,
    box = $('searchResults');
  if (!Core.norm(q)) {
    box.innerHTML =
      '<div class="search-hint"><p>Probá con un día, una fecha, un lugar o un importe:</p><div class="chips">' +
      ['lunes', '16/11', 'noviembre', 'Ausente', 'transferencia']
        .map(t => '<button type="button" class="chip" data-q="' + t + '">' + t + '</button>')
        .join('') +
      '</div><small>Busca en todas tus jornadas, cobros y ajustes, de cualquier período.</small></div>';
    box.querySelectorAll('[data-q]').forEach(
      b =>
        (b.onclick = () => {
          $('searchInput').value = b.dataset.q;
          runSearch();
        }),
    );
    return;
  }
  const by = (a, b) => b.date.localeCompare(a.date),
    rows = state.rows
      .filter(r => (r.status || r.place || r.note) && Core.matches(Core.searchText('row', r), q))
      .sort(by),
    pays = state.payments.filter(p => Core.matches(Core.searchText('payment', p), q)).sort(by),
    adj = state.adjustments.filter(a => Core.matches(Core.searchText('adjustment', a), q)).sort(by),
    n = rows.length + pays.length + adj.length,
    long = d => {
      const w = new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long' });
      return w[0].toUpperCase() + w.slice(1) + ' ' + dateLabel(d);
    };
  box.innerHTML = !n
    ? '<p class="empty">No encontramos nada para “' + esc(q) + '”.</p>'
    : '<p class="search-count">' +
      n +
      (n === 1 ? ' resultado' : ' resultados') +
      (n > 60 ? ' · mostrando los más recientes' : '') +
      '</p>' +
      (rows.length
        ? '<section class="panel"><h3>Jornadas</h3>' +
          rows
            .slice(0, 60)
            .map(r => {
              const c = Core.calc(r, state.rules);
              return (
                '<button type="button" class="listitem" data-sday="' +
                r.date +
                '">' +
                icon('hours') +
                '<span><strong>' +
                esc(long(r.date)) +
                '</strong><small>' +
                esc(r.place || r.status) +
                (r.start ? ' · ' + esc(r.start) + '–' + esc(r.end) + ' · ' + compactHours(c.hours) : '') +
                (r.note ? ' · ' + esc(r.note) : '') +
                '</small></span>' +
                statusBadge(r) +
                '</button>'
              );
            })
            .join('') +
          '</section>'
        : '') +
      (pays.length
        ? '<section class="panel"><h3>Cobros</h3>' +
          pays
            .slice(0, 60)
            .map(
              p =>
                '<button type="button" class="listitem" data-spay="' +
                esc(p.id) +
                '">' +
                icon('pay') +
                '<span><strong>' +
                money(p.amount) +
                '</strong><small>' +
                dateLabel(p.date) +
                ' · ' +
                esc(p.note || 'Cobro') +
                '</small></span>' +
                icon('arrow') +
                '</button>',
            )
            .join('') +
          '</section>'
        : '') +
      (adj.length
        ? '<section class="panel"><h3>Ajustes</h3>' +
          adj
            .slice(0, 60)
            .map(
              a =>
                '<button type="button" class="listitem" data-sadj="' +
                esc(a.id) +
                '">' +
                icon('adjust') +
                '<span><strong>' +
                money(a.amount) +
                '</strong><small>' +
                dateLabel(a.date) +
                ' · ' +
                esc(a.note) +
                '</small></span>' +
                icon('arrow') +
                '</button>',
            )
            .join('') +
          '</section>'
        : '');
  box.querySelectorAll('[data-sday]').forEach(
    b =>
      (b.onclick = () => {
        const d = b.dataset.sday;
        closeSearch();
        jumpTo(d);
        go('hours');
        editRow(d);
      }),
  );
  box.querySelectorAll('[data-spay]').forEach(
    b =>
      (b.onclick = () => {
        const p = state.payments.find(x => x.id === b.dataset.spay);
        closeSearch();
        jumpTo(Core.allocatedDate(p));
        go('pay');
        paymentForm(p.id);
      }),
  );
  box.querySelectorAll('[data-sadj]').forEach(
    b =>
      (b.onclick = () => {
        const a = state.adjustments.find(x => x.id === b.dataset.sadj);
        closeSearch();
        jumpTo(a.date);
        go('pay');
        adjustmentForm(a.id);
      }),
  );
}
