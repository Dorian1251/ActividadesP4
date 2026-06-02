let token = sessionStorage.getItem('token');
const refreshToken = sessionStorage.getItem('refreshToken');
let usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');

const entidades = {
  usuarios: {
    titulo: 'Mi perfil',
    descripcion: 'Consulta, actualiza o elimina solamente tu propio usuario.',
    endpoint: '/api/usuarios',
    modoPerfil: true,
    evento: 'usuario.actualizado',
    campos: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'rol', label: 'Rol', type: 'select', required: true, options: ['estudiante', 'organizador', 'docente'] }
    ],
    resumen: (item) => item.nombre,
    detalle: (item) => `${item.email} | ${item.rol}`
  },
  materias: {
    titulo: 'Materias',
    descripcion: 'Administra las materias usadas por sesiones, grupos y recursos.',
    endpoint: '/api/materias',
    evento: 'materia.creada',
    campos: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'codigo', label: 'Codigo', type: 'text', required: true },
      { name: 'docente', label: 'Docente', type: 'text' },
      { name: 'semestre', label: 'Semestre', type: 'text' }
    ],
    resumen: (item) => item.nombre,
    detalle: (item) => `${item.codigo} | ${item.docente || 'Sin docente'} | ${item.semestre || 'Sin semestre'}`
  },
  grupos: {
    titulo: 'Grupos',
    descripcion: 'Crea grupos de estudio asociados a una materia.',
    endpoint: '/api/grupos',
    evento: 'usuario.unido',
    campos: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripcion', type: 'textarea', required: true },
      { name: 'materiaId', label: 'ID materia', type: 'number', required: true }
    ],
    resumen: (item) => item.nombre,
    detalle: (item) => `${item.descripcion} | Materia: ${item.materia?.nombre || item.materiaId} | Organizador: ${item.organizador?.nombre || 'Actual'}`
  },
  sesiones: {
    titulo: 'Sesiones',
    descripcion: 'Programa sesiones de estudio. El creador se toma desde el token JWT.',
    endpoint: '/api/sesiones',
    evento: 'sesion.creada',
    campos: [
      { name: 'titulo', label: 'Titulo', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { name: 'fecha', label: 'Fecha', type: 'date', required: true },
      { name: 'hora', label: 'Hora', type: 'time', required: true },
      { name: 'modalidad', label: 'Modalidad', type: 'select', required: true, options: ['virtual', 'presencial', 'hibrida'] },
      { name: 'materiaId', label: 'ID materia', type: 'number', required: true }
    ],
    resumen: (item) => item.titulo,
    detalle: (item) => `${item.fecha} ${item.hora} | ${item.modalidad} | Materia: ${item.materia?.nombre || item.materiaId}`
  },
  recursos: {
    titulo: 'Recursos',
    descripcion: 'Publica materiales de apoyo asociados a una materia.',
    endpoint: '/api/recursos',
    evento: 'recurso.publicado',
    campos: [
      { name: 'titulo', label: 'Titulo', type: 'text', required: true },
      { name: 'tipo', label: 'Tipo', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'url', required: true },
      { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { name: 'materiaId', label: 'ID materia', type: 'number', required: true }
    ],
    resumen: (item) => item.titulo,
    detalle: (item) => `${item.tipo} | Materia: ${item.materia?.nombre || item.materiaId}`
  }
};

let entidadActual = 'sesiones';
let notificaciones = 0;
let materiasCache = [];

const entityMenu = document.getElementById('entityMenu');
const entityTitle = document.getElementById('entityTitle');
const entityDescription = document.getElementById('entityDescription');
const entityForm = document.getElementById('entityForm');
const formTitle = document.getElementById('formTitle');
const listTitle = document.getElementById('listTitle');
const recordsList = document.getElementById('recordsList');
const recordCounter = document.getElementById('recordCounter');
const alertBox = document.getElementById('alertBox');
const reloadBtn = document.getElementById('reloadBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcome = document.getElementById('welcome');
const socketStatus = document.getElementById('socketStatus');
const notificationFeed = document.getElementById('notificationFeed');
const notificationCounter = document.getElementById('notificationCounter');

if (!token || !usuario) {
  window.location.href = '/static/login.html';
}

welcome.textContent = `Hola, ${usuario.nombre}`;

function mostrarAlerta(mensaje, tipo = 'danger') {
  alertBox.innerHTML = `
    <div class="alert alert-${tipo} py-2" role="alert">
      ${mensaje}
    </div>
  `;
}

function limpiarAlerta() {
  alertBox.innerHTML = '';
}

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

async function apiFetch(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };

  let res = await fetch(url, {
    ...options,
    headers
  });

  if (res.status === 401 && await renovarToken()) {
    headers.Authorization = `Bearer ${token}`;
    res = await fetch(url, {
      ...options,
      headers
    });
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
  entityMenu.innerHTML = Object.entries(entidades).map(([key, config]) => `
    <button class="btn entity-btn ${key === entidadActual ? 'active' : ''}" type="button" data-entidad="${key}">
      ${config.titulo}
    </button>
  `).join('');

  entityMenu.querySelectorAll('[data-entidad]').forEach((button) => {
    button.addEventListener('click', () => seleccionarEntidad(button.dataset.entidad));
  });
}

async function renderFormulario() {
  const config = entidades[entidadActual];
  const usaMateria = config.campos.some((campo) => campo.name === 'materiaId');
  const materias = usaMateria ? await cargarMateriasCombo() : [];

  formTitle.textContent = config.modoPerfil ? 'Actualizar mi perfil' : `Crear ${config.titulo.slice(0, -1).toLowerCase()}`;
  entityForm.innerHTML = config.campos.map((campo) => {
    const required = campo.required ? 'required' : '';
    const col = campo.type === 'textarea' ? 'col-12' : 'col-12 col-md-6';

    if (campo.name === 'materiaId') {
      return `
        <div class="${col}">
          <label class="form-label" for="${campo.name}">Materia</label>
          <select class="form-select" id="${campo.name}" name="${campo.name}" ${required}>
            <option value="">Selecciona una materia</option>
            ${materias.map((materia) => `<option value="${materia.id}">${materia.nombre} (${materia.codigo})</option>`).join('')}
          </select>
          ${materias.length === 0 ? '<div class="form-text text-warning">Primero crea una materia.</div>' : ''}
        </div>
      `;
    }

    if (campo.type === 'select') {
      return `
        <div class="${col}">
          <label class="form-label" for="${campo.name}">${campo.label}</label>
          <select class="form-select" id="${campo.name}" name="${campo.name}" ${required}>
            ${campo.options.map((option) => `<option value="${option}">${option}</option>`).join('')}
          </select>
        </div>
      `;
    }

    if (campo.type === 'textarea') {
      return `
        <div class="${col}">
          <label class="form-label" for="${campo.name}">${campo.label}</label>
          <textarea class="form-control" id="${campo.name}" name="${campo.name}" rows="3" ${required}></textarea>
        </div>
      `;
    }

    return `
      <div class="${col}">
        <label class="form-label" for="${campo.name}">${campo.label}</label>
        <input class="form-control" id="${campo.name}" name="${campo.name}" type="${campo.type}" ${required}>
      </div>
    `;
  }).join('') + `
    <div class="col-12">
      <button class="btn btn-success" type="submit">${config.modoPerfil ? 'Guardar cambios' : 'Crear registro'}</button>
    </div>
  `;

  if (config.modoPerfil) {
    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('rol').value = usuario.rol || 'estudiante';
  }
}

async function seleccionarEntidad(entidad) {
  entidadActual = entidad;
  const config = entidades[entidadActual];

  entityTitle.textContent = config.titulo;
  entityDescription.textContent = config.descripcion;
  listTitle.textContent = `Registros de ${config.titulo.toLowerCase()}`;

  renderMenu();
  await renderFormulario();
  cargarRegistros();
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

async function crearRegistro(event) {
  event.preventDefault();
  limpiarAlerta();

  const config = entidades[entidadActual];
  const body = formDataToBody(new FormData(entityForm));

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
      mostrarAlerta(data.error || 'No se pudo crear el registro.');
      return;
    }

    if (config.modoPerfil) {
      usuario = {
        ...usuario,
        ...data
      };
      sessionStorage.setItem('usuario', JSON.stringify(usuario));
      welcome.textContent = `Hola, ${usuario.nombre}`;
      mostrarAlerta('Perfil actualizado correctamente.', 'success');
    } else {
      mostrarAlerta('Registro creado correctamente.', 'success');
      entityForm.reset();
    }
    if (entidadActual === 'materias') {
      materiasCache = [];
    }
    cargarRegistros();
  } catch (error) {
    mostrarAlerta('Error de conexion con el servidor.');
  }
}

async function cargarRegistros() {
  const config = entidades[entidadActual];
  recordsList.innerHTML = '<div class="text-muted-custom small">Cargando datos...</div>';

  try {
    const res = await apiFetch(`${config.endpoint}?page=1&limit=100`);
    const data = await res.json();

    if (!res.ok) {
      recordsList.innerHTML = `<div class="alert alert-danger">${data.error || 'No se pudieron cargar los registros.'}</div>`;
      return;
    }

    const registros = Array.isArray(data) ? data : [];
    recordCounter.textContent = `${registros.length} registro(s)`;

    if (registros.length === 0) {
      recordsList.innerHTML = '<div class="text-muted-custom small">No hay registros para mostrar.</div>';
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
  } catch (error) {
    recordsList.innerHTML = '<div class="alert alert-danger">Error de conexion al cargar registros.</div>';
  }
}

function renderRegistro(item, config) {
  const accionesExtra = entidadActual === 'sesiones' ? `
    <button class="btn btn-outline-info btn-sm" type="button" data-qr-id="${item.id}">QR</button>
    <button class="btn btn-outline-success btn-sm" type="button" data-asistencia-id="${item.id}">Mi asistencia</button>
    <button class="btn btn-outline-light btn-sm" type="button" data-listar-asistencias-id="${item.id}">Asistentes</button>
  ` : '';

  return `
    <article class="data-card p-3">
      <div class="d-flex flex-wrap justify-content-between gap-2">
        <div>
          <h4 class="h6 mb-1">${config.resumen(item) || `Registro ${item.id}`}</h4>
          <p class="small text-muted-custom mb-0">${config.detalle(item) || ''}</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span class="badge text-bg-secondary align-self-start">ID ${item.id}</span>
          ${accionesExtra}
          <button class="btn btn-outline-danger btn-sm" type="button" data-delete-id="${item.id}">Eliminar</button>
        </div>
      </div>
    </article>
  `;
}

async function eliminarRegistro(id) {
  const config = entidades[entidadActual];

  const mensaje = config.modoPerfil
    ? 'Eliminar tu propia cuenta? Esta accion cerrara tu sesion.'
    : `Eliminar registro ID ${id}?`;

  if (!confirm(mensaje)) {
    return;
  }

  try {
    const res = await apiFetch(`${config.endpoint}/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const data = await res.json();
      mostrarAlerta(data.error || 'No se pudo eliminar el registro.');
      return;
    }

    if (config.modoPerfil) {
      sessionStorage.clear();
      window.location.href = '/static/register.html';
      return;
    }

    mostrarAlerta('Registro eliminado correctamente.', 'success');
    cargarRegistros();
  } catch (error) {
    mostrarAlerta('Error de conexion al eliminar.');
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
      mostrarAlerta(data.error || 'No se pudo abrir la asistencia.');
      return;
    }

    window.location.href = data.asistenciaUrl;
  } catch (error) {
    mostrarAlerta('Error al abrir la asistencia.');
  }
}

async function listarAsistentes(id) {
  try {
    const res = await apiFetch(`/api/sesiones/${id}/asistencias`);
    const data = await res.json();

    if (!res.ok) {
      mostrarAlerta(data.error || 'No se pudieron cargar los asistentes.');
      return;
    }

    const nombres = data.asistencias.map((asistencia) => asistencia.usuario?.nombre || `Usuario ${asistencia.usuarioId}`);
    agregarNotificacion({
      canal: 'asistencias',
      tipo: 'asistencias.lista',
      payload: {
        nombre: `${data.total} asistente(s): ${nombres.join(', ') || 'Sin asistentes'}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    mostrarAlerta('Error al listar asistentes.');
  }
}

function agregarNotificacion(evento) {
  notificaciones += 1;
  notificationCounter.textContent = String(notificaciones);

  if (notificationFeed.firstElementChild?.classList.contains('text-muted-custom')) {
    notificationFeed.innerHTML = '';
  }

  const payload = evento.payload || {};
  const titulo = payload.titulo || payload.nombre || payload.grupo || payload.email || 'Evento recibido';
  const hora = new Date(evento.timestamp || Date.now()).toLocaleTimeString();

  const item = document.createElement('div');
  item.className = 'notification-item';
  item.innerHTML = `
    <div class="d-flex justify-content-between gap-2">
      <strong>${evento.tipo || 'evento'}</strong>
      <span class="small text-muted-custom">${hora}</span>
    </div>
    <div class="small text-muted-custom">${evento.canal || 'socket.io'}</div>
    <div class="small mt-1">${titulo}</div>
    ${evento.clientes !== undefined ? `<div class="small text-info mt-1">Enviado a ${evento.clientes} cliente(s)</div>` : ''}
  `;

  notificationFeed.prepend(item);
}

function iniciarSocket() {
  const socket = io();

  socket.on('connect', () => {
    socket.emit('registrar-usuario', usuario.nombre);
    socketStatus.innerHTML = '<span class="status-dot"></span>Socket conectado';
  });

  socket.on('disconnect', () => {
    socketStatus.textContent = 'Socket desconectado';
  });

  socket.on('nuevo-evento', (evento) => {
    agregarNotificacion(evento);

    const config = entidades[entidadActual];
    if (evento.tipo === config.evento) {
      cargarRegistros();
    }
  });
}

async function logout() {
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  } finally {
    sessionStorage.clear();
    window.location.href = '/static/login.html';
  }
}

entityForm.addEventListener('submit', crearRegistro);
reloadBtn.addEventListener('click', cargarRegistros);
logoutBtn.addEventListener('click', logout);

renderMenu();
seleccionarEntidad(entidadActual);
iniciarSocket();
