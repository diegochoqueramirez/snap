# SPEC 07 — Cartas de Iron Man, Thor y Hulk

> **Status:** Propuesta
> **Depends on:** SPEC 05
> **Date:** 2026-11-08
> **Objective:** Tematizar las tres cartas que quedan genéricas (`heavyStrike`, `shield`, `potion`) con Thor, Iron Man y Hulk, usando el mismo formato que Capitán América y el sistema actual de ataque, defensa, escudo y vida.

## Por qué existe esta spec

Capitán América (SPEC 05) ya tiene identidad propia: arte completo, medallones de costo y valor, y un efecto al jugarla. Las otras tres cartas siguen con el diseño genérico. Esta spec define qué carta representa a cada héroe, con qué números y qué efecto visual, para que se implemente de forma consistente.

El mazo tiene cuatro cartas y cada una ocupa un tipo que ya existe (`attack`, `defense`, `heal`). Por eso no hace falta tocar las reglas de `game.js`.

## Scope

**In:**

- `heavyStrike` pasa a ser **Thor** (ataque).
- `shield` pasa a ser **Iron Man** (defensa).
- `potion` pasa a ser **Hulk** (curación).
- Cada carta usa el formato hero de SPEC 05: sprite 66×94 (×2 = 132×188), nombre horneado en el arte, medallón de costo (izquierda) y medallón de valor (derecha).
- El color del medallón de valor depende del tipo, con las clases que ya existen (`.card--attack`, `.card--defense`, `.card--heal`).
- Un efecto visual por héroe, asociado a la carta y no al nombre.
- Actualizar `STARTER_DECK` con las cantidades de la tabla.

**Out of scope:**

- Cambiar `game.js` (reglas, daño, escudo, vida).
- Autodaño de Hulk (ver "Decisiones abiertas").
- Sonido, animación de la carta en reposo, o efectos en las otras cartas genéricas.
- Cargar archivos de `Referencias/` al juego (solo son fuente).

## Mapeo y números

| Carta (id) | Héroe | Tipo | Costo | Valor | Copias | Antes |
| --- | --- | --- | --- | --- | --- | --- |
| `strike` | Capitán América (ya hecho, SPEC 05) | ataque | 1 | 6 | 3 | igual |
| `heavyStrike` | **Thor** | ataque | 2 | 13 | 2 | igual, sin sprite |
| `shield` | **Iron Man** | defensa | 2 | 11 | 2 | costo 1, valor 7 |
| `potion` | **Hulk** | curación | 2 | 10 | 1 | costo 1, valor 7 |

Razones de los números:

- **Thor:** mismo daño (13) y costo (2) que hoy. Solo cambia el arte, así que el balance no se mueve.
- **Iron Man:** el valor 11 bloquea exactamente el "Golpe del Guantelete" de Thanos (11). El costo sube a 2 para que el héroe sea una decisión, no el escudo de siempre.
- **Hulk:** la curación sube de 7 a 10 y cuesta 2. Así la Poción genérica queda reemplazada por una carta más fuerte, con costo acorde.

Cambio en `STARTER_DECK` (`js/cards.js`):

```js
const STARTER_DECK = [
  'strike', 'strike', 'strike',
  'heavyStrike', 'heavyStrike',
  'shield', 'shield',
  'potion',
];
```

Las cantidades no cambian (8 cartas): solo el contenido de `CARD_LIBRARY`. Si Hulk queda con una copia, el mazo sigue siendo de 8.

## Formato visual

Igual que SPEC 05, para cada héroe:

- Sprite completo en pixel art, 66×94, sin transparencias en el marco ni el fondo. Muestreo `NEAREST`.
- Nombre del héroe horneado en el arte, tal cual aparece en su referencia.
- Medallón de costo azul arriba a la izquierda y medallón de valor arriba a la derecha, en HTML.
- Medallón de valor coloreado por tipo: naranja para ataque (Thor), azul-acero para defensa (Iron Man), verde para curación (Hulk). Usa las variables `--attack`, `--defense` y `--heal` que ya existen.
- Paletas nuevas en `js/sprites.js` (`THOR_PALETTE`, `IRON_MAN_PALETTE`, `HULK_PALETTE`), igual que `CAPTAIN_CARD_PALETTE`. No se agregan tokens a `:root`.
- Cada carta tiene su `sprite` en `CARD_LIBRARY`: `thor`, `ironMan`, `hulk`.

Referencias necesarias: `Referencias/` solo tiene Capitán América. Hacen falta las imágenes de Thor, Iron Man y Hulk antes de generar sprites.

## Efectos al jugar

Hoy `ui.js` tiene `if (card.sprite === 'captainAmerica')` fijo. Con cuatro héroes conviene asociar el efecto a la carta:

```js
// cards.js
strike: { ..., sprite: 'captainAmerica', effect: 'shieldThrow' },
heavyStrike: { ..., sprite: 'thor', effect: 'hammerStrike' },
shield: { ..., sprite: 'ironMan', effect: 'repulsorShield' },
potion: { ..., sprite: 'hulk', effect: 'regenerate' },
```

```js
// ui.js
const CARD_EFFECTS = {
  shieldThrow: (fromRect, bossRect) => throwShield(fromRect, bossRect),
  hammerStrike: (fromRect, bossRect) => dropHammer(fromRect, bossRect),
  repulsorShield: () => flash(els.playerPanel, 'is-shield'),
  regenerate: () => flash(els.playerPanel, 'is-heal'),
};
```

