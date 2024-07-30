document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          await loginUser(email, password);
      });
  }
});

// Fonction pour lire les cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Fonction pour vérifier la présence du jeton JWT
function checkJwtToken() {
  const token = getCookie('token');
  if (token) {
      console.log('JWT token found:', token);
  } else {
      console.log('JWT token not found');
  }
}

// Appeler cette fonction après une connexion réussie
async function loginUser(email, password) {
  const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  });

  if (response.ok) {
      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/`;
      checkJwtToken();
      window.location.href = 'index.html';
  } else {
      alert('Échec de la connexion : ' + response.statusText);
  }
}
