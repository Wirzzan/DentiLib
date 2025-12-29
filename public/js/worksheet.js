const params = new URLSearchParams(window.location.search);
const worksheetId = params.get("id");

const token = localStorage.getItem("token");
if (!token) window.location.href = "/";

let actes = [];

const nomPatientSpan = document.getElementById("nomPatient");
const prenomPatientSpan = document.getElementById("prenomPatient");
const emailPatientSpan = document.getElementById("emailPatient");
const numSecuPatientSpan = document.getElementById("numSecuPatient");
const createdAtSpan = document.getElementById("createdAt");
const numFicheSpan = document.getElementById("numFiche");
const editPatientBtn = document.getElementById("editPatientBtn");

const addActWorksheet = document.getElementById("addActWorksheet");
const actsTableBody = document.getElementById("actsTableBody");
const remarqueTextarea = document.getElementById("remarque");

const statusSpan = document.getElementById("pro-status");
const livraisonSpan = document.getElementById("pro-date-livraison");
const paiementSpan = document.getElementById("pro-date-paiement");
const factureBtn = document.getElementById("factureBtn");

const saveWorksheetBtn = document.getElementById("saveWorksheetBtn");
const envoyerFicheBtn = document.getElementById("envoyerFicheBtn");
const backBtn = document.getElementById("backBtn");

// ------------------
// Initialiser le bouton sauvegarder
// ------------------
saveWorksheetBtn.disabled = true;

// ==================
// AJOUTER UN ACTE DANS LE TABLEAU
// ==================
function addActToTable(name = "", description = "") {
  if (!actes.length) return;

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>
      <select class="act-select">
        <option value="">-- Sélectionner un acte --</option>
        ${actes.map(a => `<option value="${a.name}" data-desc="${a.description}" ${a.name === name ? "selected" : ""}>${a.name}</option>`).join('')}
      </select>
    </td>
    <td class="act-description">${description}</td>
    <td>—</td>
    <td>
      <button class="btn-delete-act">✖</button>
    </td>
  `;

  actsTableBody.insertBefore(tr, addActWorksheet.parentElement);

  const select = tr.querySelector(".act-select");
  const descTd = tr.querySelector(".act-description");

  select.addEventListener("change", () => {
    descTd.textContent = select.selectedOptions[0].dataset.desc || "";
    enableSave();
  });

  tr.querySelector(".btn-delete-act").addEventListener("click", () => {
    tr.remove();
    enableSave();
  });
}

// ==================
// FETCH ACTES DISPONIBLES
// ==================
async function fetchActes() {
  try {
    const res = await fetch('http://localhost:3000/act/act/getAllActs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    actes = data.actes || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des actes :", error);
  }
}

// ==================
// FETCH FICHE
// ==================
async function fetchWorksheet() {
  const res = await fetch(`http://localhost:3000/dentiste/worksheets/${worksheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const ws = data.workSheet;

  nomPatientSpan.textContent = ws.nomPatient;
  prenomPatientSpan.textContent = ws.prenomPatient;
  emailPatientSpan.textContent = ws.emailPatient;
  numSecuPatientSpan.textContent = ws.numSecuPatient;
  createdAtSpan.textContent = new Date(ws.createdAt).toLocaleDateString();
  numFicheSpan.textContent = ws.numFiche;
  remarqueTextarea.value = ws.remarque || "";

  // Afficher les actes existants
  if (ws.acts && ws.acts.length) {
    ws.acts.forEach(act => addActToTable(act.name, act.description));
  }

  // statut prothésiste
  const statusMap = {
    EN_ATTENTE: { label: "Travaux en attente", class: "attente" },
    EN_COURS: { label: "Travaux en cours", class: "encours" },
    TERMINE: { label: "Travaux terminés", class: "termine" },
    EN_ATTENTE_PAIEMENT: { label: "En attente de paiement", class: "attente-paiement" },
    PAYE: { label: "Payé", class: "paye" },
  };
  const status = ws.status || "EN_ATTENTE";
  const statusInfo = statusMap[status];
  statusSpan.textContent = statusInfo.label;
  statusSpan.className = `status ${statusInfo.class}`;

  // dates
  livraisonSpan.textContent = ws.dateLivraison ? new Date(ws.dateLivraison).toLocaleDateString() : "—";
  paiementSpan.textContent = ws.datePaiement ? new Date(ws.datePaiement).toLocaleDateString() : "—";

  factureBtn.disabled = status !== "PAYE";
}

