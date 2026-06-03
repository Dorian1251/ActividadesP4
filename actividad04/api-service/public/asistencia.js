/* public/asistencia.js */

let token = sessionStorage.getItem('token');
const refreshToken = sessionStorage.getItem('refreshToken');
const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');

const params = new URLSearchParams(window.location.search);
const sesionId = params.get('sesionId');
const codigo = params.get('codigo');

const alerta = document.getElementById('alerta');
const tituloSesion = document.getElementById('tituloSesion');
const detalleSesion = document.getElementById('detalleSesion');
const toggleBtn = document.getElementById('toggleBtn');
const estado = document.getElementById('estado');

let marcada = false;
let intentoAutoMarcado = false;

i18n.applyTranslations();

if (!token || !usuario) {
  sessionStorage.setItem('redirectAfterLogin', `${window.location.pathname}${window.location.search}`);
  window.location.href = '/static/login.html';
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

async function apiFetch(url, options) {
  options = options || {};
  const headers = Object.assign({}, options.headers || {}, { Authorization: 'Bearer ' + token });
  let res = await fetch(url, Object.assign({}, options, { headers }));
  if (res.status === 401 && await renovarToken()) {
    headers.Authorization = 'Bearer ' + token;
    res = await fetch(url, Object.assign({}, options, { headers }));
  }
  if (res.status === 401) {
    sessionStorage.setItem('redirectAfterLogin', `${window.location.pathname}${window.location.search}`);
    sessionStorage.removeItem('token');
    window.location.href = '/static/login.html';
  }
  return res;
}

function actualizarBoton() {
  toggleBtn.disabled = false;
  if (marcada) {
    toggleBtn.innerHTML = `<i class="bi bi-x-square me-1"></i>${i18n.t('asistencia.desmarcar')}`;
    toggleBtn.className = 'btn btn-warning btn-lg w-100 w-md-auto';
    estado.textContent = i18n.t('asistencia.marcada', { nombre: usuario.nombre });
    return;
  }
  toggleBtn.innerHTML = `<i class="bi bi-check2-square me-1"></i>${i18n.t('asistencia.marcar')}`;
  toggleBtn.className = 'btn btn-success btn-lg w-100 w-md-auto';
  estado.textContent = i18n.t('asistencia.pendiente', { nombre: usuario.nombre });
}

async function cargarEstado() {
  if (!sesionId) {
    ui.toast('Falta el parametro sesionId.', 'danger');
    return;
  }
  try {
    const res = await apiFetch(`/api/sesiones/${sesionId}/asistencia/mia`);
    const data = await res.json();
    if (!res.ok) {
      ui.toast(data.error || i18n.t('asistencia.error'), 'danger');
      return;
    }
    marcada = data.marcada;
    tituloSesion.textContent = data.sesion.titulo;
    detalleSesion.textContent = `${data.sesion.fecha} ${data.sesion.hora} | ${data.sesion.modalidad} | ${data.sesion.materia?.nombre || 'Sin materia'}`;
    actualizarBoton();
    if (!marcada && codigo && !intentoAutoMarcado) {
      intentoAutoMarcado = true;
      await marcar();
    }
  } catch (error) {
    ui.toast(i18n.t('asistencia.error'), 'danger');
  }
}

async function marcar() {
  if (!codigo) {
    ui.toast('Falta el codigo QR. Abre esta pagina desde el QR generado por la sesion.', 'warning');
    return;
  }
  const res = await apiFetch(`/api/sesiones/${sesionId}/asistencia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo })
  });
  const data = await res.json();
  if (!res.ok) {
    ui.toast(data.error || 'No se pudo marcar asistencia.', 'danger');
    return;
  }
  marcada = true;
  ui.toast(data.mensaje || i18n.t('comun.exito'), 'success');
  actualizarBoton();
}

async function desmarcar() {
  const res = await apiFetch(`/api/sesiones/${sesionId}/asistencia`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    ui.toast(data.error || 'No se pudo desmarcar asistencia.', 'danger');
    return;
  }
  marcada = false;
  ui.toast(data.mensaje || i18n.t('comun.exito'), 'success');
  actualizarBoton();
}

toggleBtn.addEventListener('click', async () => {
  ui.setLoading(toggleBtn, true);
  try {
    if (marcada) {
      await desmarcar();
    } else {
      await marcar();
    }
  } finally {
    ui.setLoading(toggleBtn, false);
  }
});

cargarEstado();
