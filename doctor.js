// Doctor Portal JavaScript with Authentication
document.addEventListener('DOMContentLoaded', () => {
    // Checks if user is authenticated before loading portal
    if (typeof AuthManager !== 'undefined') {
        if (!AuthManager.checkAuthAndRedirect('doctor')) {
            return; 
        }
    } else {
        // Fallback authentication check
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            alert('Please sign in to access this page');
            window.location.href = 'signin.html';
            return;
        }
        const user = JSON.parse(currentUser);
        if (user.type !== 'doctor') {
            alert('Access denied. This page is for doctors only.');
            window.location.href = 'index.html';
            return;
        }
    }

    // Initialize doctor portal only if authenticated
    window.doctorPortal = new DoctorPortal();
});

class DoctorPortal {
    constructor() {
        // Get current user info and update welcome message
        const currentUser = typeof AuthManager !== 'undefined' ? AuthManager.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const welcomeName = document.querySelector('.doctor-name');
            if (welcomeName) {
                welcomeName.textContent = currentUser.name || currentUser.email.split('@')[0];
            }
        }

        this.patients = JSON.parse(localStorage.getItem('doctor_patients')) || [];
        this.doctorStats = JSON.parse(localStorage.getItem('doctor_stats')) || {
            totalPatients: 245,
            rating: 4.8
        };
        
        this.initializeDemoData();
        this.initializeEventListeners();
        this.loadData();
    }

    initializeDemoData() {
        if (this.patients.length === 0) {
            this.patients = [
                { id: '1', name: 'John Doe', lastVisit: '2025-08-20', nextAppointment: '2025-09-10', condition: 'Hypertension', phone: '+91-9876543210', age: 45 },
                { id: '2', name: 'Jane Smith', lastVisit: '2025-08-25', nextAppointment: '2025-09-05', condition: 'Diabetes', phone: '+91-9876543211', age: 52 },
                { id: '3', name: 'Mike Johnson', lastVisit: '2025-08-30', nextAppointment: '2025-09-08', condition: 'Chest Pain', phone: '+91-9876543212', age: 38 },
                { id: '4', name: 'Sarah Wilson', lastVisit: '2025-08-15', nextAppointment: '', condition: 'Regular Checkup', phone: '+91-9876543213', age: 29 }
            ];
            this.savePatients();
        }

        // Update total patients count based on actual patient data
        this.doctorStats.totalPatients = this.patients.length;
        this.saveDoctorStats();
    }

    initializeEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('show');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
        }

        // Logout button functionality
        const logoutBtns = document.querySelectorAll('.logout-btn, .mobile-menu a[href="index.html"]');
        logoutBtns.forEach(btn => {
            if (btn.textContent.includes('Logout')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        });

        // Patient search and filter
        const patientSearch = document.getElementById('patientSearch');
        const patientFilter = document.getElementById('patientFilter');
        if (patientSearch) {
            patientSearch.addEventListener('input', () => this.filterPatients());
        }
        if (patientFilter) {
            patientFilter.addEventListener('change', () => this.filterPatients());
        }
    }

    loadData() {
        this.loadPatients();
        this.updateQuickStats();
    }

    updateQuickStats() {
        // Update total patients count
        document.getElementById('totalPatients').textContent = this.doctorStats.totalPatients;
        
        // Update rating with animation
        const ratingElement = document.getElementById('doctorRating');
        ratingElement.textContent = this.doctorStats.rating;
    }

    loadPatients() {
        const patientTableBody = document.querySelector('table tbody');
        if (!patientTableBody) return;
        
        patientTableBody.innerHTML = '';
        this.patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.name}</td>
                <td>${patient.lastVisit}</td>
                <td>${patient.nextAppointment || '-'}</td>
                <td>${patient.condition}</td>
                <td><button class="btn btn-secondary btn-small" onclick="doctorPortal.viewPatient('${patient.id}')">View</button></td>
            `;
            patientTableBody.appendChild(row);
        });
    }

    filterPatients() {
        const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
        const filterType = document.getElementById('patientFilter').value;
        
        let filteredPatients = this.patients;
        
        if (searchTerm) {
            filteredPatients = filteredPatients.filter(patient => 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.condition.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filterType !== 'all') {
            const today = new Date();
            const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            filteredPatients = filteredPatients.filter(patient => {
                if (filterType === 'recent') {
                    return new Date(patient.lastVisit) >= sevenDaysAgo;
                } else if (filterType === 'upcoming') {
                    return patient.nextAppointment && new Date(patient.nextAppointment) >= today;
                }
                return true;
            });
        }
        
        this.displayFilteredPatients(filteredPatients);
    }

    displayFilteredPatients(patients) {
        const patientTableBody = document.querySelector('table tbody');
        if (!patientTableBody) return;
        
        patientTableBody.innerHTML = '';
        patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.name}</td>
                <td>${patient.lastVisit}</td>
                <td>${patient.nextAppointment || '-'}</td>
                <td>${patient.condition}</td>
                <td><button class="btn btn-secondary btn-small" onclick="doctorPortal.viewPatient('${patient.id}')">View</button></td>
            `;
            patientTableBody.appendChild(row);
        });
    }

    viewPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
            alert(`Patient Details:\nName: ${patient.name}\nAge: ${patient.age}\nCondition: ${patient.condition}\nPhone: ${patient.phone}`);
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            if (typeof AuthManager !== 'undefined') {
                AuthManager.logout();
            } else {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('doctor_patients');
                localStorage.removeItem('doctor_stats');
            }
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    showNotification(message, type) {
        alert(message); 
    }

    savePatients() {
        localStorage.setItem('doctor_patients', JSON.stringify(this.patients));
    }

    saveDoctorStats() {
        localStorage.setItem('doctor_stats', JSON.stringify(this.doctorStats));
    }
}
