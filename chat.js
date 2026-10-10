import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  collection, addDoc, serverTimestamp, query, orderBy, onSnapshot,
  doc, getDoc, getDocs, setDoc, where, limit, collectionGroup, updateDoc,
  startAfter, endBefore, limitToLast
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { showErrorModal } from "./error-modal.js";
import { initThemeUI } from "./theme-manager.js";
import { initNudgeUI, triggerNudge } from "./nudge-manager.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const userInfoEl = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");
const backBtn = document.getElementById("backBtn");
const searchInput = document.getElementById("searchInput");
const membersListEl = document.getElementById("membersList");
const convTitleEl = document.getElementById("convTitle");
const convBodyEl = document.getElementById("convBody");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

// Tema: refs y init
const modeToggleBtn = document.getElementById("modeToggle");
const settingsBtn = document.getElementById("settingsBtn");
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
initThemeUI({ modeToggleBtn, themePresetEl, themeModeEl, pickers, settingsSaveBtn, settingsModal });

// Zumbido MSN: refs y init
const nudgeEnabledEl = document.getElementById("nudgeEnabled");
const nudgeVolumeEl = document.getElementById("nudgeVolume");
const nudgeTestBtn = document.getElementById("nudgeTest");
const nudgeAudioEl = document.getElementById("nudgeAudio");
const conversationSection = document.querySelector(".conversation");
initNudgeUI({ nudgeEnabledEl, nudgeVolumeEl, nudgeTestBtn, nudgeAudioEl, conversationSection });

// Modales editar perfil
const editSelfBtn = document.getElementById("editSelfBtn");
const editSelfModal = document.getElementById("editSelfModal");
const editSelfCancel = document.getElementById("editSelfCancel");
const editSelfSaveBtn = document.getElementById("editSelfSave");
const editSelfErrEl = document.getElementById("editSelfError");
const selfNicknameEl = document.getElementById("selfNickname");
const selfBirthDateEl = document.getElementById("selfBirthDate");

// Sección cambio de contraseña
const currentPasswordEl = document.getElementById("currentPassword");
const newPasswordEl = document.getElementById("newPassword");
const newPassword2El = document.getElementById("newPassword2");
const changePwdBtn = document.getElementById("changePwdBtn");
const changePwdErrEl = document.getElementById("changePwdError");

settingsBtn?.addEventListener("click", ()=> { if (settingsModal) settingsModal.style.display = "flex"; });
settingsClose?.addEventListener("click", ()=> { if (settingsModal) settingsModal.style.display = "none"; });

let uid = null;
let familyId = null;
let myLabel = "";
let isAdmin = false;
let members = [];
let activePeerUid = null;
let meProfile = null; // cache del perfil (users o members)

// Abrir/cerrar modal de edición
editSelfBtn?.addEventListener("click", async ()=>{
  if (!editSelfModal) return;
  // Prefill con lo que tengamos en cache; si no, intenta cargar rápido desde Firestore
  try {
    if (!meProfile) {
      const uSnap = await getDoc(doc(db, "users", uid));
      if (uSnap.exists()) meProfile = uSnap.data();
      else {
        const mSnap = await getDoc(doc(db, `families/${familyId}/members`, uid));
        meProfile = mSnap.exists() ? mSnap.data() : {};
      }
    }
  } catch {}
  if (selfNicknameEl) selfNicknameEl.value = (meProfile?.nickname || myLabel || "");
  if (selfBirthDateEl) selfBirthDateEl.value = (meProfile?.birthDate || "");
  editSelfErrEl.textContent = "";
  changePwdErrEl.textContent = "";
  editSelfModal.style.display = "flex";
});
editSelfCancel?.addEventListener("click", ()=> { if (editSelfModal) editSelfModal.style.display = "none"; });

