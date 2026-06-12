(() => {
  let feedbackTimer = null;
  let confirmResolver = null;

  function ensureToast() {
    let toast = document.getElementById("uiToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "uiToast";
      toast.className = "ui-toast";
      toast.setAttribute("role", "alert");
      document.body.appendChild(toast);
    }
    return toast;
  }

  function closeConfirm(result) {
    const modal = document.getElementById("confirmModal");
    if (modal) modal.classList.remove("is-open");

    const resolve = confirmResolver;
    confirmResolver = null;
    resolve?.(result);
  }

  function ensureConfirmModal() {
    let modal = document.getElementById("confirmModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "confirmModal";
      modal.className = "confirm-modal";
      modal.innerHTML = `
        <div class="confirm-modal__backdrop" data-confirm-dismiss></div>
        <div class="confirm-modal__box">
          <p id="confirmModalMessage"></p>
          <div class="confirm-modal__actions">
            <button type="button" id="confirmModalCancel" class="confirm-modal__btn confirm-modal__btn--cancel">Annuler</button>
            <button type="button" id="confirmModalOk" class="confirm-modal__btn confirm-modal__btn--ok">Confirmer</button>
          </div>
        </div>
      `;

      modal.addEventListener("click", (e) => {
        if (!modal.classList.contains("is-open")) return;
        if (e.target.id === "confirmModalOk") closeConfirm(true);
        else if (e.target.id === "confirmModalCancel" || e.target.hasAttribute("data-confirm-dismiss")) {
          closeConfirm(false);
        }
      });

      document.body.appendChild(modal);
    }
    return modal;
  }

  function hideFeedback() {
    const toast = document.getElementById("uiToast");
    if (!toast) return;

    toast.classList.remove("is-visible");
    toast.classList.add("is-leaving");

    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      feedbackTimer = null;
    }

    setTimeout(() => {
      toast.classList.remove("is-leaving", "ui-toast--success", "ui-toast--error");
      toast.textContent = "";
    }, 350);
  }

  function showFeedback(message, type = "success") {
    const toast = ensureToast();
    const duration = type === "error" ? 5000 : 3000;

    if (feedbackTimer) clearTimeout(feedbackTimer);

    toast.textContent = message;
    toast.className = `ui-toast ui-toast--${type}`;

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    feedbackTimer = setTimeout(hideFeedback, duration);
  }

  function showConfirm(message, options = {}) {
    const { danger = false } = options;
    const modal = ensureConfirmModal();
    const messageEl = document.getElementById("confirmModalMessage");
    const okBtn = document.getElementById("confirmModalOk");

    if (!messageEl || !okBtn) return Promise.resolve(false);

    if (confirmResolver) closeConfirm(false);

    messageEl.textContent = message;
    okBtn.className = danger
      ? "confirm-modal__btn confirm-modal__btn--danger"
      : "confirm-modal__btn confirm-modal__btn--ok";

    modal.classList.add("is-open");

    return new Promise((resolve) => {
      confirmResolver = resolve;
    });
  }

  function handleSessionExpired() {
    showFeedback("Session expirée, veuillez vous reconnecter.", "error");
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/";
    }, 1500);
  }

  window.showFeedback = showFeedback;
  window.showConfirm = showConfirm;
  window.handleSessionExpired = handleSessionExpired;
})();
