import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove,
  collection, onSnapshot, deleteDoc, query, where, getDocs, serverTimestamp, orderBy
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { showErrorModal } from "./error-modal.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const secondApp = initializeApp(firebaseConfig, "secondary");
const secondAuth = getAuth(secondApp);
const secondDb = getFirestore(secondApp);

// Topbar
const modeToggleBtn = document.getElementById("modeToggle");
const addBtn = document.getElementById("addBtn");
const goChatBtn = document.getElementById("goChatBtn");
const settingsBtn = document.getElementById("settingsBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Lista
const membersTbody = document.getElementById("membersTbody");
const listError = document.getElementById("listError");

// Modal miembro
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const firstNameEl = document.getElementById("firstName");
const lastNameEl = document.getElementById("lastName");
const nicknameEl = document.getElementById("nickname");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const password2El = document.getElementById("password2");
const birthDateEl = document.getElementById("birthDate");
const relationEl = document.getElementById("relation");
const relationOtherWrap = document.getElementById("relationOtherWrap");
const relationOtherEl = document.getElementById("relationOther");
const locationEl = document.getElementById("location");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");
const modalError = document.getElementById("modalError");

// Settings modal (tema)
const settingsModal = document.getElementById("settingsModal");
const settingsClose = document.getElementById("settingsClose");
const settingsSaveBtn = document.getElementById("settingsSave");
const themePresetEl = document.getElementById("themePreset");
const themeModeEl = document.getElementById("themeMode");
const pickers = {
  bg: document.getElementById("c_bg"),
  surface: document.getElementById("c_surface"),
  border: document.getElementById("c_border"),
  text: document.getElementById("c_text"),
  primary: document.getElementById("c_primary"),
  bubble_me: document.getElementById("c_bubble_me"),
  bubble_you: document.getElementById("c_bubble_you"),
  text_me: document.getElementById("c_text_me"),
  text_you: document.getElementById("c_text_you"),
};

// Estado
let uid = null;
let familyId = null;
let editingMemberId = null;

/* ===== Temas: presets completos con variantes dark/light ===== */
const themePresets = {
  default: {
    dark:{
      bg:"#0f1220", surface:"#1a1f35", border:"#2a2e46", text:"#e7e7ea", primary:"#6c5ce7",
      bubble_me:"#25306b", bubble_you:"#161a30", text_me:"#e7e7ea", text_you:"#e7e7ea",
      input_bg:"#0f1328", input_border:"#2a2e46",
      item_bg:"#171b2e", item_active_bg:"#1d2240",
      muted:"#2b2f4a", text_muted:"#a7aacc"
    },
    light:{
      bg:"#f4f6fb", surface:"#ffffff", border:"#e1e5ee", text:"#1c2234", primary:"#3b82f6",
      bubble_me:"#e8f0fe", bubble_you:"#f3f4f6", text_me:"#0f172a", text_you:"#0f172a",
      input_bg:"#ffffff", input_border:"#cfd6e6",
      item_bg:"#f3f4f6", item_active_bg:"#dbeafe",
      muted:"#e5e7eb", text_muted:"#6b7280"
    }
  },
  midnight: {
    dark: {
      bg:"#0b1022", surface:"#131a33", border:"#1d2449", text:"#e6e9f4", primary:"#7c69ff",
      bubble_me:"#29316d", bubble_you:"#101631", text_me:"#ffffff", text_you:"#e6e9f4",
      input_bg:"#0d1228", input_border:"#1d2449",
      item_bg:"#141a33", item_active_bg:"#1b2346",
      muted:"#2a315a", text_muted:"#9aa3c7"
    },
    light: {
      bg:"#eef2ff", surface:"#ffffff", border:"#d9def7", text:"#121634", primary:"#5b4ae6",
      bubble_me:"#e6eaff", bubble_you:"#f2f4ff", text_me:"#0c1130", text_you:"#0c1130",
      input_bg:"#ffffff", input_border:"#cfd6f6",
      item_bg:"#f2f4ff", item_active_bg:"#e6eaff",
      muted:"#e0e4fa", text_muted:"#5f68a5"
    }
  },
  forest: {
    dark: {
      bg:"#0f1a14", surface:"#17251d", border:"#24382c", text:"#e7f0e9", primary:"#2ecc71",
      bubble_me:"#1e3a2f", bubble_you:"#132219", text_me:"#e7f0e9", text_you:"#d7e8dc",
      input_bg:"#0f1d16", input_border:"#24382c",
      item_bg:"#16261e", item_active_bg:"#1c3429",
      muted:"#1e2f25", text_muted:"#9eb5a7"
    },
    light: {
      bg:"#f1f7f4", surface:"#ffffff", border:"#d9e7df", text:"#13261d", primary:"#2ab665",
      bubble_me:"#e9f7ef", bubble_you:"#f4f9f6", text_me:"#0f2018", text_you:"#0f2018",
      input_bg:"#ffffff", input_border:"#cfe2d9",
      item_bg:"#f4f9f6", item_active_bg:"#dff1e7",
      muted:"#e3eee8", text_muted:"#5a7a69"
    }
  },
  sunset: {
    dark: {
      bg:"#1a0f12", surface:"#261419", border:"#3a2027", text:"#ffe8e4", primary:"#ff7a59",
      bubble_me:"#3a1f24", bubble_you:"#201116", text_me:"#ffe8e4", text_you:"#ffd7cf",
      input_bg:"#1a1214", input_border:"#3a2027",
      item_bg:"#23161b", item_active_bg:"#2e1b21",
      muted:"#3a2027", text_muted:"#f3c1b9"
    },
    light: {
      bg:"#fff5f2", surface:"#ffffff", border:"#f0d6d0", text:"#3a2027", primary:"#e96341",
      bubble_me:"#fff0ea", bubble_you:"#fff7f4", text_me:"#351d23", text_you:"#351d23",
      input_bg:"#ffffff", input_border:"#e9c9c1",
      item_bg:"#fff7f4", item_active_bg:"#ffdcd2",
      muted:"#f7e0da", text_muted:"#8f5a4f"
    }
  },
  ocean: {
    dark: {
      bg:"#0f172a", surface:"#131c34", border:"#1f2a4a", text:"#e6f1ff", primary:"#38bdf8",
      bubble_me:"#183051", bubble_you:"#11213d", text_me:"#e6f1ff", text_you:"#d7e9ff",
      input_bg:"#0f182c", input_border:"#1f2a4a",
      item_bg:"#12203a", item_active_bg:"#183051",
      muted:"#1f2a4a", text_muted:"#9bb8d6"
    },
    light: {
      bg:"#f0f7ff", surface:"#ffffff", border:"#d6e6f7", text:"#0f172a", primary:"#0ea5e9",
      bubble_me:"#e7f3ff", bubble_you:"#f3f9ff", text_me:"#0f172a", text_you:"#0f172a",
      input_bg:"#ffffff", input_border:"#cfe0f2",
      item_bg:"#f3f9ff", item_active_bg:"#dbeeff",
      muted:"#e4effb", text_muted:"#5a748f"
    }
  },
  matrix: {
    dark: {
      bg:"#0b0f0b", surface:"#121814", border:"#1b241d", text:"#d7f8e5", primary:"#00ff7f",
      bubble_me:"#142a1f", bubble_you:"#0f1c15", text_me:"#d7f8e5", text_you:"#c8f2dc",
      input_bg:"#0e160f", input_border:"#1b241d",
      item_bg:"#131a15", item_active_bg:"#18221b",
      muted:"#1b241d", text_muted:"#9ed8b6"
    },
    light: {
      bg:"#f1fbf5", surface:"#ffffff", border:"#d5eadc", text:"#0f1c15", primary:"#00cc66",
      bubble_me:"#e8f7ee", bubble_you:"#f3fbf6", text_me:"#0f1c15", text_you:"#0f1c15",
      input_bg:"#ffffff", input_border:"#cfe6d6",
      item_bg:"#f3fbf6", item_active_bg:"#def7e7",
      muted:"#e0efe5", text_muted:"#567a68"
    }
  },
  whatsapp: {
    dark: {
      bg:"#0b141a", surface:"#111b21", border:"#1f2c33", text:"#e9edef", primary:"#00a884",
      bubble_me:"#005c4b", bubble_you:"#202c33", text_me:"#e9edef", text_you:"#e9edef",
      input_bg:"#111b21", input_border:"#1f2c33",
      item_bg:"#111b21", item_active_bg:"#202c33",
      muted:"#1f2c33", text_muted:"#8696a0"
    },
    light: {
      bg:"#efeae2", surface:"#ffffff", border:"#d1d7db", text:"#111b21", primary:"#008069",
      bubble_me:"#d9fdd3", bubble_you:"#f0f2f5", text_me:"#111b21", text_you:"#111b21",
      input_bg:"#ffffff", input_border:"#ccd3d7",
      item_bg:"#f0f2f5", item_active_bg:"#e2e6ea",
      muted:"#e2e6ea", text_muted:"#667781"
    }
  },
  telegram: {
    dark: {
      bg:"#0e1621", surface:"#17212b", border:"#25323b", text:"#e3e6ea", primary:"#2aabee",
      bubble_me:"#1e2c38", bubble_you:"#0f1a24", text_me:"#e3e6ea", text_you:"#d3d7dc",
      input_bg:"#0e1621", input_border:"#25323b",
      item_bg:"#17212b", item_active_bg:"#1e2c38",
      muted:"#25323b", text_muted:"#9aa7b2"
    },
    light: {
      bg:"#eaf0f7", surface:"#ffffff", border:"#d7e2ea", text:"#17212b", primary:"#2ca5e0",
      bubble_me:"#e8f3fb", bubble_you:"#f2f6fb", text_me:"#17212b", text_you:"#17212b",
      input_bg:"#ffffff", input_border:"#cfdee8",
      item_bg:"#f2f6fb", item_active_bg:"#e8f3fb",
      muted:"#e1eaf1", text_muted:"#5a6a78"
    }
  },
  msn: {
    dark: {
      bg:"#101010", surface:"#1a1a1a", border:"#2c2c2c", text:"#eaeaea", primary:"#00a2ed",
      bubble_me:"#222222", bubble_you:"#181818", text_me:"#eaeaea", text_you:"#dcdcdc",
      input_bg:"#141414", input_border:"#2c2c2c",
      item_bg:"#1a1a1a", item_active_bg:"#222222",
      muted:"#2c2c2c", text_muted:"#a0a0a0"
    },
    light: {
      bg:"#f7f7f7", surface:"#ffffff", border:"#dddddd", text:"#121212", primary:"#008bd6",
      bubble_me:"#eef6ff", bubble_you:"#f3f3f3", text_me:"#121212", text_you:"#121212",
      input_bg:"#ffffff", input_border:"#d6d6d6",
      item_bg:"#f3f3f3", item_active_bg:"#e6f3ff",
      muted:"#e9e9e9", text_muted:"#666666"
    }
  },
  feminine: {
    dark: {
      bg:"#1a1320", surface:"#23162b", border:"#3a2546", text:"#f8e7ff", primary:"#ff69b4",
      bubble_me:"#3a1f4a", bubble_you:"#1f1430", text_me:"#f8e7ff", text_you:"#f1dbff",
      input_bg:"#1a1426", input_border:"#3a2546",
      item_bg:"#23162b", item_active_bg:"#2e1b36",
      muted:"#3a2546", text_muted:"#e5c3f2"
    },
    light: {
      bg:"#fff0f7", surface:"#ffffff", border:"#f5d6e8", text:"#2b1636", primary:"#e255a3",
      bubble_me:"#ffe6f1", bubble_you:"#fff6fb", text_me:"#2b1636", text_you:"#2b1636",
      input_bg:"#ffffff", input_border:"#efd0e3",
      item_bg:"#fff6fb", item_active_bg:"#ffe6f1",
      muted:"#f5ddea", text_muted:"#7a557f"
    }
  },
  starwars: {
    dark: {
      bg:"#0b0b0b", surface:"#121212", border:"#232323", text:"#f3f3f3", primary:"#ffd700",
      bubble_me:"#1f1f1f", bubble_you:"#111111", text_me:"#f3f3f3", text_you:"#e5e5e5",
      input_bg:"#121212", input_border:"#232323",
      item_bg:"#121212", item_active_bg:"#1f1f1f",
      muted:"#232323", text_muted:"#bdbdbd"
    },
    light: {
      bg:"#fffbea", surface:"#ffffff", border:"#efe3bf", text:"#111111", primary:"#d4af37",
      bubble_me:"#fff4d1", bubble_you:"#fffaf0", text_me:"#111111", text_you:"#111111",
      input_bg:"#ffffff", input_border:"#ebdfb6",
      item_bg:"#fffaf0", item_active_bg:"#fff4d1",
      muted:"#f1e6c4", text_muted:"#6b5a2e"
    }
  },
  spiderman: {
    dark: {
      bg:"#0f0f1a", surface:"#17172b", border:"#2a2a46", text:"#e8e8f4", primary:"#e11d48",
      bubble_me:"#2b2b4a", bubble_you:"#141428", text_me:"#ffffff", text_you:"#e8e8f4",
      input_bg:"#121226", input_border:"#2a2a46",
      item_bg:"#17172b", item_active_bg:"#22224a",
      muted:"#2a2a46", text_muted:"#a9a9cf"
    },
    light: {
      bg:"#f8f8ff", surface:"#ffffff", border:"#e1e1f2", text:"#15152b", primary:"#c81e45",
      bubble_me:"#ffe6ea", bubble_you:"#f2f2ff", text_me:"#15152b", text_you:"#15152b",
      input_bg:"#ffffff", input_border:"#dadaf0",
      item_bg:"#f2f2ff", item_active_bg:"#ffe6ea",
      muted:"#e9e9f7", text_muted:"#5a5a7a"
    }
  },
  ironman: {
    dark: {
      bg:"#140e0e", surface:"#1e1414", border:"#3a2020", text:"#f9e6e6", primary:"#d10000",
      bubble_me:"#3a1c1c", bubble_you:"#201212", text_me:"#f9e6e6", text_you:"#efdddd",
      input_bg:"#171010", input_border:"#3a2020",
      item_bg:"#1e1414", item_active_bg:"#2a1a1a",
      muted:"#3a2020", text_muted:"#e8c3c3"
    },
    light: {
      bg:"#fff3f3", surface:"#ffffff", border:"#f0d1d1", text:"#201212", primary:"#b80000",
      bubble_me:"#ffe3e3", bubble_you:"#fff7f7", text_me:"#201212", text_you:"#201212",
      input_bg:"#ffffff", input_border:"#e8c3c3",
      item_bg:"#fff7f7", item_active_bg:"#ffe3e3",
      muted:"#f2d9d9", text_muted:"#7a4f4f"
    }
  }
};

function setColorScheme(s){ try{ document.documentElement.style.setProperty("color-scheme", s); }catch{} }
function applyTheme(t){
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
function updateModeToggleLabel(mode){ if (!modeToggleBtn) return; modeToggleBtn.textContent = mode === "light" ? "🌙 Modo claro" : "🌓 Modo oscuro"; }
function getThemeByPreset(preset, mode){
  if (preset === "custom") {
    const stored = JSON.parse(localStorage.getItem("theme_custom") || "{}");
    if (stored?.bg) return stored;
    const base = (mode === "light" ? themePresets.default.light : themePresets.default.dark);
    return base;
  }
  const p = themePresets[preset] || themePresets.default;
  return (mode === "light" ? p.light : p.dark);
}
(function loadTheme(){
  try{
    const preset = localStorage.getItem("themePreset") || "default";
    const mode = localStorage.getItem("themeMode") || "dark";
    const t = getThemeByPreset(preset, mode);
    applyTheme(t); setColorScheme(mode); updateModeToggleLabel(mode);
    if (themePresetEl) themePresetEl.value = preset;
    if (themeModeEl) themeModeEl.value = mode;
  }catch{
    applyTheme(themePresets.default.dark); setColorScheme("dark"); updateModeToggleLabel("dark");
    if (themePresetEl) themePresetEl.value = "default";
    if (themeModeEl) themeModeEl.value = "dark";
  }
})();
settingsSaveBtn?.addEventListener("click", ()=>{
  const p = themePresetEl?.value || localStorage.getItem("themePreset") || "default";
  const m = themeModeEl?.value || localStorage.getItem("themeMode") || "dark";
  if (p === "custom") {
    const base = themePresets.default[m === "light" ? "light" : "dark"];
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
  updateModeToggleLabel(m);
  if (settingsModal) settingsModal.style.display = "none";
});
themePresetEl?.addEventListener("change", ()=>{
  const p = themePresetEl.value;
  const m = themeModeEl?.value || (localStorage.getItem("themeMode") || "dark");
  applyTheme(getThemeByPreset(p, m));
  localStorage.setItem("themePreset", p);
  localStorage.setItem("themeMode", m);
  setColorScheme(m);
  updateModeToggleLabel(m);
});
themeModeEl?.addEventListener("change", ()=>{
  const m = themeModeEl.value;
  const p = themePresetEl?.value || (localStorage.getItem("themePreset") || "default");
  applyTheme(getThemeByPreset(p, m));
  localStorage.setItem("themeMode", m);
  setColorScheme(m);
  updateModeToggleLabel(m);
});
modeToggleBtn?.addEventListener("click", ()=>{
  const current = localStorage.getItem("themeMode") || "dark";
  const next = current === "dark" ? "light" : "dark";
  const p = localStorage.getItem("themePreset") || "default";
  applyTheme(getThemeByPreset(p, next));
  localStorage.setItem("themeMode", next);
  setColorScheme(next);
  updateModeToggleLabel(next);
  if (themeModeEl) themeModeEl.value = next;
});
settingsClose?.addEventListener("click", ()=>{ if (settingsModal) settingsModal.style.display = "none"; });

/* ===== Helpers y Miembros ===== */
function synthEmail(username){ return `${username}@familychat.app`; }
function initials(name="") {
  const parts = name.trim().split(/\s+/);
  const i1 = (parts[0]?.[0]||"").toUpperCase();
  const i2 = (parts[1]?.[0]||"").toUpperCase();
  return (i1 + i2) || i1 || "–";
}
function openModal(title){ modalTitle.textContent = title; modal.style.display = "flex"; modalError.textContent = ""; }
function closeModal(){
  modal.style.display = "none"; editingMemberId = null;
  if (firstNameEl) firstNameEl.value=""; if (lastNameEl) lastNameEl.value="";
  if (nicknameEl) nicknameEl.value=""; if (usernameEl) usernameEl.value="";
  if (passwordEl) passwordEl.value=""; if (password2El) password2El.value="";
  if (birthDateEl) birthDateEl.value=""; if (relationEl) relationEl.value="Papá";
  if (relationOtherEl) relationOtherEl.value=""; if (relationOtherWrap) relationOtherWrap.style.display = "none";
  if (locationEl) locationEl.value="";
}
if (relationEl && relationOtherWrap) {
  relationEl.addEventListener("change", ()=>{
    relationOtherWrap.style.display = relationEl.value === "Otro" ? "block" : "none";
  });
}

async function ensureFamilyDoc() {
  const famRef = doc(db, "families", familyId);
  const snap = await getDoc(famRef);
  if (!snap.exists()) {
    await setDoc(famRef, { id: familyId, name: "Mi Familia", adminUid: uid, allowedAuthUids: [uid], createdAt: serverTimestamp() });
  } else {
    const data = snap.data();
    if (!Array.isArray(data.allowedAuthUids) || !data.allowedAuthUids.includes(uid)) {
      await updateDoc(famRef, { allowedAuthUids: arrayUnion(uid) });
    }
  }
}

function renderRow(m) {
  const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ");
  const isAdminMember = (m.role === "admin") || (m.id === familyId);
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><div class="avatar">${initials(fullName || m.nickname || "")}</div></td>
    <td>${fullName || "—"}</td>
    <td>${m.nickname || "—"}</td>
    <td><span class="tag">${isAdminMember ? "Admin" : (m.relation || "Miembro")}</span></td>
    <td>
      <div class="row-actions">
        <button class="btn secondary" data-edit="${m.id}">Editar</button>
        ${isAdminMember ? "" : `<button class="btn danger" data-del="${m.id}">Eliminar</button>`}
      </div>
    </td>
  `;
  return tr;
}

async function isNicknameTaken(nickname){
  const q = query(collection(db,`families/${familyId}/members`), where("nickname","==",nickname));
  const snap = await getDocs(q); return !snap.empty;
}
async function isUsernameTaken(username){
  const email = username.includes("@") ? username : synthEmail(username);
  const q = query(collection(db,`families/${familyId}/members`), where("email","==",email));
  const snap = await getDocs(q); return !snap.empty;
}

/* ===== Guardia admin y listado ===== */
onAuthStateChanged(auth, async (user) => {
  if(!user){ window.location.href="login.html"; return; }
  uid = user.uid;

  try {
    const famSnap = await getDoc(doc(db,"families", uid));
    const isAdmin = famSnap.exists() && famSnap.data()?.adminUid === uid;
    if (!isAdmin) {
      showErrorModal("Acceso restringido", new Error("Sólo el administrador puede gestionar miembros."), { uid });
      window.location.href = "chat.html";
      return;
    }
    familyId = uid;

    await ensureFamilyDoc();

    const membersQuery = query(collection(db,`families/${familyId}/members`), orderBy("nickname","asc"));
    onSnapshot(
      membersQuery,
      (snap)=>{
        membersTbody.innerHTML = "";
        snap.forEach(docSnap=>{
          const m = docSnap.data();
          membersTbody.appendChild(renderRow(m));
        });
        membersTbody.querySelectorAll("[data-edit]").forEach(btn=>{
          btn.addEventListener("click", ()=> startEdit(btn.getAttribute("data-edit")));
        });
        membersTbody.querySelectorAll("[data-del]").forEach(btn=>{
          btn.addEventListener("click", ()=> startDelete(btn.getAttribute("data-del")));
        });
      },
      (err)=>{
        if (listError) listError.textContent = err.message;
        showErrorModal("Error listando miembros", err, { operation: "list", path: `families/${familyId}/members` });
      }
    );
  } catch (e) {
    showErrorModal("No se pudo verificar permisos", e, { operation: "check-admin", uid });
    window.location.href = "chat.html";
  }
});

/* ===== Topbar ===== */
addBtn.addEventListener("click", ()=> openModal("Añadir Nuevo Miembro"));
goChatBtn.addEventListener("click", ()=> window.location.href = "chat.html");
settingsBtn.addEventListener("click", ()=> { const sm = document.getElementById("settingsModal"); if (sm) sm.style.display = "flex"; });
logoutBtn.addEventListener("click", async ()=>{ await signOut(auth); window.location.href="login.html"; });

cancelBtn.addEventListener("click", ()=> closeModal());
window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });

/* ===== Guardar / crear / actualizar ===== */
saveBtn.addEventListener("click", async ()=>{
  modalError.textContent = ""; saveBtn.disabled = true;
  try{
    const famRef = doc(db, "families", familyId);
    const famSnap = await getDoc(famRef);
    if (!famSnap.exists() || famSnap.data().adminUid !== uid) throw new Error("No eres el administrador de esta familia.");

    const payload = {
      firstName: firstNameEl?.value.trim(),
      lastName: lastNameEl?.value.trim(),
      nickname: nicknameEl?.value.trim(),
      username: usernameEl?.value.trim(),
      password: passwordEl?.value.trim(),
      password2: password2El?.value.trim(),
      birthDate: birthDateEl?.value.trim(),
      relation: relationEl?.value === "Otro" ? (relationOtherEl?.value.trim() || "") : relationEl?.value,
      location: locationEl?.value.trim(),
    };

    if(!editingMemberId){
      if(!payload.nickname) throw new Error("Apodo requerido.");
      if(!payload.username) throw new Error("Usuario requerido.");
      if(!payload.firstName) throw new Error("Nombre requerido.");
      if(!payload.lastName) throw new Error("Apellido requerido.");
      if(!payload.password) throw new Error("Contraseña requerida.");
      if(payload.password !== payload.password2) throw new Error("Las contraseñas no coinciden.");
      if(await isNicknameTaken(payload.nickname)) throw new Error("Ese apodo ya existe.");
      if(await isUsernameTaken(payload.username)) throw new Error("Ese usuario ya existe.");

      const email = payload.username.includes("@") ? payload.username : synthEmail(payload.username);
      const cred = await createUserWithEmailAndPassword(secondAuth, email, payload.password);
      const memberUid = cred.user.uid;

      await updateDoc(famRef, { allowedAuthUids: arrayUnion(memberUid) });
      await setDoc(doc(db,`families/${familyId}/members`, memberUid), {
        id: memberUid, uid: memberUid, familyId, email, username: payload.username,
        firstName: payload.firstName, lastName: payload.lastName, nickname: payload.nickname,
        birthDate: payload.birthDate, relation: payload.relation || "Miembro", location: payload.location,
        role: "member", createdAt: serverTimestamp(),
      });

      try {
        await setDoc(doc(secondDb, "users", memberUid), {
          id: memberUid, email, username: payload.username, nickname: payload.nickname, role: "member",
          familyId: familyId, firstName: payload.firstName, lastName: payload.lastName,
          birthDate: payload.birthDate, location: payload.location, createdAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        showErrorModal("Se creó el miembro, pero falló crear su perfil en /users", e, { operation: "create-user-profile", userId: memberUid });
      }

      closeModal(); alert("Miembro creado.");
    } else {
      await updateDoc(doc(db,`families/${familyId}/members`, editingMemberId), {
        firstName: payload.firstName, lastName: payload.lastName, nickname: payload.nickname,
        birthDate: payload.birthDate, relation: payload.relation, location: payload.location,
        updatedAt: serverTimestamp(),
      });
      try {
        // familyId incluido para cumplir reglas y permitir al admin actualizar /users
        await setDoc(doc(db, "users", editingMemberId), {
          familyId: familyId,
          firstName: payload.firstName, lastName: payload.lastName, nickname: payload.nickname,
          birthDate: payload.birthDate, location: payload.location, updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        showErrorModal("Miembro editado, pero no se pudo actualizar su /users", e, { operation: "update-user-profile", userId: editingMemberId });
      }
      closeModal(); alert("Miembro actualizado.");
    }
  }catch(e){
    modalError.textContent = e.message || "Error al guardar.";
    showErrorModal("Error al guardar miembro", e, { operation: editingMemberId ? "update-member" : "create-member", familyPath: `families/${familyId}` });
  } finally { saveBtn.disabled = false; }
});

/* ===== Editar / Eliminar ===== */
async function startEdit(memberId){
  try{
    editingMemberId = memberId;
    const ref = doc(db,`families/${familyId}/members`, memberId);
    const snap = await getDoc(ref);
    if(!snap.exists()){ alert("Miembro no encontrado."); return; }
    const m = snap.data();
    if (firstNameEl) firstNameEl.value = m.firstName || "";
    if (lastNameEl) lastNameEl.value = m.lastName || "";
    if (nicknameEl) nicknameEl.value = m.nickname || "";
    if (usernameEl) usernameEl.value = m.username || "";
    if (birthDateEl) birthDateEl.value = m.birthDate || "";
    if (relationEl) { relationEl.value = "Otro"; if (relationOtherWrap) relationOtherWrap.style.display = "block"; if (relationOtherEl) relationOtherEl.value = m.relation || ""; }
    if (locationEl) locationEl.value = m.location || "";
    openModal("Editar Miembro");
  }catch(e){ showErrorModal("Error cargando miembro", e, { operation: "get-member", path: `families/${familyId}/members/${memberId}` }); }
}

async function startDelete(memberId){
  try{
    if(memberId === familyId){ alert("No puedes eliminar al administrador."); return; }
    if(!confirm("Eliminará el miembro y revocará su acceso.\nLos mensajes permanecerán en el historial.\n\n¿Deseas continuar?")) return;

    const ref = doc(db,`families/${familyId}/members`, memberId);
    const snap = await getDoc(ref);
    if(!snap.exists()){ alert("Miembro no encontrado."); return; }
    const m = snap.data();
    const memberUid = m.uid;

    await deleteDoc(ref);
    await updateDoc(doc(db,"families",familyId), { allowedAuthUids: arrayRemove(memberUid) });
    try {
      // familyId incluido para cumplir reglas y permitir al admin marcar usuario como desactivado
      await setDoc(doc(db, "users", memberUid), { familyId: familyId, deactivatedAt: serverTimestamp() }, { merge: true });
    } catch {}
    alert("Miembro eliminado y acceso revocado.");
  }catch(e){
    showErrorModal("Error al eliminar miembro", e, { operation: "delete-member", memberPath: `families/${familyId}/members/${memberId}`, familyPath: `families/${familyId}` });
  }
}