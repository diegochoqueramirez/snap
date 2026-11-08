# SPEC 06 — Frases de Thanos en burbuja de diálogo

> **Status:** aprovado
> **Depends on:** SPEC 01, SPEC 03, SPEC 04
> **Date:** 2026-11-08
> **Objective:** Hacer que Thanos diga una frase en una burbuja al costado de su carta al empezar la partida, cada vez que actúa y, con 70% de probabilidad, cada vez que recibe una carta de ataque.

## Por qué existe esta spec

Thanos hoy solo "habla" a través de la intención: dice qué va a hacer, pero no tiene personalidad.
Las frases le dan voz al boss y hacen que reaccione a lo que hace el jugador.
SPEC 03 dejó las frases fuera de alcance a propósito; esta spec las agrega en un elemento propio para no mezclarlas con la intención.

## Historial de cambios

- Primera versión: burbuja a la derecha de la carta y, en pantallas angostas, superpuesta arriba de la carta con cola hacia abajo (breakpoint propio de ~720px).
- Revisión durante la implementación (Paso 4): el CSS real ya tiene la caja de intención `.intent` a la **derecha** de la carta, superpuesta (`top: 24px; left: calc(50% + 70px)`; en ≤560px `top: 16px; left: calc(50% + 40px)`, 140px de ancho). La burbuja de frases pasa a la **izquierda**, como espejo de la intención y con su mismo estilo. Ya no hace falta el modo superpuesto ni el breakpoint de ~720px.
- Revisión durante la implementación (Paso 6): en ≤560px la burbuja usa fuente de 8px para que entren las palabras largas.
- Revisión tras el Paso 6: el usuario pidió incluir en esta spec el efecto de escritura (letras que aparecen de a una), que antes estaba fuera de alcance. Se agregan los Pasos 7 y 8.
- Revisión tras el Paso 8: el usuario pidió mover la caja de intención (el "mensaje de ataque") a la esquina inferior derecha de la carta, borde con borde, y sin cola. Antes la caja de intención estaba fuera de alcance. Se agrega el Paso 9.
- Revisión tras el Paso 9: en ≤720px la caja de intención tapaba la vida de Thanos. El usuario pidió **eliminar la caja de intención** y mostrar la próxima acción de Thanos solo en el registro de combate, resaltada en rojo. El Paso 9 queda reemplazado por el Paso 10.

## Scope

**In:**

- Burbuja nueva `#boss-speech` dentro de `.boss-area`.
- La burbuja va a la **izquierda** de la carta de Thanos, arriba (`top: 24px; right: calc(50% + 70px); width: 210px`), con la cola apuntando a la derecha (hacia él).
- En ≤560px: `top: 16px; right: calc(50% + 40px); width: 140px`, sin generar scroll horizontal.
- Estilo: fondo blanco, texto negro, borde de 4px negro, sombra dura `--shadow-hard` y cola de bloques de 4px. Sin `border-radius`, gradientes ni blur.
- Thanos habla en tres momentos:
  - **Inicio de partida:** siempre dice `LO VOY A GOZAR COMO NO LO PUEDES IMAGINAR!!!!`.
  - **Al actuar:** siempre (100%) dice una frase al azar ligada a la acción que ejecuta (cada acción de `BOSS_ACTIONS` tiene sus frases).
  - **Al recibir una carta de ataque:** con 70% de probabilidad dice una frase al azar del grupo de golpe. Cuenta toda carta de tipo `attack`, aunque el escudo bloquee todo el daño.
- Cada frase se muestra **4 segundos**, contados desde que aparece la burbuja (incluyen el tiempo de escritura), y luego la burbuja se oculta.
- **Efecto de escritura:** las letras de la frase aparecen de a una, cada `BOSS_SPEECH_CHAR_MS = 40` ms.
  - La burbuja toma desde el inicio el tamaño de la frase completa: las letras aún no escritas están en el DOM pero invisibles, así la burbuja no crece ni las palabras saltan de línea.
  - Con `prefers-reduced-motion: reduce` la frase aparece completa de una vez.
