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
        // Prepare booking data
        const bookingData = {
            bookingDate,
            bookingTime,
            duration,
            numberOfPeople,
            specialRequests,
            contactPhone: phone,
            contactEmail: email,
            notes: `Cottage Type: ${cottageType}; Booking Type: ${bookingType}; Full Name: ${fullName}`
        };
        // Send to backend
        try {
            const response = await fetch('https://villa-ester-backend.onrender.com/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            if (response.ok) {
                alert('Booking submitted successfully!');
                modalBookingForm.reset();
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