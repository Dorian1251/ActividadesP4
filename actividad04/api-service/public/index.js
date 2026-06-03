/* public/index.js */
/* Panel principal con CRUD, dashboard, filtros, paginacion, tema, i18n */

let token = sessionStorage.getItem('token');
const refreshToken = sessionStorage.getItem('refreshToken');
let usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');

const entidades = {
  usuarios: {
    titulo: 'nav.miPerfil',
    descripcion: 'Consulta, actualiza o elimina solamente tu propio usuario.',
    endpoint: '/api/usuarios',
    modoPerfil: true,
    evento: 'usuario.actualizado',
    placeholderBusqueda: '',
    filtrosExtra: [],
    campos: [
      { name: 'nombre', label: 'crud.placeholder.nombre', type: 'text', required: true },
      { name: 'email', label: 'auth.email', type: 'email', required: true },
      { name: 'rol', label: 'auth.rol', type: 'select', required: true, options: [
        { value: 'estudiante', i18n: 'auth.rol.estudiante' },
        { value: 'organizador', i18n: 'auth.rol.organizador' },
        { value: 'docente', i18n: 'auth.rol.docente' }
      ] }
    ],
    resumen: (item) => item.nombre,
    detalle: (item) => `${item.email} | ${item.rol}`
  },
  materias: {
    titulo: 'nav.materias',
    descripcion: 'Administra las materias usadas por sesiones, grupos y recursos.',
    endpoint: '/api/materias',
    evento: 'materia.creada',
    placeholderBusqueda: 'crud.placeholder.nombre',
    filtrosExtra: [
      { name: 'semestre', label: 'crud.placeholder.semestre', type: 'text' }
    ],
    campos: [
      { name: 'nombre', label: 'crud.placeholder.nombre', type: 'text', required: true },
      { name: 'codigo', label: 'crud.placeholder.codigo', type: 'text', required: true },
      { name: 'docente', label: 'crud.placeholder.docente', type: 'text' },
      { name: 'semestre', label: 'crud.placeholder.semestre', type: 'text' }
    ],
    resumen: (item) => item.nombre,
    detalle: (item) => `${item.codigo} | ${item.docente || 'Sin docente'} | ${item.semestre || 'Sin semestre'}`
  },
  grupos: {
    titulo: 'nav.grupos',
    descripcion: 'Crea grupos de estudio asociados a una materia.',
    endpoint: '/api/grupos',
    evento: 'usuario.unido',
    placeholderBusqueda: 'crud.placeholder.nombre',
    filtrosExtra: [
      { name: 'materia', label: 'crud.placeholder.nombre', type: 'text' }
    ],
    campos: [
      { name: 'nombre', label: 'crud.placeholder.nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'crud.placeholder.descripcion', type: 'textarea', required: true },
      { name: 'materiaId', label: 'crud.placeholder.nombre', type: 'materia', required: true }
    ],
    resumen: (item) => item.nombre,
    detalle: (item) => `${item.descripcion} | Materia: ${item.materia?.nombre || item.materiaId} | Organizador: ${item.organizador?.nombre || 'Actual'}`
  },
  sesiones: {
    titulo: 'nav.sesiones',
    descripcion: 'Programa sesiones de estudio. El creador se toma desde el token JWT.',
    endpoint: '/api/sesiones',
    evento: 'sesion.creada',
    placeholderBusqueda: 'crud.placeholder.titulo',
    filtrosExtra: [
      { name: 'fecha', label: 'crud.placeholder.titulo', type: 'date' },
      { name: 'materia', label: 'crud.placeholder.nombre', type: 'text' }
    ],
    campos: [
      { name: 'titulo', label: 'crud.placeholder.titulo', type: 'text', required: true },
      { name: 'descripcion', label: 'crud.placeholder.descripcion', type: 'textarea' },
      { name: 'fecha', label: 'crud.placeholder.titulo', type: 'date', required: true },
      { name: 'hora', label: 'crud.placeholder.titulo', type: 'time', required: true },
      { name: 'modalidad', label: 'crud.placeholder.titulo', type: 'select', required: true, options: [
        { value: 'virtual' }, { value: 'presencial' }, { value: 'hibrida' }
      ] },
      { name: 'materiaId', label: 'crud.placeholder.nombre', type: 'materia', required: true }
    ],
    resumen: (item) => item.titulo,
    detalle: (item) => `${item.fecha} ${item.hora} | ${item.modalidad} | Materia: ${item.materia?.nombre || item.materiaId}`
  },
  recursos: {
    titulo: 'nav.recursos',
    descripcion: 'Publica materiales de apoyo asociados a una materia.',
    endpoint: '/api/recursos',
    evento: 'recurso.publicado',
    placeholderBusqueda: 'crud.placeholder.titulo',
    filtrosExtra: [
      { name: 'tipo', label: 'crud.placeholder.tipo', type: 'text' },
      { name: 'materia', label: 'crud.placeholder.nombre', type: 'text' }
    ],
    campos: [
      { name: 'titulo', label: 'crud.placeholder.titulo', type: 'text', required: true },
      { name: 'tipo', label: 'crud.placeholder.tipo', type: 'text', required: true },
      { name: 'url', label: 'crud.placeholder.url', type: 'url', required: true },
      { name: 'descripcion', label: 'crud.placeholder.descripcion', type: 'textarea' },
      { name: 'materiaId', label: 'crud.placeholder.nombre', type: 'materia', required: true }
    ],
    resumen: (item) => item.titulo,
    detalle: (item) => `${item.tipo} | Materia: ${item.materia?.nombre || item.materiaId}`
  }
};

let entidadActual = 'sesiones';
let notificaciones = 0;
let materiasCache = [];
let paginaActual = 1;
const pageSize = 10;
let totalRegistros = 0;
let searchDebounce = null;

const entityMenu = document.getElementById('entityMenu');
const entityTitle = document.getElementById('entityTitle');
const entityDescription = document.getElementById('entityDescription');
const entityForm = document.getElementById('entityForm');
const formTitle = document.getElementById('formTitle');
const listTitle = document.getElementById('listTitle');
const recordsList = document.getElementById('recordsList');
const recordCounter = document.getElementById('recordCounter');
const reloadBtn = document.getElementById('reloadBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcome = document.getElementById('welcome');
const socketStatus = document.getElementById('socketStatus');
const notificationFeed = document.getElementById('notificationFeed');
const notificationCounter = document.getElementById('notificationCounter');
const searchInput = document.getElementById('searchInput');
const extraFilters = document.getElementById('extraFilters');
const paginationEl = document.getElementById('pagination');
const crudSection = document.getElementById('crudSection');
const dashboardSection = document.getElementById('dashboardSection');
const dashboardBtn = document.getElementById('dashboardBtn');
const langSwitcher = document.getElementById('langSwitcher');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (!token || !usuario) {
  window.location.href = '/static/login.html';
}

function aplicarTema(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun';
  }
  if (themeToggle) {
    themeToggle.title = theme === 'dark' ? i18n.t('nav.tema.claro') : i18n.t('nav.tema.oscuro');
  }
}

function aplicarBienvenida() {
  if (welcome && usuario) {
    welcome.textContent = i18n.t('topbar.hola', { nombre: usuario.nombre });
  }
}

aplicarTema(localStorage.getItem('theme') || 'dark');
if (langSwitcher) {
  langSwitcher.value = i18n.getLang();
}
aplicarBienvenida();

async function renovarToken() {
  if (!refreshToken) {
    return false;
  }
  try {
    const res = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) {
      return false;
    }
    const data = await res.json();
    token = data.token;
    sessionStorage.setItem('token', data.token);
    return true;
  } catch (error) {
    return false;
  }
}

