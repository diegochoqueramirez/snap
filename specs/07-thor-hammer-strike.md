# SPEC 07 — Carta de Thor con rayo

> **Status:** Implementado
> **Depends on:** SPEC 05
> **Date:** 2026-11-08
> **Objective:** Tematizar la carta `heavyStrike` con Thor (arte pixel art con nombre horneado) y un rayo que cae sobre Thanos al jugarla e inflige su daño de 13.

## Historial de cambios

- Versión aprobada: efecto de martillo que viaja desde la carta hasta Thanos (`hammerStrike`).
- Revisión tras la aprobación: el efecto pasa a un rayo que cae sobre Thanos desde arriba (`lightningStrike`). El martillo y su vuelo se eliminan. Lo pidió el usuario: un rayo se lee mejor como "caer" que un martillo que sube desde la mano.
- Revisión posterior: el rayo pasa a ser **azul** y su arte sale de `Referencias/rayo.gif`. El usuario no quiso la animación anterior (un zigzag CSS amarillo). Ahora es una tira pixel art de 5 cuadros, con el impacto en el centro de la carta de Thanos.
- Revisión posterior: la copia de Thor se oscurecía de golpe al empezar la secuencia, porque se marcaba como `disabled` y la regla `button.card:disabled` le bajaba la opacidad. Ahora la copia no se marca como deshabilitada.
- Revisión posterior: la copia de la carta tiene reverso. Durante el giro se ve el reverso de `Referencias/reverse_card.webp` (copiado a `assets/card-back.webp`), en lugar de la carta espejada.
- Revisión posterior: la salida de Thor cambia. La carta viaja al centro de la pantalla girando una vuelta (`rotateY`) mientras crece hasta 2.4× (700 ms, `ease-in-out`). La pantalla se oscurece (600 ms) y la lluvia aparece de a poco (900 ms), anticipando el rayo. Después la carta explota en el centro, y luego cae el rayo.
- Revisión posterior: el rayo cae desde el borde superior de la pantalla hasta el centro de Thanos, y no solo dentro de su carta. La caída usa `steps(5, end)` durante los mismos 300 ms que la tira de cuadros.
- Revisión posterior: la carta de Thor ya no desaparece de golpe. Primero crece (zoom suave, sin pixel art), explota sobre sí misma con una explosión pixel art sacada de `Referencias/explosion.gif`, y solo después cae el rayo.

## Por qué existe esta spec

La carta de Thor es la segunda carta tematizada del mazo. La spec 05 dejó el formato de carta de héroe (sprite, medallones de costo y valor, nombre horneado) y el sistema de efectos de carta. Esta spec la reutiliza para Thor y saca el efecto del `if` por nombre de sprite en `ui.js`, para que Iron Man y Hulk puedan sumarse después sin crecer ese `if`.

El plan completo de los tres héroes está en `docs/hero-cards-iron-man-thor-hulk.md`. Esta spec cubre solo Thor.

## Scope

**In:**

- La carta `heavyStrike` pasa a ser **Thor**. Mecánica idéntica: ataque, costo 2, valor 13, 2 copias en el mazo. Cambian nombre, descripción, arte y efecto.
- Arte completo de Thor en pixel art (sprite `thor`, 66×94, a ×2 = 132×188), remuestreado desde `Referencias/thor.webp` con un script fuera del repo, igual que Capitán América. Muestreo puntual (`NEAREST`), 24 colores como máximo, marco y fondo dentro del sprite, sin transparencias.
- El nombre "THOR" viene horneado en el arte, tal cual aparece en la referencia.
- Medallón azul de costo arriba a la izquierda y medallón naranja de daño arriba a la derecha, en HTML (igual que Capitán América, clase `.card--attack`).
- Salida de la carta: al jugar Thor, una copia visual de la carta viaja al centro de la pantalla, crece hasta 2.4× (sin salirse de la pantalla) y gira una vuelta (`rotateY`), con `ease-in-out` durante 700 ms. La copia tiene dos caras: el frente (la carta) y el reverso (`assets/card-back.webp`, girado 180° y con `backface-visibility: hidden`), así que la segunda mitad del giro muestra el reverso. Mientras tanto la pantalla se oscurece (`.scene-dim`, opacidad 0.78) y empieza a llover (`.scene-rain`, 70 gotas con `transform`, aparecen de a poco). Tras 150 ms, la copia se desvanece mientras aparece la explosión en el centro de la pantalla, escalada 1.1× el zoom. La explosión es una tira pixel art de 9 cuadros (sprite `cardExplosion`, 549×65 celdas, de `Referencias/explosion.gif`, con el humo final y fondo transparente) que se recorre con `steps()` en 900 ms.
- Orden: viaje y giro, oscurecimiento y lluvia, explosión, rayo y, al impacto, `is-hit`. La escena (oscuridad y lluvia) se apaga al terminar el rayo. La copia es solo visual: el daño y la mano ya se actualizaron al jugar la carta.
- Efecto `lightningStrike`: al jugar Thor, un rayo azul cae sobre Thanos. Es una tira pixel art de 5 cuadros (sprite `lightningStrike`, 250×46 celdas), sacada de `Referencias/rayo.gif` con fondo transparente; se recorre con `steps()`. Al llegar el impacto aparece `is-hit` en Thanos.
- Refactor del efecto: `card.effect` en `cards.js` y un mapa `CARD_EFFECTS` en `ui.js`. Se elimina el `if (card.sprite === 'captainAmerica')`. Capitán América pasa a tener `effect: 'shieldThrow'` y su comportamiento no cambia.
- Con `prefers-reduced-motion: reduce` no se crea el rayo; el golpe de Thanos sí se muestra.

