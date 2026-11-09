# SPEC 09 — Carta de Doctor Strange con zoom y círculo mágico

> **Status:** Aprobado
> **Depends on:** SPEC 05, SPEC 07, SPEC 08
> **Date:** 2026-11-08
> **Objective:** Convertir la carta `potion` en Doctor Strange (curación de 8, costo 2, 1 copia) con el formato hero de SPEC 05; al jugarla, la carta viaja al centro con el mismo zoom de Thor, la pantalla se oscurece y un círculo mágico la hace desaparecer, y después destella la curación en el panel del jugador.

## Por qué existe esta spec

`docs/hero-cards-iron-man-thor-hulk.md` proponía Hulk como curación. Tras revisarlo, Hulk encaja mal con una curación: su identidad es fuerza y furia, y el mazo ya tiene dos cartas de ataque. Se elige Doctor Strange porque su sanación mágica se entiende sin explicación y se conecta con la trama (Thanos va detrás de la Gema del Tiempo que él protege).

Con Iron Man (SPEC 08) y Thor (SPEC 07) ya hechos, esta es la última carta hero del plan. La salida de la carta reutiliza la de Thor (SPEC 07), cambiando el remate: en vez de explosión y rayo, la carta desaparece dentro de un círculo mágico.

## Historial de cambios

- Aprobación inicial de la idea: Hulk se descarta en favor de Doctor Strange para la curación. El doc `docs/hero-cards-iron-man-thor-hulk.md` queda con Hulk como descartado.
- Revisión 6: el hover de las cartas pasa de `steps(2)` a una transición suave (`ease-out`, 0.2 s) en `button.card`. Es el primer paso para dejar el pixel art en la animación y conservar solo los artes.
- Revisión 5: Capitán América e Iron Man usan la misma salida que Thor (zoom al centro y la explosión de Thor, sin lluvia), para que su carta también desaparezca. En Capitán América el escudo sigue volando a Thanos después de la explosión, desde el centro de la pantalla. Iron Man pasa a tener `effect: 'armorBurst'` (antes no tenía `effect`).
- Revisión 4: al pasar el portal a 80 ms por cuadro se veía a saltos (unos 12 fps). Se generaron cuadros intermedios con `minterpolate` (27 → 54 cuadros) y se reproducen a 40 ms, como el GIF original. La tira pasa a 8×7 cuadros.
- Revisión 3: la carta se queda en zoom 500 ms antes de absorberse, y el portal dura 2160 ms (27 cuadros a 80 ms) en vez de 1080 ms, para que se quede abierto más tiempo.
- Revisión 2: el GIF de `Referencias/circulo_dr_strange.gif` repite su ciclo dos veces (el brillo se repite cada 27 cuadros), y se veía el portal dos veces. Se usa un solo ciclo de 27 cuadros (1080 ms). Además, la carta ya no se desvanece: se achica hasta 0 dentro del portal, con la misma duración que el círculo, y desaparece al final.
- Revisión: en vez de un destello verde sobre el panel, la carta hace el mismo zoom de Thor (viaja al centro, gira una vuelta y crece hasta 2.4×), la pantalla solo se oscurece (sin lluvia), y el remate es el círculo mágico de `Referencias/circulo_dr_strange.gif`, que hace desaparecer la carta. Después de la secuencia destella la curación en el panel del jugador. La imagen de referencia de la carta ya está en el repo: `Referencias/dd_strange.webp`.

## Scope

**In:**

- La carta `potion` pasa a ser **Doctor Strange**: tipo `heal`, costo 2 (antes 1), valor 8 (antes 7), 1 copia en el mazo (sin cambio).
- Arte completo de Doctor Strange en pixel art (sprite `doctorStrange`, 66×94, a ×2 = 132×188), remuestreado desde `Referencias/dd_strange.webp` con un script fuera del repo, igual que SPEC 05, 07 y 08:
  - Muestreo puntual (`NEAREST`) y cuantización a ~24 colores.
  - Sin transparencias: marco y fondo van dentro del sprite.
  - El nombre "DOCTOR STRANGE" va horneado en el arte.
  - Los medallones de la referencia (si los tiene) se borran del arte y se rellenan con el fondo cercano.
