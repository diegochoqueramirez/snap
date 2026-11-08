# SPEC 02 — Retrato pixel art de Thanos

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-11-08
> **Objective:** Reemplazar el retrato 32×32 de Thanos por un sprite 43×79 basado en `Referencias/Thanos pixel.png`, con un destello de las gemas animado solo con CSS.

## Por qué existe esta spec

El retrato de SPEC 01 es pequeño (32×32) y usa pocos tonos, así que se lee plano y con poco detalle.
El usuario aportó una referencia pixel art (`Referencias/Thanos pixel.png`) con el estilo que quiere para el boss: casco dorado, sonrisa de dientes y el guantelete con las seis gemas al frente.
Un destello periódico de las gemas hace sentir vivo al boss sin agregar lógica.

## Historial de cambios

- Primera versión: primer plano de la cara en 48×48, con parpadeo de ojos.
- Revisión durante la implementación: el usuario no quedó conforme con ese retrato y pidió usar la referencia. Cambian el encuadre (cara + guantelete), la grilla (43×79), el fondo (negro) y la animación (destello de gemas). La estructura de dos frames apilados y la técnica CSS se mantienen.
- Agregado durante la implementación: el panel del retrato (`.boss-art`) pasa a fondo negro.

## Scope

**In:**

- Nuevo sprite `thanos` de 43×79, lo más fiel posible a `Referencias/Thanos pixel.png`, a escala 1:1 (un pixel del sprite = un bloque de 14px de la referencia).
- Se recorta la referencia a la caja de la figura (columnas 4–46, filas 2–80 de su grilla 50×81).
- El fondo negro de la referencia se mantiene: el sprite es un rectángulo negro completo.
- El panel del retrato (`.boss-art`) pasa de `var(--bg-2)` a negro `#000` para que el sprite se funda con él. El resto de la carta de Thanos no cambia.
- Paleta propia del sprite con los colores exactos de la referencia (37 colores).
- Nuevo sprite `thanosGlow` de 43×79: idéntico a `thanos`, salvo que el color base de cada gema pasa a su tono claro.
- Ambos sprites comparten la misma paleta (una sola constante).
- `ui.js` renderiza los dos frames una vez dentro de `#boss-art`, apilados.
- Animación de destello solo con CSS: ciclo de 3s, gemas brillantes ~150ms, con `steps()`.
- Con `prefers-reduced-motion` se ve fijo el frame normal.
- Tamaño en pantalla: 86×158px (escala ×2) en escritorio y a ≤560px.
- Se elimina el sprite `thanos` 32×32 actual (lo reemplaza el nuevo).
- La imagen de referencia se queda en `Referencias/` solo como fuente; el juego no la carga.

**Out of scope (for future specs):**

- Parpadeo de ojos u otras animaciones de la cara.
- Frame de daño o reacción al recibir golpes.
- Animación del Chasquido.
- Detener el destello según la fase del juego (sigue activo con el overlay de victoria/derrota).
- Timers en JS para animaciones.
- Cargar el PNG de referencia en el juego.
- Cambios en los sprites de tipos de carta, favicon, escudo o energía.
- Cambios en reglas, balance o `game.js`.

## Data model

Cambios en `js/sprites.js`. No hay estado de juego nuevo.

```js
// Paleta compartida por los dos frames del retrato (colores exactos de la referencia).
const THANOS_PALETTE = {
  k: '#000000',               // fondo y contornos
  // '1'–'9': oro del casco y del guantelete (sombra → luz)
  // 'a'–'e': piel morada (sombra → luz)
  // 'x', 'X': destellos del casco
  // 'g', 'h', 'w': dientes y brillos
  // Gemas (base, claro, brillo): M/N/O morada, B/C azul, R/T roja,
  // J/K/L naranja, Y/Z/U/V amarilla, G/H/I verde
};

const SPRITES = {
  attack:  { /* sin cambios */ },
  defense: { /* sin cambios */ },
  heal:    { /* sin cambios */ },
  thanos:     { palette: THANOS_PALETTE, pixels: [/* 79 filas de 43, gemas normales */] },
  thanosGlow: { palette: THANOS_PALETTE, pixels: [/* 79 filas de 43, gemas brillantes */] },
};
```

Convenciones:

- `createSpriteSvg(name)` no cambia su firma ni su comportamiento.
- `thanos` y `thanosGlow` difieren solo en pixeles de gemas.
- En `thanosGlow` cada color base de gema pasa a su tono claro: `M→N`, `B→C`, `R→T`, `J→K`, `Y→U`, `Z→U`, `G→H`.
- Los colores viven solo en `THANOS_PALETTE`; no se agregan tokens a `:root`.

Markup generado en `#boss-art` desde `ui.js`:

```html
<div class="boss-art" id="boss-art">
  <span class="boss-art__frame">…svg thanos…</span>
  <span class="boss-art__frame boss-art__frame--glow">…svg thanosGlow…</span>
</div>
```

CSS en `css/styles.css` (clases en kebab-case; no se usa la clase `sprite--thanosGlow` en selectores):

- `.boss-art` con `position: relative` para apilar los frames.
- `.boss-art__frame--glow` en `position: absolute` encima del frame base, en la misma posición, oculto por defecto.
- `@keyframes glow` que lo muestra durante el último ~5% de un ciclo de 3s (~150ms), con `steps()`.

## Implementation plan

