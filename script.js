/* =========================================================
   Wedding Invitation — interactions & animations
   ========================================================= */

const CONFIG = {
  groom: "رامي",
  bride: "ساندرا",
  // Egypt is on summer time (UTC+3) until the end of October 2026
  weddingDate: new Date("2026-10-17T21:00:00+03:00"),
  church: "كنيسة رئيس الملائكة ميخائيل",
  hall: "قاعة تريفي أسيوط",
  taglines: [
    "من نفس السكشن… للأبد",
    "عشر سنين صحوبية… وعمر كامل من الحب",
    "ودي لسه البداية…",
  ],
};

const isHall = document.body.dataset.version === "hall";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- names & initials ---------- */
document.querySelectorAll("[data-groom]").forEach((el) => (el.textContent = CONFIG.groom));
document.querySelectorAll("[data-bride]").forEach((el) => (el.textContent = CONFIG.bride));
document.querySelectorAll("[data-initials]").forEach(
  (el) => (el.textContent = `${CONFIG.groom[0]} ♥ ${CONFIG.bride[0]}`)
);

/* ---------- personalised guest name: page.html?to=اسم الضيف ---------- */
const guest = (new URLSearchParams(location.search).get("to") || "").trim().slice(0, 60);
if (guest) {
  document.querySelectorAll("[data-guest]").forEach((el) => (el.textContent = guest));
  document.getElementById("introGuest").hidden = false;
  document.getElementById("guestLine").hidden = false;
  document.title = `${guest} · دعوة زفاف ${CONFIG.groom} و ${CONFIG.bride}`;
}

/* ---------- envelope intro ---------- */
const intro = document.getElementById("intro");
const openBtn = document.getElementById("openBtn");

function openInvitation() {
  if (intro.classList.contains("open")) return;
  intro.classList.add("open");
  heartBurst(window.innerWidth / 2, window.innerHeight / 2, 24);
  setTimeout(() => {
    document.body.classList.remove("locked");
    startTyping();
    revealHero();
  }, 1700);
  setTimeout(() => intro.remove(), 2800);
}

openBtn.addEventListener("click", openInvitation);
document.getElementById("envelope").addEventListener("click", openInvitation);

function revealHero() {
  document.querySelectorAll(".hero .reveal").forEach((el, i) => {
    setTimeout(() => el.classList.add("in"), i * 250);
  });
}

/* ---------- typewriter tagline ---------- */
const typedEl = document.getElementById("typed");
let typingStarted = false;

function startTyping() {
  if (typingStarted) return;
  typingStarted = true;
  if (reduceMotion) {
    typedEl.textContent = CONFIG.taglines[0];
    return;
  }
  let line = 0, char = 0, deleting = false;
  (function step() {
    const text = CONFIG.taglines[line];
    typedEl.textContent = text.slice(0, char);
    if (!deleting && char < text.length) { char++; setTimeout(step, 70); }
    else if (!deleting) { deleting = true; setTimeout(step, 2200); }
    else if (char > 0) { char--; setTimeout(step, 30); }
    else { deleting = false; line = (line + 1) % CONFIG.taglines.length; setTimeout(step, 400); }
  })();
}

/* ---------- falling petals (canvas) ---------- */
const canvas = document.getElementById("petals");
const ctx = canvas.getContext("2d");
const PETAL_COLORS = ["#c9d6ec", "#a9bde0", "#f4d9d4", "#ffffff", "#e9d9b4"];
let petals = [];
let W = 0, H = 0;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const widthChanged = window.innerWidth !== W;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Mobile address bars change only the height while scrolling —
  // keep the petals where they are instead of re-scattering them.
  if (widthChanged) {
    const count = Math.round(Math.min(40, W / 30));
    petals = Array.from({ length: count }, () => makePetal(true));
  }
}

function makePetal(randomY) {
  return {
    x: Math.random() * W,
    y: randomY ? Math.random() * H : -20,
    size: 6 + Math.random() * 9,
    speed: 0.4 + Math.random() * 0.9,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.01 + Math.random() * 0.02,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    flip: Math.random() * Math.PI,
    color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
    alpha: 0.5 + Math.random() * 0.4,
  };
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3); // 3D-ish flutter
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, -p.size);
  ctx.bezierCurveTo(p.size, -p.size, p.size, p.size * 0.6, 0, p.size);
  ctx.bezierCurveTo(-p.size, p.size * 0.6, -p.size, -p.size, 0, -p.size);
  ctx.fill();
  ctx.restore();
}

function animatePetals() {
  ctx.clearRect(0, 0, W, H);
  for (const p of petals) {
    p.sway += p.swaySpeed;
    p.x += Math.sin(p.sway) * 0.8;
    p.y += p.speed;
    p.rot += p.rotSpeed;
    p.flip += 0.03;
    if (p.y > H + 20) Object.assign(p, makePetal(false));
    drawPetal(p);
  }
  requestAnimationFrame(animatePetals);
}

if (!reduceMotion) {
  resizeCanvas();
  animatePetals();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 200);
  });
}