- Si llega una frase nueva mientras la anterior **se está escribiendo**, la nueva espera a que la anterior termine de escribirse y después empieza. Solo se guarda **una** frase en espera: si llega otra, reemplaza a la que esperaba.
- Si llega una frase nueva cuando la anterior **ya terminó de escribirse**, la reemplaza en el acto y reinicia los 4 segundos.
- Si el golpe deja a Thanos en 0 de vida, no habla (gana la pantalla de victoria).
- En victoria o derrota la burbuja se oculta, se corta la escritura y se descarta la frase en espera.
- Constantes de balance en `cards.js`: `BOSS_SPEECH_MS = 4000`, `BOSS_SPEECH_CHAR_MS = 40` y `BOSS_HIT_SPEECH_CHANCE = 0.7`.
- Las frases viven en `cards.js` para poder editarlas en un solo lugar.
- **Se elimina la caja de intención** (`#boss-intent`, sus estilos `.intent*` y su render en `ui.js`).
- **La próxima acción de Thanos va al registro de combate**, en rojo:
  - Al empezar cada turno del jugador, justo después de `— Turno N —`, se anota la próxima acción con `kind: 'intent'`.
  - Texto de ataque: `Thanos prepara Puñetazo del Titán: atacará por 8.`
  - Texto de defensa: `Thanos prepara Armadura del Titán: ganará 10 de escudo.`
  - Ataque y defensa se ven en rojo (`--attack`).
  - Lo que Thanos **hizo** (`kind: 'boss'`) sigue como está hoy (lila).
  - En victoria o derrota no se anota próxima acción.

**Out of scope (for future specs):**

- Anotar las frases en el registro de combate.
- Otras animaciones de aparición de la burbuja (fade, rebote, etc.).
- Sonido o voz (incluido el "bip" por letra).
- Saltar la escritura con un clic.
- Frases según la vida de Thanos, el turno o la carta específica que lo golpeó.
- Frases distintas cuando el escudo bloquea todo el daño.
- Frase al ganar o perder.
- Cambios en reglas, balance de combate o sprites.
- Cambiar el color o el texto de lo que Thanos hizo (`kind: 'boss'`).
- Resaltar o fijar la próxima acción fuera del registro (por ejemplo, en la etiqueta `Turno N`).
- Ideas de intención más divertida (amenazas, alerta de Chasquido, contador de gemas): van en otra spec.

## Data model

En `js/cards.js` (datos, sin lógica):

```js
const BOSS_SPEECH_MS = 4000;
const BOSS_SPEECH_CHAR_MS = 40;
const BOSS_HIT_SPEECH_CHANCE = 0.7;

const BOSS_LINES = {
  intro: ['LO VOY A GOZAR COMO NO LO PUEDES IMAGINAR!!!!'],
  hit: [
    '¿Eso fue un golpe?',
    'Me haces cosquillas.',
    'Interesante… sigue intentándolo.',
    'Pagarás por eso.',
    'Duele… pero no lo suficiente.',
  ],
};

// Cada acción de BOSS_ACTIONS suma su propio arreglo `lines`:
// Puñetazo del Titán:   'Siente el peso de un titán.', 'Arrodíllate.', 'Esto apenas empieza.'
// Golpe del Guantelete: 'El guantelete no perdona.', 'Cada gema, un golpe.', 'Tu resistencia es inútil.'
// Armadura del Titán:   '¿Eso es todo lo que tienes?', 'Nada puede atravesarme.', 'Paciencia… mi turno llegará.'
// Chasquido:            'Soy inevitable.', 'Con un chasquido, todo termina.', 'El equilibrio exige un sacrificio.'
```

En `js/game.js`, dentro de `state.boss`:

```js
speech: null, // { id: number, text: string } — última frase dicha
```

Convenciones:

- `speech.id` aumenta con cada frase nueva. La UI lo usa para saber que tiene que mostrar la burbuja y reiniciar el timer, aunque el texto se repita.
- `game.js` decide **qué** dice Thanos y **cuándo** (incluido el sorteo del 70%). No conoce los 4 segundos.
- `ui.js` decide **cuánto** se ve: guarda el último `id` mostrado y un único `setTimeout` de `BOSS_SPEECH_MS` que oculta la burbuja. El estado no se limpia al vencer el timer.
- `ui.js` también maneja la escritura: un `setInterval` de `BOSS_SPEECH_CHAR_MS`, una bandera de "escribiendo" y una variable con la frase en espera (`null` o una frase). Nada de esto vive en `game.js`.
- Marcado de la burbuja mientras escribe (ambos con `textContent`):

