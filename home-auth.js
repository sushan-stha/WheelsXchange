document.addEventListener('DOMContentLoaded', async function() {
    // Reference the global client created in supabase-config.js
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error("Supabase client not found! Ensure supabase-config.js is loaded first.");
        return;
    }

    await checkUserAuth(supabase);
});

async function checkUserAuth(supabase) {
    console.log('checkUserAuth called');
    console.log('Supabase object:', supabase);
    
    try {
        // Get current user session using the passed supabase instance
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error checking auth:', error);
            return;
        }
        
        if (session && session.user) {
            // User is logged in
            updateNavbarForLoggedInUser(session.user);
        } else {
            // User is not logged in
            updateNavbarForLoggedOutUser();
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

function updateNavbarForLoggedInUser(user) {
    const loginItem = document.querySelector('.menu .login-item');
    
    if (!loginItem) {
        console.error('Login item not found');
        return;
    }
    
    const userEmail = user.email;
    const userName = userEmail.split('@')[0];
    
    loginItem.innerHTML = `
        <div class="user-profile-dropdown">
            <div class="user-profile-btn">
                <div class="user-avatar">${userName.charAt(0).toUpperCase()}</div>
                <span class="user-email">${userName}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <ul class="user-dropdown-menu">
                <li><a href="#" onclick="handleLogout(event)"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
        </div>
    `;
    
    addUserProfileStyles();
}

function updateNavbarForLoggedOutUser() {
    // Keep default login button
}

async function handleLogout(e) {
    e.preventDefault();
    const supabase = window.supabaseClient;
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        showAlert('Logged out successfully!', 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('Logout failed: ' + error.message, 'error');
    }
}

// Function to inject CSS for the profile dropdown
function addUserProfileStyles() {
    if (document.getElementById('user-profile-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'user-profile-styles';
    style.textContent = `
        .user-profile-dropdown { position: relative; }
        .user-profile-dropdown::after { content: ''; position: absolute; top: 100%; left: 0; right: 0; height: 10px; }
        .menu > .login-item { position: relative; }
        .menu > .login-item .user-profile-dropdown { display: flex; align-items: center; }
        .user-profile-btn { display: flex; align-items: center; gap: 2px; padding: 1px 1px; background: rgba(255, 255, 255, 0.2); border-radius: 25px; cursor: pointer; transition: all 0.3s; border: 2px solid white; }
        .user-profile-btn:hover { background: white; color: #e47e08; }
        .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: white; color: #ff6b35; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; flex-shrink: 0; }
        .user-email { color: white; font-size: 0.9rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-profile-btn:hover .user-email { color: #e47e08; }
        .user-dropdown-menu { display: none; position: absolute; top: 105%; right: 0; background: white; min-width: 160px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); border-radius: 5px; z-index: 1000; list-style: none; padding: 0; }
        .user-profile-dropdown:hover .user-dropdown-menu { display: block; }
        .user-dropdown-menu li a { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; color: #333; text-decoration: none; font-size: 0.95rem; }
        .user-dropdown-menu li a:hover { background: #f8f9fa; color: #ff6b35; }
    `;
    document.head.appendChild(style);
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-notification';
    alertDiv.style.cssText = `
        position: fixed; top: 90px; right: 20px; padding: 1rem 1.5rem; border-radius: 8px; color: white; z-index: 10000;
        font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.1); transform: translateX(400px); transition: transform 0.3s ease;
    `;
    
    if (type === 'success') alertDiv.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    else if (type === 'error') alertDiv.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
    else alertDiv.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        alertDiv.style.transform = 'translateX(400px)';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Make handleLogout available globally for the onclick attribute
window.handleLogout = handleLogout;