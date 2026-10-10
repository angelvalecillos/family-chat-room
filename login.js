import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const identifierEl = document.getElementById("identifier");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorEl = document.getElementById("error");
const resetLink = document.getElementById("resetLink");

// Convierte "usuario" -> "usuario@familychat.app", o deja el email tal cual
function toLoginEmail(identifier) {
  const v = identifier.trim();
  if (!v) throw new Error("Ingresa tu correo o usuario.");
  return v.includes("@") ? v : `${v}@familychat.app`;
}

loginBtn.addEventListener("click", async () => {
  errorEl.textContent = "";
  try {
    const email = toLoginEmail(identifierEl.value);
    const password = passwordEl.value.trim();
    if (!password) throw new Error("Ingresa tu contraseña.");
    await signInWithEmailAndPassword(auth, email, password);
    // Deja el enrutamiento al index.html (resolverá si es admin o miembro)
    window.location.href = "index.html";
  } catch (e) {
    errorEl.textContent = e.message || "Error al iniciar sesión.";
  }
});

resetLink.addEventListener("click", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";
  try {
    const id = identifierEl.value.trim();
    if (!id) throw new Error("Ingresa tu correo.");
    if (!id.includes("@")) {
      // Los miembros no tienen correo real; el reset sólo aplica a admins
      throw new Error("El restablecimiento de contraseña sólo está disponible para cuentas con correo. Contacta al administrador.");
    }
    await sendPasswordResetEmail(auth, id);
    errorEl.textContent = "Correo enviado para restablecer contraseña.";
  } catch (e) {
    errorEl.textContent = e.message || "No se pudo enviar el correo.";
  }
});