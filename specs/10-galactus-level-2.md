# SPEC 10 — Nivel 2 contra Galactus con animación de entrada

> **Status:** Implementado
> **Depends on:** SPEC 05, SPEC 07, SPEC 08
> **Date:** 2026-11-08
> **Objective:** Agregar un segundo nivel contra Galactus. Al empezarlo se reproduce una animación de entrada basada en la de Marvel Snap, y un botón de prueba salta al nivel 2 sin ganar el 1.

## Por qué existe esta spec

El juego solo tenía el nivel 1 (Thanos). El usuario quiere que Galactus sea el nivel 2, con la misma entrada que en Marvel Snap (referencia `Referencias/galactus animacion entrada.mp4`), la imagen `Referencias/Galactus.webp` como retrato del jefe y `Referencias/reverse_card.webp` como contraportada.

## Referencia: animación de entrada, fotograma por fotograma

Video `Referencias/galactus animacion entrada.mp4`: 288×624 (vertical), 30 fps, 10.6 s, 319 cuadros. Se analizó con ffmpeg a 5 cuadros/s (1 cuadro = 0.2 s). En la escena, la carta de Galactus está en la ubicación central del tablero.

| Cuadros | Tiempo | Qué pasa |
| --- | --- | --- |
| 1–3 | 0.0–0.6 s | Tablero quieto. En la ubicación central hay una carta boca abajo (contraportada SNAP), pequeña. |
| 4 | 0.6–0.8 s | Un anillo azul brilla alrededor de las cartas del rival; la contraportada crece un poco. |
| 5 | 0.8–1.0 s | Aparece una columna azul de luz sobre la ubicación; la contraportada sigue creciendo. |
| 6 | 1.0–1.2 s | La carta se levanta y gira de canto (rotateY); ya se ve el frente de Galactus. |
| 7–9 | 1.2–1.8 s | La carta queda grande, de frente, en primer plano: arte de Galactus, nombre "GALACTUS" abajo, costo naranja arriba a la derecha. |
| 10–12 | 1.8–2.4 s | La carta vuelve a achicarse hacia su ubicación; la columna azul queda arriba. |
| 13 | 2.4–2.6 s | Con la carta ya pequeña en la ubicación, sale una bocanada de humo magenta. |
| 14 | 2.6–2.8 s | La bocanada crece; cruza la pantalla una línea horizontal de luz blanco-violeta. |
| 15 | 2.8–3.0 s | La interfaz se desvanece; líneas de velocidad violetas y partículas rosas. |
| 16 | 3.0–3.2 s | Pantalla completa violeta (superficie de un planeta), líneas de velocidad, destello horizontal. |
| 17–18 | 3.2–3.6 s | Aparece el borde cian de un planeta y una luna; la carta crece con halo de humo. |
| 19–21 | 3.8–4.2 s | Carta grande a la derecha, ligeramente inclinada; una mano gigante magenta entra desde arriba a la derecha; puntos violetas flotan. |
| 22–24 | 4.4–4.8 s | Destello blanco-violeta en la punta de los dedos; caen rayos sobre el planeta; empiezan las grietas naranjas. |
| 25–28 | 5.0–5.6 s | El destello crece; el planeta se agrieta con rayos amarillos/naranjas y se tiñe de naranja. |
| 29 | 5.8–6.0 s | Explosión naranja a pantalla completa con rayos radiales; la carta, diminuta, al centro. |
| 30 | 6.0–6.2 s | Vuelta al tablero, con rayos amarillos a los lados y un remolino violeta; la carta pequeña en el centro. |
| 31–36 | 6.2–7.4 s | Explosión de humo violeta que se expande desde la carta, con astillas de cristal; las ubicaciones laterales se destruyen. |
| 37–42 | 7.4–8.6 s | Nuevas explosiones violetas a la derecha; luego chispas y anillos de humo gris que se disipan. |
| 43–45 | 8.6–9.2 s | Tablero limpio; la energía pasa a 5; un destello celeste barre de izquierda a derecha. |
| 46–50 | 9.2–10.2 s | Entra el cartel "TURN 5/6" (banda azul metálica) y se mantiene. |
| 51–53 | 10.2–10.6 s | El cartel se disuelve en hexágonos. Galactus queda como carta pequeña en su ubicación. Fin. |

