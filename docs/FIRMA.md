# Firmar las versiones con tu clave

Android solo deja instalar una actualización **encima** de la app si está firmada con **la misma clave**.
Si la clave cambia, pide desinstalar, y eso borra los datos del teléfono.

| Versión | Firmada con |
|---|---|
| 3.2.1 | **Tu clave** (`CN=Mi Quincena`, SHA-256 `95921c5d…c9dcf`) |
| 3.3.0 → 3.9.6 | Clave de prueba (`CN=Android Debug`) |

## 1. Encontrá tu clave (recomendado)

Buscá en tu computadora o en Drive el archivo con el que firmaste la 3.2.1: termina en **`.jks`** o **`.keystore`**.
También necesitás el **alias** y la o las **contraseñas**.

Para comprobar que es la correcta (necesita Java):

```bash
keytool -list -v -keystore tu-clave.jks
```

Tiene que mostrar `Propietario: CN=Mi Quincena` y la huella SHA-256 `95:92:1C:5D:…:9D:CF`.

## 1-bis. Si no la encontrás: crear una nueva

```bash
keytool -genkeypair -keystore mi-quincena.jks -storetype PKCS12 -alias miquincena \
  -keyalg RSA -keysize 4096 -validity 10000 -dname "CN=Mi Quincena"
```

Guardá el archivo y la contraseña en **dos lugares seguros** (por ejemplo, un gestor de contraseñas y un pendrive).
Si se pierden, nunca más vas a poder actualizar la app sin desinstalar.

> Con una clave nueva hay que desinstalar **una sola vez**: exportá una copia, desinstalá, instalá la nueva versión y restaurá.

## 2. Cargarla en GitHub

1. Convertí el archivo a texto:
   - Linux/Mac: `base64 -w0 tu-clave.jks > clave.txt` (en Mac: `base64 -i tu-clave.jks -o clave.txt`)
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("tu-clave.jks")) > clave.txt`
2. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**, y creá:

| Nombre | Valor |
|---|---|
| `MQ_KEYSTORE_B64` | Todo el contenido de `clave.txt` |
| `MQ_KEY_ALIAS` | El alias (por ejemplo `miquincena`) |
| `MQ_KEY_PASS` | La contraseña de la clave |
| `MQ_STORE_PASS` | Solo si el archivo tiene otra contraseña distinta; si no, no lo crees |

3. Borrá `clave.txt` de tu computadora.

Desde ese momento, cada Release se firma con tu clave y las notas ya no muestran el aviso de “clave de prueba”.
**Nunca** subas el `.jks` ni las contraseñas al repositorio: el `.gitignore` ya los excluye.
