// Lógica de zumbido MSN: sonido, vibración y shake
let nudgeEnabled = false;
let nudgeVolume = 0.6;
let audioEl = null;
let convSection = null;

export function initNudgeUI({ nudgeEnabledEl, nudgeVolumeEl, nudgeTestBtn, nudgeAudioEl, conversationSection } = {}) {
  // Estado inicial desde localStorage
  nudgeEnabled = (localStorage.getItem("nudgeEnabled") === "1");
  nudgeVolume = parseFloat(localStorage.getItem("nudgeVolume") || "0.6");

  // DOM refs
  audioEl = nudgeAudioEl || audioEl;
  convSection = conversationSection || convSection;

  // Sincronizar UI
  if (nudgeEnabledEl) nudgeEnabledEl.checked = nudgeEnabled;
  if (nudgeVolumeEl) nudgeVolumeEl.value = String(nudgeVolume);

  // Guardar ajustes
  nudgeEnabledEl?.addEventListener("change", () => {
    nudgeEnabled = !!nudgeEnabledEl.checked;
    localStorage.setItem("nudgeEnabled", nudgeEnabled ? "1" : "0");
  });
  nudgeVolumeEl?.addEventListener("input", () => {
    nudgeVolume = parseFloat(nudgeVolumeEl.value || "0.6");
    localStorage.setItem("nudgeVolume", String(nudgeVolume));
  });

  // Botón de prueba (habilita audio en navegadores que requieren gesto)
  nudgeTestBtn?.addEventListener("click", () => triggerNudge());
}

function beepFallback() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    gain.gain.setValueAtTime(Math.min(Math.max(nudgeVolume, 0), 1), ctx.currentTime);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 200);
  } catch {}
}

export function triggerNudge() {
  if (!nudgeEnabled) return;

  // Vibración móvil (si disponible)
  try { if (navigator.vibrate) navigator.vibrate([20, 30, 20]); } catch {}

  // Sonido con volumen: usar fallback si play() falla
  if (audioEl) {
    audioEl.volume = Math.min(Math.max(nudgeVolume, 0), 1);
    audioEl.currentTime = 0;
    try {
      const p = audioEl.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          // Reproducción OK
        }).catch((err) => {
          console.warn("nudge play() rechazado:", err);
          beepFallback();
        });
      } else {
        // Navegadores antiguos: si no hay promesa, asumimos OK
      }
    } catch (err) {
      console.warn("nudge play() lanzó error:", err);
      beepFallback();
    }
  } else {
    // Sin elemento <audio>, usar beep
    beepFallback();
  }

  // Shake visual en la conversación
  try {
    if (convSection) {
      convSection.classList.add("shake");
      setTimeout(() => convSection.classList.remove("shake"), 450);
    }
  } catch {}
}