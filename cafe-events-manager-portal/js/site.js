import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm';

// Supabase configuration - REPLACE WITH YOUR ACTUAL VALUES
const SUPABASE_URL = 'https://qyisixwhqyvuokqwyhju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5aXNpeHdocXl2dW9rcXd5aGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzk4NjMsImV4cCI6MjA2OTM1NTg2M30.ii3YhfXs08p1xgupeqI7AgSVO27iUDoJg1FX1LPP1vA';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Tab switching
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
            
            // Refresh data when switching to different tabs
            if (tabName === 'dashboard') {
                loadDashboardData();
            } else if (tabName === 'events') {
                loadEvents();
            } else if (tabName === 'bookings') {
                loadAllBookings();
            }
        }

        // Load dashboard statistics
        async function loadDashboardData() {
            try {
                // Get total events
                const { data: events, error: eventsError } = await supabase
                    .from('events')
                    .select('*');
                
                if (eventsError) throw eventsError;
                
                // Get total bookings and calculate revenue
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
                document.getElementById('totalEvents').textContent = totalEvents;
                document.getElementById('totalBookings').textContent = totalBookings;
                document.getElementById('totalRevenue').textContent = `${totalRevenue.toFixed(2)}`;
                document.getElementById('upcomingEvents').textContent = upcomingEvents;
                
                // Load recent bookings
                const { data: recentBookings, error: recentError } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        events!inner(title, date)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(10);
                
                if (recentError) throw recentError;
                
                populateRecentBookings(recentBookings);
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                showMessage('error', 'Failed to load dashboard data');
            }
        }

        // Populate recent bookings table
        function populateRecentBookings(bookings) {
            const tbody = document.querySelector('#recentBookingsTable tbody');
            tbody.innerHTML = '';
            
            bookings.forEach(booking => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${booking.customer_name}</td>
                    <td>${booking.events.title}</td>
                    <td>${booking.guests}</td>
                    <td>${new Date(booking.events.date).toLocaleDateString()}</td>
                `;
            });
        }

        // Load all events
        async function loadEvents() {
            try {
                const { data, error } = await supabase
                    .from('event_availability')
                    .select('*')
                    .order('date', { ascending: true });
                
                if (error) throw error;
                
                populateEventsTable(data);
            } catch (error) {
                console.error('Error loading events:', error);
                showMessage('error', 'Failed to load events');
            }
        }

        // Populate events table
        function populateEventsTable(events) {
            const tbody = document.querySelector('#eventsTable tbody');
            tbody.innerHTML = '';
            
            events.forEach(event => {
                const row = tbody.insertRow();
                const eventDate = new Date(event.date).toLocaleDateString();
                const eventTime = formatTime(event.time);
                
                row.innerHTML = `
                    <td>${event.title}</td>
                    <td>${eventDate}</td>
                    <td>${eventTime}</td>
                    <td>${parseFloat(event.price).toFixed(2)}</td>
                    <td>${event.booked_spots}/${event.max_spots}</td>
                    <td>${event.available_spots}</td>
                    <td>
                        <button class="btn btn-small btn-danger" onclick="deleteEvent(${event.id})">
                            Delete
                        </button>
                    </td>
                `;
            });
        }

        // Load all bookings
        async function loadAllBookings() {
            try {
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
                showMessage('error', 'Failed to load bookings');
            }
        }

        // Populate all bookings table
        function populateAllBookingsTable(bookings) {
            const tbody = document.querySelector('#allBookingsTable tbody');
            tbody.innerHTML = '';
            
            bookings.forEach(booking => {
                const row = tbody.insertRow();
                const bookingDate = new Date(booking.created_at).toLocaleDateString();
                
                row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.customer_name}</td>
                    <td>${booking.email}</td>
                    <td>${booking.phone || 'N/A'}</td>
                    <td>${booking.events.title}</td>
                    <td>${booking.guests}</td>
                    <td>${bookingDate}</td>
                    <td>
                        <span style="color: green; font-weight: bold;">
                            ${booking.booking_status}
                        </span>
                    </td>
                `;
            });
        }

        // Add new event
        document.getElementById('eventForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Adding...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const eventData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    date: formData.get('date'),
                    time: formData.get('time'),
                    duration: formData.get('duration') || null,
                    price: parseFloat(formData.get('price')),
                    max_spots: parseInt(formData.get('max_spots')),
                    category: formData.get('category')
                };
                
                const { data, error } = await supabase
                    .from('events')
                    .insert([eventData])
                    .select();
                
                if (error) throw error;
                
                showMessage('success', 'Event added successfully!', 'event');
                this.reset();
                loadEvents();
                
            } catch (error) {
                console.error('Error adding event:', error);
                showMessage('error', error.message || 'Failed to add event', 'event');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Delete event
        async function deleteEvent(eventId) {
            if (!confirm('Are you sure you want to delete this event? This will also delete all associated bookings.')) {
                return;
            }
            
            try {
                const { error } = await supabase
                    .from('events')
                    .delete()
                    .eq('id', eventId);
                
                if (error) throw error;
                
                showMessage('success', 'Event deleted successfully!', 'event');
                loadEvents();
                
            } catch (error) {
                console.error('Error deleting event:', error);
                showMessage('error', error.message || 'Failed to delete event', 'event');
            }
        }

        // Format time helper
        function formatTime(timeString) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }

        // Show success/error messages
        function showMessage(type, message, context = '') {
            const messageId = context ? `${context}${type === 'success' ? 'Success' : 'Error'}Message` : `${type}Message`;
            const messageElement = document.getElementById(messageId);
            
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.style.display = 'block';
                
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 5000);
            }
        }

        // Initialize the admin panel
        document.addEventListener('DOMContentLoaded', function() {
            // Check if Supabase is configured
            if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
                alert('Please configure your Supabase credentials in the JavaScript code');
                return;
            }
            
            // Set minimum date to today for new events
            document.getElementById('eventDate').min = new Date().toISOString().split('T')[0];
            
            // Load initial dashboard data
            loadDashboardData();
        });