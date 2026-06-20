const params = new URLSearchParams(window.location.search);
const worksheetId = params.get("id");
const token = getToken();
const role = localStorage.getItem("role");
if (!token) window.location.href = "/";

const isProthesiste = role === "PROTHESISTE";
let actes = [];
let hasProthesiste = true;

const PATIENT_FIELD_IDS = ["nomPatient", "prenomPatient", "emailPatient", "numSecuPatient"];
let patientEditSnapshot = null;
let isPatientEditing = false;

const createdAtSpan = document.getElementById("createdAt");
const numFicheSpan = document.getElementById("numFiche");
const editPatientBtn = document.getElementById("editPatientBtn");
const cancelPatientBtn = document.getElementById("cancelPatientBtn");
const patientEditHint = document.getElementById("patientEditHint");

const searchAct = document.getElementById("selectAct");
const noProthesisteMsg = document.getElementById("noProthesisteMsg");
const actSelectHint = document.getElementById("actSelectHint");
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

function patientField(id) {
  return document.getElementById(id);
}

function setPatientDisplayValue(id, value) {
  const el = patientField(id);
  if (!el) return;
  if (el.tagName === "INPUT") {
    el.value = value ?? "";
  } else {
    el.textContent = value ?? "";
  }
}

function enterPatientEditMode() {
  if (isPatientEditing || isProthesiste) return;

  patientEditSnapshot = {};
  PATIENT_FIELD_IDS.forEach((id) => {
    const el = patientField(id);
    patientEditSnapshot[id] = el.textContent.trim();
    const input = document.createElement("input");
    input.type = "text";
    input.value = patientEditSnapshot[id];
    input.id = id;
    input.className = "patient-input";
    el.replaceWith(input);
  });

  isPatientEditing = true;
  editPatientBtn.hidden = true;
  cancelPatientBtn.hidden = false;
  patientEditHint.hidden = false;
}

function exitPatientEditMode(restore = false) {
  if (!isPatientEditing) return;

  PATIENT_FIELD_IDS.forEach((id) => {
    const el = patientField(id);
    const value = restore
      ? patientEditSnapshot[id]
      : el.tagName === "INPUT"
        ? el.value.trim()
        : el.textContent.trim();
    const span = document.createElement("span");
    span.id = id;
    span.textContent = value;
    el.replaceWith(span);
  });

  isPatientEditing = false;
  patientEditSnapshot = null;
  editPatientBtn.hidden = false;
  cancelPatientBtn.hidden = true;
  patientEditHint.hidden = true;
}

function applyNoProthesisteRestrictions() {
  if (isProthesiste || hasProthesiste) return;

  if (noProthesisteMsg) noProthesisteMsg.style.display = "block";
  searchAct.disabled = true;
  addActBtn.disabled = true;
  envoyerFicheBtn.disabled = true;
  envoyerFicheBtn.title =
    "Impossible d'envoyer cette fiche : aucun prothésiste n'est associé à votre compte.";
}

function applyProthesisteView() {
  editPatientBtn.style.display = "none";
  cancelPatientBtn.style.display = "none";
  patientEditHint.style.display = "none";
  document.querySelector(".search-act-section").style.display = "none";
  saveWorksheetBtn.closest(".save-section").style.display = "none";
  envoyerFicheBtn.style.display = "none";
  remarqueTextarea.readOnly = true;

  const actionsHeader = document.querySelector(".acts-section thead th:last-child");
  if (actionsHeader) actionsHeader.style.display = "none";

  const totalRow = document.getElementById("totalActesRow");
  if (totalRow) totalRow.querySelector("td").colSpan = 3;

  editProSectionBtn.style.display = "inline-block";
  saveProSectionBtn.style.display = "inline-block";
}

