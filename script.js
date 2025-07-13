// Socket.IO connection
const socket = io('https://villa-ester-backend.onrender.com', {
  transports: ['websocket', 'polling']
});

// Socket.IO event handlers
socket.on('connect', () => {
  console.log('Connected to server via Socket.IO');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('booking-created', (data) => {
  console.log('New booking created:', data);
  showNotification('New booking received!', 'success');
});

socket.on('booking-updated', (data) => {
  console.log('Booking updated:', data);
  showNotification('Booking status updated!', 'info');
});

// Notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Function to handle scroll highlight effect
function handleScrollHighlight() {
  const reviewsSection = document.querySelector('.reviews-section');
  const sectionTop = reviewsSection.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;
  
  // Add 'visible' class when section is in viewport
  if (sectionTop < windowHeight * 0.75) {
    reviewsSection.classList.add('visible');
  }
}

// Add scroll event listener
window.addEventListener('scroll', handleScrollHighlight);

// Check on initial load
handleScrollHighlight();

// Background Slideshow
const hero = document.querySelector('.hero');
let currentImage = 1;
const totalImages = 7;

function changeBackground() {
    currentImage = currentImage % totalImages + 1;
    hero.style.backgroundImage = `url('images/VillaEster${currentImage}.jpg')`;
}

// Change background every 5 seconds
setInterval(changeBackground, 3000);

// Modal logic for booking
const openBookingModalBtn = document.getElementById('open-booking-modal');
const bookingModal = document.getElementById('booking-modal');
const closeBookingModalBtn = document.getElementById('close-booking-modal');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

function openBookingModal() {
    bookingModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeBookingModal() {
    bookingModal.style.display = 'none';
    document.body.style.overflow = '';
}
if (openBookingModalBtn && bookingModal && closeBookingModalBtn) {
    openBookingModalBtn.addEventListener('click', openBookingModal);
    closeBookingModalBtn.addEventListener('click', closeBookingModal);
}
if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', closeBookingModal);
}
// Optional: Close modal when clicking outside content
bookingModal && bookingModal.addEventListener('click', function(e) {
    if (e.target === bookingModal) closeBookingModal();
});

// --- Proof of Payment Image Preview ---
const proofInput = document.getElementById('modal-proof');
const proofPreview = document.getElementById('modal-proof-preview');
if (proofInput && proofPreview) {
    proofInput.addEventListener('change', function() {
        proofPreview.innerHTML = '';
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                proofPreview.innerHTML = `<img src="${e.target.result}" alt="Proof of Payment" style="max-width:180px;max-height:120px;border-radius:8px;box-shadow:0 2px 8px #ccc;">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// --- Booking Submission Logic ---
const modalBookingForm = document.querySelector('.modal-booking-form');
if (modalBookingForm) {
    modalBookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Collect form data
        const fullName = document.getElementById('modal-full-name').value.trim();
        const phone = document.getElementById('modal-phone').value.trim();
        const email = document.getElementById('modal-email').value.trim();
        const specialRequests = document.getElementById('modal-special-requests').value.trim();
        const bookingType = document.getElementById('modal-booking-type').value;
        let bookingDate = '';
        let bookingTime = '';
        let duration = 120; // default 2 hours
        if (bookingType === 'daytour') {
            bookingDate = document.getElementById('modal-schedule-date').value;
            bookingTime = '08:00';
            duration = 600; // 10 hours (8am-6pm)
        } else if (bookingType === 'overnight') {
            bookingDate = document.getElementById('modal-checkin-date').value;
            bookingTime = '14:00'; // default check-in time
            duration = 1080; // 18 hours (2pm-8am next day)
        }
        const cottageType = document.getElementById('modal-cottage-type').value;
        const adults = parseInt(document.getElementById('modal-adults').value, 10) || 0;
        const children = parseInt(document.getElementById('modal-children').value, 10) || 0;
        const numberOfPeople = adults + children;
        const proofFile = document.getElementById('modal-proof').files[0];
        // Prepare FormData
        const formData = new FormData();
        formData.append('bookingDate', bookingDate);
        formData.append('bookingTime', bookingTime);
        formData.append('duration', duration);
        formData.append('numberOfPeople', numberOfPeople);
        formData.append('specialRequests', specialRequests);
        formData.append('contactPhone', phone);
        formData.append('contactEmail', email);
        formData.append('notes', `Cottage Type: ${cottageType}; Booking Type: ${bookingType}; Full Name: ${fullName}`);
        formData.append('fullName', fullName);
        formData.append('cottageType', cottageType);
        if (proofFile) formData.append('proofOfPayment', proofFile);
        // Send to backend
        try {
            const response = await fetch('https://villa-ester-backend.onrender.com/api/bookings', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                alert('Booking submitted successfully!');
                modalBookingForm.reset();
                if (proofPreview) proofPreview.innerHTML = '';
                closeBookingModal();
            } else {
                const error = await response.json();
                alert('Booking failed: ' + (error.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Booking failed: ' + err.message);
        }
    });
}

// --- Review Modal Logic ---
const openReviewModalBtn = document.getElementById('open-review-modal');
const reviewModal = document.getElementById('review-modal');
const closeReviewModalBtn = document.getElementById('close-review-modal');
const reviewForm = document.getElementById('review-form');
const reviewsContainer = document.getElementById('reviews-container');

function openReviewModal() {
    reviewModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeReviewModal() {
    reviewModal.style.display = 'none';
    document.body.style.overflow = '';
}
if (openReviewModalBtn && reviewModal && closeReviewModalBtn) {
    openReviewModalBtn.addEventListener('click', openReviewModal);
    closeReviewModalBtn.addEventListener('click', closeReviewModal);
}
reviewModal && reviewModal.addEventListener('click', function(e) {
    if (e.target === reviewModal) closeReviewModal();
});

// --- Submit Review ---
if (reviewForm) {
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('review-name').value.trim();
        const comment = document.getElementById('review-comment').value.trim();
        const image = document.getElementById('review-image').value.trim() || 'reviewer1.jpg';
        const reviewData = { name, comment, image };
        try {
            const response = await fetch('https://villa-ester-backend.onrender.com/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });
            if (response.ok) {
                alert('Thank you for your review!');
                reviewForm.reset();
                closeReviewModal();
                fetchAndDisplayReviews();
            } else {
                const error = await response.json();
                alert('Failed to submit review: ' + (error.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Failed to submit review: ' + err.message);
        }
    });
}

// --- Fetch and Display Reviews ---
async function fetchAndDisplayReviews() {
    if (!reviewsContainer) return;
    try {
        const response = await fetch('https://villa-ester-backend.onrender.com/api/reviews');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            reviewsContainer.innerHTML = data.data.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <img class="reviewer-avatar" alt="${review.name}" onerror="this.style.display='none';" src="${review.image ? 'images/' + review.image : ''}">
                            <div>
                                <h3 class="reviewer-name">${review.name}</h3>
                                <div class="review-stars">★★★★★</div>
                            </div>
                        </div>
                        <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                    </div>
                    <p class="review-text">${review.comment}</p>
                </div>
            `).join('');
        } else {
            reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to share your experience!</p>';
        }
    } catch (err) {
        reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
    }
}

// Fetch reviews on page load
fetchAndDisplayReviews();

// --- Availability Search Functionality ---
const availabilityForm = document.getElementById('availability-form');
const availabilityResults = document.getElementById('availability-results');
const loadingState = document.getElementById('loading-state');
const cottagesGrid = document.getElementById('cottages-grid');
const noResults = document.getElementById('no-results');
const resultsCount = document.getElementById('results-count');

// Handle booking type change
const bookingTypeSelect = document.getElementById('booking-type');
const daytourFields = document.getElementById('daytour-fields');
const overnightFields = document.getElementById('overnight-fields');

if (bookingTypeSelect) {
    bookingTypeSelect.addEventListener('change', function() {
        if (this.value === 'daytour') {
            daytourFields.style.display = 'block';
            overnightFields.style.display = 'none';
        } else if (this.value === 'overnight') {
            daytourFields.style.display = 'none';
            overnightFields.style.display = 'block';
        } else {
            daytourFields.style.display = 'none';
            overnightFields.style.display = 'none';
        }
    });
}

// Handle availability search
if (availabilityForm) {
    availabilityForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        loadingState.style.display = 'block';
        availabilityResults.style.display = 'none';
        
        // Collect form data
        const bookingType = document.getElementById('booking-type').value;
        const guests = parseInt(document.getElementById('guests').value, 10);
        let bookingDate = '';
        let checkoutDate = '';
        
        if (bookingType === 'daytour') {
            bookingDate = document.getElementById('schedule-date').value;
        } else if (bookingType === 'overnight') {
            bookingDate = document.getElementById('checkin-date').value;
            checkoutDate = document.getElementById('checkout-date').value;
        }
        
        try {
            // Fetch available cottages
            console.log('Fetching cottages from API...');
            const response = await fetch('https://villa-ester-backend.onrender.com/api/cottages');
            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('API response:', data);
            
            if (data.success && Array.isArray(data.data)) {
                console.log('Found cottages:', data.data.length);
                // Filter cottages based on availability (simplified logic)
                const availableCottages = data.data.filter(cottage => {
                    // For demo purposes, show all cottages as available
                    // In real implementation, you'd check against actual bookings
                    return cottage.capacity >= guests;
                });
                
                console.log('Available cottages:', availableCottages);
                displayCottages(availableCottages);
            } else {
                console.log('No cottages found or invalid response format');
                showNoResults();
            }
        } catch (error) {
            console.error('Error fetching cottages:', error);
            showNoResults();
        } finally {
            loadingState.style.display = 'none';
        }
    });
}

