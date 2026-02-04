import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Replace with your Supabase project info
const SUPABASE_URL = "https://lqpytcltzvxgmlnnhhvv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHl0Y2x0enZ4Z21sbm5oaHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjc4NTgsImV4cCI6MjA4NTgwMzg1OH0.MYdpZQaWodTn8Fe-DlJJognYR7UC-XBdmmngmLsK1rY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("main.js loaded");

// --- Elements ---
const authCard = document.getElementById("authCard");
const email = document.getElementById("email");
const password = document.getElementById("password");
const authBtn = document.getElementById("authBtn");
const switchMode = document.getElementById("switchMode");
const formTitle = document.getElementById("formTitle");
const authMessage = document.getElementById("authMessage");
const togglePassword = document.getElementById("togglePassword");

const userCard = document.getElementById("userCard");
const adminCard = document.getElementById("adminCard");
const creditsDisplay = document.getElementById("creditsDisplay");
const aiContext = document.getElementById("aiContext");
const aiQuestion = document.getElementById("aiQuestion");
const aiOutput = document.getElementById("aiOutput");

const userSearch = document.getElementById("userSearch");
const usersTableBody = document.querySelector("#usersTable tbody");

let mode = "signup";
let currentUser = null;
const CREDIT_COST = 1;

// --- Toggle signup/login ---
switchMode.addEventListener("click", (e) => {
  e.preventDefault();
  mode = mode === "signup" ? "login" : "signup";
  formTitle.textContent = mode === "signup" ? "Create account" : "Log in";
  authBtn.textContent = mode === "signup" ? "Sign up" : "Log in";
  switchMode.textContent = mode === "signup" ? "Log in instead" : "Create account";
  authMessage.textContent = "";
  authMessage.style.color = "#f87171";
});

// --- Show/hide password ---
password.addEventListener("input", () => {
  togglePassword.style.display = password.value ? "block" : "none";
});
togglePassword.addEventListener("click", () => {
  password.type = password.type === "password" ? "text" : "password";
});

// --- Auth action ---
authBtn.addEventListener("click", async () => {
  authMessage.textContent = "";
  if (!email.value || !password.value) {
    authMessage.textContent = "Email and password required";
    return;
  }

  let result;
  if (mode === "signup") {
    result = await supabase.auth.signUp({ email: email.value, password: password.value });
  } else {
    result = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
  }

  if (result.error) {
    authMessage.textContent = result.error.message;
  } else {
    currentUser = result.data.user || result.data.session?.user;
    authMessage.style.color = "#22c55e";
    authMessage.textContent = "Success! Logged in.";

    // Load dashboards based on role
    loadDashboards();
  }
});

// --- Load dashboards ---
async function loadDashboards() {
  // Fetch user role from Supabase
  const { data: user, error } = await supabase.from("users").select("*").eq("id", currentUser.id).single();
  if (error) {
    console.error(error);
    return;
  }
  currentUser = user;

  authCard.style.display = "none";
  userCard.style.display = "block";
  creditsDisplay.textContent = `Credits: ${currentUser.credits}`;

  if (currentUser.role === "admin") {
    adminCard.style.display = "block";
    fetchUsers();
  }
}

// --- AI question handler ---
document.getElementById("analyzeBtn").addEventListener("click", async () => {
  if (currentUser.credits < CREDIT_COST) {
    aiOutput.textContent = "Not enough credits to ask AI.";
    return;
  }

  const question = aiQuestion.value.trim();
  const context = aiContext.value.trim();
  if (!question) return;

  aiOutput.textContent = "Processing...";
  
  try {
    const response = await fetch("YOUR_EDGE_FUNCTION_URL/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.id, question, context })
    });
    const data = await response.json();

    if (data.error) aiOutput.textContent = "Error: " + data.error;
    else {
      aiOutput.textContent = data.result;
      currentUser.credits -= CREDIT_COST;
      creditsDisplay.textContent = `Credits: ${currentUser.credits}`;
    }
  } catch (err) {
    aiOutput.textContent = "Request failed: " + err.message;
  }
});

// --- Admin functions ---
async function fetchUsers(search = "") {
  let query = supabase.from("users").select("*").order("id", { ascending: true });
  if (search) query = query.ilike("username", `%${search}%`).or(`email.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) return console.error(error);

  usersTableBody.innerHTML = "";
  data.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email || "-"}</td>
      <td>${user.credits}</td>
      <td>${user.banned ? "Banned" : "Active"}</td>
      <td>
        <button onclick="giveCredit('${user.id}')">+ Credit</button>
        <button onclick="removeCredit('${user.id}')">- Credit</button>
        <button onclick="toggleBan('${user.id}')">Ban/Unban</button>
      </td>`;
    usersTableBody.appendChild(tr);
  });
}

// --- Admin action placeholders ---
window.giveCredit = async (id) => { /* call Edge function to update credits */ };
window.removeCredit = async (id) => { /* call Edge function to update credits */ };
window.toggleBan = async (id) => { /* call Edge function to ban/unban */ };

// --- User search ---
userSearch.addEventListener("input", (e) => {
  fetchUsers(e.target.value);
});