async function apiFetch(url, options) {
  options = options || {};
  const headers = Object.assign({}, options.headers || {}, { Authorization: 'Bearer ' + token });
  let res = await fetch(url, Object.assign({}, options, { headers }));
  if (res.status === 401 && await renovarToken()) {
    headers.Authorization = 'Bearer ' + token;
    res = await fetch(url, Object.assign({}, options, { headers }));
  }
  if (res.status === 401) {
    sessionStorage.clear();
    window.location.href = '/static/login.html';
  }
  return res;
}

async function cargarMateriasCombo() {
  if (materiasCache.length > 0) {
    return materiasCache;
  }
  try {
    const res = await apiFetch('/api/materias?page=1&limit=100');
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      materiasCache = data;
    }
  } catch (error) {
    materiasCache = [];
  }
  return materiasCache;
}

function renderMenu() {
  const keys = ['usuarios', 'materias', 'grupos', 'sesiones', 'recursos'];
  entityMenu.innerHTML = keys.map((key) => {
    const config = entidades[key];
    const activeClass = key === entidadActual ? 'active' : '';
    return `<button class="btn entity-btn ${activeClass}" type="button" data-entidad="${key}">${i18n.t(config.titulo)}</button>`;
  }).join('');
  entityMenu.querySelectorAll('[data-entidad]').forEach((button) => {
    button.addEventListener('click', () => seleccionarEntidad(button.dataset.entidad));
  });
}

