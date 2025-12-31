const urlParams = new URLSearchParams(window.location.search);
const worksheetId = urlParams.get("id");
const token = localStorage.getItem("token");

const proStatus = document.getElementById("pro-status");
const proDateLivraison = document.getElementById("pro-date-livraison");
const proDatePaiement = document.getElementById("pro-date-paiement");

const editBtn = document.getElementById("editProSectionBtn");
const saveBtn = document.getElementById("saveProSectionBtn");

// récupérer la fiche
async function fetchWorksheet() {
  const res = await fetch(`http://localhost:3000/prothesiste/worksheets/${worksheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const ws = data.workSheet;

  proStatus.value = ws.status || "";
  proDateLivraison.value = ws.proDateLivraison || "";
  proDatePaiement.value = ws.proDatePaiement || "";

  // désactiver par défaut
  proStatus.disabled = true;
  proDateLivraison.disabled = true;
  proDatePaiement.disabled = true;
  saveBtn.disabled = true;
}

// éditer
editBtn.addEventListener("click", () => {
  proStatus.disabled = false;
  proDateLivraison.disabled = false;
  proDatePaiement.disabled = false;
  saveBtn.disabled = false;
});

// sauvegarder
saveBtn.addEventListener("click", async () => {
  const payload = {
    status: proStatus.value,
    proDateLivraison: proDateLivraison.value,
    proDatePaiement: proDatePaiement.value
  };

  await fetch(`http://localhost:3000/prothesiste/worksheets/update/${worksheetId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  // désactiver après sauvegarde
  proStatus.disabled = true;
  proDateLivraison.disabled = true;
  proDatePaiement.disabled = true;
  saveBtn.disabled = true;

  alert("Mise à jour enregistrée !");
});

fetchWorksheet();
