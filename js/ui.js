// Renderiza el estado del juego en el DOM y conecta los eventos del jugador.

const els = {
  bossCard: document.getElementById('boss-card'),
  bossArt: document.getElementById('boss-art'),
  bossHpText: document.getElementById('boss-hp-text'),
  bossHpFill: document.getElementById('boss-hp-fill'),
  bossShield: document.getElementById('boss-shield'),
  bossSpeech: document.getElementById('boss-speech'),
  playerPanel: document.getElementById('player-panel'),
  playerHpText: document.getElementById('player-hp-text'),
  playerHpFill: document.getElementById('player-hp-fill'),
  playerShield: document.getElementById('player-shield'),
  energy: document.getElementById('energy'),
  hand: document.getElementById('hand'),
  drawCount: document.getElementById('draw-count'),
  discardCount: document.getElementById('discard-count'),
  turnLabel: document.getElementById('turn-label'),
  endTurnBtn: document.getElementById('end-turn-btn'),
  logList: document.getElementById('log-list'),
  endScreen: document.getElementById('end-screen'),
  endTitle: document.getElementById('end-title'),
  endText: document.getElementById('end-text'),
  restartBtn: document.getElementById('restart-btn'),
};

let game = createGame();
let shownSpeechId = null;
let speechTimer = null;
let typingTimer = null;
let pendingSpeech = null; // frase que espera a que termine de escribirse la actual
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function render() {
  renderBoss();
  renderPlayer();
  renderHand();
  renderLog();
  renderEndScreen();
}

function renderBar(textEl, fillEl, hp, maxHp) {
  textEl.textContent = `${hp} / ${maxHp}`;
  fillEl.style.width = `${(hp / maxHp) * 100}%`;
}

function renderShield(el, shield) {
  el.textContent = `🛡️ ${shield}`;
  el.hidden = shield === 0;
}

function renderBoss() {
  const { boss } = game;
  renderBar(els.bossHpText, els.bossHpFill, boss.hp, boss.maxHp);
  renderShield(els.bossShield, boss.shield);

  const isOver = game.phase === 'won' || game.phase === 'lost';
  renderBossSpeech(isOver);
}

// Muestra cada frase nueva durante BOSS_SPEECH_MS. El estado no se limpia: solo se oculta la burbuja.
function renderBossSpeech(isOver) {
  const { speech } = game.boss;
  if (isOver) {
    pendingSpeech = null;
    stopSpeech();
    return;
  }
  if (!speech || speech.id === shownSpeechId) return;

  shownSpeechId = speech.id;
  // Si está escribiendo, la nueva espera (solo la última). Si no, reemplaza en el acto.
  if (typingTimer) {
    pendingSpeech = speech.text;
  } else {
    showSpeech(speech.text);
  }
}

function stopSpeech() {
  clearTimeout(speechTimer);
  clearInterval(typingTimer);
  typingTimer = null;
  els.bossSpeech.hidden = true;
}

// Los 4s cuentan desde que aparece la burbuja, incluida la escritura.
function showSpeech(text) {
  stopSpeech();
  els.bossSpeech.hidden = false;
  speechTimer = setTimeout(() => {
    els.bossSpeech.hidden = true;
  }, BOSS_SPEECH_MS);
  typeSpeech(text);
}

// Pasa las letras de .speech__rest (invisible) a .speech__typed de a una.
function typeSpeech(text) {
  const chars = Array.from(text);
  const typed = createSpeechSpan('speech__typed', '');
  const rest = createSpeechSpan('speech__rest', text);
  const a11y = createSpeechSpan('speech__a11y', text);
  typed.setAttribute('aria-hidden', 'true');
  rest.setAttribute('aria-hidden', 'true');
  els.bossSpeech.replaceChildren(typed, rest, a11y);

  if (reducedMotion.matches) {
    typed.textContent = text;
    rest.textContent = '';
    return;
  }

  let count = 0;
  typingTimer = setInterval(() => {
    count++;
    typed.textContent = chars.slice(0, count).join('');
    rest.textContent = chars.slice(count).join('');
    if (count >= chars.length) {
      clearInterval(typingTimer);
      typingTimer = null;
      showPendingSpeech();
    }
  }, BOSS_SPEECH_CHAR_MS);
}

function showPendingSpeech() {
  if (pendingSpeech === null) return;
  const text = pendingSpeech;
  pendingSpeech = null;
  showSpeech(text);
}

