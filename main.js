import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "PASTE_YOURS_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOURS_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const suUser = document.getElementById("su-username");
const suEmail = document.getElementById("su-email");
const suPass = document.getElementById("su-password");
const suMsg = document.getElementById("signupMsg");

const liEmail = document.getElementById("li-email");
const liPass = document.getElementById("li-password");
const liMsg = document.getElementById("loginMsg");

// Show password
document.querySelectorAll(".eye").forEach(btn => {
  btn.onclick = () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  };
});

// Signup
document.getElementById("signupBtn").onclick = async () => {
  suMsg.textContent = "Signing up...";

  const { data, error } = await supabase.auth.signUp({
    email: suEmail.value,
    password: suPass.value
  });

  if (error) {
    suMsg.textContent = error.message;
    return;
  }

  await supabase.from("users").insert({
    user_id: data.user.id,
    username: suUser.value,
    credits: 2,
    role: "user",
    banned: false
  });

  suMsg.textContent = "Account created. You can log in.";
};

// Login
document.getElementById("loginBtn").onclick = async () => {
  liMsg.textContent = "Logging in...";

  const { error } = await supabase.auth.signInWithPassword({
    email: liEmail.value,
    password: liPass.value
  });

  if (error) {
    liMsg.textContent = error.message;
    return;
  }

  liMsg.textContent = "Login successful!";
};