- Paleta `DOCTOR_STRANGE_PALETTE` en `js/sprites.js`.
- Medallón de costo (izquierda) y de valor (derecha) en HTML, con el marcado hero existente (`heroCardMarkup`). El valor usa el color de curación (`.card--heal .card__value`).
- **Zoom de salida** (igual que Thor, SPEC 07): al jugar la carta, una copia visual viaja al centro de la pantalla, gira una vuelta (`rotateY`) y crece hasta 2.4× (700 ms, `ease-in-out`, sin pixel art). La copia tiene frente (la carta) y reverso (`assets/card-back.webp`), como en Thor. Reutiliza `playCardExit` de SPEC 07.
- **Oscurecimiento:** la pantalla se oscurece con `.scene-dim` (opacidad 0.78) durante el zoom. **No** hay lluvia (a diferencia de Thor).
- **Círculo mágico:** al terminar el zoom, aparece el círculo de `Referencias/circulo_dr_strange.gif` centrado en la carta. La carta se queda en zoom 500 ms (`STRANGE_HOLD_MS`) y luego se achica hasta 0 dentro del círculo durante la misma duración (no se desvanece). La animación del círculo dura un solo ciclo del GIF con cuadros intermedios (54 cuadros a 40 ms, 2160 ms, para que el portal quede abierto más tiempo sin bajar los fps).
  - El GIF tiene fondo negro. Se convierte en una tira con transparencia: el brillo del cuadro se usa como alfa (mismo método que la tira del escudo de SPEC 08 y el rayo de SPEC 07), para que el fondo desaparezca sobre la pantalla oscurecida.
  - Tira en grilla de 8×4 cuadros de 200×200 px (27 cuadros usados, 5 vacíos), generada desde el primer ciclo del GIF con un script fuera del repo y guardada en `assets/strange-circle.webp` (WebP para que pese menos). Se recorre con `background-position` y `step-end` en cada keyframe, una sola vez (sin bucle).
  - Tamaño del círculo: 420 px de lado, con `max-width: 90vw` para que quepa a 375 px.
  - Es un efecto suave, no pixel art, porque el GIF de referencia no lo es. Se acepta ese contraste con el resto de las cartas.
- Al terminar el círculo: se quita la copia de la carta y el círculo, se apaga `.scene-dim` y se aplica la curación visual: `flash(els.playerPanel, 'is-heal')` (destello verde corto).
- Clase `.is-heal` en `css/styles.css` (destello verde corto, solo `opacity` y `box-shadow`), con la duración `HEAL_FLASH_MS = 300`.
- Actualizar `docs/hero-cards-iron-man-thor-hulk.md` para marcar Hulk como descartado y Doctor Strange como su reemplazo en la carta de curación.
- **Salida compartida (Capitán América e Iron Man):** `EXPLOSION_EXIT` en `ui.js` (zoom al centro y explosión de Thor, sin lluvia). `THOR_EXIT` lo extiende con lluvia y el rayo. Capitán América usa `shieldThrow` con `exit: EXPLOSION_EXIT` y su escudo sale del centro. Iron Man usa `effect: 'armorBurst'` con `exit: EXPLOSION_EXIT`; su escudo sigue siendo el de `renderHeroShields()`.

**Out of scope (for future specs):**

- Hulk: queda descartado de esta serie. Si se quiere un Hulk de autodaño, va en su propia spec.
- Cambio de id: la carta conserva el id `potion` (ver Decisiones).
- Sonido del círculo o de la curación.
- Cambios en `game.js` o en las reglas de curación, daño o escudo.
- Cambios en `STARTER_DECK`.
- Carta en reposo o animaciones de entrada de la mano.
- Cargar archivos de `Referencias/` en el juego (solo son fuente; el GIF y la carta se convierten a `assets/`).

## Data model

Cambios en `js/cards.js`. Sin estado de juego nuevo.

```js
const HEAL_FLASH_MS = 300; // destello verde del panel al curar

CARD_LIBRARY.potion = {
  name: 'Doctor Strange',
  type: CARD_TYPES.HEAL,
  cost: 2,
  value: 8,
  description: 'Invoca magia de sanación: recuperas 8 de vida.',
  sprite: 'doctorStrange',
  effect: 'healCircle',
};
```

Constantes de presentación en `js/ui.js` (no en `cards.js`):

```js
const STRANGE_ZOOM_MS = 700;   // zoom de la copia, igual que Thor
const STRANGE_HOLD_MS = 500; // la carta queda en zoom antes de absorberse
const STRANGE_FRAME_MS = 40;
const STRANGE_CIRCLE_MS = 27 * STRANGE_FRAME_MS; // un ciclo del GIF: 27 cuadros a 80 ms
// La carta se achica hasta 0 dentro del círculo durante STRANGE_CIRCLE_MS (leave: 'absorb').
```

En `js/ui.js`, una entrada en `CARD_EFFECTS` con la misma forma que la de Thor (SPEC 07):

```js
healCircle: {
  play: (fromRect, cardEl, done) => playCircleExit(cardEl, fromRect, () => {
    flash(els.playerPanel, 'is-heal');
    done();
  }),
  durationMs: STRANGE_ZOOM_MS + STRANGE_CIRCLE_MS,
  exitFirst: true,
},
```

