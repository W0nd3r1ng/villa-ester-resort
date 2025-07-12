document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin') {
            loginError.textContent = '';
            window.location.href = 'admin.html';
        } else if (username === 'clerk' && password === 'clerk') {
            loginError.textContent = '';
            window.location.href = 'clerk.html';
        } else {
            loginError.textContent = 'Invalid username or password.';
        }
    });
}); 