/**
 * ============================================================================
 * URJA ALERTS CONTROLLER (js/components/alerts.js)
 * Manages live alert subscriptions, dashboard badges, and the Alerts page.
 * ============================================================================
 */

import { db, ref, onValue, query, limitToLast } from "../firebase.js";

const MAX_DASHBOARD_ALERTS = 8;
let criticalCount = 0;

// Active Firebase listeners for alerts page cleanup
let nodeAlertsUnsub = null;
let cortexEventsUnsub = null;

/**
 * Destroys Firebase listeners and clears subscriptions on unmount/node switch
 */
export function destroyAlerts() {
    if (nodeAlertsUnsub) { nodeAlertsUnsub(); nodeAlertsUnsub = null; }
    if (cortexEventsUnsub) { cortexEventsUnsub(); cortexEventsUnsub = null; }
}

/**
 * Render a new alert into the dashboard live list (via EventBus)
 */
export function addAlert(alert) {
    const container = document.getElementById("systemAlerts");
    if (!container) return;

    let icon = "fa-circle-info";
    let css = "alert-info";
    let label = "INFO";

    if (alert.severity === "warning") {
        icon = "fa-triangle-exclamation";
        css = "alert-warning";
        label = "WARNING";
    } else if (alert.severity === "critical") {
        icon = "fa-circle-exclamation";
        css = "alert-critical";
        label = "CRITICAL";
    }

    const item = document.createElement("div");
    item.className = `alert-item ${css}`;
    const timeStr = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();

    item.innerHTML = `
        <div class="alert-icon">
            <i class="fa-solid ${icon}"></i>
        </div>
        <div class="alert-content">
            <div class="alert-meta">
                <span class="alert-type">${label}</span>
                <span class="alert-time">${timeStr}</span>
            </div>
            <p>${alert.message || alert.title || "Telemetry event recorded."}</p>
        </div>
    `;

    container.prepend(item);

    while (container.children.length > MAX_DASHBOARD_ALERTS) {
        container.removeChild(container.lastChild);
    }
}

/**
 * Increment critical alert badge counter on dashboard
 */
export function incrementCriticalCount(alert) {
    if (alert.severity !== "critical") return;

    criticalCount++;
    const badge = document.getElementById("criticalAlertCount");
    if (!badge) return;

    badge.textContent = `${criticalCount} Critical`;
}

/**
 * Data-Driven Initialization for the dedicated Alerts page (pages/alerts.html)
 */
export function initAlerts() {
    console.log("🚨 Alerts Engine Initializing...");
    const activeNode = localStorage.getItem("urja_active_node") || "node04A";
    const formattedNode = activeNode === "node04A" ? "Node #04-A" : `Node #${activeNode.replace("node", "")}`;

    const badgeEl = document.querySelector(".alerts-body .active-node-name");
    if (badgeEl) {
        badgeEl.textContent = `Active Node: ${formattedNode}`;
    }

    const alertsContainer = document.getElementById("alertsListContainer");
    const countBadge = document.getElementById("alertsCountBadge");
    if (!alertsContainer) return;

    let nodeAlerts = [];
    let cortexEvents = [];
    let activeFilter = "all";

    // Setup filter buttons
    const filterBtns = document.querySelectorAll(".alert-filter-btn");
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => {
                b.classList.remove("active");
                b.style.background = "rgba(255,255,255,0.05)";
                b.style.borderColor = "var(--glass-border)";
            });
            btn.classList.add("active");
            btn.style.background = "rgba(37,99,235,0.25)";
            btn.style.borderColor = "var(--primary-blue)";

            activeFilter = btn.getAttribute("data-filter") || "all";
            renderAlertsList();
        });
    });

    function formatTime(timestamp) {
        if (!timestamp) return "Recent";
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString()}, ${timeStr}`;
    }

    function renderAlertsList() {
        if (!alertsContainer) return;

        // Combine and sort alerts descending by timestamp
        const allAlerts = [...nodeAlerts, ...cortexEvents].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const filtered = allAlerts.filter((item) => {
            const sev = (item.severity || "info").toLowerCase();
            if (activeFilter === "all") return true;
            return sev === activeFilter;
        });

        if (countBadge) {
            countBadge.innerText = `${allAlerts.length} Total Incident${allAlerts.length === 1 ? "" : "s"} Logged`;
        }

        alertsContainer.innerHTML = "";

        if (filtered.length === 0) {
            alertsContainer.innerHTML = `
                <div class="alert-item alert-info" style="border-left: 4px solid var(--accent-green); background: rgba(16, 185, 129, 0.05); padding: 1.5rem;">
                    <div class="alert-icon">
                        <i class="fa-solid fa-circle-check" style="color:var(--accent-green); font-size: 1.4rem;"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-meta">
                            <span class="alert-type" style="color:var(--accent-green); font-weight:700;">SYSTEM NOMINAL</span>
                            <span class="alert-time">Live Status</span>
                        </div>
                        <p style="margin-top: 4px; color: var(--text-secondary);">
                            All microgrid telemetry parameters on <strong>${formattedNode}</strong> operating within safe operating limits. No ${activeFilter !== "all" ? activeFilter + " " : ""}faults or anomalies detected.
                        </p>
                    </div>
                </div>
            `;
            return;
        }

        filtered.forEach((alert) => {
            const sev = (alert.severity || "info").toLowerCase();
            let icon = "fa-circle-info";
            let cssClass = "alert-info";
            let label = "INFO";

            if (sev === "critical" || sev.includes("crit")) {
                icon = "fa-circle-exclamation";
                cssClass = "alert-critical";
                label = "CRITICAL";
            } else if (sev === "warning" || sev.includes("warn")) {
                icon = "fa-triangle-exclamation";
                cssClass = "alert-warning";
                label = "WARNING";
            }

            const alertEl = document.createElement("div");
            alertEl.className = `alert-item ${cssClass}`;
            alertEl.setAttribute("data-severity", sev);

            const sourceTag = alert.nodeId ? ` [${alert.nodeId}]` : ` [${formattedNode}]`;
            const title = alert.title || alert.message || "Microgrid event triggered";
            const desc = alert.description ? `<p style="margin-top: 4px; color: var(--text-secondary); font-size: 0.82rem;">${alert.description}</p>` : "";

            alertEl.innerHTML = `
                <div class="alert-icon">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-meta">
                        <span class="alert-type">${label}${sourceTag}</span>
                        <span class="alert-time">${formatTime(alert.timestamp)}</span>
                    </div>
                    <p style="font-weight: 500;">${title}</p>
                    ${desc}
                </div>
            `;

            alertsContainer.appendChild(alertEl);
        });
    }

    // 1. Query Node-specific Alerts from Firebase
    const nodeAlertsQuery = query(ref(db, `devices/${activeNode}/alerts`), limitToLast(20));
    nodeAlertsUnsub = onValue(nodeAlertsQuery, (snapshot) => {
        nodeAlerts = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnap) => {
                const val = childSnap.val();
                nodeAlerts.push({
                    id: childSnap.key,
                    nodeId: activeNode,
                    ...val
                });
            });
        }
        renderAlertsList();
    });

    // 2. Query System Cortex Events from Firebase
    const cortexEventsQuery = query(ref(db, "cortex/events"), limitToLast(20));
    cortexEventsUnsub = onValue(cortexEventsQuery, (snapshot) => {
        cortexEvents = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnap) => {
                const val = childSnap.val();
                cortexEvents.push({
                    id: childSnap.key,
                    source: "cortex",
                    ...val
                });
            });
        }
        renderAlertsList();
    });
}
