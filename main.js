// --- Supabase setup (replace YOUR_URL and YOUR_KEY) ---
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const authContainer = document.getElementById('authContainer');
const mainContainer = document.getElementById('mainContainer');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authMsg = document.getElementById('authMsg');

const analyzeBtn = document.getElementById('analyzeBtn');
const logsInput = document.getElementById('logs');
const contextInput = document.getElementById('context');
const outputDiv = document.getElementById('output');

// Admin
const dashboardModal = document.getElementById('dashboardModal');
const searchUserInput = document.getElementById('searchUser');
const dashboardUsers = document.getElementById('dashboardUsers');
const grantBtn = document.getElementById('grantCreditsBtn');
const banBtn = document.getElementById('banUserBtn');
const removeBtn = document.getElementById('removeUserBtn');
const closeDashboardBtn = document.getElementById('closeDashboardBtn');

let currentUser = null;

// --- Auth functions ---
async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) { authMsg.textContent = error.message; return; }
  currentUser = data.user;
  authMsg.textContent = "Logged in!";
  authContainer.style.display = 'none';
  mainContainer.style.display = 'flex';
}

async function register() {
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) { authMsg.textContent = error.message; return; }
  authMsg.textContent = "Registered! Check email for confirmation.";
}

// --- AI / Analyze Button ---
analyzeBtn.addEventListener('click', async () => {
  const logs = logsInput.value;
  const context = contextInput.value;

  if (!currentUser) { outputDiv.textContent = "Please login first"; return; }

  // TODO: Call serverless function to:
  // 1. Check credits
  // 2. Deduct credit
  // 3. Call AI with logs+context or plain question
  // 4. Return AI result

  outputDiv.textContent = "AI request sent (serverless function integration pending)...\n\nLogs:\n" + logs + "\nContext:\n" + context;
});

// --- Admin dashboard ---
// Only show dashboard if user role is admin (to implement later securely)
closeDashboardBtn.addEventListener('click', () => dashboardModal.style.display = 'none');

// Other admin functions (grant, ban, remove) will call secure backend
