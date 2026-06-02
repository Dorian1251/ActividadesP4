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

if (!token || !usuario) {
  sessionStorage.setItem('redirectAfterLogin', `${window.location.pathname}${window.location.search}`);
  window.location.href = '/static/login.html';
}

function mostrarAlerta(mensaje, tipo = 'danger') {
  alerta.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
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

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && await renovarToken()) {
    headers.Authorization = `Bearer ${token}`;
    res = await fetch(url, { ...options, headers });
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
    toggleBtn.textContent = 'Desmarcar asistencia';
    toggleBtn.className = 'btn btn-warning';
    estado.textContent = `Asistencia marcada por ${usuario.nombre}.`;
    return;
  }

  toggleBtn.textContent = 'Marcar asistencia';
  toggleBtn.className = 'btn btn-success';
  estado.textContent = `Asistencia pendiente para ${usuario.nombre}.`;
}

async function cargarEstado() {
  if (!sesionId) {
    mostrarAlerta('Falta el parametro sesionId.');
    return;
  }

  try {
    const res = await apiFetch(`/api/sesiones/${sesionId}/asistencia/mia`);
    const data = await res.json();

    if (!res.ok) {
      mostrarAlerta(data.error || 'No se pudo cargar la asistencia.');
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
    mostrarAlerta('Error de conexion al cargar asistencia.');
  }
}

async function marcar() {
  if (!codigo) {
    mostrarAlerta('Falta el codigo QR. Abre esta pagina desde el QR generado por la sesion.');
    return;
  }

  const res = await apiFetch(`/api/sesiones/${sesionId}/asistencia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo })
  });
  const data = await res.json();

  if (!res.ok) {
    mostrarAlerta(data.error || 'No se pudo marcar asistencia.');
    return;
  }

  marcada = true;
  mostrarAlerta(data.mensaje || 'Asistencia marcada.', 'success');
  actualizarBoton();
}

async function desmarcar() {
  const res = await apiFetch(`/api/sesiones/${sesionId}/asistencia`, {
    method: 'DELETE'
  });
  const data = await res.json();

  if (!res.ok) {
    mostrarAlerta(data.error || 'No se pudo desmarcar asistencia.');
    return;
  }

  marcada = false;
  mostrarAlerta(data.mensaje || 'Asistencia desmarcada.', 'success');
  actualizarBoton();
}

toggleBtn.addEventListener('click', async () => {
  toggleBtn.disabled = true;

  try {
    if (marcada) {
      await desmarcar();
    } else {
      await marcar();
    }
  } finally {
    toggleBtn.disabled = false;
  }
});

cargarEstado();
