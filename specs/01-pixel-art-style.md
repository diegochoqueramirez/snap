# SPEC 01 — Estilo pixel art

> **Status:** Implementado
> **Depends on:** —
> **Date:** 2026-11-08
> **Objective:** Dar al juego un estilo visual pixel art con CSS de bordes duros, fuente pixel local, animaciones escalonadas y sprites SVG para los tipos de carta y Thanos.

## Por qué existe esta spec

Hoy la UI usa bordes redondeados, gradientes, sombras difusas y emojis.
El objetivo es una estética retro coherente sin romper las reglas del proyecto: sin dependencias externas y funcionando con `file://`.

## Scope

**In:**

- Fuente pixel **Press Start 2P** (licencia OFL) guardada en `assets/fonts/` y cargada con `@font-face`, usada en toda la UI.
- Tamaños de fuente en múltiplos de 8px (8 / 16 / 24) y ajuste de cartas y registro para que el texto quepa.
- Reestilizado de `css/styles.css`: sin `border-radius`, sin gradientes, bordes sólidos gruesos, sombras duras desplazadas sin blur.
- Costo de carta, pips de energía y badges como cuadrados, no círculos.
- Animaciones y transiciones con `steps()` (temblor, pulso, hover de carta, barras de vida).
- Se mantiene la paleta de colores actual de `:root` (morado/dorado/rojo/azul/verde).
- Nuevo `js/sprites.js` con sprites pixel art dibujados como grillas y renderizados como SVG inline.
- Sprites de los tres tipos de carta (`attack`, `defense`, `heal`), usados en el arte de la carta y en la intención de Thanos.
- Retrato pixel art original de Thanos (titán morado con casco y guantelete) que reemplaza el gradiente y las gemas actuales.
- La versión responsive (≤560px) sigue funcionando sin scroll horizontal.

**Out of scope (for future specs):**

- Sprites para el badge de escudo (`🛡️` en `renderShield`) y los pips de energía: se quedan como texto/CSS.
- Favicon pixel art: se mantiene el `💎` actual.
- Paleta retro restringida (ej. 16 colores).
- Archivos PNG o sprite sheets externos.
- Sonido, música o efectos de partículas.
- Cambios en reglas, balance o lógica de `game.js`.

## Data model

Nuevo archivo `js/sprites.js`, cargado entre `game.js` y `ui.js`. Solo presentación: no lee ni modifica el estado del juego.

```js
// Cada sprite es una grilla de caracteres; cada carácter mapea a un color de su paleta.
// '.' = transparente.
const SPRITES = {
  attack:  { palette: { r: '#e5534b', w: '#eee9ff', k: '#0d0b16' }, pixels: ['....kk..', /* ... */] },
  defense: { palette: { /* ... */ }, pixels: [/* 16 filas de 16 */] },
  heal:    { palette: { /* ... */ }, pixels: [/* 16 filas de 16 */] },
  thanos:  { palette: { /* ... */ }, pixels: [/* 32 filas de 32 */] },
};

// Devuelve un string <svg> con un <rect> por pixel no transparente,
// viewBox del tamaño de la grilla y shape-rendering="crispEdges".
function createSpriteSvg(name) { /* ... */ }
```

Convenciones:

- Íconos de tipo de carta: grilla de 16×16.
- Retrato de Thanos: grilla de 32×32.
- Las claves de `SPRITES` para los íconos coinciden con los valores de `CARD_TYPES` (`attack`, `defense`, `heal`).
- El SVG escala por CSS a múltiplos enteros del tamaño de la grilla (ej. 16→48px, 32→128px).
- Los colores de las paletas reutilizan los valores de `:root` en `styles.css`.

Fuente:

- `assets/fonts/PressStart2P-Regular.ttf` (o `.woff2` si está disponible en la fuente oficial).
- `assets/fonts/OFL.txt` con la licencia.
- `font-family: "Press Start 2P", monospace;` con `font-display: swap`.

Tokens nuevos en `:root`:

```css
--font-sm: 8px;
--font-md: 16px;
--font-lg: 24px;
--pixel: 4px;          /* grosor de borde y desplazamiento de sombra */
--shadow-hard: var(--pixel) var(--pixel) 0 #000;
```

`CARD_TYPE_ICONS` se elimina de `js/cards.js` porque deja de usarse.

## Implementation plan

