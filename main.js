import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== ELEMENTS =====
const signupUsername = document.getElementById("signupUsername");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupShowPassword = document.getElementById("signupShowPassword");
const signupBtn = document.getElementById("signupBtn");
const signupMessage = document.getElementById("signupMessage");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginShowPassword = document.getElementById("loginShowPassword");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

// ===== SHOW PASSWORD =====
signupShowPassword.addEventListener("change", () => {
  signupPassword.type = signupShowPassword.checked ? "text" : "password";
});

loginShowPassword.addEventListener("change", () => {
  loginPassword.type = loginShowPassword.checked ? "text" : "password";
});

// ===== SIGNUP =====
signupBtn.addEventListener("click", async () => {
  signupMessage.textContent = "";

  const username = signupUsername.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  if (!username || !email || !password) {
    signupMessage.textContent = "All fields are required.";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    signupMessage.textContent = error.message;
    return;
  }

  await supabase.from("users").insert([{
    user_id: data.user.id,
    username,
    credits: 2,
    role: "user",
    banned: false
  }]);

  signupMessage.textContent = "Account created. You can now log in.";
});

// ===== LOGIN =====
loginBtn.addEventListener("click", async () => {
  loginMessage.textContent = "";

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    loginMessage.textContent = "Email and password required.";
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "Invalid login credentials.";
    return;
  }

  loginMessage.textContent = "Login successful!";
  // later: redirect to dashboard / AI page
});
