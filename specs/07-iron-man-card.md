# SPEC 07 — Carta de Iron Man con escudo sobre las cartas hero

> **Status:** aprobado
> **Depends on:** SPEC 05
> **Date:** 2026-11-08
> **Objective:** Convertir la carta `shield` en Iron Man (costo 2, 11 de escudo) con el formato hero de SPEC 05 y un escudo hexagonal animado que aparece y se desvanece sobre las cartas hero de la mano al jugarla.

## Por qué existe esta spec

`docs/hero-cards-iron-man-thor-hulk.md` propone tematizar Thor, Iron Man y Hulk. Se empieza solo por Iron Man para probar el formato con una carta de defensa.
Con un segundo héroe, el `if (card.sprite === 'captainAmerica')` de `ui.js` ya no escala. Esta spec lo reemplaza por un efecto asociado a la carta (`card.effect`), para que Thor y Hulk después solo agreguen una entrada.

## Historial de cambios

- Revisión durante la implementación (Paso 3): el CSS existente ponía el valor de las cartas hero de defensa a la izquierda, debajo del costo, y en naranja (`.card--defense .card__value`), y no en azul arriba a la derecha como dice esta spec. El usuario eligió lo que dice la spec: `.card--defense .card__value` ahora solo pone `background: var(--defense)` y se quitó su posición propia (también en ≤560px). Esa regla solo afecta a cartas hero, y no había ninguna de defensa antes.
- Revisión tras el Paso 4: el usuario agregó `Referencias/iron man escudo.mp4` (burbuja de hexágonos en pixel art, 800×800, 0.5s, fondo oscuro opaco `#090a15`) y pidió usarla como el escudo, sobre todas las cartas de superhéroes y con desvanecimiento. Antes estaban fuera de alcance el patrón hexagonal y cargar archivos de `Referencias/`. El usuario eligió meterlo en esta misma spec. El video **reemplaza** la barrera azul del Paso 4, aparece solo sobre las cartas **hero** de la mano, y entra y sale con desvanecimiento. El Paso 4 queda reemplazado por el Paso 5.
- Revisión tras el Paso 5: el usuario pidió que el escudo **se quede** en las cartas hero "hasta que Thanos destruya nuestra defensa" y que **rodee toda la carta**. La mano no se descarta al terminar el turno (las cartas siguen en la mano durante el turno de Thanos) y `player.shield` vuelve a 0 al empezar el turno siguiente. Por eso el escudo se dibuja según el estado: se ve mientras `game.player.shield > 0` y se desvanece cuando vuelve a 0, después del ataque de Thanos. El video es un óvalo que envuelve la carta (más grande que ella y estirado a su proporción). Entra con fade-in, sigue en bucle y sale con fade-out. Lo dibuja `renderHand()`, no un efecto de carta: Iron Man ya no tiene `effect` y se elimina `ironBarrier`. El Paso 5 queda reemplazado por el Paso 6.
- Revisión durante el Paso 6: con `<video>` + `mix-blend-mode: screen` se veía un rectángulo negro alrededor del óvalo en cartas deshabilitadas (opacidad + gris) y con el mouse encima (se levantan): esos estados aíslan la mezcla y el fondo opaco del video aparece. Además el fondo `#090a15` no es negro puro y dejaba un rectángulo leve. El usuario eligió convertir el video en una **tira PNG transparente**: los 5 cuadros del video (10 cuadros/s) a 80×80, con la luminosidad como opacidad (el fondo queda transparente, el relleno translúcido y las líneas opacas). Se anima con CSS `steps(5)`. El `.mp4` deja de usarse y no se copia a `assets/`.

## Scope

**In:**

- La carta `shield` pasa a ser **Iron Man**: tipo `defense`, costo 2 (antes 1), valor 11 (antes 7), 2 copias en el mazo (sin cambio).
- El valor 11 bloquea por completo el "Golpe del Guantelete" de Thanos (11).
- Carta completa en pixel art (sprite `ironMan`, 66×94 a ×2 = 132×188), remuestreada desde `Referencias/iron man pixel art.jpg` con un script fuera del repo, igual que SPEC 05:
  - Muestreo puntual (`NEAREST`) y cuantización a ~24 colores.
  - Sin transparencias: marco y fondo van dentro del sprite.
  - El nombre "IRON MAN" va horneado en el arte. El recorte es más ancho que el marco para que el nombre entre; se acepta un estiramiento horizontal leve, como en Capitán América.
  - Los medallones de la referencia (5 y 0) se borran del arte y se rellenan con el fondo cercano.
