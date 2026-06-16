const LEGAL_CONTENT = {
  mentions: {
    title: "Mentions légales",
    html: `
      <h3>1. Éditeur du site</h3>
      <p>
        <strong>MediLink Solutions</strong> (société fictive — projet de formation)<br>
        12 rue de la Santé Numérique, 75001 Paris, France<br>
        Email : contact@medilink-solutions.fr<br>
        Directeur de la publication : le représentant légal de MediLink Solutions.
      </p>

      <h3>2. Application</h3>
      <p>
        <strong>DentiLib</strong> est une application web de gestion des échanges entre dentistes
        et prothésistes (fiches de travaux, suivi et facturation).
      </p>

      <h3>3. Hébergement</h3>
      <p>
        En environnement de démonstration, l'application est exécutée sur un serveur local ou
        d'essai. En production, l'hébergement serait confié à un prestataire situé dans l'Union
        européenne, avec contrat de sous-traitance conforme au RGPD.
      </p>

      <h3>4. Propriété intellectuelle</h3>
      <p>
        L'ensemble des éléments composant DentiLib (textes, interface, logo, structure) est protégé
        par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.
      </p>

      <h3>5. Limitation de responsabilité</h3>
      <p>
        MediLink Solutions s'efforce d'assurer l'exactitude des informations diffusées sur
        l'application. Toutefois, DentiLib est un prototype à vocation pédagogique : l'éditeur ne
        saurait être tenu responsable des dommages résultant de son utilisation en dehors d'un cadre
        de test contrôlé.
      </p>

      <h3>6. Données personnelles</h3>
      <p>
        Le traitement des données personnelles est décrit dans la
        <button type="button" class="legal-link" data-legal-switch="privacy">politique de confidentialité</button>.
      </p>

      <p class="legal-modal__updated">Dernière mise à jour : juin 2025</p>
    `,
  },
  privacy: {
    title: "Politique de confidentialité",
    html: `
      <p>
        La présente politique informe les utilisateurs de DentiLib sur la collecte et le traitement
        des données à caractère personnel, conformément au Règlement (UE) 2016/679 (RGPD) et à la
        loi Informatique et Libertés.
      </p>

      <h3>1. Responsable du traitement</h3>
      <p>
        Pour les données relatives aux patients saisies dans les fiches de travaux, le dentiste
        utilisateur agit en qualité de responsable de traitement au sens du RGPD ; MediLink Solutions
        intervient comme outil mis à disposition des professionnels.
      </p>

      <h3>2. Données collectées</h3>
      <ul>
        <li><strong>Comptes professionnels</strong> : nom, prénom, adresse e-mail, mot de passe (stocké hashé), rôle, SIRET le cas échéant.</li>
        <li><strong>Fiches de travaux</strong> : nom et prénom du patient, e-mail, numéro de sécurité sociale (optionnel), actes, montants, statuts.</li>
        <li><strong>Données techniques</strong> : logs de connexion et d'utilisation de l'API dans la limite nécessaire au fonctionnement et à la sécurité.</li>
      </ul>

      <h3>3. Finalités et bases légales</h3>
      <ul>
        <li>Gestion des comptes et authentification (exécution du contrat / usage de l'application).</li>
        <li>Gestion des fiches dentiste–prothésiste (intérêt légitime des professionnels / mission de soins).</li>
        <li>Sécurité de l'application et prévention des accès non autorisés (intérêt légitime).</li>
      </ul>

      <h3>4. Durée de conservation</h3>
      <ul>
        <li>Comptes utilisateurs : pendant la durée d'utilisation du service, puis suppression ou anonymisation sous 3 ans après la dernière activité.</li>
        <li>Fiches de travaux : durée nécessaire au suivi des prestations et aux obligations comptables (généralement 10 ans pour les pièces justificatives), sauf demande d'effacement lorsque la loi le permet.</li>
        <li>Logs techniques : 12 mois maximum.</li>
      </ul>

      <h3>5. Destinataires des données</h3>
      <p>
        Les données sont accessibles uniquement aux utilisateurs autorisés selon leur rôle
        (administrateur, dentiste, prothésiste). Elles ne sont pas vendues ni cédées à des tiers.
        Des sous-traitants techniques (hébergement, messagerie) pourraient intervenir en production,
        avec des garanties contractuelles appropriées.
      </p>

      <h3>6. Sécurité</h3>
      <p>
        MediLink Solutions met en œuvre des mesures techniques et organisationnelles adaptées :
        authentification par jeton (JWT), mots de passe hashés (bcrypt), contrôle d'accès par rôle,
        requêtes paramétrées vers la base de données, configuration CORS. En production, un chiffrement
        HTTPS serait obligatoire.
      </p>

      <h3>7. Vos droits</h3>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>droit d'accès et de rectification ;</li>
        <li>droit à l'effacement et à la limitation du traitement ;</li>
        <li>droit d'opposition, dans les limites prévues par la loi ;</li>
        <li>droit à la portabilité des données vous concernant ;</li>
        <li>droit de définir des directives relatives au sort de vos données après votre décès.</li>
      </ul>
      <p>
        Pour exercer vos droits : contact@medilink-solutions.fr. Une réponse sera apportée sous un
        délai d'un mois. Vous pouvez également introduire une réclamation auprès de la
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>

      <h3>8. Cookies et traceurs</h3>
      <p>
        DentiLib utilise le stockage local du navigateur (<code>localStorage</code>) pour conserver
        le jeton de session après connexion. Aucun cookie publicitaire ou de mesure d'audience n'est
        déposé dans la version actuelle.
      </p>

      <h3>9. Transferts hors Union européenne</h3>
      <p>
        Les données sont hébergées et traitées au sein de l'Union européenne. Aucun transfert vers
        un pays tiers n'est effectué dans la version de démonstration.
      </p>

      <p class="legal-modal__updated">Dernière mise à jour : juin 2025</p>
    `,
  },
};

function ensureLegalModal() {
  let modal = document.getElementById("legalModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "legalModal";
  modal.className = "legal-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="legal-modal__backdrop" data-legal-close></div>
    <div class="legal-modal__panel">
      <div class="legal-modal__header">
        <h2 id="legalModalTitle"></h2>
        <button type="button" class="legal-modal__close" data-legal-close aria-label="Fermer">Fermer</button>
      </div>
      <div class="legal-modal__body" id="legalModalBody"></div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function openLegalModal(type) {
  const content = LEGAL_CONTENT[type];
  if (!content) return;

  const modal = ensureLegalModal();
  document.getElementById("legalModalTitle").textContent = content.title;
  document.getElementById("legalModalBody").innerHTML = content.html;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const switchBtn = modal.querySelector("[data-legal-switch]");
  if (switchBtn) {
    switchBtn.addEventListener("click", () => openLegalModal(switchBtn.dataset.legalSwitch));
  }
}

function closeLegalModal() {
  const modal = document.getElementById("legalModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initLegalModals() {
  document.querySelectorAll("[data-legal]").forEach((el) => {
    el.addEventListener("click", () => openLegalModal(el.dataset.legal));
  });

  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-legal-close]")) closeLegalModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLegalModal();
  });
}

document.addEventListener("DOMContentLoaded", initLegalModals);
