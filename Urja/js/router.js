/**
 * ============================================================================
 * URJA SPA ROUTER (js/router.js)
 * Handles Vanilla JS fetching and DOM injection without full page reloads.
 * ============================================================================
 */

import { initDashboard } from "./dashboard.js";
import { initAnalytics, destroyAnalytics } from "./analytics.js";
import { destroyDashboard } from "./dashboard.js";
import { initCortex, destroyCortex } from "./cortex.js";
import { initReports, destroyReports } from "./reports.js";
import { initSettings, destroySettings } from "./settings.js";
import { initAlerts, destroyAlerts } from "./components/alerts.js";
import { initAuthGate, handleLogin, handleSignUp } from "./auth.js";
import { startTelemetrySimulator } from "./services/simulatorService.js";
import { updateActiveNodeUI } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Authentication Session Gate on boot
    initAuthGate((user) => {
        console.log("Access Granted for User UID:", user.uid);
    });

    // 2. Handle Login / Registration Form Submission if present
    const loginForm = document.getElementById("loginForm");
    let isRegisterMode = false;
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail")?.value;
            const password = document.getElementById("loginPassword")?.value;
            if (!email || !password) return;
            try {
                if (isRegisterMode) {
                    await handleSignUp(email, password, "Consumer");
                    alert("Account created and saved automatically!");
                } else {
                    await handleLogin(email, password);
                }
            } catch (err) {
                alert("Authentication Error: " + err.message);
            }
        });
    }

    // 3. Load Saved High Contrast Theme Preference
    const savedHighContrast = localStorage.getItem("urja_high_contrast") === "true";
    if (savedHighContrast) {
        document.body.classList.add("high-contrast");
    }

    // 4. Setup Active Node Context
    const activeNode = localStorage.getItem("urja_active_node") || "node04A";
    const avatarText = document.getElementById("avatarText");
    if (avatarText) {
        avatarText.innerText = activeNode === "node04A" ? "04" : activeNode.replace("node", "");
    }

    const contentDiv = document.getElementById("content");
    const navLinks = document.querySelectorAll(".sidebar-nav a[data-route]");

    // 5. Route Definitions Map
    const routes = {
        dashboard: "pages/dashboard.html",
        analytics: "pages/analytics.html",
        cortex: "pages/cortex.html",
        reports: "pages/reports.html",
        settings: "pages/settings.html",
        p2p: "pages/p2p.html",
        alerts: "pages/alerts.html"
    };

    // 6. SPA Route Loader Function
    async function loadPage(page) {
        try {
            if (!routes[page]) {
                throw new Error(`Route not found: ${page}`);
            }

            const response = await fetch(routes[page]);
            if (!response.ok) throw new Error(`Failed to load fragment for ${page}`);

            const html = await response.text();
            contentDiv.innerHTML = html;

            // Update Sidebar Active Class
            updateActiveNav(page);

            // 1. Clean previous module listeners before loading new page
            switch (page) {
                case "dashboard": destroyDashboard(); break;
                case "analytics": destroyAnalytics(); break;
                case "cortex": destroyCortex(); break;
                case "reports": destroyReports(); break;
                case "settings": destroySettings(); break;
                case "alerts": destroyAlerts(); break;
            }

            // 2. Re-initialize page-specific controllers
            switch (page) {
                case "dashboard":
                    initDashboard();
                    break;
                case "analytics":
                    initAnalytics();
                    break;
                case "settings":
                    initSettings();
                    break;
                case "cortex":
                    initCortex();
                    break;
                case "p2p":
                    import("./p2p.js").then((module) => {
                        module.initP2P();
                    });
                    break;
                case "reports":
                    initReports();
                    break;
                case "alerts":
                    initAlerts();
                    break;
            }

            // Sync Active Node Name Badges Across Injected Page
            updateActiveNodeUI();
        } catch (error) {
            console.error("Routing Error:", error);
            contentDiv.innerHTML = `
                <div class="glass-card" style="padding: 2rem; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2>Error 404</h2>
                    <p>Could not load the requested module. Ensure you are running on a local server.</p>
                </div>`;
        }
    }

    // 7. Update Active Sidebar Navigation Highlighting
    function updateActiveNav(page) {
        navLinks.forEach((link) => {
            link.parentElement.classList.remove("active");
            if (link.getAttribute("data-route") === page) {
                link.parentElement.classList.add("active");
            }
        });
    }

    // 8. Attach Click Listeners to Sidebar Navigation Links
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const route = link.getAttribute("data-route");
            loadPage(route);

            // Close mobile sidebar drawer on selection
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById("sidebar");
                const overlay = document.getElementById("sidebarOverlay");
                if (sidebar) sidebar.classList.remove("mobile-active");
                if (overlay) overlay.classList.remove("active");
            }
        });
    });

    // 9. Global Node Switcher Dropdown Interaction
    const nodeOptions = document.querySelectorAll(".node-option");
    nodeOptions.forEach((option) => {
        const nodeVal = option.getAttribute("data-value");
        if (nodeVal === activeNode) {
            option.classList.add("active");
        }

        option.addEventListener("click", () => {
            localStorage.setItem("urja_active_node", nodeVal);
            const menu = document.getElementById("nodeDropdownMenu");
            if (menu) menu.classList.remove("active");

            if (contentDiv) {
                contentDiv.style.transition = "opacity 0.25s ease, transform 0.25s ease";
                contentDiv.style.opacity = "0.1";
                contentDiv.style.transform = "scale(0.98)";
            }

            setTimeout(() => {
                window.location.reload();
            }, 300);
        });
    });

    document.addEventListener("click", (e) => {
        const trigger = document.getElementById("nodeSwitcherTrigger");
        const menu = document.getElementById("nodeDropdownMenu");

        if (!trigger || !menu) return;

        if (trigger.contains(e.target)) {
            e.stopPropagation();
            menu.classList.toggle("active");
        } else if (menu.contains(e.target)) {
            e.stopPropagation();
        } else {
            menu.classList.remove("active");
        }
    });

    // 10. Start Background Telemetry Simulation
    startTelemetrySimulator();

    // 11. Initial Boot: Load Dashboard exactly once
    loadPage("dashboard");
});
