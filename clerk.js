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

    // --- Socket.IO for real-time updates ---
    const socket = io('https://villa-ester-backend.onrender.com', {
      transports: ['websocket', 'polling']
    });

    let bookingsData = [];

    // Fetch bookings from backend
    async function fetchBookings() {
        try {
            const response = await fetch('https://villa-ester-backend.onrender.com/api/bookings');
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                bookingsData = data.data;
            } else if (Array.isArray(data)) {
                bookingsData = data; // fallback for old API
            } else {
                bookingsData = [];
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            bookingsData = [];
        }
    }

    // Listen for real-time booking events
    socket.on('booking-created', (data) => {
        fetchBookings().then(renderBookingList);
    });
    socket.on('booking-updated', (data) => {
        fetchBookings().then(renderBookingList);
    });

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

    // --- Dashboard Data ---
    let cottagesData = [];

    // Fetch cottages from backend
    async function fetchCottages() {
        try {
            const response = await fetch('https://villa-ester-backend.onrender.com/api/cottages');
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                cottagesData = data.data;
            } else if (Array.isArray(data)) {
                cottagesData = data;
            } else {
                cottagesData = [];
            }
        } catch (err) {
            console.error('Failed to fetch cottages:', err);
            cottagesData = [];
        }
    }

    // Update dashboard overview
    function updateDashboardOverview() {
        // Calculate occupancy
        const today = new Date().toISOString().slice(0, 10);
        let occupiedCount = 0;
        let todayRevenue = 0;
        let todayBookings = 0;
        const occupiedCottageIds = new Set();

        bookingsData.forEach(booking => {
            // Check if booking is for today and not cancelled
            const bookingDate = (booking.bookingDate || '').slice(0, 10);
            if ((booking.status !== 'cancelled' && booking.status !== 'rejected') && bookingDate === today) {
                occupiedCottageIds.add(booking.cottageId || booking.cottage || booking.cottageName);
                todayRevenue += booking.price || 0;
                todayBookings++;
            }
        });
        occupiedCount = occupiedCottageIds.size;
        const totalCottages = cottagesData.length;
        const occupancy = totalCottages ? Math.round((occupiedCount / totalCottages) * 100) : 0;

        // Update DOM
        const occupancyCard = document.querySelector('#dashboard-overview-panel .card:nth-child(1) p');
        const revenueCard = document.querySelector('#dashboard-overview-panel .card:nth-child(2) p');
        if (occupancyCard) {
            occupancyCard.textContent = `${occupancy}% of rooms currently occupied`;
        }
        if (revenueCard) {
            revenueCard.textContent = `₱${todayRevenue.toLocaleString()} from ${todayBookings} bookings`;
        }
    }

    // Update room occupancy status table
    function updateRoomOccupancyTable() {
        const tableBody = document.querySelector('.room-occupancy-status tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const today = new Date().toISOString().slice(0, 10);
        const occupiedCottageIds = new Set();
        bookingsData.forEach(booking => {
            const bookingDate = (booking.bookingDate || '').slice(0, 10);
            if ((booking.status !== 'cancelled' && booking.status !== 'rejected') && bookingDate === today) {
                occupiedCottageIds.add(booking.cottageId || booking.cottage || booking.cottageName);
            }
        });
        cottagesData.forEach(cottage => {
            const isOccupied = occupiedCottageIds.has(cottage._id) || occupiedCottageIds.has(cottage.name);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cottage.name || cottage._id}</td>
                <td class="${isOccupied ? 'occupied' : 'vacant'}">${isOccupied ? 'Occupied' : 'Vacant'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Update dashboard and table after fetching data
    async function updateDashboardAndTable() {
        await Promise.all([fetchBookings(), fetchCottages()]);
        updateDashboardOverview();
        updateRoomOccupancyTable();
    }

    // On dashboard load, update with real data
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
        updateDashboardAndTable();
    }

    function renderBookingList() {
        const container = document.getElementById('arrival-list-container');
        if (!container) return;

        container.innerHTML = '';

        // Get today's date in YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10);
        // Filter bookings for today and not cancelled/rejected
        const todaysArrivals = bookingsData.filter(booking => {
            const bookingDate = (booking.bookingDate || '').slice(0, 10);
            return (
                bookingDate === today &&
                booking.status !== 'cancelled' &&
                booking.status !== 'rejected'
            );
        });

        if (!todaysArrivals.length) {
            container.innerHTML = '<p style="text-align:center; color:#888;">No arrivals for today.</p>';
            return;
        }

        todaysArrivals.forEach(booking => {
            const arrivalItem = document.createElement('div');
            arrivalItem.classList.add('arrival-item');

            const guestName = booking.guestName || booking.name || booking.contactName || 'Guest';
            const room = booking.cottageName || booking.room || booking.cottage || 'N/A';
            const roomType = booking.cottageType || booking.roomType || 'Cottage';
            const eta = booking.bookingTime || booking.eta || '-';
            const adults = booking.adults || booking.numberOfPeople || 1;
            const children = booking.children || 0;
            const paxString = children > 0 ? `${adults} Adults, ${children} Child${children > 1 ? 'ren' : ''}` : `${adults} Adult${adults > 1 ? 's' : ''}`;

            arrivalItem.innerHTML = `
                <div class="arrival-details">
                    <i class="material-icons person-icon">person</i>
                    <div class="guest-info">
                        <span class="guest-name">${guestName}</span>
                    </div>
                    <div class="room-details">
                        <span class="room-number-text">${room}</span>
                        <span class="room-type-text">${roomType}</span>
                    </div>
                    <div class="booking-info">
                        <span class="eta">ETA: ${eta}</span>
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

        // Optionally, update the header count
        const guestListHeader = document.querySelector('.guest-list-header');
        if (guestListHeader) {
            guestListHeader.textContent = `Today's Arrivals (${todaysArrivals.length})`;
        }
    }

    // In renderPendingBookingList, show proof of payment image if available
    function renderPendingBookingList() {
        const container = document.getElementById('pending-bookings-container');
        const noBookingsMessage = document.getElementById('no-pending-bookings');
        if (!container || !noBookingsMessage) return;
        container.innerHTML = '';
        // Filter for pending bookings
        const pendingBookings = bookingsData.filter(booking => booking.status === 'pending');
        if (!pendingBookings.length) {
            noBookingsMessage.style.display = 'block';
            return;
        } else {
            noBookingsMessage.style.display = 'none';
        }
        pendingBookings.forEach(booking => {
            const item = document.createElement('div');
            item.classList.add('pending-booking-item');
            const guestName = booking.guestName || booking.name || booking.contactName || 'Guest';
            const roomType = booking.cottageType || booking.roomType || 'Cottage';
            const checkin = booking.checkinDate || booking.bookingDate || '-';
            const checkout = booking.checkoutDate || '-';
            const adults = booking.adults || booking.numberOfPeople || 1;
            const children = booking.children || 0;
            const proofUrl = booking.proofOfPayment ? (booking.proofOfPayment.startsWith('http') ? booking.proofOfPayment : `https://villa-ester-backend.onrender.com${booking.proofOfPayment}`) : '';
            item.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <i class="material-icons">person</i>
                    <span style="font-weight:600;">${guestName}</span>
                </div>
                <div style="margin-left:32px;min-width:180px;">${roomType}<br><span style="font-size:0.95em;color:#888;">Check-in: ${checkin}<br>Check-out: ${checkout}</span></div>
                <div style="margin-left:32px;min-width:120px;">${adults} Adult${adults>1?'s':''}, ${children} Child${children!==1?'ren':''}</div>
                <div style="margin-left:32px;min-width:120px;">Status: <span style="font-weight:600;">${booking.status.charAt(0).toUpperCase()+booking.status.slice(1)}</span></div>
                <div style="margin-left:32px;min-width:120px;">
                    ${proofUrl ? `<a href="${proofUrl}" target="_blank" title="View Proof of Payment"><img src="${proofUrl}" alt="Proof of Payment" style="max-width:60px;max-height:40px;border-radius:4px;box-shadow:0 1px 4px #ccc;vertical-align:middle;"></a>` : '<span style="color:#888;font-size:0.95em;">No proof uploaded</span>'}
                </div>
                <div style="margin-left:auto;display:flex;gap:16px;">
                    <button class="btn-approve" title="Approve" style="color:#43a047;background:none;border:none;cursor:pointer;font-size:1.1em;display:flex;align-items:center;"><i class="material-icons">check_circle</i> Approve</button>
                    <button class="btn-reject" title="Reject" style="color:#1976d2;background:none;border:none;cursor:pointer;font-size:1.1em;display:flex;align-items:center;"><i class="material-icons">cancel</i> Reject</button>
                </div>
            `;
            // Approve action
            item.querySelector('.btn-approve').onclick = async () => {
                await updateBookingStatus(booking._id, 'confirmed');
            };
            // Reject action
            item.querySelector('.btn-reject').onclick = async () => {
                await updateBookingStatus(booking._id, 'rejected');
            };
            container.appendChild(item);
        });
    }

    async function updateBookingStatus(bookingId, status) {
        try {
            const response = await fetch(`https://villa-ester-backend.onrender.com/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                await fetchBookings();
                renderPendingBookingList();
                renderBookingList(); // update arrivals too
            } else {
                alert('Failed to update booking status.');
            }
        } catch (err) {
            alert('Error updating booking: ' + err.message);
        }
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

    // --- Quick Booking Form Submission ---
    const quickBookingForm = document.querySelector('.quick-booking-form');
    const quickBookingAlert = document.getElementById('quick-booking-alert');
    if (quickBookingForm) {
        quickBookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            // Collect form data
            const fullName = document.getElementById('qb-full-name').value.trim();
            const phone = document.getElementById('qb-phone').value.trim();
            const email = document.getElementById('qb-email').value.trim();
            const specialRequests = document.getElementById('qb-special-requests').value.trim();
            const bookingType = document.getElementById('qb-booking-type').value;
            const cottageType = document.getElementById('qb-cottage-type').value;
            let bookingDate = '';
            let checkinDate = '';
            let checkoutDate = '';
            if (bookingType === 'daytour') {
                bookingDate = document.getElementById('qb-schedule-date').value;
            } else if (bookingType === 'overnight') {
                checkinDate = document.getElementById('qb-checkin-date').value;
                checkoutDate = document.getElementById('qb-checkout-date').value;
            }
            const adults = parseInt(document.getElementById('qb-adults').value, 10) || 1;
            const children = parseInt(document.getElementById('qb-children').value, 10) || 0;
            // Prepare booking data
            const bookingData = {
                name: fullName,
                contactPhone: phone,
                contactEmail: email,
                specialRequests,
                bookingType,
                cottageType,
                bookingDate: bookingDate || checkinDate,
                checkinDate,
                checkoutDate,
                adults,
                children,
                numberOfPeople: adults + children,
                status: 'pending',
                createdAt: new Date()
            };
            try {
                const response = await fetch('https://villa-ester-backend.onrender.com/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });
                if (response.ok) {
                    quickBookingForm.reset();
                    if (quickBookingAlert) {
                        quickBookingAlert.style.display = 'block';
                        quickBookingAlert.style.color = '#4CAF50';
                        quickBookingAlert.textContent = 'Booking successful!';
                        setTimeout(() => { quickBookingAlert.style.display = 'none'; }, 3000);
                    }
                    // Optionally, switch to Guest Details tab or update guest list
                } else {
                    const error = await response.json();
                    if (quickBookingAlert) {
                        quickBookingAlert.style.display = 'block';
                        quickBookingAlert.style.color = '#dc3545';
                        quickBookingAlert.textContent = 'Booking failed: ' + (error.message || 'Unknown error');
                        setTimeout(() => { quickBookingAlert.style.display = 'none'; }, 4000);
                    }
                }
            } catch (err) {
                if (quickBookingAlert) {
                    quickBookingAlert.style.display = 'block';
                    quickBookingAlert.style.color = '#dc3545';
                    quickBookingAlert.textContent = 'Booking failed: ' + err.message;
                    setTimeout(() => { quickBookingAlert.style.display = 'none'; }, 4000);
                }
            }
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
            // Calculate real occupancy details
            const today = new Date().toISOString().slice(0, 10);
            const occupiedCottageIds = new Set();
            const cottageBookingCounts = {};
            bookingsData.forEach(booking => {
                const bookingDate = (booking.bookingDate || '').slice(0, 10);
                if ((booking.status !== 'cancelled' && booking.status !== 'rejected') && bookingDate === today) {
                    const cottageId = booking.cottageId || booking.cottage || booking.cottageName;
                    occupiedCottageIds.add(cottageId);
                    if (cottageId) {
                        cottageBookingCounts[cottageId] = (cottageBookingCounts[cottageId] || 0) + 1;
                    }
                }
            });
            const occupiedCount = occupiedCottageIds.size;
            const totalCottages = cottagesData.length;
            const vacantCount = totalCottages - occupiedCount;
            const occupancy = totalCottages ? Math.round((occupiedCount / totalCottages) * 100) : 0;
            // Find most popular cottage
            let mostPopularCottage = 'N/A';
            let maxBookings = 0;
            cottagesData.forEach(cottage => {
                const count = cottageBookingCounts[cottage._id] || cottageBookingCounts[cottage.name] || 0;
                if (count > maxBookings) {
                    maxBookings = count;
                    mostPopularCottage = cottage.name;
                }
            });
            showDashboardModal('Total Occupancy Details', `
                <ul style='padding-left:18px;'>
                    <li>Occupied Cottages: ${occupiedCount}</li>
                    <li>Vacant Cottages: ${vacantCount}</li>
                    <li>Occupancy Rate: ${occupancy}%</li>
                    <li>Most Popular Cottage: ${mostPopularCottage}</li>
                </ul>
            `);
        });
    }
    if (viewReportBtn) {
        viewReportBtn.addEventListener('click', function() {
            // Calculate real revenue details
            const today = new Date().toISOString().slice(0, 10);
            let todayRevenue = 0;
            let todayBookings = 0;
            let highestSale = 0;
            let highestSaleCottage = 'N/A';
            const cottageBookingCounts = {};
            bookingsData.forEach(booking => {
                const bookingDate = (booking.bookingDate || '').slice(0, 10);
                if ((booking.status !== 'cancelled' && booking.status !== 'rejected') && bookingDate === today) {
                    todayRevenue += booking.price || 0;
                    todayBookings++;
                    const cottageId = booking.cottageId || booking.cottage || booking.cottageName;
                    if (booking.price > highestSale) {
                        highestSale = booking.price;
                        highestSaleCottage = cottageId;
                    }
                    if (cottageId) {
                        cottageBookingCounts[cottageId] = (cottageBookingCounts[cottageId] || 0) + 1;
                    }
                }
            });
            // Find most booked cottage
            let mostBookedCottage = 'N/A';
            let maxBookings = 0;
            cottagesData.forEach(cottage => {
                const count = cottageBookingCounts[cottage._id] || cottageBookingCounts[cottage.name] || 0;
                if (count > maxBookings) {
                    maxBookings = count;
                    mostBookedCottage = cottage.name;
                }
            });
            showDashboardModal("Today's Revenue Report", `
                <ul style='padding-left:18px;'>
                    <li>Total Revenue: ₱${todayRevenue.toLocaleString()}</li>
                    <li>Bookings: ${todayBookings}</li>
                    <li>Highest Sale: ${highestSaleCottage !== 'N/A' ? highestSaleCottage + ' - ₱' + highestSale.toLocaleString() : 'N/A'}</li>
                    <li>Most Booked: ${mostBookedCottage}</li>
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

    // Print Reports: Print today's arrivals as a log book
    function printTodaysArrivals() {
        // Get today's arrivals
        const today = new Date().toISOString().slice(0, 10);
        const todaysArrivals = bookingsData.filter(booking => {
            const bookingDate = (booking.bookingDate || '').slice(0, 10);
            return (
                bookingDate === today &&
                booking.status !== 'cancelled' &&
                booking.status !== 'rejected'
            );
        });
        let printWindow = window.open('', '', 'width=900,height=700');
        printWindow.document.write('<html><head><title>Today\'s Arrivals Log Book</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#f0f0f0;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h2>Today\'s Arrivals Log Book</h2>');
        printWindow.document.write('<table><thead><tr><th>Guest Name</th><th>Room</th><th>Type</th><th>ETA</th><th>Pax</th></tr></thead><tbody>');
        todaysArrivals.forEach(booking => {
            const guestName = booking.guestName || booking.name || booking.contactName || 'Guest';
            const room = booking.cottageName || booking.room || booking.cottage || 'N/A';
            const roomType = booking.cottageType || booking.roomType || 'Cottage';
            const eta = booking.bookingTime || booking.eta || '-';
            const adults = booking.adults || booking.numberOfPeople || 1;
            const children = booking.children || 0;
            const paxString = children > 0 ? `${adults} Adults, ${children} Child${children > 1 ? 'ren' : ''}` : `${adults} Adult${adults > 1 ? 's' : ''}`;
            printWindow.document.write(`<tr><td>${guestName}</td><td>${room}</td><td>${roomType}</td><td>${eta}</td><td>${paxString}</td></tr>`);
        });
        printWindow.document.write('</tbody></table>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    // Modify Stay: Show a modal (placeholder for now)
    function showModifyStayModal() {
        alert('Modify Stay feature coming soon! Here you will be able to change dates, room, or guest details for current guests.');
    }

    // --- Settings: Real Backend Integration ---
    const token = localStorage.getItem('token');
    const usernameInput = document.getElementById('profile-username');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    // Fetch user profile on settings panel load
    async function fetchUserProfile() {
        if (!token) return;
        try {
            const res = await fetch('https://villa-ester-backend.onrender.com/api/users/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success && data.data) {
                if (usernameInput) usernameInput.value = data.data.name || 'clerk';
                if (emailInput) emailInput.value = data.data.email || '';
                if (phoneInput) phoneInput.value = data.data.phone || '';
            }
        } catch (err) { /* ignore */ }
    }
    // Call on load
    fetchUserProfile();

    // Change Number logic
    const changeNumberBtn = document.getElementById('change-number-btn');
    if (changeNumberBtn && phoneInput) {
        changeNumberBtn.addEventListener('click', async function() {
            if (phoneInput.readOnly) {
                phoneInput.readOnly = false;
                phoneInput.focus();
                changeNumberBtn.textContent = 'Save Number';
            } else {
                const newPhone = phoneInput.value.trim();
                if (!/^\+?\d[\d\s-]{7,}$/.test(newPhone)) {
                    showAlert('Please enter a valid phone number.', 'error');
                    return;
                }
                try {
                    const res = await fetch('https://villa-ester-backend.onrender.com/api/users/me', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ phone: newPhone })
                    });
                    const data = await res.json();
                    if (data.success) {
                        phoneInput.readOnly = true;
                        changeNumberBtn.textContent = 'Change Number';
                        showAlert('Phone number updated!', 'success');
                    } else {
                        showAlert(data.message || 'Failed to update phone.', 'error');
                    }
                } catch (err) {
                    showAlert('Failed to update phone.', 'error');
                }
            }
        });
    }
    // Change Password modal logic
    const changePasswordBtn = document.getElementById('change-password-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const closePasswordModal = document.getElementById('close-password-modal');
    if (changePasswordBtn && changePasswordModal) {
        changePasswordBtn.addEventListener('click', function() {
            changePasswordModal.style.display = 'flex';
        });
    }
    if (closePasswordModal && changePasswordModal) {
        closePasswordModal.addEventListener('click', function() {
            changePasswordModal.style.display = 'none';
            document.getElementById('change-password-form').reset();
        });
    }
    // Change Password form submit
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const current = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirm = document.getElementById('confirm-password').value;
            if (newPass.length < 4) {
                showAlert('New password must be at least 4 characters.', 'error');
                return;
            }
            if (newPass !== confirm) {
                showAlert('Passwords do not match.', 'error');
                return;
            }
            try {
                const res = await fetch('https://villa-ester-backend.onrender.com/api/users/me/password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                });
                const data = await res.json();
                if (data.success) {
                    showAlert('Password changed successfully!', 'success');
                    changePasswordModal.style.display = 'none';
                    changePasswordForm.reset();
                } else {
                    showAlert(data.message || 'Failed to change password.', 'error');
                }
            } catch (err) {
                showAlert('Failed to change password.', 'error');
            }
        });
    }
    // Sign Out logic
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            showAlert('Signed out!', 'success');
            setTimeout(() => window.location.href = 'login.html', 800);
        });
    }

    showDashboard();
}); 