```html
<div class="speech" id="boss-speech">
  <span class="speech__typed">LO VOY A GO</span><span class="speech__rest">ZAR COMO NO LO PUEDES IMAGINAR!!!!</span>
</div>
```

- `.speech__rest` usa `visibility: hidden`: ocupa su lugar pero no se ve.
- Las frases son texto fijo de `cards.js`; se insertan con `textContent`.

## Implementation plan

1. En `cards.js`, agregar `BOSS_SPEECH_MS`, `BOSS_HIT_SPEECH_CHANCE`, `BOSS_LINES` y el arreglo `lines` en cada acción de `BOSS_ACTIONS`. Prueba: el juego abre y se juega igual que antes.
2. En `game.js`, agregar `speech: null` a `state.boss`, un contador de frases y una función `bossSay(state, lines)` que elige una frase al azar y setea `state.boss.speech`. Llamarla en `createGame` con `BOSS_LINES.intro`. Prueba: en consola, `game.boss.speech.text` es la frase de inicio.
3. En `game.js`, llamar `bossSay` en `runBossTurn` con `action.lines`, y en `playCard` (rama `attack`) solo si `state.boss.hp > 0` y `Math.random() < BOSS_HIT_SPEECH_CHANCE`. Prueba: en consola, `speech.id` sube al terminar turno y en ~7 de cada 10 cartas de ataque.
4. En `index.html`, agregar `<div class="speech" id="boss-speech" hidden aria-live="polite"></div>` dentro de `.boss-area`, junto a `#boss-intent` (no dentro de la carta). En `css/styles.css`, `.speech` en posición absoluta como espejo de `.intent` (`top: 24px; right: calc(50% + 70px); width: 210px`), con su mismo estilo y la cola a la derecha con bloques de 4px. Prueba: quitando `hidden` a mano, la burbuja se ve a la izquierda de Thanos a 1280px, a la misma altura que la intención.
5. En `ui.js`, agregar `els.bossSpeech` y `renderBossSpeech()` dentro de `renderBoss()`: si hay un `speech.id` nuevo, poner el texto, mostrar la burbuja y reiniciar el timer de `BOSS_SPEECH_MS` que la oculta; si la partida terminó, ocultarla y cancelar el timer. Prueba: al abrir se ve la frase de inicio 4s; al terminar turno aparece la frase de la acción.
6. En el bloque `@media (max-width: 560px)` de `styles.css`, espejar los valores de `.intent` (`width: 140px; top: 16px; right: calc(50% + 40px)`) y usar `font-size: 8px; padding: 8px` en `.speech`. Prueba: a 375px y a 600px no hay scroll horizontal y la burbuja no se sale de la pantalla.
7. Efecto de escritura. En `cards.js`, agregar `BOSS_SPEECH_CHAR_MS = 40`. En `styles.css`, `.speech__rest { visibility: hidden; }`. En `ui.js`, al mostrar una frase, escribirla con los dos spans y un `setInterval` que pasa una letra de `.speech__rest` a `.speech__typed` cada 40ms. El timer de 4s arranca al aparecer la burbuja. Con `prefers-reduced-motion: reduce` se pone completa de una vez. En fin de partida se cancelan el intervalo y el timer. Prueba: la frase de inicio se escribe en ~1.8s y la burbuja no cambia de tamaño mientras escribe.
8. Frase en espera. En `ui.js`, si llega una frase con `id` nuevo mientras otra se escribe, guardarla como frase en espera (reemplazando a la que hubiera). Al terminar de escribir, si hay frase en espera, mostrarla. En fin de partida se descarta. Prueba: forzando dos frases seguidas en consola, la primera se escribe completa y después arranca la segunda; forzando tres, se ve la primera y la tercera.
9. Intención abajo a la derecha. En `styles.css`, `.intent` pasa a `top: auto; bottom: 0; left: calc(50% + 105px)` y se elimina `.intent::after`. Agregar `@media (max-width: 720px) { .intent { left: calc(50% + 70px); } }` antes del bloque de 560px, que mantiene `left: calc(50% + 40px)` y pasa a `top: auto; bottom: 0`. Prueba: a 1280px el borde izquierdo de la intención coincide con el derecho de la carta (±1px) y los bordes inferiores coinciden; a 375px y 600px no hay scroll horizontal. **Reemplazado por el Paso 10.**
10. Próxima acción en el registro. En `index.html`, eliminar `#boss-intent`. En `ui.js`, eliminar `els.bossIntent` y el render de la intención en `renderBoss()`. En `styles.css`, eliminar todas las reglas `.intent*` (incluidas las de los bloques de 720px y 560px; el bloque de 720px desaparece). En `game.js`, al final de `startPlayerTurn`, anotar la próxima acción con `addLog(state, ..., 'intent')`. En `styles.css`, `.log__item--intent { color: var(--attack); }`. Prueba: al abrir se ve `Thanos prepara Puñetazo del Titán: atacará por 8.` en rojo justo encima de `— Turno 1 —`; no queda ninguna caja de intención.

