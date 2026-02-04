/* =========================
   REVOL0G V4 – MAIN.JS
   Author: draco san
   Features:
     - Loading screen
     - Rules engine
     - Colored output cards
     - Balloon animations + counter
     - Dashboard live editing
     - Background music toggle
     - Modular for future AI / Patreon / accounts
========================= */

/* -------------------------
   GLOBAL VARIABLES
------------------------- */
let rules = []; // Loaded rules from rules.json or dashboard
let balloonCount = 0; // Tracks balloons popped locally (modular for future global counter)
let musicPlaying = true; // Tracks background music state
let bgMusic; // Audio element reference
let balloonContainer; // Container for balloons
let outputElement; // Container for analysis output
let logsInput; // Logs textarea
let contextInput; // Context textarea
let analyzeBtn; // Analyze button
let dashboardModal; // Dashboard modal element
let dashboardRulesTextarea; // Dashboard textarea
let saveRulesBtn; // Save rules button
let closeDashboardBtn; // Close dashboard button

/* -------------------------
   UTILITY FUNCTIONS
------------------------- */

// Sleep/pause utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Random integer between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Capitalize first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate colored card based on severity
function generateOutputCard(rule, logSnippet) {
  const card = document.createElement('div');
  card.classList.add('output-item');

  switch (rule.severity) {
    case 'error':
      card.classList.add('status-error');
      break;
    case 'warning':
      card.classList.add('status-warning');
      break;
    case 'confirmed':
      card.classList.add('status-confirmed');
      break;
    default:
      break;
  }

  card.innerHTML = `
    <strong>Rule ID:</strong> ${rule.id}<br>
    <strong>Severity:</strong> ${capitalize(rule.severity)}<br>
    <strong>Evidence:</strong> ${rule.evidence}<br>
    <strong>Conclusion:</strong> ${rule.conclusion}<br>
    <strong>Matched Logs:</strong> <pre>${logSnippet}</pre>
    <strong>Recommended Actions:</strong>
    <ul>
      ${rule.allowed_actions.map(action => `<li>${action}</li>`).join('')}
    </ul>
  `;
  return card;
}

