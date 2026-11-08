# SPEC 04 — Respiro y suspiro idle de Thanos

> **Status:** implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-08
> **Objective:** Animar el retrato de Thanos con un respiro idle que lo sube y baja 1 pixel de sprite, y con un suspiro más profundo cada 4 respiros, solo con CSS.

## Por qué existe esta spec

Hoy el retrato de Thanos está quieto salvo por el destello de las gemas.
Un respiro lento hace que el boss se sienta vivo y amenazante mientras espera.
Mover el sprite de a 1 pixel de grilla mantiene el estilo pixel art de SPEC 01 sin dibujar frames nuevos.

## Historial de cambios

- Primera versión: respiro de 3s y ciclo de 12s.
- Revisión durante la implementación: el usuario pidió animaciones más rápidas. El respiro pasa a 1.5s y el ciclo a 6s. Los porcentajes de los keyframes no cambian; solo la duración.

## Scope

**In:**

- Animación `breathe` aplicada a `.boss-art .sprite`, es decir, a los dos SVG apilados (`thanos` y `thanosGlow`), para que se muevan juntos.
- Movimiento solo vertical con `translateY`, en múltiplos de 2px (1 pixel del sprite a escala ×2).
- Ciclo total de 6s con `steps(1, end)`: 3 respiros normales de 1.5s y 1 suspiro de 1.5s.
- Respiro normal: reposo (`0`) y luego inhala (`-2px`).
- Suspiro: sube a `-2px`, luego a `-4px` y lo sostiene; baja a `-2px` y a `0`; los hombros caen a `+2px` y vuelve a `0`.
- `.boss-art` pasa a `overflow: hidden` para que el sprite no invada la carta al bajar.
- El destello de gemas (`glow`) sigue igual y se superpone con el respiro sin desalinearse.
- Con `prefers-reduced-motion: reduce` el retrato queda quieto (lo cubre la regla global existente).
- Siempre activo, también con el overlay de victoria/derrota.

**Out of scope (for future specs):**

- Frames nuevos de pecho u hombros expandidos.
- `scaleY` o cualquier escalado del sprite.
- Detener el respiro según `game.phase`.
- Cambiar el ritmo del respiro según la vida de Thanos o la próxima acción.
- Frame de daño o animación del Chasquido.
- Timers en JS para animaciones.
- Cambios en `ui.js`, `game.js`, `cards.js` o `sprites.js`.

## Data model

Sin datos nuevos. Solo cambia `css/styles.css`.

Keyframes de `breathe` (ciclo de 6s; con `steps(1, end)` cada valor se mantiene hasta el siguiente keyframe):

| Tramo | Tiempo | `translateY` | Momento |
| --- | --- | --- | --- |
| 0% | 0s | `0` | respiro 1: reposo |
| 12.5% | 0.75s | `-2px` | respiro 1: inhala |
| 25% | 1.5s | `0` | respiro 2: reposo |
| 37.5% | 2.25s | `-2px` | respiro 2: inhala |
| 50% | 3s | `0` | respiro 3: reposo |
| 62.5% | 3.75s | `-2px` | respiro 3: inhala |
| 75% | 4.5s | `-2px` | suspiro: empieza a inhalar |
| 79% | ~4.75s | `-4px` | suspiro: inhala hondo y sostiene |
| 88% | ~5.3s | `-2px` | suspiro: exhala |
| 92% | ~5.5s | `0` | suspiro: reposo |
| 94% | ~5.65s | `+2px` | suspiro: hombros caen |
| 98%, 100% | ~5.9s | `0` | vuelve al reposo |

Convenciones:

- Se anima la `<svg class="sprite">` dentro de cada `.boss-art__frame`, no el `<span>`. Así no se combina con la animación `glow` del frame de destello.
- Los dos SVG se insertan a la vez en `ui.js`, así que sus animaciones arrancan sincronizadas.
- Los porcentajes del suspiro son de referencia; se pueden ajustar al probar mientras se mantengan los valores en múltiplos de 2px y el ciclo de 6s.

## Implementation plan