- Paleta `IRON_MAN_PALETTE` en `js/sprites.js`.
- Medallón de costo (izquierda) y de valor (derecha) en HTML, con el marcado hero existente (`heroCardMarkup`). El valor usa el color de defensa (`.card--defense .card__value`, ya existe).
- Refactor de efectos: cada carta hero declara `effect` en `CARD_LIBRARY` y `ui.js` lo busca en un objeto `CARD_EFFECTS`.
  - `strike` (Capitán América) → `effect: 'shieldThrow'`. Se comporta igual que hoy.
  - `shield` (Iron Man) no tiene `effect`: su escudo lo dibuja `renderHand()` según el estado.
  - Las cartas sin `effect` siguen como hoy: si Thanos pierde vida o escudo, se muestra `is-hit`.
- Escudo de Iron Man: mientras `game.player.shield > 0`, el escudo hexagonal envuelve **cada carta hero de la mano** (las que tienen `sprite`). Las cartas genéricas no lo muestran.
  - Aparece con fade-in cuando el escudo pasa de 0 a más de 0 (al jugar Iron Man).
  - Se queda, con la animación en bucle, mientras dure el escudo: también al jugar otras cartas, al terminar el turno y durante la espera del turno de Thanos. Las cartas que ya lo tenían no repiten el fade-in.
  - Se desvanece con fade-out cuando el escudo vuelve a 0 (después del turno de Thanos) y se quita del DOM en `animationend`.
  - Al reiniciar la partida no queda escudo ni hay fade-out.
  - Tira PNG transparente `assets/iron-man-shield.png` (400×80: 5 cuadros de 80×80), sacada de `Referencias/iron man escudo.mp4` con un script fuera del repo (`Referencias/` sigue siendo solo fuente).
  - Un `<span class="card__shield">` por carta hero, con la tira de fondo (`background-size: 500% 100%`) y `@keyframes iron-shield-frames` que avanza los cuadros con `steps(5)` en 500ms, en bucle.
  - Forma: óvalo que envuelve la carta. La tira se estira a la proporción de la carta y sobresale `--shield-overflow: 38%` por lado, así el óvalo (80% del cuadro) pasa por las esquinas de la carta.
  - Fondo transparente en la tira: no hace falta `mix-blend-mode` y se ve igual en cartas deshabilitadas o con el mouse encima.
  - Fade-in y fade-out de `IRON_SHIELD_FADE_MS = 300` con opacidad a saltos (`steps()`).
  - `pointer-events: none`: no bloquea los clics a las cartas ni a la interfaz que tape.
  - Thanos no reacciona (no hay `is-hit`): Iron Man no le hace daño.
  - Con `prefers-reduced-motion: reduce` no se crea ningún `.card__shield`.
- Constante `IRON_SHIELD_FADE_MS = 300` en `cards.js`. La ruta de la tira vive en `styles.css`.
- Se elimina la barrera azul del Paso 4 (`.hand::after`, `is-barrier`, `IRON_BARRIER_MS`), el efecto `ironBarrier` e `IRON_SHIELD_MS`.

**Out of scope (for future specs):**

- Thor (`heavyStrike`) y Hulk (`potion`): siguen genéricos y con sus valores actuales.
- Rayo repulsor hacia Thanos.
- Destello en el panel del jugador.
- Escudo sobre las cartas genéricas o sobre el panel del jugador.
- Animación de la burbuja "rompiéndose" cuando Thanos la destruye.
- Sonido del escudo.
- Cambios en `game.js` o en las reglas de daño, escudo o vida.
- Cambios en `STARTER_DECK`.
- Sonido y animación de la carta en reposo.
- Cargar archivos de `Referencias/` en el juego (la tira del escudo se genera a `assets/`).

## Data model

Cambios en `js/cards.js`. Sin estado de juego nuevo.

