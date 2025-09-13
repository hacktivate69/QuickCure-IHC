document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
        return;
    }

    // Initialize doctor profile
    window.doctorProfile = new DoctorProfile();
});

class DoctorProfile {
    constructor() {
        this.profileData = JSON.parse(localStorage.getItem('doctor_profile')) || this.getDefaultProfile();
        this.availability = JSON.parse(localStorage.getItem('doctor_availability')) || [];
        this.appointments = JSON.parse(localStorage.getItem('doctor_appointments')) || [];
        this.earnings = {
            today: { amount: 0, consultations: 0 },
            weekly: { amount: 0, consultations: 0 }
        };
        this.editingAvailabilityId = null;
        this.selectedAppointment = null;

        this.initializeDemoData();
        this.initializeEventListeners();
        this.loadAllData();
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    getDefaultProfile() {
        return {
            name: 'Dr. Rajesh Sharma',
            speciality: 'Cardiology',
            experience: '15',
            email: 'rajesh.sharma@healthconnect.com',
            phone: '+91-9876543210',
            address: '123 Medical Street, Mumbai, Maharashtra'
        };
    }

    initializeDemoData() {
        if (this.availability.length === 0) {
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                this.availability.push({
                    id: Date.now() + i,
                    date: date.toISOString().split('T')[0],
                    startTime: '09:00',
                    endTime: '17:00',
                    duration: 30,
                    fee: 500
                });
            }
            this.saveAvailability();
        }

        if (this.appointments.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            this.appointments = [
                { id: 1, date: today, time: '10:30', patientName: 'John Doe', type: 'Follow-up', fee: 500, status: 'completed' },
                { id: 2, date: today, time: '11:00', patientName: 'Jane Smith', type: 'Consultation', fee: 600, status: 'completed' },
                { id: 3, date: today, time: '14:30', patientName: 'Mike Johnson', type: 'Regular Checkup', fee: 500, status: 'confirmed' },
                { id: 4, date: today, time: '15:00', patientName: 'Sarah Wilson', type: 'Emergency', fee: 800, status: 'pending' },
                { id: 5, date: today, time: '16:00', patientName: 'David Brown', type: 'Consultation', fee: 500, status: 'completed' }
            ];
            this.saveAppointments();
        }
        this.calculateEarnings();
    }

