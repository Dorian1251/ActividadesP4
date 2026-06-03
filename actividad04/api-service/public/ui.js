/* public/ui.js */
/* Helpers de UI: toasts, spinners y modal de confirmacion */

(function () {
  function ensureContainer() {
    let container = document.getElementById('toastContainer');
    if (container) {
      return container;
    }
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }

  function toast(message, type, delay) {
    type = type || 'info';
    delay = typeof delay === 'number' ? delay : 3500;
    const container = ensureContainer();
    const el = document.createElement('div');
    el.className = 'toast align-items-center text-bg-' + type + ' border-0';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'assertive');
    el.setAttribute('aria-atomic', 'true');
    el.innerHTML = '<div class="d-flex">'
      + '<div class="toast-body">' + message + '</div>'
      + '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>'
      + '</div>';
    container.appendChild(el);
    const instance = (window.bootstrap && window.bootstrap.Toast)
      ? new window.bootstrap.Toast(el, { delay: delay })
      : null;
    if (instance) {
      instance.show();
    } else {
      el.classList.add('show');
      setTimeout(() => el.remove(), delay);
    }
    el.addEventListener('hidden.bs.toast', () => el.remove());
  }

  function setLoading(button, on) {
    if (!button) {
      return;
    }
    if (on) {
      button.dataset.originalHtml = button.innerHTML;
      button.disabled = true;
      const text = (button.textContent || '').trim();
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + text;
    } else {
      button.disabled = false;
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
      }
    }
  }

  function confirmDialog(message) {
    return new Promise((resolve) => {
      const modalEl = document.getElementById('confirmModal');
      if (!modalEl || !window.bootstrap) {
        resolve(window.confirm(message));
        return;
      }
      const messageEl = document.getElementById('confirmMessage');
      const okEl = document.getElementById('confirmOk');
      if (messageEl) {
        messageEl.textContent = message;
      }
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      const onOk = () => { resolve(true); cleanup(); };
      const onHide = () => { resolve(false); cleanup(); };
      function cleanup() {
        okEl.removeEventListener('click', onOk);
        modalEl.removeEventListener('hidden.bs.modal', onHide);
      }
      okEl.addEventListener('click', onOk);
      modalEl.addEventListener('hidden.bs.modal', onHide, { once: true });
      modal.show();
    });
  }

  window.ui = { toast, setLoading, confirmDialog };
})();
