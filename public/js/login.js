const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("messageLogin");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Fonction utilitaire pour afficher les messages d'erreur
    const showMessage = (text) => {
      message.textContent = text;
      message.style.color = "red";
      message.style.marginBottom = "10px";
    };

    // Vérifications côté client
    if (!email || !password) {
      showMessage("Tous les champs sont obligatoires");
      return;
    }

    if (!email.match(emailRegex)) {
      showMessage("Format email invalide");
      return;
    }

    if (password.length < 6) {
      showMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Affiche le message d'erreur venant du serveur
        showMessage(responseData.message || "Erreur lors de la connexion");
      } else {
        // Connexion réussie
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("role", responseData.role);

        // Redirection selon le rôle
        switch (responseData.role) {
          case "ADMIN":
            window.location.href = "/adminDashboard.html";
            break;
          case "DENTISTE":
            window.location.href = "/dentistHome.html";
            break;
          case "PROTHESISTE":
            window.location.href = "/prothesistHome.html";
            break;
          default:
            showMessage("Rôle inconnu, contactez l'administrateur");
            break;
        }
      }
    } catch (err) {
      showMessage("Erreur serveur. Veuillez réessayer plus tard.");
      console.error(err);
    }
  });
}
