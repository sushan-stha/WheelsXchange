// Global variables
let uploadedFiles = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    populateYears();
    setupImageUpload();
    setupFormValidation();
});

// Populate year dropdown
function populateYears() {
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= 1990; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

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
function submitForm() {
    const form = document.getElementById('sellCarForm');
    const formData = new FormData(form);
    
    // Get selected features
    const features = [];
    document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
        features.push(checkbox.value);
    });
    
    // Create listing object
    const listing = {
        vehicle: {
            make: formData.get('make'),
            model: formData.get('model'),
            year: formData.get('year'),
            mileage: formData.get('mileage'),
            condition: formData.get('condition'),
            transmission: formData.get('transmission'),
            fuelType: formData.get('fuelType'),
            bodyType: formData.get('bodyType'),
            color: formData.get('color'),
            vin: formData.get('vin')
        },
        price: {
            asking: formData.get('price'),
            negotiable: formData.get('negotiable')
        },
        description: formData.get('description'),
        features: features,
        seller: {
            name: formData.get('sellerName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            location: formData.get('location')
        },
        images: uploadedFiles.length,
        timestamp: new Date().toISOString()
    };

    // Show success message
    showSuccessMessage();
    
    // Reset form
    resetForm();
    
    // Log data 
    console.log('Car listing submitted:', listing);
    
    
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