async function saveOwnProfile(nickname, birthDate) {
  if (!uid) throw new Error("No autenticado.");
  const safeNick = (nickname || "").trim();
  const safeBirth = (birthDate || "").trim();
  // Actualiza /users
  await setDoc(
    doc(db, "users", uid),
    { id: uid, nickname: safeNick, birthDate: safeBirth || null, updatedAt: serverTimestamp() },
    { merge: true }
  );
  // Actualiza también /families/{familyId}/members/{uid} (si existe)
  try {
    await setDoc(
      doc(db, `families/${familyId}/members`, uid),
      { nickname: safeNick, birthDate: safeBirth || null, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch {}
  // Refresca etiqueta en topbar
  myLabel = safeNick || myLabel;
  userInfoEl.textContent = myLabel;
  // Cache
  meProfile = { ...(meProfile||{}), nickname: safeNick, birthDate: safeBirth };
}

editSelfSaveBtn?.addEventListener("click", async ()=>{
  editSelfErrEl.textContent = "";
  try {
    const nick = selfNicknameEl?.value || "";
    const birth = selfBirthDateEl?.value || "";
    await saveOwnProfile(nick, birth);
    editSelfModal.style.display = "none";
    alert("Perfil actualizado.");
  } catch (e) {
    editSelfErrEl.textContent = e.message || "No se pudo guardar el perfil.";
  }
});

changePwdBtn?.addEventListener("click", async ()=>{
  changePwdErrEl.textContent = "";
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const current = (currentPasswordEl?.value || "").trim();
    const next = (newPasswordEl?.value || "").trim();
    const next2 = (newPassword2El?.value || "").trim();
    if (!current) throw new Error("Ingresa tu contraseña actual.");
    if (!next) throw new Error("Ingresa la nueva contraseña.");
    if (next.length < 6) throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
    if (next !== next2) throw new Error("Las contraseñas nuevas no coinciden.");

    const email = user.email || meProfile?.email || "";
    if (!email) throw new Error("Tu cuenta no tiene correo asociado. Contacta al administrador.");
    const cred = EmailAuthProvider.credential(email, current);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, next);

    // Limpia campos
    if (currentPasswordEl) currentPasswordEl.value = "";
    if (newPasswordEl) newPasswordEl.value = "";
    if (newPassword2El) newPassword2El.value = "";

    alert("Contraseña actualizada correctamente.");
  } catch (e) {
    const msg =
      e?.code === "auth/wrong-password" ? "La contraseña actual es incorrecta." :
      e?.code === "auth/too-many-requests" ? "Demasiados intentos. Intenta más tarde." :
      e?.message || "No se pudo actualizar la contraseña.";
    changePwdErrEl.textContent = msg;
  }
});

// Unread/orden
const convWatchers = new Map();
const readsWatchers = new Map();
const unreadMap = new Map();
const lastMessageMsMap = new Map();

// Estado de mensajes
let msgsState = [];
let earliestTs = null;
let latestTs = null;
let liveUnsub = null;
let loadMoreBtn = null;

/* Utilidades */
function formatStamp(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : (typeof ts?.seconds === "number" ? new Date(ts.seconds * 1000) : null);
    if (!d) return "";
    return new Intl.DateTimeFormat(undefined, { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }).format(d);
  } catch { return ""; }
}
function convIdFor(u1,u2){ return [u1,u2].sort().join("_"); }
function tsToMs(ts){ return ts?.toMillis?.() ? ts.toMillis() : (typeof ts?.seconds === "number" ? ts.seconds * 1000 : 0); }

/* Render mensajes */
function renderMessages() {
  convBodyEl.innerHTML = "";
  if (!loadMoreBtn) {
    loadMoreBtn = document.createElement("button");
    loadMoreBtn.id = "loadMoreBtn";
    loadMoreBtn.className = "load-more-bar";
    loadMoreBtn.textContent = "Cargar 15 anteriores";
    loadMoreBtn.style.display = "none";
    loadMoreBtn.addEventListener("click", loadOlderMessages);
    convBodyEl.appendChild(loadMoreBtn);
  } else {
    convBodyEl.appendChild(loadMoreBtn);
  }

  msgsState.forEach(({ data }) => {
    const mine = data.userId === uid;
    const bubble = document.createElement("div");
    bubble.className = "bubble" + (mine ? " me" : "");
    bubble.innerHTML = `
      <span class="who">${mine ? (myLabel || "Tú") : (data.peerLabel || "Miembro")}</span>
      ${data.text || ""}
      <div class="stamp">${formatStamp(data.createdAt)}</div>
    `;
    convBodyEl.appendChild(bubble);
  });

  loadMoreBtn.style.display = earliestTs ? "block" : "none";
  convBodyEl.scrollTop = convBodyEl.scrollHeight;
}

