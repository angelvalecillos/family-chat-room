// Popup de errores reutilizable en todas las páginas
export function showErrorModal(title, error, context = {}) {
  const modalId = "errorModal";
  let modal = document.getElementById(modalId);

  if (!modal) {
    modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "modal";
    modal.innerHTML = `
      <div class="content">
        <h3 id="errTitle" style="margin:0 0 8px">Error</h3>
        <div id="errBody" class="small" style="margin-bottom:12px"></div>
        <pre id="errJson" style="max-height:40vh;overflow:auto;background:#0f1328;border:1px solid #2a2e46;padding:12px;border-radius:8px;color:#e7e7ea"></pre>
        <div class="modal-actions">
          <button id="errClose" class="btn">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector("#errClose").addEventListener("click", () => {
      modal.style.display = "none";
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  const body = modal.querySelector("#errBody");
  const pre = modal.querySelector("#errJson");
  const h3 = modal.querySelector("#errTitle");

  // Normaliza el error
  const errObj = {
    name: error?.name || "",
    code: error?.code || "",
    message: error?.message || String(error || ""),
    stack: error?.stack || "",
    firebase: error?.customData || undefined,
    context,
  };

  h3.textContent = title || "Error";
  body.innerHTML = `
    <div><strong>Código:</strong> ${errObj.code || "—"}</div>
    <div><strong>Mensaje:</strong> ${escapeHtml(errObj.message)}</div>
  `;

  pre.textContent = JSON.stringify(errObj, null, 2);
  modal.style.display = "flex";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}