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
let heroShieldShown = false; // si el render anterior mostró el escudo de Iron Man

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
  renderHeroShields();
}

// Escudo de Iron Man: envuelve cada carta hero mientras el jugador tenga escudo.
// Sale del estado, así sobrevive a cada render. Modo según el render anterior:
// 'in' (recién ganado), null (ya estaba, sin animación) u 'out' (Thanos lo destruyó).
function renderHeroShields() {
  const shieldUp = game.player.shield > 0;
  const wasShown = heroShieldShown;
  heroShieldShown = shieldUp;
  if (reducedMotion.matches || (!shieldUp && !wasShown)) return;

  let mode = null;
  if (shieldUp && !wasShown) mode = 'in';
  if (!shieldUp) mode = 'out';
  els.hand.querySelectorAll('.card--hero').forEach((cardEl) => addHeroShield(cardEl, mode));
}

function addHeroShield(cardEl, mode) {
  const shield = document.createElement('span');
  shield.className = mode ? `card__shield card__shield--${mode}` : 'card__shield';
  shield.setAttribute('aria-hidden', 'true');
  shield.style.setProperty('--shield-fade', `${IRON_SHIELD_FADE_MS}ms`);
  if (mode === 'out') {
    // La animación de cuadros es infinita: solo cuenta el fin del fade-out.
    shield.addEventListener('animationend', (event) => {
      if (event.animationName === 'iron-shield-out') shield.remove();
    });
  }
  cardEl.appendChild(shield);
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

// Vuela un elemento desde el centro de la carta hasta el centro de Thanos. Solo es visual:
// el daño ya se aplicó en game.js. Con reducción de movimiento no se crea nada.
function flyFromCard(className, markup, fromRect, toRect, halfPx, durationMs) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fromX = fromRect.left + fromRect.width / 2;
  const fromY = fromRect.top + fromRect.height / 2;
  const toX = toRect.left + toRect.width / 2;
  const toY = toRect.top + toRect.height / 2;

  const el = document.createElement('span');
  el.className = className;
  el.innerHTML = markup;
  el.style.left = `${fromX - halfPx}px`;
  el.style.top = `${fromY - halfPx}px`;
  el.style.setProperty('--dx', `${toX - fromX}px`);
  el.style.setProperty('--dy', `${toY - fromY}px`);
  el.style.animationDuration = `${durationMs}ms`;
  el.addEventListener('animationend', () => el.remove());
  document.body.appendChild(el);
}

function throwShield(fromRect, toRect) {
  const SHIELD_HALF_PX = 23; // mitad del sprite de 46px (23 celdas a ×2)
  flyFromCard('shield-throw', createSpriteSvg('captainShield'), fromRect, toRect, SHIELD_HALF_PX, SHIELD_THROW_MS);
}

// Rayo de Thor: tira de cuadros (sprite lightningStrike) con el impacto sobre la cabeza de Thanos.
// Solo es visual; con reducción de movimiento no se crea nada.
const LIGHTNING_FRAME_PX = 100; // ancho de un cuadro en CSS (50 celdas a ×2)
const LIGHTNING_HEIGHT_PX = 92; // alto del sprite en CSS (46 celdas a ×2)

function dropLightning(bossRect) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const bolt = document.createElement('span');
  bolt.className = 'lightning-strike';
  bolt.innerHTML = createSpriteSvg('lightningStrike');
  // El impacto (base del rayo) cae en el centro de la carta de Thanos.
  const impactY = bossRect.top + bossRect.height / 2;
  bolt.style.left = `${bossRect.left + bossRect.width / 2 - LIGHTNING_FRAME_PX / 2}px`;
  bolt.style.top = `${impactY - LIGHTNING_HEIGHT_PX}px`;
  // El rayo cae desde el borde superior de la pantalla: empieza desplazado hacia arriba lo que mide el trayecto.
  bolt.style.setProperty('--travel', `${-impactY}px`);
  bolt.style.animationDuration = `${LIGHTNING_STRIKE_MS}ms`;
  // La tira de cuadros se desliza dentro de la ventana (el SVG); la caída mueve la ventana entera.
  bolt.querySelector('.sprite').style.animationDuration = `${LIGHTNING_STRIKE_MS}ms`;
  bolt.addEventListener('animationend', (event) => {
    if (event.target === bolt) bolt.remove();
  });
  document.body.appendChild(bolt);
}

