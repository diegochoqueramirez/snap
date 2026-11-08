# SPEC 04 — Carta de Capitán América con lanzamiento de escudo

> **Status:** Implementado (pendiente validación visual manual)
> **Depends on:** SPEC 02
> **Date:** 2026-11-08
> **Objective:** Tematizar una carta del mazo con Capitán América: retrato pixel art estático y un escudo que vuela hacia Thanos al jugarla y le inflige el daño.

## Por qué existe esta spec

El juego necesita identidad Avengers. Como primer paso se tematiza una sola carta (el resto del mazo sigue genérico y va en specs futuras).
Capitán América se eligió por su escudo: el ataque de la carta se ve como el escudo lanzado, con el mismo daño de antes.

## Scope

**In:**

- La carta `strike` (ataque, costo 1, 6 de daño, 3 copias en el mazo) pasa a ser **Capitán América**. Mecánica y números idénticos; cambian nombre, descripción y arte.
- Carta completa en pixel art de Capitán América (sprite `captainAmerica`, 66×94 a ×2 = 132×188), remuestreada desde `Referencias/snap_captain_america.webp` con un script fuera del repo. El marco y el fondo van dentro del sprite, sin transparencias: la carta es rectangular. Muestreo puntual (`NEAREST`), no promedio, para que no se vea borroso. El recorte es más ancho que el marco (x 170–850) para que "AMERICA" quepa dentro de la carta; el arte queda estirado horizontalmente ~8%.
- El nombre "CAPTAIN AMERICA" viene horneado en el arte, tal cual está en la referencia. Los medallones de la referencia se borran del arte (se rellenan con el fondo cercano) para que no asomen detrás de los cuadros de costo y daño.
- Medallón azul de costo arriba a la izquierda y medallón naranja de daño arriba a la derecha (HTML, para que los números sean datos del juego). 
- Escudo pixel art (sprite `captainShield`, 23×23), copiado 1:1 de `Referencias/shield_captain_america.png` (fondo blanco exterior transparente).
- Al jugar la carta, el escudo vuela desde la carta hasta Thanos (rotando, con `steps()`) y el golpe (`is-hit`) de Thanos aparece cuando llega.
- La carta de Capitán América es más grande (132×188, y 96×136 en ≤560px). La carta no muestra la descripción en pantalla; queda en `aria-label`.
- Con `prefers-reduced-motion` no se crea el escudo volador; el golpe de Thanos sí se muestra.

**Out of scope (for future specs):**

- Tematizar Golpe pesado, Escudo y Poción (Thor, Iron Man, Hulk, etc.).
- Que el escudo rebote o regrese a la mano, o cualquier efecto extra de la carta.
- Animación de la carta en reposo.
- Sonido.
- Cargar los archivos de `Referencias/` en el juego (solo son fuente).
- Cambios en reglas, balance o `game.js`.

## Data model

Cambios en `js/cards.js`. Sin estado de juego nuevo.

```js
const SHIELD_THROW_MS = 450; // duración del vuelo del escudo

CARD_LIBRARY.strike = {
  name: 'Capitán América',
  type: CARD_TYPES.ATTACK,
  cost: 1,
  value: 6,
  description: 'Lanza su escudo: inflige 6 de daño.',
  sprite: 'captainAmerica',
};
```

Convenciones:

- `card.sprite` es opcional. Si existe, `ui.js` dibuja ese sprite en lugar del sprite por tipo. Las cartas sin `sprite` no cambian.
- `game.js` no cambia: `createCard` ya copia todos los campos de `CARD_LIBRARY`.
- Las paletas viven en `js/sprites.js` (`CAPTAIN_PALETTE`, `SHIELD_PALETTE`), igual que `THANOS_PALETTE`. No se agregan tokens a `:root`.

## Implementation plan

1. `cards.js`: `strike` con nombre, descripción y `sprite`; constante `SHIELD_THROW_MS`. Prueba: la carta aparece como Capitán América con 6 de daño y costo 1.
2. `sprites.js`: sprites `captainAmerica` y `captainShield` con sus paletas. Prueba: `createSpriteSvg('captainShield')` y `createSpriteSvg('captainAmerica')` devuelven SVG sin errores.
3. `ui.js`: `createCardElement` usa `card.sprite || card.type` y usa el marcado de carta completa (`heroCardMarkup`) cuando hay `sprite`. `throwShield` crea el escudo en `body` con `--dx`/`--dy` y lo quita en `animationend`. `handleHandClick` lanza el escudo para `captainAmerica` y muestra el `is-hit` de Thanos al llegar.
4. `styles.css`: `.card--hero` (132×188, y 96×136 en ≤560px), medallones `.card__cost`/`.card__value` y `.card__hero-name` y `.shield-throw` con `@keyframes shield-throw` (solo `transform`, `steps(6, end)`).