**Out of scope (for future specs):**

- Tematizar Escudo (Iron Man) y Poción (Hulk). Van en specs propias.
- Cambiar costo, daño o copias de Thor.
- Cambios en `game.js` (reglas, daño, escudo, vida).
- Rayo que deja efectos extra (destello persistente, cadena a otras cartas, sacudida de pantalla).
- Animación de la carta en reposo, sonido.
- Cargar los archivos de `Referencias/` en el juego (solo son fuente).

## Data model

Cambios en `js/cards.js`. Sin estado de juego nuevo.

```js
const LIGHTNING_STRIKE_MS = 300; // duración total de la tira de 5 cuadros (60 ms por cuadro)
// En js/ui.js (presentación), no en cards.js:
const CARD_ZOOM_MS = 300; // zoom de la copia de la carta
const CARD_FADE_MS = 180; // desvanecimiento de la copia mientras crece la explosión
const EXPLOSION_MS = 900; // 9 cuadros de 100 ms

CARD_LIBRARY.heavyStrike = {
  name: 'Thor',
  type: CARD_TYPES.ATTACK,
  cost: 2,
  value: 13,
  description: 'Invoca un rayo: inflige 13 de daño.',
  sprite: 'thor',
  effect: 'lightningStrike',
};

CARD_LIBRARY.strike.effect = 'shieldThrow'; // único cambio en Capitán América
```

En `js/ui.js`, el mapa de efectos reemplaza al `if` por nombre de sprite:

```js
const CARD_EFFECTS = {
  shieldThrow: { play: throwShield, durationMs: SHIELD_THROW_MS },
  lightningStrike: { play: (fromRect, bossRect) => dropLightning(bossRect), durationMs: LIGHTNING_STRIKE_MS, exitFirst: true },
};
```

Convenciones:

- `card.effect` es opcional. Si existe y está en `CARD_EFFECTS`, `ui.js` la ejecuta al jugar la carta. Si no existe, no hay efecto visual (como hoy con las cartas genéricas).
- `durationMs` indica cuándo aparece `is-hit` en Thanos.
- `game.js` no cambia: `createCard` ya copia todos los campos de `CARD_LIBRARY`.
- La paleta vive en `js/sprites.js` (`THOR_PALETTE`), igual que `CAPTAIN_PALETTE`. No se agregan tokens a `:root`.

## Implementation plan

