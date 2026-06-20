const urlParams = new URLSearchParams(window.location.search);
const worksheetId = urlParams.get("id");

const proStatus = document.getElementById("pro-status");
const proDateLivraison = document.getElementById("pro-date-livraison");
const proDatePaiement = document.getElementById("pro-date-paiement");

const editBtn = document.getElementById("editProSectionBtn");
const saveBtn = document.getElementById("saveProSectionBtn");

async function fetchWorksheet() {
  const res = await fetch(`/prothesiste/worksheets/${worksheetId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  const ws = data.workSheet;

  proStatus.value = ws.status || "";
  proDateLivraison.value = ws.proDateLivraison || "";
  proDatePaiement.value = ws.proDatePaiement || "";

  proStatus.disabled = true;
  proDateLivraison.disabled = true;
  proDatePaiement.disabled = true;
  saveBtn.disabled = true;
}

editBtn.addEventListener("click", () => {
  proStatus.disabled = false;
  proDateLivraison.disabled = false;
  proDatePaiement.disabled = false;
  saveBtn.disabled = false;
});

saveBtn.addEventListener("click", async () => {
  const payload = {
    status: proStatus.value,
    proDateLivraison: proDateLivraison.value,
    proDatePaiement: proDatePaiement.value,
  };

  await fetch(`/prothesiste/worksheets/update/${worksheetId}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });

  proStatus.disabled = true;
  proDateLivraison.disabled = true;
  proDatePaiement.disabled = true;
  saveBtn.disabled = true;

  showFeedback("Mise à jour enregistrée !");
});

fetchWorksheet();