function createSpeechSpan(className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function renderPlayer() {
  const { player } = game;
  renderBar(els.playerHpText, els.playerHpFill, player.hp, player.maxHp);
  renderShield(els.playerShield, player.shield);

  els.energy.innerHTML = '';
  els.energy.setAttribute('aria-label', `Energía ${player.energy} de ${player.maxEnergy}`);
  for (let i = 0; i < player.maxEnergy; i++) {
    const pip = document.createElement('span');
    pip.className = i < player.energy ? 'pip pip--full' : 'pip';
    els.energy.appendChild(pip);
  }

  els.drawCount.textContent = game.drawPile.length;
  els.discardCount.textContent = game.discardPile.length;
  els.turnLabel.textContent = game.phase === 'boss' ? 'Turno de Thanos…' : `Turno ${game.turn}`;
  els.endTurnBtn.disabled = game.phase !== 'player';
}

// Carta con arte propio: el arte ocupa toda la carta; costo, daño y nombre van encima.
function heroCardMarkup(card) {
  return `
    <span class="card__art card__art--hero" aria-hidden="true">${createSpriteSvg(card.sprite)}</span>
    <span class="card__cost">${card.cost}</span>
    <span class="card__value">${card.value}</span>
  `;
}

function standardCardMarkup(card) {
  return `
    <span class="card__cost">${card.cost}</span>
    <span class="card__name">${card.name}</span>
    <span class="card__art" aria-hidden="true">${createSpriteSvg(card.type)}</span>
    <span class="card__type">${CARD_TYPE_LABELS[card.type]}</span>
    <span class="card__desc">${card.description}</span>
  `;
}

function createCardElement(card) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = card.sprite ? `card card--hero card--${card.type}` : `card card--${card.type}`;
  button.dataset.uid = card.uid;
  button.disabled = !canPlayCard(game, card);
  button.setAttribute('aria-label', `${card.name}, costo ${card.cost}. ${card.description}`);
  button.innerHTML = card.sprite ? heroCardMarkup(card) : standardCardMarkup(card);
  return button;
}

function renderHand() {
  els.hand.innerHTML = '';
  game.hand.forEach((card) => els.hand.appendChild(createCardElement(card)));
}

function renderLog() {
  els.logList.innerHTML = '';
  game.log.forEach((entry) => {
    const li = document.createElement('li');
    li.className = `log__item log__item--${entry.kind}`;
    li.textContent = entry.text;
    els.logList.appendChild(li);
  });
}

function renderEndScreen() {
  const isOver = game.phase === 'won' || game.phase === 'lost';
  els.endScreen.hidden = !isOver;
  if (!isOver) return;

  const won = game.phase === 'won';
  els.endScreen.dataset.result = game.phase;
  els.endTitle.textContent = won ? '¡Victoria!' : 'Derrota';
  els.endText.textContent = won
    ? `Derrotaste a Thanos en ${game.turn} ${game.turn === 1 ? 'turno' : 'turnos'}.`
    : 'Thanos chasqueó los dedos… Inténtalo de nuevo.';
  els.restartBtn.focus();
}

// Reinicia la animación aunque la clase ya estuviera puesta.
function flash(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

// Lanza el escudo de Capitán América desde la carta hasta Thanos. Solo es visual:
// el daño ya se aplicó en game.js. Con reducción de movimiento no se crea nada.
function throwShield(fromRect, toRect) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SHIELD_HALF_PX = 23; // mitad del sprite de 46px (23 celdas a ×2)
  const fromX = fromRect.left + fromRect.width / 2;
  const fromY = fromRect.top + fromRect.height / 2;
  const toX = toRect.left + toRect.width / 2;
  const toY = toRect.top + toRect.height / 2;

  const shield = document.createElement('span');
  shield.className = 'shield-throw';
  shield.innerHTML = createSpriteSvg('captainShield');
  shield.style.left = `${fromX - SHIELD_HALF_PX}px`;
  shield.style.top = `${fromY - SHIELD_HALF_PX}px`;
  shield.style.setProperty('--dx', `${toX - fromX}px`);
  shield.style.setProperty('--dy', `${toY - fromY}px`);
  shield.style.animationDuration = `${SHIELD_THROW_MS}ms`;
  shield.addEventListener('animationend', () => shield.remove());
  document.body.appendChild(shield);
}

function handleHandClick(event) {
  const cardEl = event.target.closest('[data-uid]');
  if (!cardEl || cardEl.disabled) return;

  const card = game.hand.find((c) => c.uid === Number(cardEl.dataset.uid));
  const fromRect = cardEl.getBoundingClientRect();
  const bossHpBefore = game.boss.hp;
  const bossShieldBefore = game.boss.shield;
  if (!playCard(game, Number(cardEl.dataset.uid))) return;

  const bossHit = game.boss.hp < bossHpBefore || game.boss.shield < bossShieldBefore;
  if (card.sprite === 'captainAmerica') {
    // El golpe se muestra cuando el escudo llega a Thanos.
    throwShield(fromRect, els.bossCard.getBoundingClientRect());
    if (bossHit) setTimeout(() => flash(els.bossCard, 'is-hit'), SHIELD_THROW_MS);
  } else if (bossHit) {
    flash(els.bossCard, 'is-hit');
  }
  render();
}

function handleEndTurn() {
  if (!endPlayerTurn(game)) return;
  render();

  setTimeout(() => {
    const playerHpBefore = game.player.hp;
    runBossTurn(game);
    flash(els.bossCard, 'is-acting');
    if (game.player.hp < playerHpBefore) flash(els.playerPanel, 'is-hit');
    render();
  }, BOSS_TURN_DELAY_MS);
}

function handleRestart() {
  game = createGame();
  render();
}

[els.bossCard, els.playerPanel].forEach((el) => {
  el.addEventListener('animationend', () => el.classList.remove('is-hit', 'is-acting'));
});
els.hand.addEventListener('click', handleHandClick);
els.endTurnBtn.addEventListener('click', handleEndTurn);
els.restartBtn.addEventListener('click', handleRestart);

// El retrato no depende del estado: se dibuja una sola vez.
// Dos frames apilados; el de destello se muestra solo desde CSS.
els.bossArt.innerHTML = `
  <span class="boss-art__frame">${createSpriteSvg('thanos')}</span>
  <span class="boss-art__frame boss-art__frame--glow">${createSpriteSvg('thanosGlow')}</span>
`;
render();
