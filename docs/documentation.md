# Logic Ranking Arena

## Documentación Técnica Completa MVP

### Sistema de Ranking Dinámico para Torneos y Concursos Presenciales

---

# 1. Introducción

## 1.1 Descripción General

Logic Ranking Arena es una aplicación web local diseñada para administrar y visualizar rankings dinámicos en tiempo real durante torneos, competencias y actividades presenciales.

El sistema está orientado principalmente a:

- juegos de mesa,
- concursos,
- dinámicas grupales,
- trivias,
- actividades competitivas,
- eventos de entretenimiento.

A diferencia de los sistemas tradicionales de brackets o árboles eliminatorios, este sistema se basa en:

- acumulación dinámica de puntos,
- clasificación flexible,
- actualización visual inmediata,
- rankings en tiempo real.

El organizador controla manualmente:

- quién gana,
- cuántos puntos recibe,
- quién clasifica,
- quién queda eliminado,
- y quién es el campeón final.

La experiencia debe sentirse como:

- un scoreboard competitivo,
- una arena arcade,
- un overlay de esports,
- un show interactivo en vivo.

---

# 1.2 Objetivo del MVP

Construir una aplicación:

- rápida,
- visual,
- completamente local,
- sin backend,
- sin autenticación,
- sin base de datos,
- fácil de operar en eventos físicos.

---

# 1.3 Alcance

El MVP incluirá:

✅ Creación de evento  
✅ Gestión de jugadores  
✅ Ranking dinámico  
✅ Asignación de puntos  
✅ Estados visuales  
✅ Pantalla pública fullscreen  
✅ Sincronización entre ventanas  
✅ Persistencia local  
✅ Animaciones fluidas

El MVP NO incluirá:

❌ Usuarios  
❌ Login  
❌ Backend  
❌ Base de datos  
❌ Multiusuario  
❌ Sincronización online  
❌ API externa

---

# 2. Arquitectura General

---

# 2.1 Stack Tecnológico

## Core

- React
- TypeScript
- Vite

---

## Estado Global

- Zustand

---

## Persistencia

- localStorage

---

## Comunicación entre ventanas/pestañas

- BroadcastChannel API

---

## UI Framework

- Material UI (MUI)

---

## Estilos

- Sass (SCSS Modules)

---

## Animaciones

- Framer Motion

---

## Partículas (Opcional)

- react-tsparticles

---

# 2.2 Filosofía Arquitectónica

La arquitectura deberá ser:

- modular,
- desacoplada,
- mantenible,
- extensible,
- performante.

El sistema deberá funcionar completamente offline en un único computador.

---

# 2.3 Arquitectura de Ejecución

La aplicación funcionará con dos vistas independientes:

| Vista  | Ruta      | Propósito          |
| ------ | --------- | ------------------ |
| Admin  | `/admin`  | Control del torneo |
| Viewer | `/viewer` | Pantalla pública   |

Ambas vistas deberán sincronizarse en tiempo real incluso si están:

- en ventanas diferentes,
- en monitores diferentes,
- fullscreen,
- en pestañas separadas.

---

# 3. Arquitectura Frontend

---

# 3.1 Estructura de Carpetas

```text
src/
│
├── app/
│   ├── admin/
│   ├── viewer/
│   └── router/
│
├── components/
│   ├── leaderboard/
│   ├── player-card/
│   ├── tournament-header/
│   ├── admin-panel/
│   ├── overlays/
│   ├── animations/
│   └── shared/
│
├── store/
│   ├── ranking-store.ts
│   ├── persistence.ts
│   └── sync-engine.ts
│
├── hooks/
│
├── services/
│
├── types/
│
├── utils/
│
├── styles/
│   ├── abstracts/
│   ├── base/
│   ├── themes/
│   └── globals/
│
└── assets/
```

---

# 3.2 Arquitectura de Estado

Zustand será el único source of truth.

Toda actualización:

1. modifica Zustand,
2. persiste en localStorage,
3. transmite cambios vía BroadcastChannel,
4. actualiza el viewer automáticamente.

---

# 3.3 Flujo de Sincronización

```text
Admin Action
    ↓
Zustand Update
    ↓
Persist localStorage
    ↓
BroadcastChannel.postMessage()
    ↓
Viewer receives event
    ↓
Viewer updates Zustand
    ↓
Animated UI update
```

---

# 4. Persistencia y Sincronización

---

# 4.1 localStorage

La aplicación deberá guardar automáticamente:

- evento,
- jugadores,
- puntajes,
- estados,
- configuración básica.

---

# 4.2 Key de Persistencia

```ts
logic - ranking - state;
```

---

# 4.3 Recuperación Automática

Al iniciar la aplicación:

- el estado anterior deberá restaurarse automáticamente.

