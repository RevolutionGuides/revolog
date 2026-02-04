// main.js
// Strict Log Analyzer — fully functional with test rules, structured context, and clean output

let rulesData = null;

// Load rules.json on page load
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

// Listen for Analyze button
document.getElementById("analyzeBtn").addEventListener("click", () => {
  const logs = document.getElementById("logs").value.trim();
  const contextText = document.getElementById("context").value.trim();
  const output = document.getElementById("output");

  if (!rulesData) {
    output.textContent = "ERROR: Rules not loaded yet.";
    return;
  }

  // Convert context textarea into key-value pairs
  const context = {};
  contextText.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) {
      context[key.trim()] = rest.join(':').trim();
    }
  });

  // Check global requirements
  if (logs.length === 0) {
    output.textContent =
`STATUS: Insufficient Data
MISSING DATA:
- logs
REASON:
- At least 1 log line is required`;
    return;
  }

  let results = [];
  const logLines = logs.split('\n');

  // Loop through each rule
  rulesData.rules.forEach(rule => {
    const missingContext = (rule.requires.context_fields || [])
      .filter(field => !context[field] || context[field] === '');

    if (missingContext.length > 0) {
      results.push(
`STATUS: Insufficient Data
RULE: ${rule.id}
MISSING DATA:
- ${missingContext.join('\n- ')}
REASON:
- Rule ${rule.id} requires: ${missingContext.join(', ')}`
      );
      return;
    }

    // Check log matches
    const matchedLines = logLines.filter(line =>
      (rule.matches.log_contains || []).some(pattern => line.includes(pattern))
    );

    if (matchedLines.length > 0) {
      // Determine status class for color
      let statusClass = 'status-confirmed';
      if (rule.severity === 'error') statusClass = 'status-error';
      else if (rule.severity === 'warning') statusClass = 'status-warning';

      results.push(
`STATUS: <span class="${statusClass}">${rule.severity.toUpperCase()}</span>
RULE: ${rule.id}
EVIDENCE:
- ${matchedLines.join('\n- ')}
CONCLUSION:
- ${rule.conclusion.summary}
- Action: ${rule.conclusion.allowed_actions.join('; ')}
MISSING DATA:
- none`
      );
    }
  });

  if (results.length === 0) {
    output.textContent =
`STATUS: No Issues Detected
REASON:
- None of the rules matched the provided logs
- All required context fields were present`;
  } else {
    // Allow HTML for colored STATUS
    output.innerHTML = results.join('\n\n');
  }
});

