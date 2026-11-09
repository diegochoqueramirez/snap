// Datos del juego: constantes de balance, cartas del jugador, niveles y jefes.
// Este archivo no contiene lógica ni toca el DOM.

const PLAYER_MAX_HP = 30;
const ENERGY_PER_TURN = 3;
const HAND_SIZE = 3;
const BOSS_TURN_DELAY_MS = 800;
const SHIELD_THROW_MS = 450;
const LIGHTNING_STRIKE_MS = 300;
const IRON_SHIELD_FADE_MS = 300; // fade-in y fade-out del escudo de Iron Man
const BOSS_SPEECH_MS = 4000;
const BOSS_SPEECH_CHAR_MS = 40;
const BOSS_HIT_SPEECH_CHANCE = 0.7;

// Entrada del nivel 2 (Galactus). Momento en que empieza cada paso, en ms desde que aparece la pantalla.
// Los pasos se encadenan en ui.js; la duración de cada animación está en styles.css.
const ENTRANCE_MS = {
  back: 0, // contraportada de la carta en el centro
  portal: 800, // anillo y columna azul
  flip: 1200, // la carta gira y muestra a Galactus
  shrink: 2200, // la carta vuelve a su tamaño y sale humo
  space: 3000, // tránsito cósmico con líneas de velocidad
  planet: 3800, // Galactus aparece sobre un planeta
  flash: 5600, // explosión naranja
  board: 6200, // vuelve el tablero y explota la carta del jefe
  end: 8000, // fin de la entrada
};

const CARD_TYPES = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  HEAL: 'heal',
};

const CARD_TYPE_LABELS = {
  attack: 'Ataque',
  defense: 'Defensa',
  heal: 'Curación',
};

const CARD_LIBRARY = {
  strike: {
    name: 'Capitán América',
    type: CARD_TYPES.ATTACK,
    cost: 1,
    value: 6,
    description: 'Lanza su escudo: inflige 6 de daño.',
    sprite: 'captainAmerica',
    effect: 'shieldThrow',
  },
  heavyStrike: {
    name: 'Thor',
    type: CARD_TYPES.ATTACK,
    cost: 2,
    value: 13,
    description: 'Invoca un rayo: inflige 13 de daño.',
    sprite: 'thor',
    effect: 'lightningStrike',
  },
  shield: {
    name: 'Iron Man',
    type: CARD_TYPES.DEFENSE,
    cost: 2,
    value: 11,
    description: 'Activa su armadura: ganas 11 de escudo hasta tu próximo turno.',
    sprite: 'ironMan',
    // Sin `effect`: ui.js dibuja su escudo mientras player.shield > 0.
  },
  potion: {
    name: 'Poción',
    type: CARD_TYPES.HEAL,
    cost: 1,
    value: 7,
    description: 'Recuperas 7 de vida.',
  },
};

const STARTER_DECK = [
  'strike',
  'strike',
  'strike',
  'heavyStrike',
  'heavyStrike',
  'shield',
  'shield',
  'potion',
];

// Cada nivel tiene un jefe. `actions` se repiten en ciclo; la siguiente se muestra como "intención".
// `image`: null usa el retrato pixel art (sprite); una ruta usa esa imagen.
// `lines` de cada acción: frases que dice al ejecutarla (una al azar).
const LEVELS = [
  {
    hasEntrance: false,
    boss: {
      name: 'Thanos',
      title: 'El Titán Loco',
      image: null,
      maxHp: 70,
      introLines: ['LO VOY A GOZAR COMO NO LO PUEDES IMAGINAR!!!!'],
      hitLines: [
        '¿Eso fue un golpe?',
        'Me haces cosquillas.',
        'Interesante… sigue intentándolo.',
        'Pagarás por eso.',
        'Duele… pero no lo suficiente.',
      ],
      actions: [
        {
          name: 'Puñetazo del Titán',
          type: CARD_TYPES.ATTACK,
          value: 8,
          lines: [
            'Siente el peso de un titán.',
            'Arrodíllate.',
            'Esto apenas empieza.',
          ],
        },
        {
          name: 'Golpe del Guantelete',
          type: CARD_TYPES.ATTACK,
          value: 11,
          lines: [
            'El guantelete no perdona.',
            'Cada gema, un golpe.',
            'Tu resistencia es inútil.',
          ],
        },
        {
          name: 'Armadura del Titán',
          type: CARD_TYPES.DEFENSE,
          value: 10,
          lines: [
            '¿Eso es todo lo que tienes?',
            'Nada puede atravesarme.',
            'Paciencia… mi turno llegará.',
          ],
        },
        {
          name: 'Chasquido',
          type: CARD_TYPES.ATTACK,
          value: 20,
          lines: [
            'Soy inevitable.',
            'Con un chasquido, todo termina.',
            'El equilibrio exige un sacrificio.',
          ],
        },
      ],
    },
  },
  {
    hasEntrance: true,
    boss: {
      name: 'Galactus',
      title: 'Devorador de Mundos',
      image: 'assets/galactus.webp',
      maxHp: 100,
      introLines: ['¡Soy Galactus, devorador de mundos!'],
      hitLines: [
        'Un insecto que insiste.',
        'Tu luz es apenas una chispa.',
        'Ni eso me detiene.',
        'Sigue intentándolo.',
      ],
      actions: [
        {
          name: 'Golpe Cósmico',
          type: CARD_TYPES.ATTACK,
          value: 10,
          lines: [
            'Tu mundo es insignificante.',
            'El cosmos no espera.',
            'Eres polvo de estrellas.',
          ],
        },
        {
          name: 'Hambre Cósmica',
          type: CARD_TYPES.ATTACK,
          value: 14,
          lines: [
            'Mi hambre no tiene fin.',
            'Cada mundo me alimenta.',
            'Ni tu planeta me saciará.',
          ],
        },
        {
          name: 'Campo de Energía',
          type: CARD_TYPES.DEFENSE,
          value: 12,
          lines: [
            'Ningún poder me toca.',
            'Soy más antiguo que tus estrellas.',
            'Tu furia me fortalece.',
          ],
        },
        {
          name: 'Devorar el Mundo',
          type: CARD_TYPES.ATTACK,
          value: 25,
          lines: [
            'Devoraré tu mundo.',
            'Este planeta será mi próximo festín.',
            'Todo se convierte en mí.',
          ],
        },
      ],
    },
  },
];
