# Cambios

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
