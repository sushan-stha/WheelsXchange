
let bikes = [];

// Fetch bikes from Supabase
async function fetchBikes() {
    try {
        const { data, error } = await supabase
            .from('bike_listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        bikes = data.map(bike => ({
            id: bike.id,
            make: bike.make,
            model: bike.model,
            year: parseInt(bike.year),
            price: bike.price,
            type: bike.type || 'Not Specified',
            running: bike.mileage,
            
            image: Array.isArray(bike.image_urls) && bike.image_urls.length > 0
            ? bike.image_urls[0]
            : 'https://via.placeholder.com/400x250?text=No+Image',
            seller: bike.seller_name,
            location: bike.location
        }));

        console.log('✅ Loaded', bikes.length, 'bikes');
        console.log('🖼️ Image URLs:', bikes.map(b => b.image));
        console.log('📦 Raw image_urls from DB:', data.map(d => d.image_urls));
        filteredBikes = [...bikes];
        displayBikes(bikes);
            
    } catch (error) {
        console.error('Error fetching bikes:', error);
        // Show user-friendly message
        const noResults = document.getElementById('noResults');
        noResults.textContent = 'Error loading bikes. Please refresh the page.';
        noResults.style.display = 'block';
    }
}

// UPDATE THE DOMContentLoaded EVENT LISTENER
// Find the existing one and replace it with this:
document.addEventListener('DOMContentLoaded', function() {
    // Fetch bikes from Supabase on page load
    fetchBikes();
    
    // Add event listeners for all filter fields
    document.getElementById('searchBar').addEventListener('input', applyFilters);
    if (document.getElementById('brand')) document.getElementById('brand').addEventListener('change', applyFilters);
    if (document.getElementById('type')) document.getElementById('type').addEventListener('change', applyFilters);
    if (document.getElementById('year')) document.getElementById('year').addEventListener('change', applyFilters);
    if (document.getElementById('minPrice')) document.getElementById('minPrice').addEventListener('input', applyFilters);
    if (document.getElementById('maxPrice')) document.getElementById('maxPrice').addEventListener('input', applyFilters);
    if (document.getElementById('running')) document.getElementById('running').addEventListener('input', applyFilters);

    // Close chat/payment modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeChat();
            closePayment();
        }
    });
});
        // Check if user is authenticated
