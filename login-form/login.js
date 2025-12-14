// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
});

// Initialize Login Form
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const signupLink = document.getElementById('signupLink');
    
    // Add event listeners
    loginForm.addEventListener('submit', handleLogin);
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
    signupLink.addEventListener('click', handleSignup);
    
    // Add input focus animations
    addInputAnimations();
}

// Handle Login Form Submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Basic validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (!Utils.isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) {
            throw error;
        }
        
        // Store remember me preference
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('autotrade_email', email);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('autotrade_email');
        }
        
        showAlert('Login successful! Welcome to WheelsXchange.', 'success');
        
        // Redirect after successful login
        setTimeout(() => {
    
            window.location.href = '../index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
            showAlert('Invalid email or password. Please try again.', 'error');
        } else if (error.message.includes('Email not confirmed')) {
            showAlert('Please verify your email before logging in.', 'warning');
        } else {
            showAlert('Login failed: ' + error.message, 'error');
        }
    } finally {
        hideLoadingState();
    }
}
//  Forgot Password
function handleForgotPassword(e) {
    e.preventDefault();
    window.location.href = "./forgot-password.html";
}

//  Signup
function handleSignup(e) {
    e.preventDefault();
    window.location.href = "./signup.html";
}

// Show Loading State
function showLoadingState() {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;
    
    const originalText = loginBtn.textContent;
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing In...';
    loginBtn.style.opacity = '0.7';
    loginBtn.style.cursor = 'not-allowed';
    
    // Store original text for restoration
    loginBtn.setAttribute('data-original-text', originalText);
}

// Hide Loading State
function hideLoadingState() {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;
    
    const originalText = loginBtn.getAttribute('data-original-text');
    
    loginBtn.disabled = false;
    loginBtn.textContent = originalText || 'Sign In to AutoTrade';
    loginBtn.style.opacity = '1';
    loginBtn.style.cursor = 'pointer';
}

// Show Alert Notification
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-notification';
    
    // Set alert styles
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background based on type
    switch(type) {
        case 'success':
            alertDiv.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            break;
        case 'error':
            alertDiv.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
            break;
        case 'warning':
            alertDiv.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
            break;
        default:
            alertDiv.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
    }
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    // Animate in
    setTimeout(() => {
        alertDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        alertDiv.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                document.body.removeChild(alertDiv);
            }
        }, 300);
    }, 3000);
}

// Add Input Focus Animations
function addInputAnimations() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
        
        // Add input validation styling
        input.addEventListener('input', function() {
            validateField(this);
        });
    });
}

// Validate Form Fields
function validateField(field) {
    const value = field.value.trim();
    
    // Remove previous validation classes
    field.classList.remove('valid', 'invalid');
    
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && emailRegex.test(value)) {
            field.classList.add('valid');
        } else if (value) {
            field.classList.add('invalid');
        }
    } else if (field.type === 'password') {
        if (value.length >= 6) {
            field.classList.add('valid');
        } else if (value) {
            field.classList.add('invalid');
        }
    }
}

// Form Validation Styles (applied via JS)
function addValidationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.valid {
            border-color: #4CAF50;
            background-color: #f8fff8;
        }
        
        .form-group input.invalid {
            border-color: #f44336;
            background-color: #fff8f8;
        }
        
        .form-group input.valid:focus {
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }
        
        .form-group input.invalid:focus {
            box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// Initialize validation styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addValidationStyles);

// Utility Functions
const Utils = {
    // Validate email format
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate password strength
    isValidPassword: function(password) {
        return password.length >= 6;
    },
    
    // Clear form fields
    clearForm: function() {
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        
        // Remove validation classes
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
    }
};

// Keyboard Navigation Support
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Enter key on form elements
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape key to clear alerts
        if (e.key === 'Escape') {
            const alerts = document.querySelectorAll('.alert-notification');
            alerts.forEach(alert => {
                alert.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(alert)) {
                        document.body.removeChild(alert);
                    }
                }, 300);
            });
        }
    });
}

