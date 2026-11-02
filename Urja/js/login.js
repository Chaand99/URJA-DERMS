/**
 * ============================================================================
 * URJA AUTHENTICATION CONTROLLER (js/login.js)
 * Manages Firebase login form submission, error rendering, and session gates.
 * ============================================================================
 */

import { handleLogin } from "./auth.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("passwordInput");
    const emailInput = document.getElementById("emailInput");
    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");
    const btnText = document.getElementById("btnText");
    const btnIcon = document.getElementById("btnIcon");
    const errorBox = document.getElementById("loginErrorMessage");
    const errorText = document.getElementById("loginErrorText");

    // 1. If user already has an active session, auto-redirect to command center
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("⚡ Active session found. Redirecting to Urja Dashboard...");
            window.location.href = "index.html";
        }
    });

    // 2. Toggle Password Visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }

    // Helper: Display inline error message
    function showError(message) {
        if (errorBox && errorText) {
            errorText.innerText = message;
            errorBox.style.display = "flex";
        } else {
            alert(message);
        }
    }

    // Helper: Hide error message
    function clearError() {
        if (errorBox) {
            errorBox.style.display = "none";
        }
    }

    // Helper: Map Firebase error codes to human-friendly strings
    function getFriendlyErrorMessage(error) {
        const code = error.code || "";
        switch (code) {
            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                return "Invalid email or password. Please verify credentials.";
            case "auth/invalid-email":
                return "Please enter a valid email address.";
            case "auth/user-disabled":
                return "This account has been deactivated by the administrator.";
            case "auth/too-many-requests":
                return "Access temporarily locked due to multiple failed attempts. Try again later.";
            case "auth/network-request-failed":
                return "Network connection error. Please check your internet connection.";
            default:
                return error.message || "Authentication failed. Please try again.";
        }
    }

    // 3. Real Firebase Login Submission Handler
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            clearError();

            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";

            if (!email || !password) {
                showError("Please enter both email and password.");
                return;
            }

            // Enter loading state
            btnText.innerText = "Authenticating...";
            btnIcon.className = "fa-solid fa-spinner fa-spin";
            loginBtn.style.pointerEvents = "none";
            loginBtn.style.opacity = "0.9";

            try {
                const userCredential = await handleLogin(email, password);
                console.log("✅ Authenticated successfully as:", userCredential.user.email);

                btnText.innerText = "Authenticated";
                btnIcon.className = "fa-solid fa-check";
                loginBtn.style.background = "linear-gradient(135deg, #059669 0%, #10b981 100%)";
                loginBtn.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 500);
            } catch (error) {
                console.error("❌ Authentication failed:", error);
                showError(getFriendlyErrorMessage(error));

                // Reset button state
                btnText.innerText = "Authenticate";
                btnIcon.className = "fa-solid fa-arrow-right";
                loginBtn.style.pointerEvents = "auto";
                loginBtn.style.opacity = "1";
                loginBtn.style.background = "";
                loginBtn.style.boxShadow = "";
            }
        });
    }
});
