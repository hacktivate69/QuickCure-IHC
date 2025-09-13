// MultipleFiles/patient.js
document.addEventListener('DOMContentLoaded', () => {
// AuthManager is expected to be defined in auth.js
if (typeof AuthManager === 'undefined') {
alert('Authentication system not loaded. Please refresh the page.');
window.location.href = 'signin.html'; 
return;
}

if (!AuthManager.checkAuthAndRedirect('patient')) {
return; 
}

// Initialize patient portal only if authenticated and authorized
window.patientPortal = new PatientPortal();
});

class PatientPortal {
constructor() {
this.currentUser = AuthManager.getCurrentUser();

this.appointments = JSON.parse(localStorage.getItem('patient_appointments')) || [];
this.doctors = JSON.parse(localStorage.getItem('doctors')) || [];
this.initializeDemoData(); 
this.initializeEventListeners();
this.updateWelcomeMessage();
this.updateStats();
this.setupBookingFlow(); 
}

initializeDemoData() {
if (this.appointments.length === 0) {
this.appointments = [
{
id: '1',
date: '2025-09-05',
time: '10:15',
doctor: 'Dr. Rajesh Sharma',
hospital: 'Apollo Speciality',
specialty: 'Cardiology',
status: 'Confirmed',
reason: 'Routine check-up'
},
{
id: '2',
date: '2025-09-08',
time: '14:00',
doctor: 'Dr. Priya Singh',
hospital: 'Fortis Healthcare',
specialty: 'Pediatrics',
status: 'Pending',
reason: 'Child vaccination'
}
];
localStorage.setItem('patient_appointments', JSON.stringify(this.appointments));
}

if (this.doctors.length === 0) {
this.doctors = [
  { id: '1', name: 'Dr. Rajesh Sharma', specialty: 'Cardiology', hospital: 'Apollo Speciality', city: 'Delhi', experience: 12, rating: 4.8, fee: 500 },
  { id: '2', name: 'Dr. Priya Singh', specialty: 'Pediatrics', hospital: 'Fortis Healthcare', city: 'Mumbai', experience: 8, rating: 4.6, fee: 400 },
  { id: '3', name: 'Dr. Sunita Nair', specialty: 'Dermatology', hospital: 'Green Valley Hospital', city: 'Mumbai', experience: 10, rating: 4.7, fee: 450 },
  { id: '4', name: 'Dr. Rohan Shah', specialty: 'Orthopedics', hospital: 'Metro Care Clinic', city: 'Delhi', experience: 15, rating: 4.9, fee: 600 },
  { id: '5', name: 'Dr. Kavita Rao', specialty: 'Neurology', hospital: 'City General Hospital', city: 'Bengaluru', experience: 6, rating: 4.5, fee: 350 },
  { id: '6', name: 'Dr. Amit Patel', specialty: 'Ophthalmology', hospital: 'Vision Care Center', city: 'Pune', experience: 11, rating: 4.7, fee: 550 },
  { id: '7', name: 'Dr. Neha Gupta', specialty: 'Gynecology', hospital: "Women's Wellness Clinic", city: 'Delhi', experience: 9, rating: 4.8, fee: 650 },
  { id: '8', name: 'Dr. Vikram Singh', specialty: 'Psychiatry', hospital: 'Mind Care Hospital', city: 'Bengaluru', experience: 14, rating: 4.6, fee: 700 },
  { id: '9', name: 'Dr. Harshita Verma', specialty: 'Dermatology', hospital: 'Apollo Speciality', city: 'Mumbai', experience: 6, rating: 4.7, fee: 450 },
  { id: '10', name: 'Dr. Sanchit Kalra', specialty: 'Dermatology', hospital: 'Max Care', city: 'Mumbai', experience: 7, rating: 4.7, fee: 700 },
  { id: '11', name: 'Dr. Harish Verma', specialty: 'Neurology', hospital: 'Care Hospital', city: 'Bengaluru', experience: 6, rating: 4.5, fee: 600 },
  { id: '12', name: 'Dr. Kabir Mehta', specialty: 'Gynecology', hospital: 'City General Hospital', city: 'Bengaluru', experience: 6, rating: 4.5, fee: 450 },
  { id: '13', name: 'Dr. Venket Raman', specialty: 'Ophthalmology', hospital: 'Care Hospital', city: 'Bengaluru', experience: 6, rating: 4.5, fee: 450 },
];

localStorage.setItem('doctors', JSON.stringify(this.doctors));
}
}

initializeEventListeners() {
// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn) {
mobileMenuBtn.addEventListener('click', () => {
mobileMenu.classList.toggle('show');
const icon = mobileMenuBtn.querySelector('i');
if (icon) {
icon.classList.toggle('fa-bars');
icon.classList.toggle('fa-times');
}
});
}

// Logout button functionality (both desktop and mobile)
document.getElementById('logoutBtnDesktop')?.addEventListener('click', (e) => {
e.preventDefault();
this.logout();
});
document.getElementById('logoutBtnMobile')?.addEventListener('click', (e) => {
e.preventDefault();
this.logout();
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

updateWelcomeMessage() {
const welcomeName = document.querySelector('.patient-name');
if (welcomeName && this.currentUser) {
welcomeName.textContent = this.currentUser.name || this.currentUser.email.split('@')[0];
}
}

setupBookingFlow() {
const nextBtn = document.getElementById('nextBtn');
const specialtySelect = document.getElementById('specialty');
const citySelect = document.getElementById('city');

// Populate specialty and city dropdowns
// Use Set to get unique values
const uniqueSpecialties = [...new Set(this.doctors.map(d => d.specialty))].sort();
const uniqueCities = [...new Set(this.doctors.map(d => d.city))].sort();

this.populateDropdown(specialtySelect, uniqueSpecialties, '-- Choose Specialty --');
this.populateDropdown(citySelect, uniqueCities, '-- Choose City --');

if (nextBtn) {
nextBtn.addEventListener('click', () => {
const selectedSpecialty = specialtySelect.value;
const selectedCity = citySelect.value;

if (!selectedSpecialty || !selectedCity) {
this.showNotification('Please select both specialty and city.', 'error');
return;
}

// Redirect to patient-appointment.html with selected filters
window.location.href = `patient-appointment.html?specialty=${encodeURIComponent(selectedSpecialty)}&city=${encodeURIComponent(selectedCity)}`;
});
}
}

populateDropdown(selectElement, options, defaultText) {
if (!selectElement) return;

selectElement.innerHTML = `<option value="">${defaultText}</option>`;
options.forEach(option => {
const opt = document.createElement('option');
opt.value = option;
opt.textContent = option;
selectElement.appendChild(opt);
});
}

logout() {
if (confirm('Are you sure you want to logout?')) {
AuthManager.logout();
this.showNotification('Logged out successfully!', 'success');
setTimeout(() => {
window.location.href = 'index.html';
}, 1000);
}
}

updateStats() {
// Filter for upcoming appointments (current date or later)
const today = new Date();
today.setHours(0, 0, 0, 0); 

const upcomingAppointments = this.appointments.filter(apt => {
const aptDate = new Date(apt.date);
aptDate.setHours(0, 0, 0, 0);
return aptDate >= today && (apt.status === 'Confirmed' || apt.status === 'Pending');
});

const doctorsConsulted = [...new Set(this.appointments.map(apt => apt.doctor))].length;

const upcomingElement = document.getElementById('upcomingCount');
const doctorsElement = document.getElementById('doctorsCount');

if (upcomingElement) upcomingElement.textContent = upcomingAppointments.length;
if (doctorsElement) doctorsElement.textContent = doctorsConsulted;

// Medical records and prescriptions are static placeholders
const recordsCountElement = document.getElementById('recordsCount');
const prescriptionsCountElement = document.getElementById('prescriptionsCount');

if (recordsCountElement) recordsCountElement.textContent = '5'; 
if (prescriptionsCountElement) prescriptionsCountElement.textContent = '2'; 
}

showNotification(message, type = 'success') {
const notification = document.getElementById('notification');
if (notification) {
notification.textContent = message;
notification.className = `notification ${type} show`;
setTimeout(() => {
notification.classList.remove('show');
}, 3000);
}
}
}