## Acceptance criteria

- [ ] El juego abre con `file://` sin errores en la consola.
- [ ] Al abrir o reiniciar la partida, la burbuja muestra `LO VOY A GOZAR COMO NO LO PUEDES IMAGINAR!!!!`.
- [ ] Cada vez que Thanos actúa, la burbuja muestra una frase de la lista de esa acción.
- [ ] Al jugar una carta de ataque que no lo mata, Thanos habla en aproximadamente 7 de cada 10 casos (la constante vale `0.7`).
- [ ] Una carta de ataque totalmente bloqueada por su escudo también puede hacerlo hablar.
- [ ] Las cartas de defensa y curación nunca lo hacen hablar.
- [ ] Si el ataque lo deja en 0 de vida, no aparece frase.
- [ ] Cada frase se oculta 4s después de aparecer la burbuja.
- [ ] Las letras aparecen de a una cada 40ms; la frase de inicio termina de escribirse en ~1.8s.
- [ ] El tamaño de la burbuja no cambia mientras se escribe la frase.
- [ ] Con `prefers-reduced-motion: reduce` la frase aparece completa de una vez.
- [ ] Una frase nueva que llega con la anterior ya escrita la reemplaza en el acto y vuelve a contar 4s desde cero.
- [ ] Una frase nueva que llega mientras la anterior se escribe espera a que termine de escribirse y después empieza.
- [ ] Si llegan varias frases durante la escritura, solo se muestra la última de ellas después.
- [ ] En victoria o derrota la burbuja no se ve, y no reaparece por una frase en espera.
- [ ] La burbuja está a la izquierda de la carta de Thanos, arriba, con la cola apuntando a él (escritorio y ≤560px).
- [ ] La burbuja usa fondo blanco, borde de 4px negro, sombra dura y cola de bloques de 4px; sin `border-radius`, gradientes ni blur.
- [ ] Mostrar u ocultar la burbuja no mueve la carta de Thanos ni la mano.
- [ ] A 375px y a 600px de ancho no hay scroll horizontal.
- [ ] Las frases no aparecen en el registro de combate.
- [ ] `BOSS_SPEECH_MS`, `BOSS_SPEECH_CHAR_MS`, `BOSS_HIT_SPEECH_CHANCE` y todas las frases están en `cards.js`.
- [ ] `game.js` no toca el DOM ni usa timers.
- [ ] No existe `#boss-intent` en el HTML ni reglas `.intent` en el CSS.
- [ ] Al empezar cada turno del jugador, el registro muestra la próxima acción de Thanos justo encima de `— Turno N —`, con el texto `Thanos prepara <acción>: atacará por <N>.` o `Thanos prepara <acción>: ganará <N> de escudo.`
- [ ] La próxima acción se ve en rojo (`--attack`), tanto para ataque como para defensa.
- [ ] Lo que Thanos hizo sigue en lila, como antes.
- [ ] En victoria o derrota no se anota próxima acción.
- [ ] La vida de Thanos (`N / 70`) se lee completa en 1280px, 600px y 375px.
- [ ] Se puede jugar una partida completa (jugar cartas, terminar turno, Thanos actúa, victoria y derrota) igual que antes.

## Decisions

