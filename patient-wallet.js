document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const logoutBtnDesktop = document.getElementById("logoutBtnDesktop");
  const logoutBtnMobile = document.getElementById("logoutBtnMobile");
  const notification = document.getElementById("notification");

  const walletTabs = document.querySelectorAll(".wallet-tab");
  const prescriptionsContent = document.getElementById("prescriptionsContent");
  const recordsContent = document.getElementById("recordsContent");
  const noPrescriptionsMessage = document.getElementById("noPrescriptionsMessage");
  const noRecordsMessage = document.getElementById("noRecordsMessage");

  // Sample data (replace with real data fetching)
  const prescriptions = [
    {
      id: 1,
      date: "2025-02-10",
      doctor: "Dr. Smith",
      medication: "Amoxicillin 500mg",
      dosage: "3 times a day for 7 days",
      notes: "Take after meals",
    },
    {
      id: 2,
      date: "2025-01-20",
      doctor: "Dr. Lee",
      medication: "Ibuprofen 200mg",
      dosage: "2 times a day for 5 days",
      notes: "Do not exceed 6 tablets per day",
    },
  ];

  const medicalRecords = [
    {
      id: 1,
      date: "2024-12-15",
      type: "Blood Test",
      description: "Routine blood work",
      fileName: "blood_test_2024_12_15.pdf",
      fileUrl: "#", // Replace with actual file URL
    },
    {
      id: 2,
      date: "2025-01-05",
      type: "X-Ray",
      description: "Chest X-Ray",
      fileName: "chest_xray_2025_01_05.jpg",
      fileUrl: "#",
    },
  ];

  // Show notification
  function showNotification(message, duration = 3000) {
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      notification.textContent = "";
    }, duration);
  }

  // Mobile menu toggle
  mobileMenuBtn.addEventListener("click", () => {
    const isActive = mobileMenu.classList.toggle("active");
    mobileMenu.setAttribute("aria-hidden", !isActive);
    mobileMenuBtn.setAttribute("aria-expanded", isActive);
  });

  // Logout handlers
  function logout() {
    showNotification("Logging out...");
    // Add your logout logic here, e.g. clear session/localStorage and redirect
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
    mobileMenu.classList.remove("active");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  });

  // Tab switching with keyboard support
  walletTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        let newIndex;
        if (e.key === "ArrowRight") {
          newIndex = (index + 1) % walletTabs.length;
        } else {
          newIndex = (index - 1 + walletTabs.length) % walletTabs.length;
        }
        walletTabs[newIndex].focus();
        activateTab(walletTabs[newIndex]);
      }
    });
  });

  function activateTab(selectedTab) {
    walletTabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle("active", isSelected);
      tab.setAttribute("aria-selected", isSelected);
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    if (selectedTab.dataset.tab === "prescriptions") {
      prescriptionsContent.classList.add("active");
      recordsContent.classList.remove("active");
    } else if (selectedTab.dataset.tab === "records") {
      recordsContent.classList.add("active");
      prescriptionsContent.classList.remove("active");
    }
  }

  // Render prescriptions
  function renderPrescriptions() {
    // Clear existing cards except no message
    prescriptionsContent.querySelectorAll(".prescription-card").forEach((el) => el.remove());

    if (prescriptions.length === 0) {
      noPrescriptionsMessage.style.display = "flex";
      return;
    }
    noPrescriptionsMessage.style.display = "none";

    prescriptions.forEach((prescription) => {
      const card = document.createElement("div");
      card.classList.add("prescription-card");
      card.innerHTML = `
        <h3>${prescription.medication}</h3>
        <p><strong>Date:</strong> ${formatDateReadable(prescription.date)}</p>
        <p><strong>Doctor:</strong> ${prescription.doctor}</p>
        <p><strong>Dosage:</strong> ${prescription.dosage}</p>
        <p><strong>Notes:</strong> ${prescription.notes}</p>
      `;
      prescriptionsContent.appendChild(card);
    });
  }

  // Render medical records
  function renderMedicalRecords() {
    // Clear existing cards except no message
    recordsContent.querySelectorAll(".record-card").forEach((el) => el.remove());

    if (medicalRecords.length === 0) {
      noRecordsMessage.style.display = "flex";
      return;
    }
    noRecordsMessage.style.display = "none";

    medicalRecords.forEach((record) => {
      const card = document.createElement("div");
      card.classList.add("record-card");
      card.innerHTML = `
        <h3>${record.type}</h3>
        <p><strong>Date:</strong> ${formatDateReadable(record.date)}</p>
        <p><strong>Description:</strong> ${record.description}</p>
        <p><a href="${record.fileUrl}" target="_blank" rel="noopener noreferrer">View File: ${record.fileName}</a></p>
      `;
      recordsContent.appendChild(card);
    });
  }

  // Format date to readable string
  function formatDateReadable(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  // Initial render
  renderPrescriptions();
  renderMedicalRecords();
});