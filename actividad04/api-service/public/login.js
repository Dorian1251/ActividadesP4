const loginBtn = document.getElementById('loginBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const alerta = document.getElementById('alerta');

async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alerta.innerHTML = '<div class="alert alert-error">Ingresa email y contrasena</div>';
    return;
  }

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      alerta.innerHTML = `<div class="alert alert-error">${data.error || 'Credenciales invalidas'}</div>`;
      return;
    }

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

    const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin') || '/static/index.html';
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectAfterLogin;
  } catch (error) {
    alerta.innerHTML = '<div class="alert alert-error">Error de conexion</div>';
  }
}

loginBtn.addEventListener('click', login);
passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    login();
  }
});