function renderFiltrosExtra() {
  const config = entidades[entidadActual];
  extraFilters.innerHTML = (config.filtrosExtra || []).map((f) => {
    return `<div>
      <label class="form-label small mb-1" for="filter-${f.name}">${i18n.t(f.label)}</label>
      <input id="filter-${f.name}" data-filter="${f.name}" type="${f.type}" class="form-control form-control-sm">
    </div>`;
  }).join('');
  extraFilters.querySelectorAll('[data-filter]').forEach((input) => {
    input.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => cargarRegistros(1), 300);
    });
  });
}

async function renderFormulario() {
  const config = entidades[entidadActual];
  const usaMateria = config.campos.some((campo) => campo.name === 'materiaId');
  const materias = usaMateria ? await cargarMateriasCombo() : [];

  formTitle.textContent = config.modoPerfil
    ? i18n.t('nav.miPerfil')
    : i18n.t('crud.crear');

  entityForm.innerHTML = config.campos.map((campo) => {
    const required = campo.required ? 'required' : '';
    const col = campo.type === 'textarea' ? 'col-12' : 'col-12 col-md-6';

    if (campo.name === 'materiaId') {
      return `<div class="${col}">
        <label class="form-label" for="${campo.name}">${i18n.t('crud.placeholder.nombre')}</label>
        <select class="form-select" id="${campo.name}" name="${campo.name}" ${required}>
          <option value="">${i18n.t('crud.seleccionaMateria')}</option>
          ${materias.map((m) => `<option value="${m.id}">${m.nombre} (${m.codigo})</option>`).join('')}
        </select>
        ${materias.length === 0 ? `<div class="form-text text-warning">${i18n.t('crud.primeroCreaMateria')}</div>` : ''}
      </div>`;
    }

    if (campo.type === 'select') {
      return `<div class="${col}">
        <label class="form-label" for="${campo.name}">${i18n.t(campo.label)}</label>
        <select class="form-select" id="${campo.name}" name="${campo.name}" ${required}>
          ${campo.options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : i18n.t(opt.i18n || opt.value);
            return `<option value="${value}">${label}</option>`;
          }).join('')}
        </select>
      </div>`;
    }

    if (campo.type === 'textarea') {
      return `<div class="${col}">
        <label class="form-label" for="${campo.name}">${i18n.t(campo.label)}</label>
        <textarea class="form-control" id="${campo.name}" name="${campo.name}" rows="3" ${required}></textarea>
      </div>`;
    }

    return `<div class="${col}">
      <label class="form-label" for="${campo.name}">${i18n.t(campo.label)}</label>
      <input class="form-control" id="${campo.name}" name="${campo.name}" type="${campo.type}" ${required}>
    </div>`;
  }).join('') + `<div class="col-12">
    <button class="btn btn-success" type="submit">${i18n.t('comun.guardar')}</button>
  </div>`;

  if (config.modoPerfil) {
    const nombreEl = document.getElementById('nombre');
    const emailEl = document.getElementById('email');
    const rolEl = document.getElementById('rol');
    if (nombreEl) nombreEl.value = usuario.nombre || '';
    if (emailEl) emailEl.value = usuario.email || '';
    if (rolEl) rolEl.value = usuario.rol || 'estudiante';
  }
}

function cambiarTituloEntidad() {
  const config = entidades[entidadActual];
  entityTitle.textContent = i18n.t(config.titulo);
  entityDescription.textContent = config.descripcion;
  listTitle.textContent = i18n.t('crud.registros') + ' - ' + i18n.t(config.titulo);
  if (searchInput) {
    searchInput.placeholder = config.placeholderBusqueda ? i18n.t(config.placeholderBusqueda) : '';
  }
}