Convenciones:

- `game.js` no cambia: `createCard` ya copia todos los campos de `CARD_LIBRARY`.
- La curación real ya se aplicó al jugar la carta. El destello del panel solo se muestra al final de la secuencia.
- La salida de Thor y la de Doctor Strange comparten la misma función de zoom. `playCardExit` acepta el remate (explosión o círculo) y si lleva lluvia. Thor no cambia de comportamiento.
- `STARTER_DECK` no cambia: `potion` sigue con 1 copia, así que el mazo sigue en 8 cartas.

## Implementation plan

1. **Datos y curación sin arte nuevo.** En `cards.js`, `potion` pasa a nombre `Doctor Strange`, costo 2, valor 8, descripción nueva y `effect: 'healCircle'`; se agrega `HEAL_FLASH_MS`. En `styles.css`, se agrega `.is-heal`. Sin `sprite` todavía. Prueba: la carta dice Doctor Strange, cuesta 2, cura 8 sin pasar de 30 de vida y el panel destella en verde al final (el círculo aún no existe, así que la carta se juega sin remate visual).
2. **Zoom y oscurecimiento.** En `ui.js`, extraer el zoom de Thor en `playCardExit(cardEl, fromRect, { rain, finale, done })`: clona la carta, la lleva al centro con `card-hero-zoom` (700 ms, 2.4×, `rotateY` de una vuelta) y agrega `.scene-dim`. `rain: true` mantiene la lluvia de Thor; `finale` recibe el remate. Thor pasa `{ rain: true, finale: playExplosion }`. Prueba: jugar Thor se ve igual que antes; jugar Doctor Strange se ve la carta creciendo y la pantalla oscura, sin lluvia.
3. **Círculo mágico.** Convertir `Referencias/circulo_dr_strange.gif` en `assets/strange-circle.png` (grilla 8×7 de 200×200, alfa desde el brillo) con un script fuera del repo. En `ui.js`, `playCircleExit(cardEl, fromRect, done)` usa `playCardExit` con `finale` que crea un `span` `.strange-circle` centrado en la carta. En `styles.css`, `@keyframes strange-circle-frames` mueve `background-position` con `steps(55)` en 2200 ms, y `@keyframes strange-card-fade` desvanece la copia en 400 ms al inicio del círculo. Al terminar, `done` quita el círculo y apaga `.scene-dim`. Prueba: la carta crece, se desvanece dentro del círculo, el círculo termina y la pantalla vuelve a la normalidad.
4. **Arte de Doctor Strange.** Remuestrear `Referencias/dd_strange.webp` a 66×94 con un script fuera del repo. En `sprites.js`, agregar `DOCTOR_STRANGE_PALETTE` y el sprite `doctorStrange`. En `cards.js`, agregar `sprite: 'doctorStrange'` a `potion`. Prueba: la carta se ve como la referencia, con medallón de costo 2 a la izquierda y de valor 8 (verde) a la derecha, y el nombre abajo.
5. **Cierre de la serie.** Actualizar `docs/hero-cards-iron-man-thor-hulk.md`. Prueba: partida completa jugando las tres cartas de la serie (Thor, Iron Man, Doctor Strange), con victoria y derrota.

## Acceptance criteria

- [ ] `CARD_LIBRARY.potion` tiene nombre `Doctor Strange`, tipo `heal`, costo 2, valor 8, `sprite: 'doctorStrange'` y `effect: 'healCircle'`.
- [ ] `STARTER_DECK` no cambia (1 copia de `potion`, mazo de 8 cartas).
- [ ] `CARD_LIBRARY` no tiene `name` duplicado en ninguna carta.
- [ ] `ui.js` no tiene ningún `if` por nombre de sprite; el efecto sale de `card.effect` y `CARD_EFFECTS`.
- [ ] `doctorStrange` tiene 94 filas de 66 caracteres y todos sus caracteres existen en `DOCTOR_STRANGE_PALETTE` (o son `.`).
- [ ] La carta se ve como la referencia: arte completo, medallón de costo (izquierda), medallón de valor verde (derecha), "DOCTOR STRANGE" en el arte.
- [ ] Al jugar Doctor Strange la carta viaja al centro, gira una vuelta y crece hasta 2.4× en 700 ms, igual que Thor.
- [ ] Durante el zoom la pantalla se oscurece (`.scene-dim`) y **no** aparece lluvia.
- [ ] Al terminar el zoom aparece el círculo mágico centrado en la carta; la carta se queda en zoom 500 ms, luego se achica hasta desaparecer dentro de él durante la misma duración, y la animación del círculo dura un solo ciclo (2160 ms).
- [ ] El fondo negro del GIF no se ve: el círculo se ve sobre la pantalla oscurecida sin rectángulo alrededor.
- [ ] Al terminar el círculo se quitan la copia, el círculo y la oscuridad, y el panel del jugador destella en verde (`is-heal`).
- [ ] Jugar Doctor Strange descuenta 2 de energía y sube la vida del jugador en 8.
- [ ] La curación no supera 30 de vida: con 25 de vida, jugarla deja al jugador en 30.
- [ ] Jugar Thor sigue igual que en SPEC 07 (zoom, lluvia, explosión y rayo).
- [ ] El círculo, la copia y el destello se quitan del DOM al terminar.
- [ ] Con `prefers-reduced-motion: reduce` no hay copia, oscuridad ni círculo: el destello del panel se muestra y no queda ningún nodo de animación en el DOM.
- [ ] A 375px el círculo no genera scroll horizontal (la escena tiene `overflow: hidden`).
- [ ] `game.js` no cambia (`git diff` no lo toca).
- [ ] `docs/hero-cards-iron-man-thor-hulk.md` marca Hulk como descartado y Doctor Strange como la carta de curación.
- [ ] Los archivos JS pasan `node --check`.
- [ ] El juego abre con `file://` sin errores en la consola.
- [ ] Se puede jugar una partida completa, con victoria y derrota.

