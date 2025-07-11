document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const uploadForm = document.getElementById('uploadForm');
  const loginMessage = document.getElementById('loginMessage');
  const uploadMessage = document.getElementById('uploadMessage');
  let token = null;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      token = data.token;
      loginMessage.textContent = 'Login successful!';
      loginMessage.style.color = 'green';
    } else {
      loginMessage.textContent = data.message;
      loginMessage.style.color = 'red';
    }
  });

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) {
      uploadMessage.textContent = 'Please login first.';
      uploadMessage.style.color = 'red';
      return;
    }

    const formData = new FormData(uploadForm);
    const file = formData.get('file');

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      uploadMessage.textContent = data.message;
      uploadMessage.style.color = 'green';
    } else {
      uploadMessage.textContent = data.message;
      uploadMessage.style.color = 'red';
    }
  });
});
