import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// ELEMENTS
const authCard = document.getElementById("authCard");
const aiCard = document.getElementById("aiCard");
const adminCard = document.getElementById("adminCard");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");
const analyzeBtn = document.getElementById("analyzeBtn");
const logsInput = document.getElementById("logs");
const contextInput = document.getElementById("context");
const outputDiv = document.getElementById("output");
const creditsDisplay = document.getElementById("creditsDisplay");

// --- SIGNUP ---
signupBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!username || !email || !password) return authMessage.textContent = "All fields required";

  const { data: user, error } = await supabase.auth.signUp({ email, password });
  if (error) return authMessage.textContent = error.message;

  // Insert into users table
  await supabase.from("users").insert([{ user_id: user.id, username, credits: 2, role: "user", banned: false }]);
  authMessage.textContent = "Signup successful. Please login.";
});

// --- LOGIN ---
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !session) return authMessage.textContent = "Login failed";

  const { data: user } = await supabase.from("users").select("*").eq("user_id", session.user.id).single();
  currentUser = user;

  authCard.style.display = "none";
  aiCard.style.display = "block";
  if (user.role === "admin") adminCard.style.display = "block";

  updateCredits();
});

function updateCredits() {
  if (!currentUser) return;
  creditsDisplay.textContent = `Credits: ${currentUser.credits}`;
}

// --- AI REQUEST ---
analyzeBtn.addEventListener("click", async () => {
  if (!currentUser) return outputDiv.textContent = "Login required";

  const logs = logsInput.value;
  const context = contextInput.value;

  outputDiv.textContent = "Processing...";

  try {
    const response = await fetch("https://YOUR_SUPABASE_FUNCTION_URL/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.user_id, logs, context, question: context })
    });
    const data = await response.json();

    if (data.error) outputDiv.textContent = "Error: " + data.error;
    else {
      outputDiv.textContent = data.result;
      currentUser.credits -= 2; // update local UI
      updateCredits();
    }
  } catch (err) {
    outputDiv.textContent = "Request failed: " + err.message;
  }
});
