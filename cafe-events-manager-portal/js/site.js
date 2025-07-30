import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm';

// Supabase configuration - REPLACE WITH YOUR ACTUAL VALUES
const SUPABASE_URL = 'https://qyisixwhqyvuokqwyhju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5aXNpeHdocXl2dW9rcXd5aGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzk4NjMsImV4cCI6MjA2OTM1NTg2M30.ii3YhfXs08p1xgupeqI7AgSVO27iUDoJg1FX1LPP1vA';

// Initialize Supabase client
let supabase;

// Check if Supabase is properly configured
function initializeSupabase() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        document.getElementById('configWarning').style.display = 'block';
        return false;
    }

    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
    } catch (error) {
        showMessage('error', 'Failed to initialize Supabase: ' + error.message);
        return false;
    }
}

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');

    // Load data when switching tabs
    if (!supabase) return;

    switch (tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'events':
            loadEvents();
            break;
        case 'bookings':
            loadAllBookings();
            break;
    }
}

window.showTab = showTab;

// 📊 Dashboard Functions
async function loadDashboardData() {
    try {
        // Show loading state
        updateStats({ totalEvents: '-', totalBookings: '-', totalRevenue: '$-', upcomingEvents: '-' });

        // Get total events
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*');

        if (eventsError) throw eventsError;

        // Get total bookings with event prices
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                        *,
                        events!inner(price)
                    `);

        if (bookingsError) throw bookingsError;

        // Calculate statistics
        const totalEvents = events.length;
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => {
            return sum + (parseFloat(booking.events.price) * booking.guests);
        }, 0);
        const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length;

        // Update dashboard
        updateStats({
            totalEvents,
            totalBookings,
            totalRevenue: `${totalRevenue.toFixed(2)}`,
            upcomingEvents
        });

        // Load recent bookings
        await loadRecentBookings();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('error', 'Failed to load dashboard data: ' + error.message);
        updateStats({ totalEvents: 'Error', totalBookings: 'Error', totalRevenue: 'Error', upcomingEvents: 'Error' });
    }
}

function updateStats(stats) {
    document.getElementById('totalEvents').textContent = stats.totalEvents;
    document.getElementById('totalBookings').textContent = stats.totalBookings;
    document.getElementById('totalRevenue').textContent = stats.totalRevenue;
    document.getElementById('upcomingEvents').textContent = stats.upcomingEvents;
}

async function loadRecentBookings() {
    try {
        const { data: recentBookings, error } = await supabase
            .from('bookings')
            .select(`
                        *,
                        events!inner(title, date)
                    `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        populateRecentBookings(recentBookings);

    } catch (error) {
        console.error('Error loading recent bookings:', error);
        const tbody = document.querySelector('#recentBookingsTable tbody');
        tbody.innerHTML = '<tr><td colspan="5" class="error-message" style="display: table-cell;">Failed to load recent bookings</td></tr>';
    }
}

function populateRecentBookings(bookings) {
    const tbody = document.querySelector('#recentBookingsTable tbody');

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state" style="display: table-cell;">No bookings yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    bookings.forEach(booking => {
        const row = tbody.insertRow();
        const eventDate = new Date(booking.events.date).toLocaleDateString();

        row.innerHTML = `
                    <td>${booking.customer_name}</td>
                    <td>${booking.events.title}</td>
                    <td>${booking.guests}</td>
                    <td>${eventDate}</td>
                    <td><span class="status-badge status-${booking.booking_status}">${booking.booking_status}</span></td>
                `;
    });
}

// 📅 Events Management Functions
async function loadEvents() {
    try {
        const tbody = document.querySelector('#eventsTable tbody');
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading events...</td></tr>';

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        populateEventsTable(data);
    } catch (error) {
        console.error('Error loading events:', error);
        const tbody = document.querySelector('#eventsTable tbody');
        tbody.innerHTML = '<tr><td colspan="8" class="error-message" style="display: table-cell;">Failed to load events</td></tr>';
    }
}

function populateEventsTable(events) {
    const tbody = document.querySelector('#eventsTable tbody');

    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state" style="display: table-cell;"><h3>No events yet</h3><p>Add your first event using the form above!</p></td></tr>';
        return;
    }

    tbody.innerHTML = '';
    events.forEach(event => {
        const row = tbody.insertRow();
        const eventDate = new Date(event.date).toLocaleDateString();
        const eventTime = formatTime(event.time);
        const isUpcoming = new Date(event.date) >= new Date();

        // Calculate spots (in a real app this would come from database joins)
        const bookedSpots = 0; // This would be calculated from bookings table
        const availableSpots = event.max_spots - bookedSpots;

        row.innerHTML = `
                    <td>
                        <strong>${event.title}</strong>
                        ${!isUpcoming ? '<br><small style="color: #999;">Past Event</small>' : ''}
                    </td>
                    <td>${eventDate}</td>
                    <td>${eventTime}</td>
                    <td>$${parseFloat(event.price).toFixed(2)}</td>
                    <td>${bookedSpots}/${event.max_spots}</td>
                    <td>
                        <span style="color: ${availableSpots > 0 ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                            ${availableSpots}
                        </span>
                    </td>
                    <td>
                        <span style="background: rgba(102, 126, 234, 0.1); color: #667eea; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">
                            ${event.category || 'General'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-small btn-danger" onclick="deleteEvent(${event.id})" 
                                ${!isUpcoming ? 'disabled title="Cannot delete past events"' : ''}>
                            🗑️ Delete
                        </button>
                    </td>
                `;
    });
}

// Add new event
document.getElementById('eventForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Adding...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData(this);
        const eventData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            date: formData.get('date'),
            time: formData.get('time'),
            duration: formData.get('duration')?.trim() || null,
            price: parseFloat(formData.get('price')),
            max_spots: parseInt(formData.get('max_spots')),
            category: formData.get('category')
        };

        // Validation
        if (!eventData.title || !eventData.description) {
            throw new Error('Title and description are required');
        }

        if (eventData.price < 0) {
            throw new Error('Price cannot be negative');
        }

        if (eventData.max_spots < 1) {
            throw new Error('Maximum spots must be at least 1');
        }

        // Check if date is in the past
        const eventDate = new Date(eventData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            throw new Error('Event date cannot be in the past');
        }

        const { data, error } = await supabase
            .from('events')
            .insert([eventData])
            .select();

        if (error) throw error;

        showMessage('success', '✅ Event added successfully!', 'event');
        this.reset();
        loadEvents();

    } catch (error) {
        console.error('Error adding event:', error);
        showMessage('error', '❌ ' + (error.message || 'Failed to add event'), 'event');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Delete event
async function deleteEvent(eventId) {
    if (!confirm('🗑️ Are you sure you want to delete this event?\n\nThis will also delete all associated bookings and cannot be undone.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) throw error;

        showMessage('success', '✅ Event deleted successfully!', 'event');
        loadEvents();

        // Refresh dashboard if it's currently visible
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboardData();
        }

    } catch (error) {
        console.error('Error deleting event:', error);
        showMessage('error', '❌ ' + (error.message || 'Failed to delete event'), 'event');
    }
}

// 📋 Bookings Functions
async function loadAllBookings() {
    try {
        const tbody = document.querySelector('#allBookingsTable tbody');
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading bookings...</td></tr>';

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                        *,
                        events!inner(title, date)
                    `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        populateAllBookingsTable(data);
    } catch (error) {
        console.error('Error loading bookings:', error);
        const tbody = document.querySelector('#allBookingsTable tbody');
        tbody.innerHTML = '<tr><td colspan="8" class="error-message" style="display: table-cell;">Failed to load bookings</td></tr>';
    }
}

function populateAllBookingsTable(bookings) {
    const tbody = document.querySelector('#allBookingsTable tbody');

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state" style="display: table-cell;"><h3>No bookings yet</h3><p>Bookings will appear here when customers make reservations.</p></td></tr>';
        return;
    }

    tbody.innerHTML = '';
    bookings.forEach(booking => {
        const row = tbody.insertRow();
        const bookingDate = new Date(booking.created_at).toLocaleDateString();

        row.innerHTML = `
                    <td><strong>#${booking.id}</strong></td>
                    <td>${booking.customer_name}</td>
                    <td><a href="mailto:${booking.email}" style="color: #667eea;">${booking.email}</a></td>
                    <td>${booking.phone ? `<a href="tel:${booking.phone}" style="color: #667eea;">${booking.phone}</a>` : 'N/A'}</td>
                    <td>
                        <strong>${booking.events.title}</strong><br>
                        <small style="color: #666;">${new Date(booking.events.date).toLocaleDateString()}</small>
                    </td>
                    <td><strong>${booking.guests}</strong></td>
                    <td>${bookingDate}</td>
                    <td><span class="status-badge status-${booking.booking_status}">${booking.booking_status}</span></td>
                `;
    });
}

