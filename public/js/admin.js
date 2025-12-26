const API_URL = "http://localhost:3000/admin/user"; //endpoint pour récupérer les users

const searchInput = document.getElementById("searchInput");
const userTableBody = document.getElementById("userTableBody");
const addUserBtn = document.getElementById("addUserBtn");
const userModal = document.getElementById("userModal");
const closeModal = document.querySelectorAll(".close");
const addUserForm = document.getElementById("addUserForm");
const dentisteSelect = document.getElementById("dentisteSelect");
const roleFilter = document.getElementById("roleFilter");

const editUserModal = document.getElementById("editUserModal");
const editUserForm = document.getElementById("editUserForm");
const editDentisteSelect = document.getElementById("editDentisteSelect");


// =======VERIF ROLE========

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "ADMIN") {
  window.location.href = "/";
}else {
  document.body.style.display = "block";
}


//**initi valeurs */
let editingUserId = null;
let users = [];

/* =======================
   AFFICHAGE DES USERS
======================= */
function displayUsers(list) {
  userTableBody.innerHTML = "";

  if (list.length === 0) {
    userTableBody.innerHTML =
      "<tr><td colspan='5'>Aucun utilisateur trouvé</td></tr>"; //colspan = nombre de colonne que prend la cellule
    return;
  }

  list.forEach(user => {
    const associated = user.associatedUser
      ? `${user.associatedUser.firstName} ${user.associatedUser.lastName}`
      : "-";

    userTableBody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>${user.lastName}</td>
        <td>${user.firstName}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.siret}</td>
        <td>${associated}</td>
        <td class="actions-cell">
          <button class="btn-edit" data-id="${user._id}" title="Modifier"> ✏️ </button>
          <button class="btn-delete" data-id="${user._id}" title="Supprimer"> ✖ </button>
        </td>
      </tr>
      `
    );
  });
}

/* =======================
   FILTRAGE
======================= */
function filterUsers(query, role = "") {
  const q = query.toLowerCase();

  const filtered = users.filter(u => {
    const matchesText=
    u.firstName.toLowerCase().includes(q) ||
    u.lastName.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)

    const matchesRole = role === "" || u.role === role;
    return matchesText && matchesRole;
  });
  displayUsers(filtered);
}

roleFilter.addEventListener("change", () => {
  filterUsers(searchInput.value, roleFilter.value);
});

/* =======================
   FETCH USERS
======================= */
async function fetchUsers() {
  try {
    const res = await fetch(`${API_URL}/allUsers/noAdmin`);
    const data = await res.json();
    users = data.users;
    displayUsers(users);
  } catch (err) {
    console.error(err);
    userTableBody.innerHTML =
      "<tr><td colspan='5'>Erreur de chargement</td></tr>";
  }
}


/* =======================
   FETCH DENTISTES
======================= */
async function fetchDentistes() {
  try {
    const res = await fetch(`${API_URL}/dentistes/notAssociated`);
    const data = await res.json();

    dentisteSelect.innerHTML =
      `<option value="">-- Sélectionner un dentiste --</option>`;

    data.dentistes.forEach(d => {
      dentisteSelect.insertAdjacentHTML(
        "beforeend",
        `<option value="${d._id}">${d.firstName} ${d.lastName}</option>`
      );
    });

  } catch (err) {
    console.error("Erreur chargement dentistes", err);
  }
}

/* =======================
   MODAL
======================= */
addUserBtn.addEventListener("click", () => {
  userModal.style.display = "block";
});

const closeModals = document.querySelectorAll(".close");

closeModals.forEach(btn => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal");
    modal.style.display = "none";

    const form = modal.querySelector("form");
    if (form) form.reset();

    editingUserId = null;
  });
});

// Clic à l’extérieur de toutes les modales pour fermer
window.addEventListener("click", e => {
  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) {
      modal.style.display = "none";
      const form = modal.querySelector("form");
      if (form) form.reset();
      const dentisteSelectInModal = modal.querySelector("select");
      if (dentisteSelectInModal) dentisteSelectInModal.style.display = "none";
      editingUserId = null;
    }
  });
});

/* ================================
   MODAL - Show SELECT dentiste Id
===================================== */
addUserForm.role.addEventListener("change", e => {
  if (e.target.value === "PROTHESISTE") {
    dentisteSelect.style.display = "block";
    fetchDentistes();
  } else {
    dentisteSelect.style.display = "none";
    dentisteSelect.value = "";
  }
});


/* =======================
   CREATE USER
======================= */
addUserForm.addEventListener("submit", async e => {
  e.preventDefault();

  const role = addUserForm.role.value;
  const dentisteId = dentisteSelect.value;
  if ( role === "PROTHESISTE" && !dentisteId) {
    alert("Veuillez sélectionner un dentiste");
    return;
  }

  const formData = {
    firstName: addUserForm.firstName.value,
    lastName: addUserForm.lastName.value,
    email: addUserForm.email.value,
    password: addUserForm.password.value,
    role: addUserForm.role.value,
    siret: addUserForm.siret.value,
    dentisteId: addUserForm.role.value === "PROTHESISTE" ? dentisteSelect.value : null,
    listeActes: []
  };

  const passwordLength = addUserForm.password.value.length;
  if ( passwordLength < 8) {
    alert("Le mot de passe doit contenir au moins 8 caractères");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/createAccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Utilisateur créé");

    addUserForm.reset();
    dentisteSelect.style.display = "none";
    dentisteSelect.value = "";
    addUserForm.role.dispatchEvent(new Event("change"));
    userModal.style.display = "none";
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert("Erreur serveur");
  }
});

/* =======================
   UPDATE USER
======================= */
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("btn-edit")) return;

  editingUserId = e.target.dataset.id;
  const user = users.find(u => u._id === editingUserId);
  if (!user) return;

  editUserForm.firstName.value = user.firstName;
  editUserForm.lastName.value = user.lastName;
  editUserForm.email.value = user.email;
  editUserForm.password.value = "";
  editUserForm.siret.value = user.siret || "";

  if (user.role === "PROTHESISTE") {
    editDentisteSelect.style.display = "block";

    // 1 - Afficher le dentiste associé 
    editDentisteSelect.innerHTML = "";
    if (user.associatedUser) {
      const dentiste = user.associatedUser; 
      editDentisteSelect.insertAdjacentHTML(
        "beforeend",
        `<option value="${dentiste._id}" selected>${dentiste.firstName} ${dentiste.lastName}</option>`
      );
    }

    // 2. Ajouter les dentistes not associated
    const res = await fetch(`${API_URL}/dentistes/notAssociated`);
    const data = await res.json();
    data.dentistes.forEach(d => {
      // éviter de doubler si c’est le dentiste déjà associé
      if (!user.associatedUser || d._id !== user.associatedUser._id) {
        editDentisteSelect.insertAdjacentHTML(
          "beforeend",
          `<option value="${d._id}">${d.firstName} ${d.lastName}</option>`
        );
      }
    });

  } else {
    editDentisteSelect.style.display = "none";
  }

  editUserModal.style.display = "block";
});



editUserForm.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    firstName: editUserForm.firstName.value,
    lastName: editUserForm.lastName.value,
    email: editUserForm.email.value,
    siret: editUserForm.siret.value,
    dentisteId: editDentisteSelect.style.display === "block"
      ? editDentisteSelect.value
      : null,
    password: editUserForm.password.value || null
  };

  try {
    const res = await fetch(`${API_URL}/updateAccount/${editingUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Utilisateur modifié");
    editUserModal.style.display = "none";
    editUserForm.reset();
    editingUserId = null;
    fetchUsers();

  } catch (err) {
    console.error(err);
    alert("Erreur modification");
  }
});


/* =======================
   DELETE USER
======================= */
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("btn-delete")) return;

  const userId = e.target.dataset.id;

  if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

  try {
    const res = await fetch(`${API_URL}/deleteAccount/${userId}`, {
      method: "POST"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Utilisateur supprimé");
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert("Erreur suppression utilisateur");
  }
});


/* =======================
   SEARCH
======================= */
searchInput.addEventListener("input", e => {
  filterUsers(e.target.value, roleFilter.value);
});

/* =======================
   LOGOUT / NAV
======================= */

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
});

document.getElementById("manageActesBtn").addEventListener("click", () => {
  window.location.href = "/actManage.html";
});

/* =======================
   INIT
======================= */
fetchUsers();
