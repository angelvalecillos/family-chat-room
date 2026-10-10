import { themePresets } from "./theme-presets.js";

// Aplica variables CSS del tema
export function applyTheme(t){
  const r = document.documentElement;
  r.style.setProperty("--bg", t.bg);
  r.style.setProperty("--surface", t.surface);
  r.style.setProperty("--border", t.border);
  r.style.setProperty("--text", t.text);
  r.style.setProperty("--primary", t.primary);
  r.style.setProperty("--bubble-me-bg", t.bubble_me);
  r.style.setProperty("--bubble-you-bg", t.bubble_you);
  r.style.setProperty("--bubble-me-border", t.bubble_me);
  r.style.setProperty("--bubble-you-border", t.bubble_you);
  r.style.setProperty("--text-me", t.text_me);
  r.style.setProperty("--text-you", t.text_you);
  r.style.setProperty("--input-bg", t.input_bg);
  r.style.setProperty("--input-border", t.input_border);
  r.style.setProperty("--item-bg", t.item_bg);
  r.style.setProperty("--item-active-bg", t.item_active_bg);
  r.style.setProperty("--muted", t.muted);
  r.style.setProperty("--text-muted", t.text_muted);
}

export function setColorScheme(s){ try{ document.documentElement.style.setProperty("color-scheme", s); }catch{} }

export function getThemeByPreset(preset, mode){
  if (preset === "custom") {
    const stored = JSON.parse(localStorage.getItem("theme_custom") || "{}");
    if (stored?.bg) return stored;
    const base = (mode === "light" ? themePresets.default.light : themePresets.default.dark);
    return base;
  }
  const p = themePresets[preset] || themePresets.default;
  return (mode === "light" ? p.light : p.dark);
}

export function updateModeToggleLabel(btn, mode){
  if (!btn) return;
  btn.textContent = mode === "light" ? "🌙 Modo claro" : "🌓 Modo oscuro";
}

// Inicializa UI de temas en cualquier página
export function initThemeUI({
  modeToggleBtn,
  themePresetEl,
  themeModeEl,
  pickers = {},
  settingsSaveBtn,
  settingsModal
} = {}) {
  // Cargar estado inicial
  const preset = localStorage.getItem("themePreset") || "default";
  const mode = localStorage.getItem("themeMode") || "dark";
  const t = getThemeByPreset(preset, mode);
  applyTheme(t);
  setColorScheme(mode);
  updateModeToggleLabel(modeToggleBtn, mode);
  if (themePresetEl) themePresetEl.value = preset;
  if (themeModeEl) themeModeEl.value = mode;

  // Guardar cambios desde modal
  settingsSaveBtn?.addEventListener("click", ()=>{
    const p = themePresetEl?.value || preset;
    const m = themeModeEl?.value || mode;

    if (p === "custom") {
      const base = (m === "light" ? themePresets.default.light : themePresets.default.dark);
      const custom = {
        bg: pickers.bg?.value || base.bg,
        surface: pickers.surface?.value || base.surface,
        border: pickers.border?.value || base.border,
        text: pickers.text?.value || base.text,
        primary: pickers.primary?.value || base.primary,
        bubble_me: pickers.bubble_me?.value || base.bubble_me,
        bubble_you: pickers.bubble_you?.value || base.bubble_you,
        text_me: pickers.text_me?.value || base.text_me,
        text_you: pickers.text_you?.value || base.text_you,
        input_bg: base.input_bg,
        input_border: base.input_border,
        item_bg: base.item_bg,
        item_active_bg: base.item_active_bg,
        muted: base.muted,
        text_muted: base.text_muted
      };
      applyTheme(custom);
      localStorage.setItem("theme_custom", JSON.stringify(custom));
    } else {
      applyTheme(getThemeByPreset(p, m));
    }
    localStorage.setItem("themePreset", p);
    localStorage.setItem("themeMode", m);
    setColorScheme(m);
    updateModeToggleLabel(modeToggleBtn, m);
    if (settingsModal) settingsModal.style.display = "none";
  });

  // Cambios instantáneos de selects
  themePresetEl?.addEventListener("change", ()=>{
    const p = themePresetEl.value;
    const m = themeModeEl?.value || (localStorage.getItem("themeMode") || "dark");
    applyTheme(getThemeByPreset(p, m));
    localStorage.setItem("themePreset", p);
    localStorage.setItem("themeMode", m);
    setColorScheme(m);
    updateModeToggleLabel(modeToggleBtn, m);
  });

  themeModeEl?.addEventListener("change", ()=>{
    const m = themeModeEl.value;
    const p = themePresetEl?.value || (localStorage.getItem("themePreset") || "default");
    applyTheme(getThemeByPreset(p, m));
    localStorage.setItem("themeMode", m);
    setColorScheme(m);
    updateModeToggleLabel(modeToggleBtn, m);
  });

  // Toggle claro/oscuro desde topbar
  modeToggleBtn?.addEventListener("click", ()=>{
    const current = localStorage.getItem("themeMode") || "dark";
    const next = current === "dark" ? "light" : "dark";
    const p = localStorage.getItem("themePreset") || "default";
    applyTheme(getThemeByPreset(p, next));
    localStorage.setItem("themeMode", next);
    setColorScheme(next);
    updateModeToggleLabel(modeToggleBtn, next);
    if (themeModeEl) themeModeEl.value = next;
  });
}