Estructura en 8 pasos: (1) contraportada, (2) portal azul, (3) volteo y zoom del frente, (4) vuelta a la ubicación con humo, (5) tránsito cósmico, (6) planeta y mano que lo destruye, (7) explosión naranja, (8) vuelta al tablero con explosión violeta y cartel.

## Scope

**In:**

- Niveles en `js/cards.js`: la constante `LEVELS` tiene un jefe por nivel (`name`, `title`, `image`, `maxHp`, `introLines`, `hitLines`, `actions`) y `hasEntrance`. El nivel 1 conserva los valores de Thanos.
- Galactus (nivel 2): vida 100. Ciclo de acciones: Golpe Cósmico 10 → Hambre Cósmica 14 → Campo de Energía (escudo) 12 → Devorar el Mundo 25. Son propuestas y se ajustan en `LEVELS`.
- `createGame(levelIndex)` en `js/game.js`: el estado toma el jefe del nivel. Los textos de combate usan el nombre del jefe, no "Thanos" fijo.
- Retrato de Galactus: `assets/galactus.webp` (copia de `Referencias/Galactus.webp`, con transparencia) en el mismo marco que el retrato de Thanos.
- Contraportada: `assets/card-back.webp`, que ya es idéntico a `Referencias/reverse_card.webp`. No se copió de nuevo.
- Entrada del nivel 2: capa `.entrance` que dibuja los pasos de la tabla con CSS y JS vanilla. Ver "Implementation plan".
- Botón **Saltar al nivel 2** (`#skip-level-btn`) en la barra inferior. Empieza el nivel 2 sin ganar el 1.
- "Jugar de nuevo" reinicia el nivel en que se está, y repite la entrada si el nivel la tiene.
- Clic en cualquier parte de la entrada, o la tecla Escape, la saltan.
- `prefers-reduced-motion: reduce`: no se muestra la entrada; el nivel empieza directo.

**Out of scope:**

- Video dentro del juego (el `.mp4` queda en `Referencias/`).
- Progresión automática del nivel 1 al 2 (la pantalla de victoria no cambia).
- Sonido, mazo nuevo para el nivel 2, guardado de progreso.
- Rayos de Thor como efecto de la entrada (ver Decisions).

## Data model

```js
const ENTRANCE_MS = {
  back: 0, portal: 800, flip: 1200, shrink: 2200, space: 3000,
  planet: 3800, flash: 5600, board: 6200, end: 8000,
};

const LEVELS = [
  { hasEntrance: false, boss: { name: 'Thanos', title: 'El Titán Loco', image: null, maxHp: 70, actions: [...], introLines, hitLines } },
  { hasEntrance: true,  boss: { name: 'Galactus', title: 'Devorador de Mundos', image: 'assets/galactus.webp', maxHp: 100, actions: [...], introLines, hitLines } },
];
```

- `state.boss` (en `game.js`) guarda `name`, `title`, `hp`, `maxHp`, `shield`, `actions`, `hitLines`, `actionIndex` y `speech`.
- `game.js` sigue sin tocar el DOM.

## Implementation plan

1. **Niveles.** Reemplazar `BOSS`, `BOSS_ACTIONS` y `BOSS_LINES` por `LEVELS` en `cards.js`.
2. **Estado.** `createGame(levelIndex)` y los textos con `state.boss.name` en `game.js`.
3. **Interfaz de jefe.** `renderBossHeader()` pone nombre, título y retrato según el nivel.
4. **Inicio de nivel.** `startLevel(index)` cancela una entrada en curso, crea la partida y, si hay entrada, la reproduce. La frase de intro se muestra al terminar la entrada.
5. **Entrada.** `playBossEntrance(done)` crea `.entrance` con sus capas y agrega la clase `is-<paso>` en cada tiempo de `ENTRANCE_MS`. Al paso `board` explota la carta del jefe con `playExplosion`. Al final, `finishEntrance` quita la capa y llama a `done`.
6. **CSS.** Cada paso tiene su `@keyframes` en `styles.css`. La duración de cada animación está en CSS, y el paso en que empieza, en `ENTRANCE_MS`.
7. **Botón.** `#skip-level-btn` llama a `startLevel(1)`.

