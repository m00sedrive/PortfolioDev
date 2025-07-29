import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm';

// Supabase configuration - REPLACE WITH YOUR ACTUAL VALUES
const SUPABASE_URL = 'https://qyisixwhqyvuokqwyhju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5aXNpeHdocXl2dW9rcXd5aGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzk4NjMsImV4cCI6MjA2OTM1NTg2M30.ii3YhfXs08p1xgupeqI7AgSVO27iUDoJg1FX1LPP1vA';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global events storage
let events = [];

// Load events from Supabase
async function loadEvents() {
    try {
        const { data, error } = await supabase
            .from('event_availability')
            .select('*')
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) {
            console.error('Error loading events:', error);
            showError('Failed to load events. Please refresh the page.');
            return;
        }

        events = data || [];
        populateEvents();
    } catch (err) {
        console.error('Error connecting to database:', err);
        showError('Unable to connect to database. Please check your internet connection.');
    }
}

// Populate events grid
function populateEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    const eventSelect = document.getElementById('event');

    eventsGrid.innerHTML = '';
    eventSelect.innerHTML = '<option value="">Choose an event...</option>';

    if (events.length === 0) {
        eventsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No upcoming events available. Please check back later!</p>';
        return;
    }

    events.forEach(event => {
        const availableSpots = event.available_spots;
        const eventDate = new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format time from 24hr to 12hr
        const eventTime = formatTime(event.time);

        // Create event card
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card fade-in';
        eventCard.innerHTML = `
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <div class="event-meta">
                            <span>📅 ${eventDate}</span>
                            <span>🕒 ${eventTime}</span>
                        </div>
                        <div class="event-meta">
                            <span>💰 ${parseFloat(event.price).toFixed(2)}</span>
                            <span class="available-spots">${availableSpots} spots left</span>
                        </div>
                        <button class="book-btn" onclick="openBookingModal(${event.id})" ${!event.is_available ? 'disabled' : ''}>
                            ${!event.is_available ? 'Sold Out' : 'Book Now'}
                        </button>
                    `;

        eventsGrid.appendChild(eventCard);

        // Add to select dropdown
        if (event.is_available) {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.title} - ${eventDate} (${parseFloat(event.price).toFixed(2)})`;
            eventSelect.appendChild(option);
        }
    });
}

// Format time helper
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Open booking modal
function openBookingModal(eventId) {
    const event = events.find(e => e.id === eventId);
    const modal = document.getElementById('bookingModal');
    const modalTitle = document.getElementById('modalTitle');
    const eventSelect = document.getElementById('event');

    modalTitle.textContent = `Book: ${event.title}`;
    eventSelect.value = eventId;
    modal.style.display = 'block';

    // Scroll to booking form
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        modal.style.display = 'none';
    }, 100);
}

window.openBookingModal = openBookingModal;

// Close modal
function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

window.closeModal = closeModal;

// Form submission with Supabase integration
document.getElementById('bookingForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    try {
        // Get form data
        const formData = new FormData(this);
        const bookingData = {
            event_id: parseInt(formData.get('event')),
            customer_name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || null,
            guests: parseInt(formData.get('guests')) || 1,
            message: formData.get('message') || null
        };

        // Validate required fields
        if (!bookingData.event_id || !bookingData.customer_name || !bookingData.email) {
            throw new Error('Please fill in all required fields');
        }

        // Check event availability before booking
        const selectedEvent = events.find(event => event.id === bookingData.event_id);
        if (!selectedEvent || !selectedEvent.is_available) {
            throw new Error('This event is no longer available');
        }

        if (selectedEvent.available_spots < bookingData.guests) {
            throw new Error(`Only ${selectedEvent.available_spots} spots remaining. Please reduce the number of guests.`);
        }

        // Submit booking to Supabase
        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'block';
        successMessage.textContent = 'Thank you! Your booking has been confirmed. You should receive a confirmation email shortly.';

        // Reset form
        this.reset();

        // Refresh events to show updated availability
        await loadEvents();

        // Hide success message after 7 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 7000);

    } catch (error) {
        console.error('Booking error:', error);
        showError(error.message || 'Failed to process booking. Please try again.');
    } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Error display function
function showError(message) {
    // Create or update error message element
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.style.cssText = `
                        background: linear-gradient(45deg, #f44336, #d32f2f);
                        color: white;
                        padding: 1rem;
                        border-radius: 10px;
                        margin: 1rem 0;
                        text-align: center;
                        display: none;
                    `;
        document.getElementById('successMessage').parentNode.insertBefore(errorDiv, document.getElementById('successMessage'));
    }

    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize fade-in animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.style.animationDelay = '0s';
        }
    });
}

window.addEventListener('scroll', animateOnScroll);

// Initialize the page
document.addEventListener('DOMContentLoaded', async function () {
    // Check if Supabase is configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        showError('Please configure your Supabase credentials in the JavaScript code');
        return;
    }

    await loadEvents();
    animateOnScroll();
});

// Close modal when clicking outside
window.addEventListener('click', function (e) {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        closeModal();
    }
});