import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { showErrorModal } from "./error-modal.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const emailEl = document.getElementById("email");
const nicknameEl = document.getElementById("nickname");
const familyNameEl = document.getElementById("familyName");
const passwordEl = document.getElementById("password");
const password2El = document.getElementById("password2");
const registerBtn = document.getElementById("registerBtn");
const errorEl = document.getElementById("error");

registerBtn.addEventListener("click", async ()=>{
  errorEl.textContent = "";
  try {
    const email = emailEl.value.trim();
    const nickname = nicknameEl.value.trim();
    const familyName = familyNameEl.value.trim();
    const password = passwordEl.value.trim();
    const password2 = password2El.value.trim();

    if (!email || !nickname || !familyName || !password || !password2) throw new Error("Completa todos los campos.");
    if (password !== password2) throw new Error("Las contraseñas no coinciden.");

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    try { await sendEmailVerification(cred.user); } catch {}

    // Perfil del admin con familyId
    await setDoc(doc(db, "users", uid), {
      id: uid,
      email,
      username: email,
      role: "admin",
      nickname,
      photoURL: null,
      familyId: uid,                 // <-- clave
      createdAt: serverTimestamp()
    });

    // Familia /families/{uid}
    await setDoc(doc(db, "families", uid), {
      id: uid,
      name: familyName,
      adminUid: uid,
      allowedAuthUids: [uid],
      createdAt: serverTimestamp()
    });

    // Admin también como miembro
    await setDoc(doc(db, `families/${uid}/members`, uid), {
      id: uid,
      uid: uid,
      familyId: uid,                 // <-- clave
      username: email,
      nickname,
      role: "admin",
      relation: "Admin",
      createdAt: serverTimestamp()
    });

    alert("Te enviamos un correo de verificación. Verifica tu email y luego inicia sesión.");
    window.location.href = "login.html";
  } catch (e) {
    errorEl.textContent = e.message || "Error al registrar.";
    showErrorModal("Error en registro", e);
  }
});