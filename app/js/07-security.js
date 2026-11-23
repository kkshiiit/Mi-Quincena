// Privacidad: PIN (PBKDF2), huella, bloqueo, ocultar en recientes y aviso de cobro nativo.
'use strict';

function syncNative() {
  if (!window.Android) return;
  try {
    if (Android.setSecure) Android.setSecure(prefsGet('secure') === '1');
    if (Android.setPayday) {
      const pd = state.settings.payday,
        on = pd.enabled && pd.notify,
        dates = {};
      if (on)
        for (const x of Core.paydays(pd, today(), 8))
          dates[x.date] = 'Hoy deberían pagarte la ' + qLong(x.key) + '. Registrá el cobro en Mi Quincena.';
      {
        const j = JSON.stringify({ enabled: on, hour: pd.hour, first: pd.first, second: pd.second, dates });
        if (prefsGet('payday-sent') !== j) {
          Android.setPayday(j);
          prefsSet('payday-sent', j);
        }
      }
    }
  } catch (e) {}
}

async function pinHashV1(pin, salt) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pin)));
}

async function pinHash(pin, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  return hex(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 210000 },
      k,
      256,
    ),
  );
}

async function pinStore(pin) {
  const salt = uid() + uid();
  prefsSet('pin', 'p2$' + salt + '$' + (await pinHash(pin, salt)));
}

async function pinMatches(pin) {
  const parts = prefsGet('pin').split('$');
  if (parts[0] === 'p2') return (await pinHash(pin, parts[1])) === parts[2];
  if ((await pinHashV1(pin, parts[0])) === parts[1]) {
    await pinStore(pin);
    return true;
  }
  return false;
}

function pinSetup(sw) {
  if (!window.crypto?.subtle) {
    sw.checked = false;
    return toast('Este teléfono no permite el bloqueo con PIN.');
  }
  sw.checked = false;
  modal(
    '<h2>Crear PIN</h2><p class="muted">Se pide al abrir la app y al volver después de 1 minuto. Si te equivocás 5 veces, hay que esperar (30 s, 1 min, 2 min…). Si lo olvidás, hay que borrar los datos de la app: tené una copia de seguridad.</p><form id="pinForm"><label>PIN (4 a 8 números)<input name="a" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" required autocomplete="off"></label><label>Repetí el PIN<input name="b" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" required autocomplete="off"></label>' +
      formEnd('Activar bloqueo') +
      '</form>',
  );
  $('pinForm').onsubmit = async e => {
    e.preventDefault();
    const f = e.target.elements;
    if (!/^\d{4,8}$/.test(f.a.value)) return formError('Usá de 4 a 8 números.');
    if (f.a.value !== f.b.value) return formError('Los PIN no coinciden.');
    await pinStore(f.a.value);
    prefsSet('pin-fails', '0');
    pinLockSet(0);
    closeModal();
    toast(bioReady() ? 'PIN activado. Podés sumar la huella en Funciones.' : 'Bloqueo con PIN activado.');
    render();
  };
}

const bioReady = () => {
  try {
    return !!(window.Android && Android.bioAvailable && Android.bioAvailable());
  } catch (e) {
    return false;
  }
};

// Reloj a prueba de cambios de hora: en Android usa el tiempo desde que se encendió el teléfono
// (SystemClock.elapsedRealtime) y el número de encendido. Cambiar la hora no acorta la espera; si el
// teléfono se reinicia, la espera vuelve a contarse completa.
function nativeClock() {
  try {
    return window.Android && Android.clock ? JSON.parse(Android.clock()) : null;
  } catch (e) {
    return null;
  }
}
function pinLockSet(ms) {
  const c = nativeClock();
  prefsSet('pin-lock', ms ? JSON.stringify({ left: ms, e: c ? c.e : 0, boot: c ? c.boot : -1, wall: Date.now() }) : '');
  prefsSet('pin-until', '');
}
function pinWait() {
  let st = null;
  try {
    st = JSON.parse(prefsGet('pin-lock') || 'null');
  } catch (e) {}
  if (!st) return 0;
  const c = nativeClock();
  if (c && st.boot === c.boot && c.e >= st.e) return Math.max(0, st.left - (c.e - st.e));
  if (c) {
    prefsSet('pin-lock', JSON.stringify({ ...st, e: c.e, boot: c.boot }));
    return st.left;
  }
  return Math.max(0, st.wall + st.left - Date.now());
}

async function pinCheck(v) {
  const w = pinWait();
  if (w) return { ok: false, wait: w };
  if (await pinMatches(v)) {
    prefsSet('pin-fails', '0');
    pinLockSet(0);
    return { ok: true };
  }
  const f = Number(prefsGet('pin-fails') || 0) + 1;
  prefsSet('pin-fails', String(f));
  if (f % 5 === 0) {
    const ms = Math.min(15 * 60000, 30000 * 2 ** (f / 5 - 1));
    pinLockSet(ms);
    return { ok: false, wait: ms };
  }
  return { ok: false, left: 5 - (f % 5) };
}

