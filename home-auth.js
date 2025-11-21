// home-auth.js
document.addEventListener('DOMContentLoaded', async function() {
    await checkUserAuth();
});

async function checkUserAuth() {
    try {
        // Get current user session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error checking auth:', error);
            return;
        }
        
        if (session && session.user) {
            // User is logged in
            updateNavbarForLoggedInUser(session.user);
        } else {
            // User is not logged in - show normal login button
            updateNavbarForLoggedOutUser();
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

function updateNavbarForLoggedInUser(user) {
    // Find the login button list item
    const loginItem = document.querySelector('.menu li:last-child');
    
    if (!loginItem) return;
    
    // Get user email
    const userEmail = user.email;
    
    // Create user profile dropdown
    loginItem.innerHTML = `
        <div class="user-profile-dropdown">
            <div class="user-profile-btn">
                <div class="user-avatar">${userEmail.charAt(0).toUpperCase()}</div>
                <span class="user-email">${userEmail}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <ul class="user-dropdown-menu">
                <li><a href="#" onclick="handleLogout(event)"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
        </div>
    `;
    
    // Add styles dynamically
    addUserProfileStyles();
}

function updateNavbarForLoggedOutUser() {
    // Keep the default login button (do nothing)
}

async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Show success message
        showAlert('Logged out successfully!', 'success');
        
        // Reload page to show login button again
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('Logout failed: ' + error.message, 'error');
    }
}

function addUserProfileStyles() {
    // Check if styles already added
    if (document.getElementById('user-profile-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'user-profile-styles';
    style.textContent = `
        .user-profile-dropdown {
            position: relative;
        }
        
        .user-profile-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid white;
        }
        
        .user-profile-btn:hover {
            background: white;
            color: #e47e08;
        }
        
        .user-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: white;
            color: #ff6b35;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1rem;
        }
        
        .user-email {
            color: white;
            font-size: 0.9rem;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .user-profile-btn:hover .user-email {
            color: #e47e08;
        }
        
        .user-profile-btn i {
            color: white;
            font-size: 0.8rem;
        }
        
        .user-profile-btn:hover i {
            color: #e47e08;
        }
        
        .user-dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            border-radius: 8px;
            overflow: hidden;
            margin-top: 0.5rem;
            list-style: none;
            padding: 0;
            z-index: 1000;
        }
        
        .user-profile-dropdown:hover .user-dropdown-menu {
            display: block;
        }
        
        .user-dropdown-menu li a {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            color: #333;
            text-decoration: none;
            transition: background 0.2s;
            font-size: 0.95rem;
        }
        
        .user-dropdown-menu li a:hover {
            background: #f8f9fa;
            color: #ff6b35;
        }
        
        .user-dropdown-menu li a i {
            color: #666;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .user-email {
                max-width: 100px;
            }
            
            .user-dropdown-menu {
                right: auto;
                left: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-notification';
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        z-index: 10000;
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
    }, 3000);
}

// Make handleLogout available globally
window.handleLogout = handleLogout;