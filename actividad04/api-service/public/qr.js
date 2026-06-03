/* public/qr.js */

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

i18n.applyTranslations();

if (!token) {
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

async function cargarQr() {
  if (!sesionId) {
    ui.toast('Falta el parametro sesionId.', 'danger');
    return;
  }

  ui.setLoading(copyBtn, true);
  try {
    const res = await apiFetch(`/api/sesiones/${sesionId}/qr`);
    const data = await res.json();

    if (!res.ok) {
      ui.toast(data.error || i18n.t('qr.errorGenerar'), 'danger');
      return;
    }

    const sesion = data.sesion;
    tituloSesion.textContent = sesion.titulo;
    detalleSesion.textContent = `${sesion.fecha} ${sesion.hora} | ${sesion.modalidad} | ${sesion.materia?.nombre || 'Sin materia'}`;
    descripcion.textContent = i18n.t('qr.descripcionListo');
    qrImage.src = data.qrDataUrl;
    qrImage.classList.remove('d-none');
    asistenciaUrl.value = data.asistenciaUrl;
    openAttendance.href = data.asistenciaUrl;
  } catch (error) {
    ui.toast(i18n.t('qr.errorGenerar'), 'danger');
  } finally {
    ui.setLoading(copyBtn, false);
  }
}

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(asistenciaUrl.value);
    copyBtn.innerHTML = `<i class="bi bi-check2 me-1"></i>${i18n.t('qr.copiado')}`;
    setTimeout(() => {
      copyBtn.innerHTML = `<i class="bi bi-clipboard me-1"></i>${i18n.t('qr.copiar')}`;
    }, 1500);
  } catch (e) {
    ui.toast('No se pudo copiar', 'danger');
  }
});

cargarQr();
