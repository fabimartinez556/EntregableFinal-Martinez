🛒 App E-commerce React Native + Firebase

Aplicación mobile de e-commerce desarrollada con React Native, Redux Toolkit y Firebase.
Permite a los usuarios autenticarse, navegar productos, gestionar un carrito, realizar compras
con control de stock en tiempo real y visualizar sus órdenes asociadas a una ubicación.

---

🚀 Tecnologías usadas

- React Native (Expo)
- Redux Toolkit
- React Navigation
- Firebase
  - Authentication
  - Firestore
  - Realtime Database
- AsyncStorage
- JavaScript (ES6+)

---

📦 Funcionalidades principales

🔐 Autenticación

- Login con Firebase Authentication
- Persistencia de sesión
- Navegación condicional (AuthStack / AppStack)

🛍️ Productos

- Listado de productos desde Firestore
- Visualización de stock en tiempo real
- Bloqueo de compra si no hay stock
- Actualización automática del stock luego de una compra

🛒 Carrito

- Agregar / eliminar productos
- Persistencia en AsyncStorage
- Cálculo automático del total
- Vaciado inmediato tras confirmar la compra

🧾 Órdenes

- Creación de órdenes en Firebase Realtime Database
- Validación y descuento de stock mediante Firestore Transactions
- Listado de órdenes por usuario autenticado
- Cada orden incluye:
  - Productos comprados
  - Total
  - Email del usuario
  - Ubicación geográfica y dirección
  - Fecha de creación
  - Estado de la orden
- Órdenes ordenadas por fecha (más recientes primero)

📍 Ubicación

- Solicitud de permisos de ubicación al usuario
- Obtención de coordenadas GPS
- Reverse geocoding para mostrar dirección legible
- Asociación de la ubicación a cada orden

🔔 Experiencia de Usuario (UX)

- Toasts tipo e-commerce (éxito / error)
- Modal de confirmación para eliminar productos
- Loader durante procesos críticos
- Manejo de errores centralizado

---

🧠 Arquitectura Redux

Slices

- authSlice → usuario y sesión
- productsSlice → productos y stock
- cartSlice → carrito
- ordersSlice → órdenes
- uiSlice → toasts y loaders globales

Thunks

- fetchProducts
- fetchOrders
- createOrder (con Firestore Transactions)
- loadCart
- saveCart

---

🔒 Seguridad de stock

- El stock se valida y descuenta usando Firestore Transactions
- No permite:
  - Stock negativo
  - Compras simultáneas inconsistentes
- El stock se refresca automáticamente tras cada compra

---

📂 Estructura del proyecto

src/
├── components/
│   ├── Header
│   ├── ScreenContainer
│   ├── ConfirmModal
│   ├── Toast
│   └── Categories
│
├── navigation/
│   ├── AuthStack
│   ├── HomeStack
│   ├── BottomTabs
│   └── Navigator
│
├── screens/
│   ├── HomeScreen
│   ├── CartScreen
│   ├── OrdersScreen
│   ├── LoginScreen
│   └── LocationScreen
│
├── store/
│   ├── authSlice
│   ├── authThunks
│   ├── cartSlice
│   ├── cartThunks
│   ├── ordersSlice
│   ├── ordersThunks
│   ├── productsSlice
│   ├── productsThunks
│   ├── uiSlice
│   └── store.js
│
├── firebase/
│   └── firebaseConfig.js
│
├── services/
│   └── LocationService.js
├── config/
│   └── googleMaps.js

---




▶️ Cómo correr el proyecto

1. Instalar dependencias

npm install

2. Iniciar Expo

npx expo start

3. Configurar Firebase

- Crear proyecto en Firebase
- Habilitar Authentication, Firestore y Realtime Database
- Copiar credenciales en firebaseConfig.js

---

🧩 Próximas mejoras posibles

- Detalle de orden con lista completa de productos
- Estados de orden (pendiente / enviado / entregado)
- Perfil de usuario
- Pasarela de pagos
- Panel de administración
- Animaciones y skeleton loaders

---

✍️ Autor

Desarrollado por Fabián Martínez  
Proyecto de práctica avanzada con foco en arquitectura limpia,
UX real y manejo correcto de estado, stock y persistencia.
