/**
 * Allah Intelligence - Password Protection System
 * Simple login system to restrict access to the application
 */

// The correct password - you should change this to your preferred password
const CORRECT_PASSWORD = "AllahIntelligence123"; // Change this to your desired password

// Function to check if user is already authenticated
function isAuthenticated() {
    return localStorage.getItem('allah_intelligence_auth') === 'true';
}

// Function to set authentication status
function setAuthenticated(status) {
    localStorage.setItem('allah_intelligence_auth', status ? 'true' : 'false');
}

// Function to create and show the login overlay
function showLoginOverlay() {
    // Create login overlay
    const loginOverlay = document.createElement('div');
    loginOverlay.className = 'login-overlay';
    
    // Create login container
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container';
    
    // Create login content
    loginContainer.innerHTML = `
        <h2>Allah Intelligence</h2>
        <p>Please enter the password to access this tool</p>
        <input type="password" id="password-input" placeholder="Enter password">
        <button id="login-button">Access Tool</button>
        <div id="login-error" class="login-error">Incorrect password. Please try again.</div>
    `;
    
    // Append elements
    loginOverlay.appendChild(loginContainer);
    document.body.appendChild(loginOverlay);
    
    // Focus on password input
    document.getElementById('password-input').focus();
    
    // Add event listeners
    document.getElementById('login-button').addEventListener('click', validatePassword);
    document.getElementById('password-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validatePassword();
        }
    });
}

// Function to validate password
function validatePassword() {
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    
    if (passwordInput.value === CORRECT_PASSWORD) {
        // Password is correct
        setAuthenticated(true);
        
        // Remove login overlay
        const loginOverlay = document.querySelector('.login-overlay');
        if (loginOverlay) {
            loginOverlay.remove();
        }
        
        // Show the main content
        document.querySelector('.container').style.display = 'block';
    } else {
        // Password is incorrect
        loginError.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Initialize login system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Hide the main content initially
    document.querySelector('.container').style.display = 'none';
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
        showLoginOverlay();
    } else {
        // User is already authenticated, show the main content
        document.querySelector('.container').style.display = 'block';
    }
    
    // Add logout functionality (optional - you can remove this if not needed)
    // This adds a simple way to log out by pressing Ctrl+Alt+L
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.key === 'l') {
            setAuthenticated(false);
            location.reload();
        }
    });
});