1. En `css/styles.css`, agregar `overflow: hidden` a `.boss-art`. Prueba: el retrato se ve igual que antes, sin recortes.
2. En la sección "Animaciones", agregar `@keyframes breathe` con la tabla del data model y aplicarlo a `.boss-art .sprite` con `animation: breathe 6s steps(1, end) infinite`. Prueba: el retrato sube y baja cada 1.5s y cada 6s hace el suspiro con caída de hombros.
3. Verificar el destello y `prefers-reduced-motion`. Prueba: las gemas destellan alineadas con el retrato en cualquier fase del respiro; con reduced-motion emulado el retrato queda quieto.

## Acceptance criteria

- [x] El juego abre con `file://` sin errores en la consola.
- [x] El retrato sube 2px y vuelve al reposo en cada respiro de 1.5s.
- [x] Cada 6s hay un suspiro que sube 4px, baja al reposo, cae 2px por debajo y vuelve.
- [x] Todo desplazamiento del sprite es múltiplo de 2px; no hay posiciones intermedias ni antialias.
- [x] La animación usa `steps()` y no hay timers JS para ella.
- [x] Los frames `thanos` y `thanosGlow` se mueven juntos; el destello nunca aparece desplazado.
- [x] El sprite no invade la carta fuera de `.boss-art` en ningún momento del ciclo.
- [x] Con `prefers-reduced-motion: reduce` el retrato queda quieto en reposo.
- [x] No cambió `ui.js`, `game.js`, `cards.js` ni `sprites.js`.
- [x] A 375px de ancho no hay scroll horizontal.
- [x] Se puede jugar una partida completa (jugar cartas, terminar turno, Thanos actúa, victoria y derrota) igual que antes.

## Decisions

- **Yes:** mover el sprite 1 pixel de grilla con `translateY`. Mantiene el pixel perfect y no requiere sprites nuevos.
- **No:** frames nuevos de pecho expandido. Más expresivo, pero hay que generar otro sprite 43×79 y multiplicar frames con el destello.
- **No:** `scaleY`. Rompe la grilla: los pixeles quedan de alto desigual.
- **Yes:** el suspiro es un respiro más profundo con caída de hombros al exhalar. Lo eligió el usuario para marcar la exhalación.
- **No:** suspiro solo como respiro más profundo, sin caída.
- **Yes:** respiro de 1.5s y suspiro cada 4 (ciclo de 6s). El usuario pidió animaciones más rápidas tras ver la versión de 3s. El ciclo de 6s equivale a 2 ciclos del destello de 3s.
- **No:** respiro de 3s (ciclo de 12s). Fue la primera versión; al verla en pantalla se sintió lenta.
- **No:** respiros de 2.5s o 2s. El usuario eligió el ritmo más rápido de los propuestos.
- **No:** acelerar también el destello de gemas. Es de SPEC 02 y queda fuera del alcance; si se quiere, va en otra spec.
- **Yes:** siempre activo. Igual que el destello de SPEC 02 y sin tocar `ui.js`.
- **No:** detener el respiro en victoria/derrota. Requiere lógica de fase en la UI.
- **Yes:** animar la `<svg>` y no el `<span>` del frame. Evita combinar dos animaciones en `.boss-art__frame--glow`.
- **Yes:** `overflow: hidden` en `.boss-art`. El fondo negro del panel cubre el hueco al subir y recorta al bajar.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Al caer +2px se recorta la fila inferior del sprite | Es 1 fila de 79 durante ~0.12s; si molesta, agregar 2px de `padding-bottom` a `.boss-art`. |
| `overflow: hidden` recorta el destello o el frame absoluto | Ambos frames están dentro del panel; se valida visualmente el destello en las 3 fases. |
| Los dos SVG se desincronizan | Se insertan en el mismo `innerHTML`; si se re-renderizaran por separado habría que animar `.boss-art` entero. |
| El movimiento se lee como un salto brusco | Con amplitud de 1 pixel de grilla es el estilo pixel art buscado; se valida en pantalla. |

## What is **not** in this spec

- Frames nuevos o escalado del sprite.
- Respiro que dependa de la fase, la vida o la próxima acción de Thanos.
- Frame de daño o animación del Chasquido.
- Cambios en JS, reglas o balance.

Cada uno de esos, si llega, va en su propia spec.
