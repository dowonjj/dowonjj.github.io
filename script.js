document.documentElement.dataset.js = "enabled";

(function () {
  "use strict";
  const fireworks = document.getElementById("fireworks");
  if (!fireworks || !window.matchMedia) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;
  let fireworksTimer = null;

  function launchFirework() {
    const burst = document.createElement("span");
    burst.className = "firework-burst";
    burst.style.setProperty("--firework-x", `${12 + Math.random() * 76}%`);
    burst.style.setProperty("--firework-y", `${18 + Math.random() * 58}%`);
    burst.addEventListener("animationend", function () { burst.remove(); }, { once: true });
    fireworks.appendChild(burst);
  }

  function launchWave() {
    for (let burstIndex = 0; burstIndex < 3; burstIndex += 1) {
      window.setTimeout(launchFirework, burstIndex * 140);
    }
  }

  launchWave();
  if (fireworksTimer !== null) window.clearInterval(fireworksTimer);
  fireworksTimer = window.setInterval(launchWave, 1500);
}());
