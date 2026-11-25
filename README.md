# BancoXYZ – Prueba técnica React

Aplicación de banca en línea: login, consulta de saldo, transferencias (inmediatas o agendadas a una fecha futura) e historial con filtros por destinatario, valor y fecha.

## Stack

- Create React App + TypeScript
- React Router
- `fetch` nativo con un helper `request()` tipado
- Context API para la sesión; estado local en el resto
- Tailwind CSS v3 (la versión que CRA 5 soporta sin configuración extra): utilidades en el JSX y unas pocas clases reutilizables (`btn`, `input`, `card`, `alert-*`) en `src/index.css`
- Jest + React Testing Library (incluidos en CRA)

## Requisitos

- Node.js 18 o superior
- pnpm (la versión está fijada en `packageManager` de `package.json`). Para activarlo:

```bash
corepack enable
```

## Instalación

```bash
pnpm install
```

## Ejecución

```bash
pnpm start
```

Abre [http://localhost:3000](http://localhost:3000).

> Los endpoints de la API no envían cabeceras CORS, así que el servidor de desarrollo los reenvía desde `/api/*` (ver `src/setupProxy.js`, que solo permite las 4 rutas de la prueba). Por eso la app debe ejecutarse con `pnpm start`. Un `pnpm build` servido como estático necesitaría un proxy equivalente.

## Tests

```bash
pnpm test           # modo watch
CI=true pnpm test   # una sola ejecución
```

Cubren: login (válido e inválido), redirección sin sesión, saldo (éxito, error y descuento de transferencias), formulario de transferencia (validaciones, body enviado, fecha agendada, saldo insuficiente) y la función de filtros.

## Usuarios de prueba

| Email | Contraseña |
|---|---|
| gabriel@topaz.com | 1111 |
| alejo@topaz.com | 2222 |
| wilson@topaz.com | 3333 |

## Estructura

```
src/
  api.ts         URLs, tipos y llamadas a la API
  auth/          AuthContext y ProtectedRoute
  pages/         Login, Inicio, Transferir, Historial
  components/    Navbar, BalanceCard, TransferForm, TransferFilters
  utils/         formato, filtros y transferencias locales
```

## Decisiones técnicas

- **Context solo para auth:** es el único estado compartido; el resto vive en cada página.
- **`fetch` sin Axios:** un helper agrega el token `Bearer`, lanza error si la respuesta no es OK y cierra la sesión ante un 401.
- **Sesión en `localStorage`:** sobrevive al refresh.
- **Filtros en el cliente:** la API no los ofrece. Están en una función pura (`filterTransfers`) testeada por separado.
- **Fechas en hora local:** "hoy" se calcula en formato `YYYY-MM-DD` local (no con `toISOString()`, que usa UTC).
- **Transferencias locales:** la API no persiste las transferencias creadas (`/transferList` siempre devuelve los mismos datos y `/balance` no cambia). Para que el flujo crear → listar sea demostrable, cada transferencia exitosa se guarda en `localStorage` por usuario: aparece en el historial, y las que ya están vencidas se descuentan del saldo mostrado y del disponible para transferir.

## Mejoras futuras

- Guardar el token en una cookie `httpOnly` emitida por el backend, en lugar de `localStorage`.
- Persistir las transferencias en el servidor y eliminar la capa local.
- Descontar también las transferencias agendadas del saldo disponible.
- Paginación y filtros en el servidor para historiales grandes.
