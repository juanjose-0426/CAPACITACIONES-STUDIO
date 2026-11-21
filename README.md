# 🎓 Guzmán Studio Entertainment — Plataforma LMS de Capacitación

Plataforma web privada de capacitación y aprendizaje (**LMS**) diseñada para la formación estructurada de **Modelos** y **Monitores** en **Guzmán Studio Entertainment**.

---

## ✨ Características Principales

- 🔐 **Autenticación y Roles (JWT):** Acceso seguro diferenciado para **Administradores**, **Modelos** y **Monitores**, con control de activación/desactivación de cuentas en tiempo real.
- 📚 **Gestión de Niveles y Módulos:** Creación y ordenamiento de niveles de capacitación segmentados por rol (`model`, `monitor` o `both`) y desbloqueo progresivo.
- 🎬 **Streaming de Video Propio (HTTP 206 Range Requests):** Reproducción fluida con adelanto/retroceso instantáneo para archivos `.mp4`, `.mov`, `.webm`, `.mkv`, `.avi` y `.m4v` (soporte de subida hasta **10 GB** por archivo).
- 📤 **Subida Múltiple y Drag & Drop:** Carga simultánea de múltiples videos y documentos PDF con barra de progreso en tiempo real y vinculación de archivos existentes en el servidor.
- 📝 **Evaluaciones y Quizzes Interactivos:** Cuestionarios de opción múltiple por contenido para validar el aprendizaje antes de avanzar de nivel.
- 📊 **Panel de Estadísticas y Progreso:** Seguimiento detallado del avance por usuario, materiales vistos y niveles completados.
- 🗄️ **Auto-Migración de Base de Datos:** Creación automática de la base de datos, las 6 tablas del sistema y el usuario administrador inicial al arrancar el servidor.

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, Lucide Icons |
| **Backend** | Node.js, Express 5, Multer 2 (Streaming & Uploads), JSON Web Tokens (JWT), Bcrypt.js |
| **Base de Datos** | MySQL 8 (`mysql2/promise` con pool de conexiones y migraciones automáticas) |

---

## 🚀 Instalación y Uso en Local

### 1. Requisitos previos
- **Node.js** (v18 o superior)
- **MySQL** (Laragon, XAMPP o MySQL Server en el puerto `3306`)

### 2. Clonar e instalar dependencias
```bash
git clone https://github.com/juanjose-0426/CAPACITACIONES-STUDIO.git
cd CAPACITACIONES-STUDIO
npm install
```
> El script `postinstall` instalará automáticamente las dependencias del `backend` y del `frontend` y compilará la interfaz web.

### 3. Variables de entorno (Opcional en local)
El backend utiliza por defecto la conexión estándar de Laragon/XAMPP (`localhost:3306`, usuario `root`, sin contraseña, base de datos `app_models`). Si deseas personalizarla, edita `app capacita/backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=app_models
JWT_SECRET=guzman_studio_jwt_secret_2026
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

### 🔑 Credenciales por defecto
- **Correo:** `admin@admin.com`
- **Contraseña:** `admin123`

---

## ☁️ Despliegue en Producción (Railway / VPS)

El servidor backend (`app capacita/backend/server.js`) está configurado para servir automáticamente la aplicación compilada de React (`app capacita/frontend/dist`), la API REST (`/api/*`) y el streaming multimedia (`/api/contents/stream/*`) en un único puerto.

### Despliegue rápido en Railway
1. Conecta el repositorio `juanjose-0426/CAPACITACIONES-STUDIO` en [Railway](https://railway.app).
2. Añade un servicio **MySQL** al proyecto.
3. En las variables del servicio web, agrega:
   - `MYSQL_URL` = `${{MySQL.MYSQL_URL}}`
   - `JWT_SECRET` = `tu_clave_secreta_segura`
4. Adjunta un **Volume** en la ruta `/app/app capacita/backend/uploads` para persistir los videos y PDFs subidos.
5. Genera el dominio público en **Settings → Networking → Generate Domain**.

---

## 📁 Estructura del Proyecto

```text
CAPACITACIONES-STUDIO/
├── package.json                 # Scripts raíz para producción y desarrollo
└── app capacita/
    ├── start.js                 # Lanzador concurrente para desarrollo local
    ├── database/
    │   └── schema.sql           # Esquema SQL de referencia
    ├── backend/
    │   ├── server.js            # Servidor Express + Hosting estático de producción
    │   ├── db.js                # Pool de conexiones MySQL (local y nube)
    │   ├── migrations.js        # Creación automática de BD, tablas y admin
    │   ├── controllers/         # Lógica de negocio (Auth, Niveles, Contenidos, Quizzes)
    │   ├── middlewares/         # Protección JWT y carga multimedia con Multer
    │   ├── routes/              # Endpoints de la API REST
    │   └── uploads/             # Almacenamiento de videos y PDFs
    └── frontend/
        ├── src/
        │   ├── context/         # Estado global de autenticación (AuthContext)
        │   ├── services/        # Cliente Axios e interceptores (api.js)
        │   └── pages/           # Vistas de Login, Panel Admin y Portal de Modelos/Monitores
        └── vite.config.js       # Configuración de compilación con Vite y Tailwind CSS
```
