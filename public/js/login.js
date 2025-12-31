const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("messageLogin");


if (loginForm) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!email || !password) {
        message.textContent = "Tous les champs sont obligatoires";
        message.style.color = "red";
        return;
    }

    if (!email.match(regex)) {
      res.status(409).json({ error: "Email est invalide" });
      message.textContent = "Email format invalide";
      message.style.color = "red"
      return;
    }

    if (password.length <6 ) {
      message.textContent = "Le mot de passe doit dépasser 6 caractères";
      message.style.color = "red"
      return;
    }

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const rponseData = await res.json();

      if (!res.ok) {
        message.textContent = rponseData.message;
      } else {

        localStorage.setItem("token", rponseData.token)
        localStorage.setItem("role", rponseData.role);
        
        switch (rponseData.role) {
          case "ADMIN":
            window.location.href = "/adminDashboard.html"
            break;
          case "DENTISTE":
            window.location.href = "/dentistHome.html"
            break;
          case "PROTHESISTE":
            window.location.href = "/prothesistHome.html"
            break;  
        
          default: console.log("rôle inconnu");
            break;
        }
      }

    } catch (err) {
      messageLogin.textContent = "Veuillez entrer un identifiant et mot de passe correct";
      console.error(err);
    }
  })
}

