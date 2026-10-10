import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM perfil
const firstNameEl = document.getElementById("firstName");
const lastNameEl = document.getElementById("lastName");
const nicknameEl = document.getElementById("nickname");
const birthDateEl = document.getElementById("birthDate");
const locationEl = document.getElementById("location");
const photoUrlEl = document.getElementById("photoUrl");
const previewEl = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");
const errorEl = document.getElementById("error");

// DOM contraseña
const currentPasswordEl = document.getElementById("currentPassword");
const newPasswordEl = document.getElementById("newPassword");
const newPassword2El = document.getElementById("newPassword2");
const savePasswordBtn = document.getElementById("savePasswordBtn");
const pwdErrorEl = document.getElementById("pwdError");

let uid = null;
let existing = null;

photoUrlEl.addEventListener("input", () => {
  const url = photoUrlEl.value.trim();
  previewEl.src = url || "";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  uid = user.uid;

  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    existing = snap.data();
    firstNameEl.value = existing.firstName || "";
    lastNameEl.value = existing.lastName || "";
    nicknameEl.value = existing.nickname || "";
    birthDateEl.value = existing.birthDate || "";
    locationEl.value = existing.location || "";
    photoUrlEl.value = existing.photoURL || "";
    previewEl.src = existing.photoURL || "";
  } else {
    existing = { id: uid, email: user.email || "", username: user.email || "", role: "admin" };
    await setDoc(doc(db, "users", uid), { ...existing, createdAt: serverTimestamp() }, { merge: true });
  }
});

saveBtn.addEventListener("click", async () => {
  errorEl.textContent = "";
  try {
    if (!uid || !existing) throw new Error("No autenticado.");

    const update = {
      id: uid,
      email: existing.email || auth.currentUser?.email || "",
      username: existing.username || existing.email || auth.currentUser?.email || "",
      role: existing.role || "admin",
      firstName: firstNameEl.value.trim(),
      lastName: lastNameEl.value.trim(),
      nickname: nicknameEl.value.trim(),
      birthDate: birthDateEl.value.trim(),
      location: locationEl.value.trim(),
      photoURL: photoUrlEl.value.trim() || null,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", uid), update, { merge: true });
    alert("Perfil guardado.");
  } catch (e) {
    errorEl.textContent = e.message || "Error al guardar.";
  }
});

backBtn.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// Cambio de contraseña con reautenticación
savePasswordBtn.addEventListener("click", async () => {
  pwdErrorEl.textContent = "";
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No autenticado.");
    const currentPwd = currentPasswordEl.value.trim();
    const newPwd = newPasswordEl.value.trim();
    const newPwd2 = newPassword2El.value.trim();

    if (!currentPwd) throw new Error("Ingresa tu contraseña actual.");
    if (!newPwd) throw new Error("Ingresa la nueva contraseña.");
    if (newPwd.length < 6) throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
    if (newPwd !== newPwd2) throw new Error("Las contraseñas nuevas no coinciden.");

    const email = user.email || existing?.email || "";
    if (!email) throw new Error("Tu cuenta no tiene correo asociado. Contacta al administrador.");

    const cred = EmailAuthProvider.credential(email, currentPwd);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPwd);

    // Limpia campos por seguridad
    currentPasswordEl.value = "";
    newPasswordEl.value = "";
    newPassword2El.value = "";

    alert("Contraseña actualizada correctamente.");
  } catch (e) {
    // Mensaje más claro para errores comunes de reautenticación
    const msg = e?.code === "auth/wrong-password"
      ? "La contraseña actual es incorrecta."
      : e?.code === "auth/too-many-requests"
      ? "Demasiados intentos. Intenta más tarde."
      : e?.message || "No se pudo actualizar la contraseña.";
    pwdErrorEl.textContent = msg;
  }
});