1. **Refactor de efectos sin cambio visual.** En `cards.js`, agregar `effect: 'shieldThrow'` a `strike`. En `ui.js`, agregar `CARD_EFFECTS` con `shieldThrow` y reemplazar el `if` por nombre de sprite por la búsqueda en el mapa. Prueba: `node --check` en los cuatro archivos JS y Capitán América lanza el escudo igual que antes.
2. **Rayo de Thor.** En `cards.js`, `heavyStrike` pasa a `name: 'Thor'`, la descripción nueva y `effect: 'lightningStrike'`, con `LIGHTNING_STRIKE_MS`. En `sprites.js`, agregar `LIGHTNING_PALETTE` (4 azules) y el sprite `lightningStrike`, la tira de 5 cuadros generada desde `Referencias/rayo.gif` con un script fuera del repo (fondo oscuro transparente). En `ui.js`, `dropLightning(bossRect)` crea un `span` `.lightning-strike` (ventana de 100×92 px) con el impacto en el centro de la carta de Thanos. El rayo empieza fuera del borde superior de la pantalla (`--travel` = −centro de Thanos) y baja con `@keyframes lightning-fall` (`steps(5, end)`), y lo quita en `animationend`. En `styles.css`, la tira se desliza con `@keyframes lightning-strike` (solo `transform`, `steps(5, end)`) aplicada al SVG interno. Se elimina `dropHammer`, `.hammer-drop` y el rayo CSS anterior. Prueba: jugar Thor hace 13 de daño, el rayo azul cae sobre Thanos y el golpe aparece al impacto.
4. **Salida de la carta.** En `ui.js`, `playCardExit(cardEl, fromRect, done)` clona la carta, la fija en su posición con `.card-ghost` y la lleva al centro con `@keyframes card-hero-zoom` (variables `--tx`, `--ty`, `--zoom`, `rotateY` de una vuelta). `startScene()` agrega `.scene-dim` y `.scene-rain` con 70 gotas. Al terminar el zoom, la copia se desvanece (`.is-fading`), se llama a `playExplosion(fromRect)` (un `span` `.card-explosion` centrado en la carta, con el sprite `cardExplosion` y `steps(9, end)`), y a los `EXPLOSION_MS` se ejecuta `done`. Para Thor, `CARD_EFFECTS.lightningStrike` lleva `exitFirst: true`, y `done` es el rayo. Prueba: al jugar Thor la carta crece, explota en su lugar y recién después cae el rayo; el golpe aparece al impacto.
3. **Sprite de Thor.** Con `Referencias/thor.webp` ya en el repo, generar la grilla de 94 filas de 66 caracteres y la paleta con un script fuera del repo. En `js/sprites.js`, agregar `THOR_PALETTE` y el sprite `thor`. En `cards.js`, `heavyStrike` pasa a `sprite: 'thor'`. Prueba: `createSpriteSvg('thor')` devuelve SVG sin errores, y la carta se ve con el marcado de carta de héroe de la spec 05.

## Acceptance criteria

- [x] `CARD_LIBRARY.heavyStrike` tiene nombre "Thor", costo 2, valor 13, `sprite: 'thor'` y `effect: 'lightningStrike'`.
- [x] `CARD_LIBRARY.strike` tiene `effect: 'shieldThrow'` y su nombre, costo y valor no cambian.
- [x] `ui.js` no tiene ningún `if` por nombre de sprite; el efecto sale de `card.effect` y de `CARD_EFFECTS`.
- [x] `CARD_LIBRARY` no tiene `name` duplicado en ninguna carta.
- [x] El sprite `thor` tiene 94 filas de 66 caracteres, y todos los caracteres existen en `THOR_PALETTE` (o son `.`).
- [x] La carta de Thor se ve como la referencia: arte completo, "THOR" horneado, medallón de costo (izquierda) y de daño (derecha, naranja).
- [x] Al jugar Thor, el rayo azul entra desde el borde superior de la pantalla y cae hasta el centro de Thanos (tira de 5 cuadros de `Referencias/rayo.gif`), y `is-hit` aparece al impacto.
- [x] Al jugar Thor, Thanos recibe exactamente 13 de daño (o lo que quede tras su escudo), igual que antes.
- [x] Al jugar Capitán América, el escudo sigue volando de la carta a Thanos igual que antes.
- [x] Con `prefers-reduced-motion: reduce` no se crea ningún `.lightning-strike` en el DOM y el golpe de Thanos sí aparece.
- [x] El rayo se quita del DOM en `animationend`.
- [x] Al jugar Thor, la carta viaja al centro, gira una vuelta y crece hasta 2.4× (sin pixel art), mientras la pantalla se oscurece y empieza a llover.
- [x] La lluvia aparece de a poco (no de golpe), y la escena se apaga al terminar el rayo.
- [x] Después del zoom aparece la explosión pixel art sobre el centro de la pantalla, antes de que empiece el rayo.
- [x] La explosión se quita del DOM al terminar, y la copia de la carta se quita al desvanecerse.
- [x] Con `prefers-reduced-motion: reduce` no hay copia de la carta, oscuridad, lluvia ni explosión: el rayo y el golpe se muestran como antes.
- [x] `game.js` no cambia (`git diff` no lo toca).
- [x] Los cuatro archivos JS pasan `node --check`.
- [x] El juego abre con `file://` sin errores en la consola.
- [x] A 375px de ancho la mano no desborda ni hay scroll horizontal.
- [x] Se puede jugar una partida completa (victoria y derrota incluidas).

## Decisions

