const CARD = {
  name: "Chromakopia",
  headline: "ST. BIRTHDAY",
  tagline: "Green lights. Black smoke. Mic hot. Cake louder than the drop.",
  message:
    "Track 00 — Dedication:\n\nHappy birthday to the sibling who treats soccer like a concept album: long runtime, strong opinions, zero skips on matchday.\n\nThis set is heavy on bass, light on doubt. Speakers up, smoke on, candles lit. If the year were a tour, you’d still be first on the poster.\n\nKeep the mic. Keep the highlights. Keep arguing about offside like it’s scripture.\n\nThe booth is yours.",
  closer: "That's the set. Blow the candles. Replay the drop.",
  photos: [
    {
      title: "Main Character",
      caption: "Jersey era. Opening track.",
    },
    {
      title: "Neon Encore",
      caption: "Bonus track.",
    },
  ],
  music: "public/music.mp3",
  sfx: {
    start: "public/sfx/open.wav",
    drop: "public/sfx/blow.wav",
  },
};

const CONFETTI_COLORS = ["#2fbf55", "#3dff7a", "#0d3d1c", "#ff7a1a", "#f2f2f0", "#050705"];

const startButton = document.getElementById("start");
const muteButton = document.getElementById("mute");
const deck = document.getElementById("deck");
const brandEl = document.getElementById("brand-name");
const headlineEl = document.getElementById("headline");
const taglineEl = document.getElementById("tagline");
const statusValue = document.getElementById("status-value");
const messagePanel = document.getElementById("message-panel");
const messageEl = document.getElementById("message");
const archivePanel = document.getElementById("archive-panel");
const archiveHint = document.getElementById("archive-hint");
const carousel = document.getElementById("carousel");
const carouselDots = document.getElementById("carousel-dots");
const closerPanel = document.getElementById("closer-panel");
const closerLine = document.getElementById("closer-line");
const musicEl = document.getElementById("music");
const sfxStartEl = document.getElementById("sfx-start");
const sfxDropEl = document.getElementById("sfx-drop");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const bassViz = document.getElementById("bass-viz");

let started = false;
let musicReady = false;
let activeDot = 0;
let confettiTimer = 0;
let audioCtx = null;

brandEl.textContent = CARD.name;
headlineEl.textContent = CARD.headline;
taglineEl.textContent = CARD.tagline;
closerLine.textContent = CARD.closer;
document.title = `${CARD.name} // St. Birthday`;
musicEl.src = CARD.music;
sfxStartEl.src = CARD.sfx.start;
sfxDropEl.src = CARD.sfx.drop;
document.body.classList.add("is-locked");

function buildBassViz() {
  const count = 28;
  for (let i = 0; i < count; i += 1) {
    const bar = document.createElement("span");
    bar.style.animationDelay = `${(i % 7) * 0.08}s`;
    bar.style.animationDuration = `${0.75 + (i % 5) * 0.08}s`;
    bassViz.append(bar);
  }
}

buildBassViz();

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

  if (kind === "start") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    osc.start(now);
    osc.stop(now + 0.43);
    return;
  }

  osc.type = "square";
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.2);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  osc.start(now);
  osc.stop(now + 0.26);
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
    particleCount: 110,
    spread: 74,
    startVelocity: 46,
    scalar: 0.95,
    colors: CONFETTI_COLORS,
  };

  confetti({ ...common, origin: { x: 0.12, y: 0.7 } });
  confetti({ ...common, origin: { x: 0.88, y: 0.7 } });
  confetti({
    particleCount: 36,
    spread: 360,
    startVelocity: 26,
    ticks: 70,
    origin: { x: 0.5, y: 0.48 },
    colors: CONFETTI_COLORS,
  });
}

