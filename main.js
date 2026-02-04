import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// Elements
const authCard = document.getElementById("authCard");
const aiCard = document.getElementById("aiCard");
const adminCard = document.getElementById("adminCard");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");
const analyzeBtn = document.getElementById("analyzeBtn");
const logsInput = document.getElementById("logs");
const contextInput = document.getElementById("context");
const outputDiv = document.getElementById("output");
const creditsDisplay = document.getElementById("creditsDisplay");

// --- Signup ---
signupBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  if (!username) return authMessage.textContent = "Username required";
  
  const { data, error } = await supabase.from("users").insert([{ 
    id: username, 
    username, 
    email: email || null, 
    role: "user", 
    credits: 2, 
    banned: false 
  }]);
  
  if (error) authMessage.textContent = error.message;
  else authMessage.textContent = "Signup successful. Please login.";
});

// --- Login ---
loginBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const { data: user, error } = await supabase.from("users").select("*").eq("id", username).single();
  
  if (error || !user) authMessage.textContent = "User not found";
  else {
    currentUser = user;
    authCard.style.display = "none";
    aiCard.style.display = "block";
    if (user.role === "admin") adminCard.style.display = "block";
    updateCredits();
  }
});

function updateCredits() {
  if (!currentUser) return;
  creditsDisplay.textContent = `Credits: ${currentUser.credits}`;
}

// --- AI Request ---
analyzeBtn.addEventListener("click", async () => {
  if (!currentUser) return outputDiv.textContent = "Login required";
  const logs = logsInput.value;
  const context = contextInput.value;
  
  outputDiv.textContent = "Processing...";

  try {
    const response = await fetch("https://YOUR_SUPABASE_FUNCTION_URL/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUser.id,
        logs,
        context,
        question: context
      })
    });
    const data = await response.json();
    if (data.error) outputDiv.textContent = "Error: " + data.error;
    else {
      outputDiv.textContent = data.result;
      currentUser.credits -= 2; // deduct credits locally for UI
      updateCredits();
    }
  } catch (err) {
    outputDiv.textContent = "Request failed: " + err.message;
  }
});
