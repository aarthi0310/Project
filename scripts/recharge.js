document.addEventListener('DOMContentLoaded', () => {
    // Recharge form validation
    const rechargeForm = document.getElementById('rechargeForm');
    const phoneInput = document.getElementById('phoneNumber');
    const phoneError = document.getElementById('phoneError');

    if (!rechargeForm || !phoneInput || !phoneError) {
        console.error('Required DOM elements not found');
        return;
    }

    // Real-time validation
    phoneInput.addEventListener('input', (e) => {
        const phoneNumber = e.target.value.trim().replace(/^\+91\s*/, ''); // Remove +91 and space
        phoneError.classList.remove('show');

        if (phoneNumber.length > 0 && !/^\d*$/.test(phoneNumber)) {
            phoneError.textContent = 'Please enter numbers only';
            phoneError.classList.add('show');
        } else if (phoneNumber.length === 10 && !/^\d{10}$/.test(phoneNumber)) {
            phoneError.textContent = 'Please enter a valid 10-digit number';
            phoneError.classList.add('show');
        } else if (phoneNumber.length > 0 && phoneNumber.length < 10) {
            phoneError.textContent = 'Please enter a 10-digit number';
            phoneError.classList.add('show');
        }
    });

    rechargeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fullPhoneNumber = phoneInput.value.trim();
        const phoneNumber = fullPhoneNumber.replace(/^\+91\s*/, ''); // Remove +91 and space

        if (!/^\d{10}$/.test(phoneNumber)) {
            phoneError.textContent = 'Please enter a valid 10-digit mobile number';
            phoneError.classList.add('show');
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/users/validate-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: fullPhoneNumber }) // Send full number including +91
            });

            const data = await response.json();

            if (response.ok) {
                phoneError.classList.remove('show');
                localStorage.setItem('userPhone', fullPhoneNumber);
                window.location.href = data.redirectUrl || '/customer/payment.html';
            } else {
                phoneError.textContent = data.error || 'Validation failed';
                phoneError.classList.add('show');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            if (error instanceof SyntaxError) {
                phoneError.textContent = 'Server returned an invalid response. Please try again.';
            } else {
                phoneError.textContent = 'An error occurred. Please try again.';
            }
            phoneError.classList.add('show');
        }
    });

    // Account dropdown functionality
    const accountDropdownButton = document.getElementById('accountDropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (accountDropdownButton && dropdownMenu) {
        accountDropdownButton.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
        });

        window.addEventListener('click', (e) => {
            if (!accountDropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });
    }

    // Mobile menu functionality
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
});