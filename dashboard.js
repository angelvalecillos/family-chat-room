import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const membersEl = document.getElementById("members");
const addBtn = document.getElementById("addMember");
const logoutBtn = document.getElementById("logoutBtn");
const goChatBtn = document.getElementById("goChat");

let uid=null, familyId=null;

onAuthStateChanged(auth, async (user) => {
  if(!user){ window.location.href = "login.html"; return; }
  uid = user.uid;

  // GUARDIA DE ROL: solo admin
  const famSnap = await getDoc(doc(db,"families",uid));
  const isAdmin = famSnap.exists() && famSnap.data()?.adminUid === uid;
  if (!isAdmin) {
    alert("Esta sección es solo para el administrador.");
    window.location.href = "chat.html";
    return;
  }

  familyId = uid;

  onSnapshot(collection(db,`families/${familyId}/members`),(snap)=>{
    membersEl.innerHTML = "";
    snap.forEach(docSnap=>{
      const d = docSnap.data();
      const div = document.createElement("div");
      div.className = "member";
      div.textContent = `${d.nickname} (${d.relation||"Miembro"})`;
      membersEl.appendChild(div);
    });
  });
});

addBtn.addEventListener("click", ()=>{ window.location.href = "members.html"; });
logoutBtn.addEventListener("click", async ()=>{ await signOut(auth); window.location.href="login.html"; });
goChatBtn.addEventListener("click", ()=>{ window.location.href="chat.html"; });