/* Lista miembros con dot de nuevos */
function renderMembersList(filter="") {
  membersListEl.innerHTML = "";
  const needle = filter.trim().toLowerCase();
  const others = members.filter(m => m.uid !== uid).slice();

  others.sort((a,b)=>{
    const la = lastMessageMsMap.get(a.uid) || 0;
    const lb = lastMessageMsMap.get(b.uid) || 0;
    if (la && lb) return lb - la;
    if (la && !lb) return -1;
    if (!la && lb) return 1;
    const an = (a.nickname || a.fullName || "").toLowerCase();
    const bn = (b.nickname || b.fullName || "").toLowerCase();
    return an.localeCompare(bn);
  });

  const filtered = needle
    ? others.filter(m => (m.nickname || m.fullName || "").toLowerCase().includes(needle))
    : others;

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "small";
    empty.textContent = "No hay otros miembros aún.";
    membersListEl.appendChild(empty);
    return;
  }

  for (const m of filtered) {
    const isActive = activePeerUid === m.uid;
    const hasUnread = unreadMap.get(m.uid) === 1;
    const item = document.createElement("div");
    item.className = "chat-item" + (isActive ? " active" : "");
    item.innerHTML = `
      <div class="avatar">${(m.nickname||m.fullName||"—").slice(0,2).toUpperCase()}</div>
      <div class="meta">
        <div class="name">${m.nickname || m.fullName || "—"}</div>
        <div class="sub">${m.relation || "Miembro"}</div>
      </div>
      ${hasUnread ? `<span class="dot" title="Mensaje nuevo"></span>` : ""}
    `;
    item.addEventListener("click", () => {
      openConversation(m);
      if (window.innerWidth <= 768) closeChatList();
    });
    membersListEl.appendChild(item);
  }
}

/* Watchers unread */
function cleanupUnreadWatchers() {
  for (const unsub of convWatchers.values()) { try { unsub(); } catch {} }
  for (const unsub of readsWatchers.values()) { try { unsub(); } catch {} }
  convWatchers.clear();
  readsWatchers.clear();
}
function recomputeUnread(peerUid, convData, readMs){
  const prev = unreadMap.get(peerUid) || 0;
  const lastMs = convData?.lastMs || 0;
  const lastSender = convData?.lastSender || null;
  lastMessageMsMap.set(peerUid, lastMs);
  const hasNew = !!lastSender && lastSender !== uid && lastMs > (readMs || 0);
  unreadMap.set(peerUid, hasNew ? 1 : 0);
  if (hasNew && prev !== 1) triggerNudge();
  renderMembersList(searchInput.value);
}
function setupUnreadWatchers() {
  cleanupUnreadWatchers();
  members.forEach(async m => {
    if (m.uid === uid) return;
    const convId = convIdFor(uid, m.uid);
    const convRef = doc(db, `families/${familyId}/conversations`, convId);
    const readRef = doc(db, `families/${familyId}/conversations/${convId}/reads`, uid);

    const unsubConv = onSnapshot(convRef, (snap)=>{
      const data = snap.data() || {};
      const convData = { lastMs: tsToMs(data.lastMessageAt) || 0, lastSender: data.lastSenderId || null };
      const currentReadMs = readsWatchers.get(m.uid)?.__lastReadMs || 0;
      recomputeUnread(m.uid, convData, currentReadMs);
    }, ()=>{});
    convWatchers.set(m.uid, unsubConv);

    try {
      const rs = await getDoc(readRef);
      if (!rs.exists()) await setDoc(readRef, { lastReadAt: serverTimestamp() }, { merge: true });
    } catch {}

    const unsubRead = onSnapshot(readRef, (snap)=>{
      const readMs = tsToMs(snap.data()?.lastReadAt) || 0;
      unsubRead.__lastReadMs = readMs;
      readsWatchers.set(m.uid, unsubRead);
      renderMembersList(searchInput.value);
    }, ()=>{});
    readsWatchers.set(m.uid, unsubRead);
  });
}