Descripción de cada efecto (solo visual, la lógica ya se aplicó en `game.js`):

- **shieldThrow (Capitán América):** ya implementado (SPEC 05).
- **hammerStrike (Thor):** un martillo cae desde la carta sobre Thanos con `steps()`, y al llegar aparece `is-hit`. Usa el mismo patrón que `throwShield`: solo `transform`, con `animationend` para quitar el elemento. Con `prefers-reduced-motion` no se crea el martillo, pero el golpe de Thanos sí se muestra.
- **repulsorShield (Iron Man):** un destello azul sobre el panel del jugador, sin desplazamiento. Es solo `opacity` y `box-shadow`, sin nodos extra en el DOM.
- **regenerate (Hulk):** un destello verde sobre el panel del jugador.

Con `prefers-reduced-motion` los efectos de Iron Man y Hulk pueden seguir (son destellos cortos), pero se usa la misma duración corta que en el resto del juego.

## Plan de implementación

Se hace en tres pasos, uno por héroe, para que cada uno se pruebe antes de seguir:

1. **Thor:** sprite `thor`, paleta, `CARD_LIBRARY.heavyStrike` con `sprite`, `effect` y costo 2 (sin cambio de valor). Efecto `hammerStrike` y CSS del martillo. Prueba: la carta se ve como Thor, cuesta 2, hace 13 de daño y el martillo llega a Thanos.
2. **Iron Man:** sprite `ironMan`, `CARD_LIBRARY.shield` con costo 2 y valor 11, `effect: 'repulsorShield'` y clase `is-shield` en `styles.css`. Prueba: el escudo sube 11, se ve el destello y el ataque de 11 de Thanos queda bloqueado por completo.
3. **Hulk:** sprite `hulk`, `CARD_LIBRARY.potion` con costo 2 y valor 10, `effect: 'regenerate'` y clase `is-heal`. Prueba: la vida sube 10 sin pasar del máximo y el destello se ve.

Después del paso 3, `STARTER_DECK` queda con su versión final.

## Acceptance criteria

- [ ] `heavyStrike`, `shield` y `potion` tienen `sprite`, `effect` y los valores de la tabla.
- [ ] `CARD_LIBRARY` no tiene `name` duplicado en ninguna carta.
- [ ] Los sprites `thor`, `ironMan` y `hulk` tienen 94 filas de 66 caracteres, y todos los caracteres existen en su paleta (o son `.`).
- [ ] `ui.js` no tiene `if` por nombre de sprite; el efecto sale de `card.effect` y `CARD_EFFECTS`.
- [ ] Thor: el martillo llega a Thanos y el golpe aparece al llegar. Sin reducción de movimiento, el martillo se quita en `animationend`.
- [ ] Iron Man: el escudo sube 11, se ve el destello y no queda ningún nodo extra en el DOM.
- [ ] Hulk: la curación no supera la vida máxima y el destello se ve.
- [ ] El daño, el escudo y la curación de `game.js` no cambian (solo se comparan contra los valores de la tabla).
- [ ] A 375px la mano no desborda ni hay scroll horizontal.
- [ ] Con `prefers-reduced-motion: reduce` no quedan elementos de animación en el DOM.
- [ ] Se puede jugar una partida completa, con victoria y derrota.
- [ ] Los cuatro archivos JS pasan `node --check`.
- [ ] El juego abre con `file://` sin errores en la consola.

## Decisiones

- **Yes:** cada héroe ocupa el mismo tipo que la carta genérica que reemplaza. Así no hay cambios en las reglas.
- **Yes:** Thor conserva costo 2 y daño 13 de hoy. Es la carta de ataque grande y ya tiene el balance correcto.
- **Yes:** Iron Man sube a costo 2 y valor 11, que bloquea el golpe de 11 de Thanos.
- **Yes:** Hulk es curación (regeneración), no autodaño. El autodaño exige una mecánica nueva.
- **Yes:** el efecto de cada carta sale de `card.effect`, para no crecer el `if` de `ui.js`.
- **No:** efectos sonoros, rebotes o efectos que cambien el estado del juego.
- **Yes:** las paletas viven en `sprites.js`, igual que las anteriores.

## Decisiones abiertas

- **Hulk: ¿curación o autodaño?** La propuesta es curación (regeneración) porque cabe en el sistema actual. Autodaño (daño alto, pero el jugador pierde vida) sería más fiel al personaje y necesitaría un campo nuevo en la carta y un cambio en `playCard`. Decidir antes del paso 3.
- **¿Se quedan los valores de la tabla?** Son propuestas. Se pueden cambiar en `cards.js` sin tocar nada más.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Hulk queda muy fuerte con costo 2 y curación 10 | Probar partidas completas; bajar a 8 si la vida del jugador sobra. |
| Iron Man con 2 copias y costo 2 hace la mano lenta | Medir en partidas; si es lento, bajar a 1 copia. |
| El martillo de Thor y el escudo de Capitán América se superponen si se juegan en turnos seguidos | Cada uno se quita en `animationend`; no comparten estado. |
| Tres sprites nuevos más la paleta suman mucho código en `sprites.js` | Mantener el mismo formato de sprites; si crece demasiado, separar en otro archivo. |

## What is **not** in this spec

- Autodaño de Hulk (si se decide, va en su propia spec).
- Efectos sonoros.
- Cambios en `game.js` o en las reglas de daño, escudo o vida.
- Carta en reposo o animaciones de entrada de la mano.
