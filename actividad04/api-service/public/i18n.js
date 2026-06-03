/* public/i18n.js */
/* Internacionalizacion espanol / ingles para StudySync */

(function () {
  const dicts = {
    es: {
      'app.nombre': 'StudySync',
      'app.tagline': 'Panel seguro con JWT',
      'nav.inicio': 'Inicio',
      'nav.miPerfil': 'Mi perfil',
      'nav.materias': 'Materias',
      'nav.grupos': 'Grupos',
      'nav.sesiones': 'Sesiones',
      'nav.recursos': 'Recursos',
      'nav.calendario': 'Calendario',
      'nav.volver': 'Volver',
      'nav.tema.oscuro': 'Tema oscuro',
      'nav.tema.claro': 'Tema claro',
      'comun.guardar': 'Guardar',
      'comun.cancelar': 'Cancelar',
      'comun.confirmar': 'Confirmar',
      'comun.cargando': 'Cargando...',
      'comun.error': 'Ocurrio un error',
      'comun.exito': 'Operacion exitosa',
      'comun.idioma': 'Idioma',
      'auth.email': 'Email',
      'auth.password': 'Contrasena',
      'auth.nombre': 'Nombre completo',
      'auth.rol': 'Rol',
      'auth.rol.estudiante': 'Estudiante',
      'auth.rol.organizador': 'Organizador',
      'auth.rol.docente': 'Docente',
      'auth.entrar': 'Ingresar',
      'auth.crear': 'Crear cuenta',
      'auth.sinCuenta': 'Sin cuenta?',
      'auth.yaCuenta': 'Ya tienes cuenta?',
      'auth.registrate': 'Registrate',
      'auth.iniciaSesion': 'Inicia sesion',
      'auth.emailPlaceholder': 'ana@upds.edu.bo',
      'auth.nombrePlaceholder': 'Ana Garcia',
      'auth.passwordPlaceholder': 'Minimo 6 caracteres',
      'crud.buscar': 'Buscar',
      'crud.filtrar': 'Filtrar',
      'crud.limpiar': 'Limpiar',
      'crud.registros': 'Registros',
      'crud.crear': 'Crear registro',
      'crud.actualizar': 'Actualizar lista',
      'crud.sinRegistros': 'No hay registros para mostrar.',
      'crud.cargando': 'Cargando datos...',
      'crud.anterior': 'Anterior',
      'crud.siguiente': 'Siguiente',
      'crud.pagina': 'Pagina',
      'crud.de': 'de',
      'crud.placeholder.nombre': 'Nombre',
      'crud.placeholder.codigo': 'Codigo',
      'crud.placeholder.docente': 'Docente',
      'crud.placeholder.semestre': 'Semestre',
      'crud.placeholder.titulo': 'Titulo',
      'crud.placeholder.descripcion': 'Descripcion',
      'crud.placeholder.url': 'https://...',
      'crud.placeholder.tipo': 'Tipo (pdf, video, link)',
      'crud.seleccionaMateria': 'Selecciona una materia',
      'crud.primeroCreaMateria': 'Primero crea una materia.',
      'crud.eliminar': 'Eliminar',
      'crud.confirmaEliminar': 'Eliminar registro ID {id}?',
      'crud.confirmaEliminarPerfil': 'Eliminar tu propia cuenta? Esta accion cerrara tu sesion.',
      'dashboard.titulo': 'Resumen',
      'dashboard.actualizar': 'Actualizar',
      'dashboard.proximasSesiones': 'Proximas sesiones',
      'dashboard.asistenciaPct': 'Asistencia',
      'dashboard.materias': 'Materias',
      'dashboard.sesiones': 'Sesiones totales',
      'dashboard.proximas': 'Proximas sesiones',
      'dashboard.recursos': 'Recursos recientes',
      'dashboard.sinProximas': 'No tienes sesiones proximas.',
      'dashboard.sinRecursos': 'Aun no hay recursos recientes.',
      'qr.titulo': 'QR de asistencia',
      'qr.descripcion': 'Generando codigo QR...',
      'qr.descripcionListo': 'Muestra este codigo para que los estudiantes registren su asistencia.',
      'qr.urlLabel': 'URL del QR',
      'qr.copiar': 'Copiar URL',
      'qr.copiado': 'Copiado',
      'qr.abrir': 'Abrir asistencia',
      'qr.sesion': 'Sesion',
      'qr.errorGenerar': 'No se pudo generar el QR.',
      'asistencia.titulo': 'Control de asistencia',
      'asistencia.subtitulo': 'Marca o desmarca tu asistencia con tu sesion autenticada.',
      'asistencia.cargando': 'Cargando sesion...',
      'asistencia.marcar': 'Marcar asistencia',
      'asistencia.desmarcar': 'Desmarcar asistencia',
      'asistencia.pendiente': 'Asistencia pendiente para {nombre}.',
      'asistencia.marcada': 'Asistencia marcada por {nombre}.',
      'asistencia.error': 'No se pudo cargar la asistencia.',
      'calendar.titulo': 'Calendario de sesiones',
      'calendar.sinEventos': 'No hay sesiones para mostrar.',
      'notif.titulo': 'Notificaciones en tiempo real',
      'notif.subtitulo': 'Eventos publicados por la API REST y retransmitidos con Redis Pub/Sub + Socket.io.',
      'notif.conectando': 'Conectando...',
      'notif.conectado': 'Conectado al servidor en tiempo real',
      'notif.desconectado': 'Desconectado',
      'notif.nombreUsuario': 'Ingresa tu nombre',
      'notif.nombrePlaceholder': 'Ejemplo: Dorian',
      'notif.entrar': 'Entrar al panel',
      'notif.usuarioConectado': 'Usuario conectado: {nombre}',
      'notif.placeholderVacio': 'Esperando eventos... crea una sesion, usuario, recurso o integrante.',
      'socket.conectado': 'Socket conectado',
      'socket.conectando': 'Conectando Socket.io',
      'socket.desconectado': 'Socket desconectado',
      'topbar.cerrarSesion': 'Cerrar sesion',
      'topbar.hola': 'Hola, {nombre}'
    },
    en: {
      'app.nombre': 'StudySync',
      'app.tagline': 'Secure panel with JWT',
      'nav.inicio': 'Home',
      'nav.miPerfil': 'My profile',
      'nav.materias': 'Subjects',
      'nav.grupos': 'Groups',
      'nav.sesiones': 'Sessions',
      'nav.recursos': 'Resources',
      'nav.calendario': 'Calendar',
      'nav.volver': 'Back',
      'nav.tema.oscuro': 'Dark theme',
      'nav.tema.claro': 'Light theme',
      'comun.guardar': 'Save',
      'comun.cancelar': 'Cancel',
      'comun.confirmar': 'Confirm',
      'comun.cargando': 'Loading...',
      'comun.error': 'An error occurred',
      'comun.exito': 'Success',
      'comun.idioma': 'Language',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.nombre': 'Full name',
      'auth.rol': 'Role',
      'auth.rol.estudiante': 'Student',
      'auth.rol.organizador': 'Organizer',
      'auth.rol.docente': 'Teacher',
      'auth.entrar': 'Sign in',
      'auth.crear': 'Create account',
      'auth.sinCuenta': "Don't have an account?",
      'auth.yaCuenta': 'Already have an account?',
      'auth.registrate': 'Sign up',
      'auth.iniciaSesion': 'Sign in',
      'auth.emailPlaceholder': 'ana@upds.edu.bo',
      'auth.nombrePlaceholder': 'Ana Garcia',
      'auth.passwordPlaceholder': 'At least 6 characters',
      'crud.buscar': 'Search',
      'crud.filtrar': 'Filter',
      'crud.limpiar': 'Clear',
      'crud.registros': 'Records',
      'crud.crear': 'Create record',
      'crud.actualizar': 'Refresh list',
      'crud.sinRegistros': 'No records to display.',
      'crud.cargando': 'Loading data...',
      'crud.anterior': 'Previous',
      'crud.siguiente': 'Next',
      'crud.pagina': 'Page',
      'crud.de': 'of',
      'crud.placeholder.nombre': 'Name',
      'crud.placeholder.codigo': 'Code',
      'crud.placeholder.docente': 'Teacher',
      'crud.placeholder.semestre': 'Semester',
      'crud.placeholder.titulo': 'Title',
      'crud.placeholder.descripcion': 'Description',
      'crud.placeholder.url': 'https://...',
      'crud.placeholder.tipo': 'Type (pdf, video, link)',
      'crud.seleccionaMateria': 'Select a subject',
      'crud.primeroCreaMateria': 'Create a subject first.',
      'crud.eliminar': 'Delete',
      'crud.confirmaEliminar': 'Delete record ID {id}?',
      'crud.confirmaEliminarPerfil': 'Delete your own account? This will log you out.',
      'dashboard.titulo': 'Overview',
      'dashboard.actualizar': 'Refresh',
      'dashboard.proximasSesiones': 'Upcoming sessions',
      'dashboard.asistenciaPct': 'Attendance',
      'dashboard.materias': 'Subjects',
      'dashboard.sesiones': 'Total sessions',
      'dashboard.proximas': 'Upcoming sessions',
      'dashboard.recursos': 'Recent resources',
      'dashboard.sinProximas': 'You have no upcoming sessions.',
      'dashboard.sinRecursos': 'No recent resources yet.',
      'qr.titulo': 'Attendance QR',
      'qr.descripcion': 'Generating QR code...',
      'qr.descripcionListo': 'Show this code so students can register their attendance.',
      'qr.urlLabel': 'QR URL',
      'qr.copiar': 'Copy URL',
      'qr.copiado': 'Copied',
      'qr.abrir': 'Open attendance',
      'qr.sesion': 'Session',
      'qr.errorGenerar': 'Could not generate the QR.',
      'asistencia.titulo': 'Attendance control',
      'asistencia.subtitulo': 'Mark or unmark your attendance with your authenticated session.',
      'asistencia.cargando': 'Loading session...',
      'asistencia.marcar': 'Mark attendance',
      'asistencia.desmarcar': 'Unmark attendance',
      'asistencia.pendiente': 'Attendance pending for {nombre}.',
      'asistencia.marcada': 'Attendance marked by {nombre}.',
      'asistencia.error': 'Could not load attendance.',
      'calendar.titulo': 'Session calendar',
      'calendar.sinEventos': 'No sessions to display.',
      'notif.titulo': 'Real-time notifications',
      'notif.subtitulo': 'Events published by the REST API and relayed via Redis Pub/Sub + Socket.io.',
      'notif.conectando': 'Connecting...',
      'notif.conectado': 'Connected to the real-time server',
      'notif.desconectado': 'Disconnected',
      'notif.nombreUsuario': 'Enter your name',
      'notif.nombrePlaceholder': 'Example: Dorian',
      'notif.entrar': 'Enter the panel',
      'notif.usuarioConectado': 'User connected: {nombre}',
      'notif.placeholderVacio': 'Waiting for events... create a session, user, resource or member.',
      'socket.conectado': 'Socket connected',
      'socket.conectando': 'Connecting Socket.io',
      'socket.desconectado': 'Socket disconnected',
      'topbar.cerrarSesion': 'Sign out',
      'topbar.hola': 'Hi, {nombre}'
    }
  };

  const initial = (localStorage.getItem('lang')
    || (navigator.language && navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'));
  let currentLang = dicts[initial] ? initial : 'es';

  function t(key, vars) {
    const value = (dicts[currentLang] && dicts[currentLang][key])
      || (dicts.es && dicts.es[key])
      || key;
    if (!vars) {
      return value;
    }
    return Object.keys(vars).reduce((acc, k) => acc.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]), value);
  }

  function applyTranslations(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });
  }

  function setLang(lang) {
    if (!dicts[lang]) {
      return;
    }
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function getLang() {
    return currentLang;
  }

  window.i18n = { t, setLang, getLang, applyTranslations };
})();