1. Generar el nuevo `thanos` 43×79 con `THANOS_PALETTE` a partir de la referencia, reemplazando el 32×32. Cambiar `.boss-art .sprite` a 86×158px, también en el bloque ≤560px. Prueba: la carta de Thanos muestra el sprite nítido, igual a la referencia, sin desbordar la carta de 210px (180px en móvil).
2. Agregar `thanosGlow` reutilizando `THANOS_PALETTE` y cambiando solo los colores base de las gemas. Prueba: `createSpriteSvg('thanosGlow')` en la consola devuelve un SVG 43×79 sin errores.
3. En `ui.js`, renderizar los dos `<span class="boss-art__frame">` con ambos SVG. Agregar el CSS de apilado con el frame de destello oculto. Prueba: se ve solo el frame normal, sin desplazamientos.
4. Agregar `@keyframes glow` (ciclo 3s, `steps()`, ~150ms visible) a `.boss-art__frame--glow`. Prueba: las gemas destellan cada ~3s; con `prefers-reduced-motion` emulado no destellan.

## Acceptance criteria

- [x] El juego abre con `file://` sin errores en la consola.
- [x] `SPRITES.thanos` y `SPRITES.thanosGlow` tienen 79 filas de 43 caracteres cada una.
- [x] Ambos sprites usan la misma constante `THANOS_PALETTE`.
- [x] Cada pixel de `thanos` tiene el color del bloque correspondiente de la referencia.
- [x] `thanos` y `thanosGlow` solo difieren en pixeles de gemas.
- [x] El sprite se ve a 86×158px en escritorio y a 375px de ancho, nítido y sin antialias.
- [x] El sprite no desborda la carta de Thanos en ningún ancho.
- [x] El fondo de `.boss-art` es `#000` y no se distingue del fondo del sprite.
- [x] El resto de la carta de Thanos mantiene su fondo `var(--boss-2)`.
- [x] Las gemas destellan una vez cada ~3s durante ~150ms.
- [x] La animación de destello usa `steps()` y no hay timers JS para ella.
- [x] Con `prefers-reduced-motion: reduce` el sprite queda fijo en el frame normal.
- [x] La firma de `createSpriteSvg(name)` no cambió.
- [x] A 375px de ancho no hay scroll horizontal.
- [x] Se puede jugar una partida completa (jugar cartas, terminar turno, Thanos actúa, victoria y derrota) igual que antes.

## Decisions

- **Yes:** usar `Referencias/Thanos pixel.png` como base, lo más fiel posible. El primer plano 48×48 dibujado a mano no convenció al usuario. La referencia la aporta el usuario, que confirma poder usarla.
- **No:** solo inspirarse en la referencia y redibujar. El usuario pidió el mayor parecido posible.
- **Yes:** grilla nativa 43×79 a escala ×2 (86×158px). Mapeo 1:1 con los bloques de 14px de la referencia y escala entera.
- **No:** reducir a 48×48. Habría que redibujar a ~60% y se pierde el parecido.
- **No:** escala ×1 en móvil. 43×79px se ve demasiado pequeño.
- **Yes:** mantener el fondo negro. Es parte del estilo de la referencia.
- **No:** fondo transparente fuera de la figura.
- **Yes:** panel `.boss-art` en negro `#000`. El sprite se funde con el panel y no se ve un recuadro negro sobre gris.
- **No:** toda la carta de Thanos en negro. Se mantiene el morado de la carta; solo cambia el panel del retrato.
- **Yes:** colores exactos de la referencia en una paleta propia. Máxima fidelidad; los colores quedan encapsulados en el sprite.
- **Yes:** idle de 2 frames con destello de gemas. En la referencia los ojos no se ven, así que el parpadeo no aplica.
- **No:** parpadeo de ojos. Era la animación de la primera versión de esta spec.
- **Yes:** ciclo de 3s con ~150ms de destello. Se mantiene el ritmo ya aprobado.
- **Yes:** animación solo con CSS y `steps()`. Sin timers en la UI; `prefers-reduced-motion` ya la anula.
- **No:** `setInterval` en `ui.js`. Agrega lógica de tiempo a la presentación.
- **Yes:** dos entradas en `SPRITES` (`thanos`, `thanosGlow`) con paleta compartida. `createSpriteSvg` no cambia.
- **No:** arreglo `frames` en un sprite. Generaliza antes de necesitarlo y cambia la firma.
- **Yes:** destello siempre activo. Más simple que depender de `game.phase`.
- **Yes:** generar las filas del sprite desde la referencia con un script fuera del repo. Transcribir 79×43 pixeles a mano es propenso a errores.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Error al transcribir la referencia (filas de largo distinto, colores cambiados) | Las filas se generan muestreando el PNG; criterio de aceptación compara pixel a pixel. |
| Los dos frames se desalinean al apilarse | Mismo `viewBox` y mismo tamaño CSS; el frame de destello en `position: absolute` alineado con el padding de `.boss-art`. |
| La carta de Thanos queda más alta y empuja el layout | 158px de alto es ~14px más que el retrato anterior; se valida a 375px y en escritorio. |
| Muchos `<rect>` en el DOM por 37 colores | Se renderiza una sola vez; `createSpriteSvg` ya agrupa tramos horizontales del mismo color. |

## What is **not** in this spec

- Parpadeo de ojos u otras animaciones de la cara.
- Frame de daño o animación del Chasquido.
- Detener el destello según la fase del juego.
- Cargar el PNG de referencia en el juego.
- Cambios en otros sprites, reglas o balance.

Cada uno de esos, si llega, va en su propia spec.
