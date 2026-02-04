// main.js - Revolog v4

let rulesData = null;
const dashboardPassword = "revologdev"; // simple dev-only toggle

// --- Load rules.json ---
async function loadRules() {
  try {
    const response = await fetch("rules.json");
    rulesData = await response.json();
    console.log("Rules loaded:", rulesData);
    if (document.getElementById("dashboardRules")) {
      document.getElementById("dashboardRules").value = JSON.stringify(rulesData, null, 2);
    }
  } catch (err) {
    console.error("Failed to load rules.json:", err);
    document.getElementById("output").textContent = "ERROR: Failed to load rules.json.";
  }
}
loadRules();

// --- Analyze Button ---
document.getElementById("analyzeBtn").addEventListener("click", () => {
  const logs = document.getElementById("logs").value.trim();
  const contextText = document.getElementById("context").value.trim();
  const output = document.getElementById("output");

  if (!rulesData) {
    output.textContent = "ERROR: Rules not loaded yet.";
    return;
  }

  // Convert context textarea into key-value
  const context = {};
  contextText.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) context[key.trim()] = rest.join(':').trim();
  });

  if (logs.length === 0) {
    output.textContent = `STATUS: Insufficient Data\nMISSING DATA:\n- logs`;
    return;
  }

  const logLines = logs.split("\n");
  let results = [];

  rulesData.rules.forEach(rule => {
    const missingContext = (rule.requires.context_fields || []).filter(f => !context[f] || context[f]==="");
    if (missingContext.length > 0) {
      results.push(
`STATUS: Insufficient Data
RULE: ${rule.id}
MISSING DATA:
- ${missingContext.join("\n- ")}
REASON:
- Rule ${rule.id} requires: ${missingContext.join(", ")}`
      );
      return;
    }

    const matchedLines = logLines.filter(line =>
      (rule.matches.log_contains || []).some(p => line.includes(p))
    );

    if (matchedLines.length > 0) {
      let statusClass = "status-confirmed";
      if (rule.severity === "error") statusClass = "status-error";
      else if (rule.severity === "warning") statusClass = "status-warning";

      results.push(
`STATUS: <span class="${statusClass}">${rule.severity.toUpperCase()}</span>
RULE: ${rule.id}
EVIDENCE:
- ${matchedLines.join("\n- ")}
CONCLUSION:
- ${rule.conclusion.summary}
- Action: ${rule.conclusion.allowed_actions.join("; ")}
MISSING DATA:
- none`
      );
    }
  });

  if (results.length === 0) {
    output.textContent = `STATUS: No Issues Detected\nREASON: No rules matched; all context present`;
  } else {
    output.innerHTML = results.join("\n\n");
  }
});

// --- Dev Dashboard toggle ---
document.addEventListener("keydown", e => {
  // Press Ctrl+Shift+D to toggle dashboard
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
    const pwd = prompt("Enter Devologger password:");
    if (pwd === dashboardPassword) {
      const dash = document.getElementById("dashboard");
      dash.style.display = dash.style.display === "none" ? "block" : "none";
    } else alert("Incorrect password");
  }
});

// --- Save Rules from Dashboard ---
document.getElementById("saveRulesBtn")?.addEventListener("click", () => {
  try {
    const newRules = JSON.parse(document.getElementById("dashboardRules").value);
    rulesData = newRules;
    localStorage.setItem("revologRules", JSON.stringify(rulesData));
    document.getElementById("dashboardStatus").textContent = "Rules updated successfully!";
  } catch (err) {
    document.getElementById("dashboardStatus").textContent = "Error: Invalid JSON";
  }
});

// --- Load rules from localStorage if present ---
const storedRules = localStorage.getItem("revologRules");
if (storedRules) {
  rulesData = JSON.parse(storedRules);
  document.getElementById("dashboardRules").value = JSON.stringify(rulesData, null, 2);
}
