const API_URL = "http://localhost:3000/act/act"

const actsTable = document.getElementById("actsTable");
const addActBtn = document.getElementById("addActBtn");
const returnBtn = document.getElementById("returnBtn");
const createModal = document.getElementById("actModal");
const closeModals = document.querySelectorAll(".close");
const addActForm = document.getElementById("addActForm");
const editModal = document.getElementById("actModalEdit");
const editActForm = document.getElementById("editActForm");

let acts = []
let editingActId = null;

/* =======================
   AFFICHAGE DES ACTS
======================= */
function displayActs(list) {
  actsTable.innerHTML = ""

  if (list.length === 0) {
    actsTable.innerHTML =
      "<tr><td colspan='3'>Aucun acte trouvé</td></tr>"
    return
  }

  list.forEach(act => {
    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td>${act.name}</td>
      <td>${act.description}</td>
      <td class="actions-cell"></td>
    `

    const actionsCell = tr.querySelector(".actions-cell")

    const editBtn = document.createElement("button")
    editBtn.type = "button"
    editBtn.className = "btn-edit"
    editBtn.textContent = "Modifier"
    editBtn.onclick = () => openEditActModal(act)

    const deleteBtn = document.createElement("button")
    deleteBtn.type = "button"
    deleteBtn.className = "btn-delete"
    deleteBtn.textContent = "X"
    deleteBtn.onclick = () => deleteAct(act._id)

    actionsCell.append(editBtn, deleteBtn)
    actsTable.appendChild(tr)
  })
}

function openEditActModal(act) {
  editingActId = act._id
  // querySelector car editActForm.name ne fonctionne pas (name = attribut du form)
  editActForm.querySelector('[name="name"]').value = act.name
  editActForm.querySelector('[name="description"]').value = act.description
  editModal.style.display = "block"
}

/* =======================
   RÉCUPÉRATION DES ACTS
======================= */
async function fetchActs() {
  try {
    const response = await fetch(`${API_URL}/getAllActs`)
    const data = await response.json()

    acts = data.actes || []
    displayActs(acts)

  } catch (error) {
    console.error("Erreur lors du chargement des actes", error)
    actsTable.innerHTML = "<tr><td colspan='3'>Erreur de chargement</td></tr>"
  }
}

/* =======================
          MODAL
======================= */
closeModals.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".modal").style.display = "none";
    addActForm.reset();
    editActForm.reset();
    editingActId = null;
  });
});

window.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
    addActForm.reset();
    editActForm.reset();
    editingActId = null;
  }
});

addActBtn.addEventListener("click", () => createModal.style.display = "block");
returnBtn.addEventListener("click", () => window.location.href = "adminDashboard.html");

/* =======================
   CRÉATION D'ACTE
======================= */
addActForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(addActForm);
  const newAct = { 
    name: formData.get("name"), 
    description: formData.get("description") 
  };

  try {
    const res = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAct)
    });
    if (!res.ok) throw new Error("Erreur création acte");

    createModal.style.display = "none";
    addActForm.reset();
    fetchActs();
  } catch (err) {
    alert(err.message);
  }
});

/* =======================
   MODIFICATION
======================= */
editActForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editingActId) return;

  const formData = new FormData(editActForm);
  const updatedAct = {
    name: formData.get("name"),
    description: formData.get("description")
  };

  try {
    const res = await fetch(`${API_URL}/update/${editingActId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAct)
    });
    if (!res.ok) throw new Error("Erreur modification acte");

    editModal.style.display = "none";
    editingActId = null;
    editActForm.reset();
    fetchActs();
  } catch (err) {
    alert(err.message);
  }
});


/* =======================
   SUPPRIMER UN ACTE
======================= */
async function deleteAct(actId) {
  if (!confirm("Voulez-vous vraiment supprimer cet acte ?")) 
    return;

  try {
    const response = await fetch(`${API_URL}/delete/${actId}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression");

    fetchActs();
  } catch (error) {
    console.error(error);
    alert("Impossible de supprimer l'acte");
  }
}


/* =======================
   INITIALISATION
======================= */
fetchActs()
