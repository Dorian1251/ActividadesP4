const registerBtn = document.getElementById('registerBtn');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rolInput = document.getElementById('rol');
const alerta = document.getElementById('alerta');

async function registrar() {
  const nombre = nombreInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const rol = rolInput.value;

  if (!nombre || !email || !password || !rol) {
    alerta.innerHTML = '<div class="alert alert-error">Completa todos los campos</div>';
    return;
  }

  if (password.length < 6) {
    alerta.innerHTML = '<div class="alert alert-error">La contrasena debe tener al menos 6 caracteres</div>';
    return;
  }

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, rol })
    });
    const data = await res.json();

    if (!res.ok) {
      alerta.innerHTML = `<div class="alert alert-error">${data.error || 'No se pudo crear la cuenta'}</div>`;
      return;
    }

    alerta.innerHTML = '<div class="alert alert-success">Cuenta creada. Redirigiendo...</div>';
    setTimeout(() => {
      window.location.href = '/static/login.html';
    }, 1500);
  } catch (error) {
    alerta.innerHTML = '<div class="alert alert-error">Error de conexion con el servidor</div>';
  }
}

registerBtn.addEventListener('click', registrar);
passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    registrar();
  }
});
