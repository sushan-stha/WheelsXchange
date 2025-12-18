// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupImageUpload();
    setupFormValidation();
    
    // Listen for form submission
    const sellBikeForm = document.getElementById('sell-bike-form') || document.querySelector('form');
    if (sellBikeForm) {
        sellBikeForm.addEventListener('submit', handleBikeListing);
    }
});

async function handleBikeListing(e) {
    e.preventDefault();
    
    // Use the global client established in supabase-config.js
    const supabase = window.supabaseClient;

    if (!supabase) {
        showAlert('System error: Supabase client not found.', 'error');
        return;
    }

    // 1. Check if user is logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        showAlert("You must be logged in to list a bike.", "error");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    const formData = new FormData(e.target);
    
    // Prepare the data object to match your 'bike_listings' table columns
    const bikeData = {
        user_id: user.id, // Links listing to the logged-in user
        make: formData.get('make'),
        model: formData.get('model'),
        year: formData.get('year'),
        price: parseFloat(formData.get('price')),
        mileage: formData.get('mileage'),
        location: formData.get('location'),
        seller_name: formData.get('seller_name') || user.email.split('@')[0],
        // Example handling for multiple images or a single URL
        image_urls: uploadedFiles.length > 0 ? uploadedFiles : [formData.get('image_url')]
    };

    // Show loading state on button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting Listing...';

    try {
        // 2. Insert into the 'bike_listings' table
        const { data, error } = await supabase
            .from('bike_listings')
            .insert([bikeData]);

        if (error) throw error;

        showAlert('Bike listed successfully!', 'success');
        
        // Redirect to the bikes gallery page
        setTimeout(() => {
            window.location.href = 'bikes.html';
        }, 1500);

    } catch (error) {
        console.error('Error listing bike:', error.message);
        showAlert('Error: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Logic for handling image previews (from your original file)
function handleFiles(files) {
    const previewContainer = document.getElementById('previewImages');
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-item';
                imgContainer.innerHTML = `
                    <img src="${e.target.result}" alt="preview">
                    <button type="button" class="remove-img">&times;</button>
                `;
                previewContainer.appendChild(imgContainer);
                // In a real app, you would upload to Supabase Storage here
                uploadedFiles.push(e.target.result); 
            };
            reader.readAsDataURL(file);
        }
    });
}

// Re-use your existing showAlert function for consistency
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50, #45a049)',
        error: 'linear-gradient(135deg, #f44336, #d32f2f)',
        warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
        info: 'linear-gradient(135deg, #2196F3, #1976D2)'
    };
    
    alertDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px;
        border-radius: 10px; color: white; z-index: 10000; font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3); background: ${colors[type] || colors.info};
        animation: slideIn 0.3s ease; max-width: 350px; font-size: 1.1em;
    `;
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Required helper functions from your original code
function setupImageUpload() { /* your existing drag/drop logic */ }
function setupFormValidation() { /* your existing validation logic */ }