# Mi Quincena

App de Android para llevar **tus horarios de trabajo y lo que te pagan, quincena por quincena**.

Registrás cada día que trabajás y la app calcula sola:
- cuánto generaste;
- cuánto ya cobraste;
- cuánto te deben.

Funciona sin internet, sin publicidad y sin crear una cuenta. Tus datos quedan guardados solo en tu teléfono.

## ¿Para quién es?

Para quien cobra por día, por hora o con sueldo mensual y quiere saber exactamente cuánto le corresponde cada quincena. Por ejemplo: trabajo por jornada, changas, turnos rotativos o empleo informal. Sirve también para tener un registro claro y mostrarlo cuando te pagan.

## Qué hace

| Pantalla | Para qué sirve |
|---|---|
| **Quincena** | Muestra el saldo pendiente de cobro, lo generado y lo cobrado (con %), tus jornadas, horas y horas extra. Incluye un gráfico de las últimas 6 quincenas y un aviso si quedó plata sin cobrar de quincenas anteriores. |
| **Horarios** | La planilla de cada día del período: asistencia, entrada, salida y descanso. Se puede filtrar por estado y cargar varios días iguales de una vez. |
| **Pagos** | La liquidación (base, extras, ajustes, generado, cobrado y pendiente), los cobros, los ajustes (viáticos, descuentos) y el botón para cerrar o reabrir una quincena. |
| **Ajustes** | Tarifas por vigencia, recordatorios, copias de seguridad, Google Drive, importar Excel, apariencia (claro, oscuro, AMOLED) y la guía de uso. |

Además:
- **Compartir quincena** en 5 formatos: texto para WhatsApp, imagen, PDF, Excel y Word. Antes de compartir elegís si incluir el pendiente, el generado, el cobrado con porcentaje y el detalle por día.
- **Buscador**: encuentra cualquier día, fecha, lugar, cobro o importe en todos los períodos.
- **Tarifas con vigencia**: si te aumentan, los días anteriores conservan su valor.
- **Deshacer** después de cada cambio, y una copia local automática antes de guardar.

La guía completa, con ejemplos, está en [docs/GUIA.md](docs/GUIA.md).

## Instalar

1. Descargá el APK más reciente desde la sección **Releases** de este repositorio.
2. Abrilo en tu teléfono Android (8.0 o más nuevo) y aceptá instalar desde esa fuente.

> **Si ya tenés la app instalada:** una versión firmada con la misma clave se instala encima y conserva tus datos. Si Android te pide desinstalar primero, **antes exportá una copia** desde Ajustes → Copias de seguridad, porque desinstalar borra los datos del teléfono.

## Cómo está hecha

Es una app web dentro de una ventana nativa de Android (WebView):

```
app/        Interfaz y lógica (HTML, CSS y JavaScript puro, sin frameworks)
  index.html     Estructura de la pantalla
  app.js         Pantallas, formularios, compartir, búsqueda
  core.js        Cálculos puros: horas, extras, tarifas, saldos, búsqueda (con tests)
  style.css      Diseño (vidrio translúcido, temas claro/oscuro/AMOLED)
  seed.js        Datos iniciales vacíos para la primera apertura
  xlsx.full.min.js, jspdf.umd.min.js   Librerías de terceros (Excel/Word y PDF)
android/    Contenedor nativo (proyecto apktool: manifiesto, recursos, código smali)
tests/      Tests de los cálculos (node tests/core.test.js)
scripts/    build.sh: arma y firma el APK
docs/       Guía de uso y notas técnicas
```

La parte nativa (`android/`) resuelve lo que una página web no puede hacer sola:
- guardar los datos en el teléfono;
- compartir y guardar archivos;
- respaldar en Drive;
- mandar recordatorios.

El detalle está en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Probar y compilar

**Probar la interfaz en la computadora** (sin Android, guarda en el navegador):

```bash
python -m http.server 8765 --directory app
```

Abrí `http://localhost:8765`. Las funciones nativas (Drive, recordatorios) aparecen como no disponibles.

**Correr los tests:**

```bash
node tests/core.test.js
```

**Compilar el APK.** Necesitás Java 17 o más nuevo, [apktool](https://apktool.org) y [uber-apk-signer](https://github.com/patrickfav/uber-apk-signer):

```bash
APKTOOL_JAR=~/tools/apktool.jar SIGNER_JAR=~/tools/uber-apk-signer.jar scripts/build.sh
```

Sin `MQ_KEYSTORE` se firma con una clave de prueba. Para publicar actualizaciones, definí `MQ_KEYSTORE`, `MQ_KEY_ALIAS` y `MQ_KEY_PASS` con tu propia clave. **Nunca subas la clave ni su contraseña al repositorio**: el `.gitignore` ya excluye `*.jks` y `*.pass`.

## Privacidad

- No hay servidores, cuentas, analíticas ni publicidad.
- La app no pide permiso de internet para la interfaz: todo se carga desde el propio APK.
- Los datos viven en el almacenamiento privado de la app. Solo salen del teléfono si vos exportás, compartís o vinculás un archivo de Drive.

## Créditos

- [SheetJS](https://sheetjs.com) (`xlsx.full.min.js`), licencia Apache 2.0: Excel e importación, y el empaquetado de los archivos Word.
- [jsPDF](https://github.com/parallax/jsPDF) (`jspdf.umd.min.js`), licencia MIT: recibos en PDF.
