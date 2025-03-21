document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('adminLoginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const adminID = document.getElementById('adminID').value.trim();
        const password = document.getElementById('password').value.trim();
        const passwordError = document.getElementById('passwordError');
        const loginSuccess = document.getElementById('loginSuccess');

        passwordError.style.display = 'none';
        loginSuccess.style.display = 'none';

        if (!adminID || !password) {
            passwordError.textContent = 'Please enter both username and password';
            passwordError.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminName: adminID, password: password })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || 'Login failed');
            }

            loginSuccess.textContent = 'Login successful! Redirecting to Plans Management...';
            loginSuccess.style.display = 'block';
            setTimeout(() => window.location.href = '/admin/plansmanagement.html', 1500);
        } catch (error) {
            passwordError.textContent = error.message === 'Invalid credentials' ? 'Invalid username or password' : 'Failed to login: ' + error.message;
            passwordError.style.display = 'block';
        }
    });
});