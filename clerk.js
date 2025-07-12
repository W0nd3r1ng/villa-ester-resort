// Clerk Panel UI Logic

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mainDashboardView = document.getElementById('main-dashboard-view');
    const addBookingBtn = document.getElementById('add-booking-btn');
    const addBookingModal = document.getElementById('add-booking-modal');
    const closeModal = document.getElementById('close-modal');
    const addBookingForm = document.getElementById('add-booking-form');

    // New elements for panel switching
    const checkInOutPanel = document.getElementById('check-in-out-panel');
    const quickBookingPanel = document.getElementById('quick-booking-panel');
    const guestManagementPanel = document.getElementById('guest-management-panel');

    // Example booking data (replace with actual backend data later)
    const bookingsData = [
        { id: 1, guest: 'Smith, John', room: '201', roomType: 'Ocean View Suite', eta: '2:00 PM', adults: 2, children: 1 },
        { id: 2, guest: 'Garcia, Maria', room: '105', roomType: 'Garden Villa', eta: '3:30 PM', adults: 1, children: 0 },
        { id: 3, guest: 'Johnson, Robert', room: '302', roomType: 'Deluxe Room', eta: '4:00 PM', adults: 2, children: 0 },
        { id: 4, guest: 'Lee, Jennifer', room: '401', roomType: 'Family Suite', eta: '1:45 PM', adults: 2, children: 2 },
        { id: 5, guest: 'Patel, Anika', room: '210', roomType: 'Ocean View Suite', eta: '5:00 PM', adults: 1, children: 0 },
        { id: 6, guest: 'Nguyen, Minh', room: '108', roomType: 'Garden Villa', eta: '6:15 PM', adults: 2, children: 0 }
    ];

    // Example booking data (replace with actual backend data later)
    const pendingBookingsData = [
        { id: 7, guest: 'Brown, David', roomType: 'Standard Room', checkIn: '2024-08-01', checkOut: '2024-08-05', adults: 2, children: 0, status: 'Pending' },
        { id: 8, guest: 'Miller, Sarah', roomType: 'Deluxe Room', checkIn: '2024-08-03', checkOut: '2024-08-07', adults: 1, children: 0, status: 'Pending' }
    ];

    // --- Walk-in Guest List State ---
    let walkinGuests = [
        { name: 'Juan Dela Cruz', cottage: 'Standard Cottage', bookingType: 'Day Tour', date: '2024-06-10 (8am–6pm)' },
        { name: 'Maria Santos', cottage: 'Villa', bookingType: 'Overnight Stay', date: '2024-06-10 to 2024-06-11' }
    ];

    // Show Add Booking Modal
    if (addBookingBtn) {
        addBookingBtn.addEventListener('click', function() {
            addBookingModal.style.display = 'block';
        });
    }

    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            addBookingModal.style.display = 'none';
            if (addBookingForm) addBookingForm.reset();
        });
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === addBookingModal) {
            addBookingModal.style.display = 'none';
            if (addBookingForm) addBookingForm.reset();
        }
    };

    // Function to show a specific panel and update active link
    function showPanel(panelToShow, activeLink) {
        console.log('showPanel called with panel:', panelToShow.id, 'activeLink:', activeLink ? activeLink.textContent.trim() : 'none');
        document.querySelectorAll('.dashboard-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        document.querySelectorAll('.sidebar-nav ul li a').forEach(link => {
            link.classList.remove('active');
        });
        if (panelToShow) {
            panelToShow.style.display = 'block';
        }
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Event Listeners for sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav ul li a');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const panelId = link.getAttribute('data-panel');
            const panel = document.getElementById(panelId);
            if (panel) {
                showPanel(panel, link);
                if (panelId === 'check-in-out-panel') {
                    renderBookingList();
                } else if (panelId === 'guest-management-panel') {
                    renderPendingBookingList();
                }
            }
        });
    });

    // Event listener for the 'New Walk-in' button in Today's Arrivals
    const todayArrivalsNewWalkInBtn = document.querySelector('#check-in-out-panel .action-card .btn.action-btn-primary');
    if (todayArrivalsNewWalkInBtn) {
        todayArrivalsNewWalkInBtn.addEventListener('click', () => {
            const quickBookingLink = document.querySelector('.sidebar-nav ul li a[data-panel="quick-booking-panel"]');
            if (quickBookingLink) {
                quickBookingLink.click();
            }
        });
    }

    // Event listener for the 'New Walk-in' button in Dashboard Overview
    const dashboardNewWalkInBtn = document.getElementById('dashboard-walkin-btn');
    if (dashboardNewWalkInBtn) {
        dashboardNewWalkInBtn.addEventListener('click', () => {
            const quickBookingLink = document.querySelector('.sidebar-nav ul li a[data-panel="quick-booking-panel"]');
            if (quickBookingLink) {
                quickBookingLink.click();
            }
        });
    }

    // Initial display of the dashboard
    function showDashboard() {
        mainDashboardView.style.display = 'flex';
        const defaultLink = document.querySelector('.sidebar-nav ul li a.active');
        const defaultPanelId = defaultLink ? defaultLink.getAttribute('data-panel') : 'check-in-out-panel';
        const defaultPanel = document.getElementById(defaultPanelId);
        if (defaultPanel && defaultLink) {
            showPanel(defaultPanel, defaultLink);
        } else if (defaultPanel) {
            showPanel(defaultPanel, null);
        }
    }

    function renderBookingList() {
        const container = document.getElementById('arrival-list-container');
        if (!container) return;

        container.innerHTML = '';

        if (!bookingsData.length) {
            container.innerHTML = '<p style="text-align:center; color:#888;">No arrivals for today.</p>';
            return;
        }

        bookingsData.forEach(booking => {
            const arrivalItem = document.createElement('div');
            arrivalItem.classList.add('arrival-item');

            const paxString = booking.children > 0 ? `${booking.adults} Adults, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}` : `${booking.adults} Adult${booking.adults > 1 ? 's' : ''}`;

            arrivalItem.innerHTML = `
                <div class="arrival-details">
                    <i class="material-icons person-icon">person</i>
                    <div class="guest-info">
                        <span class="guest-name">${booking.guest}</span>
                    </div>
                    <div class="room-details">
                        <span class="room-number-text">Room ${booking.room}</span>
                        <span class="room-type-text">${booking.roomType}</span>
                    </div>
                    <div class="booking-info">
                        <span class="eta">ETA: ${booking.eta}</span>
                        <span class="pax">${paxString}</span>
                    </div>
                </div>
                <div class="arrival-actions">
                    <button class="action-btn check-in-btn" title="Check-in"><i class="material-icons">check_circle</i></button>
                    <button class="action-btn info-btn" title="View Info"><i class="material-icons">info</i></button>
                    <button class="action-btn more-options-btn" title="More Options"><i class="material-icons">more_horiz</i></button>
                </div>
            `;
            container.appendChild(arrivalItem);
        });

        document.querySelectorAll('.action-btn.check-in-btn').forEach(btn => {
            btn.onclick = function() {
                const id = +this.getAttribute('data-id');
                alert('Check-in for booking ID: ' + id);
            };
        });
        document.querySelectorAll('.action-btn.info-btn').forEach(btn => {
            btn.onclick = function() {
                const id = +this.getAttribute('data-id');
                alert('View info for booking ID: ' + id);
            };
        });
        document.querySelectorAll('.action-btn.more-options-btn').forEach(btn => {
            btn.onclick = function() {
                const id = +this.getAttribute('data-id');
                alert('More options for booking ID: ' + id);
            };
        });

        document.querySelectorAll('.booking-table .btn-confirm, .booking-table .btn-delete').forEach(btn => {
            btn.onclick = null;
        });
    }

    function renderPendingBookingList() {
        const container = document.getElementById('pending-bookings-container');
        const noBookingsMessage = document.getElementById('no-pending-bookings');
        if (!container || !noBookingsMessage) return;

        container.innerHTML = '';
        if (!pendingBookingsData.length) {
            noBookingsMessage.style.display = 'block';
            return;
        } else {
            noBookingsMessage.style.display = 'none';
        }

        pendingBookingsData.forEach(booking => {
            const bookingItem = document.createElement('div');
            bookingItem.classList.add('arrival-item'); // Reusing some styling

            bookingItem.innerHTML = `
                <div class="arrival-details">
                    <i class="material-icons person-icon">person</i>
                    <div class="guest-info">
                        <span class="guest-name">${booking.guest}</span>
                    </div>
                    <div class="room-details">
                        <span class="room-number-text">${booking.roomType}</span>
                        <span class="room-type-text">Check-in: ${booking.checkIn}</span>
                        <span class="room-type-text">Check-out: ${booking.checkOut}</span>
                    </div>
                    <div class="booking-info">
                        <span class="pax">${booking.adults} Adults, ${booking.children} Children</span>
                        <span class="status">Status: ${booking.status}</span>
                    </div>
                </div>
                <div class="arrival-actions">
                    <button class="action-btn check-in-btn approve-btn" data-id="${booking.id}" title="Approve"><i class="material-icons">check_circle</i> Approve</button>
                    <button class="action-btn info-btn reject-btn" data-id="${booking.id}" title="Reject"><i class="material-icons">cancel</i> Reject</button>
                </div>
            `;
            container.appendChild(bookingItem);
        });

        // Add event listeners for approve/reject buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = +this.getAttribute('data-id');
                alert('Approve booking ID: ' + id);
                // Implement actual approval logic here
            });
        });
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = +this.getAttribute('data-id');
                alert('Reject booking ID: ' + id);
                // Implement actual rejection logic here
            });
        });
    }

    // --- Utility Functions ---
    function renderWalkinGuestList() {
        const guestDetails = document.getElementById('quick-booking-guest-details');
        const tbody = guestDetails.querySelector('tbody');
        const count = guestDetails.querySelector('.walkin-count');
        tbody.innerHTML = '';
        if (walkinGuests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">No walk-in guests yet.</td></tr>';
        } else {
            walkinGuests.forEach((guest, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding:8px;">${guest.name}</td>
                    <td style="padding:8px;">${guest.cottage}</td>
                    <td style="padding:8px;">${guest.bookingType}</td>
                    <td style="padding:8px;">${guest.date}</td>
                    <td style="padding:8px;"><button class="remove-guest-btn" data-idx="${idx}" style="color:#fff;background:#e74c3c;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;">Remove</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
        if (count) count.textContent = walkinGuests.length;
        // Add remove event listeners
        guestDetails.querySelectorAll('.remove-guest-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = +this.getAttribute('data-idx');
                walkinGuests.splice(idx, 1);
                renderWalkinGuestList();
                showAlert('Guest removed.', 'success');
            };
        });
    }

    function showAlert(msg, type) {
        let alert = document.getElementById('quick-booking-alert');
        if (!alert) {
            alert = document.createElement('div');
            alert.id = 'quick-booking-alert';
            alert.style.position = 'fixed';
            alert.style.top = '24px';
            alert.style.right = '24px';
            alert.style.zIndex = '2000';
            alert.style.padding = '14px 24px';
            alert.style.borderRadius = '8px';
            alert.style.fontWeight = '600';
            alert.style.fontSize = '1.1em';
            alert.style.boxShadow = '0 2px 12px rgba(80,80,120,0.10)';
            document.body.appendChild(alert);
        }
        alert.textContent = msg;
        alert.style.background = type === 'success' ? '#6c63ff' : '#e74c3c';
        alert.style.color = '#fff';
        alert.style.display = 'block';
        setTimeout(() => { alert.style.display = 'none'; }, 2200);
    }

    // --- Booking Form Submission ---
    const quickBookingForm = document.querySelector('.quick-booking-form');
    if (quickBookingForm) {
        quickBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Validate fields
            const name = document.getElementById('qb-full-name').value.trim();
            const phone = document.getElementById('qb-phone').value.trim();
            const bookingType = document.getElementById('qb-booking-type').value;
            const cottageType = document.getElementById('qb-cottage-type').value;
            let date = '';
            if (bookingType === 'daytour') {
                date = document.getElementById('qb-schedule-date').value;
                if (!date) return showAlert('Please select a schedule date.', 'error');
                date = `${date} (8am–6pm)`;
            } else if (bookingType === 'overnight') {
                const checkin = document.getElementById('qb-checkin-date').value;
                const checkout = document.getElementById('qb-checkout-date').value;
                if (!checkin || !checkout) return showAlert('Please select check-in and check-out dates.', 'error');
                date = `${checkin} to ${checkout}`;
            }
            if (!name) return showAlert('Full Name is required.', 'error');
            if (!phone) return showAlert('Phone Number is required.', 'error');
            if (!bookingType) return showAlert('Booking Type is required.', 'error');
            if (!cottageType) return showAlert('Cottage Type is required.', 'error');
            // Add to walk-in guest list
            walkinGuests.unshift({ name, cottage: cottageType.charAt(0).toUpperCase() + cottageType.slice(1).replace('cottage',' Cottage'), bookingType: bookingType === 'daytour' ? 'Day Tour' : 'Overnight Stay', date });
            renderWalkinGuestList();
            quickBookingForm.reset();
            // Show success
            showAlert('Walk-in booking added!', 'success');
        });
    }

    // Render guest list on load and when switching tabs
    const guestDetailsTab = document.querySelector('.quick-booking-tabs .tab:nth-child(2)');
    if (guestDetailsTab) {
        guestDetailsTab.addEventListener('click', renderWalkinGuestList);
    }
    // Also render on page load in case tab is already active
    renderWalkinGuestList();

    // Dashboard buttons: View Details and View Report
    const viewDetailsBtn = document.querySelector('.dashboard-overview .card .action-btn-primary');
    const viewReportBtn = document.querySelectorAll('.dashboard-overview .card .action-btn-primary')[1];
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', function() {
            showDashboardModal('Total Occupancy Details', `
                <ul style='padding-left:18px;'>
                    <li>Occupied Rooms: 39</li>
                    <li>Vacant Rooms: 11</li>
                    <li>Occupancy Rate: 78%</li>
                    <li>Most Popular Room: Ocean View Suite</li>
                </ul>
            `);
        });
    }
    if (viewReportBtn) {
        viewReportBtn.addEventListener('click', function() {
            showDashboardModal('Today\'s Revenue Report', `
                <ul style='padding-left:18px;'>
                    <li>Total Revenue: $4,850</li>
                    <li>Bookings: 12</li>
                    <li>Highest Sale: Villa - $1,200</li>
                    <li>Most Booked: Standard Cottage</li>
                </ul>
            `);
        });
    }
    function showDashboardModal(title, content) {
        let modal = document.getElementById('dashboard-info-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'dashboard-info-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(30,30,50,0.18)';
            modal.style.zIndex = '3000';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.innerHTML = `<div style='background:#fff;max-width:400px;width:90%;border-radius:14px;box-shadow:0 8px 32px rgba(80,80,120,0.18);padding:32px 24px 18px 24px;position:relative;'>
                <span id='close-dashboard-info-modal' style='position:absolute;top:12px;right:18px;font-size:1.7em;cursor:pointer;color:#888;'>&times;</span>
                <h2 style='margin-top:0;font-size:1.3em;color:#6c63ff;'>${title}</h2>
                <div style='margin-top:12px;'>${content}</div>
            </div>`;
            document.body.appendChild(modal);
        } else {
            modal.querySelector('h2').textContent = title;
            modal.querySelector('div[style*="margin-top:12px;"]').innerHTML = content;
            modal.style.display = 'flex';
        }
        document.getElementById('close-dashboard-info-modal').onclick = function() {
            modal.style.display = 'none';
        };
    }

    showDashboard();
}); 