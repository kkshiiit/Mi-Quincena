# Auditoría de código — 3.9.1

Revisión completa de `app/`, `android/`, `tests/`, `scripts/` y CI.

## Corregido en 3.9.1

| Gravedad | Hallazgo | Arreglo |
|---|---|---|
| Alta | `mutate()` guardaba en disco y, si el redibujo fallaba, volvía la memoria al estado anterior: disco y pantalla quedaban distintos y el siguiente guardado pisaba el cambio. | El guardado y el redibujo se manejan por separado; un error de pantalla ya no deshace en memoria algo ya guardado. |
| Alta | PIN guardado como un solo SHA-256: un PIN de 4 dígitos se adivina en milisegundos si alguien copia las preferencias (teléfono rooteado o copia ADB). | PBKDF2-SHA256 con 210.000 iteraciones y sal de 128 bits. Los PIN viejos se migran solos al desbloquear. |
| Media | Sin Content-Security-Policy: cualquier HTML inyectado podía cargar scripts. | CSP que prohíbe red (`connect-src 'none'`), objetos, frames y orígenes externos. Verificado con las 5 exportaciones. |
| Media | Con la app bloqueada, el teclado o un lector de pantalla podían llegar a los botones de atrás. | El resto de la app queda `inert` y el bloqueo es un diálogo modal accesible. |
| Media | Un diálogo podía abrirse por encima del bloqueo (por ejemplo, la respuesta de Drive). | `modal()` no abre nada mientras está bloqueado. |
| Baja | La versión estaba repetida en 6 lugares. | `APP_VERSION` única en la app y un test que verifica `package.json`, `apktool.yml`, `CHANGELOG` y README. |
| Baja | Código muerto (`parseExcel`). | Eliminado. |
| Baja | Sin pruebas de interfaz en el repositorio. | `tests/ui.smoke.js` (Playwright): pantallas, ventanas, desbordes en 320/390/800 px, registrar, cobrar, exportar. Corre en CI. |

## Bien resuelto (se mantiene)

- **Cálculos aislados** en `core.js`, puros y con tests, incluida una prueba de 3000 escenarios al azar.
- **Validación completa** del estado antes de cada guardado; la escritura en Android es atómica y guarda una versión previa.
- **Seguridad del contenedor**: sin permiso de Internet; el WebView no navega afuera; FileProvider no exportado; los nombres de archivo de las copias se validan contra recorrido de carpetas.
- **Escapado** de todo texto del usuario en HTML (`esc`), revisado en las 27 asignaciones de `innerHTML`.
- **Importación** de JSON validada y migrada; de Excel con vista previa; restauración por partes.

## Deuda técnica (recomendado, no urgente)

1. ~~**`style.css` en capas**~~ **Resuelto en 3.9.2:** reescrito por componentes; temas y transparencia solo cambian variables. Verificado con 120 capturas comparadas píxel a píxel (`tests/visual/`).
2. ~~**`app.js` de 140 KB**~~ **Resuelto en 3.9.3:** dividido en 10 archivos formateados en `app/js/`.
3. **HTML armado con cadenas**: funciona y está escapado, pero una función de plantillas o `lit-html` reduciría el riesgo de olvidar un `esc`.
4. ~~**`confirm()`/`prompt()` nativos**~~ **Resuelto en 3.9.4:** diálogo propio `ask()` en `01-util.js`.
5. **El bloqueo depende del reloj del teléfono**: cambiar la hora acorta la espera tras 5 errores. Mitigable guardando también el tiempo de arranque del sistema (`SystemClock.elapsedRealtime`) desde Android.
6. **Avisos de cobro**: se preparan 8 fechas (unos 4 meses). Si la app no se abre en ese tiempo, dejan de llegar. Android podría calcularlas solo.
7. **Firma**: los Releases salen con clave de prueba hasta cargar los secretos `MQ_KEYSTORE_B64`, `MQ_KEY_ALIAS` y `MQ_KEY_PASS`.