- **Yes:** Thor ocupa `heavyStrike` (ataque). Es la carta de ataque grande y mantiene el balance actual.
- **Yes:** costo 2, valor 13 y 2 copias, sin cambios. Lo confirmó el usuario; solo cambia el arte.
- **Yes:** sprite generado desde `Referencias/thor.webp` con el mismo proceso que Capitán América (`NEAREST`, 24 colores). Lo eligió el usuario.
- **No:** dibujar la grilla a mano en `sprites.js`. Más lento y difícil de ajustar.
- **Yes:** el nombre "THOR" va horneado en el arte, como en la spec 05. Lo eligió el usuario.
- **Yes:** efecto propio de Thor, no el escudo. Lo eligió el usuario para distinguir al héroe.
- **Yes:** el efecto es un rayo que cae desde arriba sobre Thanos (revisión posterior a la aprobación). Lo pidió el usuario: la carta de Thor se lee mejor como "caer" que como un objeto que sube desde la mano. Reemplaza al martillo, que viajaba desde la carta.
- **No:** mantener el martillo con una caída vertical. Requeriría dibujar la caída igual, sin ganar nada frente al rayo.
- **Yes:** el rayo es pixel art azul sacado de `Referencias/rayo.gif`, en lugar de un zigzag CSS amarillo. Lo pidió el usuario: no le gustó la animación anterior y quiere azul con esa referencia.
- **Yes:** tira de 5 cuadros con `steps()` sobre el SVG, en lugar de una animación de caída. Así el rayo se ve como el GIF: baja, impacta y se disipa.
- **No:** sacar el rayo del GIF como imagen de fondo. El GIF trae un fondo azul-verde que tapa la carta; el sprite lo quita por brillo.
- **Yes:** mapa `CARD_EFFECTS` con `card.effect`, en lugar de sumar un `if` más. Lo eligió el usuario.
- **Yes:** Capitán América recibe `effect: 'shieldThrow'`. Es el único cambio en sus datos y no cambia su comportamiento.
- **No:** efecto del escudo para Thor. Ya lo usa Capitán América; no distinguiría a los héroes.
- **Yes:** con reducción de movimiento no se crea el rayo, igual que el escudo (spec 05): así no queda un nodo que nunca reciba `animationend`.
- **Yes:** la carta de Thor viaja al centro, gira y crece antes de explotar. Lo pidió el usuario para que no desaparezca de golpe. La interpretación del giro es una vuelta completa (`rotateY`).
- **Yes:** la pantalla se oscurece y empieza a llover antes de la explosión, para anticipar el rayo y hacer foco en la carta. Lo pidió el usuario.
- **Yes:** el reverso es la imagen de `Referencias/reverse_card.webp`, copiada a `assets/card-back.webp`. Lo pidió el usuario. Se copia en `assets/` y no se carga desde `Referencias/`, porque esa carpeta solo es fuente. Es el arte de Marvel Snap; conviene decidir antes de publicar el juego.
- **Yes:** la lluvia es de gotas con `transform` (no pixel art) y aparece de a poco. Así no corta de golpe.
- **Yes:** la explosión es pixel art de `Referencias/explosion.gif` (9 cuadros, con humo), y el zoom es suave. Lo pidió el usuario.
- **Yes:** la copia de la carta es visual; `game.js` y la mano se actualizan al jugar, sin esperar la animación. Así no cambia la lógica.
- **No:** cambiar costo, daño o copias de Thor en esta spec. Son decisiones de balance que se pueden ajustar en `cards.js` después.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Capitán América se rompe al quitar el `if` por sprite | El paso 1 lo prueba solo, antes de agregar nada de Thor. |
| El rayo y el escudo se superponen si se juegan en turnos seguidos | Cada uno se quita en `animationend` y no comparten estado. |
| El arte de Thor no se lee bien a 66×94 con 24 colores | Se revisa la grilla antes de integrarla; si no se lee, se ajusta la paleta del script, no el tamaño. |
| El rayo tapa la cara de Thanos al caer | Es temporal (300 ms), como el escudo. |
| Durante la secuencia de ~1.5 s el jugador puede jugar otra carta o terminar el turno | La lógica ya se aplicó; las animaciones pueden solaparse. Si molesta, se bloquea la mano durante la secuencia en una spec aparte. |
| Si Thor mata a Thanos, la pantalla final aparece antes de que termine la secuencia | Aceptado por ahora; se puede retrasar el render final en una spec aparte. |
| Si la carta de Thanos está cerca del borde superior, la parte alta del rayo queda fuera de pantalla | Es esperable: el rayo "entra" desde arriba. El impacto sí queda visible sobre el retrato. |

## What is **not** in this spec

- Escudo de Iron Man y Poción de Hulk.
- Cambios de costo, daño o copias de Thor.
- Cambios en `game.js` o en las reglas de daño, escudo y vida.
- Destello persistente, cadena de rayos, sonido o animación en reposo.

Cada uno de esos, si llega, va en su propia spec.
