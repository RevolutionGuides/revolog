// main.js
// Strict Log Analyzer – core wiring (no rules yet)

document.getElementById("analyzeBtn").addEventListener("click", () => {
  const logs = document.getElementById("logs").value.trim();
  const context = document.getElementById("context").value.trim();
  const output = document.getElementById("output");

  // Basic validation
  if (logs.length === 0) {
    output.textContent =
`STATUS: Insufficient Data
REASON:
- No logs provided`;
    return;
  }

  // Temporary placeholder analysis
  output.textContent =
`STATUS: Analysis Ready
LOG_LINES: ${logs.split("\n").length}
CONTEXT_PROVIDED: ${context.length > 0 ? "YES" : "NO"}

NOTE:
- Rule engine not loaded yet`;
});
