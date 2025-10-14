// Example: Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}
// Make togglePassword globally accessible for inline event handlers
window.togglePassword = togglePassword;