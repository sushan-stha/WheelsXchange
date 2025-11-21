const bikes = [
            {
                id: 1,
                make: 'Yamaha',
                model: 'R15',
                year: 2022,
                price: 320000,
                type: 'Sports',
                running: 18000,
                image: 'https://www.team-bhp.com/sites/default/files/pictures2024-01/R15_PostService.jpg',
                seller: 'Sushan Shrestha',
                location: 'Bhaktapur',
            },
            {
                id: 2,
                make: 'Suzuki',
                model: 'V-Storm 250',
                year: 2024,
                price: 420000,
                type: 'Touring',
                running: 12000,
                image: 'https://www.en.meroauto.com/wp-content/uploads/2025/05/suzuki-v-strom-250-sx-slant-rear.jpg',
                seller: 'Ram Bahadur Shrestha',
                location: 'Lalitpur'
            },
            {
                id: 3,
                make: 'Honda',
                model: 'Shine',
                year: 2018,
                price: 175000,
                type: 'Commuter',
                running: 32000,
                image: 'https://img.autocarindia.com/ExtraImages/20240517024452_Honda_SP125_BS6_front_static.jpg?w=700&c=1',
                seller: 'Nishan Khatri',
                location: 'Bhaktapur'
            },
            {
                id: 4,
                make: 'CF Moto',
                model: 'MT450',
                year: 2023,
                price: 750000,
                type: 'Touring',
                running: 14000,
                image: 'https://motar-company.com.np/blackhole/CFMOTO-450MT-4.webp',
                seller: 'Mahesh Tharu',
                location: 'Chitwan'
            },
            {
                id: 5,
                make: 'Pulsar',
                model: 'NS200',
                year: 2022,
                price: 240000,
                type: 'Naked Sport',
                running: 26000,
                image: 'https://i.redd.it/bajaj-pulsar-ns-200-2022-vs-2023-v0-a6hvanimyp5c1.jpg?width=1600&format=pjpg&auto=webp&s=0ee554e3d6726c777c0e0c9235a93173def60c5a',
                seller: 'Resham Gurung',
                location: 'Pokhara'
            },
            {
                id: 6,
                make: 'Royal Enfield',
                model: 'Classic 350',
                year: 2021,
                price: 420000,
                type: 'Retro',
                running: 23000,
                image: 'https://www.motoroids.com/wp-content/uploads/2021/09/2021-Royal-Enfield-Classic-350-8.jpg',
                seller: 'Bipin Giri',
                location: 'Kathmandu'
            },
            {
                id: 7,
                make: 'KTM',
                model: 'Duke 390 Gen 3',
                year: 2024,
                price: 750000,
                type: 'Naked Sport',
                running: 5200,
                image: 'https://www.team-bhp.com/forum/attachments/motorbikes/2502373d1694507125-3rd-gen-ktm-390-duke-launched-rs-3-11-lakh-smartselect_20230912135144_instagram.jpg',
                seller: 'Suraj Thapa',
                location: 'Bhaktapur'
            },
            {
                id: 8,
                make: 'Yamaha',
                model: 'MT-15',
                year: 2023,
                price: 390000,
                type: 'Naked Sport',
                running: 12000,
                image: 'https://i.pinimg.com/736x/f0/bc/75/f0bc75e82bf8ed2dfe7922ddb7348ca8.jpg',
                seller: 'Deepak Shrestha',
                location: 'Kathmandu'
            }
        ];

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
                    <img src="${bike.image}" alt="${bike.make} ${bike.model}" class="bike-image">
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

        function openChat(bikeId) {
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

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Add event listeners for all filter fields
            document.getElementById('searchBar').addEventListener('input', applyFilters);
            if (document.getElementById('brand')) document.getElementById('brand').addEventListener('change', applyFilters);
            if (document.getElementById('type')) document.getElementById('type').addEventListener('change', applyFilters);
            if (document.getElementById('year')) document.getElementById('year').addEventListener('change', applyFilters);
            if (document.getElementById('minPrice')) document.getElementById('minPrice').addEventListener('input', applyFilters);
            if (document.getElementById('maxPrice')) document.getElementById('maxPrice').addEventListener('input', applyFilters);
            if (document.getElementById('running')) document.getElementById('running').addEventListener('input', applyFilters);

            // Close chat modal with Escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closeChat();
                }
            });

            displayBikes(bikes);
        });
        // Payment Modal and Processing
        function handlePayment(bikeId) {
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
