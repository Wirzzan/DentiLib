(() => {
  let feedbackTimer = null;
  let closeBound = false;

  function ensureUi() {
    const mount = document.querySelector(".container") || document.body;

    if (!document.getElementById("feedbackBanner")) {
      const banner = document.createElement("div");
      banner.id = "feedbackBanner";
      banner.className = "feedback-banner";
      banner.hidden = true;
      banner.setAttribute("role", "alert");
      banner.innerHTML = `
        <span id="feedbackMessage"></span>
        <button type="button" id="feedbackClose" class="feedback-close" aria-label="Fermer">×</button>
      `;
      mount.insertBefore(banner, mount.firstChild);
    }

    if (!document.getElementById("confirmModal")) {
      const modal = document.createElement("div");
      modal.id = "confirmModal";
      modal.className = "confirm-modal";
      modal.hidden = true;
      modal.innerHTML = `
        <div class="confirm-modal__backdrop"></div>
        <div class="confirm-modal__box">
          <p id="confirmModalMessage"></p>
          <div class="confirm-modal__actions">
            <button type="button" id="confirmModalCancel" class="confirm-modal__btn confirm-modal__btn--cancel">Annuler</button>
            <button type="button" id="confirmModalOk" class="confirm-modal__btn confirm-modal__btn--ok">Confirmer</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    if (!closeBound) {
      document.getElementById("feedbackClose")?.addEventListener("click", hideFeedback);
      closeBound = true;
    }
  }

  function hideFeedback() {
    const banner = document.getElementById("feedbackBanner");
    if (banner) banner.hidden = true;
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      feedbackTimer = null;
    }
  }

  function showFeedback(message, type = "success") {
    ensureUi();
    const banner = document.getElementById("feedbackBanner");
    const messageEl = document.getElementById("feedbackMessage");
    if (!banner || !messageEl) return;

    if (feedbackTimer) clearTimeout(feedbackTimer);
    banner.className = `feedback-banner feedback-banner--${type}`;
    messageEl.textContent = message;
    banner.hidden = false;

    if (type === "success") {
      feedbackTimer = setTimeout(hideFeedback, 4000);
    }
  }

  function showConfirm(message) {
    ensureUi();
    return new Promise((resolve) => {
      const modal = document.getElementById("confirmModal");
      const messageEl = document.getElementById("confirmModalMessage");
      const okBtn = document.getElementById("confirmModalOk");
      const cancelBtn = document.getElementById("confirmModalCancel");
      const backdrop = modal?.querySelector(".confirm-modal__backdrop");

      if (!modal || !messageEl || !okBtn || !cancelBtn) {
        resolve(false);
        return;
      }

      messageEl.textContent = message;
      modal.hidden = false;

      const close = (result) => {
        modal.hidden = true;
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        backdrop?.removeEventListener("click", onCancel);
        resolve(result);
      };

      const onOk = () => close(true);
      const onCancel = () => close(false);

      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      backdrop?.addEventListener("click", onCancel);
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