// Thor: la carta viaja al centro girando y creciendo, la pantalla se oscurece y empieza a llover.
// Luego la carta explota en el centro y recién después cae el rayo.
// La copia que se anima es solo visual: la mano ya no tiene la carta. Con reducción de movimiento no hay nada que mostrar.
const CARD_ZOOM_MS = 700; // viaje al centro + zoom + giro, ease-in-out
const CARD_MAX_ZOOM = 2.4; // zoom máximo, sin salirse de la pantalla
const CARD_HOLD_MS = 150; // la carta queda grande un momento antes de explotar
const CARD_FADE_MS = 180; // la copia se desvanece mientras la explosión crece
const EXPLOSION_MS = 900; // 9 cuadros de 100 ms
const EXPLOSION_W_PX = 183; // ancho de la ventana de la explosión (61 celdas a ×3)
const EXPLOSION_H_PX = 195; // alto de la explosión (65 celdas a ×3)
const SCENE_FADE_MS = 600; // la pantalla se oscurece
const RAIN_FADE_MS = 900; // la lluvia aparece de a poco
const SCENE_OUT_MS = 900; // tiempo que tarda la escena en apagarse antes de quitarse
const RAIN_DROPS = 70;
// Doctor Strange: la carta se queda en zoom un momento y luego se achica dentro de un portal.
// El GIF repite su ciclo dos veces, así que se usa un solo ciclo de 27 cuadros. Para que el portal dure más sin
// bajar los fps, el ciclo tiene cuadros intermedios (54 en total) y se reproduce a 40 ms por cuadro (2160 ms).
// La carta se achica durante ese mismo tiempo.
const STRANGE_HOLD_MS = 500; // la carta queda en zoom antes de absorberse
const STRANGE_FRAME_MS = 40;
const STRANGE_CIRCLE_FRAMES = 54;
const STRANGE_CIRCLE_MS = STRANGE_CIRCLE_FRAMES * STRANGE_FRAME_MS;
const STRANGE_CIRCLE_PX = 420; // lado del círculo (en CSS se limita a 90vw)

function createRain() {
  const rain = document.createElement('div');
  rain.className = 'scene-rain';
  for (let i = 0; i < RAIN_DROPS; i++) {
    const drop = document.createElement('span');
    drop.className = 'rain-drop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.5 + Math.random() * 0.4}s`;
    drop.style.animationDelay = `${-Math.random()}s`;
    rain.appendChild(drop);
  }
  return rain;
}

// Oscurece la pantalla y, si `withRain`, agrega la lluvia. Devuelve la función que apaga la escena.
function startScene(withRain) {
  const dim = document.createElement('div');
  dim.className = 'scene-dim';
  const layers = [dim];
  if (withRain) layers.push(createRain());
  document.body.append(...layers);
  void dim.offsetWidth; // reflow: las transiciones arrancan desde opacity 0
  layers.forEach((el) => el.classList.add('is-on'));

  return () => {
    layers.forEach((el) => el.classList.remove('is-on'));
    setTimeout(() => layers.forEach((el) => el.remove()), SCENE_OUT_MS);
  };
}

// Explosión centrada en (centerX, centerY), escalada para acompañar el zoom de la carta.
function playExplosion(centerX, centerY, scale) {
  const boom = document.createElement('span');
  boom.className = 'card-explosion';
  boom.innerHTML = createSpriteSvg('cardExplosion');
  boom.style.left = `${centerX - EXPLOSION_W_PX / 2}px`;
  boom.style.top = `${centerY - EXPLOSION_H_PX / 2}px`;
  boom.style.transform = `scale(${scale})`;
  boom.querySelector('.sprite').style.animationDuration = `${EXPLOSION_MS}ms`;
  boom.addEventListener('animationend', () => boom.remove());
  document.body.appendChild(boom);
}

// Copia la carta, la lleva al centro con zoom y giro y ejecuta el remate (`exit.finale`).
// `exit`: { rain, hold, leave: 'fade' | 'absorb', leaveMs, finale(centerX, centerY, zoom), finaleMs, sceneMs }.
// Llama a `done` cuando termina el remate y apaga la escena en `sceneMs`. Con reducción de movimiento, llama a `done` al momento.
function playCardExit(cardEl, fromRect, exit, done) {
  if (reducedMotion.matches) {
    done();
    return;
  }
  const endScene = startScene(exit.rain);
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const fromX = fromRect.left + fromRect.width / 2;
  const fromY = fromRect.top + fromRect.height / 2;
  const zoom = Math.min(
    CARD_MAX_ZOOM,
    (window.innerWidth * 0.9) / fromRect.width,
    (window.innerHeight * 0.9) / fromRect.height,
  );

  // La copia tiene dos caras: la carta (frente) y el reverso. El giro muestra el reverso en la segunda mitad.
  const ghost = document.createElement('div');
  ghost.className = 'card-ghost';
  ghost.style.width = `${fromRect.width}px`;
  ghost.style.height = `${fromRect.height}px`;
  ghost.style.left = `${fromRect.left}px`;
  ghost.style.top = `${fromRect.top}px`;
  const front = cardEl.cloneNode(true);
  front.removeAttribute('data-uid');
  front.classList.add('card-face', 'card-face--front');
  const back = document.createElement('div');
  back.className = 'card-face card-face--back';
  back.innerHTML = '<img src="assets/card-back.webp" alt="" draggable="false">';
  ghost.append(front, back);
  ghost.style.setProperty('--tx', `${centerX - fromX}px`);
  ghost.style.setProperty('--ty', `${centerY - fromY}px`);
  ghost.style.setProperty('--zoom', zoom);
  ghost.style.animationDuration = `${CARD_ZOOM_MS}ms`;
  ghost.addEventListener('animationend', () => {
    setTimeout(() => {
      // La copia sale con `exit.leave`: se desvanece (Thor) o se absorbe por el portal (Doctor Strange).
      ghost.style.setProperty('--exit-ms', `${exit.leaveMs}ms`);
      ghost.style.animationDuration = `${exit.leaveMs}ms`;
      ghost.classList.add(exit.leave === 'absorb' ? 'is-absorbed' : 'is-fading');
      exit.finale(centerX, centerY, zoom);
      setTimeout(() => ghost.remove(), exit.leaveMs);
      setTimeout(done, exit.finaleMs);
      setTimeout(endScene, exit.sceneMs);
    }, exit.hold);
  }, { once: true });
  document.body.appendChild(ghost);
}

