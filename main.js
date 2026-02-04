// main.js
// Strict Log Analyzer — fully functional with test rules, structured context, and clean output

let rulesData = null;

// 1️⃣ Load rules.json on page load
fetch('rules.json')
  .then(response => response.json())
  .then(data => {
    rulesData = data;
    console.log('Rules loaded:', rulesData);
  })
  .catch(err => {
    console.error('Failed to load rules.json:', err);
    document.getElementById('output').textContent = 
      'ERROR: Failed to load rules.json. Check your file.';
  });

// 2️⃣ Listen for Analyze button
document.getElementById("analyzeBtn").addEventListener("click", () => {
  const logs = document.getElementById("logs").value.trim();
  const contextText = document.getElementById("context").value.trim();
  const output = document.getElementById("output");

  if (!rulesData) {
    output.textContent = "ERROR: Rules not loaded yet.";
    return;
  }

  // Convert context textarea into key-value pairs
  // Expected format: each line "key: value"
  const context = {};
  contextText.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) {
      context[key.trim()] = rest.join(':').trim();
    }
  });

  // 3️⃣ Check global requirements
  if (logs.length === 0) {
    output.textContent =
`STATUS: Insufficient Data
MISSING DATA:
- logs
REASON:
- At least 1 log line is required`;
    return;
  }

  // Keep track of output lines
  let results = [];

  // Split logs into array of lines
  const logLines = logs.split('\n');

  // 4️⃣ Loop through each rule
  rulesData.rules.forEach(rule => {
    // Check required context for this rule
    const missingContext = (rule.requires.context_fields || [])
      .filter(field => !context[field] || context[field] === '');

    if (missingContext.length > 0) {
      // Not enough data to apply this rule
      results.push(
`STATUS: Insufficient Data
RULE: ${rule.id}
MISSING DATA:
- ${missingContext.join('\n- ')}
REASON:
- Rule ${rule.id} requires: ${missingContext.join(', ')}`
      );
      return; // Skip to next rule
    }

    // Check each log line for matches
    const matchedLines = logLines.filter(line =>
      (rule.matches.log_contains || []).some(pattern => line.includes(pattern))
    );

    if (matchedLines.length > 0) {
      // Rule matched
      results.push(
`STATUS: Confirmed Issue
RULE: ${rule.id}
EVIDENCE:
- ${matchedLines.map(l => l).join('\n- ')}
CONCLUSION:
- ${rule.conclusion.summary}
- Action: ${rule.conclusion.allowed_actions.join('; ')}
MISSING DATA:
- none`
      );
    }
  });

  // If no rules matched and no missing context, output "No issues detected"
  if (results.length === 0) {
    output.textContent =
`STATUS: No Issues Detected
REASON:
- None of the rules matched the provided logs
- All required context fields were present`;
  } else {
    output.textContent = results.join('\n\n'); // separate multiple rule results
  }
});
