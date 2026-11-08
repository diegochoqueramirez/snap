// Estado y reglas del juego. No toca el DOM: ui.js lee el estado y lo dibuja.

const LOG_LIMIT = 30;

let nextCardUid = 0;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createCard(cardId) {
  return { uid: nextCardUid++, id: cardId, ...CARD_LIBRARY[cardId] };
}

function createGame() {
  const state = {
    turn: 0,
    phase: 'player', // 'player' | 'boss' | 'won' | 'lost'
    player: {
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      shield: 0,
      energy: 0,
      maxEnergy: ENERGY_PER_TURN,
    },
    boss: {
      name: BOSS.name,
      title: BOSS.title,
      hp: BOSS.maxHp,
      maxHp: BOSS.maxHp,
      shield: 0,
      actionIndex: 0,
    },
    drawPile: shuffle(STARTER_DECK.map(createCard)),
    hand: [],
    discardPile: [],
    log: [],
  };

  addLog(state, '¡Thanos te desafía! Derrótalo antes de que te derrote a ti.', 'info');
  startPlayerTurn(state);
  return state;
}

function addLog(state, text, kind) {
  state.log.unshift({ text, kind });
  if (state.log.length > LOG_LIMIT) state.log.length = LOG_LIMIT;
}

function getBossIntent(state) {
  return BOSS_ACTIONS[state.boss.actionIndex % BOSS_ACTIONS.length];
}

function drawCard(state) {
  if (state.drawPile.length === 0) {
    if (state.discardPile.length === 0) return false;
    state.drawPile = shuffle(state.discardPile);
    state.discardPile = [];
    addLog(state, 'Barajas tu pila de descarte en el mazo.', 'info');
  }
  state.hand.push(state.drawPile.pop());
  return true;
}

function startPlayerTurn(state) {
  state.turn++;
  state.phase = 'player';
  state.player.energy = state.player.maxEnergy;
  state.player.shield = 0;
  while (state.hand.length < HAND_SIZE && drawCard(state)) {
    // roba hasta completar la mano
  }
  addLog(state, `— Turno ${state.turn} —`, 'turn');
}

// Aplica daño respetando el escudo. Devuelve cuánto se bloqueó y cuánto entró.
function applyDamage(target, amount) {
  const blocked = Math.min(target.shield, amount);
  target.shield -= blocked;
  const damage = amount - blocked;
  target.hp = Math.max(0, target.hp - damage);
  return { blocked, damage };
}

function describeDamage(damage, blocked) {
  return blocked > 0 ? `${damage} de daño (${blocked} bloqueado)` : `${damage} de daño`;
}

function canPlayCard(state, card) {
  return state.phase === 'player' && card.cost <= state.player.energy;
}

function playCard(state, uid) {
  const index = state.hand.findIndex((card) => card.uid === uid);
  if (index === -1) return false;

  const card = state.hand[index];
  if (!canPlayCard(state, card)) return false;

  state.player.energy -= card.cost;
  state.hand.splice(index, 1);
  state.discardPile.push(card);

  if (card.type === CARD_TYPES.ATTACK) {
    const { damage, blocked } = applyDamage(state.boss, card.value);
    addLog(state, `Usas ${card.name}: Thanos recibe ${describeDamage(damage, blocked)}.`, 'player');
  } else if (card.type === CARD_TYPES.DEFENSE) {
    state.player.shield += card.value;
    addLog(state, `Usas ${card.name}: ganas ${card.value} de escudo.`, 'player');
  } else if (card.type === CARD_TYPES.HEAL) {
    const healed = Math.min(card.value, state.player.maxHp - state.player.hp);
    state.player.hp += healed;
    addLog(state, `Usas ${card.name}: recuperas ${healed} de vida.`, 'player');
  }

  checkGameOver(state);
  return true;
}

function endPlayerTurn(state) {
  if (state.phase !== 'player') return false;
  state.phase = 'boss';
  return true;
}

function runBossTurn(state) {
  if (state.phase !== 'boss') return;

  // El escudo de Thanos solo dura durante el turno del jugador.
  state.boss.shield = 0;

  const action = getBossIntent(state);
  if (action.type === CARD_TYPES.ATTACK) {
    const { damage, blocked } = applyDamage(state.player, action.value);
    addLog(state, `Thanos usa ${action.name}: recibes ${describeDamage(damage, blocked)}.`, 'boss');
  } else if (action.type === CARD_TYPES.DEFENSE) {
    state.boss.shield += action.value;
    addLog(state, `Thanos usa ${action.name}: gana ${action.value} de escudo.`, 'boss');
  }
  state.boss.actionIndex++;

  checkGameOver(state);
  if (state.phase === 'boss') startPlayerTurn(state);
}

function checkGameOver(state) {
  if (state.boss.hp <= 0) {
    state.phase = 'won';
    addLog(state, '¡Thanos ha caído! Ganaste.', 'info');
  } else if (state.player.hp <= 0) {
    state.phase = 'lost';
    addLog(state, 'Has sido derrotado por Thanos.', 'info');
  }
}