1. Descargar Press Start 2P y su `OFL.txt` a `assets/fonts/`. Agregar `@font-face` y los tokens `--font-*` en `css/styles.css`. Aplicar la fuente al `body` con fallback `monospace`. Prueba: abrir `index.html` con `file://` y ver la fuente pixel.
2. Ajustar tamaños de texto a los tokens (8px descripciones, registro, etiquetas y botones; 16px nombre de Thanos, costos y vida; 24px título del overlay). Ensanchar cartas si el texto no cabe. Prueba: ningún texto se sale de su carta.
3. Reestilizar a pixel: `border-radius: 0` en todo, quitar gradientes por colores planos, bordes `var(--pixel)` sólidos, sombras `--shadow-hard`, costo y pips cuadrados, quitar `backdrop-filter` del overlay. Prueba: no queda ningún borde redondeado ni gradiente visible.
4. Pasar animaciones y transiciones a `steps()`: `shake`, `pulse`, hover de carta y `width` de `.bar__fill`. Mantener el bloque `prefers-reduced-motion`. Prueba: recibir daño muestra un temblor a saltos.
5. Crear `js/sprites.js` con `createSpriteSvg` y los sprites `attack`, `defense`, `heal`. Agregar `<script src="js/sprites.js">` entre `game.js` y `ui.js`. En `ui.js`, usar `createSpriteSvg(card.type)` en `.card__art` y en `.intent__name`. Eliminar `CARD_TYPE_ICONS` de `cards.js`. Prueba: las cartas y la intención muestran los íconos pixel.
6. Agregar el sprite `thanos` y reemplazar el contenido de `.boss-art` en `index.html` (gemas) por el retrato generado desde `ui.js`. Eliminar el CSS de `.boss-art__gems` y `.gem*`. Prueba: la carta de Thanos muestra el retrato pixel.
7. Revisar el bloque responsive (≤560px): tamaños de cartas, sprites y fuente. Prueba: a 375px de ancho no hay scroll horizontal.

## Acceptance criteria

- [x] El juego abre con `file://` sin errores en la consola.
- [x] Todo el texto visible usa Press Start 2P y la fuente se carga desde `assets/fonts/`, sin peticiones a internet.
- [x] Si se borra el archivo de fuente, el juego sigue funcionando con `monospace`.
- [x] Todos los tamaños de fuente en `styles.css` son 8, 16 o 24px.
- [x] Ningún elemento tiene `border-radius` distinto de 0.
- [x] `styles.css` no contiene `linear-gradient` ni `radial-gradient`.
- [x] Ninguna `box-shadow` tiene blur distinto de 0.
- [x] Todas las `animation` y `transition` usan `steps()`.
- [x] Las cartas de ataque, defensa y curación muestran su sprite SVG pixel y no emojis.
- [x] La intención de Thanos muestra el sprite del tipo de su próxima acción.
- [x] La carta de Thanos muestra el retrato pixel 32×32 y ya no muestra las gemas.
- [x] Los sprites se ven nítidos (sin antialias) al escalarse.
- [x] `CARD_TYPE_ICONS` ya no existe en el código.
- [x] A 375px de ancho no hay scroll horizontal y el texto de las cartas no se desborda.
- [x] Se puede jugar una partida completa (jugar cartas, terminar turno, Thanos actúa, victoria y derrota) igual que antes.

## Decisions

- **Yes:** CSS pixel + sprites. Solo CSS dejaba los emojis rompiendo la estética.
- **Yes:** sprites como SVG inline generados desde grillas. Sin archivos externos, funciona con `file://`, escala nítido y se editan como texto.
- **No:** PNG en `assets/`. Requiere dibujar y mantener archivos binarios.
- **No:** pixel art con `box-shadow`. Difícil de leer y mantener.
- **Yes:** `js/sprites.js` como archivo nuevo. `cards.js` es solo datos de juego y `game.js` no toca el DOM; los sprites son presentación.
- **No:** `<symbol>` en `index.html`. Infla el HTML y mezcla arte con estructura.
- **Yes:** fuente local en `assets/fonts/`. Respeta "sin dependencias externas" y funciona offline.
- **No:** Google Fonts. Dependencia externa y falla sin internet.
- **Yes:** Press Start 2P en toda la UI con tamaños múltiplos de 8px. Es la fuente pixel más reconocible y se ve nítida en su grilla de 8px.
- **No:** fuente pixel solo en títulos. Rompe la coherencia visual.
- **Yes:** mantener la paleta actual. Menos cambios y los colores por tipo ya están establecidos.
- **No:** paleta restringida de 16 colores. Se puede hacer en otra spec.
- **Yes:** animaciones con `steps()`. Las animaciones suaves contradicen el estilo pixel.
- **Yes:** retrato de Thanos original dibujado para el juego. No se copia arte existente.
- **No:** sprites para escudo, energía y favicon. Se dejan fuera para mantener la spec pequeña.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Press Start 2P es ancha y el texto no cabe en cartas de 132px | Paso 2 ensancha cartas y usa 8px en descripciones. Criterio de aceptación sobre desborde. |
| Texto de 8px difícil de leer en pantallas pequeñas | Se mantiene 8px como mínimo y se valida a 375px. |
| No se puede descargar la fuente durante la implementación | Fallback `monospace` en `font-family`. El juego funciona igual. |
| Sprites borrosos por escalado no entero | Escalar solo a múltiplos enteros y usar `shape-rendering="crispEdges"`. |
| Retrato 32×32 con muchos `<rect>` pesa en el DOM | Se renderiza una sola vez; combinar pixels contiguos de una fila en un solo `<rect>` si hace falta. |

## What is **not** in this spec

- Sprites para escudo, energía o favicon.
- Paleta retro restringida.
- Archivos PNG o sprite sheets.
- Sonido o efectos de partículas.
- Cambios de reglas o balance.

Cada uno de esos, si llega, va en su propia spec.
