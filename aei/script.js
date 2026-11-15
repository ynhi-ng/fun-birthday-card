const CARD = {
  name: "Operator",
  headline: "PROTOCOL: BIRTHDAY",
  tagline:
    "Neon rain. Operator online. Shark buddy locked. One more year — full send.",
  message:
    "Incoming transmission — Agent online:\n\nHappy birthday to the operator who queues like it's ranked and still finds room for one more round.\n\nThis year's loadout: Operator scoped, target painted, cake armed, shark buddy swimming cover.\n\nKeep the aim. Keep the chaos. Keep talking smack like it's utility.\n\nThe site is yours. Blow the candles. Defuse later.",
  closer: "Round won. Blow the candles. Queue the next year.",
  music: "public/music.mp3",
  sfx: {
    start: "public/sfx/open.wav",
    drop: "public/sfx/blow.wav",
  },
};

const NEON_COLORS = ["#ff2d95", "#00f0ff", "#d4ff00", "#7a5cff", "#3a7cff"];

const intro = document.getElementById("intro");
const introStatus = document.getElementById("intro-status");
const muteButton = document.getElementById("mute");
const deck = document.getElementById("deck");
const brandEl = document.getElementById("brand-name");
const headlineEl = document.getElementById("headline");
const taglineEl = document.getElementById("tagline");
const messagePanel = document.getElementById("message-panel");
const messageEl = document.getElementById("message");
const closerPanel = document.getElementById("closer-panel");
const closerLine = document.getElementById("closer-line");
const musicEl = document.getElementById("music");
const sfxStartEl = document.getElementById("sfx-start");
const sfxDropEl = document.getElementById("sfx-drop");
const neonStage = document.getElementById("neon-stage");
const cakeButton = document.getElementById("cake");
const candlesEl = document.getElementById("candles");
const cakeHint = document.getElementById("cake-hint");

let started = false;
let musicReady = false;
let neonTimer = 0;
let audioCtx = null;
let candlesLit = true;

brandEl.textContent = CARD.name;
headlineEl.textContent = CARD.headline;
taglineEl.textContent = CARD.tagline;
closerLine.textContent = CARD.closer;
document.title = `${CARD.name} // Protocol Birthday`;
musicEl.src = CARD.music;
sfxStartEl.src = CARD.sfx.start;
sfxDropEl.src = CARD.sfx.drop;
document.body.classList.add("is-locked");

function ensureAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function synthHit(kind) {
  const ctx = ensureAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (kind === "shot") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.23);
    return;
  }

  if (kind === "blow") {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const nGain = ctx.createGain();
    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    nGain.gain.setValueAtTime(0.18, now);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    noise.start(now);
    noise.stop(now + 0.36);
    return;
  }

  if (kind === "start") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.28);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.36);
    return;
  }

  osc.type = "square";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc.start(now);
  osc.stop(now + 0.23);
}

async function playSfx(el, fallbackKind) {
  try {
    el.currentTime = 0;
    await el.play();
  } catch {
    synthHit(fallbackKind);
  }
}

function spawnBeam(opts = {}) {
  const beam = document.createElement("span");
  const color = opts.color || NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  const angle = opts.angle ?? Math.random() * 70 - 35;
  const left = opts.left ?? `${Math.random() * 100}%`;
  const top = opts.top ?? `${Math.random() * 70}%`;
  const width = opts.width ?? `${18 + Math.random() * 42}vw`;
  const kind = opts.kind || "beam";

  beam.className = `neon-fx neon-${kind}`;
  beam.style.setProperty("--neon", color);
  beam.style.left = left;
  beam.style.top = top;
  if (kind === "flare") {
    beam.style.setProperty("--size", width);
  } else {
    beam.style.width = width;
  }
  beam.style.setProperty("--angle", `${angle}deg`);
  neonStage.append(beam);

  window.setTimeout(() => beam.remove(), opts.life || 1400);
}

