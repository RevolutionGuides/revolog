let rulesData = null;
const dashboardPassword = "revologdev";

// Load rules.json
async function loadRules() {
  try {
    const res = await fetch("rules.json");
    rulesData = await res.json();
    document.getElementById("dashboardRules").value = JSON.stringify(rulesData, null, 2);
  } catch (err) {
    document.getElementById("output").textContent = "ERROR: Failed to load rules.json";
  }
}
loadRules();

// Analyze Button
document.getElementById("analyzeBtn").addEventListener("click", () => {
  const logs = document.getElementById("logs").value.trim();
  const contextText = document.getElementById("context").value.trim();
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  if (!rulesData) {
    outputDiv.textContent = "ERROR: Rules not loaded";
    return;
  }

  const context = {};
  contextText.split("\n").forEach(line => {
    const [k, ...rest] = line.split(":");
    if (k && rest.length) context[k.trim()] = rest.join(":").trim();
  });

  if (!logs) {
    outputDiv.textContent = "STATUS: No logs provided";
    return;
  }

  const logLines = logs.split("\n");

  rulesData.rules.forEach(rule => {
    const missingContext = (rule.requires.context_fields || []).filter(f => !context[f]);
    if (missingContext.length) return;

    const matchedLines = logLines.filter(line =>
      (rule.matches.log_contains || []).some(p => line.includes(p))
    );

    if (matchedLines.length) {
      const div = document.createElement("div");
      div.className = `output-item status-${rule.severity}`;
      div.innerHTML = `
<b>STATUS:</b> ${rule.severity.toUpperCase()}<br>
<b>RULE:</b> ${rule.id}<br>
<b>EVIDENCE:</b><br> - ${matchedLines.join("<br> - ")}<br>
<b>CONCLUSION:</b> ${rule.conclusion.summary}<br>
<b>ACTIONS:</b> ${rule.conclusion.allowed_actions.join("; ")}
`;
      outputDiv.appendChild(div);
    }
  });

  if (!outputDiv.innerHTML) outputDiv.textContent = "STATUS: No issues detected";
});

// Dashboard toggle (Ctrl+Shift+D)
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
    const pwd = prompt("Enter Devologger password:");
    if (pwd === dashboardPassword) {
      document.getElementById("dashboardModal").style.display = "flex";
    } else alert("Wrong password");
  }
});

// Close dashboard
document.getElementById("closeDashboard").addEventListener("click", () => {
  document.getElementById("dashboardModal").style.display = "none";
});

// Save Rules from Dashboard
document.getElementById("saveRulesBtn").addEventListener("click", () => {
  try {
    const newRules = JSON.parse(document.getElementById("dashboardRules").value);
    rulesData = newRules;
    localStorage.setItem("revologRules", JSON.stringify(rulesData));
    document.getElementById("dashboardStatus").textContent = "Rules updated!";
  } catch {
    document.getElementById("dashboardStatus").textContent = "Invalid JSON!";
  }
});

// Load localStorage rules if available
const stored = localStorage.getItem("revologRules");
if (stored) {
  rulesData = JSON.parse(stored);
  document.getElementById("dashboardRules").value = JSON.stringify(rulesData, null, 2);
}