function drizzle() {
  if (typeof confetti !== "function") return;

  confetti({
    particleCount: 14,
    spread: 55,
    startVelocity: 18,
    gravity: 0.65,
    scalar: 0.7,
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
    if (i <= text.length) {
      window.setTimeout(tick, 22);
    } else {
      messageEl.classList.add("done");
    }
  };

  tick();
}

function setMuteLabel() {
  muteButton.textContent = musicEl.muted ? "Sound off" : "Sound on";
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

function openLightbox(photo, index) {
  if (!photo.src) return;

  const label = photo.title
    ? `Track ${String(index + 1).padStart(2, "0")} — ${photo.title}`
    : photo.caption || "Track photo";
  lightboxImg.src = photo.src;
  lightboxImg.alt = label;
  lightboxCaption.textContent = [label, photo.caption].filter(Boolean).join(" · ");
  lightbox.classList.remove("hidden");
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  lightboxImg.removeAttribute("src");
}

function updateDots() {
  const cards = carousel.querySelectorAll(".carousel-card");
  if (!cards.length) return;

  const scrollLeft = carousel.scrollLeft;
  let nearest = 0;
  let best = Infinity;

  cards.forEach((card, index) => {
    const dist = Math.abs(card.offsetLeft - scrollLeft);
    if (dist < best) {
      best = dist;
      nearest = index;
    }
  });

  if (nearest === activeDot) return;
  activeDot = nearest;
  carouselDots.querySelectorAll("span").forEach((dot, index) => {
    dot.classList.toggle("active", index === activeDot);
  });
}

function buildArchive() {
  carousel.replaceChildren();
  carouselDots.replaceChildren();

  if (!CARD.photos.length) {
    const empty = document.createElement("p");
    empty.className = "carousel-empty";
    empty.textContent =
      "NO TRACKS YET — add images to public/photos/ and list them in CARD.photos";
    carousel.append(empty);
    archiveHint.textContent = "Awaiting masters";
    return;
  }

  const allPlaceholders = CARD.photos.every((photo) => !photo.src);
  archiveHint.textContent = allPlaceholders
    ? "Placeholder tracks"
    : "Swipe · tap to enlarge";

  CARD.photos.forEach((photo, index) => {
    const trackNo = String(index + 1).padStart(2, "0");
    const title = photo.title || `Track ${trackNo}`;
    const hasPhoto = Boolean(photo.src);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "carousel-card";
    button.setAttribute(
      "aria-label",
      hasPhoto ? `Open track ${trackNo}: ${title}` : `Track ${trackNo}: ${title} (placeholder)`
    );
    if (!hasPhoto) button.disabled = true;

    const meta = document.createElement("div");
    meta.className = "track-meta";
    meta.innerHTML = `<span>Track ${trackNo}</span><span>3:0${(index % 9) + 1}</span>`;

    let media;
    if (hasPhoto) {
      media = document.createElement("img");
      media.src = photo.src;
      media.alt = title;
      media.loading = "lazy";
    } else {
      media = document.createElement("div");
      media.className = "photo-placeholder";
      media.setAttribute("role", "img");
      media.setAttribute("aria-label", "Photo placeholder");
      media.innerHTML =
        '<span class="photo-placeholder-mark">★</span><span class="photo-placeholder-text">PHOTO</span>';
    }

    const cap = document.createElement("span");
    cap.className = "cap";
    cap.textContent = title;

    if (photo.caption) {
      const sub = document.createElement("span");
      sub.className = "cap-sub";
      sub.textContent = photo.caption;
      cap.append(sub);
    }

    button.append(meta, media, cap);
    if (hasPhoto) {
      button.addEventListener("click", () => openLightbox(photo, index));
    }
    carousel.append(button);

    const dot = document.createElement("span");
    if (index === 0) dot.classList.add("active");
    carouselDots.append(dot);
  });

  carousel.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateDots);
  });
}

function revealPanels() {
  [messagePanel, archivePanel, closerPanel].forEach((panel) => {
    panel.hidden = false;
  });
}

function startShow() {
  if (started) return;
  started = true;

  startButton.classList.add("hidden");
  document.body.classList.remove("is-locked");
  deck.classList.remove("locked");
  statusValue.textContent = "LIVE";

  playSfx(sfxStartEl, "start");
  burst();
  playSfx(sfxDropEl, "drop");
  confettiTimer = window.setInterval(drizzle, 900);

  revealPanels();
  buildArchive();
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

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.classList.contains("hidden")) {
    closeLightbox();
  }
});
