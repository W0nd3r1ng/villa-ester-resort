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