// Salida de Thor: la carta explota en el centro (la escena incluye lluvia; el rayo va en `done`).
// Salida con explosión (Thor, Capitán América, Iron Man): la carta explota en el centro y desaparece.
const EXPLOSION_EXIT = {
  rain: false,
  hold: CARD_HOLD_MS,
  leave: 'fade',
  leaveMs: CARD_FADE_MS,
  finale: (centerX, centerY, zoom) => playExplosion(centerX, centerY, zoom * 1.1),
  finaleMs: EXPLOSION_MS,
  sceneMs: EXPLOSION_MS,
};

// Thor además tiene lluvia y el rayo cae después de la explosión.
const THOR_EXIT = {
  ...EXPLOSION_EXIT,
  rain: true,
  sceneMs: EXPLOSION_MS + LIGHTNING_STRIKE_MS,
};

// Salida de Doctor Strange: sin lluvia. La carta se achica dentro del portal y el portal se reproduce una sola vez.
const STRANGE_EXIT = {
  rain: false,
  hold: STRANGE_HOLD_MS,
  leave: 'absorb',
  leaveMs: STRANGE_CIRCLE_MS,
  finale: (centerX, centerY) => playStrangeCircle(centerX, centerY),
  finaleMs: STRANGE_CIRCLE_MS,
  sceneMs: STRANGE_CIRCLE_MS,
};

// Círculo mágico centrado en (centerX, centerY). Solo es visual: la tira se recorre con steps() en CSS.
function playStrangeCircle(centerX, centerY) {
  const circle = document.createElement('span');
  circle.className = 'strange-circle';
  circle.style.left = `${centerX}px`;
  circle.style.top = `${centerY}px`;
  circle.style.width = `${STRANGE_CIRCLE_PX}px`;
  circle.style.height = `${STRANGE_CIRCLE_PX}px`;
  circle.style.animationDuration = `${STRANGE_CIRCLE_MS}ms`;
  circle.addEventListener('animationend', () => circle.remove());
  document.body.appendChild(circle);
}

// Destello verde del panel del jugador al curar.
function flashHeal() {
  els.playerPanel.style.setProperty('--heal-ms', `${HEAL_FLASH_MS}ms`);
  flash(els.playerPanel, 'is-heal');
}

// Efecto visual de cada carta, por `card.effect`. `durationMs` marca cuándo aparece el golpe en Thanos.
// `exit`: cómo sale la carta antes del efecto (si no existe, el efecto empieza al jugarla).
const CARD_EFFECTS = {
  // Capitán América: explota en el centro y luego su escudo vuela desde ese punto hasta Thanos.
  shieldThrow: { play: throwShield, durationMs: SHIELD_THROW_MS, exit: EXPLOSION_EXIT },
  lightningStrike: {
    play: (fromRect, bossRect) => dropLightning(bossRect),
    durationMs: LIGHTNING_STRIKE_MS,
    exit: THOR_EXIT,
  },
  // Iron Man: solo explota; su escudo ya lo dibuja renderHeroShields().
  armorBurst: { play: () => {}, exit: EXPLOSION_EXIT },
  healCircle: { play: flashHeal, exit: STRANGE_EXIT },
};

// Punto del centro de la pantalla, usado como origen cuando la carta ya explotó.
function screenCenterRect() {
  return { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
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
  const effect = CARD_EFFECTS[card.effect];
  if (effect) {
    // El golpe se muestra cuando el efecto llega a Thanos.
    const runEffect = () => {
      // Si la carta explotó antes, el efecto sale del centro de la pantalla.
      const origin = effect.exit ? screenCenterRect() : fromRect;
      effect.play(origin, els.bossCard.getBoundingClientRect());
      if (bossHit) setTimeout(() => flash(els.bossCard, 'is-hit'), effect.durationMs);
    };
    if (effect.exit) playCardExit(cardEl, fromRect, effect.exit, runEffect);
    else runEffect();
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
  heroShieldShown = false; // partida nueva: sin fade-out de un escudo viejo
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
