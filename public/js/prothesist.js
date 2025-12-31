const API_URL = "http://localhost:3000/prothesiste/worksheets";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const table = document.getElementById("worksheetTable").querySelector("tbody");
const searchInput = document.getElementById("searchInput");

// =======VERIF ROLE========
if (!token || role !== "PROTHESISTE") {
  window.location.href = "/";
} else {
  document.body.style.display = "block";
}

let worksheets = [];

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
      `<tr>
        <td>${ws.numFiche}</td>
        <td>${ws.nomPatient} ${ws.prenomPatient}</td>
        <td>${ws.emailPatient}</td>
        <td>${formatStatus(ws.status)}</td>
        <td>
          <button class="btn-edit" onclick="edit('${ws._id}')" title="Voir / Edit">✏️</button>
        </td>
      </tr>`
    );
  });
}

//edit (juste visuel pour l'instant)
window.edit = function(id) {
  // On pourra rediriger vers une page prothésisteWorksheet.html plus tard
  alert("Edition de la fiche : " + id);
}

//SEARCH
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = worksheets.filter(w =>
    `${w.nomPatient} ${w.prenomPatient} ${w.emailPatient}`.toLowerCase().includes(query) ||
    w.numFiche.toString().includes(query)
  );
  displayWorksheets(filtered);
});

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


//mes Actes 
document.getElementById("manageActesBtn").addEventListener("click", () => {
  window.location.href = "../prothesistActs.html";
});

//edit 
window.edit = function(id) {
  window.location.href = `/dentistWorksheet.html?id=${id}`;
};

//déco
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "/";
};

//init
fetchWorksheets();
