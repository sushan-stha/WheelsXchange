// Global variables
let uploadedFiles = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupImageUpload();
    setupFormValidation();
});

// Image upload functionality
function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const fileInput = document.getElementById('images');
    const previewContainer = document.getElementById('previewImages');

    // Click to select files
    imageUpload.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop events
    imageUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUpload.classList.add('dragover');
    });

    imageUpload.addEventListener('dragleave', () => {
        imageUpload.classList.remove('dragover');
    });

    imageUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUpload.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });

    // Handle file selection
    function handleFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (uploadedFiles.length + imageFiles.length > 10) {
            alert('Maximum 10 images allowed');
            return;
        }

        imageFiles.forEach(file => {
            if (uploadedFiles.length < 10) {
                uploadedFiles.push(file);
                displayPreview(file);
            }
        });
    }

    // Display image preview
    function displayPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'preview-image';
            previewDiv.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImage(this, '${file.name}')">×</button>
            `;
            previewContainer.appendChild(previewDiv);
        };
        reader.readAsDataURL(file);
    }
}

// Remove image function
function removeImage(button, filename) {
    const previewDiv = button.parentElement;
    previewDiv.remove();
    uploadedFiles = uploadedFiles.filter(file => file.name !== filename);
}

// Form validation setup
function setupFormValidation() {
    const form = document.getElementById('sellCarForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            const errorMsg = this.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                if (this.value.trim()) {
                    errorMsg.style.display = 'none';
                }
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
        if (!field.value.trim()) {
            errorMsg.style.display = 'block';
            return false;
        } else {
            errorMsg.style.display = 'none';
            return true;
        }
    }
    return true;
}

// Validate entire form
function validateForm() {
    const form = document.getElementById('sellCarForm');
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    // Validate all required fields
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    // Special validation for email
    const email = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailPattern.test(email.value)) {
        const errorMsg = email.nextElementSibling;
        errorMsg.textContent = 'Please enter a valid email address';
        errorMsg.style.display = 'block';
        isValid = false;
    }

    // Special validation for mileage
    const mileage = document.getElementById('mileage');
    if (mileage.value && (isNaN(mileage.value) || parseInt(mileage.value) < 0)) {
        const errorMsg = mileage.nextElementSibling;
        errorMsg.textContent = 'Please enter a valid mileage';
        errorMsg.style.display = 'block';
        isValid = false;
    }

    // Special validation for price
    const price = document.getElementById('price');
    if (price.value && (isNaN(price.value) || parseFloat(price.value) <= 0)) {
        const errorMsg = price.nextElementSibling;
        errorMsg.textContent = 'Please enter a valid price';
        errorMsg.style.display = 'block';
        isValid = false;
    }

    return isValid;
}

// Submit form

async function submitForm() {
    const form = document.getElementById('sellCarForm');
    const formData = new FormData(form);
    
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!session) {
    showAlert('⚠️ Please login to list your bike!', 'error');
    setTimeout(() => {
        window.location.href = '../login-form/login.html';
    }, 2000);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    return;
}
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
    // Upload images to Supabase Storage
    const imageUrls = [];
    
    if (uploadedFiles.length > 0) {
        submitBtn.textContent = 'Uploading images...';
        
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `bike_${Date.now()}_${i}.${fileExt}`;
            const filePath = `bikes/${fileName}`;
            
            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('vehicle-image')
                .upload(filePath, file);
            
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('vehicle-image')
                .getPublicUrl(filePath);
            
            imageUrls.push(urlData.publicUrl);
        }
    } else {
        imageUrls.push('https://via.placeholder.com/400x250?text=No+Image');
    }
    
    submitBtn.textContent = 'Submitting listing...';

        // Create listing object
        const listing = {
            make: formData.get('make'),
            model: formData.get('model'),
            year: formData.get('year'),
            mileage: parseInt(formData.get('mileage')),
            type: 'Not Specified', // Add type field in form if needed
            price: parseFloat(formData.get('price')),
            negotiable: formData.get('negotiable'),
            seller_name: formData.get('sellerName'),
            seller_email: formData.get('email'),
            seller_phone: formData.get('phone'),
            location: formData.get('location'),
            image_urls: imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/400x250?text=No+Image']
        };

        // Insert into Supabase
        const { data, error } = await supabase
            .from('bike_listings')
            .insert([listing])
            .select();

        if (error) throw error;

        // Show success message
        showSuccessMessage();
        
        // Reset form
        resetForm();
        
        console.log('Bike listing submitted:', data);
        
        // Redirect to bikes page after 2 seconds
        setTimeout(() => {
            window.location.href = '../bikes/bikes.html';
        }, 2000);

    } catch (error) {
        console.error('Error submitting listing:', error);
        alert('Error submitting listing: ' + error.message);
    } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}


// Show success message
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

// Reset form
function resetForm() {
    const form = document.getElementById('sellCarForm');
    form.reset();
    
    // Clear image previews
    document.getElementById('previewImages').innerHTML = '';
    uploadedFiles = [];
    
    // Hide all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.style.display = 'none';
    });
}

// Format phone number (optional enhancement)
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    input.value = value;
}

// Add phone formatting to phone input
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});

// For alert message if user is not logged in
// Alert notification function
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50, #45a049)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
        info: 'linear-gradient(135deg, #2196F3, #1976D2)'
    };
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        background: ${colors[type] || colors.info};
        animation: slideIn 0.3s ease;
        max-width: 350px;
        font-size: 1.1em;
    `;
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                document.body.removeChild(alertDiv);
            }
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);