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
