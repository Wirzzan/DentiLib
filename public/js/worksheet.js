const params = new URLSearchParams(window.location.search);
const worksheetId = params.get("id");
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
if (!token) window.location.href = "/";

let actes = [];



const nomPatientSpan = document.getElementById("nomPatient");
const prenomPatientSpan = document.getElementById("prenomPatient");
const emailPatientSpan = document.getElementById("emailPatient");
const numSecuPatientSpan = document.getElementById("numSecuPatient");
const createdAtSpan = document.getElementById("createdAt");
const numFicheSpan = document.getElementById("numFiche");
const editPatientBtn = document.getElementById("editPatientBtn");

const searchAct = document.getElementById("selectAct");
const addActBtn = document.getElementById("addActBtn");
const actsTableBody = document.getElementById("actsTableBody");
const remarqueTextarea = document.getElementById("remarque");

const proStatusInput = document.getElementById("pro-status");
const proDateLivraisonInput = document.getElementById("pro-date-livraison");
const proDatePaiementInput = document.getElementById("pro-date-paiement");
const editProSectionBtn = document.getElementById("editProSectionBtn");
const saveProSectionBtn = document.getElementById("saveProSectionBtn");

const saveWorksheetBtn = document.getElementById("saveWorksheetBtn");
const envoyerFicheBtn = document.getElementById("envoyerFicheBtn");
const factureBtn = document.getElementById("factureBtn");
const backBtn = document.getElementById("backBtn");



//================== Pour Proto ========================
if (role === "PROTHESISTE") {
  editProSectionBtn.style.display = "inline-block";
  saveProSectionBtn.style.display = "inline-block";
} else {
  editProSectionBtn.style.display = "none";
  saveProSectionBtn.style.display = "none";
}

editProSectionBtn?.addEventListener("click", () => {
  proStatusInput.disabled = false;
  proDateLivraisonInput.disabled = false;
  proDatePaiementInput.disabled = false;

  saveProSectionBtn.disabled = false;
});

saveProSectionBtn?.addEventListener("click", async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/prothesiste/worksheets/update/${worksheetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: proStatusInput.value,
          proDateLivraison: proDateLivraisonInput.value || null,
          proDatePaiement: proDatePaiementInput.value || null
        })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur serveur");

    // re-griser après sauvegarde
    proStatusInput.disabled = true;
    proDateLivraisonInput.disabled = true;
    proDatePaiementInput.disabled = true;
    saveProSectionBtn.disabled = true;

    alert("✅ Section prothésiste mise à jour");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});


