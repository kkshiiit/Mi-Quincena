// Toda preferencia que la interfaz lee o guarda tiene que estar permitida por Android
// (MainActivity$Bridge.allowed). Si no, en el teléfono se descarta en silencio.
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..'), r = f => fs.readFileSync(path.join(root, f), 'utf8');
const smali = r('android/smali/ar/miquincena/MainActivity$Bridge.smali');
const allowed = new Set(smali.match(/\.method static allowed[\s\S]*?const-string v0, "([^"]+)"/)[1].split('|'));
const js = fs.readdirSync(path.join(root, 'app/js')).map(f => r('app/js/' + f)).join('\n') + r('app/index.html');
const used = new Set([...js.matchAll(/prefs(?:Get|Set)\(\s*'([^']+)'/g), ...js.matchAll(/Android\.preference\("([^"]+)"\)/g)].map(m => m[1]));
assert.ok(!/(?<!function )prefs(?:Get|Set)\(\s*[^'\s]/.test(js), 'prefsGet/prefsSet con clave no literal: no se puede verificar');
const missing = [...used].filter(k => !allowed.has(k));
assert.deepStrictEqual(missing, [], 'Claves que Android descartaría: ' + missing.join(', '));
console.log('bridge ok (' + used.size + ' preferencias permitidas)');
