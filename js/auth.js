// Auth utility functions
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/auth-status");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error checking auth status:", err);
    return { authenticated: false };
  }
}

async function logout() {
  try {
    const response = await fetch("/api/logout");
    const data = await response.json();
    if (data.success) {
      window.location.href = "/";
    }
  } catch (err) {
    console.error("Error logging out:", err);
  }
}

// Update navigation based on auth status
async function updateNavigation() {
  const authStatus = await checkAuthStatus();
  const navContainer = document.getElementById("authNav");

  if (!navContainer) return;

  const isList = navContainer.tagName === "UL";
  const welcomeHtml = authStatus.authenticated
    ? isList
      ? `
        <li class="header__top-list-item">
          <span class="header__top-list-link">Assalomu alaykum, ${authStatus.username}!</span>
        </li>
        <li class="header__top-list-item">
          <button onclick="logout()" class="header__top-list-link" style="background:none; border:none; padding:0; color:#007bff; cursor:pointer;">Chiqish</button>
        </li>
      `
      : `
        <span>Welcome, ${authStatus.username}!</span>
        <button onclick="logout()" style="margin-left: 15px; padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Logout
        </button>
      `
    : isList
      ? `
        <li class="header__top-list-item">
          <a class="header__top-list-link" href="/login.html">Kirish</a>
        </li>
        <li class="header__top-list-item">
          <a class="header__top-list-link" href="/signup.html">Ro'yxatdan o'tish</a>
        </li>
      `
      : `
        <a href="/login.html" style="margin-right: 15px; color: #007bff; text-decoration: none;">Login</a>
        <a href="/signup.html" style="color: #007bff; text-decoration: none;">Sign Up</a>
      `;

  navContainer.innerHTML = welcomeHtml;

  const userGreeting = document.getElementById("userGreeting");
  if (userGreeting) {
    userGreeting.textContent = authStatus.authenticated
      ? `Assalomu alaykum, ${authStatus.username}!`
      : "";
  }
}

// Call on page load
document.addEventListener("DOMContentLoaded", updateNavigation);
