# 📚 Biblioteca Digital

Una aplicación web completa para la gestión de préstamos de biblioteca, desarrollada con React, TypeScript, Firebase y TailwindCSS siguiendo el patrón de arquitectura MVVM.

## 🎯 Características

- **Gestión de Libros**: CRUD completo con validación de ISBN
- **Gestión de Socios**: Registro con validación de DNI y generación automática de número de socio
- **Sistema de Préstamos**: Registro de préstamos con control de disponibilidad y multas
- **Dashboard**: Resumen estadístico del sistema
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Responsive**: Interfaz adaptativa para móviles y desktop

## 🏗️ Arquitectura

### Patrón MVVM

- **Modelo**: Clases y repositorios que manejan la persistencia con Firebase Firestore
- **Vista**: Componentes React con TailwindCSS
- **ViewModel**: Hooks personalizados que gestionan la lógica de negocio

### Tecnologías Utilizadas

| Componente  | Tecnología                          | Función                        |
| ----------- | ----------------------------------- | ------------------------------ |
| Frontend    | React 18 + Vite + TypeScript        | UI moderna y reactiva          |
| Styling     | TailwindCSS 3.4                     | Diseño responsivo              |
| Backend     | Firebase (Firestore, Auth, Hosting) | Base de datos y hosting        |
| Estado      | Zustand                             | Manejo centralizado del estado |
| Ruteo       | React Router DOM                    | Navegación SPA                 |
| Formularios | React Hook Form + Zod               | Validación de formularios      |
| Iconos      | Heroicons                           | Iconografía consistente        |

## 📊 Modelo de Datos

### Colección `libros`

```typescript
{
  titulo: string;
  autor: string;
  isbn: string;
  estado: 'DISPONIBLE' | 'PRESTADO';
  fechaAlta: Timestamp;
}
```

### Colección `socios`

```typescript
{
  nombre: string;
  dni: string;
  numeroSocio: string;
  email: string;
  multasPendientes: number;
}
```

### Colección `prestamos`

```typescript
{
  idLibro: string;
  idSocio: string;
  fechaInicio: Timestamp;
  fechaDevolucionPrevista: Timestamp;
  fechaDevolucionReal?: Timestamp;
  estado: "ACTIVO" | "FINALIZADO" | "ATRASADO";
  multa: number;
}
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd biblioteca-digital
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database
3. Configurar las reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Para desarrollo - cambiar en producción
    }
  }
}
```

4. Copiar la configuración de Firebase a `src/services/firebaseConfig.ts`:

```typescript
const firebaseConfig = {
  apiKey: 'tu-api-key',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto-id',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: 'tu-app-id',
};
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── forms/           # Formularios (LibroForm, SocioForm, PrestamoForm)
│   ├── tables/          # Tablas de datos (LibrosTable, SociosTable, PrestamosTable)
│   ├── ui/              # Componentes base (Button, Card, Input, Modal)
│   └── layout/          # Componentes de layout (Sidebar, Header)
├── hooks/               # Custom hooks (useLibros, useSocios, usePrestamos)
├── models/              # Interfaces TypeScript (Libro, Socio, Prestamo)
├── pages/               # Páginas principales (Dashboard, Libros, Socios, Prestamos)
├── routes/              # Configuración de rutas (AppRouter)
├── services/            # Servicios Firebase (firebaseConfig, repositories)
├── store/               # Estado global (useAppStore)
└── App.tsx              # Componente principal
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia el servidor de desarrollo

# Construcción
npm run build            # Construye la aplicación para producción
npm run preview          # Previsualiza la build de producción

# Calidad de código
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Ejecuta ESLint y corrige errores automáticamente
npm run format           # Formatea el código con Prettier
npm run format:check     # Verifica el formato del código
```

## 🎨 Patrones de Diseño Implementados

### Creacional

- **Factory Method**: Para crear préstamos con valores predeterminados

### Estructural

- **Repository Pattern**: Para encapsular operaciones CRUD con Firestore

### Comportamiento

- **Observer**: Para notificaciones y cambios de estado

## 📋 Reglas de Negocio

1. **Libros**: Un libro solo puede estar prestado a un socio a la vez
2. **Socios**: No se puede registrar préstamo si el socio tiene multas pendientes
3. **Préstamos**: Duración fija de 7 días
4. **Multas**: Se generan automáticamente por libros dañados ($100)
5. **Validaciones**: No se permiten DNIs o números de socio duplicados

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 🚀 Despliegue

### Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login y configuración
firebase login
firebase init hosting

# Desplegar
npm run build
firebase deploy
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/comoquieras`)
3. Commit tus cambios (`git commit -m 'primer commit de comoquieras'`)
4. Push a la rama (`git push origin feature/comoquieras`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Axel Maidana** - _Desarrollo inicial_ - [axelmaidana](https://github.com/axelmaidana)

## 🙏 Agradecimientos

- Firebase por la plataforma backend
- TailwindCSS por el framework de estilos
- React por el framework frontend
- La comunidad de desarrolladores por las librerías utilizadas