## Acceptance criteria

- [x] `CARD_LIBRARY.strike` tiene nombre "Capitán América", daño 6, costo 1 y `sprite: 'captainAmerica'`.
- [x] `captainAmerica` tiene 94 filas de 66 caracteres; `captainShield` tiene 23 filas de 23 caracteres.
- [x] Todos los caracteres de los sprites existen en su paleta (o son `.`, transparente).
- [x] El escudo coincide pixel a pixel con la grilla generada desde `shield_captain_america.png`.
- [x] Los cuatro archivos JS pasan `node --check`.
- [ ] El juego abre con `file://` sin errores en la consola.
- [ ] La carta de Capitán América se ve como la referencia: arte completo, medallones de costo (izquierda) y daño (derecha), nombre abajo.
- [ ] Al jugar Capitán América el escudo vuela de la carta a Thanos, y el golpe aparece al llegar.
- [ ] El daño, el escudo de Thanos y el log son iguales que antes.
- [ ] Con `prefers-reduced-motion: reduce` no hay vuelo del escudo y no quedan elementos en el DOM.
- [ ] A 375px de ancho la mano no desborda ni hay scroll horizontal.
- [ ] Las otras 3 cartas se ven igual que antes.
- [ ] Se puede jugar una partida completa (victoria y derrota incluidas).

## Decisions

- **Yes:** tematizar `strike` (ataque) en lugar de `shield` (defensa). El escudo hace daño, así que la carta debe ser de ataque.
- **No:** tematizar varias cartas a la vez. Se hace una sola en este MVP; el resto va en specs futuras.
- **Yes:** mecánica y números idénticos. Solo cambian nombre, descripción y arte.
- **Yes:** arte completo de la carta en lugar de un retrato dentro de la carta, para que coincida con la referencia (`snap_captain_america.webp`).
- **Yes:** la referencia no tiene una grilla de pixeles exacta, así que se remuestrea a 66×94 (la proporción de la carta) y se cuantiza a 24 colores.
- **Yes:** costo y daño como HTML encima del sprite, para que sean datos del juego. Las zonas de los medallones se dejan transparentes en el sprite.
- **Yes:** el nombre va horneado en el arte, como en la referencia. El usuario lo pidió así.
- **Yes:** escudo copiado 1:1 de la referencia, con su grilla de bloques de 32px.
- **Yes:** el escudo vuela en CSS con `steps()` y solo `transform`. La posición de inicio y destino la calcula JS con `getBoundingClientRect`.
- **Yes:** el golpe de Thanos se muestra al llegar el escudo. Eso requiere un `setTimeout` de `SHIELD_THROW_MS` en `ui.js`. Es una decisión de sincronía visual; la lógica de juego no depende del timer.
- **No:** `animation-delay` en `.is-hit`. Obligaría a una clase extra solo para esta carta.
- **Yes:** con reducción de movimiento el escudo no se crea. Así no queda un nodo que nunca reciba `animationend`.
- **Yes:** el sprite por tipo se conserva como fallback y para la intención de Thanos.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| En ≤560px el sprite se escala a 96×136, que no es múltiplo entero (pixeles de tamaño desigual) | Aceptado para el MVP; si se nota, se genera una grilla específica para móvil. |
| La carta más alta empuja el layout en móvil | Se valida a 375px; la mano debe seguir entrando en una fila. |
| El escudo queda en el DOM si la animación no termina | Se quita en `animationend`; con reducción de movimiento ni siquiera se crea. |
| Si el usuario juega otra carta mientras vuela el escudo, el timer del golpe sigue activo | El `flash` solo reinicia la animación de Thanos; no cambia estado. |

## What is **not** in this spec

- Tematizar las otras 3 cartas.
- Rebote, retorno del escudo o efectos adicionales.
- Animación de la carta en reposo, sonido.
- Cargar las referencias en el juego.
