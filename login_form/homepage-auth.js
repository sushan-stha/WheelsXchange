import { checkAuthState, logoutUser } from './authentication.js';

// Elements on the homepage
const welcomeMessage = document.getElementById('welcomeMessage');
const logoutBtn = document.getElementById('logoutBtn');

// Helper to find and toggle login/signup links in the nav
function toggleAuthLinks(showLogin) {
    // hide/show anchors that point to login/signup pages or have .login-btn class
    document.querySelectorAll('a[href*="login_form"]').forEach(a => {
        a.style.display = showLogin ? '' : 'none';
    });
    // also any element with class 'login-btn' in nav
    document.querySelectorAll('.nav .login-btn').forEach(el => {
        el.style.display = showLogin ? '' : 'none';
    });
}

function updateUIForUser(user) {
    if (user) {
        if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${user.email || user.displayName}`;
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        toggleAuthLinks(false);
    } else {
        if (welcomeMessage) welcomeMessage.textContent = 'Not signed in';
        if (logoutBtn) logoutBtn.style.display = 'none';
        toggleAuthLinks(true);
    }
}

// Attach logout handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            const result = await logoutUser();
            if (result.success) {
                // Optional: show a quick message and update UI
                updateUIForUser(null);
                // Redirect to homepage root to ensure UI refresh
                window.location.href = './index.html';
            } else {
                console.error('Logout failed:', result.error);
                alert('Logout failed. Try again.');
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    });
}

// Listen for auth state changes
checkAuthState((user) => {
    updateUIForUser(user);
});