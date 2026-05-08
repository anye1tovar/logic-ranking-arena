# Logic Ranking Arena

Aplicación web local para administrar y visualizar rankings dinámicos en tiempo real durante torneos, concursos y actividades presenciales.

El proyecto está pensado para operar en un solo computador, sin backend, sin autenticación y con sincronización en vivo entre una vista de control y una vista pública.

## Características

- Vista de administración en `/admin`
- Vista pública en `/viewer`
- Ranking dinámico con orden automático por puntos, victorias y actualización reciente
- Persistencia local con `localStorage`
- Sincronización entre pestañas y ventanas con `BroadcastChannel`
- Fallback de sincronización usando el evento `storage`
- UI arcade/esports con MUI, SCSS Modules y Framer Motion

## Stack

- React
- TypeScript
- Vite
- Zustand
- Material UI
- Sass
- Framer Motion

## Requisitos

- Node.js 20+ recomendado
- npm 10+ recomendado

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en la URL local que muestre Vite, normalmente `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

Los archivos compilados se generan en `dist/`.

## Uso

### Panel admin

Ruta: `/admin`

Desde esta vista puedes:

- editar el nombre y subtítulo del evento
- agregar jugadores
- sumar y restar puntos
- asignar victorias
- marcar jugadores como clasificados, eliminados o campeón
- reiniciar puntajes o reiniciar el evento completo

### Viewer público

Ruta: `/viewer`

Esta vista está pensada para:

- pantalla completa
- monitor externo
- TV o proyector

Muestra el torneo y el ranking en tiempo real sin controles de administración.

## Sincronización

Toda modificación del estado sigue este flujo:

1. actualiza Zustand
2. guarda el estado en `localStorage`
3. emite sincronización por `BroadcastChannel`
4. actualiza automáticamente otras pestañas o ventanas abiertas

Clave de persistencia:

```ts
logic-ranking-state
```

Canal principal:

```ts
logic-ranking
```

## Estructura principal

```text
src/
  app/
    admin/
    router/
    viewer/
  components/
    admin-panel/
    leaderboard/
    player-card/
    shared/
    tournament-header/
  hooks/
  store/
  styles/
  types/
  utils/
```

## Estado de la aplicación

Modelo principal:

- `event`
- `players`
- `updatedAt`

Cada jugador incluye:

- nombre
- puntos
- victorias
- estado
- racha
- timestamp de actualización

Estados soportados:

- `active`
- `classified`
- `eliminated`
- `champion`

## Notas

- El proyecto funciona completamente offline después de instalar dependencias.
- La compilación actual funciona correctamente con `npm run build`.
- Vite muestra una advertencia de tamaño de bundle no bloqueante; se puede optimizar después con code splitting si hace falta.
