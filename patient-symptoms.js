document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const logoutBtnDesktop = document.getElementById("logoutBtnDesktop");
  const logoutBtnMobile = document.getElementById("logoutBtnMobile");
  const checkSymptomsBtn = document.getElementById("checkSymptomsBtn");
  const symptomsInput = document.getElementById("symptomsInput");
  const recommendationResults = document.getElementById("recommendationResults");
  const noSymptomsMessage = document.getElementById("noSymptomsMessage");
  const notification = document.getElementById("notification");

  // Toggle mobile menu visibility
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    const expanded = mobileMenu.classList.contains("active");
    mobileMenu.setAttribute("aria-hidden", !expanded);
    mobileMenuBtn.setAttribute("aria-expanded", expanded);
  });

  // Logout function (customize as needed)
  function logout() {
    alert("Logging out...");
    // localStorage.clear();
    // window.location.href = "login.html";
  }

  logoutBtnDesktop.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  logoutBtnMobile.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    mobileMenu.classList.remove("active"); // close mobile menu on logout
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  });

  // Show notification message
  function showNotification(message, duration = 3000) {
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      notification.textContent = "";
    }, duration);
  }

  // Simulated AI symptom checker and doctor recommendation
  function analyzeSymptoms(symptomsText) {
    const symptoms = symptomsText.toLowerCase();

    if (!symptoms.trim()) {
      return null;
    }

    let diagnosis = "General Checkup Recommended";
    let doctorType = "General Physician";

    if (symptoms.includes("fever") && symptoms.includes("cough")) {
      diagnosis = "Possible Flu or Respiratory Infection";
      doctorType = "Pulmonologist";
    } else if (symptoms.includes("chest pain") || symptoms.includes("shortness of breath")) {
      diagnosis = "Possible Cardiac Issue";
      doctorType = "Cardiologist";
    } else if (symptoms.includes("headache") && symptoms.includes("nausea")) {
      diagnosis = "Possible Migraine";
      doctorType = "Neurologist";
    } else if (symptoms.includes("skin rash") || symptoms.includes("itching")) {
      diagnosis = "Possible Dermatological Issue";
      doctorType = "Dermatologist";
    }

    return { diagnosis, doctorType };
  }

  // Handle symptom check button click
  checkSymptomsBtn.addEventListener("click", () => {
    const symptomsText = symptomsInput.value.trim();

    if (!symptomsText) {
      showNotification("Please enter your symptoms to check.");
      return;
    }

    const result = analyzeSymptoms(symptomsText);

    if (!result) {
      recommendationResults.innerHTML = `
        <div class="no-results-symptom">
          <i class="fas fa-lightbulb"></i>
          <p>Unable to analyze symptoms. Please try again with more details.</p>
        </div>
      `;
      return;
    }

    // Hide the no symptoms message
    noSymptomsMessage.style.display = "none";

    // Display results
    recommendationResults.innerHTML = `
      <div class="result-card">
        <h3>Diagnosis:</h3>
        <p>${result.diagnosis}</p>
        <h3>Recommended Doctor:</h3>
        <p>${result.doctorType}</p>
        <button id="bookAppointmentBtn" class="btn-primary">Book Appointment</button>
      </div>
    `;

    // Add event listener for booking appointment button
    const bookAppointmentBtn = document.getElementById("bookAppointmentBtn");
    bookAppointmentBtn.addEventListener("click", () => {
      window.location.href = "patient.html#appointment-section";
    });
  });
});