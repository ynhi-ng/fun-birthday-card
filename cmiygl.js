const CARD = {
  name: "Owen",
  headline: "PERMANENT LICENSE TO EXPLORE",
  tagline:
    "Valid for bac xiu, chaos, and full JUGGERNAUT energy.",
  licenseNo: "NO. OWN-BDAY-23",
  occasion: "Trip Around the Sun, Round 23",
  place: "Sibling HQ",
  date: new Date().toLocaleDateString("en-AU"),
  candles: 3,
  message:
    "Congratulations, you can now say things like `back in my day`. Use this power responsibly.\n\nThis license certifies that you are cleared for another year of BLESS(ED) and LEMONHEAD-level adventures.\n\nThanks for always being there and for putting up with me. Here's to another year of chasing what makes you happy and doing it your own way.\n\nHappy birthday! Keep the sparks! Keep going!",
  closer: "This license grants full freedom to wander, cause chaos, and get lost on purpose.",
  heroPhoto: "public/photos/pic7.JPG",
  music: "public/music.mp3",
  sfx: {
    start: "public/sfx/open.wav",
    blow: "public/sfx/blow.wav",
  },
};

const CONFETTI_COLORS = ["#c6d9c8", "#c62828", "#f4a5c0", "#8ec5e8", "#f2d66b", "#1a1a1a"];

const startButton = document.getElementById("start");
const muteButton = document.getElementById("mute");
const deck = document.getElementById("deck");
const brandEl = document.getElementById("brand-name");
const headlineEl = document.getElementById("headline");
const taglineEl = document.getElementById("tagline");
const licensePhoto = document.getElementById("license-photo");
const licenseNo = document.getElementById("license-no");
const fieldName = document.getElementById("field-name");
const fieldOccasion = document.getElementById("field-occasion");
const fieldPlace = document.getElementById("field-place");
const fieldDate = document.getElementById("field-date");
const signature = document.getElementById("signature");
const messagePanel = document.getElementById("message-panel");
const messageEl = document.getElementById("message");
const trinkets = document.getElementById("trinkets");
const candlesEl = document.getElementById("candles");
const closerPanel = document.getElementById("closer-panel");
const closerLine = document.getElementById("closer-line");
const musicEl = document.getElementById("music");
const sfxStartEl = document.getElementById("sfx-start");
const sfxBlowEl = document.getElementById("sfx-blow");

let started = false;
let musicReady = false;
let confettiTimer = 0;
let audioCtx = null;
let litCount = CARD.candles;

brandEl.textContent = CARD.name;
headlineEl.textContent = CARD.headline;
taglineEl.textContent = CARD.tagline;
closerLine.textContent = CARD.closer;
licensePhoto.src = CARD.heroPhoto;
licenseNo.textContent = CARD.licenseNo;
fieldOccasion.textContent = CARD.occasion;
fieldPlace.textContent = CARD.place;
fieldDate.textContent = CARD.date;
document.title = `${CARD.name} // Call Me If You Get Famous`;
musicEl.src = CARD.music;
sfxStartEl.src = CARD.sfx.start;
sfxBlowEl.src = CARD.sfx.blow;
document.body.classList.add("is-locked");

function ensureAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function synthHit(kind) {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (kind === "blow") {
    const bufferSize = ctx.sampleRate * 0.28;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.45;
    }
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    noise.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.26);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.3);
    return;
  }

  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc2.type = "triangle";
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.setValueAtTime(659.25, now + 0.12);
  osc.frequency.setValueAtTime(783.99, now + 0.24);
  osc2.frequency.setValueAtTime(261.63, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc2.start(now);
  osc.stop(now + 0.56);
  osc2.stop(now + 0.56);
}

async function playSfx(el, fallbackKind) {
  try {
    el.currentTime = 0;
    await el.play();
  } catch {
    synthHit(fallbackKind);
  }
}

function burst() {
  if (typeof confetti !== "function") return;
  const common = {
    particleCount: 90,
    spread: 70,
    startVelocity: 40,
    colors: CONFETTI_COLORS,
  };
  confetti({ ...common, origin: { x: 0.2, y: 0.7 } });
  confetti({ ...common, origin: { x: 0.8, y: 0.7 } });
}

function drizzle() {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: 12,
    spread: 50,
    startVelocity: 16,
    gravity: 0.7,
    origin: { x: Math.random() * 0.8 + 0.1, y: 0 },
    colors: CONFETTI_COLORS,
  });
}

function typeMessage(text) {
  messageEl.textContent = "";
  messageEl.classList.remove("done");
  let i = 0;
  const tick = () => {
    messageEl.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) window.setTimeout(tick, 22);
    else messageEl.classList.add("done");
  };
  tick();
}

function setMuteLabel() {
  muteButton.textContent = musicEl.muted ? "Sound off" : "Sound on";
  muteButton.setAttribute("aria-label", musicEl.muted ? "Unmute music" : "Mute music");
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

function blowOut(button) {
  if (button.classList.contains("out")) return;
  button.classList.add("out");
  button.setAttribute("aria-pressed", "true");
  litCount -= 1;
  playSfx(sfxBlowEl, "blow");

  if (litCount === 0) {
    burst();
  }
}

function buildCandles() {
  candlesEl.replaceChildren();
  litCount = CARD.candles;

  for (let i = 1; i <= CARD.candles; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "candle";
    button.setAttribute("aria-label", `Blow out candle ${i}`);
    button.setAttribute("aria-pressed", "false");
    const flame = document.createElement("i");
    button.append(flame);
    button.addEventListener("click", () => blowOut(button));
    candlesEl.append(button);
  }
}

function revealPanels() {
  [messagePanel, trinkets, closerPanel].forEach((panel) => {
    panel.hidden = false;
  });
}

function startShow() {
  if (started) return;
  started = true;

  startButton.classList.add("hidden");
  document.body.classList.remove("is-locked");
  deck.classList.remove("locked");

  playSfx(sfxStartEl, "start");
  burst();
  confettiTimer = window.setInterval(drizzle, 1000);

  revealPanels();
  buildCandles();
  typeMessage(CARD.message);
  tryPlayMusic();

  window.setTimeout(() => {
    messagePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 350);
}

startButton.addEventListener("click", startShow);
muteButton.addEventListener("click", () => {
  if (!musicReady) return;
  musicEl.muted = !musicEl.muted;
  setMuteLabel();
});
