// La versión tiene que coincidir en todos lados: app, APK, package.json, CHANGELOG y README.
const fs = require('fs'), path = require('path'), assert = require('assert');
const r = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const v = require('../package.json').version;
assert.strictEqual(r('app/js/01-util.js').match(/APP_VERSION = '([^']+)'/)[1], v, 'APP_VERSION');
assert.strictEqual(r('android/apktool.yml').match(/versionName: (\S+)/)[1], v, 'apktool versionName');
assert.strictEqual(r('CHANGELOG.md').match(/^## (\S+)/m)[1], v, 'CHANGELOG');
assert.ok(r('README.md').includes('versión-' + v), 'README badge');
// Los scripts de la app tienen que compilar.
for (const f of ['app/core.js', 'app/logo.js', 'app/seed.js', ...fs.readdirSync(path.join(__dirname, '..', 'app/js')).map(x => 'app/js/' + x)]) new Function(r(f));
// index.html carga todos los módulos, en orden.
const mods = fs.readdirSync(path.join(__dirname, '..', 'app/js')).sort();
assert.deepStrictEqual([...r('app/index.html').matchAll(/src="js\/([^"]+)"/g)].map(m => m[1]), mods, 'index.html y app/js/');
console.log('version ok (' + v + ')');