---

# 4.4 BroadcastChannel

## Canal principal

```ts
new BroadcastChannel("logic-ranking");
```

---

# 4.5 Objetivo

Permitir sincronización instantánea entre:

- tabs,
- ventanas,
- fullscreen,
- monitores externos.

---

# 4.6 Fallback

Si BroadcastChannel no está disponible:

- usar sincronización vía evento `storage`.

---

# 5. Modelos de Datos

---

# 5.1 EventData

```ts
type EventData = {
  id: string;
  title: string;
  subtitle?: string;
  createdAt: number;
};
```

---

# 5.2 Player

```ts
type Player = {
  id: string;
  name: string;
  points: number;
  wins: number;
  status: PlayerStatus;
  streak?: number;
  updatedAt: number;
};
```

---

# 5.3 PlayerStatus

```ts
type PlayerStatus = "active" | "classified" | "eliminated" | "champion";
```

---

# 5.4 RankingState

```ts
type RankingState = {
  event: EventData;
  players: Player[];
};
```

---

# 6. Requerimientos Funcionales

---

# 6.1 Gestión de Evento

El sistema deberá permitir:

- crear nombre del torneo,
- editar nombre del torneo,
- agregar subtítulo,
- reiniciar evento.

---

# 6.2 Gestión de Participantes

El administrador podrá:

- agregar jugadores manualmente,
- editar jugadores,
- eliminar jugadores,
- reiniciar puntajes.

---

# 6.3 Sistema de Puntuación

El sistema deberá permitir:

- sumar puntos,
- restar puntos,
- asignar victorias,
- marcar clasificados,
- marcar eliminados,
- marcar campeón.

---

# 6.4 Ordenamiento Automático

El ranking deberá reorganizarse automáticamente usando:

1. puntos,
2. victorias,
3. updatedAt.

---

# 6.5 Viewer Público

La vista pública deberá mostrar:

- nombre del torneo,
- subtítulo,
- ranking dinámico,
- posiciones,
- estados visuales,
- animaciones.

---

# 6.6 Persistencia

Toda modificación deberá guardarse automáticamente.

---

# 6.7 Recuperación

Al reiniciar navegador:

- el torneo deberá restaurarse.

---

# 7. Requerimientos No Funcionales

---

# 7.1 Performance

La aplicación deberá:

- responder en menos de 100ms,
- mantener 60fps,
- soportar mínimo 300 jugadores.

---

# 7.2 Offline

La aplicación deberá funcionar:

- completamente offline.

---

# 7.3 Compatibilidad

Compatible con:

- Chrome,
- Edge,
- Firefox.

---

# 7.4 Escalabilidad

La arquitectura deberá permitir futuras integraciones:

- sonidos,
- overlays,
- avatars,
- estadísticas,
- OBS.

---

# 7.5 Mantenibilidad

El código deberá:

- ser modular,
- reusable,
- typed,
- desacoplado.

---

# 8. Diseño UI/UX

---

# 8.1 Identidad Visual

## Colores Oficiales Logic Escape Room

| Nombre          | HEX     |
| --------------- | ------- |
| Morado oscuro   | #1E1230 |
| Amarillo dorado | #F4C542 |
| Blanco          | #FFFFFF |
| Verde ácido     | #B7FF00 |

---

# 8.2 Sensación Visual

La aplicación debe sentirse:

- energética,
- tecnológica,
- moderna,
- arcade,
- competitiva,
- tipo esports.

NO debe sentirse:

- corporativa,
- administrativa,
- financiera.

---

# 8.3 Tema Visual

Inspiraciones:

- scoreboards competitivos,
- overlays de esports,
- arenas arcade,
- game shows modernos.

---

# 9. Arquitectura de Estilos

---

# 9.1 Sass Structure

```text
styles/
│
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _animations.scss
│   └── _breakpoints.scss
│
├── base/
│   ├── _reset.scss
│   ├── _globals.scss
│   └── _typography.scss
│
├── themes/
│   └── mui-theme.ts
│
└── main.scss
```

---

# 9.2 Variables Globales

```scss
$color-background: #1e1230;
$color-gold: #f4c542;
$color-white: #ffffff;
$color-acid: #b7ff00;

$color-card: #2a1847;
$color-card-hover: #37205c;

$shadow-gold: 0 0 20px rgba(244, 197, 66, 0.5);
$shadow-acid: 0 0 20px rgba(183, 255, 0, 0.5);

$radius-large: 20px;
$radius-medium: 14px;
```

---

# 10. Tema MUI

---

# 10.1 Configuración

MUI deberá:

- usar dark mode,
- respetar branding Logic,
- evitar apariencia empresarial tradicional.

---

# 10.2 Requerimientos Visuales