// 🔧 Utility Functions
function formatTime(timeString) {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showMessage(type, message, context = '') {
    const messageId = context ? `${context}${type === 'success' ? 'Success' : 'Error'}Message` : `${type}Message`;
    const messageElement = document.getElementById(messageId);

    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);

        // Scroll to message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        // Fallback to alert if message element not found
        alert(message);
    }
}

// 🚀 Initialize Application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Supabase
    if (!initializeSupabase()) {
        return; // Stop if Supabase not configured
    }

    // Set minimum date to today for new events
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    document.getElementById('eventDate').min = todayString;

    // Load initial dashboard data
    loadDashboardData();

    // Add form validation
    setupFormValidation();
});

// 📝 Form Validation Setup
function setupFormValidation() {
    const form = document.getElementById('eventForm');
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isValid = field.checkValidity() && value !== '';

    field.classList.toggle('error', !isValid);
    field.style.borderColor = isValid ? '#e1e5e9' : '#f44336';

    return isValid;
}

// 🔄 Auto-refresh functionality (optional)
let autoRefreshInterval;

function startAutoRefresh() {
    // Refresh dashboard every 30 seconds if it's the active tab
    autoRefreshInterval = setInterval(() => {
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboardData();
        }
    }, 30000);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Start auto-refresh when page loads
