import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 PLACEHOLDERS: replace these with your real project info
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";        // ← e.g., https://abcd1234.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";  // ← from Supabase → Settings → API → anon public

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("main.js loaded");

let mode = "signup";

// Elements
const email = document.getElementById("email");
const password = document.getElementById("password");
const authBtn = document.getElementById("authBtn");
const switchMode = document.getElementById("switchMode");
const formTitle = document.getElementById("formTitle");
const authMessage = document.getElementById("authMessage");
const togglePassword = document.getElementById("togglePassword");

// Toggle signup/login
switchMode.addEventListener("click", (e) => {
  e.preventDefault();
  mode = mode === "signup" ? "login" : "signup";
  formTitle.textContent = mode === "signup" ? "Create account" : "Log in";
  authBtn.textContent = mode === "signup" ? "Sign up" : "Log in";
  switchMode.textContent = mode === "signup" ? "Log in instead" : "Create account";
  authMessage.textContent = "";
  authMessage.style.color = "#f87171";
});

// Show/hide password
togglePassword.addEventListener("click", () => {
  password.type = password.type === "password" ? "text" : "password";
});

// Auth action
authBtn.addEventListener("click", async () => {
  authMessage.textContent = "";

  if (!email.value || !password.value) {
    authMessage.textContent = "Email and password required";
    return;
  }

  let result;

  if (mode === "signup") {
    result = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
  } else {
    result = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
  }

  if (result.error) {
    authMessage.textContent = result.error.message;
  } else {
    authMessage.style.color = "#22c55e";
    authMessage.textContent = "Success! Logged in.";
    console.log("User:", result.data.user);

    // NEXT: redirect to dashboard or load AI interface
  }
});
