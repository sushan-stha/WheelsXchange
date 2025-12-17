// signup.js
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', handleSignup);
    
    // Add password toggle functionality
    initPasswordToggle();
});

async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    
    // Validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Show loading
    const submitBtn = document.querySelector('.login-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    try {
        // Sign up with Supabase
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin + '/login.html'
            }
        });
        
        if (error) {
            throw error;
        }
        
        // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            showAlert('This email is already registered. Please log in.', 'warning');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            showAlert('Account created! Please check your email to verify your account.', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        
        if (error.message.includes('already registered')) {
            showAlert('This email is already registered. Please log in.', 'warning');
        } else {
            showAlert('Signup failed: ' + error.message, 'error');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-notification';
    
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
    
    setTimeout(() => {
        alertDiv.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        alertDiv.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                document.body.removeChild(alertDiv);
            }
        }, 300);
    }, 5000);
}

function initPasswordToggle() {
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
}