# CLAUDE.md

Guía para trabajar en este repositorio.

## Proyecto

Juego de cartas por turnos, **un solo jugador** contra un boss (**Thanos**, representado también como carta). Es un **MVP**: priorizar que funcione y sea simple antes que agregar features. Por ahora solo existe el **nivel 1**.

## Stack y restricciones

- Solo **HTML, CSS y JavaScript vanilla**. Sin frameworks, sin bundlers, sin npm, sin TypeScript.
- **No multijugador**, sin backend, sin base de datos. Todo corre en el navegador.
- Debe poder abrirse con `index.html` directamente. Usar `<script>` clásicos en orden (`cards.js` → `game.js` → `ui.js`), no ES modules, para que funcione con `file://`.
- Sin dependencias externas salvo que se pida explícitamente.

## Arquitectura

- `js/cards.js` — datos puros: definición de cartas (id, nombre, tipo, costo, valor, descripción) y de Thanos (vida, acciones). Sin lógica ni DOM.
- `js/game.js` — estado del juego y reglas (mazo, mano, energía, vida, escudo, turnos, IA de Thanos, victoria/derrota). **No toca el DOM.**
- `js/ui.js` — renderiza el estado en el DOM y conecta eventos. Llama a funciones de `game.js` y luego vuelve a renderizar.
- `css/styles.css` — estilos. Las cartas del jugador y la de Thanos comparten la misma base visual (`.card`), Thanos con una variante (`.card--boss`).

Regla clave: **separar lógica de presentación**. El estado vive en un único objeto en `game.js`; la UI solo lo lee.

## Reglas del nivel 1 (valores iniciales)

- Jugador: 30 de vida, 3 de energía por turno, mazo de 8 cartas, mano de 3.
- Thanos: 70 de vida. Acciones en ciclo: ataque 8 → ataque 11 → escudo 10 → Chasquido 20. Su próxima acción se muestra en pantalla.
- Tipos de carta: `attack`, `defense` (escudo), `heal`.
- Los valores numéricos deben estar como constantes en un solo lugar para poder balancear fácil.

## Convenciones de código

- Código (variables, funciones) en **inglés**; textos visibles al jugador en **español**.
- `camelCase` para variables/funciones, `UPPER_SNAKE_CASE` para constantes, clases CSS en kebab-case (estilo BEM ligero).
- Funciones pequeñas y legibles; evitar abstracciones prematuras.
- Indentación de 2 espacios.

## Cómo probar

Abrir `index.html` en el navegador, o:

```bash
python3 -m http.server 8000
```

Verificar manualmente: jugar cartas, terminar turno, que Thanos actúe, y que se detecte victoria y derrota.

## Commits

Mensajes en inglés, imperativo y cortos, con prefijo convencional (`feat:`, `fix:`, `style:`, `docs:`, `refactor:`).