function neonBurst() {
  document.body.classList.add("neon-live");

  for (let i = 0; i < 8; i += 1) {
    spawnBeam({
      kind: "beam",
      left: `${8 + i * 12}%`,
      top: `${10 + (i % 3) * 18}%`,
      angle: -40 + i * 10,
      width: `${28 + (i % 4) * 8}vw`,
      color: NEON_COLORS[i % NEON_COLORS.length],
      life: 1600,
    });
  }

  for (let i = 0; i < 5; i += 1) {
    spawnBeam({
      kind: "flare",
      left: `${12 + Math.random() * 76}%`,
      top: `${12 + Math.random() * 55}%`,
      width: `${9 + Math.random() * 10}rem`,
      life: 1800,
    });
  }

  spawnBeam({
    kind: "sweep",
    left: "0%",
    top: "35%",
    width: "120vw",
    angle: -8,
    color: "#00f0ff",
    life: 2000,
  });
}

function neonShine() {
  spawnBeam({
    kind: Math.random() > 0.45 ? "beam" : "flare",
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 65}%`,
    angle: Math.random() * 80 - 40,
    width: `${16 + Math.random() * 36}vw`,
    life: 1200,
  });
}

function typeMessage(text) {
  messageEl.textContent = "";
  messageEl.classList.remove("done");
  let i = 0;

  const tick = () => {
    messageEl.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) {
      window.setTimeout(tick, 22);
    } else {
      messageEl.classList.add("done");
    }
  };

  tick();
}

function setMuteLabel() {
  muteButton.textContent = musicEl.muted ? "Audio muted" : "Audio live";
  muteButton.setAttribute(
    "aria-label",
    musicEl.muted ? "Unmute music" : "Mute music"
  );
}

async function tryPlayMusic() {
  try {
    await musicEl.play();
    musicReady = true;
    muteButton.classList.remove("hidden");
    setMuteLabel();
  } catch {
    musicReady = false;
    muteButton.classList.add("hidden");
  }
}

function revealPanels() {
  messagePanel.hidden = false;
  closerPanel.hidden = false;
}

function blowCandles() {
  if (!started || !candlesLit) return;
  candlesLit = false;

  const candles = candlesEl.querySelectorAll(".candle");
  candles.forEach((candle, index) => {
    window.setTimeout(() => {
      candle.classList.remove("lit");
      candle.classList.add("out");
    }, index * 140);
  });

  playSfx(sfxDropEl, "blow");
  cakeButton.classList.add("blown");
  cakeHint.textContent = "wish locked in";
  cakeButton.setAttribute("aria-label", "Candles blown out");

  neonBurst();
}

function openCard() {
  if (started) return;
  started = true;

  intro.classList.add("is-done");
  document.body.classList.remove("is-locked");
  document.body.classList.add("card-open");
  deck.classList.remove("locked");

  playSfx(sfxStartEl, "start");
  neonBurst();
  neonTimer = window.setInterval(neonShine, 700);

  revealPanels();
  typeMessage(CARD.message);
  tryPlayMusic();

  window.setTimeout(() => {
    intro.classList.add("hidden");
  }, 700);

  window.setTimeout(() => {
    messagePanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 500);
}

function runIntro() {
  intro.classList.add("is-playing");
  introStatus.textContent = "Acquiring target…";

  window.setTimeout(() => {
    introStatus.textContent = "Firing…";
    intro.classList.add("is-firing");
    synthHit("shot");
  }, 1100);

  window.setTimeout(() => {
    introStatus.textContent = "Hit confirmed";
    intro.classList.add("is-hit");
  }, 1550);

  window.setTimeout(() => {
    introStatus.textContent = "Opening protocol…";
    openCard();
  }, 2200);
}

cakeButton.addEventListener("click", blowCandles);

muteButton.addEventListener("click", () => {
  if (!musicReady) return;
  musicEl.muted = !musicEl.muted;
  setMuteLabel();
});

window.requestAnimationFrame(() => {
  window.setTimeout(runIntro, 280);
});