if (isProthesiste) {
  applyProthesisteView();
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
      `/prothesiste/worksheets/update/${worksheetId}`,
      {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({
          status: proStatusInput.value,
          proDateLivraison: proDateLivraisonInput.value || null,
          proDatePaiement: proDatePaiementInput.value || null,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur serveur");

    proStatusInput.disabled = true;
    proDateLivraisonInput.disabled = true;
    proDatePaiementInput.disabled = true;
    saveProSectionBtn.disabled = true;

    showFeedback("Section prothésiste mise à jour");
    fetchWorksheet();
  } catch (err) {
    console.error(err);
    showFeedback(err.message, "error");
  }
});

async function fetchActes() {
  try {
    const res = await fetch("/dentiste/worksheets/proto-acts", {
      headers: authHeaders(),
    });

    const data = await res.json();
    actes = data.acts || [];
    hasProthesiste = data.hasProthesiste !== false;

    applyNoProthesisteRestrictions();

    searchAct.innerHTML = `<option value="">-- Sélectionner un acte --</option>`;

    actes.forEach((act) => {
      const opt = document.createElement("option");
      opt.value = act.acteId;
      opt.textContent = `${act.name}`;
      opt.dataset.description = act.description;
      opt.dataset.price = act.price;
      searchAct.appendChild(opt);
    });
  } catch (err) {
    console.error("Erreur fetchActes :", err);
    actes = [];
  }
}

async function fetchWorksheet() {
  try {
    const worksheetUrl =
      role === "PROTHESISTE"
        ? `/prothesiste/worksheets/${worksheetId}`
        : `/dentiste/worksheets/${worksheetId}`;

    const res = await fetch(worksheetUrl, {
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error("Fiche introuvable");

    const data = await res.json();
    const ws = data.workSheet;

    if (isPatientEditing) {
      exitPatientEditMode(false);
    }

    setPatientDisplayValue("nomPatient", ws.nomPatient);
    setPatientDisplayValue("prenomPatient", ws.prenomPatient);
    setPatientDisplayValue("emailPatient", ws.emailPatient);
    setPatientDisplayValue("numSecuPatient", ws.numSecuPatient);
    createdAtSpan.textContent = new Date(ws.createdAt).toLocaleDateString();
    numFicheSpan.textContent = ws.numFiche;
    remarqueTextarea.value = ws.remarque || "";

    actsTableBody.querySelectorAll("tr.act-row").forEach((tr) => tr.remove());

    if (Array.isArray(ws.acts)) {
      ws.acts.forEach((a) => addActToTable(a));
    }

    proStatusInput.value = ws.status;

    if (!isProthesiste) {
      if (ws.status !== "BROUILLON") {
        envoyerFicheBtn.style.display = "none";
        editPatientBtn.hidden = true;
        cancelPatientBtn.hidden = true;
        patientEditHint.hidden = true;
      } else {
        envoyerFicheBtn.style.display = "inline-block";
        envoyerFicheBtn.disabled = !hasProthesiste;
        envoyerFicheBtn.title = hasProthesiste
          ? ""
          : "Impossible d'envoyer cette fiche : aucun prothésiste n'est associé à votre compte.";
        if (!isPatientEditing) {
          editPatientBtn.hidden = false;
        }
      }
      applyNoProthesisteRestrictions();
    }

    const canShowFacture = ["TERMINE", "EN_ATTENTE_PAIEMENT", "PAYE"].includes(ws.status);
    factureBtn.style.display = canShowFacture ? "inline-block" : "none";

    proDateLivraisonInput.value = ws.proDateLivraison
      ? new Date(ws.proDateLivraison).toISOString().split("T")[0]
      : "";

    proDatePaiementInput.value = ws.proDatePaiement
      ? new Date(ws.proDatePaiement).toISOString().split("T")[0]
      : "";

    updateTotalActes();
  } catch (err) {
    console.error(err);
    showFeedback(err.message, "error");
  }
}

editPatientBtn?.addEventListener("click", enterPatientEditMode);
cancelPatientBtn?.addEventListener("click", () => exitPatientEditMode(true));

function addActToTable(act) {
  const tr = document.createElement("tr");
  tr.classList.add("act-row");
  if (act.acteId != null && act.acteId !== "") {
    tr.dataset.acteId = act.acteId;
  }

  const nameTd = document.createElement("td");
  nameTd.textContent = act.name;

  const descTd = document.createElement("td");
  descTd.textContent = act.description;

  const priceTd = document.createElement("td");
  priceTd.classList.add("act-price");
  priceTd.textContent = `${act.price} €`;

  tr.append(nameTd, descTd, priceTd);

  if (!isProthesiste) {
    const actionTd = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.className = "btn btn-delete-act";
    delBtn.addEventListener("click", () => {
      tr.remove();
      updateTotalActes();
    });
    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);
  }

  actsTableBody.insertBefore(tr, document.getElementById("totalActesRow"));
  updateTotalActes();
}

addActBtn.addEventListener("click", () => {
  if (!hasProthesiste) return;

  const selectedOpt = searchAct.selectedOptions[0];
  if (!selectedOpt || !selectedOpt.value) {
    if (actSelectHint) actSelectHint.hidden = false;
    return;
  }

  if (actSelectHint) actSelectHint.hidden = true;

  const acte = {
    acteId: selectedOpt.value,
    name: selectedOpt.textContent,
    description: selectedOpt.dataset.description,
    price: Number(selectedOpt.dataset.price),
  };

  addActToTable(acte);
  searchAct.value = "";
});

searchAct?.addEventListener("change", () => {
  if (actSelectHint) actSelectHint.hidden = true;
});

function updateTotalActes() {
  let total = 0;
  document.querySelectorAll(".act-price").forEach((td) => {
    const val = td.textContent.replace("€", "").trim();
    if (val) total += Number(val);
  });
  document.getElementById("totalActes").textContent = total.toFixed(2);
}

function getFieldValue(id) {
  const el = patientField(id);
  if (!el) return "";
  return el.tagName === "INPUT" ? el.value.trim() : el.textContent.trim();
}

saveWorksheetBtn.addEventListener("click", async () => {
  try {
    const nomPatient = getFieldValue("nomPatient");
    const prenomPatient = getFieldValue("prenomPatient");
    const emailPatient = getFieldValue("emailPatient");
    const numSecuPatient = getFieldValue("numSecuPatient");

    const acts = [...actsTableBody.querySelectorAll("tr.act-row")].map((tr) => ({
      acteId: tr.dataset.acteId || null,
      name: tr.cells[0].textContent.trim(),
      description: tr.cells[1].textContent.trim(),
      price: Number(tr.cells[2].textContent.replace("€", "").trim()),
    }));

    const res = await fetch(`/dentiste/worksheets/update/${worksheetId}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify({
        nomPatient,
        prenomPatient,
        emailPatient,
        numSecuPatient,
        acts,
        remarque: remarqueTextarea.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur serveur");

    exitPatientEditMode(false);
    showFeedback("Fiche mise à jour avec succès");
    await fetchWorksheet();
  } catch (err) {
    console.error("Erreur sauvegarde :", err);
    showFeedback(err.message, "error");
  }
});

envoyerFicheBtn.addEventListener("click", async () => {
  if (!hasProthesiste) {
    showFeedback(
      "Impossible d'envoyer cette fiche : aucun prothésiste n'est associé à votre compte.",
      "error"
    );
    return;
  }

  const confirmed = await showConfirm(
    "Voulez-vous vraiment envoyer cette fiche au prothésiste associé ?"
  );
  if (!confirmed) return;

  try {
    const res = await fetch(`/dentiste/worksheets/send/${worksheetId}`, {
      method: "PUT",
      headers: authHeaders(true),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur serveur");

    showFeedback(data.message || "Fiche envoyée au prothésiste");
    fetchWorksheet();
  } catch (err) {
    console.error("Erreur envoi fiche :", err);
    showFeedback(err.message, "error");
  }
});

backBtn.addEventListener("click", () => {
  window.location.href = isProthesiste ? "/prothesistHome.html" : "/dentistHome.html";
});

function getWorkSheetData() {
  const acts = [];
  document.querySelectorAll("#actsTableBody tr.act-row").forEach((row) => {
    const cells = row.querySelectorAll("td");
    acts.push({
      name: cells[0].textContent.trim(),
      description: cells[1].textContent.trim(),
      price: parseFloat(cells[2].textContent.trim()) || 0,
    });
  });

  return {
    numFiche: numFicheSpan.textContent.trim(),
    nomPatient: getFieldValue("nomPatient"),
    prenomPatient: getFieldValue("prenomPatient"),
    emailPatient: getFieldValue("emailPatient"),
    createdAt: createdAtSpan.textContent.trim(),
    acts,
  };
}

factureBtn.addEventListener("click", () => {
  const data = getWorkSheetData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 40;
  let y = margin;

  doc.setFontSize(22);
  doc.setTextColor("#0d6efd");
  doc.text("FACTURE", margin, y);
  y += 30;

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

  const colWidths = [150, 250, 80];
  const rowHeight = 20;

  doc.setFillColor("#f0f0f0");
  doc.rect(margin, y, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
  doc.setFontSize(12);
  doc.setTextColor("#000");
  doc.text("Acte", margin + 5, y + 15);
  doc.text("Description", margin + colWidths[0] + 5, y + 15);
  doc.text("Prix HT (€)", margin + colWidths[0] + colWidths[1] + 5, y + 15);
  y += rowHeight;

  data.acts.forEach((a) => {
    doc.setFillColor("#fff");
    doc.rect(margin, y, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
    doc.text(a.name, margin + 5, y + 15);
    doc.text(a.description, margin + colWidths[0] + 5, y + 15);
    doc.text(a.price.toFixed(2), margin + colWidths[0] + colWidths[1] + 5, y + 15);
    y += rowHeight;
  });

  const totalHT = data.acts.reduce((sum, a) => sum + a.price, 0);
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;
  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Total HT : ${totalHT.toFixed(2)} €`, margin + colWidths[0] + colWidths[1], y);
  y += 18;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`TVA (20 %) : ${tva.toFixed(2)} €`, margin + colWidths[0] + colWidths[1], y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.text(`Total TTC : ${totalTTC.toFixed(2)} €`, margin + colWidths[0] + colWidths[1], y);

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
});

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "/";
};

if (isProthesiste) {
  fetchWorksheet();
} else {
  fetchActes().then(fetchWorksheet);
}