/* ---------- floating hearts in hero ---------- */
const heartsBox = document.getElementById("hearts");
if (!reduceMotion) {
  const symbols = ["♥", "♡", "❤", "✿"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.textContent = symbols[i % symbols.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 10 + Math.random() * 18 + "px";
    s.style.animationDuration = 9 + Math.random() * 10 + "s";
    s.style.animationDelay = Math.random() * 10 + "s";
    s.style.setProperty("--sway", (Math.random() - 0.5) * 160 + "px");
    s.style.setProperty("--rot", (Math.random() - 0.5) * 120 + "deg");
    if (i % 3 === 0) s.style.color = "#c8a96a";
    heartsBox.appendChild(s);
  }
}

/* ---------- photo 3D tilt ---------- */
const photoWrap = document.getElementById("photoWrap");
if (finePointer && !reduceMotion) {
  photoWrap.addEventListener("mousemove", (e) => {
    const r = photoWrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    photoWrap.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  photoWrap.addEventListener("mouseleave", () => (photoWrap.style.transform = ""));
}

/* ---------- countdown ---------- */
const cdEls = {};
document.querySelectorAll("[data-cd]").forEach((el) => (cdEls[el.dataset.cd] = el));

function setNum(el, value) {
  const v = String(value).padStart(2, "0");
  if (el.textContent !== v) {
    el.textContent = v;
    el.classList.remove("tick");
    void el.offsetWidth; // restart animation
    el.classList.add("tick");
  }
}

function updateCountdown() {
  const diff = CONFIG.weddingDate - Date.now();
  if (diff <= 0) {
    document.getElementById("timer").hidden = true;
    document.getElementById("marriedMsg").hidden = false;
    return false;
  }
  setNum(cdEls.days, Math.floor(diff / 86400000));
  setNum(cdEls.hours, Math.floor((diff / 3600000) % 24));
  setNum(cdEls.minutes, Math.floor((diff / 60000) % 60));
  setNum(cdEls.seconds, Math.floor((diff / 1000) % 60));
  return true;
}

if (updateCountdown()) {
  const cdTimer = setInterval(() => { if (!updateCountdown()) clearInterval(cdTimer); }, 1000);
}

/* ---------- scroll reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      if (entry.target.dataset.count) countUp(entry.target);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
);

document
  .querySelectorAll(".reveal, .tl-item, [data-count]")
  .forEach((el) => { if (!el.closest(".hero")) revealObserver.observe(el); });

document.querySelectorAll(".event-card").forEach((el, i) => el.style.setProperty("--d", i * 0.2 + "s"));

/* ---------- number count-up ---------- */
function countUp(el) {
  const target = +el.dataset.count;
  const start = target > 100 ? target - 60 : 0;
  const duration = 1800;
  const t0 = performance.now();
  (function frame(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}

/* ---------- scroll progress + timeline line ---------- */
const progress = document.getElementById("progress");
const timeline = document.getElementById("timeline");
const tlFill = document.getElementById("tlFill");

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;

  const r = timeline.getBoundingClientRect();
  const seen = (window.innerHeight * 0.7 - r.top) / r.height;
  tlFill.style.transform = `scaleY(${Math.max(0, Math.min(1, seen))})`;
}
window.addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
onScroll();

/* ---------- cursor heart trail (desktop) ---------- */
if (finePointer && !reduceMotion) {
  let last = 0;
  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - last < 70) return;
    last = now;
    const h = document.createElement("span");
    h.className = "trail";
    h.textContent = Math.random() > 0.5 ? "♥" : "✦";
    h.style.left = e.clientX + "px";
    h.style.top = e.clientY + "px";
    if (Math.random() > 0.6) h.style.color = "#c8a96a";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1000);
  });
}

/* ---------- heart burst on click / tap ---------- */
function heartBurst(x, y, n = 10) {
  if (reduceMotion) return;
  const symbols = ["♥", "❤", "✦", "✿"];
  const colors = ["#6b86b8", "#c8a96a", "#e57f95", "#1f2a44"];
  for (let i = 0; i < n; i++) {
    const b = document.createElement("span");
    b.className = "burst";
    b.textContent = symbols[i % symbols.length];
    const angle = (Math.PI * 2 * i) / n;
    const dist = 60 + Math.random() * 90;
    b.style.left = x + "px";
    b.style.top = y + "px";
    b.style.color = colors[i % colors.length];
    b.style.setProperty("--x", Math.cos(angle) * dist + "px");
    b.style.setProperty("--y", Math.sin(angle) * dist + "px");
    b.style.setProperty("--r", (Math.random() - 0.5) * 360 + "deg");
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 1100);
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#intro")) return;
  heartBurst(e.clientX, e.clientY, 8);
});

/* ---------- toast ---------- */
const toastEl = document.getElementById("toast");
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

/* ---------- add to calendar (.ics) ---------- */
document.getElementById("calendarBtn").addEventListener("click", () => {
  const names = `${CONFIG.groom} و ${CONFIG.bride}`;
  const place = isHall ? `${CONFIG.church} ثم ${CONFIG.hall}` : CONFIG.church;
  const end = isHall ? "20261017T230000Z" : "20261017T200000Z"; // 2 AM / 11 PM local
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    `UID:wedding-20261017-${isHall ? "hall" : "church"}@invitation`,
    "DTSTAMP:20260101T000000Z",
    "DTSTART:20261017T180000Z",
    `DTEND:${end}`,
    `SUMMARY:فرح ${names} 💍`,
    `LOCATION:${place}`,
    `DESCRIPTION:صلاة الإكليل في ${CONFIG.church} الساعة 9 مساءً${isHall ? ` ثم الاحتفال في ${CONFIG.hall}` : ""}.`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:الفرح بكرة! 💍",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "wedding-17-10-2026.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("تم حفظ الموعد 💙");
});
