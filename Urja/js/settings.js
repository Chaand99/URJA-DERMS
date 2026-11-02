/**
 * ============================================================================
 * URJA SETTINGS CONTROLLER (js/settings.js)
 * Manages device-specific hardware metadata (node-aware) and local app preferences.
 * ============================================================================
 */

import { db, ref, onValue } from "./firebase.js";
import { on } from "./services/eventBus.js";

// Active unsubscribe handle for node meta listener
let unsubNodeMeta = null;

/**
 * Destroys Firebase listeners and clears subscriptions on unmount/node switch
 */
export function destroySettings() {
    if (unsubNodeMeta) { unsubNodeMeta(); unsubNodeMeta = null; }
}

/**
 * Initializes the Settings hub.
 */
export function initSettings() {
    console.log("⚙️ Settings Hub Initialized.");

    // 0. Clean up previous
    destroySettings();

    // 1. Determine active node
    const activeNodeId = localStorage.getItem("urja_active_node") || "node04A";

    // 2. Load settings and bind node listeners
    loadUIPreferences();
    bindNodeHardwareMetadata(activeNodeId);

    // 3. Listen for node switching to dynamically refresh hardware info
    on("nodeChanged", (newNodeId) => {
        console.log(`🔄 Settings Hub: Node changed to ${newNodeId}. Refreshing metadata...`);
        // Cleanup old listener before re-binding
        destroySettings();
        bindNodeHardwareMetadata(newNodeId);
    });
}

/**
 * Bind hardware metadata from Firebase devices/{nodeId}/info
 */
function bindNodeHardwareMetadata(nodeId) {
    const infoRef = ref(db, `devices/${nodeId}/info`);

    // Subscribe to Firebase hardware metadata
    unsubNodeMeta = onValue(infoRef, (snapshot) => {
        const info = snapshot.val();

        const nameEl = document.getElementById("settingNodeName");
        const fwEl = document.getElementById("settingFirmware");
        const ipEl = document.getElementById("settingIp");

        if (nameEl) nameEl.innerText = info ? `${info.name || nodeId} (${nodeId.toUpperCase()})` : `Node #${nodeId.toUpperCase()} Info Unavailable`;
        if (fwEl) fwEl.innerText = info?.firmware || "v2.0.0-esp (Unavailable)";
        if (ipEl) ipEl.innerText = info?.ipAddress || "0.0.0.0";
    });
}

/**
 * Load locally persisted user preferences (theme, refresh, etc.)
 */
function loadUIPreferences() {
    // High Contrast Theme
    const highContrastToggle = document.getElementById("highContrastToggle");
    const isHighContrast = localStorage.getItem("urja_high_contrast") === "true";
    if (highContrastToggle) {
        highContrastToggle.checked = isHighContrast;
        highContrastToggle.addEventListener("change", (e) => {
            const checked = e.target.checked;
            localStorage.setItem("urja_high_contrast", checked);
            document.body.classList.toggle("high-contrast", checked);
        });
    }

    // Refresh Interval
    const refreshSelect = document.getElementById("refreshRateSelect");
    const savedInterval = localStorage.getItem("urja_refresh_interval") || "3000";
    if (refreshSelect) {
        refreshSelect.value = savedInterval;
    }

    // Save Preference Action
    const saveBtn = document.getElementById("saveSettingsBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (refreshSelect) {
                localStorage.setItem("urja_refresh_interval", refreshSelect.value);
                // Broadcast change for other modules
                window.dispatchEvent(new CustomEvent("refreshIntervalChanged", { detail: refreshSelect.value }));
            }
            saveBtn.innerText = "Settings Applied!";
            saveBtn.style.background = "var(--accent-green)";
            setTimeout(() => {
                saveBtn.innerText = "Save Preferences";
                saveBtn.style.background = "var(--primary-blue)";
            }, 2000);
        });
    }
}