/* Carga y suscripción de mensajes */
async function loadInitialMessages(msgsRef) {
  const qInit = query(msgsRef, orderBy("createdAt","desc"), limit(30));
  const snap = await getDocs(qInit);
  const docs = snap.docs.reverse();
  msgsState = docs.map(d=>({ id:d.id, data:d.data() }));
  earliestTs = msgsState.length ? msgsState[0].data.createdAt : null;
  latestTs = msgsState.length ? msgsState[msgsState.length-1].data.createdAt : null;
  renderMessages();
}
function subscribeLiveNewMessages(msgsRef) {
  if (liveUnsub) { try { liveUnsub(); } catch {} liveUnsub = null; }
  const qLive = latestTs ? query(msgsRef, orderBy("createdAt","asc"), startAfter(latestTs)) : query(msgsRef, orderBy("createdAt","asc"));
  liveUnsub = onSnapshot(qLive, (snap)=>{
    snap.docChanges().forEach(ch=>{
      if (ch.type === "added") {
        const data = ch.doc.data();
        msgsState.push({ id: ch.doc.id, data });
        latestTs = data?.createdAt || latestTs;
        if (data?.userId && data.userId !== uid) triggerNudge();
      }
    });
    renderMessages();
  }, (err)=> showErrorModal("Live messages error", err, { operation: "live-new" }));
}
async function loadOlderMessages() {
  try {
    if (!earliestTs) return;
    const convId = convIdFor(uid, activePeerUid);
    const msgsRef = collection(db, `families/${familyId}/conversations/${convId}/messages`);
    const qOlder = query(msgsRef, orderBy("createdAt","asc"), endBefore(earliestTs), limitToLast(15));
    const snap = await getDocs(qOlder);
    if (snap.empty) { loadMoreBtn.textContent = "No hay más mensajes"; return; }
    const prevHeight = convBodyEl.scrollHeight;
    const older = snap.docs.map(d=>({ id:d.id, data:d.data() }));
    msgsState = [...older, ...msgsState];
    earliestTs = msgsState[0].data.createdAt || earliestTs;
    renderMessages();
    const newHeight = convBodyEl.scrollHeight;
    convBodyEl.scrollTop = newHeight - prevHeight;
  } catch (e) { showErrorModal("Error cargando mensajes anteriores", e, { operation: "older" }); }
}

function subscribeConversation(peer) {
  const convId = convIdFor(uid, peer.uid);
  const msgsRef = collection(db, `families/${familyId}/conversations/${convId}/messages`);
  loadInitialMessages(msgsRef).then(()=> subscribeLiveNewMessages(msgsRef));
}

/* Marcar lectura (reads/{uid}) usando lastMessageAt */
async function markConversationRead(convId) {
  try {
    const convRef = doc(db, `families/${familyId}/conversations`, convId);
    const readRef = doc(db, `families/${familyId}/conversations/${convId}/reads`, uid);
    const snap = await getDoc(convRef);
    const data = snap.exists() ? snap.data() : {};
    const lastMessageAt = data?.lastMessageAt || null;
    await setDoc(readRef, { lastReadAt: lastMessageAt || serverTimestamp() }, { merge: true });
  } catch (e) {
    showErrorModal("No se pudo marcar lectura", e, { operation: "mark-read" });
  }
}

/* Abrir conversación */
async function openConversation(peer) {
  try {
    activePeerUid = peer.uid;
    convTitleEl.textContent = peer.nickname || peer.fullName || "Miembro";
    msgsState = []; earliestTs = null; latestTs = null;

    const convId = convIdFor(uid, peer.uid);
    const convRef = doc(db, `families/${familyId}/conversations`, convId);

    const snap = await getDoc(convRef);
    if (!snap.exists()) {
      await setDoc(convRef, {
        id: convId,
        participants: [uid, peer.uid],
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastSenderId: null
      });
    }

    await markConversationRead(convId);

    unreadMap.set(peer.uid, 0);
    renderMembersList(searchInput.value);

    subscribeConversation(peer);
    messageInput.focus();
  } catch (e) {
    showErrorModal("No se pudo abrir la conversación", e, { operation: "ensure-conv" });
  }
}

/* Cargar miembros y activar watchers */
async function loadMembers() {
  try {
    const snap = await getDocs(collection(db, `families/${familyId}/members`));
    members = [];
    snap.forEach(docSnap=>{
      const d = docSnap.data();
      const fullName = [d.firstName, d.lastName].filter(Boolean).join(" ");
      members.push({ id: d.id, uid: d.uid || d.id, nickname: d.nickname, relation: d.relation || "", fullName });
    });
    members.sort((a,b)=>{
      const an = (a.nickname || a.fullName || "").toLowerCase();
      const bn = (b.nickname || b.fullName || "").toLowerCase();
      return an.localeCompare(bn);
    });
    renderMembersList();
    setupUnreadWatchers();
  } catch (e) { showErrorModal("Error cargando miembros", e, { operation: "list-members" }); }
}

