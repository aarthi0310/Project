document.addEventListener('DOMContentLoaded', () => {
    const rechargeForm = document.getElementById('rechargeForm');
    const phoneInput = document.getElementById('phoneNumber');
    const phoneError = document.getElementById('phoneError');
    const urlParams = new URLSearchParams(window.location.search);
    
    // Load selected plan from URL parameters
    const planName = urlParams.get('planName') || 'Unknown Plan';
    const price = urlParams.get('price') || '0';
    const data = urlParams.get('data') || 'N/A';
    const validity = urlParams.get('validity') || 'N/A';

    const selectedPlanContainer = document.getElementById('selectedPlanContainer');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const selectedPlanPrice = document.getElementById('selectedPlanPrice');
    const selectedPlanData = document.getElementById('selectedPlanData');
    const selectedPlanValidity = document.getElementById('selectedPlanValidity');

    // Verify DOM elements and display selected plan
    if (selectedPlanContainer && selectedPlanName && selectedPlanPrice && selectedPlanData && selectedPlanValidity) {
        selectedPlanContainer.classList.remove('hidden');
        selectedPlanName.textContent = planName;
        selectedPlanPrice.textContent = `₹${price}`;
        selectedPlanData.textContent = data;
        selectedPlanValidity.textContent = validity;

        // Log to console for debugging
        console.log('Selected Plan Data:', { planName, price, data, validity });
    } else {
        console.error('One or more selected plan elements not found in DOM');
    }

    // Store plan in sessionStorage for later use
    const planData = { name: planName, price, data, validity };
    sessionStorage.setItem('selectedPlan', JSON.stringify(planData));

    // Real-time validation
    phoneInput.addEventListener('input', (e) => {
        const phoneNumber = e.target.value.trim();
        phoneError.classList.remove('show');
        
        if (!phoneNumber) {
            phoneError.textContent = 'Please enter your mobile number';
            phoneError.classList.add('show');
        } else if (!/^\d*$/.test(phoneNumber)) {
            phoneError.textContent = 'Please enter numbers only';
            phoneError.classList.add('show');
        } else if (phoneNumber.length === 10 && !/^\d{10}$/.test(phoneNumber)) {
            phoneError.textContent = 'Please enter a valid 10-digit mobile number';
            phoneError.classList.add('show');
        }
    });
    
    // Form submission
    rechargeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const phoneNumber = phoneInput.value.trim();
        
        if (!phoneNumber) {
            phoneError.textContent = 'Please enter your mobile number';
            phoneError.classList.add('show');
            return;
        }
        
        if (!/^\d{10}$/.test(phoneNumber)) {
            phoneError.textContent = 'Please enter a valid 10-digit mobile number';
            phoneError.classList.add('show');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:8081/api/users/validate-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const data = text ? JSON.parse(text) : { error: 'Unknown error' };
                    phoneError.textContent = data.error || 'Validation failed';
                    phoneError.classList.add('show');
                } catch (e) {
                    phoneError.textContent = 'Server error: Invalid response';
                    phoneError.classList.add('show');
                }
                return;
            }

            const responseData = await response.json(); // Rename to avoid confusion with urlParams.data
            phoneError.classList.remove('show');
            localStorage.setItem('userPhone', phoneNumber);
            const redirectUrl = `/customer/payment.html?planName=${encodeURIComponent(planName)}&price=${encodeURIComponent(price)}&data=${encodeURIComponent(data)}&validity=${encodeURIComponent(validity)}&phoneNumber=${encodeURIComponent(phoneNumber)}`;
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('Fetch error:', error);
            phoneError.textContent = 'An error occurred. Please try again.';
            phoneError.classList.add('show');
        }
    });
    
    // Mobile menu functionality
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
});