window.addEventListener('load', startAutoRefresh);
window.addEventListener('beforeunload', stopAutoRefresh);

// 🎯 Keyboard Shortcuts
document.addEventListener('keydown', function (e) {
    // Alt + 1/2/3 to switch tabs
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('.tab:nth-child(1)').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('.tab:nth-child(2)').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('.tab:nth-child(3)').click();
                break;
        }
    }
});

// 📱 Touch/Mobile Optimizations
if ('ontouchstart' in window) {
    // Add touch-friendly styles for mobile
    document.body.classList.add('touch-device');
}

// 🔍 Search functionality (bonus feature)
function addSearchToBookings() {
    const searchHTML = `
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="bookingSearch" placeholder="🔍 Search bookings by name, email, or event..." 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e1e5e9; border-radius: 10px; font-size: 1rem;">
                </div>
            `;

    const bookingsTable = document.getElementById('allBookingsTable');
    bookingsTable.insertAdjacentHTML('beforebegin', searchHTML);

    document.getElementById('bookingSearch').addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#allBookingsTable tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Add search when bookings tab is first opened
let searchAdded = false;

// Override the showTab function to include search functionality
const originalShowTab = showTab;
showTab = function (tabName) {
    // Call original function
    originalShowTab.call(this, tabName);

    // Add search functionality if bookings tab and not already added
    if (tabName === 'bookings' && !searchAdded) {
        setTimeout(() => {
            addSearchToBookings();
            searchAdded = true;
        }, 100);
    }
};

// 💾 Export functionality (bonus feature)
function exportBookingsToCSV() {
    if (!supabase) return;

    supabase
        .from('bookings')
        .select(`
                    *,
                    events!inner(title, date, price)
                `)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error) {
                showMessage('error', 'Failed to export bookings');
                return;
            }

            const csv = convertToCSV(data);
            downloadCSV(csv, 'bookings-export.csv');
        });
}

function convertToCSV(data) {
    if (!data.length) return '';

    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Event', 'Event Date', 'Guests', 'Booking Date', 'Status', 'Revenue'];
    const rows = data.map(booking => [
        booking.id,
        booking.customer_name,
        booking.email,
        booking.phone || '',
        booking.events.title,
        booking.events.date,
        booking.guests,
        new Date(booking.created_at).toLocaleDateString(),
        booking.booking_status,
        (parseFloat(booking.events.price) * booking.guests).toFixed(2)
    ]);

    return [headers, ...rows].map(row =>
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Add export button to bookings tab
setTimeout(() => {
    const bookingsTab = document.getElementById('bookings');
    if (bookingsTab) {
        const exportButton = document.createElement('button');
        exportButton.className = 'btn btn-small';
        exportButton.innerHTML = '📊 Export CSV';
        exportButton.onclick = exportBookingsToCSV;
        exportButton.style.marginBottom = '1rem';

        const h3 = bookingsTab.querySelector('h3');
        if (h3) {
            h3.insertAdjacentElement('afterend', exportButton);
        }
    }
}, 1000);

console.log('🎉 Cafe Admin Panel loaded successfully!');
console.log('💡 Keyboard shortcuts: Alt+1 (Dashboard), Alt+2 (Events), Alt+3 (Bookings)');