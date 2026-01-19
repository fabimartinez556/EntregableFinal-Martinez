App E-commerce React Native + Firebase (Expo)

Aplicación móvil tipo e-commerce desarrollada con React Native (Expo), Redux Toolkit y Firebase.
Permite autenticación, listado de productos, carrito con persistencia, creación de órdenes con control de stock en tiempo real y registro de ubicación (Location) en cada compra (modo delivery).

🚀 Tecnologías

Expo / React Native

Redux Toolkit (@reduxjs/toolkit, react-redux)

React Navigation

Firebase (firebase)

Expo Location (expo-location)

Expo SQLite (expo-sqlite)

AsyncStorage (@react-native-async-storage/async-storage)

📦 Funcionalidades principales
🔐 Autenticación

Login / Registro con Firebase Authentication

Manejo de sesión en Redux (authSlice)

Persistencia de sesión en móviles (AsyncStorage)

🛍️ Productos (Firestore)

Listado de productos desde colección productos

Visualización de stock disponible

No permite agregar al carrito si supera stock

Actualización automática del stock luego de una compra

🛒 Carrito

Agregar / eliminar productos

Persistencia local (AsyncStorage)

Total calculado con useMemo

Modal de confirmación al eliminar

Toasts (éxito/error/info)

🧾 Órdenes (Realtime DB + Firestore Transaction)

Se guardan por usuario en Realtime DB: orders/{userId}

Validación y descuento de stock mediante Firestore Transactions

Listado de órdenes por usuario autenticado

Cada orden incluye:

items, total, email

shipping.method: delivery o pickup

createdAt, status, statusHistory

location + mapUrl (solo en delivery)

📍 Ubicación (Location)

En delivery se exige ubicación (lat/lng)

Se guarda:

coordenadas

mapUrl (Google Static Maps)

addressText (reverse geocoding best-effort)

En pickup no se pide ubicación

💾 Persistencia (SQLite)

Cache local de:

productos

órdenes por usuario

Implementación multiplataforma:

iOS/Android: SQLite

Web: localStorage

📂 Estructura del proyecto
src/
├── components/
│   ├── Header.js
│   ├── ScreenContainer.js
│   ├── ConfirmModal.js
│   ├── Toast.js
│   ├── EmptyState.js 
│   └── Price.js
│   └── Segmented.js             
│             │
├── navigation/
│   ├── AuthStack.js
│   ├── HomeStack.js
│   ├── BottomTabs.js
│   └── Navigator.js
│
├── screens/
│   ├── HomeScreen.jsx / .js
│   ├── CartScreen.js
│   ├── OrdersScreen.js
│   ├── LoginScreen.js
│   └── LocationScreen.js 
│
├── store/
│   ├── store.js
│   ├── authSlice.js
│   ├── authThunks.js
│   ├── productsSlice.js
│   ├── productsThunks.js
│   ├── cartSlice.js
│   ├── cartThunks.js
│   ├── ordersSlice.js
│   ├── ordersThunks.js
│   └── uiSlice.js
│
├── firebase/
│   └── firebaseConfig.js
│
├── services/
│   └── LocationService.js
│
├── data/
│   └── database/
│       ├── database.js        (index/bridge por Platform)
│       ├── database.native.js (SQLite)
│       └── database.web.js    (localStorage)
│
└── config/
    └── googleMaps.js

⚙️ Configuración previa (Firebase + Google Maps)
1) Firebase

Crear un proyecto en Firebase y habilitar:

Authentication → Email/Password

Firestore Database

Realtime Database

Colección en Firestore:

productos (documentos con al menos):

title (string)

price (number)

stock (number)

image (string url, opcional)

category (string, opcional)

Realtime Database:

se usa ruta orders/{userId}/...

2) Variables de configuración

Editar:

src/firebase/firebaseConfig.js

completar apiKey, authDomain, projectId, databaseURL, etc.

src/config/googleMaps.js

colocar la API key:

export const GOOGLE_MAPS_API_KEY = "TU_API_KEY";


Importante:

Para Static Maps y Geocoding, la API key debe tener habilitado:

Maps Static API

Geocoding API (opcional, solo para addressText)

▶️ Cómo correr el proyecto

Instalar dependencias:

npm install


Ejecutar:

npx expo start


Atajos:

Web: npx expo start --web

Android: npx expo start --android

iOS: npx expo start --ios

📱 Permisos de ubicación
iOS / Android

La app solicita permisos con expo-location al momento de finalizar compra en delivery.

Si el usuario niega el permiso, no se permite finalizar la compra en delivery.

Web

Se usa navigator.geolocation.
Recomendación: ejecutar en localhost o https, porque algunos navegadores bloquean geolocalización en contextos inseguros.

🧠 Manejo de estado (Redux Toolkit)

Slices:

authSlice: usuario (uid/email), loading, error

productsSlice: listado de productos, loading, error

cartSlice: items + quantity

ordersSlice: órdenes, loading, error

uiSlice: toast global

Thunks principales:

fetchProducts: trae productos desde Firestore (con cache)

addToCartAndPersist / removeFromCartAndPersist: carrito + AsyncStorage

createOrder: transacción de stock (Firestore) + guardar orden (Realtime DB)

fetchOrders: trae órdenes del usuario (cache → realtime)

🔒 Control de stock (Firestore Transaction)

Al confirmar compra:

Se leen todos los productos del carrito dentro de una transacción.

Se valida stock disponible.

Se actualiza stock (writes) SOLO después de completar todas las lecturas.

Se crea la orden en Realtime DB.

Esto evita stock negativo y conflictos por compras simultáneas.

💾 Persistencia (SQLite / Web fallback)

iOS/Android: expo-sqlite guarda cache local de productos/órdenes.

Web: localStorage (misma API, distinta implementación).

La app inicializa DB en AppContent con initDb().

✅ Optimización de listas / UX

FlatList con:

initialNumToRender

windowSize

removeClippedSubviews

Componentes reutilizables:

Header, ScreenContainer, ConfirmModal, Toast

UX:

Loader durante checkout

Toasts para feedback

Modal de confirmación al eliminar del carrito

🧪 Posibles mejoras (opcionales)

Pantalla “Detalle de Orden”

Estados avanzados (enviado/entregado) + panel admin

Pagos (MercadoPago/Stripe)

Mejorar UI con tarjetas + íconos

Reglas de seguridad Firebase más estrictas (producción)

👤 Autor

Fabián Martínez
Proyecto académico / práctica avanzada con foco en arquitectura, Redux Toolkit, Firebase, persistencia y permisos del dispositivo.