// ================== FETCH ACTES DISPONIBLES ==================
async function fetchActes() {
  try {
    const res = await fetch(
      "http://localhost:3000/dentiste/worksheets/proto-acts",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    actes = data.acts || [];

    console.log("✅ Actes prothésiste :", actes);

    selectAct.innerHTML = `<option value="">-- Sélectionner un acte --</option>`;

    actes.forEach(act => {
      const opt = document.createElement("option");
      opt.value = act.acteId;              // IMPORTANT
      opt.textContent = `${act.name}`;
      opt.dataset.description = act.description;
      opt.dataset.price = act.price;
      selectAct.appendChild(opt);
    });

  } catch (err) {
    console.error("❌ Erreur fetchActes :", err);
    actes = [];
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d) ? "—" : d.toLocaleDateString();
}

// ================== FETCH FICHE ==================
async function fetchWorksheet() {
  try {
    const worksheetUrl =
      role === "PROTHESISTE"
        ? `http://localhost:3000/prothesiste/worksheets/${worksheetId}`
        : `http://localhost:3000/dentiste/worksheets/${worksheetId}`;

    const res = await fetch(worksheetUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Fiche introuvable");

    const data = await res.json();
    const ws = data.workSheet;

    // ================== INFOS PATIENT ==================
    nomPatientSpan.textContent = ws.nomPatient;
    prenomPatientSpan.textContent = ws.prenomPatient;
    emailPatientSpan.textContent = ws.emailPatient;
    numSecuPatientSpan.textContent = ws.numSecuPatient;
    createdAtSpan.textContent = new Date(ws.createdAt).toLocaleDateString();
    numFicheSpan.textContent = ws.numFiche;
    remarqueTextarea.value = ws.remarque || "";

    // ================== ACTES ==================
    actsTableBody
      .querySelectorAll("tr[data-acte-id]")
      .forEach(tr => tr.remove());

    if (Array.isArray(ws.acts)) {
      ws.acts.forEach(a => addActToTable(a));
    }

    // ================== SECTION PROTHÉSISTE ==================
    const statusMap = {
      BROUILLON: { label: "Brouillon", class: "brouillon" },
      EN_ATTENTE: { label: "Travaux en attente", class: "attente" },
      EN_COURS: { label: "Travaux en cours", class: "encours" },
      TERMINE: { label: "Travaux terminés", class: "termine" },
      EN_ATTENTE_PAIEMENT: { label: "En attente de paiement", class: "attente-paiement" },
      PAYE: { label: "Payé", class: "paye" },
    };

    proStatusInput.value = ws.status;
    // ------------- Bouton Envoyer Fiche --------------
    if (ws.status !== "BROUILLON") {
      envoyerFicheBtn.style.display = "none";
    } else {
      envoyerFicheBtn.style.display = "inline-block";
      envoyerFicheBtn.disabled = false;
    }//------------- Bouton Facture   --------------------
    if (
      ws.status === "TERMINE" ||
      ws.status === "EN_ATTENTE_PAIEMENT" ||
      ws.status === "PAYE"
    ) {
      factureBtn.style.display = "inline-block";
    } else {
      factureBtn.style.display = "none";
    }//-------------------------------------------------

    proDateLivraisonInput.value = ws.proDateLivraison
      ? new Date(ws.proDateLivraison).toISOString().split("T")[0]
      : "";

    proDatePaiementInput.value = ws.proDatePaiement
      ? new Date(ws.proDatePaiement).toISOString().split("T")[0]
      : "";

    updateTotalActes();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// ================== MODIFIER INFOS PATIENT ==================
editPatientBtn.addEventListener("click", () => {
  // Convertir les spans en input
  const fields = [
    { span: nomPatientSpan, name: "nomPatient" },
    { span: prenomPatientSpan, name: "prenomPatient" },
    { span: emailPatientSpan, name: "emailPatient" },
    { span: numSecuPatientSpan, name: "numSecuPatient" }
  ];

  fields.forEach(f => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = f.span.textContent;
    input.id = f.name; // garde le même id pour la sauvegarde
    input.className = "patient-input";
    f.span.replaceWith(input);
  });

  // Optionnel : désactiver le bouton edit après clic
  editPatientBtn.disabled = true;
});


// ================== AJOUTER UN ACTE ==================
function addActToTable(act) {
  const tr = document.createElement("tr");
  
  tr.dataset.acteId = act.acteId;

  const nameTd = document.createElement("td");
  nameTd.textContent = act.name;

  const descTd = document.createElement("td");
  descTd.textContent = act.description;

  const priceTd = document.createElement("td");
  priceTd.classList.add("act-price");
  priceTd.textContent = `${act.price} €`;


  const actionTd = document.createElement("td");
  const delBtn = document.createElement("button");
  delBtn.textContent = "✖";
  delBtn.className = "btn btn-delete-act";
  delBtn.addEventListener("click", () => {
    tr.remove();
    updateTotalActes();
  });
  actionTd.appendChild(delBtn);

  tr.append(nameTd, descTd, priceTd, actionTd);

  actsTableBody.insertBefore(tr, document.getElementById("totalActesRow"));
  updateTotalActes();
}

// ================== BOUTON AJOUTER ==================
addActBtn.addEventListener("click", () => {
  const selectedOpt = selectAct.selectedOptions[0];
  if (!selectedOpt || !selectedOpt.value) {
    alert("Veuillez sélectionner un acte");
    return;
  }

  const acte = {
    acteId: selectedOpt.value,
    name: selectedOpt.textContent,
    description: selectedOpt.dataset.description,
    price: Number(selectedOpt.dataset.price)
  };

  addActToTable(acte);
  selectAct.value = "";
});


// ================== CALCUL TOTAL ==================
function updateTotalActes() {
  let total = 0;
  document.querySelectorAll(".act-price").forEach(td => {
    const val = td.textContent.replace("€","").trim();
    if (val) total += Number(val);
  });
  document.getElementById("totalActes").textContent = total.toFixed(2);
}

//======================GETFIELD POUR SAUVEGARDER===============
function getFieldValue(id) {
  const el = document.getElementById(id);
  return el.tagName === "INPUT" ? el.value.trim() : el.textContent.trim();
}
// ================== SAUVEGARDE ==================
saveWorksheetBtn.addEventListener("click", async () => {
  try {
    // ================== INFOS PATIENT ==================
    const nomPatient = getFieldValue("nomPatient");
    const prenomPatient = getFieldValue("prenomPatient");
    const emailPatient = getFieldValue("emailPatient");
    const numSecuPatient = getFieldValue("numSecuPatient");

    // ================== ACTES ==================
    const acts = [...actsTableBody.querySelectorAll("tr")]
      .filter(tr => tr.dataset.acteId) // ignore la ligne total
      .map(tr => ({
        acteId: tr.dataset.acteId,
        name: tr.cells[0].textContent.trim(),
        description: tr.cells[1].textContent.trim(),
        price: Number(tr.cells[2].textContent.replace("€", "").trim())
      }));

    console.log("📤 Sauvegarde worksheet :", {
      nomPatient,
      prenomPatient,
      emailPatient,
      numSecuPatient,
      acts,
      remarque: remarqueTextarea.value
    });

    // ================== FETCH ==================
    const res = await fetch(
      `http://localhost:3000/dentiste/worksheets/update/${worksheetId}`,
      {
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
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur serveur");

    alert("✅ Fiche mise à jour avec succès");
    window.location.reload();

  } catch (err) {
    console.error("❌ Erreur sauvegarde :", err);
    alert(err.message);
  }
});

//============= ENVOYER FICHE ================
envoyerFicheBtn.addEventListener("click", async () => {
  if (!confirm("Voulez-vous vraiment envoyer cette fiche au prothésiste associé ?")) return;

  try {
    const res = await fetch(`http://localhost:3000/dentiste/worksheets/send/${worksheetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Erreur serveur");

    alert("✅ " + data.message);

    // Mettre à jour l'affichage localement
    fetchWorksheet();

  } catch (err) {
    console.error("❌ Erreur envoi fiche :", err);
    alert(err.message);
  }
});


// ============== RETOUR ===============
backBtn.addEventListener("click", () => {
  window.history.back();
});

window.addEventListener("pageshow", (event) => {
  // Si la page vient de l'historique (bfcache)
  if (event.persisted) {
    window.location.reload();
  }
});

//================= FACTURE ==================
function getWorkSheetData() {
  const acts = [];
  document.querySelectorAll("#actsTableBody tr").forEach(row => {
    // Ignorer la ligne total
    if (row.id === "totalActesRow") return;

    const cells = row.querySelectorAll("td");
    acts.push({
      name: cells[0].textContent.trim(),
      description: cells[1].textContent.trim(),
      price: parseFloat(cells[2].textContent.trim()) || 0
    });
  });

  return {
    numFiche: document.getElementById("numFiche").textContent.trim(),
    nomPatient: document.getElementById("nomPatient").textContent.trim(),
    prenomPatient: document.getElementById("prenomPatient").textContent.trim(),
    emailPatient: document.getElementById("emailPatient").textContent.trim(),
    createdAt: document.getElementById("createdAt").textContent.trim(),
    acts
  };
}

// Génération PDF
factureBtn.addEventListener("click", () => {
  const data = getWorkSheetData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 40;
  let y = margin;

  // TITRE
  doc.setFontSize(22);
  doc.setTextColor("#0d6efd");
  doc.text("FACTURE", margin, y);
  y += 30;

  // INFO PATIENT
  doc.setFontSize(12);
  doc.setTextColor("#000");
  doc.text(`Numéro de fiche : ${data.numFiche}`, margin, y);
  y += 18;
  doc.text(`Patient : ${data.nomPatient} ${data.prenomPatient}`, margin, y);
  y += 18;
  doc.text(`Email : ${data.emailPatient}`, margin, y);
  y += 18;
  doc.text(`Date : ${data.createdAt}`, margin, y);
  y += 30;

  // TABLEAU DES ACTES
  const tableTop = y;
  const colWidths = [150, 250, 80]; // largeur des colonnes: Acte, Description, Prix
  const rowHeight = 20;

  // Header
  doc.setFillColor("#f0f0f0");
  doc.rect(margin, y, colWidths.reduce((a,b)=>a+b,0), rowHeight, "F");
  doc.setFontSize(12);
  doc.setTextColor("#000");
  doc.text("Acte", margin + 5, y + 15);
  doc.text("Description", margin + colWidths[0] + 5, y + 15);
  doc.text("Prix (€)", margin + colWidths[0] + colWidths[1] + 5, y + 15);
  y += rowHeight;

  // Lignes
  data.acts.forEach(a => {
    doc.setFillColor("#fff");
    doc.rect(margin, y, colWidths.reduce((a,b)=>a+b,0), rowHeight, "F");
    doc.text(a.name, margin + 5, y + 15);
    doc.text(a.description, margin + colWidths[0] + 5, y + 15);
    doc.text(a.price.toFixed(2), margin + colWidths[0] + colWidths[1] + 5, y + 15);
    y += rowHeight;
  });

  // TOTAL
  const total = data.acts.reduce((sum, a) => sum + a.price, 0);
  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Total : ${total.toFixed(2)} €`, margin + colWidths[0] + colWidths[1], y);

  // Ouvrir le PDF dans un nouvel onglet
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
});

// ================== LOGOUT ==================
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "/";
};

// ================== INIT ==================
if (role === "DENTISTE") {
  fetchActes().then(fetchWorksheet);
} else {
  fetchWorksheet();
}

