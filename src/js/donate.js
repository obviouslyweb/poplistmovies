// Donate page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDonationForm();
});

function initializeDonationForm() {
    const form = document.getElementById('donation-form');
    const amountRadios = document.querySelectorAll('input[name="amount"]');
    const customAmountInput = document.getElementById('custom-amount-input');
    const customAmountDiv = document.querySelector('.custom-amount');
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const creditCardDetails = document.getElementById('credit-card-details');
    const alternativePayment = document.getElementById('alternative-payment');
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');

    // Handle amount selection
    amountRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'custom') {
                customAmountDiv.style.display = 'block';
                customAmountInput.required = true;
                customAmountInput.focus();
            } else {
                customAmountDiv.style.display = 'none';
                customAmountInput.required = false;
                customAmountInput.value = '';
            }
        });
    });

    // Handle payment method selection
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'credit-card') {
                creditCardDetails.style.display = 'block';
                alternativePayment.style.display = 'none';
                setCardFieldsRequired(true);
            } else {
                creditCardDetails.style.display = 'none';
                alternativePayment.style.display = 'block';
                setCardFieldsRequired(false);
            }
        });
    });

    // Format card number input
    cardNumberInput.addEventListener('input', function() {
        let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        this.value = formattedValue;
    });

    // Format expiry date input
    expiryDateInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        this.value = value;
    });

    // Only allow numbers for CVV
    cvvInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            processPayment();
        }
    });

    // Initialize with credit card selected
    creditCardDetails.style.display = 'block';
    alternativePayment.style.display = 'none';
    customAmountDiv.style.display = 'none';
}

function setCardFieldsRequired(required) {
    const cardFields = ['card-number', 'expiry-date', 'cvv', 'cardholder-name'];
    cardFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.required = required;
    });
}

function validateForm() {
    let isValid = true;
    const errors = [];

    // Validate donation amount
    const selectedAmount = document.querySelector('input[name="amount"]:checked');
    if (!selectedAmount) {
        errors.push('Please select a donation amount.');
        isValid = false;
    } else if (selectedAmount.value === 'custom') {
        const customAmount = document.getElementById('custom-amount-input').value;
        if (!customAmount || parseFloat(customAmount) < 1) {
            errors.push('Please enter a valid custom amount (minimum $1).');
            isValid = false;
        }
    }

    // Validate payment method specific fields
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedPaymentMethod && selectedPaymentMethod.value === 'credit-card') {
        // Validate card number (basic check)
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            errors.push('Please enter a valid card number.');
            isValid = false;
        }

        // Validate expiry date
        const expiryDate = document.getElementById('expiry-date').value;
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            errors.push('Please enter a valid expiry date (MM/YY).');
            isValid = false;
        } else {
            const [month, year] = expiryDate.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            
            if (parseInt(month) < 1 || parseInt(month) > 12) {
                errors.push('Please enter a valid month (01-12).');
                isValid = false;
            } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                errors.push('Card has expired. Please use a valid card.');
                isValid = false;
            }
        }

        // Validate CVV
        const cvv = document.getElementById('cvv').value;
        if (cvv.length < 3 || cvv.length > 4) {
            errors.push('Please enter a valid CVV.');
            isValid = false;
        }
    }

    // Show errors if any
    if (!isValid) {
        alert('Please correct the following errors:\n\n' + errors.join('\n'));
    }

    return isValid;
}

function processPayment() {
    // Show loading state
    const submitButton = document.querySelector('.donate-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;

    // Simulate payment processing
    setTimeout(() => {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        // Get donation details for display
        const selectedAmount = document.querySelector('input[name="amount"]:checked');
        let donationAmount;
        
        if (selectedAmount.value === 'custom') {
            donationAmount = parseFloat(document.getElementById('custom-amount-input').value);
        } else {
            donationAmount = parseFloat(selectedAmount.value);
        }

        const donorEmail = document.getElementById('email').value;

        // Show success modal
        showSuccessModal(donationAmount, donorEmail);

        // Reset form
        document.getElementById('donation-form').reset();
        
        // Reset custom amount visibility
        document.querySelector('.custom-amount').style.display = 'none';
        document.getElementById('custom-amount-input').required = false;

    }, 2000); // Simulate 2 second processing time
}

function showSuccessModal(amount, email) {
    const modal = document.getElementById('success-modal');
    const amountDisplay = document.getElementById('donation-amount-display');
    const emailDisplay = document.getElementById('donor-email-display');
    const closeButton = document.getElementById('success-close');

    // Update modal content
    amountDisplay.textContent = `$${amount.toFixed(2)}`;
    emailDisplay.textContent = email;

    // Show modal
    modal.classList.remove('hide-modal');
    modal.setAttribute('aria-hidden', 'false');

    // Focus on close button for accessibility
    closeButton.focus();

    // Handle close button
    closeButton.addEventListener('click', function() {
        modal.classList.add('hide-modal');
        modal.setAttribute('aria-hidden', 'true');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hide-modal');
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hide-modal')) {
            modal.classList.add('hide-modal');
            modal.setAttribute('aria-hidden', 'true');
        }
    });
}

// Auto-fill cardholder name from personal info
document.addEventListener('input', function(e) {
    if (e.target.id === 'first-name' || e.target.id === 'last-name') {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const cardholderName = document.getElementById('cardholder-name');
        
        if (firstName || lastName) {
            cardholderName.value = `${firstName} ${lastName}`.trim();
        }
    }
});