function pinUI(box, done, { bio = false } = {}) {
  box.innerHTML =
    '<input class="pin-in" type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="PIN"><p class="error pin-err" role="alert"></p><p class="pin-timer" hidden></p><button class="primary pin-go">Desbloquear</button>' +
    (bio ? '<button class="pin-bio">' + icon('lock') + ' Usar huella</button>' : '');
  const inp = box.querySelector('.pin-in'),
    err = box.querySelector('.pin-err'),
    tm = box.querySelector('.pin-timer'),
    go = box.querySelector('.pin-go');
  let iv;
  const tick = () => {
    const w = pinWait();
    inp.disabled = go.disabled = w > 0;
    tm.hidden = !w;
    if (w) {
      tm.textContent = 'Demasiados intentos. Probá de nuevo en ' + mmss(w);
      err.textContent = '';
    } else {
      clearInterval(iv);
      iv = null;
      tm.hidden = true;
      if (document.activeElement !== inp) inp.focus();
    }
  };
  const startTimer = () => {
    if (!iv) iv = setInterval(tick, 250);
    tick();
  };
  const run = async () => {
    if (!inp.value) return;
    const r = await pinCheck(inp.value);
    inp.value = '';
    if (r.ok) {
      clearInterval(iv);
      done();
      return;
    }
    if (r.wait) startTimer();
    else
      err.textContent =
        'PIN incorrecto. ' +
        (r.left === 1 ? 'Queda 1 intento' : 'Quedan ' + r.left + ' intentos') +
        ' antes de tener que esperar.';
  };
  go.onclick = run;
  inp.onkeydown = e => {
    if (e.key === 'Enter') run();
  };
  if (box.querySelector('.pin-bio'))
    box.querySelector('.pin-bio').onclick = () => {
      try {
        Android.bioAuth();
      } catch (e) {}
    };
  if (pinWait()) startTimer();
  else setTimeout(() => inp.focus(), 120);
  return {
    focus: () => {
      if (!pinWait()) inp.focus();
    },
    msg: t => (err.textContent = t),
  };
}

let hiddenAt = 0,
  locked = false,
  lockUI = null,
  bioEnroll = null;

window.onBio = (r, code) => {
  if (bioEnroll) {
    const cb = bioEnroll;
    bioEnroll = null;
    cb(r === 'ok');
    return;
  }
  if (!locked || !lockUI) return;
  if (r === 'ok') {
    unlock();
    return;
  }
  if (r === 'err' && (code === 7 || code === 9)) lockUI.msg('Demasiados intentos con huella. Usá tu PIN.');
  else if (r === 'err' && code === 11) lockUI.msg('No hay huellas registradas en el teléfono. Usá tu PIN.');
  lockUI.focus();
};

function setInert(on) {
  for (const el of document.querySelectorAll('body>header,body>main,body>nav,#search,#toast')) el.inert = on;
}

function unlock() {
  locked = false;
  lockUI = null;
  setInert(false);
  const d = $('lock');
  if (d) d.remove();
}

function lockScreen() {
  if (locked || !prefsGet('pin')) return;
  locked = true;
  if ($('dialog').open) $('dialog').close();
  const bio = prefsGet('bio') === '1' && bioReady(),
    d = document.createElement('div');
  d.id = 'lock';
  d.setAttribute('role', 'dialog');
  d.setAttribute('aria-modal', 'true');
  d.setAttribute('aria-label', 'App bloqueada');
  setInert(true);
  d.innerHTML =
    '<div class="lock-box"><span class="logo">' +
    document.querySelector('.logo').innerHTML +
    '</span><h2>Mi Quincena</h2><p class="muted">' +
    (bio ? 'Tocá el sensor o ingresá tu PIN' : 'Ingresá tu PIN') +
    '</p><div class="pin-box"></div><small class="muted">¿Olvidaste el PIN? Solo se recupera borrando los datos de la app desde Ajustes de Android (perdés lo que no tenga copia).</small></div>';
  document.body.appendChild(d);
  lockUI = pinUI(d.querySelector('.pin-box'), unlock, { bio });
  if (bio && !pinWait())
    setTimeout(() => {
      try {
        Android.bioAuth();
      } catch (e) {}
    }, 300);
}

function pinVerify(title, done) {
  modal('<h2>' + esc(title) + '</h2><p class="muted">Ingresá tu PIN actual.</p><div class="pin-box"></div>');
  pinUI($('modal').querySelector('.pin-box'), () => {
    closeModal();
    done();
  });
}

// Cuánto tiempo fuera de la app se tolera sin volver a pedir el PIN (a elección del usuario).
const LOCK_OPTS = [
  [0, 'Siempre, apenas salís'],
  [60, 'Después de 1 minuto'],
  [120, 'Después de 2 minutos'],
  [300, 'Después de 5 minutos'],
  [900, 'Después de 15 minutos'],
];
function lockAfter() {
  const v = prefsGet('lock-after');
  return v === '' || isNaN(Number(v)) ? 60 : Number(v);
}
function markAway() {
  const c = nativeClock();
  prefsSet('away', JSON.stringify({ e: c ? c.e : 0, boot: c ? c.boot : -1, wall: Date.now() }));
}
// Segundos fuera de la app. Al abrir en frío solo se confía en el reloj de Android (no en la hora del
// teléfono, que se puede cambiar): sin él, o tras reiniciar, se considera “mucho tiempo” y se pide el PIN.
function awaySeconds(cold) {
  let a = null;
  try {
    a = JSON.parse(prefsGet('away') || 'null');
  } catch (e) {}
  if (!a) return Infinity;
  const c = nativeClock();
  if (c && a.boot === c.boot && c.e >= a.e) return (c.e - a.e) / 1000;
  if (cold || c) return Infinity;
  return Math.max(0, (Date.now() - a.wall) / 1000);
}
function shouldLock(cold) {
  const s = lockAfter();
  return s === 0 || !(awaySeconds(cold) < s);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenAt = Date.now();
    markAway();
  } else if (hiddenAt && shouldLock(false)) lockScreen();
});
