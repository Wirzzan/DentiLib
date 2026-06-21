const API_URL = "/admin/user";
const token = getToken();
const role = localStorage.getItem("role");

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
if (!token || role !== "ADMIN") {
  window.location.href = "/";
}else {
  document.body.style.display = "block";
}


//**initi valeurs */
let editingUserId = null;
let users = [];

/* =======================
   FETCH Securisé — authFetch() dans api.js
======================= */


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
    const res = await authFetch(`${API_URL}/allUsers/noAdmin`);

    if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      handleSessionExpired();
      return;
    }

    throw new Error("Erreur serveur");
    }

    const data = await res.json();
    users = data.users;
    displayUsers(users);
  } catch (err) {
    console.error(err);
    userTableBody.innerHTML =
      "<tr><td colspan='5'>Erreur de chargement</td></tr>";
    showFeedback(err.message || "Impossible de charger les utilisateurs", "error");
  }
}


/* =======================
   FETCH DENTISTES
======================= */
async function fetchDentistes() {
  try {
    const res = await authFetch(`${API_URL}/dentistes/notAssociated`);
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
    if (form) {
      form.reset();
      clearFormValidation(form);
    }

    editingUserId = null;
  });
});

function showFormMessage(elementId, text, color = "red") {
  const msg = document.getElementById(elementId);
  msg.textContent = text;
  msg.style.color = color;
}

function validateAddUserForm() {
  clearFormValidation(addUserForm);

  const requiredFields = [
    addUserForm.firstName,
    addUserForm.lastName,
    addUserForm.email,
    addUserForm.password,
    addUserForm.siret,
  ];

  let hasEmpty = false;
  requiredFields.forEach((field) => {
    if (isEmpty(field.value)) {
      markInvalid(field);
      hasEmpty = true;
    }
  });

  if (hasEmpty) {
    showFormMessage("addUserMessage", "Veuillez compléter les champs obligatoires");
    return false;
  }

  if (!isValidEmail(addUserForm.email.value)) {
    markInvalid(addUserForm.email);
    showFormMessage("addUserMessage", "Format email invalide");
    return false;
  }

  if (addUserForm.password.value.length < 8) {
    markInvalid(addUserForm.password);
    showFormMessage("addUserMessage", "Le mot de passe doit contenir au moins 8 caractères");
    return false;
  }

  const role = addUserForm.role.value;
  if (role === "PROTHESISTE" && !dentisteSelect.value) {
    markInvalid(dentisteSelect);
    showFormMessage("addUserMessage", "Veuillez sélectionner un dentiste");
    return false;
  }

  showFormMessage("addUserMessage", "");
  return true;
}

bindClearOnInput(addUserForm);

// Clic à l’extérieur de toutes les modales pour fermer
window.addEventListener("click", e => {
  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) {
      modal.style.display = "none";
      const form = modal.querySelector("form");
      if (form) {
        form.reset();
        clearFormValidation(form);
      }
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

  if (!validateAddUserForm()) return;

  const role = addUserForm.role.value;
  const dentisteId = dentisteSelect.value;

  const formData = {
    firstName: addUserForm.firstName.value,
    lastName: addUserForm.lastName.value,
    email: addUserForm.email.value,
    password: addUserForm.password.value,
    role: addUserForm.role.value,
    siret: addUserForm.siret.value,
    dentisteId: role === "PROTHESISTE" ? dentisteId : null,
    listeActes: []
  };

  try {
    const res = await authFetch(`${API_URL}/createAccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      showFormMessage("addUserMessage", data.message || "Erreur serveur");
      return;
    }

    showFormMessage("addUserMessage", "");
    addUserForm.reset();
    clearFormValidation(addUserForm);
    dentisteSelect.style.display = "none";
    dentisteSelect.value = "";
    addUserForm.role.dispatchEvent(new Event("change"));
    userModal.style.display = "none";
    fetchUsers();
    showFeedback("Utilisateur créé avec succès");

  } catch (err) {
    console.error(err);
    showFormMessage("addUserMessage", "Erreur serveur");
  }
});


/* =======================
   UPDATE USER
======================= */
document.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".btn-edit");
  if (!editBtn) return;

  editingUserId = editBtn.dataset.id;
  const user = users.find((u) => String(u._id) === editingUserId);
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
    const res = await authFetch(`${API_URL}/dentistes/notAssociated`);
    const data = await res.json();
    data.dentistes.forEach(d => {
      // éviter de doubler si c’est le dentiste déjà associé
      if (!user.associatedUser || String(d._id) !== String(user.associatedUser._id)) {
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
    dentisteId: editDentisteSelect.style.display === "block" ? editDentisteSelect.value : null,
    password: editUserForm.password.value || null
  };

  try {
    const res = await authFetch(`${API_URL}/updateAccount/${editingUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      showFeedback(data.message || "Erreur modification", "error");
      return;
    }

    showFormMessage("editUserMessage", "");
    editUserForm.reset();
    editUserModal.style.display = "none";
    editingUserId = null;
    fetchUsers();
    showFeedback("Utilisateur modifié avec succès");

  } catch (err) {
    console.error(err);
    showFeedback("Erreur modification", "error");
  }
});


function showUserMessage(text, color = "red", duration = 5000) {
  const msg = document.getElementById("userMessage");
  msg.textContent = text;
  msg.style.color = color;

  setTimeout(() => {
    msg.textContent = "";
  }, duration);
}

/* =======================
   DELETE USER
======================= */
document.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".btn-delete");
  if (!deleteBtn) return;

  const userId = deleteBtn.dataset.id;
  const confirmDelete = await showConfirm("Voulez-vous vraiment supprimer cet utilisateur ?", {
    danger: true,
  });
  if (!confirmDelete) return;

  try {
    const res = await authFetch(`${API_URL}/deleteAccount/${userId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      showFeedback(data.message || "Erreur suppression", "error");
      return;
    }

    showFeedback("Utilisateur supprimé avec succès");
    fetchUsers();

  } catch (err) {
    console.error(err);
    showFeedback("Erreur serveur lors de la suppression", "error");
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