/* Enviar mensajes */
chatForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!activePeerUid) { alert("Selecciona un chat."); return; }
  if (!text || text.length > 300) { alert("Texto 1-300 chars."); return; }
  try {
    const convId = convIdFor(uid, activePeerUid);
    const msgsRef = collection(db, `families/${familyId}/conversations/${convId}/messages`);
    await addDoc(msgsRef, { text, userId: uid, createdAt: serverTimestamp() });
    await updateDoc(doc(db, `families/${familyId}/conversations`, convId), { lastMessageAt: serverTimestamp(), lastSenderId: uid });
    await setDoc(doc(db, `families/${familyId}/conversations/${convId}/reads`, uid), { lastReadAt: serverTimestamp() }, { merge: true });
    messageInput.value = "";
  } catch (e) { showErrorModal("Error al enviar mensaje", e, { operation: "send-message" }); }
});


// Referencias del emoji UI
const emojiBtn = document.getElementById("emojiBtn");
const emojiPanel = document.getElementById("emojiPanel");

// Lista de emojis
const EMOJIS = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","🙂","🙃","😉","😌","😍","😘","😗","😙","😚","😋","😛","😜","🤪","😝",
  "🤗","🤔","🤨","😐","😑","😶","🙄","😏","😴","🤤","😪","😵","🤯","😮","😲","😱","😳","🥶","🥵","😡","😠","🤬",
  "👍","👎","👌","✌️","🤞","🤟","🤘","👏","🙌","👐","🤝","🙏","💪","👊","✊",
  "🎉","✨","💥","🔥","🌟","💫","🌈",
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💖","💗","💓","💞","💘",
];

// Renderiza el panel
function renderEmojiPanel() {
  if (!emojiPanel) return;
  emojiPanel.innerHTML = "";
  EMOJIS.forEach(e => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = e;
    btn.addEventListener("click", () => {
      insertEmoji(e);
      // Cerrar al seleccionar
      emojiPanel.classList.remove("open");
    });
    emojiPanel.appendChild(btn);
  });
}

// Inserta emoji en la posición del cursor
function insertEmoji(emoji) {
  const el = messageInput;
  try {
    el.focus();
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + emoji + el.value.slice(end);
    const caret = start + emoji.length;
    el.setSelectionRange(caret, caret);
  } catch {
    el.value += emoji;
  }
}

// Toggle abrir/cerrar
function toggleEmojiPanel(e) {
  e?.stopPropagation();
  if (!emojiPanel) return;
  // Nunca usamos el atributo hidden, solo la clase open
  emojiPanel.removeAttribute("hidden");

  if (emojiPanel.classList.contains("open")) {
    emojiPanel.classList.remove("open");
  } else {
    renderEmojiPanel();
    emojiPanel.classList.add("open");
    positionEmojiPanel();
  }
}

function positionEmojiPanel() {
  // Posición absoluta por CSS; si quieres que siga al botón, puedes calcular aquí.
}

// Cerrar al hacer click fuera / Escape / enviar
function handleGlobalClick(e) {
  if (!emojiPanel || !emojiPanel.classList.contains("open")) return;
  const clickedInside = emojiPanel.contains(e.target);
  const clickedBtn = emojiBtn && emojiBtn.contains(e.target);
  if (!clickedInside && !clickedBtn) emojiPanel.classList.remove("open");
}

emojiBtn?.addEventListener("click", toggleEmojiPanel);
document.addEventListener("click", handleGlobalClick);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") emojiPanel?.classList.remove("open");
});
chatForm.addEventListener("submit", () => {
  emojiPanel?.classList.remove("open");
});


/* Buscar, logout, navegación */
searchInput.addEventListener("input", ()=> renderMembersList(searchInput.value));
logoutBtn.addEventListener("click", async ()=>{
  await signOut(auth);
  try { sessionStorage.clear(); cleanupUnreadWatchers(); } catch {}
  window.location.href = "login.html";
});
backBtn.addEventListener("click", ()=>{ window.location.href="members.html"; });