async function seleccionarEntidad(entidad) {
  entidadActual = entidad;
  paginaActual = 1;
  if (searchInput) searchInput.value = '';
  if (extraFilters) {
    extraFilters.querySelectorAll('[data-filter]').forEach((input) => { input.value = ''; });
  }
  mostrarCrud();
  cambiarTituloEntidad();
  renderMenu();
  renderFiltrosExtra();
  await renderFormulario();
  cargarRegistros(1);
}

function formDataToBody(formData) {
  const body = {};
  entidades[entidadActual].campos.forEach((campo) => {
    const value = String(formData.get(campo.name) || '').trim();
    if (!value && !campo.required) {
      return;
    }
    body[campo.name] = campo.type === 'number' ? Number(value) : value;
  });
  return body;
}

function construirQuery(pagina) {
  const params = new URLSearchParams();
  params.set('page', String(pagina || paginaActual));
  params.set('limit', String(pageSize));
  const config = entidades[entidadActual];
  const q = (searchInput && searchInput.value || '').trim();
  if (q) {
    if (config.endpoint === '/api/sesiones' || config.endpoint === '/api/recursos' || config.endpoint === '/api/grupos' || config.endpoint === '/api/materias') {
      params.set('q', q);
    }
  }
  if (extraFilters) {
    extraFilters.querySelectorAll('[data-filter]').forEach((input) => {
      const v = (input.value || '').trim();
      if (v) {
        params.set(input.dataset.filter, v);
      }
    });
  }
  return params.toString();
}

async function crearRegistro(event) {
  event.preventDefault();
  const config = entidades[entidadActual];
  const submitBtn = entityForm.querySelector('button[type="submit"]');
  const body = formDataToBody(new FormData(entityForm));
  ui.setLoading(submitBtn, true);
  try {
    const endpoint = config.modoPerfil ? `${config.endpoint}/${usuario.id}` : config.endpoint;
    const method = config.modoPerfil ? 'PUT' : 'POST';
    const res = await apiFetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      ui.toast(data.error || 'No se pudo crear el registro.', 'danger');
      return;
    }
    if (config.modoPerfil) {
      usuario = Object.assign({}, usuario, data);
      sessionStorage.setItem('usuario', JSON.stringify(usuario));
      aplicarBienvenida();
      ui.toast(i18n.t('comun.exito'), 'success');
    } else {
      ui.toast(i18n.t('comun.exito'), 'success');
      entityForm.reset();
    }
    if (entidadActual === 'materias') {
      materiasCache = [];
    }
    cargarRegistros(1);
  } catch (error) {
    ui.toast('Error de conexion con el servidor.', 'danger');
  } finally {
    ui.setLoading(submitBtn, false);
  }
}

function renderPaginacion() {
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / pageSize));
  if (totalRegistros <= pageSize) {
    paginationEl.innerHTML = '';
    return;
  }
  const items = [];
  items.push(`<li class="page-item ${paginaActual <= 1 ? 'disabled' : ''}">
    <button class="page-link" data-page="${paginaActual - 1}">${i18n.t('crud.anterior')}</button>
  </li>`);
  const inicio = Math.max(1, paginaActual - 2);
  const fin = Math.min(totalPaginas, inicio + 4);
  for (let p = inicio; p <= fin; p++) {
    items.push(`<li class="page-item ${p === paginaActual ? 'active' : ''}">
      <button class="page-link" data-page="${p}">${p}</button>
    </li>`);
  }
  items.push(`<li class="page-item ${paginaActual >= totalPaginas ? 'disabled' : ''}">
    <button class="page-link" data-page="${paginaActual + 1}">${i18n.t('crud.siguiente')}</button>
  </li>`);
  paginationEl.innerHTML = items.join('');
  paginationEl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = Number(btn.dataset.page);
      if (p >= 1 && p <= totalPaginas) {
        cargarRegistros(p);
      }
    });
  });
}