// ==================
// MODIFIER INFOS PATIENT
// ==================
editPatientBtn.addEventListener("click", () => {
  const patientFields = [
    { id: "nomPatient", type: "text" },
    { id: "prenomPatient", type: "text" },
    { id: "emailPatient", type: "email" },
    { id: "numSecuPatient", type: "text" }
  ];

  patientFields.forEach(field => {
    const span = document.getElementById(field.id);
    const value = span.textContent;

    const input = document.createElement("input");
    input.type = field.type;
    input.value = value;
    input.id = field.id;
    input.classList.add("patient-input");

    // Listener pour activer le bouton save dès qu’on modifie
    input.addEventListener("input", enableSave);

    span.replaceWith(input);
  });

  editPatientBtn.disabled = true;
  enableSave(); // bouton actif dès qu’on clique sur edit
});

// ==================
// AJOUTER UN NOUVEL ACTE
// ==================
addActWorksheet.addEventListener("click", () => {
  addActToTable();
  enableSave();
});

// ==================
// CALCUL COÛT TOTAL DES ACTES
// ==================

function updateTotalActes() {
  let total = 0;
  document.querySelectorAll(".acts-section tbody tr")
    .forEach(tr => {
      const select = tr.querySelector(".act-select");
      if (select && select.value) {
        const act = actes.find(a => a.name === select.value);
        if (act) total += act.price || 0; // supposons que chaque acte a un attribut price
      }
    });
  document.getElementById("totalActes").textContent = total.toFixed(2);
}

// Appeler à chaque changement ou ajout/suppression d'acte
actsTableBody.addEventListener("change", e => {
  if (e.target.classList.contains("act-select")) updateTotalActes();
});
actsTableBody.addEventListener("click", e => {
  if (e.target.classList.contains("btn-delete-act")) setTimeout(updateTotalActes, 0);
});
addActWorksheet.addEventListener("click", () => setTimeout(updateTotalActes, 0));



// ==================
// SAUVEGARDE MODIFs
// ==================
saveWorksheetBtn.addEventListener("click", async () => {
  const nomPatient = document.getElementById("nomPatient").value;
  const prenomPatient = document.getElementById("prenomPatient").value;
  const emailPatient = document.getElementById("emailPatient").value;
  const numSecuPatient = document.getElementById("numSecuPatient").value;

  const acts = [...document.querySelectorAll(".acts-section tbody tr")]
    .filter(tr => tr.querySelector(".act-select"))
    .map(tr => {
      const select = tr.querySelector(".act-select");
      const desc = tr.querySelector(".act-description").textContent;
      return { name: select.value, description: desc };
    });

  try {
    const res = await fetch(`http://localhost:3000/dentiste/worksheets/update/${worksheetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nomPatient,
        prenomPatient,
        emailPatient,
        numSecuPatient,
        acts,
        remarque: remarqueTextarea.value
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Fiche mise à jour avec succès !");
      saveWorksheetBtn.disabled = true;
      saveWorksheetBtn.classList.remove("floating-save");
      window.location.reload();
    } else {
      alert("Erreur : " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Erreur serveur lors de la mise à jour.");
  }
});

// ==================
// ACTIVER LE BOUTON SAVE
// ==================
function enableSave() {
  saveWorksheetBtn.disabled = false;
  saveWorksheetBtn.classList.add("floating-save");
}

remarqueTextarea.addEventListener("input", enableSave);

// Changement des actes déjà existants
actsTableBody.addEventListener("change", (e) => {
  if (e.target.classList.contains("act-select")) {
    enableSave();
  }
});

// ==================
// BOUTON ENVOYER FICHE
// ==================
envoyerFicheBtn.addEventListener("click", async () => {
  if (!confirm("Envoyer cette fiche au prothésiste ? Vous ne pourrez plus la modifier.")) return;

  try {
    // Bloquer tous les champs modifiables
    document.querySelectorAll(".patient-info input, .acts-section select, #remarque, #addActWorksheet")
      .forEach(el => el.disabled = true);

    editPatientBtn.disabled = true;
    saveWorksheetBtn.disabled = true;
    saveWorksheetBtn.classList.remove("floating-save");

    // Mettre à jour la fiche côté serveur
    const res = await fetch(`http://localhost:3000/dentiste/worksheets/send/${worksheetId}`, { 
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Erreur API envoyer fiche :", data);
      throw new Error(data.message || "Erreur inconnue côté serveur");
    }

    alert("Fiche envoyée au prothésiste !");
  } catch (err) {
    console.error("❌ Erreur JS envoyer fiche :", err);
    alert(err.message);
  }
});

//Bouton retour 
backBtn.addEventListener("click", () => {
  window.location.href = "../dentistHome.html";
});

// ==================
// INIT
// ==================
fetchActes().then(fetchWorksheet);