// Auto-fill demo credentials function
function fillDemoCredentials() {
    document.getElementById('email').value = 'demo@autotrade.com';
    document.getElementById('password').value = 'demo123';
    
    // Trigger validation
    validateField(document.getElementById('email'));
    validateField(document.getElementById('password'));
    
    showAlert('Demo credentials filled! Click login to continue.', 'info');
}

// Add demo credentials button
function addDemoButton() {
    const demoInfo = document.querySelector('.demo-info');
    const demoButton = document.createElement('button');
    demoButton.textContent = 'Fill Demo Credentials';
    demoButton.type = 'button';
    demoButton.style.cssText = `
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        margin-top: 0.5rem;
        transition: all 0.3s ease;
    `;
    
    demoButton.addEventListener('click', fillDemoCredentials);
    demoButton.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });
    demoButton.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
    
    demoInfo.appendChild(demoButton);
}

// Password visibility toggle
function addPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const inputWrapper = passwordInput.parentElement;
    
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.innerHTML = '👁️';
    toggleButton.style.cssText = `
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        color: #666;
        transition: color 0.3s ease;
    `;
    
    toggleButton.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.innerHTML = type === 'password' ? '👁️' : '🙈';
    });
    
    inputWrapper.appendChild(toggleButton);
}

// Form persistence (remember form state)
function addFormPersistence() {
    const emailInput = document.getElementById('email');
    
    // Check if localStorage is available
    function isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }
    
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available. Form persistence disabled.');
        return;
    }
    
    // Load saved email on page load
    try {
        const savedEmail = localStorage.getItem('autotrade_email');
        if (savedEmail) {
            emailInput.value = savedEmail;
            validateField(emailInput);
        }
    } catch(e) {
        console.warn('Could not load saved email:', e);
    }
    
    // Save email when user types
    emailInput.addEventListener('input', function() {
        try {
            localStorage.setItem('autotrade_email', this.value);
        } catch(e) {
            console.warn('Could not save email:', e);
        }
    });
}

// Enhanced form validation with real-time feedback
function enhancedValidation() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Create validation message containers
    function createValidationMessage(input, message, type) {
        // Remove existing message
        const existingMessage = input.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'validation-message';
            messageDiv.textContent = message;
            messageDiv.style.cssText = `
                font-size: 0.8rem;
                margin-top: 0.25rem;
                color: ${type === 'error' ? '#f44336' : '#4CAF50'};
                transition: all 0.3s ease;
            `;
            input.parentElement.appendChild(messageDiv);
        }
    }
    
    // Email validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !Utils.isValidEmail(email)) {
            createValidationMessage(this, 'Please enter a valid email address', 'error');
        } else if (email) {
            createValidationMessage(this, 'Valid email address', 'success');
        }
    });
    
    // Password validation
    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password && password.length < 6) {
            createValidationMessage(this, 'Password must be at least 6 characters', 'error');
        } else if (password) {
            createValidationMessage(this, 'Password meets requirements', 'success');
        }
    });
    
    // Clear validation messages on focus
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            const message = this.parentElement.querySelector('.validation-message');
            if (message) {
                message.remove();
            }
        });
    });
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    addKeyboardNavigation();
    addDemoButton();
    addPasswordToggle();
    addFormPersistence();
    enhancedValidation();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleLogin,
        showAlert,
        Utils,
        fillDemoCredentials,
        addKeyboardNavigation
    };
}
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.toggle-password').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const input = btn.parentElement.querySelector('input[type="password"], input[type="text"]');
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        // Restore checkbox state
        rememberMe.checked = localStorage.getItem('rememberMe') === 'true';

        // Save state on change
        rememberMe.addEventListener('change', function() {
            localStorage.setItem('rememberMe', rememberMe.checked);
        });
    }
});