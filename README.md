# Gestión de Proyectos — Instructivo de Ejecución

## 1. Requisitos previos

- **Node.js** (versión 18 o superior) — https://nodejs.org
- **MySQL** instalado y corriendo localmente (puerto 3306 por defecto)

Verifica que estén instalados:

```
node -v
npm -v
mysql --version
```

## 2. Crear la base de datos

Conéctate a MySQL con el usuario `root` y crea la base de datos vacía (las tablas las crea automáticamente Sequelize al iniciar el servidor):

```
mysql -u root -p
```

Dentro de la consola de MySQL:

```sql
CREATE DATABASE desarrollo_software_1;
```

> Si tu MySQL tiene una clave distinta a `desarrollo_software_1` para el usuario `root`, edita el archivo `.env.local` en la raíz del proyecto y ajusta `DB_PASSWORD` (y `DB_USER`/`DB_HOST`/`DB_PORT` si corresponde).

## 3. Instalar dependencias

Desde la raíz del proyecto (donde está `package.json`):

```
npm install
```

## 4. Levantar el servidor de desarrollo

```
npm run dev
```

Verás algo como `ready - started server on http://localhost:3000`. Al iniciar, la primera petición a login/registro sincroniza (`sequelize.sync()`) y crea las tablas `usuarios` y `proyectos` si no existen.

## 5. Probar el sistema

Abre el navegador en:

- **http://localhost:3000** → redirige automáticamente a `/login`
- **http://localhost:3000/register** → crear un usuario nuevo (nombre, correo, clave)
- **http://localhost:3000/login** → iniciar sesión con ese usuario

Al iniciar sesión correctamente, el servidor genera un JWT (se guarda en una cookie `httpOnly`) y te redirige a `/dashboard`, una página protegida por el middleware (`middleware.js`) que valida el token.

Si intentas entrar a `/dashboard` sin haber iniciado sesión (o borras la cookie), el middleware te redirige de vuelta a `/login`.

## 6. Probar la API directamente (opcional)

Con `curl` o Postman:

**Registro:**
```
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Juan Perez\",\"correo\":\"juan@test.com\",\"clave\":\"123456\"}"
```

**Login:**
```
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"correo\":\"juan@test.com\",\"clave\":\"123456\"}"
```

(Los comandos de arriba usan sintaxis de `cmd.exe`/PowerShell con `^` como salto de línea; en Git Bash usa `\` en su lugar.)

## 7. CRUD de Proyectos (requiere sesión iniciada)

Las rutas `/api/proyectos` están protegidas por el middleware: solo responden si viene la cookie `token` de una sesión válida (generada al hacer login). El campo `created_by` se completa automáticamente con el id del usuario autenticado, no se envía en el body.

Con `curl`, primero guarda la cookie de sesión con `-c` y luego reutilízala con `-b`:

**1. Login (guarda la cookie en `cookies.txt`):**
```
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"correo\":\"juan@test.com\",\"clave\":\"123456\"}"
```

**2. Crear proyecto:**
```
curl -b cookies.txt -X POST http://localhost:3000/api/proyectos ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Sistema Web\",\"fecha_inicio\":\"2026-01-15\",\"estado\":\"En curso\",\"responsable\":\"Juan Perez\",\"monto\":1500000}"
```

**3. Listar todos los proyectos:**
```
curl -b cookies.txt http://localhost:3000/api/proyectos
```

**4. Obtener un proyecto por id:**
```
curl -b cookies.txt http://localhost:3000/api/proyectos/1
```

**5. Actualizar un proyecto (solo los campos que envíes se actualizan):**
```
curl -b cookies.txt -X PUT http://localhost:3000/api/proyectos/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"estado\":\"Finalizado\"}"
```

**6. Eliminar un proyecto:**
```
curl -b cookies.txt -X DELETE http://localhost:3000/api/proyectos/1
```

Si llamas a cualquiera de estas rutas sin la cookie de sesión (o con un token vencido), responden `401 { "mensaje": "No autenticado" }` o `401 { "mensaje": "Token inválido o expirado" }`.

## 8. Colección de Bruno

En la carpeta `bruno/` hay una colección lista para [Bruno](https://www.usebruno.com/) con todas las rutas (Auth: Registrar/Iniciar Sesión; Proyectos: Listar/Crear/Obtener/Actualizar/Eliminar).

**Importar:**
1. Abre Bruno → `Open Collection` → selecciona la carpeta `bruno/` de este proyecto.
2. Selecciona el environment **Local** (arriba a la derecha) para cargar `baseUrl` (`http://localhost:3000`) y `proyectoId` (editable, por defecto `1`).

**Uso:**
1. Corre primero **Auth → Iniciar Sesion**. Bruno guarda automáticamente la cookie `token` que devuelve el login.
2. Con esa cookie activa, las requests de **Proyectos** ya quedan autenticadas (el `created_by` lo pone el servidor solo). Ejecuta **Crear Proyecto**, luego ajusta `proyectoId` en el environment con el id que te devolvió, y prueba **Obtener/Actualizar/Eliminar**.
3. Si no corres el login primero, las requests de Proyectos devuelven `401`.

## 9. Detener el servidor

`Ctrl + C` en la terminal donde corre `npm run dev`.

## Solución de problemas

- **Error de conexión a MySQL (`ECONNREFUSED` o `Access denied`)**: revisa que el servicio de MySQL esté corriendo y que `DB_USER`/`DB_PASSWORD` en `.env.local` sean correctos.
- **Puerto 3000 ocupado**: cierra la app que lo esté usando o corre `npm run dev -- -p 3001`.
- **Cambios en `.env.local` no toman efecto**: reinicia el servidor (`Ctrl+C` y `npm run dev` de nuevo); Next.js solo lee las variables de entorno al arrancar.
