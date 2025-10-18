

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Functionality
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const themeIcon = themeToggle.querySelector('i');

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  // Theme toggle event listener
  themeToggle.addEventListener('click', () => {
    // Add transition class
    html.classList.add('theme-transition');
    
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Add rotation animation to icon
    themeIcon.classList.add('rotate-icon');
    
    // Remove transition class after animation
    setTimeout(() => {
      html.classList.remove('theme-transition');
      themeIcon.classList.remove('rotate-icon');
    }, 600);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }

  // Forgot Password Form Handler
  function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    // Show success message
    document.getElementById('emailForm').classList.remove('active');
    document.getElementById('successMessage').classList.add('active');
    document.getElementById('sentEmail').textContent = email;
    
    // Store email for resend functionality
    localStorage.setItem('resetEmail', email);
  }

  // Resend Email Function
  function resendEmail() {
    const email = localStorage.getItem('resetEmail');
    if (email) {
      alert(`Reset link resent to ${email}`);
    }
  }

  // Switch back to email form
  function switchToEmailForm() {
    document.getElementById('successMessage').classList.remove('active');
    document.getElementById('emailForm').classList.add('active');
  }

  // Make functions globally accessible
  window.handleForgotPassword = handleForgotPassword;
  window.resendEmail = resendEmail;
  window.switchToEmailForm = switchToEmailForm;
});

