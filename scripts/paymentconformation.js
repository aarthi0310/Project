document.addEventListener('DOMContentLoaded', function () {
    console.log('Payment Confirmation Page Loaded');
    loadPaymentDetails();
    setupMobileMenu();
});

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navLinks = document.getElementById('navLinks');

    if (!mobileMenuButton || !navLinks) return;

    mobileMenuButton.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!mobileMenuButton.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove('show');
        }
    });
}

function loadPaymentDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentInfo = JSON.parse(sessionStorage.getItem('paymentInfo')) || {};

    // Use URL parameters if available, fallback to sessionStorage
    const phoneNumber = urlParams.get('phoneNumber') || paymentInfo.phoneNumber || 'N/A';
    const planName = urlParams.get('planName') || paymentInfo.planName || 'N/A';
    const amount = urlParams.get('amount') || paymentInfo.amount || '0';
    const paymentMethod = urlParams.get('method') || paymentInfo.method || 'N/A';
    const transactionId = urlParams.get('transactionId') || paymentInfo.transactionId || 'N/A';
    const dateTime = urlParams.get('date') || paymentInfo.date || 'N/A';
    const validity = urlParams.get('validity') || paymentInfo.validity || 'N/A';

    console.log('Payment Details:', { phoneNumber, planName, amount, paymentMethod, transactionId, dateTime, validity });

    // Update the DOM with payment details
    document.getElementById('confirmPhoneNumber').textContent = phoneNumber;
    document.getElementById('confirmPlanName').textContent = planName;
    document.getElementById('confirmAmount').textContent = `₹${amount}`;
    document.getElementById('confirmPaymentMethod').textContent = paymentMethod; // Displays Card, Netbanking, etc.
    document.getElementById('confirmTransactionId').textContent = transactionId;
    document.getElementById('confirmDateTime').textContent = dateTime;
    document.getElementById('confirmValidity').textContent = validity;

    // Store in sessionStorage for PDF generation
    sessionStorage.setItem('paymentInfo', JSON.stringify({
        phoneNumber,
        planName,
        amount,
        method: paymentMethod,
        transactionId,
        date: dateTime,
        validity
    }));
}

function downloadPDFReceipt() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const paymentInfo = JSON.parse(sessionStorage.getItem('paymentInfo')) || {};

    doc.setFontSize(18);
    doc.text('Mobi-Comm Recharge Receipt', 20, 20);

    doc.setFontSize(12);
    doc.text(`Phone Number: ${paymentInfo.phoneNumber || 'N/A'}`, 20, 40);
    doc.text(`Plan Name: ${paymentInfo.planName || 'N/A'}`, 20, 50);
    doc.text(`Amount: ₹${paymentInfo.amount || '0'}`, 20, 60);
    doc.text(`Payment Method: ${paymentInfo.method || 'N/A'}`, 20, 70);
    doc.text(`Transaction ID: ${paymentInfo.transactionId || 'N/A'}`, 20, 80);
    doc.text(`Date & Time: ${paymentInfo.date || 'N/A'}`, 20, 90);
    doc.text(`Validity: ${paymentInfo.validity || 'N/A'}`, 20, 100);

    doc.save('mobi-comm-recharge-receipt.pdf');
}