- **Yes:** burbuja aparte, no dentro de la caja de intención. Lo eligió el usuario; separa lo que Thanos dice de lo que va a hacer.
- **No:** frase dentro de `#boss-intent` o solo en el registro.
- **Yes:** burbuja a la izquierda de la carta, espejo de la intención. La intención ocupaba la derecha; así no se tapaban y en ≤560px cabían los mismos 140px. Lo eligió el usuario durante la implementación. Se mantiene a la izquierda aunque la intención después se eliminó.
- **No:** burbuja a la derecha (versión original). Queda encima de la intención.
- **No:** frase a la derecha debajo de la intención. El alto de la intención varía y pueden encimarse; en móvil queda muy cargado un solo lado.
- **No:** reemplazar la intención por 4s mientras habla. Se perdería la próxima acción.
- **No:** burbuja apilada arriba de la intención (con o sin espacio reservado). El usuario prefirió el costado.
- **No:** modo superpuesto con cola hacia abajo y breakpoint de ~720px (versión original). Innecesario con el espejo.
- **Yes:** `#boss-speech` dentro de `.boss-area`, junto a la intención, y no dentro de la carta. Así no la sacude `is-hit`/`is-acting` ni la recorta la carta.
- **Yes:** mismo estilo que `.intent` actual (sin esquinas escalonadas). Las dos burbujas se leen como un par.
- **Yes:** en ≤560px la burbuja usa `font-size: 8px` y `padding: 8px`. Con 11px solo entraban ~9 caracteres por línea y palabras como `IMAGINAR!!!!` o `intentándolo.` se salían de la burbuja. 8px es tamaño nativo de Press Start 2P. Lo eligió el usuario durante la implementación (Paso 6).
- **No:** cortar palabras con `overflow-wrap: anywhere`. Parte palabras a la mitad.
- **No:** ensanchar la burbuja en móvil. Rompe el espejo y se sale por la izquierda a 375px.
- **Yes:** "cada turno" significa al actuar, con una frase ligada a la acción. Lo eligió el usuario; la frase refuerza lo que pasó.
- **No:** frase genérica al inicio del turno del jugador.
- **Yes:** frase de turno al 100%, frase de golpe al 70%. Es la lectura del pedido inicial que confirmó el usuario.
- **Yes:** cuenta toda carta de ataque, aunque el escudo bloquee todo. Regla simple y predecible.
- **No:** frases distintas para golpe bloqueado y golpe con daño. Más contenido sin ganar mucho; puede ir en otra spec.
- **Yes:** sin frase en el golpe que lo mata. La victoria toma el protagonismo.
- **Yes:** todas las frases duran 4s (una sola regla). El usuario eligió 4s para que alcance a leerse la frase de inicio.
- **No:** 1.5s o 2.5s. Cortos para frases largas.
- **No:** frase de turno visible todo el turno. Dos reglas de duración para algo que se resuelve con una.
- **Yes:** frase de inicio fija `LO VOY A GOZAR COMO NO LO PUEDES IMAGINAR!!!!`. La pidió el usuario textual; se respeta tal cual, sin agregar `¡`.
- **Yes:** las demás frases las propone la spec y quedan en `cards.js` para editarlas sin tocar lógica.
- **No:** anotar las frases en el registro. Lo eligió el usuario; el registro queda solo para acciones.
- **Yes:** el sorteo del 70% y la elección de frase van en `game.js`; el timer de 4s va en `ui.js`. Respeta la regla del proyecto: reglas en `game.js`, presentación en `ui.js`, y `game.js` sin timers.
- **Yes:** `speech.id` incremental. Permite reiniciar el timer aunque salga la misma frase dos veces seguidas.
- **Yes:** efecto de escritura dentro de esta spec. Lo pidió el usuario tras el Paso 6, aunque al principio estaba fuera de alcance.
- **Yes:** 40ms por letra. Ritmo de diálogo retro; la frase de inicio tarda ~1.8s.
- **No:** 25ms o 60ms por letra.
- **Yes:** los 4s cuentan desde que aparece la burbuja. Lo eligió el usuario. Con la frase de inicio queda ~2.2s completa en pantalla.
- **No:** contar los 4s desde que termina de escribir.
- **Yes:** una frase nueva espera a que la anterior termine de escribirse. Lo eligió el usuario para que ninguna frase quede cortada a la mitad.
- **No:** cortar la frase que se está escribiendo y empezar la nueva.
- **Yes:** la espera guarda solo una frase (la última). Con varios ataques seguidos una cola larga dejaría a Thanos hablando de golpes viejos; así el retraso máximo es el de una frase.
- **Yes:** la burbuja reserva desde el inicio el tamaño de la frase completa con un span invisible. No crece ni hace saltar palabras de línea.
- **Yes:** con `prefers-reduced-motion: reduce` no hay escritura. Respeta la regla global de movimiento reducido del proyecto.
- **Yes:** la escritura vive en `ui.js` con `setInterval`. Es presentación; `game.js` sigue sin timers.
- **No:** escritura solo con CSS (`steps()` sobre el ancho). No funciona con texto en varias líneas.
- **Yes:** la frase completa va una sola vez en `.speech__a11y` (oculta en pantalla), y los spans que se escriben llevan `aria-hidden`. Si no, el `aria-live` anunciaría la frase de a pedazos cada 40ms.
- **Yes:** caja de intención abajo a la derecha, borde con borde con la carta. Lo pidió el usuario tras el Paso 8.
- **Yes:** borde con borde solo en >720px; en ≤720px la caja queda montada sobre la carta. Pegada por fuera necesita 315px a la derecha del centro y a 600px o 375px se saldría de la pantalla. Lo eligió el usuario.
- **No:** achicar la carta y las cajas en móvil para que entren pegadas. Cambia la carta de Thanos.
- **Yes:** sin cola en la caja de intención. Pegada a la carta ya se lee como parte de Thanos, y la cola quedaría encima del borde de la carta. Lo eligió el usuario.
- **Yes:** eliminar la caja de intención (reemplaza las tres decisiones anteriores). En ≤720px tapaba la vida de Thanos. Lo pidió el usuario tras el Paso 9.
- **Yes:** la próxima acción se anota en el registro de combate al empezar cada turno, en rojo. Lo eligió el usuario; así el aviso no se pierde y no tapa nada.
- **No:** anotar en rojo también lo que Thanos hizo. El usuario pidió resaltar solo la próxima acción.
- **No:** mostrar la próxima acción en la etiqueta `Turno N`. El usuario eligió el registro.
- **Yes:** ataque y defensa en el mismo rojo. Lo pidió el usuario: el rojo marca "lo que viene de Thanos", no el tipo de acción.
- **Yes:** la entrada se agrega en `game.js` (`startPlayerTurn`), como el resto del registro. Es estado del juego, no presentación.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| La burbuja tapa parte del retrato (se superpone 35px a la carta) | Es temporal (4s); se valida que la cara de Thanos siga visible. |
| Una frase larga hace la burbuja más alta y tapa la barra de vida | Las frases son cortas; se valida con la frase de inicio, que es la más larga. |
| A 375px la burbuja se sale por la izquierda | Se prueba a 375px; con `right: calc(50% + 40px)` y 140px de ancho queda dentro. |
| El timer queda vivo al reiniciar la partida | `renderBossSpeech()` cancela el timer anterior siempre que hay frase nueva o la partida termina; `createGame` produce frase nueva con `id` distinto. |
| `speech.id` se reinicia con `createGame` y coincide con el último mostrado | El contador de frases es global en `game.js` (como `nextCardUid`), no se reinicia con la partida. |
| El intervalo de escritura sigue vivo al reiniciar o terminar la partida | Fin de partida cancela intervalo, timer y frase en espera; al reiniciar, la frase de inicio entra como frase nueva. |
| Al reiniciar mientras se escribe, la frase de inicio queda en espera | Si la partida terminó, la escritura ya se cortó y no hay nada escribiéndose; la frase de inicio arranca en el acto. |
| La frase en espera aparece cuando la anterior ya se ocultó por los 4s | No pasa: la escritura (máx. ~1.8s) siempre termina antes de los 4s. |
| La próxima acción en el registro se ve menos que en una caja junto a Thanos | Va en rojo y es la primera línea del turno, arriba del registro. Si se pierde, una spec futura puede destacarla más. |
| El registro se llena más rápido (una línea más por turno) | `LOG_LIMIT = 30` ya recorta las entradas viejas. |

## What is **not** in this spec

- Frases en el registro de combate.
- Otras animaciones de la burbuja, sonido o saltar la escritura con un clic.
- Frases según vida, turno, carta usada o golpe bloqueado.
- Frases de victoria o derrota.
- Cambios en reglas, balance o sprites.
- Cambios en el color o texto de lo que Thanos hizo.
- Ideas de intención más divertida (amenazas, alerta de Chasquido, contador de gemas).

Cada uno de esos, si llega, va en su propia spec.