```js
const IRON_SHIELD_FADE_MS = 300; // fade-in y fade-out del escudo de Iron Man

CARD_LIBRARY.strike = {
  // ...igual que hoy...
  sprite: 'captainAmerica',
  effect: 'shieldThrow',
};

CARD_LIBRARY.shield = {
  name: 'Iron Man',
  type: CARD_TYPES.DEFENSE,
  cost: 2,
  value: 11,
  description: 'Activa su armadura: ganas 11 de escudo hasta tu próximo turno.',
  sprite: 'ironMan',
  // Sin `effect`: el escudo lo dibuja renderHand() mientras player.shield > 0.
};
```

En `js/ui.js`:

```js
// Efecto visual de cada carta hero. La lógica ya se aplicó en game.js.
const CARD_EFFECTS = {
  shieldThrow: ({ fromRect, bossHit }) => { /* throwShield + is-hit al llegar */ },
};

let heroShieldShown = false; // si en el render anterior había escudo (decide fade-in, fijo o fade-out)
```

Convenciones:

- `card.effect` es opcional. Si no existe, `handleHandClick` hace lo de hoy (`is-hit` si Thanos recibió daño).
- Cada efecto recibe `{ fromRect, bossHit }` y decide si muestra el golpe de Thanos.
- `game.js` no cambia: `createCard` ya copia todos los campos de `CARD_LIBRARY`.
- El escudo sale del estado (`game.player.shield > 0`), no de un evento: como `render()` reconstruye la mano, `renderHand()` vuelve a poner los escudos en cada render. `heroShieldShown` decide el modo de cada escudo: `in` (0 → >0), fijo (>0 → >0) u `out` (>0 → 0).
- La duración del fade llega al CSS como variable `--shield-fade` inline desde `IRON_SHIELD_FADE_MS`. No se usa `animation-duration` inline porque cada escudo tiene dos animaciones (cuadros y fade).
- `handleHandClick` llama a `render()` antes del efecto (cambio del Paso 5, se mantiene). `fromRect` se mide antes de jugar la carta, así que `shieldThrow` no cambia.
- `IRON_MAN_PALETTE` vive en `js/sprites.js`, como `CAPTAIN_CARD_PALETTE`. No se agregan tokens a `:root`.

## Implementation plan

1. Refactor de efectos sin cambio visible. En `cards.js`, agregar `effect: 'shieldThrow'` a `strike`. En `ui.js`, crear `CARD_EFFECTS` con `shieldThrow` (mueve la lógica actual de `throwShield` + `setTimeout` de `is-hit`). `handleHandClick` llama `CARD_EFFECTS[card.effect]` si existe; si no, `is-hit` como hoy. Se elimina el `if` por nombre de sprite. Prueba: Capitán América lanza el escudo igual que antes y Golpe pesado sigue mostrando `is-hit`.
2. Datos de Iron Man. En `cards.js`, `shield` pasa a nombre `Iron Man`, costo 2, valor 11, descripción nueva, `effect: 'ironBarrier'`, y se agrega `IRON_BARRIER_MS`. Sin `sprite` todavía. Agregar `ironBarrier` a `CARD_EFFECTS` como función vacía. Prueba: la carta genérica dice Iron Man, cuesta 2, da 11 de escudo, y el Golpe del Guantelete no quita vida.
3. Sprite. Remuestrear `Referencias/iron man pixel art.jpg` a 66×94 con un script fuera del repo. En `sprites.js`, agregar `IRON_MAN_PALETTE` y el sprite `ironMan`. En `cards.js`, agregar `sprite: 'ironMan'` a `shield`. Prueba: la carta se ve como la referencia, con medallón de costo 2 a la izquierda y de valor 11 (azul) a la derecha, y el nombre abajo.
4. Barrera. En `styles.css`, `.hand` pasa a `position: relative`; `.hand::after` oculto por defecto y `.hand.is-barrier::after` con el borde, el fondo y `@keyframes iron-barrier` (parpadeo con `steps()`, duración `var(--barrier-ms)`). En `ui.js`, `ironBarrier` pone `--barrier-ms`, aplica `flash(els.hand, 'is-barrier')` (salvo con movimiento reducido) y `is-barrier` se quita en `animationend` de `#hand`. Prueba: al jugar Iron Man la barrera cubre la mano ~600ms y desaparece; se puede jugar otra carta durante la barrera. **Reemplazado por el Paso 5.**
5. Escudo con video. Copiar `Referencias/iron man escudo.mp4` a `assets/iron-man-shield.mp4`. En `cards.js`, cambiar `IRON_BARRIER_MS` por `IRON_SHIELD_MS` e `IRON_SHIELD_VIDEO`. En `styles.css`, eliminar `.hand::after`, `.hand.is-barrier::after` y `@keyframes iron-barrier`; agregar `.card__shield` (absoluto, `inset: 0`, `object-fit: contain`, `mix-blend-mode: screen`, `pointer-events: none`) y `@keyframes iron-shield-fade` (opacidad 0 → 1 → 1 → 0 con `steps()`). En `ui.js`, `ironBarrier` crea un video por cada `.card--hero` de `#hand` (salvo con movimiento reducido) y lo quita en `animationend`; `handleHandClick` llama a `render()` antes del efecto. Prueba: con Capitán América en la mano, al jugar Iron Man aparece la burbuja sobre Capitán América, se desvanece en ~1s y el video se quita del DOM; las cartas genéricas no la muestran. **Reemplazado por el Paso 6.**
6. Escudo fijo que envuelve la carta. En `cards.js`, quitar `effect` de `shield` y cambiar `IRON_SHIELD_MS` por `IRON_SHIELD_FADE_MS = 300`. En `ui.js`, eliminar `ironBarrier`; agregar `heroShieldShown` y, al final de `renderHand()`, poner un `.card__shield` en cada `.card--hero` en modo `in`, fijo u `out` según `game.player.shield` y `heroShieldShown` (ninguno con movimiento reducido); los `out` se quitan en `animationend`; `handleRestart` pone `heroShieldShown = false`. En `styles.css`, `.card__shield` con `inset: calc(-1 * var(--shield-overflow))`, la tira `assets/iron-man-shield.png` de fondo animada con `@keyframes iron-shield-frames` (`steps(5)`), y las clases `.card__shield--in` / `.card__shield--out` con `@keyframes iron-shield-in` / `iron-shield-out`. Prueba: al jugar Iron Man aparece el óvalo alrededor de las cartas hero; sigue al jugar otra carta y al terminar el turno; tras el ataque de Thanos se desvanece; al reiniciar no aparece.

