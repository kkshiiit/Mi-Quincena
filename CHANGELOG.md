# Cambios

## 3.11.0
- **AMOLED:** las tarjetas pasan de casi negro (#0b0b0b) a gris muy oscuro (#121212) con borde visible; el fondo sigue en negro puro para ahorrar batería.
- **Menos tarjetas (atención selectiva):** Jornadas, Horas y Extras pasan a la tarjeta principal de Quincena y de Por obra; “Donde más fuiste” y el resumen de Tus datos dejan de ser tarjetas dentro de tarjetas. “Últimos registros” entra en la primera pantalla.
- **Botones que dicen qué hacen:** “Guardar recordatorio”, “Guardar pago especial”, “Guardar días de cobro”.
- **Ejemplos en los campos:** importe del cobro, detalle, obra, puesto y ajustes.

## 3.10.1
- **Tema “Sistema” arreglado en Android:** la app nativa siempre usaba un tema claro, y por eso la parte web nunca se enteraba de que el teléfono estaba en modo oscuro. Ahora hay estilos nocturnos (`values-night*`).
- **Contraste auditado en 80 combinaciones** (5 temas × 8 acentos × transparencia sí/no) y 12 pantallas, con la norma WCAG. Arreglos: los botones principales en tema claro tenían texto blanco sobre un tono claro (2,9:1 → más de 4,5:1 con todos los acentos); el naranja como texto quedaba en 4,3:1 (ahora es más oscuro).
- Los interruptores apagados en tema claro ahora se distinguen del fondo.
- **Avisos de Quincena con color propio:** cobro atrasado en amarillo, días sin registrar con el color de acento, saldo de otras quincenas en coral. El saldo anterior ya no repite la deuda que muestra el aviso de cobro.
- `npm run test:contrast` (`tests/visual/contrast.js`) corre en GitHub en cada cambio.

## 3.10.0
- **Arreglo importante:** la parte Android solo dejaba guardar 2 preferencias y descartaba el resto en silencio. Por eso el **PIN** no quedaba activado, la **huella** no aparecía, y **ocultar en recientes**, **pedir el PIN al volver**, las **opciones de compartir**, el aviso de **última copia** y el **tema al abrir** no se guardaban. Nuevo `tests/bridge.test.js`: falla si la app usa una preferencia que Android no permite.
- **Ajustes reorganizado por tema:** Pagos · Avisos · Privacidad · Pantalla · Tus datos · Ayuda. Los “Configurar” solo aparecen con la opción prendida. Los colores de acento entran en una fila. Si el teléfono no tiene huella, lo dice.
- Se quitaron de Ajustes “Cargar varios días” (está en Horarios) y “Exportar período a Excel” (está en Compartir).
- **Compartir:** elegís el período ahí mismo (esta quincena, la anterior o el mes) y hay atajos: “Reclamar lo que me deben”, “Resumen completo” y “Solo horas, sin plata”. Se quitó **Word** (el PDF cumple esa función).
- Texto de WhatsApp más corto y en primera persona (“Me deben”), sin pie publicitario; la imagen muestra la fecha de emisión.

## 3.9.7
- Tarifas: la ventana ya no se sale del borde en pantallas angostas con importes grandes.
- Dependencias al día: apktool 3.0.3, GitHub Actions nuevas, Node 24, Playwright 1.65.1.
- Firma: contraseña de almacén opcional (`MQ_STORE_PASS`) y guía en `docs/FIRMA.md`.

## 3.9.6
- **Pedir el PIN al volver**, a elección: siempre, o después de 1, 2, 5 o 15 minutos fuera de la app (antes era fijo en 1 minuto).
- El tiempo fuera se mide con el reloj de Android que no se puede adelantar; si la app se cierra y se abre de nuevo dentro del tiempo elegido, tampoco pide PIN. Al reiniciar el teléfono, siempre lo pide.

## 3.9.5
- La espera tras 5 PIN incorrectos usa el reloj desde el encendido del teléfono (`SystemClock.elapsedRealtime`) y el número de encendido: **cambiar la hora no la acorta**, y reiniciar el teléfono la vuelve a contar completa.
- El aviso de día de cobro **ya no depende de abrir la app**: si no hay fechas preparadas, Android calcula solo si hoy es día de cobro según los días configurados.

## 3.9.4
- Las 15 confirmaciones y el pedido de texto nativos de Android se reemplazaron por un diálogo propio (`ask()`): sigue el tema y el color de acento, se abre encima del formulario sin cerrarlo, tiene título y botones claros (“Eliminar”, “Guardar igual”, “Activar”…) y marca en rojo lo que borra.
- “Borrar todos los datos” se confirma escribiendo BORRAR en el mismo diálogo.
- “Atrás” o Escape cancelan.
- La prueba de interfaz falla si vuelve a aparecer un diálogo nativo.

## 3.9.3
- `app.js` (140 KB en pocas líneas) dividido en 10 archivos legibles en `app/js/`: utilidades, estado, pantallas, formularios, datos, exportar, seguridad, búsqueda, guía y arranque.
- Código formateado con Prettier (`npm run format`) y `.prettierrc`.
- Test que verifica que `index.html` carga todos los módulos y en orden.
- Sin cambios de comportamiento: 120 capturas idénticas, mismas exportaciones y flujos.

## 3.9.2
- `style.css` reescrito por componentes (11 secciones), sin capas de versiones viejas: 45 → 41 KB, `!important` de 14 a 4.
- Temas y “Reducir transparencia” cambian solo variables: ningún componente puede volver a perder su color.
- Arreglos: en modo oscuro el tono suave ignoraba el color de acento; el “/ día” del historial de tarifas bajaba de renglón; botones de color (aviso de copia, círculos de acento) cambiaban de fondo al pasar el dedo.
- Se eliminaron 8 clases sin uso.
- `tests/visual/`: captura 120 pantallas y compara antes/después.

## 3.9.1
Auditoría de código ([docs/AUDITORIA.md](docs/AUDITORIA.md)):
- El PIN se guarda con PBKDF2 (210.000 iteraciones); los PIN anteriores se migran solos.
- Política de seguridad de contenido (CSP): la app no puede cargar nada de afuera.
- Un error al redibujar ya no deja la pantalla distinta de lo guardado.
- Con la app bloqueada, nada de atrás recibe foco ni se abren ventanas encima.
- Versión única verificada por test; prueba de interfaz automática en CI.

## 3.9.0
- **Huella digital** para desbloquear (Android 10+), con el PIN como alternativa. Si la huella se bloquea por intentos, avisa y pide el PIN.
- PIN con **límite de intentos**: cada 5 errores hay que esperar 30 s, 1 min, 2 min… (máx. 15 min), con **cuenta regresiva** visible. Sobrevive a reiniciar la app.
- Quitar el bloqueo ahora pide el PIN actual.
- **Reducir transparencia** ya no hace desaparecer los colores de acento, avisos ni botones de color.
- “Sin animaciones” explica qué quita y que la app ya respeta la opción del teléfono.

## 3.8.0
- Ícono ilustrado (moneda surfeando una ola de billetes), adaptable a cualquier forma de ícono de Android.
- Pantalla de arranque azul noche con el ícono; sin destello blanco al abrir (tema aplicado desde el primer cuadro, fondo claro u oscuro según el sistema).
- Bienvenida en la primera apertura con los dos primeros pasos.
- Ya no avisa “días sin registrar” anteriores a tu primer día cargado.
- Período legible en pantallas chicas.
- El aviso de cobro solo se reenvía a Android si cambió.

## 3.7.1
- Ícono nuevo: nivel de obra cuya burbuja es una moneda (quincena "nivelada" = cobrada justo).

## 3.7.0
- Formulario de día por pasos (Hoy/Ayer, ¿trabajaste?, obra con sugerencias que no tapan, horario con turno noche automático, descanso en un toque, pago del día).
- Registrar cobro por pasos: elegís la quincena con lo que te deben, “todo lo que te deben”, Hoy/Ayer, medio de pago.
- Funciones opcionales con interruptor: pago especial en domingos/feriados (pregunta, nunca automático; feriados editables), avisos de errores de carga, aviso y notificación de día de cobro, resumen por obra, ocultar en recientes, bloqueo con PIN.
- Pantalla “Por obra”.
- El campo enfocado queda visible sobre el teclado.
- `seed.js` vacío (antes traía días de ejemplo con lugares reales).
- CI en GitHub: tests y APK de prueba en cada push.

## 3.6.0
- Restaurar copias combinando o reemplazando por partes, sin pisar tema, perfil ni recordatorios.
- jsPDF 4.2.1.

## 3.5.x
- Exportaciones rehechas (PDF, Excel, Word, imagen, texto).
- Auditoría: borrador falso, horario perdido al cambiar asistencia, turno nocturno, duplicar con selector de fecha. Test de 3000 escenarios.

## 3.4.0
- Tarifas por vigencia con aumentos, recargo % de extras, cálculos revisados, recordatorios, Tus datos, guía con buscador.

## 3.3.0
- Pago doble por día, barra inferior nueva, colores de acento, Pagos/Ajustes/Tarifas/Perfil rediseñados, ícono nuevo.
