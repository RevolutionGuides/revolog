// --- Supabase setup ---
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const authContainer = document.getElementById('authContainer');
const mainContainer = document.getElementById('mainContainer');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authMsg = document.getElementById('authMsg');

const analyzeBtn = document.getElementById('analyzeBtn');
const logsInput = document.getElementById('logs');
const contextInput = document.getElementById('context');
const outputDiv = document.getElementById('output');

const dashboardModal = document.getElementById('dashboardModal');
const searchUserInput = document.getElementById('searchUser');
const userCardsContainer = document.getElementById('userCardsContainer');
const closeDashboardBtn = document.getElementById('closeDashboardBtn');

let currentUser = null;

// --------------------
// --- AUTH FUNCTIONS ---
// --------------------
async function login() {
  const { data: users, error: fetchUserError } = await supabase
    .from('users')
    .select('id,email,role')
    .eq('username', usernameInput.value)
    .limit(1);

  if (fetchUserError || users.length === 0) { authMsg.textContent = "Username not found"; return; }

  const email = users[0].email;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: passwordInput.value
  });
  if (error) { authMsg.textContent = error.message; return; }

  currentUser = { ...data.user, role: users[0].role, username: usernameInput.value };
  authMsg.textContent = "Logged in!";
  authContainer.style.display = 'none';
  mainContainer.style.display = 'flex';

  if (currentUser.role === 'admin') {
    dashboardModal.style.display = 'flex';
    loadAllUsers();
  }
}

async function register() {
  // Check username uniqueness
  const { data: existing, error } = await supabase.from('users').select('id').eq('username', usernameInput.value);
  if (existing.length > 0) { authMsg.textContent = "Username already exists"; return; }

  const { data, error: authError } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (authError) { authMsg.textContent = authError.message; return; }

  // Create user record
  await supabase.from('users').insert({
    id: data.user.id,
    username: usernameInput.value,
    email: emailInput.value,
    role: 'user',
    credits: 0,
    banned: false
  });
  authMsg.textContent = "Registered! Check email for confirmation.";
}

// --------------------
// --- AI / ANALYZE ---
// --------------------
analyzeBtn.addEventListener('click', async () => {
  const logs = logsInput.value;
  const context = contextInput.value;

  if (!currentUser) { outputDiv.textContent = "Please login first"; return; }

  // Placeholder for AI serverless call
  outputDiv.textContent = "AI request sent...\nLogs:\n" + logs + "\nContext:\n" + context;
});

// --------------------
// --- ADMIN DASHBOARD ---
// --------------------
async function loadAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) { console.log(error); return; }

  userCardsContainer.innerHTML = '';
  data.forEach(u => {
    const card = document.createElement('div');
    card.className = 'userCard';
    card.innerHTML = `
      <span>${u.username} (${u.email}) - Credits: ${u.credits} - Role: ${u.role}</span>
      <div>
        <button onclick="grantCredits('${u.id}')">+ Credits</button>
        <button onclick="removeCredits('${u.id}')">- Credits</button>
        <button onclick="banUser('${u.id}')">Ban</button>
        <button onclick="removeUser('${u.id}')">Remove</button>
      </div>
    `;
    userCardsContainer.appendChild(card);
  });
}

async function grantCredits(userId) {
  const { data, error } = await supabase.from('users').update({ credits: 10 }).eq('id', userId);
  if (!error) loadAllUsers();
}
async function removeCredits(userId) {
  const { data, error } = await supabase.from('users').update({ credits: 0 }).eq('id', userId);
  if (!error) loadAllUsers();
}
async function banUser(userId) {
  const { data, error } = await supabase.from('users').update({ banned: true }).eq('id', userId);
  if (!error) loadAllUsers();
}
async function removeUser(userId) {
  const { data, error } = await supabase.from('users').delete().eq('id', userId);
  if (!error) loadAllUsers();
}

closeDashboardBtn.addEventListener('click', () => dashboardModal.style.display = 'none');
