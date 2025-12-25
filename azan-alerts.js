/* ---------------------------------------------------------
   AZAN + JUMUAH ALERT SYSTEM – Umar Masjid App
--------------------------------------------------------- */

console.log("Azan & Jumuah Alert System Loaded");

// Unlock audio on mobile (required for iPhone/Android)
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

// Trackers
let azanPlayed = false;
let jumuahAlertPlayed = false;

/* ---------------------------------------------------------
   Helper: Get current time HH:MM
--------------------------------------------------------- */
function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

/* ---------------------------------------------------------
   Helper: Read prayer times from DOM
--------------------------------------------------------- */
function getPrayerTimes() {
  return {
    fajr: document.getElementById("fajrTime")?.innerText?.trim(),
    dhuhr: document.getElementById("dhuhrTime")?.innerText?.trim(),
    asr: document.getElementById("asrTime")?.innerText?.trim(),
    maghrib: document.getElementById("maghribTime")?.innerText?.trim(),
    isha: document.getElementById("ishaTime")?.innerText?.trim(),
  };
}

/* ---------------------------------------------------------
   Helper: Show popup notification
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
   Jumuah Alert Logic (45 minutes before Khutbah)
--------------------------------------------------------- */
function checkJumuahAlert() {
  const today = new Date().getDay(); // 5 = Friday
  if (today !== 5) {
    jumuahAlertPlayed = false;
    return;
  }

  const khutbahTime = "13:00"; // FIXED TIME
  const now = new Date();

  // Convert times to minutes
  function toMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  const khutbahMinutes = toMinutes(khutbahTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // 45 minutes before khutbah
  if (nowMinutes === khutbahMinutes - 45) {
    if (!jumuahAlertPlayed) {
      showPopup("🕌 Jumuah Reminder: 45 minutes left until Khutbah");
      const audio = document.getElementById("azanAudio");
      audio.play().catch(() => {});
      jumuahAlertPlayed = true;
    }
  }

  // Reset after khutbah
  if (nowMinutes > khutbahMinutes) {
    jumuahAlertPlayed = false;
  }
}

/* ---------------------------------------------------------
   Main Azan Checker
--------------------------------------------------------- */
function checkAzanAlert() {
  const currentTime = getCurrentTime();
  const audio = document.getElementById("azanAudio");

  if (!audio) return;

  const times = getPrayerTimes();
  const prayerTimes = Object.values(times).filter(Boolean);

  if (prayerTimes.length < 5) return;

  if (prayerTimes.includes(currentTime)) {
    if (!azanPlayed) {
      showPopup("🔊 Azan Time");
      audio.play().catch((err) => console.warn("Audio blocked:", err));
      azanPlayed = true;
    }
  } else {
    azanPlayed = false;
  }
}

/* ---------------------------------------------------------
   Run both checkers every second
--------------------------------------------------------- */
setInterval(() => {
  checkAzanAlert();
  checkJumuahAlert();
}, 1000);