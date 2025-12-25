/* ---------------------------------------------------------
   AZAN + JUMUAH ALERT SYSTEM – Umar Masjid App (Toggle Ready)
--------------------------------------------------------- */

console.log("Azan & Jumuah Alert System Loaded");

/* ---------------------------------------------------------
   1. Unlock audio on mobile (required for iPhone/Android)
--------------------------------------------------------- */
document.body.addEventListener(
  "click",
  function () {
    const audio = document.getElementById("azanAudio");
    if (audio) {
      audio.play().catch(() => {});
      audio.pause();
    }
  },
  { once: true }
);

/* ---------------------------------------------------------
   2. Toggle System (Save + Load)
--------------------------------------------------------- */
function saveToggle(prayer, enabled) {
  localStorage.setItem("alert_" + prayer, enabled ? "1" : "0");
}

function loadToggle(prayer) {
  return localStorage.getItem("alert_" + prayer) === "1";
}

/* Attach toggle click behaviour */
function attachToggle(toggle, prayerName) {
  // Restore saved state
  const enabled = loadToggle(prayerName);
  if (enabled) toggle.classList.add("active");

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    const isActive = toggle.classList.contains("active");
    saveToggle(prayerName, isActive);
  });
}

/* ---------------------------------------------------------
   3. Helper: Get current time HH:MM
--------------------------------------------------------- */
function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

/* ---------------------------------------------------------
   4. Helper: Read prayer times from DOM
--------------------------------------------------------- */
function getPrayerTimes() {
  return {
    Fajr: document.getElementById("fajrTime")?.innerText?.trim(),
    Dhuhr: document.getElementById("dhuhrTime")?.innerText?.trim(),
    Asr: document.getElementById("asrTime")?.innerText?.trim(),
    Maghrib: document.getElementById("maghribTime")?.innerText?.trim(),
    Isha: document.getElementById("ishaTime")?.innerText?.trim(),
  };
}

/* ---------------------------------------------------------
   5. Popup Notification
--------------------------------------------------------- */
function showPopup(message) {
  let popup = document.createElement("div");
  popup.innerHTML = message;

  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "var(--primary)";
  popup.style.color = "#fff";
  popup.style.padding = "14px 20px";
  popup.style.borderRadius = "12px";
  popup.style.fontSize = "16px";
  popup.style.fontWeight = "600";
  popup.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
  popup.style.zIndex = "9999";
  popup.style.opacity = "0";
  popup.style.transition = "opacity 0.4s ease";

  document.body.appendChild(popup);

  setTimeout(() => (popup.style.opacity = "1"), 50);
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 400);
  }, 4000);
}

/* ---------------------------------------------------------
   6. Jumuah Alert (Toggle‑Controlled)
--------------------------------------------------------- */
let jumuahAlertPlayed = false;

function checkJumuahAlert() {
  const today = new Date().getDay(); // 5 = Friday
  if (today !== 5) {
    jumuahAlertPlayed = false;
    return;
  }

  // Check toggle
  if (!loadToggle("Jumuah")) return;

  const khutbahTime = "13:00"; // fixed
  const now = new Date();

  function toMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  const khutbahMinutes = toMinutes(khutbahTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (nowMinutes === khutbahMinutes - 45) {
    if (!jumuahAlertPlayed) {
      showPopup("🕌 Jumuah Reminder: 45 minutes left until Khutbah");
      const audio = document.getElementById("azanAudio");
      audio?.play().catch(() => {});
      jumuahAlertPlayed = true;
    }
  }

  if (nowMinutes > khutbahMinutes) {
    jumuahAlertPlayed = false;
  }
}

/* ---------------------------------------------------------
   7. Main Azan Checker (Toggle‑Controlled)
--------------------------------------------------------- */
let azanPlayed = false;

function checkAzanAlert() {
  const currentTime = getCurrentTime();
  const audio = document.getElementById("azanAudio");
  if (!audio) return;

  const times = getPrayerTimes();

  for (const [prayer, time] of Object.entries(times)) {
    if (!time) continue;

    // Skip if toggle is OFF
    if (!loadToggle(prayer)) continue;

    if (currentTime === time) {
      if (!azanPlayed) {
        showPopup(`🔊 ${prayer} Time`);
        audio.play().catch(() => {});
        azanPlayed = true;
      }
      return;
    }
  }

  azanPlayed = false;
}

/* ---------------------------------------------------------
   8. Run both checkers every second
--------------------------------------------------------- */
setInterval(() => {
  checkAzanAlert();
  checkJumuahAlert();
}, 1000);
