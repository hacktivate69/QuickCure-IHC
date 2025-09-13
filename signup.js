document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupBtn = document.querySelector('.signup-btn');
    const userTypeSelect = document.getElementById('userType');
    const doctorFields = document.querySelector('.doctor-fields');

    // Show/hide doctor fields based on user type selection
    userTypeSelect.addEventListener('change', () => {
        if (userTypeSelect.value === 'doctor') {
            doctorFields.style.display = 'block';
            doctorFields.classList.remove('hidden');
            // Set required attributes for doctor fields
            document.getElementById('specialization').setAttribute('required', 'required');
            document.getElementById('experience').setAttribute('required', 'required');
            document.getElementById('license').setAttribute('required', 'required');
        } else {
            doctorFields.style.display = 'none';
            doctorFields.classList.add('hidden');
            // Remove required attributes and clear values
            const doctorInputs = ['specialization', 'experience', 'license'];
            doctorInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                input.removeAttribute('required');
                input.value = '';
                clearError({ target: input });
            });
        }
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePassword);
    });

    toggleConfirmPassword.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
    });

    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = button.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    }

    // Form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(signupForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            userType: formData.get('userType')
        };

        // Add doctor-specific fields if user type is doctor
        if (userData.userType === 'doctor') {
            userData.specialization = formData.get('specialization');
            userData.experience = formData.get('experience');
            userData.license = formData.get('license');
        }

        // Show loading state
        signupBtn.classList.add('loading');
        signupBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Hide loading state
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;

            // Simulate successful registration
            const userTypeText = userData.userType === 'doctor' ? 'Doctor' : 
                                 userData.userType === 'patient' ? 'Patient' : 'Administrator';
            showNotification(`${userTypeText} account created successfully! Please check your email for verification.`, 'success');

            // Redirect to signin after success
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
        }, 2000);
    });

    // Input validation
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearError);
    });

    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    function validateForm() {
        let isValid = true;
        
        // Validate all visible required inputs
        inputs.forEach(input => {
            if (input.hasAttribute('required') && input.offsetParent !== null) {
                if (!validateInput({ target: input })) {
                    isValid = false;
                }
            }
        });

        if (!validatePasswordMatch()) {
            isValid = false;
        }

        // Validate doctor fields if doctor is selected
        if (userTypeSelect.value === 'doctor') {
            if (!validateDoctorFields()) {
                isValid = false;
            }
        }

        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
            isValid = false;
        }

        return isValid;
    }

    function validateDoctorFields() {
        let isValid = true;
        const specialization = document.getElementById('specialization');
        const experience = document.getElementById('experience');
        const license = document.getElementById('license');

        // Validate specialization
        if (!specialization.value.trim()) {
            showInputError(specialization, 'Please enter your medical specialization(s)');
            isValid = false;
        } else if (specialization.value.trim().length < 3) {
            showInputError(specialization, 'Specialization must be at least 3 characters');
            isValid = false;
        }

        // Validate experience
        if (!experience.value.trim()) {
            showInputError(experience, 'Please enter your years of experience');
            isValid = false;
        } else {
            const expValue = parseInt(experience.value);
            if (isNaN(expValue) || expValue < 0 || expValue > 50) {
                showInputError(experience, 'Please enter experience between 0 and 50 years');
                isValid = false;
            }
        }

        // Validate license
        if (!license.value.trim()) {
            showInputError(license, 'Please enter your medical license number');
            isValid = false;
        } else if (license.value.trim().length < 5) {
            showInputError(license, 'License number must be at least 5 characters');
            isValid = false;
        }

        return isValid;
    }

    function validateInput(e) {
        const input = e.target;
        const value = input.value.trim();
        let isValid = true;

        // Required field validation
        if (input.hasAttribute('required') && !value) {
            showInputError(input, 'This field is required');
            isValid = false;
        }

        // Specific field validations
        switch (input.type) {
            case 'email':
                if (value && !isValidEmail(value)) {
                    showInputError(input, 'Please enter a valid email address');
                    isValid = false;
                }
                break;
            case 'tel':
                if (value && !isValidPhone(value)) {
                    showInputError(input, 'Please enter a valid phone number');
                    isValid = false;
                }
                break;
            case 'password':
                if (input.id === 'password') {
                    if (value && value.length < 8) {
                        showInputError(input, 'Password must be at least 8 characters');
                        isValid = false;
                    }
                    if (value && !isStrongPassword(value)) {
                        showInputError(input, 'Password must contain uppercase, lowercase, number and special character');
                        isValid = false;
                    }
                }
                break;
            case 'text':
                if (input.id === 'firstName' || input.id === 'lastName') {
                    if (value && value.length < 2) {
                        showInputError(input, 'Name must be at least 2 characters');
                        isValid = false;
                    }
                }
                break;
            case 'number':
                if (input.id === 'experience') {
                    const numValue = parseInt(value);
                    if (value && (isNaN(numValue) || numValue < 0 || numValue > 50)) {
                        showInputError(input, 'Please enter experience between 0 and 50 years');
                        isValid = false;
                    }
                }
                break;
        }

        return isValid;
    }

    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword && password !== confirmPassword) {
            showInputError(confirmPasswordInput, 'Passwords do not match');
            return false;
        }
        return true;
    }

    function showInputError(input, message) {
        clearError({ target: input });
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.parentNode.appendChild(errorDiv);
    }

    function clearError(e) {
        const input = e.target;
        input.classList.remove('error');
        const errorMessage = input.parentNode.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Validation helper functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    function isStrongPassword(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;
        return strongRegex.test(password);
    }

    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${message}</span>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
});