async function cargarRegistros(pagina) {
  if (typeof pagina === 'number') {
    paginaActual = pagina;
  }
  const config = entidades[entidadActual];
  recordsList.innerHTML = `<div class="text-muted-custom small">${i18n.t('crud.cargando')}</div>`;
  ui.setLoading(reloadBtn, true);
  try {
    const qs = construirQuery(paginaActual);
    const res = await apiFetch(`${config.endpoint}?${qs}`);
    const data = await res.json();
    if (!res.ok) {
      recordsList.innerHTML = `<div class="alert alert-danger">${data.error || 'No se pudieron cargar los registros.'}</div>`;
      totalRegistros = 0;
      renderPaginacion();
      return;
    }
    const registros = Array.isArray(data) ? data : [];
    const totalHeader = res.headers.get('X-Total-Count');
    totalRegistros = totalHeader ? Number(totalHeader) : registros.length;
    recordCounter.textContent = `${totalRegistros} ${i18n.t('crud.registros').toLowerCase()}`;

    if (registros.length === 0) {
      recordsList.innerHTML = `<div class="text-muted-custom small">${i18n.t('crud.sinRegistros')}</div>`;
      renderPaginacion();
      return;
    }
    recordsList.innerHTML = registros.map((item) => renderRegistro(item, config)).join('');
    recordsList.querySelectorAll('[data-delete-id]').forEach((button) => {
      button.addEventListener('click', () => eliminarRegistro(button.dataset.deleteId));
    });
    recordsList.querySelectorAll('[data-qr-id]').forEach((button) => {
      button.addEventListener('click', () => abrirQrSesion(button.dataset.qrId));
    });
    recordsList.querySelectorAll('[data-asistencia-id]').forEach((button) => {
      button.addEventListener('click', () => abrirAsistenciaSesion(button.dataset.asistenciaId));
    });
    recordsList.querySelectorAll('[data-listar-asistencias-id]').forEach((button) => {
      button.addEventListener('click', () => listarAsistentes(button.dataset.listarAsistenciasId));
    });
    renderPaginacion();
  } catch (error) {
    recordsList.innerHTML = '<div class="alert alert-danger">Error de conexion al cargar registros.</div>';
  } finally {
    ui.setLoading(reloadBtn, false);
  }
}

function renderRegistro(item, config) {
  const accionesExtra = entidadActual === 'sesiones' ? `
    <button class="btn btn-outline-info btn-sm" type="button" data-qr-id="${item.id}">QR</button>
    <button class="btn btn-outline-success btn-sm" type="button" data-asistencia-id="${item.id}">${i18n.t('asistencia.titulo').split(' ')[0]}</button>
    <button class="btn btn-outline-light btn-sm" type="button" data-listar-asistencias-id="${item.id}">${i18n.t('dashboard.asistenciaPct')}</button>
  ` : '';
  return `<article class="data-card p-3">
    <div class="d-flex flex-wrap justify-content-between gap-2">
      <div>
        <h4 class="h6 mb-1">${config.resumen(item) || `Registro ${item.id}`}</h4>
        <p class="small text-muted-custom mb-0">${config.detalle(item) || ''}</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <span class="badge text-bg-secondary align-self-start">ID ${item.id}</span>
        ${accionesExtra}
        <button class="btn btn-outline-danger btn-sm" type="button" data-delete-id="${item.id}">${i18n.t('crud.eliminar')}</button>
      </div>
    </div>
  </article>`;
}

