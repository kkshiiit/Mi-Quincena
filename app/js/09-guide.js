// Guía de uso integrada.
'use strict';

function guideView() {
  const secs = [],
    sec = (id, t, html) => secs.push([id, t, html]),
    ex = t => '<div class="example"><b>Ejemplo</b>' + t + '</div>',
    f = t => '<div class="formula">' + t + '</div>';
  sec(
    'inicio',
    'Primeros pasos',
    '<ol><li><b>Cargá tu tarifa</b>: Ajustes → Tarifas. Sin tarifa se cuentan horas pero no plata.</li><li><b>Registrá cada día</b> con el botón <b>+</b> de abajo: asistencia, lugar, entrada y salida.</li><li><b>Cargá cada cobro</b> en Pagos cuando te pagan.</li><li>En <b>Quincena</b> ves cuánto generaste, cuánto cobraste y cuánto te deben.</li><li>Activá un <b>recordatorio</b> y exportá una <b>copia</b> cada tanto.</li></ol>',
  );
  sec(
    'dias',
    'Registrar un día',
    '<p>Tocá <b>+</b>. El formulario va por pasos:</p><ol><li><b>¿Qué día?</b> Tocá <b>Hoy</b> o <b>Ayer</b>, o elegí la fecha. Abajo ves el día de la semana y si es feriado.</li><li><b>¿Trabajaste?</b> “Sí, trabajé”, Falté, Franco, Feriado o Licencia.</li><li><b>¿Dónde?</b> Escribí la obra; abajo aparecen las que ya usaste, tocá una para no escribirla.</li><li><b>Horario:</b> a qué hora entraste y saliste. Si salís después de medianoche se marca solo “turno noche”. Elegí el descanso que no te pagan (sin descanso, 30 min, 1 h u otro).</li><li><b>¿Cómo te pagan este día?</b> Normal, ×1,5, Doble, Triple u Otro.</li></ol><p>Abajo ves al instante las horas, las extras y cuánto suma el día. <b>Como el último día</b> copia obra y horario del último día trabajado.</p>' +
      ex('Entrás 22:00 y salís 06:00 con 30 min de descanso: se marca solo “turno noche”, elegí 30 min → 7 h 30 min.'),
  );
  sec(
    'doble',
    'Pago doble o especial',
    '<p>En “Pago del día” elegí <b>Normal</b>, <b>×1,5</b>, <b>Doble ×2</b>, <b>Triple ×3</b> u <b>Otro</b> (por ejemplo 1,75). Multiplica la base y las extras <b>solo de ese día</b>; tu tarifa no cambia.</p>' +
      ex(
        'Tu día vale $50.000. Trabajás un feriado pagado doble: ese día suma $100.000. Si además hiciste 2 h extra a $9.000, suman 2 × $9.000 × 2 = $36.000.',
      ) +
      '<p>Con sueldo mensual, un día ×2 suma un día más de sueldo (sueldo ÷ días del mes).</p>',
  );
  sec(
    'tarifas',
    'Tarifas y aumentos',
    '<p>Cada tarifa vale <b>desde su fecha</b> hasta el día anterior a la siguiente. Por eso, cuando te aumentan, <b>no edites la tarifa vieja</b>: tocá <b>Registrar aumento</b>, poné el % o el nuevo importe y desde cuándo. Los días anteriores conservan su valor.</p><ul><li><b>Por día:</b> monto fijo por jornada.</li><li><b>Por hora:</b> horas normales × valor hora.</li><li><b>Mensual:</b> se reparte por días del mes o mitad por quincena.</li><li><b>Hora extra:</b> monto fijo, o <b>recargo %</b> sobre tu valor hora (50 % = la hora extra vale 1,5 horas).</li></ul><p>En el historial cada tarifa muestra su rango de fechas, el % de aumento contra la anterior y cuántos días la usan.</p>' +
      ex(
        'Cobrabas $50.000/día. Te aumentan 10 % desde el 16/11: Registrar aumento → 10 % → 16/11. Queda $55.000 desde el 16/11 y $50.000 antes.',
      ),
  );
  sec(
    'calculo',
    'Cómo se calcula todo',
    '<p>Todas las cuentas se hacen al centavo y con la tarifa vigente en la fecha de cada día.</p>' +
      f('Horas trabajadas = salida − entrada − descanso<br><small>(+24 h si la salida es al día siguiente)</small>') +
      f(
        'Horas extra = horas trabajadas − jornada normal<br><small>o, con horario fijo: lo trabajado fuera de ese horario</small>',
      ) +
      f(
        'Valor hora = importe del día ÷ jornada<br><small>por hora: el importe · mensual: sueldo ÷ (' +
          Core.MONTH_DAYS +
          ' × jornada)</small>',
      ) +
      f('Hora extra = monto fijo<br><small>o valor hora × (1 + recargo %)</small>') +
      f('Día = (base + horas extra × valor extra) × pago del día') +
      f('Generado = Σ días + sueldo mensual repartido + ajustes') +
      f('Pendiente = generado − cobrado') +
      '<p><b>Pago diario</b> (avanzado): completa siempre, media jornada si trabajás la mitad o menos, o proporcional a las horas normales.</p>' +
      ex(
        'Día $48.000, jornada 8 h, extra 50 %. Trabajás 08:00 a 18:00 (10 h).<br>Valor hora $6.000 → extra $9.000.<br>$48.000 + 2 × $9.000 = <b>$66.000</b>.',
      ),
  );
  sec(
    'periodos',
    'Quincenas y períodos',
    '<ul><li>‹ › cambian de quincena. Tocá el nombre para elegir mes.</li><li><b>1ª</b> = 1 al 15 · <b>2ª</b> = 16 a fin de mes · <b>Mes</b> = completo.</li><li><b>Hoy</b> te devuelve a la quincena actual.</li></ul>',
  );
  sec(
    'pagos',
    'Pagos: cobros, ajustes y cierre',
    '<p><b>Registrar cobro</b>, en 4 pasos:</p><ol><li><b>¿Qué quincena te pagaron?</b> Tocá la tarjeta: cada una muestra cuánto te deben.</li><li><b>¿Cuánto?</b> Escribilo o tocá “Todo lo que te deben”.</li><li><b>¿Cuándo te lo dieron?</b> Hoy, Ayer u otra fecha.</li><li><b>¿Cómo?</b> Efectivo, transferencia… (opcional).</li></ol><p>Abajo ves cómo queda esa quincena: saldada, debiendo o a favor.</p>' +
      ex('El 5/12 te pagan $520.000 de la 2ª de noviembre: tocá “2ª nov”, poné 520000, fecha 05/12.') +
      '<ul><li><b>Ajuste:</b> viáticos (+) o descuentos y adelantos (−).</li><li><b>Cerrar:</b> bloquea cambios en esa quincena. No la marca como cobrada.</li></ul>',
  );
  sec(
    'funciones',
    'Funciones opcionales',
    '<p>En Ajustes → <b>Funciones</b>, cada una con su interruptor:</p><ul><li><b>Pago especial en domingos y feriados:</b> al cargar uno de esos días te pregunta “¿Te lo pagan ×2?”. Vos confirmás; nunca se aplica solo. En Configurar elegís el multiplicador y revisás la lista de feriados (precargados los nacionales; podés agregar los de tu provincia o convenio).</li><li><b>Avisos de errores de carga:</b> te avisa antes de guardar si la jornada pasa de 14 h, dura menos de 1 h, no tiene obra o es una fecha futura, y en Quincena te muestra los días pasados sin registrar.</li><li><b>Aviso de día de cobro:</b> decís qué día te pagan cada quincena (por ejemplo la 1ª el 20 y la 2ª el 5 del mes siguiente). Ese día aparece un aviso con lo que te deben y, en Android, una notificación (sin importes).</li><li><b>Resumen por obra:</b> días, horas y extras en cada obra. “Ver por obra” muestra quincena, mes, 3 meses, año o todo, y dónde más fuiste o más extras hiciste.</li><li><b>Ocultar en apps recientes:</b> tapa la app en recientes y bloquea capturas.</li><li><b>Bloqueo con PIN:</b> pide un PIN al abrir y al volver después de un minuto. El PIN no viaja en las copias.</li></ul>',
  );
  sec(
    'recordatorios',
    'Recordatorios',
    '<p>Ajustes → Recordatorios. Elegí la hora (o una sugerida) y los días, o usá los atajos “Lun a vie”, “Todos”… Arriba ves cuándo llega el próximo aviso.</p><p>Si no llega: revisá que la app tenga permiso de notificaciones y que el ahorro de batería no la restrinja.</p>',
  );
  sec(
    'datos',
    'Tus datos y copias',
    '<ul><li>Todo se guarda <b>solo en este teléfono</b>. Ajustes → Tus datos muestra cuántos días, cobros y tarifas tenés, y cuándo exportaste la última copia (te avisa si pasaron más de 14 días).</li><li><b>Copias de seguridad:</b> exportá un .json completo. Además hay versiones automáticas antes de cada cambio.</li><li><b>Restaurar:</b> elegís <b>Combinar</b> (agrega lo que falta sin tocar lo tuyo) o <b>Reemplazar</b>, y qué partes: jornadas, tarifas, cobros. Tu tema, color, perfil y recordatorios <b>no cambian</b> salvo que los actives. Se puede deshacer.</li><li><b>Google Drive:</b> vinculá un archivo que se actualiza solo.</li><li><b>Importar:</b> Excel con tus horarios (con vista previa) o una copia .json.</li><li><b>Exportar período a Excel</b> y <b>Borrar todos los datos</b> (pide escribir BORRAR y se puede deshacer).</li></ul><div class="warn">Desinstalar la app borra los datos del teléfono. Exportá una copia antes.</div>',
  );
  sec(
    'compartir',
    'Compartir tu quincena',
    '<p>En Quincena → <b>Compartir quincena</b>. Elegí qué incluir (pendiente, generado, cobrado, detalle) y el formato: WhatsApp, imagen, PDF, Excel o Word.</p>' +
      ex('Para reclamar lo que te deben: dejá “Pendiente” y “Detalle”, apagá el resto y elegí WhatsApp.'),
  );
  sec(
    'buscar',
    'Buscar',
    '<p>La lupa busca en todas tus jornadas, cobros y ajustes. Sin importar acentos. Podés combinar palabras.</p>' +
      ex('“lunes depósito” · “16/11” · “ausente” · “doble” · “52000”'),
  );
  sec(
    'apariencia',
    'Apariencia',
    '<p>Ajustes → Apariencia: tema Sistema, Claro, Oscuro o AMOLED (negro puro), 8 colores de acento, reducir transparencia y quitar animaciones (más liviano).</p>',
  );
  sec(
    'faq',
    'Preguntas frecuentes',
    '<p><b>Cambié la tarifa y cambiaron días viejos.</b><br>Editaste una vigencia existente. Volvé al valor anterior y usá “Registrar aumento”.</p><p><b>Aparece “Sin tarifa”.</b><br>No hay tarifa que empiece antes de ese día. Creá una con fecha anterior.</p><p><b>No puedo editar un día.</b><br>Su quincena está cerrada. Reabrila en Pagos.</p><p><b>El pendiente no baja.</b><br>El cobro está imputado a otra quincena. Editalo y cambiá “Imputar a”.</p><p><b>¿Las extras se pagan doble?</b><br>Solo si ese día tiene pago ×2. Si no, valen su monto fijo o tu recargo %.</p>',
  );
  return (
    '<button class="link back" data-go="settings">' +
    icon('left') +
    ' Ajustes</button><div class="guide-search">' +
    icon('search') +
    '<input id="guideQ" type="search" placeholder="Buscar en la guía: doble, aumento, extra…" aria-label="Buscar en la guía"></div><div class="chips toc">' +
    secs.map(([id, t]) => '<button type="button" class="chip" data-toc="' + id + '">' + t + '</button>').join('') +
    '</div>' +
    secs
      .map(
        ([id, t, h], i) =>
          '<details class="guide-sec" id="g-' +
          id +
          '"' +
          (i === 0 ? ' open' : '') +
          '><summary>' +
          t +
          '</summary><div class="guide-body">' +
          h +
          '</div></details>',
      )
      .join('') +
    '<p id="guideNone" class="empty" hidden>No hay temas con esas palabras.</p><p class="footer">Mi Quincena ' +
    APP_VERSION +
    '</p>'
  );
}