// Highlight matching text in logs
function highlightMatches(logs, keywords) {
  let highlighted = logs;
  keywords.forEach(kw => {
    const regex = new RegExp(`(${kw})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });
  return highlighted;
}

/* -------------------------
   LOADING SCREEN
------------------------- */
async function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  // Short professional fade
  await sleep(500); 
  loadingScreen.style.opacity = '0';
  await sleep(300);
  loadingScreen.style.display = 'none';
}

/* -------------------------
   RULES ENGINE
------------------------- */
function loadRules(jsonData) {
  try {
    rules = JSON.parse(jsonData);
    console.log('[Revolog] Rules loaded successfully.');
  } catch (err) {
    console.error('[Revolog] Failed to parse rules:', err);
    alert('Error parsing rules.json. Please check syntax.');
  }
}

// Match logs + context against rules
function analyzeLogs(logs, context) {
  const results = [];
  rules.forEach(rule => {
    const logMatch = rule.log_contains.some(keyword => logs.includes(keyword));
    const contextMatch = rule.required_context.every(ctxKey => context.includes(ctxKey));
    if (logMatch && contextMatch) {
      const snippet = highlightMatches(logs, rule.log_contains);
      results.push({ rule, snippet });
    }
  });
  return results;
}

/* -------------------------
   OUTPUT RENDERER
------------------------- */
function renderOutput(results) {
  outputElement.innerHTML = '';
  if (results.length === 0) {
    outputElement.innerHTML = '<em>No issues detected. Macro appears to be running normally.</em>';
    return;
  }

  results.forEach(res => {
    const card = generateOutputCard(res.rule, res.snippet);
    outputElement.appendChild(card);
  });

  // Scroll to top for user convenience
  outputElement.scrollTop = 0;
}

/* -------------------------
   BALLOONS LOGIC
------------------------- */
function createBalloon() {
  const balloon = document.createElement('div');
  balloon.classList.add('balloon');

  // Random horizontal position
  balloon.style.left = `${randomInt(5, 95)}%`;

  // Random color
  const colors = ['#3a7ef0','#e91e63','#ff9800','#4cd964','#9c27b0','#f1c40f'];
  balloon.style.backgroundColor = colors[randomInt(0, colors.length - 1)];

  // Add click pop
  balloon.addEventListener('click', () => {
    popBalloon(balloon);
  });

  balloonContainer.appendChild(balloon);

  // Animate upwards
  const duration = randomInt(6000, 10000);
  balloon.animate([{ bottom: '-60px' }, { bottom: '110%' }], { duration, iterations: 1, easing: 'linear' });

  // Remove after animation
  setTimeout(() => {
    if (balloonContainer.contains(balloon)) balloonContainer.removeChild(balloon);
  }, duration);
}

// Pop balloon animation and sound
function popBalloon(balloon) {
  // Play sound
  const audio = new Audio('assets/pop.mp3');
  audio.play().catch(()=>{});

  // Animate pop
  balloon.style.transform = 'scale(0)';
  balloon.style.opacity = '0';
  setTimeout(() => {
    if (balloonContainer.contains(balloon)) balloonContainer.removeChild(balloon);
  }, 300);

  balloonCount++;
  document.getElementById('balloonCounter').textContent = `Balloons Popped: ${balloonCount}`;
}

// Generate balloons at intervals
function startBalloonRain() {
  setInterval(() => {
    createBalloon();
  }, 1500);
}

/* -------------------------
   DASHBOARD LOGIC
------------------------- */
function openDashboard() {
  dashboardModal.style.display = 'flex';
  dashboardRulesTextarea.value = JSON.stringify(rules, null, 2);
}

function closeDashboard() {
  dashboardModal.style.display = 'none';
}

function saveDashboardRules() {
  try {
    const editedRules = JSON.parse(dashboardRulesTextarea.value);
    rules = editedRules;
    alert('Rules saved successfully!');
  } catch (err) {
    alert('Failed to save rules: Invalid JSON syntax.');
    console.error(err);
  }
}

/* -------------------------
   MUSIC TOGGLE
------------------------- */
function toggleMusic() {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
  } else {
    bgMusic.play().catch(()=>{});
    musicPlaying = true;
  }
}

/* -------------------------
   EVENT LISTENERS
------------------------- */
function setupEventListeners() {
  analyzeBtn.addEventListener('click', () => {
    const logs = logsInput.value;
    const context = contextInput.value;
    const results = analyzeLogs(logs, context);
    renderOutput(results);
  });

  document.getElementById('musicToggle').addEventListener('click', toggleMusic);

  saveRulesBtn.addEventListener('click', saveDashboardRules);
  closeDashboardBtn.addEventListener('click', closeDashboard);

  // Ctrl+Shift+D shortcut for dashboard
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
      const password = prompt("Enter dashboard password:");
      if (password === "revolog123") {
        openDashboard();
      } else {
        alert("Incorrect password!");
      }
    }
  });
}

/* -------------------------
   INITIALIZATION
------------------------- */
function init() {
  // Element references
  logsInput = document.getElementById('logs');
  contextInput = document.getElementById('context');
  analyzeBtn = document.getElementById('analyzeBtn');
  outputElement = document.getElementById('output');
  dashboardModal = document.getElementById('dashboardModal');
  dashboardRulesTextarea = document.getElementById('dashboardRules');
  saveRulesBtn = document.getElementById('saveRulesBtn');
  closeDashboardBtn = document.getElementById('closeDashboardBtn');
  balloonContainer = document.getElementById('balloonContainer');
  bgMusic = document.getElementById('bgMusic');

  // Hide loading screen
  hideLoadingScreen();

  // Load initial rules from rules.json
  fetch('rules.json')
    .then(res => res.text())
    .then(data => loadRules(data))
    .catch(err => console.error('Failed to load rules.json:', err));

  // Setup event listeners
  setupEventListeners();

  // Start balloons
  startBalloonRain();
}

// Start everything once DOM is ready
document.addEventListener('DOMContentLoaded', init);

/* -------------------------
   FUTURE HOOKS FOR AI / PATREON / ACCOUNTS
   (Placeholders for long-term development)
------------------------- */

// Example structure:
// function submitAIRequest(userId, logs, context) { ... }
// function checkUserCredits(userId) { ... }
// function decrementUserCredits(userId) { ... }
// function handleGlobalBalloonCounter() { ... }

/* =========================
   END OF MAIN.JS V4
========================= */
