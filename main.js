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
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");
const analyzeBtn = document.getElementById("analyzeBtn");
const logsInput = document.getElementById("logs");
const contextInput = document.getElementById("context");
const outputDiv = document.getElementById("output");
const creditsDisplay = document.getElementById("creditsDisplay");

const searchUserInput = document.getElementById("searchUser");
const searchBtn = document.getElementById("searchBtn");
const userListDiv = document.getElementById("userList");

// -----------------------
// SIGNUP
signupBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!username || !email || !password) {
    authMessage.textContent = "Username, email, and password are required";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) authMessage.textContent = error.message;
  else {
    // Insert extra user info in "users" table
    await supabase.from("users").insert([{
      user_id: data.user.id,
      username,
      credits: 2,
      role: "user",
      banned: false
    }]);
    authMessage.textContent = "Signup successful. Please login.";
  }
});

// -----------------------
// LOGIN
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    authMessage.textContent = "Email and password required";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) authMessage.textContent = error.message;
  else {
    const user_id = data.user.id;
    const { data: user } = await supabase.from("users").select("*").eq("user_id", user_id).single();

    if (user.banned) {
      authMessage.textContent = "You are banned";
      return;
    }

    currentUser = user;
    authCard.style.display = "none";
    aiCard.style.display = "block";
    if (user.role === "admin") adminCard.style.display = "block";
    updateCredits();
  }
});

// -----------------------
// UPDATE CREDITS DISPLAY
function updateCredits() {
  if (!currentUser) return;
  creditsDisplay.textContent = `Credits: ${currentUser.credits}`;
}

// -----------------------
// AI REQUEST
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
        user_id: currentUser.user_id,
        logs,
        context,
        question: context
      })
    });

    const data = await response.json();
    if (data.error) outputDiv.textContent = "Error: " + data.error;
    else {
      outputDiv.textContent = data.result;
      currentUser.credits -= 2; // Deduct locally for UI
      updateCredits();
    }
  } catch (err) {
    outputDiv.textContent = "Request failed: " + err.message;
  }
});

// -----------------------
// ADMIN DASHBOARD (search users)
searchBtn.addEventListener("click", async () => {
  const query = searchUserInput.value.trim();
  if (!query) return;

  const { data: users } = await supabase.from("users")
    .select("*")
    .or(`username.ilike.%${query}%,email.ilike.%${query}%`);

  userListDiv.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.textContent = `${u.username} | ${u.email || ""} | Credits: ${u.credits} | Role: ${u.role} | Banned: ${u.banned}`;
    userListDiv.appendChild(div);
  });
});
