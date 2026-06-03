/* public/calendar.js */
/* Calendario visual de sesiones con FullCalendar */

let token = sessionStorage.getItem('token');
const refreshToken = sessionStorage.getItem('refreshToken');

const langSwitcher = document.getElementById('langSwitcher');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function aplicarTema(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun';
  }
}

aplicarTema(localStorage.getItem('theme') || 'dark');
if (langSwitcher) {
  langSwitcher.value = i18n.getLang();
  langSwitcher.addEventListener('change', (e) => {
    i18n.setLang(e.target.value);
    if (calendar) {
      calendar.setOption('locale', i18n.getLang());
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

i18n.applyTranslations();

if (!token) {
  sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
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
  return res;
}

const colorPorMateria = (() => {
  const paleta = ['#0969da', '#1a7f37', '#cf222e', '#9a6700', '#8250df', '#bf3989', '#0a3069', '#116329'];
  const map = new Map();
  return (id) => {
    if (id === null || id === undefined) {
      return paleta[0];
    }
    if (!map.has(id)) {
      map.set(id, paleta[map.size % paleta.length]);
    }
    return map.get(id);
  };
})();

const calendarEl = document.getElementById('calendar');
let calendar = null;

calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'dayGridMonth',
  locale: i18n.getLang(),
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek'
  },
  buttonText: {
    today: i18n.t('notif.entrar') ? 'Hoy' : 'Today',
    month: i18n.getLang() === 'en' ? 'Month' : 'Mes',
    week: i18n.getLang() === 'en' ? 'Week' : 'Semana',
    list: i18n.getLang() === 'en' ? 'List' : 'Lista'
  },
  height: 'auto',
  events: async (info, success, failure) => {
    try {
      const desde = info.startStr.slice(0, 10);
      const hasta = info.endStr.slice(0, 10);
      const res = await apiFetch(`/api/sesiones?fechaDesde=${desde}&fechaHasta=${hasta}&limit=500`);
      if (!res.ok) {
        failure(new Error('Error al cargar sesiones'));
        return;
      }
      const data = await res.json();
      success(data.map((s) => ({
        id: s.id,
        title: s.titulo,
        start: `${s.fecha}T${s.hora}`,
        backgroundColor: colorPorMateria(s.materiaId),
        borderColor: colorPorMateria(s.materiaId),
        extendedProps: {
          modalidad: s.modalidad,
          materia: s.materia?.nombre
        }
      })));
    } catch (e) {
      failure(e);
    }
  },
  eventClick: (info) => {
    window.location.href = `/static/qr.html?sesionId=${info.event.id}`;
  },
  noEventsContent: {
    html: `<div class="text-muted-custom">${i18n.t('calendar.sinEventos')}</div>`
  }
});
calendar.render();
