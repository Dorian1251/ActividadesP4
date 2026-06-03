/* public/dashboard.js */
/* Carga y renderiza las tarjetas de estadisticas del usuario */

(function () {
  async function apiFetch(url, options) {
    options = options || {};
    const token = sessionStorage.getItem('token');
    const headers = Object.assign({}, options.headers || {}, { Authorization: 'Bearer ' + token });
    const res = await fetch(url, Object.assign({}, options, { headers }));
    return res;
  }

  function renderEstructura(container) {
    container.innerHTML = `
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h3 class="h5 mb-0">${i18n.t('dashboard.titulo')}</h3>
        <button id="refreshDashboard" class="btn btn-outline-info btn-sm" type="button">
          <i class="bi bi-arrow-clockwise"></i> <span>${i18n.t('dashboard.actualizar')}</span>
        </button>
      </div>
      <div class="col-6 col-md-3"><div class="panel-card p-3 h-100">
        <div class="text-muted-custom small">${i18n.t('dashboard.proximasSesiones')}</div>
        <div id="statProximas" class="display-6 fw-bold text-info">--</div>
      </div></div>
      <div class="col-6 col-md-3"><div class="panel-card p-3 h-100">
        <div class="text-muted-custom small">${i18n.t('dashboard.asistenciaPct')}</div>
        <div id="statAsistencia" class="display-6 fw-bold text-success">--%</div>
      </div></div>
      <div class="col-6 col-md-3"><div class="panel-card p-3 h-100">
        <div class="text-muted-custom small">${i18n.t('dashboard.materias')}</div>
        <div id="statMaterias" class="display-6 fw-bold">--</div>
      </div></div>
      <div class="col-6 col-md-3"><div class="panel-card p-3 h-100">
        <div class="text-muted-custom small">${i18n.t('dashboard.sesiones')}</div>
        <div id="statSesiones" class="display-6 fw-bold">--</div>
      </div></div>
      <div class="col-12 col-xl-7"><div class="panel-card p-3">
        <h4 class="h6 mb-3">${i18n.t('dashboard.proximas')}</h4>
        <div id="dashProximas" class="d-grid gap-2"></div>
      </div></div>
      <div class="col-12 col-xl-5"><div class="panel-card p-3">
        <h4 class="h6 mb-3">${i18n.t('dashboard.recursos')}</h4>
        <div id="dashRecursos" class="d-grid gap-2"></div>
      </div></div>`;
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => cargar(container));
    }
  }

  function renderProximas(items) {
    const cont = document.getElementById('dashProximas');
    if (!cont) return;
    if (!items || items.length === 0) {
      cont.innerHTML = `<div class="text-muted-custom small">${i18n.t('dashboard.sinProximas')}</div>`;
      return;
    }
    cont.innerHTML = items.map((s) => {
      const materia = s.materia?.nombre || 'Sin materia';
      return `<div class="data-card p-3">
        <div class="d-flex justify-content-between gap-2">
          <div>
            <h5 class="h6 mb-1">${s.titulo}</h5>
            <p class="small text-muted-custom mb-0">${s.fecha} ${s.hora} | ${s.modalidad} | ${materia}</p>
          </div>
          <span class="badge text-bg-secondary align-self-start">ID ${s.id}</span>
        </div>
      </div>`;
    }).join('');
  }

  function renderRecursos(items) {
    const cont = document.getElementById('dashRecursos');
    if (!cont) return;
    if (!items || items.length === 0) {
      cont.innerHTML = `<div class="text-muted-custom small">${i18n.t('dashboard.sinRecursos')}</div>`;
      return;
    }
    cont.innerHTML = items.map((r) => {
      const materia = r.materia?.nombre || 'Sin materia';
      return `<div class="data-card p-3">
        <div class="d-flex justify-content-between gap-2">
          <div>
            <h5 class="h6 mb-1">${r.titulo}</h5>
            <p class="small text-muted-custom mb-0">${r.tipo} | ${materia}</p>
          </div>
          <a href="${r.url}" target="_blank" rel="noreferrer" class="btn btn-outline-info btn-sm align-self-start">
            <i class="bi bi-box-arrow-up-right"></i>
          </a>
        </div>
      </div>`;
    }).join('');
  }

  async function cargar(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) {
      container = document.getElementById('dashboardSection');
    }
    renderEstructura(container);
    const refreshBtn = document.getElementById('refreshDashboard');
    ui.setLoading(refreshBtn, true);
    try {
      const res = await apiFetch('/api/dashboard');
      if (!res.ok) {
        ui.toast('No se pudo cargar el dashboard.', 'danger');
        return;
      }
      const data = await res.json();
      document.getElementById('statProximas').textContent = String(data.proximasSesiones.length);
      document.getElementById('statAsistencia').textContent = data.asistencia.porcentaje + '%';
      document.getElementById('statMaterias').textContent = String(data.materiasCount);
      document.getElementById('statSesiones').textContent = String(data.sesionesCount);
      renderProximas(data.proximasSesiones);
      renderRecursos(data.recursosRecientes);
    } catch (error) {
      ui.toast('Error al cargar el dashboard.', 'danger');
    } finally {
      ui.setLoading(refreshBtn, false);
    }
  }

  window.dashboard = { cargar };
})();