async function eliminarRegistro(id) {
  const config = entidades[entidadActual];
  const mensaje = config.modoPerfil
    ? i18n.t('crud.confirmaEliminarPerfil')
    : i18n.t('crud.confirmaEliminar', { id });
  const ok = await ui.confirmDialog(mensaje);
  if (!ok) {
    return;
  }
  try {
    const res = await apiFetch(`${config.endpoint}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      ui.toast(data.error || 'No se pudo eliminar el registro.', 'danger');
      return;
    }
    if (config.modoPerfil) {
      sessionStorage.clear();
      window.location.href = '/static/register.html';
      return;
    }
    ui.toast(i18n.t('comun.exito'), 'success');
    cargarRegistros(paginaActual);
  } catch (error) {
    ui.toast('Error de conexion al eliminar.', 'danger');
  }
}

function abrirQrSesion(id) {
  window.location.href = `/static/qr.html?sesionId=${id}`;
}

async function abrirAsistenciaSesion(id) {
  try {
    const res = await apiFetch(`/api/sesiones/${id}/qr`);
    const data = await res.json();
    if (!res.ok) {
      ui.toast(data.error || 'No se pudo abrir la asistencia.', 'danger');
      return;
    }
    window.location.href = data.asistenciaUrl;
  } catch (error) {
    ui.toast('Error al abrir la asistencia.', 'danger');
  }
}

async function listarAsistentes(id) {
  try {
    const res = await apiFetch(`/api/sesiones/${id}/asistencias`);
    const data = await res.json();
    if (!res.ok) {
      ui.toast(data.error || 'No se pudieron cargar los asistentes.', 'danger');
      return;
    }
    const nombres = data.asistencias.map((a) => a.usuario?.nombre || `Usuario ${a.usuarioId}`);
    agregarNotificacion({
      canal: 'asistencias',
      tipo: 'asistencias.lista',
      payload: { nombre: `${data.total} asistente(s): ${nombres.join(', ') || 'Sin asistentes'}` },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    ui.toast('Error al listar asistentes.', 'danger');
  }
}

function agregarNotificacion(evento) {
  notificaciones += 1;
  notificationCounter.textContent = String(notificaciones);
  if (notificationFeed.firstElementChild && notificationFeed.firstElementChild.classList.contains('text-muted-custom')) {
    notificationFeed.innerHTML = '';
  }
  const payload = evento.payload || {};
  const titulo = payload.titulo || payload.nombre || payload.grupo || payload.email || 'Evento recibido';
  const hora = new Date(evento.timestamp || Date.now()).toLocaleTimeString();
  const item = document.createElement('div');
  item.className = 'notification-item';
  item.innerHTML = `<div class="d-flex justify-content-between gap-2">
      <strong>${evento.tipo || 'evento'}</strong>
      <span class="small text-muted-custom">${hora}</span>
    </div>
    <div class="small text-muted-custom">${evento.canal || 'socket.io'}</div>
    <div class="small mt-1">${titulo}</div>
    ${evento.clientes !== undefined ? `<div class="small text-info mt-1">Enviado a ${evento.clientes} cliente(s)</div>` : ''}`;
  notificationFeed.prepend(item);
}

function iniciarSocket() {
  const socket = io();
  socket.on('connect', () => {
    socket.emit('registrar-usuario', usuario.nombre);
    socketStatus.innerHTML = `<span class="status-dot"></span>${i18n.t('socket.conectado')}`;
  });
  socket.on('disconnect', () => {
    socketStatus.textContent = i18n.t('socket.desconectado');
  });
  socket.on('nuevo-evento', (evento) => {
    agregarNotificacion(evento);
    const config = entidades[entidadActual];
    if (config && evento.tipo === config.evento) {
      cargarRegistros(paginaActual);
    }
  });
}

async function logout() {
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }
    });
  } finally {
    sessionStorage.clear();
    window.location.href = '/static/login.html';
  }
}

function mostrarDashboard() {
  crudSection.classList.add('d-none');
  dashboardSection.classList.remove('d-none');
  if (dashboardBtn) dashboardBtn.classList.add('active');
  if (window.dashboard && window.dashboard.cargar) {
    window.dashboard.cargar(dashboardSection);
  }
}

function mostrarCrud() {
  dashboardSection.classList.add('d-none');
  crudSection.classList.remove('d-none');
  if (dashboardBtn) dashboardBtn.classList.remove('active');
}

entityForm.addEventListener('submit', crearRegistro);
reloadBtn.addEventListener('click', () => cargarRegistros(1));
logoutBtn.addEventListener('click', logout);
dashboardBtn.addEventListener('click', mostrarDashboard);

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => cargarRegistros(1), 300);
  });
}

if (langSwitcher) {
  langSwitcher.addEventListener('change', (e) => {
    i18n.setLang(e.target.value);
    cambiarTituloEntidad();
    renderMenu();
    if (!crudSection.classList.contains('d-none')) {
      cargarRegistros(paginaActual);
    } else {
      mostrarDashboard();
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    aplicarTema(next);
  });
}

document.addEventListener('langchange', () => {
  cambiarTituloEntidad();
  aplicarBienvenida();
  renderMenu();
  renderFiltrosExtra();
  socketStatus.innerHTML = `<span class="status-dot"></span>${i18n.t('socket.conectado')}`;
  renderPaginacion();
});

renderMenu();
cambiarTituloEntidad();
mostrarDashboard();
iniciarSocket();