## Acceptance criteria

- [ ] `CARD_LIBRARY.shield` tiene nombre `Iron Man`, tipo `defense`, costo 2, valor 11, `sprite: 'ironMan'` y no tiene `effect`.
- [ ] `CARD_LIBRARY.strike` tiene `effect: 'shieldThrow'`; el resto de sus campos no cambia.
- [ ] `STARTER_DECK` no cambia (2 copias de `shield`).
- [ ] `heavyStrike` y `potion` no cambian.
- [ ] `ironMan` tiene 94 filas de 66 caracteres y todos sus caracteres existen en `IRON_MAN_PALETTE` (o son `.`).
- [ ] `ui.js` no tiene ningún `if` por nombre de sprite; los efectos salen de `card.effect` y `CARD_EFFECTS`.
- [ ] `IRON_SHIELD_FADE_MS` está en `cards.js`; `IRON_BARRIER_MS`, `IRON_SHIELD_MS` e `IRON_SHIELD_VIDEO` ya no existen.
- [ ] `assets/iron-man-shield.png` existe (400×80, fondo transparente), no hay `.mp4` en `assets/` y el juego no carga nada de `Referencias/`.
- [ ] La carta de Iron Man se ve como la referencia: arte completo, medallón de costo (izquierda), medallón de valor azul (derecha), "IRON MAN" abajo.
- [ ] Jugar Iron Man descuenta 2 de energía y suma 11 al escudo del jugador.
- [ ] Con 11 de escudo, el Golpe del Guantelete (11) no quita vida al jugador.
- [ ] Al jugar Iron Man aparece con fade-in un óvalo de hexágonos que envuelve cada carta hero de la mano, y ninguna carta genérica lo muestra.
- [ ] El óvalo sigue visible al jugar otra carta, al terminar el turno y mientras se espera el turno de Thanos, sin repetir el fade-in.
- [ ] Después del turno de Thanos (escudo en 0) el óvalo se desvanece y no queda ningún `.card__shield` en el DOM.
- [ ] Al reiniciar la partida no hay óvalo.
- [ ] Alrededor del óvalo no se ve ningún rectángulo, tampoco en cartas deshabilitadas ni con el mouse encima.
- [ ] Durante el escudo se puede hacer clic en las cartas de la mano.
- [ ] Al jugar Iron Man, Thanos no tiembla.
- [ ] Con `prefers-reduced-motion: reduce` no se crea ningún `.card__shield`.
- [ ] No queda `.hand::after`, `is-barrier` ni `iron-barrier` en el CSS ni en `ui.js`.
- [ ] Capitán América lanza el escudo y Thanos tiembla al llegar, igual que antes.
- [ ] Golpe pesado sigue mostrando `is-hit` en Thanos al jugarse.
- [ ] A 375px la mano no desborda ni hay scroll horizontal.
- [ ] Los archivos JS pasan `node --check`.
- [ ] El juego abre con `file://` sin errores en la consola.
- [ ] Se puede jugar una partida completa (jugar cartas, terminar turno, Thanos actúa, victoria y derrota).