    initializeEventListeners() {
        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle('show');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu && !mobileMenuBtn?.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('show');
                const icon = mobileMenuBtn?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Profile edit
        document.getElementById('editProfileBtn').addEventListener('click', () => this.showProfileModal());
        document.getElementById('closeProfileModal').addEventListener('click', () => this.hideProfileModal());
        document.getElementById('cancelProfileBtn').addEventListener('click', () => this.hideProfileModal());
        document.getElementById('profileForm').addEventListener('submit', (e) => this.handleProfileSubmit(e));

        // Availability
        document.getElementById('addAvailabilityBtn').addEventListener('click', () => this.showAvailabilityModal());
        document.getElementById('closeAvailabilityModal').addEventListener('click', () => this.hideAvailabilityModal());
        document.getElementById('cancelAvailabilityBtn').addEventListener('click', () => this.hideAvailabilityModal());
        document.getElementById('availabilityForm').addEventListener('submit', (e) => this.handleAvailabilitySubmit(e));

        // Appointment filters
        document.getElementById('appointmentDate').addEventListener('change', () => this.loadAppointments());
        document.getElementById('appointmentStatus').addEventListener('change', () => this.loadAppointments());

        // Appointment modal
        document.getElementById('closeAppointmentModal').addEventListener('click', () => this.hideAppointmentModal());
        document.getElementById('cancelAppointmentBtn').addEventListener('click', () => this.cancelAppointment());
        document.getElementById('completeAppointmentBtn').addEventListener('click', () => this.completeAppointment());

        // Logout
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Smooth scrolling
        document.querySelectorAll('.nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768) {
                mobileMenu?.classList.remove('show');
                const icon = mobileMenuBtn?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
            this.loadAppointments(); // Reload for mobile/desktop view
        }, 250));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    loadAllData() {
        this.loadProfileDetails();
        this.loadAvailabilityList();
        this.loadAppointments();
        this.loadEarningsStats();
    }

    // Profile Methods
    loadProfileDetails() {
        document.getElementById('profileName').textContent = this.profileData.name;
        document.getElementById('profileSpeciality').textContent = this.profileData.speciality;
        document.getElementById('profileExperience').textContent = `${this.profileData.experience} years`;
        document.getElementById('profileEmail').textContent = this.profileData.email;
        document.getElementById('profilePhone').textContent = this.profileData.phone;
        document.getElementById('profileAddress').textContent = this.profileData.address;
    }

    showProfileModal() {
        document.getElementById('editName').value = this.profileData.name;
        document.getElementById('editSpeciality').value = this.profileData.speciality;
        document.getElementById('editExperience').value = this.profileData.experience;
        document.getElementById('editEmail').value = this.profileData.email;
        document.getElementById('editPhone').value = this.profileData.phone;
        document.getElementById('editAddress').value = this.profileData.address;
        document.getElementById('profileModal').classList.add('show');
    }

    hideProfileModal() {
        document.getElementById('profileModal').classList.remove('show');
    }

    handleProfileSubmit(e) {
        e.preventDefault();
        this.profileData = {
            name: document.getElementById('editName').value,
            speciality: document.getElementById('editSpeciality').value,
            experience: document.getElementById('editExperience').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editAddress').value
        };

        this.saveProfile();
        this.loadProfileDetails();
        this.hideProfileModal();
        this.showNotification('Profile updated successfully!', 'success');
    }

    // Availability Methods
    loadAvailabilityList() {
        const availabilityList = document.getElementById('availabilityList');
        availabilityList.innerHTML = '';

        if (this.availability.length === 0) {
            availabilityList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-calendar-plus" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>No availability set yet.</p>
                    <p>Click "Add Availability" to set your working hours</p>
                </div>
            `;
            return;
        }

        this.availability.forEach(item => {
            const availabilityItem = document.createElement('div');
            availabilityItem.className = 'availability-item';
            availabilityItem.innerHTML = `
                <div class="availability-info">
                    <h3>${this.formatDate(item.date)}</h3>
                    <div class="availability-details">
                        <span><i class="fas fa-clock"></i> ${item.startTime} - ${item.endTime}</span>
                        <span><i class="fas fa-hourglass-half"></i> ${item.duration} min</span>
                        <span><i class="fas fa-rupee-sign"></i> ₹${item.fee}</span>
                    </div>
                </div>
                <div class="availability-actions">
                    <button class="btn btn-small btn-secondary" onclick="doctorProfile.editAvailability(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="doctorProfile.deleteAvailability(${item.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            availabilityList.appendChild(availabilityItem);
        });
    }

    showAvailabilityModal(editId = null) {
        this.editingAvailabilityId = editId;
        const modal = document.getElementById('availabilityModal');
        const title = document.getElementById('availabilityModalTitle');
        
        if (editId) {
            title.textContent = 'Edit Availability';
            const item = this.availability.find(a => a.id === editId);
            if (item) {
                document.getElementById('availabilityDate').value = item.date;
                document.getElementById('startTime').value = item.startTime;
                document.getElementById('endTime').value = item.endTime;
                document.getElementById('consultationDuration').value = item.duration;
                document.getElementById('consultationFee').value = item.fee;
            }
        } else {
            title.textContent = 'Add Availability';
            document.getElementById('availabilityForm').reset();
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('availabilityDate').value = tomorrow.toISOString().split('T')[0];
            document.getElementById('startTime').value = '09:00';
            document.getElementById('endTime').value = '17:00';
            document.getElementById('consultationFee').value = '500';
        }
        
        modal.classList.add('show');
    }

    hideAvailabilityModal() {
        document.getElementById('availabilityModal').classList.remove('show');
        this.editingAvailabilityId = null;
    }

    handleAvailabilitySubmit(e) {
        e.preventDefault();
        
        const availabilityData = {
            date: document.getElementById('availabilityDate').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            duration: parseInt(document.getElementById('consultationDuration').value),
            fee: parseInt(document.getElementById('consultationFee').value)
        };

        if (this.editingAvailabilityId) {
            // Edit existing availability
            const index = this.availability.findIndex(a => a.id === this.editingAvailabilityId);
            if (index !== -1) {
                this.availability[index] = { id: this.editingAvailabilityId, ...availabilityData };
            }
            this.showNotification('Availability updated successfully!', 'success');
        } else {
            // Add new availability
            const newAvailability = {
                id: Date.now(),
                ...availabilityData
            };
            this.availability.push(newAvailability);
            this.showNotification('Availability added successfully!', 'success');
        }

        this.saveAvailability();
        this.loadAvailabilityList();
        this.hideAvailabilityModal();
    }

    editAvailability(id) {
        this.showAvailabilityModal(id);
    }

    deleteAvailability(id) {
        if (confirm('Are you sure you want to delete this availability?')) {
            this.availability = this.availability.filter(a => a.id !== id);
            this.saveAvailability();
            this.loadAvailabilityList();
            this.showNotification('Availability deleted successfully!', 'success');
        }
    }

    // Appointment Methods
    loadAppointments() {
        const tbody = document.getElementById('appointmentTableBody');
        const dateFilter = document.getElementById('appointmentDate').value;
        const statusFilter = document.getElementById('appointmentStatus').value;
        
        let filteredAppointments = this.appointments;
        
        if (dateFilter) {
            filteredAppointments = filteredAppointments.filter(apt => apt.date === dateFilter);
        }
        
        if (statusFilter && statusFilter !== 'all') {
            filteredAppointments = filteredAppointments.filter(apt => apt.status === statusFilter);
        }

        tbody.innerHTML = '';

        if (filteredAppointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: #666;">
                        No appointments found
                    </td>
                </tr>
            `;
            return;
        }

        const isMobile = window.innerWidth <= 768;

        filteredAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            
            if (isMobile) {
                row.innerHTML = `
                    <td>${appointment.time}</td>
                    <td>
                        <div style="font-weight: 600;">${this.truncateText(appointment.patientName, 15)}</div>
                        <div style="font-size: 0.8rem; color: #666;">${this.truncateText(appointment.type, 20)} | ₹${appointment.fee}</div>
                    </td>
                    <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                    <td>
                        <button class="btn btn-small btn-primary" onclick="doctorProfile.viewAppointment(${appointment.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${appointment.time}</td>
                    <td>${this.truncateText(appointment.patientName, 20)}</td>
                    <td>${this.truncateText(appointment.type, 15)}</td>
                    <td>₹${appointment.fee}</td>
                    <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                    <td>
                        <button class="btn btn-small btn-primary" onclick="doctorProfile.viewAppointment(${appointment.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
            }
            
            tbody.appendChild(row);
        });
    }

    viewAppointment(id) {
        const appointment = this.appointments.find(a => a.id === id);
        if (!appointment) return;

        this.selectedAppointment = appointment;
        const modal = document.getElementById('appointmentModal');
        const details = document.getElementById('appointmentDetails');
        
        details.innerHTML = `
            <div class="info-row">
                <label>Patient:</label>
                <span>${appointment.patientName}</span>
            </div>
            <div class="info-row">
                <label>Date:</label>
                <span>${this.formatDate(appointment.date)}</span>
            </div>
            <div class="info-row">
                <label>Time:</label>
                <span>${appointment.time}</span>
            </div>
            <div class="info-row">
                <label>Type:</label>
                <span>${appointment.type}</span>
            </div>
            <div class="info-row">
                <label>Fee:</label>
                <span>₹${appointment.fee}</span>
            </div>
            <div class="info-row">
                <label>Status:</label>
                <span class="status-badge status-${appointment.status}">${appointment.status}</span>
            </div>
        `;

        // Show/hide action buttons based on status
        document.getElementById('cancelAppointmentBtn').style.display = 
            appointment.status === 'pending' || appointment.status === 'confirmed' ? 'inline-flex' : 'none';
        document.getElementById('completeAppointmentBtn').style.display = 
            appointment.status === 'confirmed' ? 'inline-flex' : 'none';

        modal.classList.add('show');
    }

    hideAppointmentModal() {
        document.getElementById('appointmentModal').classList.remove('show');
        this.selectedAppointment = null;
    }

    cancelAppointment() {
        if (!this.selectedAppointment) return;
        
        if (confirm('Are you sure you want to cancel this appointment?')) {
            const index = this.appointments.findIndex(a => a.id === this.selectedAppointment.id);
            if (index !== -1) {
                this.appointments[index].status = 'cancelled';
                this.saveAppointments();
                this.loadAppointments();
                this.calculateEarnings();
                this.loadEarningsStats();
                this.hideAppointmentModal();
                this.showNotification('Appointment cancelled successfully!', 'success');
            }
        }
    }

    completeAppointment() {
        if (!this.selectedAppointment) return;
        
        if (confirm('Mark this appointment as completed?')) {
            const index = this.appointments.findIndex(a => a.id === this.selectedAppointment.id);
            if (index !== -1) {
                this.appointments[index].status = 'completed';
                this.saveAppointments();
                this.loadAppointments();
                this.calculateEarnings();
                this.loadEarningsStats();
                this.hideAppointmentModal();
                this.showNotification('Appointment marked as completed!', 'success');
            }
        }
    }

    // Earnings Methods
    calculateEarnings() {
        const today = new Date().toISOString().split('T')[0];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        this.earnings.today = { amount: 0, consultations: 0 };
        this.earnings.weekly = { amount: 0, consultations: 0 };

        this.appointments.forEach(appointment => {
            if (appointment.status === 'completed') {
                const appointmentDate = new Date(appointment.date);
                
                // Today's earnings
                if (appointment.date === today) {
                    this.earnings.today.amount += appointment.fee;
                    this.earnings.today.consultations++;
                }
                
                // This week's earnings
                if (appointmentDate >= weekStart) {
                    this.earnings.weekly.amount += appointment.fee;
                    this.earnings.weekly.consultations++;
                }
            }
        });
    }

    loadEarningsStats() {
        document.getElementById('todayEarnings').textContent = `₹${this.earnings.today.amount.toLocaleString()}`;
        document.getElementById('todayConsultations').textContent = this.earnings.today.consultations;
        document.getElementById('weeklyEarnings').textContent = `₹${this.earnings.weekly.amount.toLocaleString()}`;
        document.getElementById('weeklyConsultations').textContent = this.earnings.weekly.consultations;
    }

    // Utility Methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }

    // Storage Methods
    saveProfile() {
        localStorage.setItem('doctor_profile', JSON.stringify(this.profileData));
    }

    saveAvailability() {
        localStorage.setItem('doctor_availability', JSON.stringify(this.availability));
    }

    saveAppointments() {
        localStorage.setItem('doctor_appointments', JSON.stringify(this.appointments));
    }
}

