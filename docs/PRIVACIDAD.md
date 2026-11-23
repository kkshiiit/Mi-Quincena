# Privacidad — auditoría 3.9.1

| Punto | Estado |
|---|---|
| Permiso de Internet | **No se pide.** La app no puede conectarse a ningún servidor. |
| Cuenta, publicidad, analíticas | Ninguna. |
| Dónde viven los datos | Almacenamiento privado de la app (`filesDir`), solo accesible por la app. |
| Copia automática de Google (`allowBackup`) | Desactivada: tus datos no suben solos a la nube. |
| Registros del sistema (logcat) | La app no escribe datos personales en registros. |
| Content-Security-Policy | Prohíbe red, objetos, frames y scripts externos. |
| WebView | Solo carga `file:///android_asset`; bloquea navegación externa, contenido mixto y acceso universal a archivos; almacenamiento web desactivado. |
| Archivos exportados | Se entregan con `FileProvider` no exportado y permiso temporal; solo la app que elegís puede leerlos. |
| Notificación de recordatorio | Texto genérico, sin importes ni lugares. |
| Copia JSON y Drive | Sin cifrar: contiene nombre, empleador, lugares e importes. Guardala en un lugar privado. |
| Portapapeles | “Copiar texto” deja el resumen en el portapapeles. |
| Nombres de archivo | Incluyen tu nombre si lo cargaste en el perfil. |
| Bloqueo | PIN guardado solo como derivación PBKDF2-SHA256 (210.000 iteraciones, con sal) en las preferencias del teléfono (no viaja en copias). 5 errores = espera creciente. La huella la valida Android; la app nunca ve la huella. |
| Librerías | SheetJS 0.20.3 y jsPDF 4.2.1, empaquetadas en el APK y cargadas solo al exportar o importar. Sin CDN. |
