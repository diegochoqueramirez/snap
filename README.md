# Juego de Cartas vs. Thanos (MVP)

Juego de cartas por turnos para un solo jugador que corre en el navegador. Tú juegas tus cartas contra un boss: **Thanos**, que también es una carta.

> Estado: MVP en desarrollo. Por ahora hay **un solo nivel**.

## Tecnologías

- HTML
- CSS
- JavaScript (vanilla, sin frameworks ni build tools)

## Cómo jugar (local)

1. Clona el repositorio.
2. Abre `index.html` en el navegador.

Si el navegador bloquea algo al abrir el archivo directamente, levanta un servidor local:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Reglas del nivel 1 (propuesta inicial)

| Elemento | Valor |
|---|---|
| Vida del jugador | 30 |
| Vida de Thanos | 70 |
| Energía por turno | 3 |
| Mazo del jugador | 8 cartas |
| Cartas en mano | 3 por turno |

### Flujo de un turno

1. **Turno del jugador:** roba cartas hasta tener 3 en la mano y recupera su energía.
2. Juega cartas pagando su costo de energía.
3. Pulsa **Terminar turno**.
4. **Turno de Thanos:** ejecuta su acción (atacar, defenderse, etc.).
5. Se repite hasta que alguien llegue a 0 de vida.

### Tipos de carta

- **Ataque:** quita vida a Thanos.
- **Defensa:** da escudo que absorbe daño en el siguiente ataque.
- **Curación:** recupera vida del jugador.

### Condiciones de victoria

- **Ganas** si la vida de Thanos llega a 0.
- **Pierdes** si tu vida llega a 0.

## Estructura del proyecto

```
.
├── index.html        # Estructura de la pantalla de juego
├── css/
│   └── styles.css    # Estilos del tablero y las cartas
├── js/
│   ├── cards.js      # Definición de las cartas del jugador y de Thanos
│   ├── game.js       # Estado y lógica del juego (turnos, daño, victoria)
│   └── ui.js         # Renderizado del DOM y eventos de click
├── CLAUDE.md
└── README.md
```

## Roadmap

- [ ] Nivel 1 jugable contra Thanos
- [ ] Animaciones básicas al jugar cartas y recibir daño
- [ ] Más cartas y habilidades especiales de Thanos (Gemas del Infinito)
- [ ] Más niveles / bosses
