// Datos del juego: constantes de balance, cartas del jugador y acciones de Thanos.
// Este archivo no contiene lógica ni toca el DOM.

const PLAYER_MAX_HP = 30;
const BOSS_MAX_HP = 70;
const ENERGY_PER_TURN = 3;
const HAND_SIZE = 3;
const BOSS_TURN_DELAY_MS = 800;
const SHIELD_THROW_MS = 450;

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
  },
  heavyStrike: {
    name: 'Golpe pesado',
    type: CARD_TYPES.ATTACK,
    cost: 2,
    value: 13,
    description: 'Inflige 13 de daño.',
  },
  shield: {
    name: 'Escudo',
    type: CARD_TYPES.DEFENSE,
    cost: 1,
    value: 7,
    description: 'Ganas 7 de escudo hasta tu próximo turno.',
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

const BOSS = {
  name: 'Thanos',
  title: 'El Titán Loco',
  maxHp: BOSS_MAX_HP,
};

// Thanos repite estas acciones en orden. La siguiente se muestra como "intención".
const BOSS_ACTIONS = [
  {
    name: 'Puñetazo del Titán',
    type: CARD_TYPES.ATTACK,
    value: 8,
  },
  {
    name: 'Golpe del Guantelete',
    type: CARD_TYPES.ATTACK,
    value: 11,
  },
  {
    name: 'Armadura del Titán',
    type: CARD_TYPES.DEFENSE,
    value: 10,
  },
  {
    name: 'Chasquido',
    type: CARD_TYPES.ATTACK,
    value: 20,
  },
];
