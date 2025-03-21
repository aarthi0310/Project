document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    setupMobileMenu();
    loadSelectedPlan();
    setupPaymentOptions();
});

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navLinks = document.getElementById('navLinks');

    if (!mobileMenuButton) {
        console.error('Mobile menu button not found');
        return;
    }
    if (!navLinks) {
        console.error('Nav links not found');
        return;
    }

    console.log('Mobile menu setup initialized');
    mobileMenuButton.addEventListener('click', () => {
        console.log('Mobile menu button clicked');
        navLinks.classList.toggle('show');
        console.log('Nav links classList:', navLinks.classList);
    });

    document.addEventListener('click', (event) => {
        if (!mobileMenuButton.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove('show');
            console.log('Mobile menu closed due to outside click');
        }
    });
}

function loadSelectedPlan() {
    const urlParams = new URLSearchParams(window.location.search);
    const planName = urlParams.get('planName') || 'Unknown Plan';
    const price = urlParams.get('price') || '0';
    const data = urlParams.get('data') || 'N/A';
    const validity = urlParams.get('validity') || 'N/A';

    const planData = { name: planName, price: price, data: data, validity: validity };
    sessionStorage.setItem('selectedPlan', JSON.stringify(planData));
    console.log('Selected Plan Stored:', planData);

    document.getElementById('selected-plan-name').textContent = planName;
    document.getElementById('selected-plan-price').textContent = `₹${price}`;
    document.getElementById('selected-plan-data').textContent = data;
    document.getElementById('selected-plan-validity').textContent = validity;
}

function setupPaymentOptions() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');

    if (!paymentOptions.length) {
        console.error('No payment options found');
        return;
    }
    if (!paymentForms.length) {
        console.error('No payment forms found');
        return;
    }

    console.log('Payment options setup initialized');

    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            console.log('Payment option clicked:', option.getAttribute('data-payment'));
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            const paymentMethod = option.getAttribute('data-payment');
            paymentForms.forEach(form => form.classList.remove('active'));
            const activeForm = document.getElementById(`${paymentMethod}Form`);
            if (activeForm) {
                activeForm.classList.add('active');
                console.log('Activated form:', paymentMethod);
            } else {
                console.error('Form not found for payment method:', paymentMethod);
            }
        });
    });

    document.getElementById('upiPaymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const upiId = document.getElementById('upiId').value.trim();
        const upiIdError = document.getElementById('upiIdError');
        console.log('UPI form submitted, UPI ID:', upiId);

        upiIdError.classList.add('hidden');
        if (!upiId) {
            upiIdError.textContent = 'UPI ID cannot be empty';
            upiIdError.classList.remove('hidden');
            return;
        }
        if (!upiId.includes('@')) {
            upiIdError.textContent = 'Please enter a valid UPI ID (e.g., username@upi)';
            upiIdError.classList.remove('hidden');
            return;
        }
        processPayment('UPI', { upiId });
    });

    document.getElementById('cardPaymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '').trim();
        const cardName = document.getElementById('cardName').value.trim();
        const expiryDate = document.getElementById('expiryDate').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        const cardNumberError = document.getElementById('cardNumberError');
        const cardNameError = document.getElementById('cardNameError');
        const expiryDateError = document.getElementById('expiryDateError');
        const cvvError = document.getElementById('cvvError');

        console.log('Card form submitted:', { cardNumber, cardName, expiryDate, cvv });

        cardNumberError.classList.add('hidden');
        cardNameError.classList.add('hidden');
        expiryDateError.classList.add('hidden');
        cvvError.classList.add('hidden');

        let hasError = false;
        if (!cardNumber) {
            cardNumberError.textContent = 'Card number cannot be empty';
            cardNumberError.classList.remove('hidden');
            hasError = true;
        } else if (!/^\d{16}$/.test(cardNumber)) {
            cardNumberError.textContent = 'Please enter a valid 16-digit card number';
            cardNumberError.classList.remove('hidden');
            hasError = true;
        }
        if (!cardName) {
            cardNameError.textContent = 'Name on card cannot be empty';
            cardNameError.classList.remove('hidden');
            hasError = true;
        }
        if (!expiryDate) {
            expiryDateError.textContent = 'Expiry date cannot be empty';
            expiryDateError.classList.remove('hidden');
            hasError = true;
        } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            expiryDateError.textContent = 'Please enter a valid expiry date (MM/YY)';
            expiryDateError.classList.remove('hidden');
            hasError = true;
        }
        if (!cvv) {
            cvvError.textContent = 'CVV cannot be empty';
            cvvError.classList.remove('hidden');
            hasError = true;
        } else if (!/^\d{3}$/.test(cvv)) {
            cvvError.textContent = 'Please enter a valid 3-digit CVV';
            cvvError.classList.remove('hidden');
            hasError = true;
        }

        if (hasError) return;
        processPayment('Card', { cardNumber, cardName, expiryDate, cvv });
    });

    document.getElementById('netBankingPaymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const bankName = document.getElementById('bankName').value;
        const bankNameError = document.getElementById('bankNameError');
        console.log('Net Banking form submitted, Bank:', bankName);

        bankNameError.classList.add('hidden');
        if (!bankName) {
            bankNameError.textContent = 'Please select a bank';
            bankNameError.classList.remove('hidden');
            return;
        }
        processPayment('Net Banking', { bankName });
    });

    function processPayment(method, paymentDetails) {
        // Get phone number from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const phoneNumber = urlParams.get('phoneNumber') || localStorage.getItem('userPhone');
        const email = null; // Optional field, add input if needed

        if (!phoneNumber) {
            console.error('No phone number found in URL or localStorage');
            document.querySelector('.payment-form.active')?.insertAdjacentHTML(
                'beforeend',
                `<p class="text-red-500 text-sm mt-2">Please enter your phone number on the home page first.</p>`
            );
            return;
        }

        console.log('Processing payment with method:', method, 'Phone:', phoneNumber);

        const plan = JSON.parse(sessionStorage.getItem('selectedPlan'));
        if (!plan) {
            console.error('No plan selected');
            window.location.href = '/customer/plans.html';
            return;
        }

        const paymentRequest = {
            phoneNumber: phoneNumber,
            planName: plan.name,
            amount: parseFloat(plan.price),
            paymentMethod: method,
            transactionId: 'TX' + Date.now(),
            validity: plan.validity,
            email: email,
            paymentDetails: paymentDetails
        };

        console.log('Payment request:', paymentRequest);

        fetch('http://localhost:8081/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentRequest)
        })
        .then(response => {
            console.log('Fetch response status:', response.status);
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Payment failed'); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Payment response:', data);
            const paymentInfo = {
                planName: paymentRequest.planName,
                amount: paymentRequest.amount,
                method: paymentRequest.paymentMethod,
                transactionId: paymentRequest.transactionId,
                date: new Date().toLocaleString(),
                validity: paymentRequest.validity,
                phoneNumber: paymentRequest.phoneNumber
            };
            sessionStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
            console.log('Payment Info Stored:', paymentInfo);

            const urlParams = new URLSearchParams(paymentInfo).toString();
            window.location.href = `/customer/paymentconformation.html?${urlParams}`;
        })
        .catch(error => {
            console.error('Payment error:', error.message);
            document.querySelector('.payment-form.active')?.insertAdjacentHTML(
                'beforeend',
                `<p class="text-red-500 text-sm mt-2">${error.message}</p>`
            );
        });
    }
}