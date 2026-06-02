let token = sessionStorage.getItem('token');
const refreshToken = sessionStorage.getItem('refreshToken');

const params = new URLSearchParams(window.location.search);
const sesionId = params.get('sesionId');

const alerta = document.getElementById('alerta');
const descripcion = document.getElementById('descripcion');
const tituloSesion = document.getElementById('tituloSesion');
const detalleSesion = document.getElementById('detalleSesion');
const qrImage = document.getElementById('qrImage');
const asistenciaUrl = document.getElementById('asistenciaUrl');
const openAttendance = document.getElementById('openAttendance');
const copyBtn = document.getElementById('copyBtn');

if (!token) {
  sessionStorage.setItem('redirectAfterLogin', `${window.location.pathname}${window.location.search}`);
  window.location.href = '/static/login.html';
}

function mostrarError(mensaje) {
  alerta.innerHTML = `<div class="alert alert-danger">${mensaje}</div>`;
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

async function cargarQr() {
  if (!sesionId) {
    mostrarError('Falta el parametro sesionId.');
    return;
  }

  try {
    const res = await apiFetch(`/api/sesiones/${sesionId}/qr`);
    const data = await res.json();

    if (!res.ok) {
      mostrarError(data.error || 'No se pudo generar el QR.');
      return;
    }

    const sesion = data.sesion;
    tituloSesion.textContent = sesion.titulo;
    detalleSesion.textContent = `${sesion.fecha} ${sesion.hora} | ${sesion.modalidad} | ${sesion.materia?.nombre || 'Sin materia'}`;
    descripcion.textContent = 'Muestra este codigo para que los estudiantes registren su asistencia.';
    qrImage.src = data.qrDataUrl;
    qrImage.classList.remove('d-none');
    asistenciaUrl.value = data.asistenciaUrl;
    openAttendance.href = data.asistenciaUrl;
  } catch (error) {
    mostrarError('Error de conexion al generar QR.');
  }
}

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(asistenciaUrl.value);
  copyBtn.textContent = 'Copiado';
  setTimeout(() => {
    copyBtn.textContent = 'Copiar URL';
  }, 1200);
});

cargarQr();