function displayCottages(cottages) {
    if (cottages.length === 0) {
        showNoResults();
        return;
    }
    
    resultsCount.textContent = cottages.length;
    
    cottagesGrid.innerHTML = cottages.map(cottage => `
        <div class="cottage-card">
            <div class="cottage-image">
                ${cottage.image ? `<img src="images/${cottage.image}" alt="${cottage.name}" style="width:100%;height:100%;object-fit:cover;">` : '🏖️'}
            </div>
            <div class="cottage-content">
                <div class="cottage-header">
                    <div>
                        <h3 class="cottage-title">${cottage.name}</h3>
                        <div class="cottage-type">${cottage.type}</div>
                    </div>
                    <div class="cottage-price">
                        <div class="price-amount">₱${cottage.price}</div>
                        <div class="price-period">per night</div>
                    </div>
                </div>
                
                <div class="cottage-features">
                    <div class="feature">
                        <span class="feature-icon">👥</span>
                        <span>${cottage.capacity} guests</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🛏️</span>
                        <span>${cottage.bedrooms || 1} bedroom</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🚿</span>
                        <span>${cottage.bathrooms || 1} bathroom</span>
                    </div>
                </div>
                
                <p class="cottage-description">${cottage.description || 'Experience luxury and comfort in this beautiful cottage.'}</p>
                
                <div class="cottage-actions">
                    <button class="book-now-btn" onclick="openBookingModal('${cottage._id}', '${cottage.name}')">
                        Book Now
                    </button>
                    <button class="view-details-btn" onclick="viewCottageDetails('${cottage._id}')">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    availabilityResults.style.display = 'block';
    availabilityResults.scrollIntoView({ behavior: 'smooth' });
}

function showNoResults() {
    resultsCount.textContent = '0';
    cottagesGrid.innerHTML = '';
    noResults.style.display = 'block';
    availabilityResults.style.display = 'block';
    availabilityResults.scrollIntoView({ behavior: 'smooth' });
}

function openBookingModal(cottageId, cottageName) {
    // Pre-fill the booking modal with cottage details
    const modalCottageType = document.getElementById('modal-cottage-type');
    if (modalCottageType) {
        modalCottageType.value = cottageName.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Open the booking modal
    const bookingModal = document.getElementById('booking-modal');
    if (bookingModal) {
        bookingModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function viewCottageDetails(cottageId) {
    // For now, just show an alert. You can implement a detailed view modal later
    alert('Cottage details feature coming soon!');
} 