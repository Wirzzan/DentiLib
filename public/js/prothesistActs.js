const API = "/prothesiste";

const actsBody = document.getElementById("actsBody");
const addActBtn = document.getElementById("addActBtn");
const returnBtn = document.getElementById("returnBtn");

let acts = [];

async function fetchAdminActs() {
  try {
    const res = await fetch(`${API}/acts/admin`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Impossible de charger le catalogue d'actes");
    const data = await res.json();
    acts = data.acts || [];
  } catch (err) {
    console.error("Erreur fetch admin acts :", err);
    showFeedback(err.message, "error");
  }
}

async function fetchMyActs() {
  try {
    const res = await fetch(`${API}/acts/my`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Impossible de charger vos actes");
    const data = await res.json();
    const myActs = data.acts || [];

    actsBody.innerHTML = "";
    myActs.forEach((a) =>
      addActToTable(a.acte._id, a.acte.name, a.acte.description, a.price)
    );
  } catch (err) {
    console.error("Erreur fetch my acts :", err);
    showFeedback(err.message, "error");
  }
}

function addActToTable(acteId = "", name = "", description = "", price = "") {
  if (!acts.length) return;

  const tr = document.createElement("tr");
  tr.dataset.acteId = acteId;
  tr.innerHTML = `
    <td>
      <select class="act-select">
        <option value="">-- Sélectionner un acte --</option>
        ${acts.map((a) => `<option value="${a._id}" data-desc="${a.description}" ${String(a._id) === String(acteId) ? "selected" : ""}>${a.name}</option>`).join("")}
      </select>
    </td>
    <td class="act-description">${description}</td>
    <td><input type="number" class="priceInput" value="${price}" min="0" step="0.01" aria-label="Prix en euros"></td>
    <td><button class="btn-delete-act">✖</button></td>
  `;
  actsBody.appendChild(tr);

  const select = tr.querySelector(".act-select");
  const descTd = tr.querySelector(".act-description");
  const priceInput = tr.querySelector(".priceInput");
  const deleteBtn = tr.querySelector(".btn-delete-act");

  select.addEventListener("change", async () => {
    const selected = select.selectedOptions[0];
    const newActeId = select.value;

    if (!newActeId) return;

    descTd.textContent = selected.dataset.desc || "";

    try {
      const res = await fetch(`${API}/acts/add`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          acteId: newActeId,
          price: priceInput.value || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'ajout de l'acte");

      tr.dataset.acteId = newActeId;
    } catch (err) {
      console.error("Erreur ajout acte :", err);
      showFeedback(err.message, "error");
    }
  });

  deleteBtn.addEventListener("click", async () => {
    if (!select.value) {
      tr.remove();
      return;
    }

    try {
      const acteId = tr.dataset.acteId;
      const res = await fetch(`${API}/acts/delete/${acteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");

      tr.remove();
      showFeedback("Acte supprimé avec succès");
    } catch (err) {
      console.error(err);
      showFeedback(err.message, "error");
    }
  });

  priceInput.addEventListener("change", async () => {
    if (!select.value) return;

    try {
      const acteId = tr.dataset.acteId;
      const res = await fetch(`${API}/acts/update/${acteId}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({ price: priceInput.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour du prix");
    } catch (err) {
      console.error(err);
      showFeedback(err.message, "error");
    }
  });
}

addActBtn?.addEventListener("click", () => {
  if (!acts.length) {
    showFeedback("Aucun acte disponible dans le catalogue", "error");
    return;
  }
  addActToTable();
});

returnBtn?.addEventListener("click", () => {
  window.location.href = "/prothesistHome.html";
});

(async function init() {
  await fetchAdminActs();
  await fetchMyActs();
})();