## Decisions

- **Yes:** Doctor Strange reemplaza a Hulk como carta de curación. Hulk como curación no encajaba con el personaje.
- **Yes:** valor de curación 8 y costo 2. Es menos que la propuesta de Hulk (10), para que la curación no sea la carta más fuerte del mazo.
- **Yes:** 1 copia, para que el mazo siga en 8 cartas y no cambie `STARTER_DECK`.
- **Yes:** el id se conserva como `potion` para no tocar `STARTER_DECK`. Solo cambian nombre, costo, valor, descripción, sprite y efecto.
- **Yes:** el zoom es el de Thor (mismo viaje, giro, 2.4× y 700 ms). Lo pidió el usuario.
- **Yes:** la pantalla solo se oscurece, sin lluvia. Lo pidió el usuario: en vez de rayos, oscuridad.
- **Yes:** el remate es el círculo mágico del GIF, y la carta desaparece dentro de él. Lo pidió el usuario: "la carta se haga zoom y luego con el efecto del gif desaparezca".
- **Yes:** el círculo se reproduce una vez, con un solo ciclo de 27 cuadros. El GIF tiene dos ciclos idénticos y usar los 55 cuadros mostraba el portal dos veces.
- **Yes:** la carta se achica dentro del portal en vez de desvanecerse. Lo pidió el usuario: "que la carta se acomode a la animación del portal para desaparecer".
- **Yes:** el fondo negro del GIF se quita con el brillo como alfa, igual que la tira del escudo (SPEC 08) y el rayo (SPEC 07). Así el círculo se ve sin rectángulo sobre la pantalla oscura.
- **Yes:** el círculo es suave, no pixel art, porque el GIF de referencia no lo es. Se acepta ese contraste.
- **Yes:** la curación se muestra al final de la secuencia, no al empezarla, para que el destello caiga cuando la carta ya desapareció.
- **Yes:** la salida de Thor y la de Doctor Strange comparten `playCardExit`, con lluvia y remate como parámetros. Así el zoom no se duplica.
- **No:** círculo en bucle. Se alargaría la secuencia sin que la carta cambie.
- **No:** mantener el destello verde al empezar la secuencia. Lo reemplaza el destello del final.
- **Yes:** el sprite del retrato se remuestrea desde `Referencias/dd_strange.webp` con un script fuera del repo; el juego no carga nada de `Referencias/`.
- **Yes:** Hulk queda fuera de la serie. Si se quiere, va en su propia spec como autodaño.

## Identified risks

| Riesgo | Mitigación |
| --- | --- |
| La secuencia dura ~2.9 s y el jugador puede jugar otra carta mientras tanto | Igual que Thor (SPEC 07): la lógica ya se aplicó y las animaciones pueden solaparse. Si molesta, bloquear la mano en una spec aparte. |
| El alfa desde brillo deja un halo oscuro alrededor del anillo | Revisar la tira antes de integrarla; si pasa, ajustar la curva de alfa en el script, no el CSS. |
| La tira de 8×7 cuadros de 200 px pesa demasiado en móviles | Si pesa mucho, bajar a 160 px por cuadro en el script. |
| Curación de 8 sea débil frente a los 20 del Chasquido | Probar partidas completas; subir a 10 en `cards.js` si el jugador termina demasiado bajo. Es un solo valor. |
| El círculo sea más grande que la pantalla en 375 px | `max-width: 90vw` y `overflow: hidden` en la escena. |
