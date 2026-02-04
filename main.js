import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let mode = "signup";

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
  switchMode.textContent = mode === "signup" ? "Log in" : "Create account";
  authMessage.textContent = "";
});

// Show password
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
    authMessage.style.color = "#16a34a";
    authMessage.textContent = "Success! Redirecting...";
    // later → redirect to app dashboard
  }
});
