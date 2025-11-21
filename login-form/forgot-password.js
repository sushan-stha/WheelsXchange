// forgot-password.js
document.addEventListener('DOMContentLoaded', function() {
    const forgotForm = document.getElementById('forgotForm');
    
    forgotForm.addEventListener('submit', handleForgotPassword);
});

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value.trim();
    
    if (!email) {
        showAlert('Please enter your email address', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.login-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html',
        });
        
        if (error) {
            throw error;
        }
        
        showAlert('Password reset link sent! Please check your email.', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        showAlert('Failed to send reset link: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
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
        default:
            alertDiv.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
    }
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (document.body.contains(alertDiv)) {
            document.body.removeChild(alertDiv);
        }
    }, 5000);
}