- bordes redondeados,
- botones grandes,
- sombras suaves,
- glow ligero,
- buena legibilidad.

---

# 11. Viewer Público

---

# 11.1 Objetivo

La pantalla pública debe:

- verse espectacular,
- ser legible a distancia,
- generar emoción visual.

---

# 11.2 Layout General

```text
┌────────────────────────────┐
│ TORNEO DE CATAN            │
│ Campeón de Campeones       │
├────────────────────────────┤
│ 🥇 Camilo ............ 12  │
│ 🥈 Laura ............. 10  │
│ 🥉 Andrés ............. 9  │
│ 4. Sergio ............. 7  │
│ 5. Vale ............... 5  │
└────────────────────────────┘
```

---

# 11.3 Fondo

El fondo deberá incluir:

- gradientes oscuros,
- profundidad visual,
- iluminación sutil,
- partículas opcionales.

NO usar:

- fondos recargados,
- ruido visual,
- texturas pesadas.

---

# 12. Player Cards

---

# 12.1 Estructura

Cada jugador deberá renderizarse como una card horizontal.

---

# 12.2 Información

La card mostrará:

- posición,
- nombre,
- puntaje,
- badges,
- estado.

---

# 12.3 Top 3

Los primeros lugares deberán tener:

- tamaño ligeramente superior,
- glow dorado,
- mayor jerarquía visual.

---

# 13. Estados Visuales

---

# 13.1 Active

- fondo morado,
- borde tenue,
- brillo mínimo.

---

# 13.2 Classified

- borde verde ácido,
- glow verde suave.

---

# 13.3 Eliminated

- grayscale,
- opacity 0.4,
- saturación reducida.

---

# 13.4 Champion

- glow dorado intenso,
- partículas ligeras,
- badge especial,
- escala levemente mayor.

---

# 14. Animaciones

---

# 14.1 Filosofía

Las animaciones deben sentirse:

- suaves,
- modernas,
- rápidas,
- teatrales.

Nunca:

- exageradas,
- lentas,
- distractoras.

---

# 14.2 Librería Principal

Usar:

- Framer Motion.

---

# 14.3 Ranking Reordering

Cuando cambia el ranking:

- las cards deben deslizarse suavemente,
- evitar saltos bruscos.

---

# 14.4 Configuración Esperada

```ts
transition={{
  layout: {
    duration: 0.4,
    ease: "easeInOut"
  }
}}
```

---

# 14.5 Point Increase Animation

Al sumar puntos:

- el puntaje escala,
- cambia temporalmente a dorado,
- aparece floating text:
  - +1
  - +3

---

# 14.6 Floating Text

Comportamiento:

- aparece sobre la card,
- asciende,
- fade out,
- duración:
  - 800ms.

---

# 14.7 Champion Animation

Al marcar campeón:

- glow dorado pulsante,
- badge CHAMPION,
- partículas ligeras,
- ligera expansión.

---

# 14.8 Eliminated Animation

Al eliminar jugador:

- fade gradual,
- reducción de opacidad,
- grayscale,
- ligera reducción de tamaño.

---

# 15. Admin UX

---

# 15.1 Prioridades

El admin debe:

- operar rápido,
- minimizar clics,
- actualizar fácilmente.

---

# 15.2 Acciones Rápidas

Cada card tendrá:

- +1
- +3
- -1
- classify
- eliminate
- champion

---

# 15.3 Confirmaciones

NO usar:

- modales innecesarios,
- confirmaciones excesivas.

Las acciones deben ser:

- instantáneas,
- reversibles.

---

# 16. Fullscreen Experience

---

# 16.1 Viewer

La vista `/viewer` deberá:

- ocultar controles,
- verse correctamente en TV/proyector,
- priorizar legibilidad.

---

# 16.2 Resoluciones Objetivo

Optimizar principalmente para:

- 1920x1080,
- pantallas grandes,
- proyectores.

---

# 17. Performance

---

# 17.1 Requerimientos

Mantener:

- 60fps,
- render eficiente,
- actualizaciones fluidas.

---

# 17.2 Estrategias

Usar:

- React.memo,
- selectors Zustand,
- memoization.

---

# 17.3 Evitar

NO usar:

- box-shadows gigantes,
- blur excesivo,
- partículas permanentes pesadas.

---

# 18. Roadmap Futuro

Posibles expansiones:

- avatars,
- sonidos,
- overlays OBS,
- QR público,
- estadísticas,
- temporadas,
- exportación,
- múltiples torneos.

---

# 19. Resultado Esperado

La aplicación final debe sentirse como:

> “una mezcla entre arena arcade, scoreboard competitivo y show interactivo en vivo”.

Debe transmitir:

- emoción,
- claridad,
- energía,
- competitividad,
- identidad visual fuerte de Logic Escape Room.
