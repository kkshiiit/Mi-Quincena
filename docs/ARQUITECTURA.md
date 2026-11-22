# Notas técnicas

## Estructura general

Mi Quincena es una interfaz web (`app/`) que corre dentro de un `WebView` de Android (`android/`).

La parte web se carga desde los `assets` del APK. No usa red ni librerías externas en tiempo de ejecución. Las únicas dependencias son los dos archivos minificados de terceros, y se cargan recién cuando hace falta (al exportar o importar).

| Archivo | Responsabilidad |
|---|---|
| `app/core.js` | Lógica pura y testeable: validación de datos, cálculo de horas y extras, tarifas con vigencia, resumen por período, historial, saldo arrastrado, búsqueda. Se usa en el navegador (`window.Core`) y en Node (`module.exports`). |
| `app/app.js` | Pantallas, formularios, compartir (texto, PNG por `canvas`, PDF, Excel, DOCX), búsqueda, guía, temas y comunicación con Android. |
| `app/style.css` | Diseño con tokens de color en `:root`, temas claro, oscuro y AMOLED (`:root.amoled`), y modos de reducir transparencia y movimiento. |

## Datos

Todo se guarda en un único JSON (versión 2):

```js
{
  version: 2,
  rows:        [{ date, place, start, end, status, note, breakMinutes, overnight, paid? }],
  rules:       [{ from, mode: 'day'|'hour'|'month', rate, extra, hours, dayPolicy, monthPolicy, extraMode, ... }],
  payments:    [{ id, date, allocatedDate, amount, note }],
  adjustments: [{ id, date, amount, note }],
  closed:      ['AAAA-MM:1' | 'AAAA-MM:2'],
  templates:   [...],
  settings:    { theme: 'system'|'light'|'dark'|'amoled', name, reminder, reminderTime, reminderDays, ... }
}
```

- `Core.validateState` rechaza cualquier archivo inválido antes de guardar o restaurar.
- `Core.migrate` actualiza datos viejos a la versión actual sin perder nada.

## Puente con Android

La parte nativa expone el objeto `window.Android` (`MainActivity$Bridge`):

| Método | Uso |
|---|---|
| `load()` / `save(json)` | Leer y escribir los datos en el almacenamiento privado de la app, guardando una copia antes de escribir. |
| `backups()` / `readBackup(id)` | Versiones locales automáticas. |
| `exportFile(nombre, mime, base64)` | Muestra el diálogo “Guardar en Archivos o Drive / Compartir archivo”. |
| `shareText(texto)` / `copyText(texto)` | Compartir texto (WhatsApp, etc.) o copiarlo. |
| `importFile()` | Selector de archivos. Devuelve el resultado por `window.receiveFile(nombre, base64)`. |
| `cloudConnect` / `cloudSync` / `cloudRead` / … | Archivo de respaldo vinculado mediante el selector de documentos de Android. |
| `configureReminder(json)` | Recordatorio programado con `JobScheduler`. |
| `setTheme(oscuro)` / `setDarkColor(color)` | Colores de las barras del sistema (negro puro en AMOLED). |
| `setPayday(json)` | Fechas de cobro (sin importes) para la notificación del día de cobro; pide permiso de notificaciones. |
| `setSecure(on)` | Activa o quita `FLAG_SECURE` (oculta en recientes, bloquea capturas). |
| `preference(k)` / `preferenceSave(k, v)` | Preferencias pequeñas, como borradores u opciones de compartir. |

Cuando la app corre en un navegador común, `window.Android` no existe y se usan `localStorage` y descargas del navegador.

## Proyecto Android (`android/`)

Es un proyecto de [apktool](https://apktool.org): manifiesto, recursos y código `smali`. Los cambios hechos sobre el original fueron:

- **`res/values-v35/styles.xml`:** `windowOptOutEdgeToEdgeEnforcement`, para que el contenido no quede debajo de la barra de estado en Android 15.
- **`res/drawable/icon.xml`:** ícono vectorial (calendario con media quincena marcada y una moneda).
- **`res/values-v31/styles.xml`:** pantalla de inicio.
- **`ExportProvider.smali` → `getType`:** devuelve el tipo correcto para `.pdf`, `.png`, `.docx`, `.xlsx` y `.txt`, para que las otras apps reconozcan los archivos compartidos.
- **`MainActivity$Bridge.smali`:** campo `darkColor` y método `setDarkColor`.
- **`ReminderService.smali`:** `checkPayday` (notificación del día de cobro, una vez por día) y `paydayOn` (programa el trabajo periódico aunque el recordatorio diario esté apagado).
- **`MainActivity$Secure.smali` / `MainActivity$AskNotify.smali`:** ejecutan en el hilo de la interfaz `FLAG_SECURE` y el pedido de permiso de notificaciones.
- **`MainActivity.smali` → `onBackPressed`:** el botón Atrás cierra la búsqueda o el diálogo abierto, o vuelve a Quincena.

La compilación copia `app/` a `assets/` y firma el APK (ver `scripts/build.sh`).

## Tests

`tests/core.test.js` cubre:
- cambio de período;
- historial de quincenas;
- saldo arrastrado;
- búsqueda por día, fecha, lugar e importe;
- validación del tema AMOLED.

```bash
node tests/core.test.js
```
