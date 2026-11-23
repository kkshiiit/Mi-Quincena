// La versión tiene que coincidir en todos lados: app, APK, package.json, CHANGELOG y README.
const fs = require('fs'), path = require('path'), assert = require('assert');
const r = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const v = require('../package.json').version;
assert.strictEqual(r('app/app.js').match(/APP_VERSION='([^']+)'/)[1], v, 'APP_VERSION');
assert.strictEqual(r('android/apktool.yml').match(/versionName: (\S+)/)[1], v, 'apktool versionName');
assert.strictEqual(r('CHANGELOG.md').match(/^## (\S+)/m)[1], v, 'CHANGELOG');
assert.ok(r('README.md').includes('versión-' + v), 'README badge');
// Los scripts de la app tienen que compilar.
for (const f of ['app/app.js', 'app/core.js', 'app/logo.js', 'app/seed.js']) new Function(r(f));
console.log('version ok (' + v + ')');
