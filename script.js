const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let width = 0;
let height = 0;
let moonActive = false;
let starsReveal = 0;

const STAR_COUNT = 48;
const REVEAL_LERP = 0.035;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createStar() {
  const bright = Math.random() < 0.18;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: bright ? randomBetween(1.2, 2.2) : randomBetween(0.5, 1),
    phase: randomBetween(0, Math.PI * 2),
    cycle: randomBetween(3.5, 9),
    hue: bright ? randomBetween(210, 240) : randomBetween(200, 220),
    bright,
    spawn: Math.random(),
  };
}

function initStars() {
  stars = Array.from({ length: STAR_COUNT }, createStar);
}

function respawnStar(star) {
  star.x = Math.random() * width;
  star.y = Math.random() * height;
  star.phase = randomBetween(0, Math.PI * 2);
  star.spawn = 0;
}

function starOpacity(star, time) {
  const t = (time * 0.001) / star.cycle + star.phase;
  const wave = (Math.sin(t * Math.PI * 2) + 1) / 2;
  const eased = wave * wave * (3 - 2 * wave);
  const twinkle = eased * (star.bright ? 0.95 : 0.55);
  const born = Math.min(1, Math.max(0, (starsReveal - star.spawn) * 3));
  return twinkle * born;
}

function drawStar(star, opacity) {
  const { x, y, radius, hue, bright } = star;
  const glowScale = bright ? 14 : 8;
  const glowRadius = radius * glowScale;

  ctx.globalCompositeOperation = "lighter";

  const outer = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  outer.addColorStop(0, `hsla(${hue}, 80%, 92%, ${opacity * 0.35})`);
  outer.addColorStop(0.25, `hsla(${hue}, 70%, 75%, ${opacity * 0.12})`);
  outer.addColorStop(0.6, `hsla(${hue}, 60%, 60%, ${opacity * 0.04})`);
  outer.addColorStop(1, "hsla(220, 50%, 80%, 0)");
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  if (bright) {
    const mid = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
    mid.addColorStop(0, `hsla(${hue}, 100%, 98%, ${opacity * 0.7})`);
    mid.addColorStop(0.35, `hsla(${hue}, 90%, 85%, ${opacity * 0.2})`);
    mid.addColorStop(1, "hsla(220, 80%, 90%, 0)");
    ctx.fillStyle = mid;
    ctx.beginPath();
    ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const core = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
  core.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
  core.addColorStop(0.5, `hsla(${hue}, 60%, 90%, ${opacity * 0.5})`);
  core.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
}

function setMoonActive(active) {
  if (active && !moonActive) {
    for (const star of stars) {
      star.spawn = Math.random() * 0.75;
    }
  }
  moonActive = active;
  document.dispatchEvent(
    new CustomEvent("moon-active", { detail: { active } })
  );
}

function animate(time) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  const target = moonActive ? 1 : 0;
  starsReveal += (target - starsReveal) * REVEAL_LERP;

  if (starsReveal < 0.005) {
    requestAnimationFrame(animate);
    return;
  }

  for (const star of stars) {
    const opacity = starOpacity(star, time) * starsReveal;
    if (opacity < 0.03) {
      if (starsReveal > 0.5 && Math.random() < 0.004) {
        respawnStar(star);
      }
      continue;
    }
    drawStar(star, opacity);
  }

  requestAnimationFrame(animate);
}

resize();
initStars();
window.addEventListener("resize", () => {
  resize();
  initStars();
});

requestAnimationFrame(animate);

(function initMoonSpin() {
  const inner = document.querySelector(".moon-inner");
  const moon = document.querySelector(".moon");
  if (!inner || !moon) return;

  let rotation = 0;
  let rafId = null;
  let lastTime = 0;
  let moonToggled = false;
  let pointerOver = false;
  let hitReady = false;
  const degPerSec = 360 / 18;
  const hitCanvas = document.createElement("canvas");
  const hitCtx = hitCanvas.getContext("2d", { willReadFrequently: true });

  function buildHitMap() {
    hitCanvas.width = moon.naturalWidth;
    hitCanvas.height = moon.naturalHeight;
    hitCtx.drawImage(moon, 0, 0);
    hitReady = true;
  }

  if (moon.complete) buildHitMap();
  else moon.addEventListener("load", buildHitMap);

  function isOverMoon(e) {
    if (!hitReady) return false;

    const rect = moon.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const u = Math.floor((localX / rect.width + 0.5) * hitCanvas.width);
    const v = Math.floor((localY / rect.height + 0.5) * hitCanvas.height);

    if (u < 0 || v < 0 || u >= hitCanvas.width || v >= hitCanvas.height) {
      return false;
    }

    const [r, g, b] = hitCtx.getImageData(u, v, 1, 1).data;
    return r + g + b > 30;
  }

  function syncMoonState() {
    inner.classList.toggle("is-hovering", moonToggled);
    inner.classList.toggle("is-toggled", moonToggled);
    setMoonActive(moonToggled);
    if (moonToggled) start();
    else stop();
  }

  function tick(time) {
    if (!lastTime) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    rotation += degPerSec * dt;
    inner.style.transform = `rotate(${rotation}deg)`;
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId) return;
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    lastTime = 0;
    inner.style.transform = `rotate(${rotation}deg)`;
  }

  function updateHover(e) {
    pointerOver = isOverMoon(e);
    moon.style.cursor = pointerOver ? "pointer" : "default";
  }

  moon.addEventListener("mousemove", updateHover);
  moon.addEventListener("click", (e) => {
    if (!isOverMoon(e)) return;
    moonToggled = !moonToggled;
    syncMoonState();
  });
  moon.addEventListener("mouseleave", () => {
    pointerOver = false;
    moon.style.cursor = "";
  });
  moon.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      moonToggled = !moonToggled;
      syncMoonState();
    }
  });
})();
