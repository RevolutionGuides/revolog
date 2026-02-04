import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://lqpytcltzvxgmlnnhhvv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHl0Y2x0enZ4Z21sbm5oaHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjc4NTgsImV4cCI6MjA4NTgwMzg1OH0.MYdpZQaWodTn8Fe-DlJJognYR7UC-XBdmmngmLsK1rY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let mode = "signup";

const email = document.getElementById("email");
const password = document.getElementById("password");
const authBtn = document.getElementById("authBtn");
const switchMode = document.getElementById("switchMode");
const formTitle = document.getElementById("formTitle");
const authMessage = document.getElementById("authMessage");
const togglePassword = document.getElementById("togglePassword");

let currentUser = null;

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

    if (!result.error && result.data.user) {
      // Insert into users table for credits/admin role
      await supabase.from("users").insert([{
        id: result.data.user.id,
        email: email.value,
        role: "user",
        credits: 2,
        banned: false
      }]);
    }
  } else {
    result = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
  }

  if (result.error) {
    authMessage.textContent = result.error.message;
  } else {
    currentUser = result.data.user;
    authMessage.style.color = "#22c55e";
    authMessage.textContent = "Success! Logged in.";
    console.log("Current User:", currentUser);
    // TODO: redirect to AI dashboard
  }
});
