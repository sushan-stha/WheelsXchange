// sellcars.js - Complete fixed version
// Initialize uploaded files array
let uploadedFiles = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupImageUpload();
    setupFormValidation();
    
    // Listen for form submission
    const sellCarForm = document.getElementById('sellCarForm');
    if (sellCarForm) {
        sellCarForm.addEventListener('submit', handleCarListing);
    }
});

async function handleCarListing(e) {
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
        showAlert("You must be logged in to list a car.", "error");
        setTimeout(() => {
            window.location.href = '../login-form/login.html';
        }, 2000);
        return;
    }

    const formData = new FormData(e.target);
    
    // Prepare the data object to match your 'cars' table columns
    const carData = {
    
        make: formData.get('make'),
        model: formData.get('model'),
        year: formData.get('year'),
        price: parseFloat(formData.get('price')),
        mileage: formData.get('mileage'),
        fuel_type: formData.get('fuelType'),
        body_type: formData.get('bodyType'),
        location: formData.get('location'),
        seller_name: formData.get('sellerName'),
        seller_phone: formData.get('phone'),
        seller_email: formData.get('email'),
        negotiable: formData.get('negotiable'),
        // Handle multiple images
        image_urls: uploadedFiles.length > 0 ? uploadedFiles : []
    };

    // Show loading state on button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting Listing...';

    try {
        // 2. Insert into the 'cars' table
        const { data, error } = await supabase
            .from('car_listings')
            .insert([carData]);

        if (error) throw error;

        showAlert('Car listed successfully!', 'success');
        
        // Redirect to the cars gallery page
        setTimeout(() => {
            window.location.href = '../cars/cars.html';
        }, 1500);

    } catch (error) {
        console.error('Error listing car:', error.message);
        showAlert('Error: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Logic for handling image previews
function handleFiles(files) {
    const previewContainer = document.getElementById('previewImages');
    
    if (!previewContainer) {
        console.error('Preview container not found');
        return;
    }
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-item';
                imgContainer.innerHTML = `
                    <img src="${e.target.result}" alt="preview" style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 8px;">
                    <button type="button" class="remove-img" style="position: absolute; top: 5px; right: 5px; background: #f44336; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 16px; line-height: 1;">&times;</button>
                `;
                imgContainer.style.cssText = 'position: relative; display: inline-block; margin: 10px;';
                previewContainer.appendChild(imgContainer);
                
                // Store the image data
                uploadedFiles.push(e.target.result); 
            };
            reader.readAsDataURL(file);
        }
    });
}

// Alert notification function
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

// Setup image upload functionality
function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const fileInput = document.getElementById('images');
    
    if (!imageUpload || !fileInput) {
        console.error('Image upload elements not found');
        return;
    }
    
    // Click to upload
    imageUpload.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    });
    
    // Drag and drop functionality
    imageUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUpload.style.borderColor = '#ff6b35';
        imageUpload.style.background = '#fff5f0';
    });
    
    imageUpload.addEventListener('dragleave', () => {
        imageUpload.style.borderColor = '#ddd';
        imageUpload.style.background = '#f9f9f9';
    });
    
    imageUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUpload.style.borderColor = '#ddd';
        imageUpload.style.background = '#f9f9f9';
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    });
    
    // Remove image functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-img')) {
            const previewItem = e.target.parentElement;
            const previewContainer = document.getElementById('previewImages');
            const index = Array.from(previewContainer.children).indexOf(previewItem);
            
            if (index > -1) {
                uploadedFiles.splice(index, 1);
                previewItem.remove();
            }
        }
    });
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('sellCarForm');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        field.addEventListener('input', () => {
            if (field.classList.contains('error')) {
                validateField(field);
            }
        });
    });
}

function validateField(field) {
    const errorMsg = field.parentElement.querySelector('.error-message');
    
    if (!field.value.trim()) {
        field.classList.add('error');
        if (errorMsg) errorMsg.style.display = 'block';
        return false;
    } else {
        field.classList.remove('error');
        if (errorMsg) errorMsg.style.display = 'none';
        return true;
    }
}