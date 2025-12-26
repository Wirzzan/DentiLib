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
      "<tr><td colspan='2'>Aucun acte trouvé</td></tr>"
    return
  }

  list.forEach(act => {
    actsTable.insertAdjacentHTML(
      "beforeend",
      `
      <tr data-id="${act._id}">
        <td>${act.name}</td>
        <td>${act.description}</td>
        <td>
          <button class="btn-edit" data-id="${act._id}">Modifier</button>
          <button class="btn-delete" data-id="${act._id}">X</button>
        </td>
      </tr>
      `
    )
  })
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
    actsTable.innerHTML = "<tr><td colspan='2'>Erreur de chargement</td></tr>"
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
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-edit")) {
    editingActId = e.target.dataset.id;
    const act = acts.find(a => a._id === editingActId);
    if (!act) return;

    editActForm.name.value = act.name;
    editActForm.description.value = act.description;
    editModal.style.display = "block";
  }

  if (e.target.classList.contains("btn-delete")) {
    const actId = e.target.dataset.id;
    deleteAct(actId);
  }
});

editActForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editingActId) return;

  const updatedAct = {
    name: editActForm.name.value,
    description: editActForm.description.value
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
