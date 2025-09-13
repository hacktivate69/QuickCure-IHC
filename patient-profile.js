// Patient Profile JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Authentication check
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
        return;
    }

    const user = JSON.parse(currentUser);
    if (user.type !== 'patient') {
        alert('Access denied. This page is for patients only.');
        window.location.href = 'index.html';
        return;
    }

    // Initialize patient profile
    window.patientProfile = new PatientProfile();
});

class PatientProfile {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.patientData = this.loadPatientData();
        this.appointments = JSON.parse(localStorage.getItem('patient_appointments')) || [];
        this.filteredAppointments = this.appointments;
        this.currentAppointment = null;

        this.initializeEventListeners();
        this.loadProfileData();
        this.loadAppointments();
    }

    loadPatientData() {
        // Load patient data from localStorage or use demo data
        const savedData = localStorage.getItem('patient_data');
        if (savedData) {
            return JSON.parse(savedData);
        }

        // Demo patient data
        return {
            personalInfo: {
                fullName: 'John Doe',
                dateOfBirth: 'January 15, 1990',
                gender: 'Male',
                bloodGroup: 'O+',
                phone: '+91 98765 43210'
            },
            memberSince: 'January 2025'
        };
    }

    initializeEventListeners() {
        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('show');
            });
        }

        // Logout functionality
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Edit buttons
        document.getElementById('editPersonalBtn')?.addEventListener('click', () => {
            this.openEditModal('personal');
        });

        // Modal controls
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.closeModal();
        });
        document.getElementById('cancelEdit')?.addEventListener('click', () => {
            this.closeModal();
        });

        // View modal controls
        document.getElementById('closeViewModal')?.addEventListener('click', () => {
            this.closeViewModal();
        });
        document.getElementById('closeView')?.addEventListener('click', () => {
            this.closeViewModal();
        });
        document.getElementById('cancelAppointmentBtn')?.addEventListener('click', () => {
            this.cancelCurrentAppointment();
        });

        // Edit form submission
        document.getElementById('editForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Appointment filters
        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.filterAppointments();
        });
        document.getElementById('dateFilter')?.addEventListener('change', () => {
            this.filterAppointments();
        });

        // Close modals when clicking outside
        document.getElementById('editModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });

        document.getElementById('viewModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'viewModal') {
                this.closeViewModal();
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav a[href^="#"]').forEach(anchor => {
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
    }

    loadProfileData() {
        // Update profile header
        document.querySelector('.patient-name').textContent = this.patientData.personalInfo.fullName;
        document.querySelector('.patient-email').textContent = this.currentUser.email;
        document.getElementById('memberDate').textContent = this.patientData.memberSince;

        // Update personal information
        document.getElementById('fullName').textContent = this.patientData.personalInfo.fullName;
        document.getElementById('dateOfBirth').textContent = this.patientData.personalInfo.dateOfBirth;
        document.getElementById('gender').textContent = this.patientData.personalInfo.gender;
        document.getElementById('bloodGroup').textContent = this.patientData.personalInfo.bloodGroup;
        document.getElementById('phone').textContent = this.patientData.personalInfo.phone;
    }

    loadAppointments() {
        this.displayAppointments();
    }

    displayAppointments() {
        // Display in table (desktop)
        this.displayTableView();
        // Display in cards (mobile)
        this.displayMobileView();
    }

    displayTableView() {
        const tableBody = document.querySelector('#appointmentsTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.filteredAppointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-appointments">
                        <i class="fas fa-calendar-times"></i>
                        <h3>No appointments found</h3>
                        <p>Try adjusting your filters or book a new appointment</p>
                        <button class="btn btn-primary" onclick="window.location.href='patient-appointment.html'">
                            <i class="fas fa-calendar-plus"></i> Book Appointment
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(appointment.date)}</td>
                <td>${appointment.time}</td>
                <td>${appointment.doctor}</td>
                <td>${appointment.hospital}</td>
                <td>${appointment.specialty}</td>
                <td><span class="status-${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="patientProfile.viewAppointment('${appointment.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${appointment.status === 'Pending' ? `
                        <button class="btn btn-small btn-danger" onclick="patientProfile.cancelAppointment('${appointment.id}')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    displayMobileView() {
        const mobileContainer = document.getElementById('appointmentsMobile');
        if (!mobileContainer) return;

        mobileContainer.innerHTML = '';

        if (this.filteredAppointments.length === 0) {
            mobileContainer.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No appointments found</h3>
                    <p>Try adjusting your filters or book a new appointment</p>
                    <button class="btn btn-primary" onclick="window.location.href='patient-appointment.html'">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                </div>
            `;
            return;
        }

        this.filteredAppointments.forEach(appointment => {
            const card = document.createElement('div');
            card.className = `appointment-card ${appointment.status.toLowerCase()}`;
            card.innerHTML = `
                <div class="card-header-mobile">
                    <div>
                        <div class="card-date">${this.formatDate(appointment.date)}</div>
                        <div class="card-time">${appointment.time}</div>
                    </div>
                    <span class="card-status ${appointment.status.toLowerCase()}">${appointment.status}</span>
                </div>
                <div class="card-body">
                    <div class="card-doctor">${appointment.doctor}</div>
                    <div class="card-details"><i class="fas fa-hospital"></i> ${appointment.hospital}</div>
                    <div class="card-details"><i class="fas fa-stethoscope"></i> ${appointment.specialty}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-small btn-secondary" onclick="patientProfile.viewAppointment('${appointment.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${appointment.status === 'Pending' ? `
                        <button class="btn btn-small btn-danger" onclick="patientProfile.cancelAppointment('${appointment.id}')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </div>
            `;
            mobileContainer.appendChild(card);
        });
    }

    filterAppointments() {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        this.filteredAppointments = this.appointments.filter(appointment => {
            const matchesStatus = !statusFilter || appointment.status === statusFilter;
            const matchesDate = !dateFilter || appointment.date === dateFilter;
            return matchesStatus && matchesDate;
        });

        this.displayAppointments();
    }

    viewAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return;

        this.currentAppointment = appointment;
        const modal = document.getElementById('viewModal');
        const details = document.getElementById('appointmentDetails');
        const cancelBtn = document.getElementById('cancelAppointmentBtn');

        // Format date
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        details.innerHTML = `
            <div class="appointment-detail">
                <span class="label">Doctor:</span>
                <span class="value">${appointment.doctor}</span>
            </div>
            <div class="appointment-detail">
                <span class="label">Specialty:</span>
                <span class="value">${appointment.specialty}</span>
            </div>
            <div class="appointment-detail">
                <span class="label">Hospital:</span>
                <span class="value">${appointment.hospital}</span>
            </div>
            <div class="appointment-detail">
                <span class="label">Date:</span>
                <span class="value">${formattedDate}</span>
            </div>
            <div class="appointment-detail">
                <span class="label">Time:</span>
                <span class="value">${appointment.time}</span>
            </div>
            <div class="appointment-detail">
                <span class="label">Status:</span>
                <span class="value"><span class="status-${appointment.status.toLowerCase()}">${appointment.status}</span></span>
            </div>
            ${appointment.reason ? `
                <div class="appointment-detail">
                    <span class="label">Reason:</span>
                    <span class="value">${appointment.reason}</span>
                </div>
            ` : ''}
        `;

        // Show/hide cancel button based on status
        if (appointment.status === 'Pending') {
            cancelBtn.style.display = 'inline-flex';
        } else {
            cancelBtn.style.display = 'none';
        }

        modal.classList.add('show');
    }

    cancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
            if (appointmentIndex > -1) {
                this.appointments[appointmentIndex].status = 'Cancelled';
                localStorage.setItem('patient_appointments', JSON.stringify(this.appointments));
                this.filterAppointments();
                this.showNotification('Appointment cancelled successfully!', 'success');
            }
        }
    }

    cancelCurrentAppointment() {
        if (this.currentAppointment) {
            this.cancelAppointment(this.currentAppointment.id);
            this.closeViewModal();
        }
    }

    openEditModal(section) {
        const modal = document.getElementById('editModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('editForm');

        let formHTML = '';
        let title = 'Edit Personal Information';

        formHTML = `
            <input type="hidden" name="section" value="personal">
            <div class="form-group">
                <label for="editFullName">Full Name:</label>
                <input type="text" id="editFullName" name="fullName" value="${this.patientData.personalInfo.fullName}" required>
            </div>
            <div class="form-group">
                <label for="editDateOfBirth">Date of Birth:</label>
                <input type="text" id="editDateOfBirth" name="dateOfBirth" value="${this.patientData.personalInfo.dateOfBirth}" required>
            </div>
            <div class="form-group">
                <label for="editGender">Gender:</label>
                <select id="editGender" name="gender" required>
                    <option value="Male" ${this.patientData.personalInfo.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${this.patientData.personalInfo.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${this.patientData.personalInfo.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editBloodGroup">Blood Group:</label>
                <select id="editBloodGroup" name="bloodGroup" required>
                    <option value="A+" ${this.patientData.personalInfo.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                    <option value="A-" ${this.patientData.personalInfo.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                    <option value="B+" ${this.patientData.personalInfo.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                    <option value="B-" ${this.patientData.personalInfo.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                    <option value="AB+" ${this.patientData.personalInfo.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                    <option value="AB-" ${this.patientData.personalInfo.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                    <option value="O+" ${this.patientData.personalInfo.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                    <option value="O-" ${this.patientData.personalInfo.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editPhone">Phone:</label>
                <input type="tel" id="editPhone" name="phone" value="${this.patientData.personalInfo.phone}" required>
            </div>
        `;

        modalTitle.textContent = title;
        form.innerHTML = formHTML;
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
    }

    closeViewModal() {
        const modal = document.getElementById('viewModal');
        modal.classList.remove('show');
        this.currentAppointment = null;
    }

    handleFormSubmit() {
        const form = document.getElementById('editForm');
        const formData = new FormData(form);

        this.patientData.personalInfo = {
            fullName: formData.get('fullName'),
            dateOfBirth: formData.get('dateOfBirth'),
            gender: formData.get('gender'),
            bloodGroup: formData.get('bloodGroup'),
            phone: formData.get('phone')
        };

        // Save to localStorage
        localStorage.setItem('patient_data', JSON.stringify(this.patientData));
        
        // Reload the profile data
        this.loadProfileData();
        
        // Close modal and show success message
        this.closeModal();
        this.showNotification('Profile updated successfully!', 'success');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}