async function isUserAuthenticated() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        return session && session.user;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Show authentication required alert
function showAuthAlert() {
    showAlert('Please login to access this feature', 'error');
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
        window.location.href = '../login-form/login.html';
    }, 2000);
}
// Bike Display and Filtering

        let filteredBikes = [...bikes];
        let currentChatBike = null;
        let chatMessages = {}; // Store messages for each bike

        function displayBikes(bikesToShow) {
            const bikesGrid = document.getElementById('bikesGrid');
            const noResults = document.getElementById('noResults');
            
            if (bikesToShow.length === 0) {
                bikesGrid.innerHTML = '';
                noResults.style.display = 'block';
                return;
            }
            
            noResults.style.display = 'none';
            
            bikesGrid.innerHTML = bikesToShow.map(bike => `
                <div class="bike-card">
                    <img src="${bike.image}" alt="${bike.make} ${bike.model}" class="bike-image" onerror="this.src='https://via.placeholder.com/400x250?text=No+Image';">
                    <div class="bike-info">
                        <h3 class="bike-title">${bike.make} ${bike.model}</h3>
                        <div class="bike-details">
                            <p><strong>Year:</strong> ${bike.year}</p>
                            <p><strong>Type:</strong> ${bike.type}</p>
                            <p><strong>Running:</strong> ${bike.running.toLocaleString()} km</p>
                            <p><strong>Seller:</strong> ${bike.seller}</p>
                            <p><strong>Location:</strong> ${bike.location}</p>
                        </div>
                        <div class="bike-price">Rs.${bike.price.toLocaleString()}</div>
                         <div class="bike-actions">
                         <button class="chat-btn" onclick="openChat(${bike.id})">
                         Chat
                        </button>
                            <button class="pay-btn" onclick="handlePayment(${bike.id})">
                            Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        async function openChat(bikeId) {
            // Check authentication first
            const isAuthenticated = await isUserAuthenticated();
            if (!isAuthenticated) {
                showAuthAlert();
                return;
            }
            currentChatBike = bikes.find(bike => bike.id === bikeId);
            if (!currentChatBike) return;

            // Initialize chat messages for this bike if not exists
            if (!chatMessages[bikeId]) {
                chatMessages[bikeId] = [];
            }

            // Create and show chat modal
            createChatModal();
            document.getElementById('chatModal').style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Load existing messages
            loadChatMessages(bikeId);
        }

        function createChatModal() {
            // Remove existing modal
            const existingModal = document.getElementById('chatModal');
            if (existingModal) {
                existingModal.remove();
            }

            const chatModal = document.createElement('div');
            chatModal.id = 'chatModal';
            chatModal.innerHTML = `
                <div class="chat-overlay" onclick="closeChat()"></div>
                <div class="chat-container">
                    <div class="chat-header">
                        <div class="chat-seller-info">
                            <h3>${currentChatBike.seller}</h3>
                            <p>${currentChatBike.make} ${currentChatBike.model} - ${currentChatBike.year}</p>
                        </div>
                        <button class="chat-close" onclick="closeChat()">&times;</button>
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will be loaded here -->
                    </div>
                    <div class="chat-input-container">
                        <input type="text" id="chatInput" placeholder="Type your message..." onkeypress="handleChatKeyPress(event)">
                        <button class="send-btn" onclick="sendMessage()">Send</button>
                    </div>
                </div>
            `;

            document.body.appendChild(chatModal);
        }

        function loadChatMessages(bikeId) {
            const chatMessagesContainer = document.getElementById('chatMessages');
            const messages = chatMessages[bikeId] || [];
            
            chatMessagesContainer.innerHTML = messages.map(msg => `
                <div class="message ${msg.sender}">
                    <div class="message-content">
                        <p>${msg.message}</p>
                        <span class="message-time">${msg.time}</span>
                    </div>
                </div>
            `).join('');

            // Scroll to bottom
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }

        function sendMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (!message || !currentChatBike) return;

            const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Add user message
            if (!chatMessages[currentChatBike.id]) {
                chatMessages[currentChatBike.id] = [];
            }
            
            chatMessages[currentChatBike.id].push({
                sender: 'buyer',
                message: message,
                time: currentTime
            });

            // Clear input
            input.value = '';

            // Reload messages
            loadChatMessages(currentChatBike.id);
        }

        function handleChatKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        function closeChat() {
            const chatModal = document.getElementById('chatModal');
            if (chatModal) {
                chatModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restore scrolling
                setTimeout(() => {
                    chatModal.remove();
                }, 300);
            }
            currentChatBike = null;
        }

        function applyFilters() {
            const brand = document.getElementById('brand').value;
            const type = document.getElementById('type').value;
            const year = document.getElementById('year').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            const running = document.getElementById('running').value;
            const searchTerm = document.getElementById('searchBar').value.toLowerCase();

            filteredBikes = bikes.filter(bike => {
                const matchesBrand = !brand || bike.make === brand;
                const matchesType = !type || bike.type === type;
                const matchesYear = !year || bike.year.toString() === year;
                const matchesMinPrice = !minPrice || bike.price >= parseInt(minPrice);
                const matchesMaxPrice = !maxPrice || bike.price <= parseInt(maxPrice);
                const matchesRunning = !running || bike.running <= parseInt(running);
                const matchesSearch = !searchTerm || 
                    bike.make.toLowerCase().includes(searchTerm) ||
                    bike.model.toLowerCase().includes(searchTerm) ||
                    bike.seller.toLowerCase().includes(searchTerm);

                return matchesBrand && matchesType && matchesYear && matchesMinPrice && matchesMaxPrice && matchesRunning && matchesSearch;
            });

            displayBikes(filteredBikes);
        }

        function resetFilters() {
            document.getElementById('brand').value = '';
            document.getElementById('type').value = '';
            document.getElementById('year').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('running').value = '';
            document.getElementById('searchBar').value = '';
            
            filteredBikes = [...bikes];
            displayBikes(filteredBikes);
        }

            
        // Payment Modal and Processing
        async function handlePayment(bikeId) {
        // Check authentication first
        const isAuthenticated = await isUserAuthenticated();
        if (!isAuthenticated) {
        showAuthAlert();
        return;
         }
        const bike = bikes.find(b => b.id === bikeId);
        if (!bike) return;
    
    createPaymentModal(bike);
    document.getElementById('paymentModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function createPaymentModal(bike) {
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) {
        existingModal.remove();
    }

    const paymentModal = document.createElement('div');
    paymentModal.id = 'paymentModal';
    paymentModal.innerHTML = `
        <div class="payment-overlay" onclick="closePayment()"></div>
        <div class="payment-container">
            <div class="payment-header">
                <h3>Payment for ${bike.make} ${bike.model}</h3>
                <button class="payment-close" onclick="closePayment()">&times;</button>
            </div>
            <div class="payment-content">
                <div class="payment-bike-info">
                    <p><strong>Bike:</strong> ${bike.make} ${bike.model} (${bike.year})</p>
                    <p><strong>Type:</strong> ${bike.type}</p>
                    <p><strong>Seller:</strong> ${bike.seller}</p>
                    <p><strong>Price:</strong> Rs.${bike.price.toLocaleString()}</p>
                </div>
                
                <form class="payment-form" onsubmit="processPayment(event, ${bike.id})">
                    <div class="form-group">
                        <label for="bankSelect">Select Bank</label>
                        <select id="bankSelect" required>
                            <option value="">Choose your bank</option>
                            <option value="Nepal Bank Limited">Nepal Bank Limited</option>
                            <option value="Rastriya Banijya Bank">Rastriya Banijya Bank</option>
                            <option value="Nabil Bank">Nabil Bank</option>
                            <option value="Nepal Investment Bank">Nepal Investment Bank</option>
                            <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                            <option value="Himalayan Bank">Himalayan Bank</option>
                            <option value="Nepal SBI Bank">Nepal SBI Bank</option>
                            <option value="Nepal Bangladesh Bank">Nepal Bangladesh Bank</option>
                            <option value="Everest Bank">Everest Bank</option>
                            <option value="Kumari Bank">Kumari Bank</option>
                            <option value="Laxmi Bank">Laxmi Bank</option>
                            <option value="Citizens Bank International">Citizens Bank International</option>
                            <option value="Prime Commercial Bank">Prime Commercial Bank</option>
                            <option value="Sunrise Bank">Sunrise Bank</option>
                            <option value="Century Commercial Bank">Century Commercial Bank</option>
                            <option value="Sanima Bank">Sanima Bank</option>
                            <option value="Machhapuchchhre Bank">Machhapuchchhre Bank</option>
                            <option value="NIC Asia Bank">NIC Asia Bank</option>
                            <option value="Global IME Bank">Global IME Bank</option>
                            <option value="NMB Bank">NMB Bank</option>
                            <option value="Prabhu Bank">Prabhu Bank</option>
                            <option value="Mega Bank">Mega Bank</option>
                            <option value="Civil Bank">Civil Bank</option>
                            <option value="Agricultural Development Bank">Agricultural Development Bank</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="accountNumber">Account Number</label>
                        <input type="text" id="accountNumber" placeholder="Enter your account number" required maxlength="20" required minlength="16">
                    </div>

                    <div class="form-group">
                        <label for="branchName">Branch Name</label>
                        <input type="text" id="branchName" placeholder="Enter branch name" required>
                    </div>

                    <div class="form-group">
                        <label for="paymentAmount">Payment Amount (Rs.)</label>
                        <input type="number" id="paymentAmount" placeholder="Enter amount" required min="5000" max="${bike.price}" value="${bike.price}">
                    </div>

                    <div class="form-group">
                        <label for="paymentMessage">Message (Optional)</label>
                        <textarea id="paymentMessage" placeholder="Add a message to seller..." rows="3" maxlength="200"></textarea>
                    </div>

                    <div class="payment-buttons">
                        <button type="button" class="cancel-btn" onclick="closePayment()">Cancel</button>
                        <button type="submit" class="confirm-payment-btn">Confirm Payment</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(paymentModal);
}

function processPayment(event, bikeId) {
    event.preventDefault();
    
    const bankName = document.getElementById('bankSelect').value;
    const accountNum = document.getElementById('accountNumber').value;
    const branchName = document.getElementById('branchName').value;
    const amount = document.getElementById('paymentAmount').value;
    const message = document.getElementById('paymentMessage').value;
    
    if (!bankName || !accountNum || !branchName || !amount) {
        alert('Please fill in all required fields');
        return;
    }

    // Show processing state
    const submitBtn = document.querySelector('.confirm-payment-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    // Simulate payment processing
    setTimeout(() => {
        alert(`Payment initiated successfully!\n\nBank: ${bankName}\nAccount: ${accountNum}\nBranch: ${branchName}\nAmount: Rs.${parseInt(amount).toLocaleString()}\n\nYou will receive a confirmation shortly.`);
        
        // Reset and close
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        closePayment();
    }, 2000);
}

function closePayment() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            paymentModal.remove();
        }, 300);
    }
}

// Update existing keydown event listener
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeChat();
        closePayment();
    }
}); 
// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
        });
    }
});