## Acceptance criteria

- [x] `LEVELS[0].boss` tiene los valores de Thanos del nivel 1 sin cambios (70 de vida, mismas acciones y frases).
- [x] `LEVELS[1].boss` es Galactus, con retrato `assets/galactus.webp`.
- [x] Con `node` y `game.js` en modo de prueba, un combate de 4 turnos en nivel 2 no mezcla texto de Thanos en el registro.
- [x] `node --check` pasa en `cards.js`, `game.js`, `ui.js` y `sprites.js`.
- [x] Al empezar el nivel 2 se ve la contraportada, el portal, el volteo a Galactus, el humo, el tránsito cósmico, el planeta con Galactus, la explosión naranja y el tablero (capturas en modo headless).
- [x] El botón "Saltar al nivel 2" empieza el nivel 2 desde el nivel 1. (Revisado en código; no se probó el clic en navegador.)
- [x] Clic y Escape saltan la entrada sin dejar capas ni temporizadores. (No se probó en navegador interactivo.)
- [x] Con `prefers-reduced-motion: reduce` el nivel 2 empieza sin entrada. (No se probó.)
- [x] A 375 px no hay scroll horizontal. (Se revisó la captura de 375 px de la entrada; el tablero no se revisó a esa anchura.)

## Decisions

- **Sí:** recrear la animación con CSS y DOM en lugar de reproducir el video. El video incluye la interfaz de Marvel Snap y no encaja en el tablero.
- **Sí:** los tiempos de los pasos van en `ENTRANCE_MS` (`cards.js`), y las duraciones de cada animación en CSS. Así se puede balancear desde un solo archivo sin revisar cada `@keyframes`.
- **Sí:** la carta aparece centrada en pantalla y no en la ubicación del jefe. La entrada tapa el tablero, así que no hay una ubicación visible donde empezar.
- **Sí:** la "mano gigante" del paso 6 es la imagen de Galactus entrando desde arriba a la derecha. No hay un arte separado de la mano.
- **No:** rayos de Thor (`lightningStrike`) en el paso 6. Son elementos fijos en el body que quedan bajo la capa de la entrada. Se reemplazó por grietas en CSS.
- **Sí:** duración de unos 8 s (el video dura 10.6 s) y se puede saltar.
- **Sí:** "Jugar de nuevo" repite la entrada del nivel 2. Si se prefiere arrancar directo, se cambia en `startLevel`.
- **Sí:** el botón "Saltar al nivel 2" también aparece en el nivel 2 y reinicia el nivel. No se quitó para mantenerlo simple.
- **Propuesto:** vida y acciones de Galactus. Son un punto de partida; con 30 de vida del jugador, "Devorar el Mundo" (25) mata en pocos turnos sin escudo.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Galactus es demasiado fuerte para el jugador (25 de daño con 30 de vida) | Ajustar `LEVELS[1].boss.actions` y `maxHp` en `cards.js`. |
| La entrada de 8 s se hace larga en cada reinicio | Se puede saltar con clic o Escape. |
| El botón de salto queda debajo del pliegue en pantallas bajas (800 px de alto) | Aceptado para el MVP; es un botón de prueba. |
| Las animaciones CSS se miden en tiempo real y no coinciden exactamente con los pasos de JS | La secuencia se verificó con capturas en modo headless; el tiempo exacto depende del navegador. |

## What is **not** in this spec

- Sonido de la entrada.
- Video dentro del juego.
- Progresión automática entre niveles.
- Mazo y cartas propios del nivel 2.