## Decisions

- **Yes:** solo Iron Man en esta spec. Lo eligió el usuario; Thor y Hulk van en specs propias.
- **No:** una sola spec para los tres héroes.
- **Yes:** costo 2 y valor 11. Son los números de `docs/hero-cards-iron-man-thor-hulk.md`; 11 bloquea justo el Golpe del Guantelete.
- **No:** mantener costo 1 y valor 7.
- **Yes:** 2 copias, sin tocar `STARTER_DECK`.
- **Yes:** referencia `Referencias/iron man pixel art.jpg`, la que puso el usuario. Tiene el mismo formato que la de Capitán América.
- **Yes:** refactor a `card.effect` + `CARD_EFFECTS` ahora. Lo eligió el usuario; con dos héroes el `if` por sprite ya no escala.
- **No:** agregar un `else if` para Iron Man.
- **Yes:** barrera azul sobre toda la mano. El usuario pidió una animación de defensa que cubra todas sus cartas; es más coherente con una carta de defensa que un disparo.
- **No:** rayo repulsor hacia Thanos. Se eligió primero y luego lo reemplazó la barrera; un rayo sugiere daño que no existe.
- **No:** rayo + barrera. Más código sin ganar claridad.
- **Yes:** destello corto (600ms), sin estado nuevo. El escudo se gasta en el turno de Thanos, cuando la mano ya se descartó, así que una barrera persistente casi no se vería.
- **No:** barrera mientras `player.shield > 0`.
- **Yes:** borde de 4px + capa azul semitransparente con `steps()`, como pseudo-elemento de `#hand`. Solo CSS, sin nodos nuevos y fiel al estilo pixel.
- **No:** patrón hexagonal. Necesita un sprite o fondo dibujado.
- **Yes:** el destello azul es la barrera sobre la mano, no un destello en el panel del jugador. Un solo efecto se lee mejor.
- **Yes:** Thanos no tiembla. Iron Man no le hace daño.
- **Yes:** con movimiento reducido no se muestra la barrera. La regla global anula animaciones y `animationend` no llegaría, así que `ui.js` no agrega la clase.
- **Yes:** la duración vive en `cards.js` y llega al CSS por `--barrier-ms`. Un solo lugar para balancear, como `SHIELD_THROW_MS`.
- **Yes:** video `iron man escudo.mp4` como escudo (reemplaza las cuatro decisiones de la barrera de arriba). Lo pidió el usuario tras el Paso 4.
- **Yes:** meterlo en esta spec y no en una nueva. Lo eligió el usuario.
- **Yes:** el video reemplaza la barrera azul. Un solo efecto se lee mejor.
- **No:** barrera + video.
- **Yes:** solo sobre las cartas hero de la mano. Lo eligió el usuario. Thor y Hulk lo van a mostrar solos cuando tengan `sprite`.
- **No:** también sobre las cartas genéricas.
- **Yes:** aparece y se desvanece en ~1s total, con el video en bucle mientras dura. El video solo dura 0.5s.
- **No:** quedarse hasta el fin del turno. Mismo motivo que la barrera: el escudo se usa cuando la mano ya se descartó.
- **Yes:** el video se copia a `assets/`. `Referencias/` es solo fuente y su nombre tiene espacios.
- **Yes:** `mix-blend-mode: screen` en vez de reexportar el video con transparencia. El fondo es casi negro, así que `screen` lo borra sin herramientas extra (no hay ffmpeg en la máquina).
- **Yes:** opacidad con `steps()` para el desvanecimiento. Mantiene el estilo a saltos del resto de las animaciones.
- **Yes:** `render()` antes del efecto en `handleHandClick`. Si no, `render()` reconstruye la mano y borra los videos recién creados.
- **Corrección:** las decisiones de arriba que dicen "la mano ya se descartó" son falsas: la mano se conserva durante el turno de Thanos. Por eso ahora sí tiene sentido un escudo que se queda.
- **Yes:** el escudo se queda hasta que Thanos destruye la defensa (lo pidió el usuario). Se implementa como `player.shield > 0`: tras el turno de Thanos el escudo siempre queda en 0 (se gasta o se reinicia al empezar el turno).
- **No:** el aparece-y-se-va de ~1s del Paso 5. Reemplazado por el escudo fijo.
- **Yes:** lo dibuja `renderHand()` según el estado, no un efecto de carta. Así sobrevive a cada `render()` y no se corta al jugar otra carta. Iron Man ya no necesita `effect`.
- **Yes:** óvalo que envuelve la carta (lo eligió el usuario), estirado a la proporción de la carta y con 38% de sobresalida por lado. El círculo ocupa el 80% del cuadro; con 38% el óvalo pasa por las esquinas (√2 / 0.8 ≈ 1.77 veces la carta).
- **No:** óvalo justo al borde (deja las esquinas afuera) ni rectángulo de hexágonos (pierde la forma de burbuja).
- **Yes:** fade-in, bucle y fade-out (lo eligió el usuario). Las cartas que ya tenían escudo no repiten el fade-in.
- **No:** fade-in y quedarse en el último cuadro.
- **Yes:** tira PNG transparente en vez de `<video>` + `mix-blend-mode: screen` (reemplaza las decisiones de arriba sobre copiar el `.mp4` y usar `screen`). Lo eligió el usuario: el `screen` mostraba rectángulos en cartas deshabilitadas y con el mouse encima.
- **No:** cambiar cómo se atenúan o levantan las cartas para salvar el `screen`. Toca estilos de las cartas y dejaba un rectángulo leve por el fondo `#090a15`.
- **Yes:** la luminosidad como opacidad al sacar los cuadros. El resultado sobre la carta se parece a `screen`: líneas opacas y relleno translúcido.
- **Yes:** 5 cuadros de 80×80. El video va a 10 cuadros/s (0.5s) y su arte está en bloques de 10px.
- **Yes:** animación de cuadros con `steps(5)`. Es como se animan el resto de los sprites del juego.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Iron Man a costo 2 hace la mano lenta (3 de energía por turno) | Probar partidas completas; si es lento, se ajusta en `cards.js` en otra spec. |
| Si no queda ninguna carta hero en la mano, al jugar Iron Man no se ve ningún escudo | Aceptado: es la regla que eligió el usuario. El escudo sube igual en el panel. Si molesta, se ajusta en otra revisión. |
| Cada `render()` recrea los escudos y el bucle vuelve a empezar | El bucle dura 0.5s; el salto casi no se nota. |
| El óvalo sobresale ~50px a los lados y ~70px arriba y abajo, encima de las cartas vecinas y de la barra de vida o el botón de terminar turno | El relleno es translúcido y `pointer-events: none`; se puede achicar cambiando `--shield-overflow`. |
| El óvalo que sobresale genera scroll horizontal a 375px | Se prueba a 375px; si pasa, se recorta con `overflow-x: clip` en el contenedor del tablero. |
| Al empezar el turno, las cartas nuevas que se roban también muestran el fade-out | Aceptado: dura 300ms. |
| El escudo tapa las cartas y bloquea clics | `pointer-events: none` en `.card__shield`. |
| En cartas deshabilitadas el escudo se ve atenuado | La opacidad de la carta se aplica a todo su contenido; se acepta, marca que la carta no se puede jugar. |
| En ≤560px el sprite se escala a 96×136 (no entero) | Igual que Capitán América; aceptado para el MVP. |
| El refactor rompe el escudo de Capitán América | El paso 1 se prueba solo, antes de tocar Iron Man. |

## What is **not** in this spec

- Thor y Hulk.
- Rayo repulsor hacia Thanos o destello en el panel.
- Escudo sobre cartas genéricas o en el panel, o animación de la burbuja rompiéndose.
- Sonido del escudo.
- Cambios en `game.js`, `STARTER_DECK` o las reglas.
- Sonido y animación de la carta en reposo.

Cada uno de esos, si llega, va en su propia spec.
