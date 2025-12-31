const API_URL = "http://localhost:3000/dentiste/worksheets";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const table = document.getElementById("worksheetTable");
const modal = document.getElementById("workModal");
const form = document.getElementById("workForm");
const addWorkBtn = document.getElementById("addWorkBtn");
const closeModalBtns = document.querySelectorAll(".modal .close");

const searchType = document.getElementById("searchType");
const searchInput = document.getElementById("searchInput");
const dateRange = document.getElementById("dateRange");
const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");

// =======VERIF ROLE========
if (!token || role !== "DENTISTE") {
  window.location.href = "/";
} else {
  document.body.style.display = "block";
}

let worksheets = [];
let editingId = null;


//Fetch et affichage
async function fetchWorksheets() {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      alert("Session expirée, veuillez vous reconnecter.");
      localStorage.clear();
      window.location.href = "/";
      return;
    }
    throw new Error("Erreur serveur");
  }
  const data = await res.json();
  worksheets = data.workSheets;
  displayWorksheets(worksheets);
}

function displayWorksheets(list) {
  table.innerHTML = "";

  list.forEach((ws) => {
    table.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>${ws.numFiche}</td>
        <td>${ws.nomPatient} ${ws.prenomPatient}</td>
        <td>${ws.emailPatient}</td>
        <td>${formatStatus(ws.status)}</td>
        <td class="actions-cell">
          <button class="btn-edit" onclick="edit('${ ws._id }')" title="Modifier"> ✏️ </button>
          <button class="btn-delete" onclick="remove('${ ws._id}')" title="Supprimer"> ✖ </button>
        </td>
      </tr>
    `
    );
  });
}

//form création fiche
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nomPatient: form.nomPatient.value,
    prenomPatient: form.prenomPatient.value,
    emailPatient: form.emailPatient.value,
    numSecuPatient: form.numSecuPatient.value,
    remarque: form.remarque.value,
    idUser: localStorage.getItem("userId"),
  };

  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    alert(errorData.message || "Erreur lors de la création de la fiche.");
    return;
  }
  const data = await res.json();
  resetForm();
  window.location.href = `/dentistWorksheet.html?id=${data.workSheet._id}`;
});

//edit
window.edit = function (id) {
  window.location.href = `/dentistWorksheet.html?id=${id}`;
};

//supprimer
async function remove(id) {
  if (!confirm("Supprimer cette fiche ?")) return;

  await fetch(`${API_URL}/delete/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  fetchWorksheets();
}

//SEARCH
searchType.addEventListener("change", () => {
  if (searchType.value === "date") {
    searchInput.style.display = "none";
    dateRange.style.display = "flex";
  } else {
    searchInput.style.display = "block";
    dateRange.style.display = "none";
    dateFrom.value = "";
    dateTo.value = "";
  }
});

//FILTER
function filterWorksheets() {
  let filtered = [...worksheets];
  const type = searchType.value;
  const query = searchInput.value.toLowerCase();

  if (type === "patient") {
    filtered = filtered.filter((w) =>
      `${w.nomPatient} ${w.prenomPatient} ${w.emailPatient}`
        .toLowerCase()
        .includes(query)
    );
  }

  if (type === "prothesiste") {
    filtered = filtered.filter(
      (w) =>
        w.prothesiste &&
        `${w.prothesiste.firstName} ${w.prothesiste.lastName}`
          .toLowerCase()
          .includes(query)
    );
  }

  if (type === "numFiche") {
    filtered = filtered.filter((w) => w.numFiche.toString().includes(query));
  }

  if (type === "date") {
    const from = dateFrom.value ? new Date(dateFrom.value) : null;
    const to = dateTo.value ? new Date(dateTo.value) : null;

    filtered = filtered.filter((w) => {
      const created = new Date(w.createdAt);
      if (from && created < from) return false;
      if (to && created > to) return false;
      return true;
    });
  }

  displayWorksheets(filtered);
}

//Validation dateTo >= dateFrom
dateFrom.addEventListener("change", () => {
  if (dateTo.value && new Date(dateTo.value) < new Date(dateFrom.value)) {
    dateTo.value = dateFrom.value;
  }
  dateTo.min = dateFrom.value;
  filterWorksheets();
});

dateTo.addEventListener("change", () => {
  if (dateFrom.value && new Date(dateTo.value) < new Date(dateFrom.value)) {
    alert("La date de fin ne peut pas être inférieure à la date de début.");
    dateTo.value = dateFrom.value;
  }
  filterWorksheets();
});

//appliquer filtres
searchInput.addEventListener("input", filterWorksheets);
dateFrom.addEventListener("change", filterWorksheets);
dateTo.addEventListener("change", filterWorksheets);

//modal-----
addWorkBtn.addEventListener("click", () => {
  workModal.style.display = "block";
});

closeModalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".modal").style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

//reset formulaire
function resetForm() {
  modal.style.display = "none";
  form.reset();
  editingId = null;
}

//Statut définis
function formatStatus(status) {
  const map = {
    BROUILLON: "Brouillon",
    EN_ATTENTE: "En attente",
    EN_COURS: "En cours",
    TERMINE: "Terminé",
    EN_ATTENTE_PAIEMENT: "En attente de paiement",
    PAYE: "Payé",
  };
  return map[status] || status;
}

//déco
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "/";
};

//init
fetchWorksheets();
