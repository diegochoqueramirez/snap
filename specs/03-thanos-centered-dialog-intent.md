# SPEC 03 — Thanos centrado con intención en caja de diálogo

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-08
> **Objective:** Centrar la carta de Thanos en pantalla y mostrar su próxima acción como una caja de diálogo pixel art encima de la carta, con la cola apuntando hacia él.

## Por qué existe esta spec

La carta de Thanos comparte fila con el cuadro de intención, así que queda corrida a la izquierda.
Al ser el boss, debe ocupar el centro de la escena. La intención pasa a leerse como "lo que Thanos va a hacer", con una caja de diálogo pixel art que refuerza el estilo de SPEC 01.

## Scope

**In:**

- `.boss-area` apila en columna y centra: intención arriba, carta abajo, ambas centradas horizontalmente, en escritorio y móvil.
- La caja de diálogo (`.intent`) queda encima de la carta, con una cola (triángulo escalonado) en el borde inferior apuntando a Thanos.
- Estilo pixel art: borde de 4px (`--pixel`), esquinas "cortadas" por escalones (sin `border-radius`), sombra dura `--shadow-hard`, cola hecha con bloques cuadrados de 4px.
- Se mantiene el color por tipo (`intent--attack` rojo, `intent--defense` azul) y el contenido actual (etiqueta, sprite, nombre, efecto).
- Ancho de la caja igual al de la carta (210px escritorio, 180px ≤560px); sin `min-width` que la desborde.
- Orden en el DOM: `#boss-intent` pasa antes de `#boss-card` en `index.html`.
- Cuando `#boss-intent` está `hidden` (fin de partida) la carta sigue centrada.

**Out of scope (for future specs):**

- Frases o texto nuevo de Thanos (flavor).
- Animación de aparición o "tipeo" del texto.
- Cambios en el panel del retrato (`.boss-art`) o en los sprites.
- Cambios en reglas, balance, `game.js` o `cards.js`.
- Cambios en el registro de combate o en el área del jugador.

## Data model

Sin datos nuevos. Solo cambian HTML y CSS; `ui.js` no cambia (sigue seteando `className`, `hidden` e `innerHTML`).

## Implementation plan

1. En `index.html`, mover `<div class="intent" id="boss-intent">` antes de `<article id="boss-card">` dentro de `.boss-area`. Prueba: el juego abre sin errores y la intención sigue actualizándose.
2. En `css/styles.css`, `.boss-area` → `flex-direction: column; align-items: center; gap: 12px` (quitar `flex-wrap`). Prueba: la carta queda centrada en pantalla a 1280px y a 375px.
3. Reestilizar `.intent`: `width: 210px` (180px en ≤560px, reemplazando `width: 100%`), quitar `min-width`, esquinas escalonadas (p. ej. `clip-path: polygon(...)` con pasos de 4px o pseudo-elementos) manteniendo borde y sombra duros. Prueba: sin bordes redondeados, esquinas visibles en ambos tipos de intención.
4. Agregar la cola con `.intent::after` (bloques de 4px que forman un triángulo hacia abajo, centrado, del color del borde). Prueba: la cola toca la parte superior de la carta sin solaparse con su nombre.
5. Verificar `intent--defense` y estado `hidden`, y ajustar el bloque ≤560px. Prueba: ver criterios de aceptación.

## Acceptance criteria

- [ ] El juego abre con `file://` sin errores en la consola.
- [ ] El centro horizontal de `#boss-card` coincide con el centro del viewport (±1px) a 1280px y a 375px.
- [ ] `#boss-intent` está encima de `#boss-card` y ambos comparten el mismo eje central.
- [ ] La caja de diálogo mide el mismo ancho que la carta (210px / 180px en ≤560px).
- [ ] La caja tiene una cola hacia abajo apuntando a la carta, hecha con bloques de 4px, sin `border-radius`.
- [ ] La caja usa borde 4px y `--shadow-hard`; no hay gradientes ni blur.
- [ ] La intención de ataque se ve roja y la de defensa azul.
- [ ] La intención sigue mostrando la próxima acción de Thanos y se actualiza cada turno.
- [ ] En victoria/derrota la intención se oculta y la carta de Thanos sigue centrada.
- [ ] A 375px de ancho no hay scroll horizontal.
- [ ] No cambió `game.js`, `cards.js` ni `ui.js`.
- [ ] Se puede jugar una partida completa igual que antes.

## Decisions

- **Yes:** centrar la carta en pantalla con la intención encima. Es lo que pidió el usuario.
- **No:** intención al lado o debajo. Se evaluaron y el usuario eligió encima.
- **Yes:** reutilizar `.intent` como caja de diálogo, sin elemento nuevo. Menos cambios y `ui.js` intacto.
- **No:** crear contenido nuevo (frases de Thanos). Fuera de alcance; la caja muestra solo la próxima acción.
- **Yes:** mover la intención antes de la carta en el HTML. Orden de lectura natural (primero lo que va a hacer, luego quién) y evita `column-reverse`.
- **Yes:** misma estética que SPEC 01: esquinas escalonadas, cola de bloques de 4px, sombra dura.
- **No:** `border-radius` o SVG para la cola. Rompe la regla de bordes duros y agrega complejidad.
- **Yes:** ancho de la caja igual al de la carta. Se lee como un conjunto y funciona sin cambios entre escritorio y móvil.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `clip-path` recorta el borde o la sombra dura de la caja | Probar ambos tipos; si recorta la sombra, usar esquinas con pseudo-elementos o `box-shadow` por escalones. |
| La cola solapa el nombre de Thanos en la carta | `gap` entre caja y carta suficiente (≥ tamaño de la cola). |
| La pantalla de 375px queda más alta al apilar | La caja ocupa ~70px; se valida que la mano del jugador siga visible sin scroll excesivo. |

## What is **not** in this spec

- Texto o frases nuevas de Thanos.
- Animaciones de la caja de diálogo.
- Cambios al retrato, sprites, reglas o balance.

Cada uno de esos, si llega, va en su propia spec.
