const token = localStorage.getItem("token");
const API = "http://localhost:3000/prothesiste";


const actsBody = document.getElementById("actsBody");
const addActToProto = document.getElementById("addActToProto");
const backBtn = document.getElementById("backBtn");

let acts = [];

// ==========================
// FETCH admin acts
// ==========================
async function fetchAdminActs() {
  try {
    const res = await fetch(`${API}/acts/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    acts = data.acts || [];
  } catch (err) {
    console.error("Erreur fetch admin acts :", err);
  }
}

// ==========================
// FETCH my acts
// ==========================
async function fetchMyActs() {
  try {
    const res = await fetch(`${API}/acts/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const myActs = data.acts || [];

    // vider le tableau sauf la ligne add-act-row
    actsBody.querySelectorAll("tr:not(.add-act-row)").forEach(tr => tr.remove());

    // remplir le tableau
    myActs.forEach(a => addActToTable(a.acte._id, a.acte.name, a.acte.description, a.price));
  } catch (err) {
    console.error("Erreur fetch my acts :", err);
  }
}

// ==========================
// AJOUTER UNE LIGNE ACTE DANS LE TABLEAU
// ==========================
function addActToTable(acteId = "", name = "", description = "", price = "") {
  if (!acts.length) return;

  const tr = document.createElement("tr");
  tr.dataset.acteId = acteId;
  tr.innerHTML = `
    <td>
      <select class="act-select">
        <option value="">-- Sélectionner un acte --</option>
        ${acts.map(a => `<option value="${a._id}" data-desc="${a.description}" ${a._id === acteId ? "selected" : ""}>${a.name}</option>`).join('')}
      </select>
    </td>
    <td class="act-description">${description}</td>
    <td><input type="number" class="priceInput" value="${price}" min="0" step="0.01"></td>
    <td><button class="btn-delete-act">✖</button></td>
  `;
  actsBody.insertBefore(tr, addActToProto.parentElement);

  const select = tr.querySelector(".act-select");
  const descTd = tr.querySelector(".act-description");
  const priceInput = tr.querySelector(".priceInput");
  const deleteBtn = tr.querySelector(".btn-delete-act");

  // Modifier la description quand on change l'acte
  select.addEventListener("change", async () => {
  const selected = select.selectedOptions[0];
  const acteId = select.value;

  if (!acteId) return;

  // Afficher la description
  descTd.textContent = selected.dataset.desc || "";

  try {
    await fetch(`${API}/acts/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        acteId,
        price: priceInput.value || 0
      })
    });

    
    tr.dataset.acteId = acteId; // Stocker l'acteId pour update/delete
  } catch (err) {
    console.error("Erreur ajout acte :", err);
  }
});
  // Supprimer l'acte
  deleteBtn.addEventListener("click", async () => {
    if (!select.value) return tr.remove(); // ligne non enregistrée
    try {
      const acteId = tr.dataset.acteId;  
      await fetch(`${API}/acts/delete/${acteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      tr.remove();
    } catch (err) {
      console.error(err);
    }
  });

  // Sauvegarder prix dès changement
  priceInput.addEventListener("change", async () => {
    if (!select.value) return;
    try {
      const acteId = tr.dataset.acteId;  
      await fetch(`${API}/acts/update/${acteId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ price: priceInput.value })
      });
    } catch (err) {
      console.error(err);
    }
  });
}

// ==========================
// CLIQUE SUR "Ajouter un acte"
// ==========================
if (addActToProto) {
  addActToProto.addEventListener("click", () => addActToTable());
} else {
  console.error("addActToProto introuvable dans le DOM !");
}

// ==========================
// BOUTON RETOUR
// ==========================
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "/prothesistHome.html";
  });
} else {
  console.error("backBtn introuvable dans le DOM !");
}

// ==========================
// INIT
// ==========================
(async function init() {
  await fetchAdminActs();
  await fetchMyActs();
})();
