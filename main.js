// ==========================
// Revolog v4 – main.js
// Author: Lead Support Staff
// ==========================

// --------------------------
// Global Variables
// --------------------------
let rulesData = []; // Loaded rules
const ANALYZE_BTN = document.getElementById("analyzeBtn");
const LOGS_INPUT = document.getElementById("logs");
const CONTEXT_INPUT = document.getElementById("context");
const OUTPUT_DIV = document.getElementById("output");
const DASHBOARD_MODAL = document.getElementById("dashboardModal");
const DASHBOARD_RULES = document.getElementById("dashboardRules");
const SAVE_RULES_BTN = document.getElementById("saveRulesBtn");
const CLOSE_DASHBOARD_BTN = document.getElementById("closeDashboardBtn");
const MUSIC_TOGGLE = document.getElementById("musicToggle");
const BG_MUSIC = document.getElementById("bgMusic");
const BALLOON_CONTAINER = document.getElementById("balloonContainer");
const BALLOON_COUNTER_DIV = document.getElementById("balloonCounter");

// Global balloon counter persisted
let balloonsPopped = Number(localStorage.getItem("balloonsPopped")) || 0;
updateBalloonCounter();

// --------------------------
// Load Rules (rules.json)
// --------------------------
async function loadRules() {
  try {
    const res = await fetch("rules.json");
    rulesData = await res.json();
    DASHBOARD_RULES.value = JSON.stringify(rulesData, null, 2);
  } catch (err) {
    OUTPUT_DIV.innerHTML = "Failed to load JSON rules.";
    console.error(err);
  }
}

// Initial load
loadRules();

// --------------------------
// Analysis Engine
// --------------------------
function analyzeLogs() {
  const logs = LOGS_INPUT.value.split("\n");
  const context = CONTEXT_INPUT.value;
  OUTPUT_DIV.innerHTML = ""; // Clear previous output

  if (!rulesData.length) {
    OUTPUT_DIV.textContent = "No rules loaded.";
    return;
  }

  rulesData.forEach(rule => {
    const matchedLines = logs.filter(line => rule.log_contains.some(term => line.includes(term)));
    let contextValid = true;

    if (rule.required_context) {
      rule.required_context.forEach(field => {
        if (!context.includes(field)) contextValid = false;
      });
    }

    if (matchedLines.length && contextValid) {
      // Create output card
      const card = document.createElement("div");
      card.className = `output-item status-${rule.severity.toLowerCase()}`;
      card.innerHTML = `
        <strong>Rule ID:</strong> ${rule.id}<br>
        <strong>Status:</strong> ${rule.severity}<br>
        <strong>Evidence:</strong><br>${matchedLines.join("<br>")}<br>
        <strong>Conclusion:</strong> ${rule.conclusion}<br>
        <strong>Recommended Actions:</strong> ${rule.actions.join(", ")}
      `;
      OUTPUT_DIV.appendChild(card);
    }
  });

  if (!OUTPUT_DIV.childNodes.length) {
    OUTPUT_DIV.textContent = "No rules matched.";
  }
}

// --------------------------
// Dashboard Functions
// --------------------------
const DASHBOARD_PASSWORD = "revologdev"; // Change password as needed

function toggleDashboard() {
  const password = prompt("Enter dashboard password:");
  if (password === DASHBOARD_PASSWORD) {
    DASHBOARD_MODAL.style.display = "flex";
  } else {
    alert("Incorrect password.");
  }
}

SAVE_RULES_BTN.addEventListener("click", () => {
  try {
    rulesData = JSON.parse(DASHBOARD_RULES.value);
    localStorage.setItem("rulesData", JSON.stringify(rulesData));
    alert("Rules saved successfully!");
  } catch (err) {
    alert("Error parsing rules JSON.");
  }
});

CLOSE_DASHBOARD_BTN.addEventListener("click", () => {
  DASHBOARD_MODAL.style.display = "none";
});

// Ctrl+Shift+D to open dashboard
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyD") toggleDashboard();
});

// --------------------------
// Music Toggle
// --------------------------
MUSIC_TOGGLE.addEventListener("click", () => {
  if (BG_MUSIC.paused) {
    BG_MUSIC.play();
  } else {
    BG_MUSIC.pause();
  }
});
BG_MUSIC.volume = 0.15;

// --------------------------
// Balloon Functions
// --------------------------
function createBalloon() {
  const balloon = document.createElement("div");
  balloon.className = "balloon";
  balloon.style.left = Math.random() * (window.innerWidth - 40) + "px";
  BALLOON_CONTAINER.appendChild(balloon);

  // Animate balloon upward
  const duration = 10000 + Math.random() * 5000;
  const animation = balloon.animate(
    [{ transform: `translateY(0)` }, { transform: `translateY(-${window.innerHeight + 60}px)` }],
    { duration: duration, iterations: 1 }
  );
  animation.onfinish = () => balloon.remove();

  // Click to pop
  balloon.addEventListener("click", () => {
    const pop = new Audio("pop.mp3");
    pop.volume = 0.2;
    pop.play();
    incrementBalloonCounter();
    balloon.remove();
  });
}

// Spawn balloons periodically
setInterval(() => {
  if (BALLOON_CONTAINER.childElementCount < 10) createBalloon();
}, 2000);

// --------------------------
// Global Balloon Counter
// --------------------------
function incrementBalloonCounter() {
  balloonsPopped++;
  updateBalloonCounter();
  localStorage.setItem("balloonsPopped", balloonsPopped);
}

function updateBalloonCounter() {
  BALLOON_COUNTER_DIV.textContent = `Balloons Popped: ${balloonsPopped}`;
}

// --------------------------
// Event Listeners
// --------------------------
ANALYZE_BTN.addEventListener("click", analyzeLogs);