/* Auth y resolución de familia */
onAuthStateChanged(auth, async (user)=>{
  if(!user){ window.location.href = "login.html"; return; }
  uid = user.uid;

  familyId = await (async (currentUid)=>{
    const cached = sessionStorage.getItem("familyId"); if (cached) return cached || null;
    try { const uSnap = await getDoc(doc(db, "users", currentUid)); const userFamilyId = uSnap.exists() ? uSnap.data()?.familyId : null; if (userFamilyId) return userFamilyId; } catch {}
    try { const famDoc = await getDoc(doc(db, "families", currentUid)); if (famDoc.exists()) return currentUid; } catch {}
    try { const byAllowed = query(collection(db, "families"), where("allowedAuthUids", "array-contains", currentUid), limit(1)); const allowedSnap = await getDocs(byAllowed); if (!allowedSnap.empty) return allowedSnap.docs[0].id; } catch {}
    try { const byMember = query(collectionGroup(db, "members"), where("uid", "==", currentUid), limit(1)); const memberSnap = await getDocs(byMember); if (!memberSnap.empty) { const d = memberSnap.docs[0].data(); return d?.familyId || memberSnap.docs[0].ref.parent.parent?.id || null; } } catch {}
    return null;
  })(uid);

  if (!familyId) { showErrorModal("Tu cuenta no tiene familia asignada", new Error("No se pudo resolver familyId"), { uid }); return; }

  try { const famSnap = await getDoc(doc(db, "families", familyId)); isAdmin = famSnap.exists() && famSnap.data()?.adminUid === uid; } catch {}
  try {
    const uRef = doc(db, "users", uid);
    const uSnap = await getDoc(uRef);
    if (!uSnap.exists()) await setDoc(uRef, { id: uid, familyId, nickname: "", createdAt: serverTimestamp() }, { merge: true });
  } catch {}

  try {
    const meUserSnap = await getDoc(doc(db, "users", uid));
    if (meUserSnap.exists()) {
      const me = meUserSnap.data();
      myLabel = me?.nickname || me?.username || me?.email || `UID: ${uid}`;
      meProfile = me;
    } else {
      const meMemberSnap = await getDoc(doc(db, `families/${familyId}/members`, uid));
      const meM = meMemberSnap.exists() ? meMemberSnap.data() : null;
      myLabel = meM?.nickname || meM?.username || `UID: ${uid}`;
      meProfile = meM;
    }
  } catch { myLabel = `UID: ${uid}`; meProfile = { id: uid }; }
  userInfoEl.textContent = myLabel;
  userInfoEl.classList.add("user-name");

  await loadMembers();
});

/* Móvil: panel deslizante de chats */
const openChatsBtn = document.getElementById("openChats");
const chatListEl = document.getElementById("chatList");
const chatListBackdrop = document.getElementById("chatListBackdrop");

function openChatList() {
  if (!chatListEl) return;
  chatListEl.classList.add("open");
  if (chatListBackdrop) chatListBackdrop.style.display = "block";
  try { document.body.style.overflow = "hidden"; } catch {}
}
function closeChatList() {
  if (!chatListEl) return;
  chatListEl.classList.remove("open");
  if (chatListBackdrop) chatListBackdrop.style.display = "none";
  try { document.body.style.overflow = ""; } catch {}
}
openChatsBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (chatListEl?.classList.contains("open")) closeChatList();
  else openChatList();
});
chatListBackdrop?.addEventListener("click", closeChatList);
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) closeChatList();
});

// Desactivar autocompletado y evitar historial del navegador
function disableNativeAutocomplete(el) {
  if (!el) return;
  // Atributos que deshabilitan autocompletado y correcciones
  el.setAttribute("autocomplete", "off");
  el.setAttribute("autocapitalize", "none");
  el.setAttribute("spellcheck", "false");
  el.setAttribute("aria-autocomplete", "none");
  el.setAttribute("data-lpignore", "true"); // ignora gestores de contraseñas

  // Truco para Chrome/Edge: cambiar el "name" evita mostrar historial previo
  try { el.name = "msg_" + Math.random().toString(36).slice(2); } catch {}
}

// Aplica al cargar y también al enfocar (por si el navegador insiste)
disableNativeAutocomplete(messageInput);
chatForm?.setAttribute("autocomplete", "off");
messageInput?.addEventListener("focus", () => disableNativeAutocomplete(messageInput));