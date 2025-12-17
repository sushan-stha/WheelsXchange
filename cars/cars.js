let cars = [];

// Fetch cars from Supabase
async function fetchCars() {
    try {
        const { data, error } = await supabaseClient
            .from('car_listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        cars = data.map(car => ({
            id: car.id,
            make: car.make,
            model: car.model,
            year: parseInt(car.year),
            price: car.price,
            type: car.body_type || 'Not Specified',
            fuel: car.fuel_type || 'Not Specified',
            running: car.mileage,
            image: car.image_urls && car.image_urls.length > 0 
            ? (typeof car.image_urls === 'string' ? car.image_urls : car.image_urls[0])
            : 'https://via.placeholder.com/400x200?text=No+Image',
            seller: car.seller_name,
            location: car.location
        }));

        console.log('✅ Loaded', cars.length, 'cars');
        console.log('📸 Image URLs:', cars.map(c => c.image));
        filteredCars = [...cars];
        displayCars(cars);
        
    } catch (error) {
        console.error('Error fetching cars:', error);
        // Show user-friendly message
        const noResults = document.getElementById('noResults');
        noResults.textContent = 'Error loading cars. Please refresh the page.';
        noResults.style.display = 'block';
    }
}
document.addEventListener('DOMContentLoaded', function() {
    // Fetch cars from Supabase on page load
    fetchCars();
    
    // Add debounce for search (wait 300ms after user stops typing)
    let searchTimeout;
    document.getElementById('searchBar').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });
    if (document.getElementById('brand')) document.getElementById('brand').addEventListener('change', applyFilters);
    if (document.getElementById('type')) document.getElementById('type').addEventListener('change', applyFilters);
    if (document.getElementById('year')) document.getElementById('year').addEventListener('change', applyFilters);
    if (document.getElementById('minPrice')) document.getElementById('minPrice').addEventListener('input', applyFilters);
    if (document.getElementById('maxPrice')) document.getElementById('maxPrice').addEventListener('input', applyFilters);
    if (document.getElementById('fuel')) document.getElementById('fuel').addEventListener('change', applyFilters);
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
                const { data: { session }, error } = await supabaseClient.auth.getSession();
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

        let filteredCars = [...cars];
        let currentChatCar = null;
        let chatMessages = {}; // Store messages for each car

        function displayCars(carsToShow) {
            const carsGrid = document.getElementById('carsGrid');
            const noResults = document.getElementById('noResults');
            
            if (carsToShow.length === 0) {
                carsGrid.innerHTML = '';
                noResults.style.display = 'block';
                return;
            }
            
            noResults.style.display = 'none';
            
            carsGrid.innerHTML = carsToShow.map(car => `
                <div class="car-card">
                    <img src="${car.image}" alt="${car.make} ${car.model}" class="car-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'; console.error('Failed to load image:', '${car.image}');">
                    <div class="car-info">
                        <h3 class="car-title">${car.make} ${car.model}</h3>
                        <div class="car-details">
                            <p><strong>Year:</strong> ${car.year}</p>
                            <p><strong>Type:</strong> ${car.type}</p>
                            <p><strong>Fuel:</strong> ${car.fuel}</p>
                            <p><strong>Running</strong> ${car.running.toLocaleString()} km</p>
                            <p><strong>Seller:</strong> ${car.seller}</p>
                            <p><strong>Location:</strong> ${car.location}</p>
                        </div>
                        <div class="car-price">Rs.${car.price.toLocaleString()}</div>
                         <div class="car-actions">
                         <button class="chat-btn" onclick="openChat(${car.id})">Chat</button>
                            <button class="pay-btn" onclick="handlePayment(${car.id})">Pay Now</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

                async function openChat(carId) {
            // Check authentication first
            const isAuthenticated = await isUserAuthenticated();
            if (!isAuthenticated) {
                showAuthAlert();
                return;
            }
            currentChatCar = cars.find(car => car.id === carId);
            if (!currentChatCar) return;

            // Initialize chat messages for this car if not exists
            if (!chatMessages[carId]) {
                chatMessages[carId] = [];
            }

            // Create and show chat modal
            createChatModal();
            document.getElementById('chatModal').style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Load existing messages
            loadChatMessages(carId);
        }

        function createChatModal() {
            // Remove existing modal if any
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
                            <h3>${currentChatCar.seller}</h3>
                            <p>${currentChatCar.make} ${currentChatCar.model} - ${currentChatCar.year}</p>
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

        function loadChatMessages(carId) {
            const chatMessagesContainer = document.getElementById('chatMessages');
            const messages = chatMessages[carId] || [];
            
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
            
            if (!message || !currentChatCar) return;

            const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Add user message
            if (!chatMessages[currentChatCar.id]) {
                chatMessages[currentChatCar.id] = [];
            }
            
            chatMessages[currentChatCar.id].push({
                sender: 'buyer',
                message: message,
                time: currentTime
            });

            // Clear input
            input.value = '';

            // Reload messages
            loadChatMessages(currentChatCar.id);
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
            currentChatCar = null;
        }

        function applyFilters() {
            const brand = document.getElementById('brand').value;
            const type = document.getElementById('type').value;
            const year = document.getElementById('year').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            const fuel = document.getElementById('fuel').value;
            const running = document.getElementById('running').value;
            const searchTerm = document.getElementById('searchBar').value.toLowerCase();

            filteredCars = cars.filter(car => {
                const matchesBrand = !brand || car.make === brand;
                const matchesType = !type || car.type === type;
                const matchesYear = !year || car.year.toString() === year;
                const matchesMinPrice = !minPrice || car.price >= parseInt(minPrice);
                const matchesMaxPrice = !maxPrice || car.price <= parseInt(maxPrice);
                const matchesFuel = !fuel || car.fuel === fuel;
                const matchesRunning = !running || car.running <= parseInt(running);
                const matchesSearch = !searchTerm || 
                    car.make.toLowerCase().includes(searchTerm) ||
                    car.model.toLowerCase().includes(searchTerm) ||
                    car.seller.toLowerCase().includes(searchTerm);

                return matchesBrand && matchesType && matchesYear && matchesMinPrice && matchesMaxPrice && matchesFuel && 
                matchesRunning && matchesSearch;
            });

            displayCars(filteredCars);
        }

        function resetFilters() {
            document.getElementById('brand').value = '';
            document.getElementById('type').value = '';
            document.getElementById('year').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('fuel').value = '';
            document.getElementById('running').value = '';
            document.getElementById('searchBar').value = '';
            
            filteredCars = [...cars];
            displayCars(filteredCars);
        }
        
    // Payment Modal and Processing
    async function handlePayment(carId) {
    // Check authentication first
    const isAuthenticated = await isUserAuthenticated();
    if (!isAuthenticated) {
        showAuthAlert();
        return;
    }
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    createPaymentModal(car);
    document.getElementById('paymentModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function createPaymentModal(car) {
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
                <h3>Payment for ${car.make} ${car.model}</h3>
                <button class="payment-close" onclick="closePayment()">&times;</button>
            </div>
            <div class="payment-content">
                <div class="payment-car-info">
                    <p><strong>Vehicle:</strong> ${car.make} ${car.model} (${car.year})</p>
                    <p><strong>Seller:</strong> ${car.seller}</p>
                    <p><strong>Price:</strong> Rs.${car.price.toLocaleString()}</p>
                </div>
                
                <form class="payment-form" onsubmit="processPayment(event, ${car.id})">
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
                        <input type="number" id="paymentAmount" placeholder="Enter amount" required min="1000" max="${car.price}" value="${car.price}">
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

function processPayment(event, carId) {
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

// Add to existing keydown event listener
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
