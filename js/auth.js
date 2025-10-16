// Example: Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}
// Make togglePassword globally accessible for inline event handlers
window.togglePassword = togglePassword;

// implementation of Toggle between login and signup forms
function switchForm(formType) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (formType === "login") {
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
  } else if (formType === "signup") {
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
  }
}

window.switchForm = switchForm;


// ===== THEME TOGGLE FOR AUTH PAGES =====
(() => {
  const themeToggleBtn = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');

  const applySmoothTransition = () => {
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 600);
  };

  const updateThemeIcon = (theme) => {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('i');
    const label = themeToggleBtn.querySelector('span');
    if (!icon) return;
    if (theme === 'dark') {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      themeToggleBtn.classList.add('dark');
      if (label) label.textContent = 'Light Mode ☀️';
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      themeToggleBtn.classList.remove('dark');
      if (label) label.textContent = 'Dark Mode 🌙';
    }
    // small rotate effect if using CSS
    icon.classList.add('rotate-icon');
    setTimeout(() => icon.classList.remove('rotate-icon'), 600);
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applySmoothTransition();
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  };

  // Init theme on auth pages
  const initTheme = () => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  };

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  // expose for debugging if needed
  window.toggleTheme = toggleTheme;
  initTheme();
})();
