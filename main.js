// ==========================
// Revolog v4 – main.js
// ==========================

// ----- DOM ELEMENTS -----
const analyzeBtn = document.getElementById('analyzeBtn');
const logsInput = document.getElementById('logs');
const contextInput = document.getElementById('context');
const outputDiv = document.getElementById('output');

const balloonContainer = document.getElementById('balloonContainer');
const balloonCounter = document.getElementById('balloonCounter');

const dashboardModal = document.getElementById('dashboardModal');
const dashboardRules = document.getElementById('dashboardRules');
const saveRulesBtn = document.getElementById('saveRulesBtn');
const closeDashboardBtn = document.getElementById('closeDashboardBtn');

const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

let balloonsPopped = 0;

// ----- UTILITY FUNCTIONS -----

/**
 * Creates a floating balloon with the given content.
 * @param {string} text - Text to display in balloon
 */
function createBalloon(text) {
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');

    // Create content inside balloon
    balloon.innerText = text;

    // Random horizontal start position
    balloon.style.left = `${Math.random() * (window.innerWidth - 50)}px`;

    // Append to container
    balloonContainer.appendChild(balloon);

    // Animate balloon upward
    let position = -60; // start below screen
    const floatInterval = setInterval(() => {
        position += 2; // pixels per frame
        balloon.style.bottom = `${position}px`;
        if (position > window.innerHeight + 60) {
            popBalloon(balloon, floatInterval);
        }
    }, 16); // ~60fps

    // Allow click to pop manually
    balloon.addEventListener('click', () => popBalloon(balloon, floatInterval));
}

/**
 * Pops a balloon and increments counter
 */
function popBalloon(balloon, interval) {
    clearInterval(interval);
    balloon.remove();
    balloonsPopped++;
    balloonCounter.innerText = `Balloons Popped: ${balloonsPopped}`;
}

// ----- ANALYZE BUTTON -----
analyzeBtn.addEventListener('click', () => {
    const logs = logsInput.value.trim();
    const context = contextInput.value.trim();

    if (!logs) {
        outputDiv.innerText = "Please paste some logs to analyze.";
        return;
    }

    // Combine logs + context for AI (placeholder)
    const combinedInput = `Logs:\n${logs}\n\nContext:\n${context || 'None provided'}`;

    // Display in output div temporarily
    outputDiv.innerText = "Processing analysis...";

    // Simulate AI response delay
    setTimeout(() => {
        // Replace this with actual AI call later
        const aiResponse = `Simulated AI response based on input:\n${combinedInput}`;

        // Update output div
        outputDiv.innerText = aiResponse;

        // Create balloon with AI response
        createBalloon(aiResponse);
    }, 500); // half-second delay
});

// ----- DASHBOARD MODAL -----
saveRulesBtn.addEventListener('click', () => {
    const rules = dashboardRules.value.trim();
    if (rules) {
        localStorage.setItem('revologRules', rules);
        alert('Rules saved!');
    }
});

closeDashboardBtn.addEventListener('click', () => {
    dashboardModal.style.display = 'none';
});

// ----- MUSIC TOGGLE -----
musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
});

// ----- LOADING SCREEN -----
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'none';
});

// ----- LOAD SAVED RULES -----
window.addEventListener('DOMContentLoaded', () => {
    const savedRules = localStorage.getItem('revologRules');
    if (savedRules) dashboardRules.value = savedRules;
});

