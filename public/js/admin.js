const API_URL = "http://localhost:3000/admin/user"; //endpoint pour récupérer les users

const searchInput = document.getElementById("searchInput");
const userTableBody = document.getElementById("userTableBody");
const addUserBtn = document.getElementById("addUserBtn");
const userModal = document.getElementById("userModal");
const closeModal = document.querySelector(".close");
const addUserForm = document.getElementById("addUserForm");
const dentisteSelect = document.getElementById("dentisteSelect");
const roleFilter = document.getElementById("roleFilter");


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
        <td>${associated}</td>
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
    const res = await fetch(`${API_URL}/dentistes`);
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

closeModal.addEventListener("click", () => {
  userModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === userModal) {
    userModal.style.display = "none";
  }
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
    userModal.style.display = "none";
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert("Erreur serveur");
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
