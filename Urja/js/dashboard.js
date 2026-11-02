/**
 * ============================================================================
 * URJA DASHBOARD CONTROLLER (js/dashboard.js)
 * Manages live telemetry synchronization, calculations, charts, alerts, and node context.
 * ============================================================================
 */

import { getNodeRef, child, onValue, db, ref, query, limitToLast } from "./firebase.js";
import { generateInsights } from "./services/aiInsightService.js";
import {
    initPowerChart,
    updatePowerChart,
    initSolarChart,
    updateSolarChart
} from "./services/chartService.js";
import { evaluateTelemetry } from "./services/alertService.js";
import { on } from "./services/eventBus.js";
import {
    addAlert,
    incrementCriticalCount
} from "./components/alerts.js";
import { addTimelineEvent } from "./components/timeline.js";
import { initLogger } from "./services/loggerService.js";
import { updateCardValue } from "./components/cards.js";
import { evaluateFaults } from "./services/faultService.js";
import { initCortexDashboardHighlights } from "./services/cortexSync.js";
import { updateActiveNodeUI } from "./utils.js";
import { BILLING } from "./config/constants.js";

// Active Firebase listener unsubscribe handles
let unsubLive = null;
let unsubSolar = null;
let unsubBattery = null;
let unsubEnv = null;
let unsubHistory = null;
let unsubAlerts = null;

let latestLiveData = { voltage: 230, current: 0, power: 0, energy: 0 };
let latestSolarData = { power: 0 };
let latestBatteryData = { soc: 88, power: 0 };
let latestEnvData = { temperature: 28, humidity: 45 };

/**
 * Destroys existing Firebase telemetry listeners to prevent leaks
 */
export function destroyDashboard() {
    if (unsubLive) { unsubLive(); unsubLive = null; }
    if (unsubSolar) { unsubSolar(); unsubSolar = null; }
    if (unsubBattery) { unsubBattery(); unsubBattery = null; }
    if (unsubEnv) { unsubEnv(); unsubEnv = null; }
    if (unsubHistory) { unsubHistory(); unsubHistory = null; }
    if (unsubAlerts) { unsubAlerts(); unsubAlerts = null; }
}

/**
 * Main Entry Point: Initializes the Dashboard view and binds real-time listeners.
 */
export function initDashboard() {
    console.log("🚀 Dashboard Initializing...");

    // 0. Clean up any existing listeners
    destroyDashboard();

    // 1. Determine active node context from localStorage (defaults to node04A)
    const activeNodeId = localStorage.getItem("urja_active_node") || "node04A";
    console.log(`📌 Active Telemetry Node Context: ${activeNodeId}`);

    // 2. Initialize UI Components & Charts
    initLogger();
    initSearch();
    initPowerChart("livePowerChart");
    initSolarChart("solarChart");

    // 3. Setup Global Alert & Timeline Event Listeners
    setupAlertListeners();

    // 4. Initialize Real-Time Telemetry Bound to Active Node
    initRealtimeTelemetry(activeNodeId);

    // 5. Initialize Highlights and System Alerts
    initCortexDashboardHighlights("cortexHighlightsContainer");
    initDynamicSystemAlerts(activeNodeId);
}

/**
 * Recalculates power balance, grid flow, and estimated savings dynamically
 */
function recalculateGridBalanceAndSavings() {
    const solarPower = Number(latestSolarData.power || 0);
    const loadPower = Number(latestLiveData.power || 0);
    const netBalance = solarPower - loadPower;

    // 1. Power Balance KPI
    const balanceKpiEl = document.getElementById("kpi-balance");
    if (balanceKpiEl) {
        if (netBalance > 0) {
            balanceKpiEl.innerText = `+${netBalance.toFixed(2)} kW Export`;
            balanceKpiEl.className = "kpi-val green-text";
        } else if (netBalance < 0) {
            balanceKpiEl.innerText = `${netBalance.toFixed(2)} kW Import`;
            balanceKpiEl.className = "kpi-val orange-text";
        } else {
            balanceKpiEl.innerText = `0.00 kW (Balanced)`;
            balanceKpiEl.className = "kpi-val blue-text";
        }
    }

    // 2. Flow Diagram Grid & Load Metrics
    const flowGridEl = document.getElementById("flow-grid");
    if (flowGridEl) {
        if (netBalance >= 0) {
            flowGridEl.innerText = `${netBalance.toFixed(2)} kW`;
            flowGridEl.className = "metric exporting";
        } else {
            flowGridEl.innerText = `${Math.abs(netBalance).toFixed(2)} kW`;
            flowGridEl.className = "metric importing";
        }
    }

    const flowLoadEl = document.getElementById("flow-load");
    if (flowLoadEl) {
        flowLoadEl.innerText = `${loadPower.toFixed(2)} kW`;
    }

    const kpiLoadEl = document.getElementById("kpi-load");
    if (kpiLoadEl) {
        kpiLoadEl.innerText = `${loadPower.toFixed(2)} kW`;
    }

    // 3. Financial Savings Calculation
    const energyKwh = Number(latestLiveData.energy || 0);
    const tariff = BILLING.DEFAULT_TARIFF_RATE;
    const estimatedSavings = (solarPower * 4.2 + (energyKwh > 0 ? energyKwh * 0.35 : 0)) * (tariff / 8);
    const savingsEl = document.getElementById("kpi-savings");
    if (savingsEl) {
        savingsEl.innerText = `₹${estimatedSavings.toFixed(2)}`;
    }
}

/**
 * Binds real-time Firebase listeners to the specified Node ID using modular SDK.
 */
function initRealtimeTelemetry(nodeId) {
    const nodeRef = getNodeRef(nodeId);
    if (!nodeRef) {
        console.warn("⚠️ Firebase database reference could not be established.");
        return;
    }

    const activeLiveRef = child(nodeRef, "live");
    const activeSolarRef = child(nodeRef, "solar");
    const activeBatteryRef = child(nodeRef, "battery");
    const activeEnvRef = child(nodeRef, "environment");
    const activeHistoryRef = child(nodeRef, "history");

    // 1. Live Electrical Metrics Listener
    unsubLive = onValue(activeLiveRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        latestLiveData = data;

        updateCardValue("val-voltage", data.voltage, "V");
        updateCardValue("val-current", data.current, "A");
        updateCardValue("val-power", data.power, "kW");
        updateCardValue("val-energy", data.energy, "kWh");

        updatePowerChart(data.power);
        evaluateTelemetry(data);
        updateAIInsights(data);
        updateDynamicAIInsights(data);
        evaluateFaults(nodeId, data, latestEnvData);

        recalculateGridBalanceAndSavings();
    });

    // 2. Solar Generation Metrics Listener
    unsubSolar = onValue(activeSolarRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        latestSolarData = data;

        updateCardValue("val-solar", data.power, "kW");
        updateCardValue("flow-solar", data.power, "kW");
        updateCardValue("kpi-solar", data.power, "kW");

        recalculateGridBalanceAndSavings();
    });

    // 3. Battery Diagnostics Metrics Listener
    unsubBattery = onValue(activeBatteryRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        latestBatteryData = data;

        const soc = data.soc ?? data.percentage ?? 88;
        const power = data.power || 1.4;

        updateCardValue("val-battery", soc, "%");
        updateCardValue("kpi-battery", soc, "%");
        updateCardValue("flow-battery", (power >= 0 ? "+" : "") + Number(power).toFixed(2), "kW");
    });

    // 4. Environmental Diagnostics Listener
    unsubEnv = onValue(activeEnvRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        latestEnvData = data;
        evaluateFaults(nodeId, latestLiveData, data);
    });

    // 5. 24-Hour Historical Solar Generation Query
    const historyQuery = query(activeHistoryRef, limitToLast(24));
    unsubHistory = onValue(historyQuery, (snapshot) => {
        if (!snapshot.exists()) return;

        const labels = [];
        const solarPoints = [];

        snapshot.forEach((childSnap) => {
            const entry = childSnap.val();
            if (entry) {
                const timeLabel = entry.timestamp
                    ? new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : entry.time || "--:--";
                labels.push(timeLabel);
                solarPoints.push(Number(entry.solar || entry.solarPower || entry.power || 0));
            }
        });

        if (labels.length > 0 && solarPoints.length > 0) {
            updateSolarChart(labels, solarPoints);
        }
    });
}

/**
 * Global Search Filter Handler across Dashboard Items
 */
function initSearch() {
    const searchInput = document.getElementById("globalSearchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const queryVal = e.target.value.toLowerCase().trim();
        const searchableItems = document.querySelectorAll(".alert-item, .timeline-item, .ai-suggestion-list li");

        searchableItems.forEach((item) => {
            const textContent = item.textContent.toLowerCase();
            if (queryVal === "" || textContent.includes(queryVal)) {
                item.style.display = "";
                item.style.opacity = "1";
            } else {
                item.style.opacity = "0.2";
            }
        });
    });
}

/**
 * Sets up global UI alert subscriptions.
 */
function setupAlertListeners() {
    on("alert", (alert) => {
        addAlert(alert);
        addTimelineEvent(alert);
        incrementCriticalCount(alert);
    });

    on("alertResolved", (alert) => {
        addAlert(alert);
        addTimelineEvent(alert);
    });
}

/**
 * Generates and renders AI Insights based on live telemetry metrics.
 */
function updateAIInsights(latestRecord) {
    const container = document.getElementById("aiInsights");
    if (!container) return;

    const metrics = {
        averageVoltage: Number(latestRecord.voltage),
        averagePower: Number(latestRecord.power)
    };

    const insights = generateInsights(metrics, latestRecord);
    container.innerHTML = "";

    insights.forEach((item) => {
        container.innerHTML += `
        <li>
            <div class="sugg-icon green-glow">${item.icon}</div>
            <div class="sugg-content">
                <strong>${item.title}</strong><br>
                ${item.message}
            </div>
        </li>`;
    });
}

/**
 * Dynamically updates AI Insights based on live telemetry data
 */
export function updateDynamicAIInsights(data) {
    const listEl = document.getElementById("aiSuggestionList");
    if (!listEl) return;

    const solar = Number(latestSolarData?.power || data.solar?.power || data.solar || 8.2);
    const batterySoC = Number(latestBatteryData?.soc || data.battery?.soc || 88);
    const voltage = Number(data.voltage || 230);
    const frequency = Number(data.frequency || 50.0);

    listEl.innerHTML = `
        <li>
            <div class="sugg-icon green-glow"><i class="fa-solid fa-sun"></i></div>
            <div class="sugg-content"><strong>Solar Generation: ${solar.toFixed(2)} kW active yield</strong></div>
        </li>
        <li>
            <div class="sugg-icon blue-glow"><i class="fa-solid fa-battery-three-quarters"></i></div>
            <div class="sugg-content"><strong>Battery SoC: ${batterySoC}% (Microgrid Storage Stable)</strong></div>
        </li>
        <li>
            <div class="sugg-icon orange-glow"><i class="fa-solid fa-bolt"></i></div>
            <div class="sugg-content"><strong>Grid Voltage: ${voltage.toFixed(1)}V (${voltage > 250 ? "Overvoltage Alert" : "Nominal Sync"})</strong></div>
        </li>
        <li>
            <div class="sugg-icon purple-glow"><i class="fa-solid fa-wave-square"></i></div>
            <div class="sugg-content"><strong>Grid Frequency: ${frequency.toFixed(2)} Hz (Nominal Synchronized)</strong></div>
        </li>
    `;
}

/**
 * Syncs real-time System Faults & Cortex Anomalies into the Dashboard Alerts Panel
 */
export function initDynamicSystemAlerts(nodeId = null) {
    const alertsListEl = document.getElementById("systemAlertsList");
    const badgeEl = document.getElementById("alertCountBadge");
    if (!alertsListEl) return;

    const targetNode = nodeId || localStorage.getItem("urja_active_node") || "node04A";
    const cortexRef = query(ref(db, "cortex/events"), limitToLast(3));

    unsubAlerts = onValue(cortexRef, (snapshot) => {
        alertsListEl.innerHTML = "";

        if (!snapshot.exists()) {
            alertsListEl.innerHTML = `
                <div class="alert-item alert-info">
                    <div class="alert-icon"><i class="fa-solid fa-circle-check" style="color:var(--accent-green);"></i></div>
                    <div class="alert-content">
                        <div class="alert-meta"><span class="alert-type" style="color:var(--accent-green);">SECURE</span><span class="alert-time">Now</span></div>
                        <p>All microgrid nodes operating normally. No active faults.</p>
                    </div>
                </div>
            `;
            if (badgeEl) {
                badgeEl.innerText = "0 Active";
                badgeEl.className = "badge alert-info";
            }
            return;
        }

        let count = 0;
        snapshot.forEach((childSnap) => {
            count++;
            const event = childSnap.val();
            const timeStr = new Date(event.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            const alertDiv = document.createElement("div");
            alertDiv.className = "alert-item alert-critical hover-lift";
            alertDiv.style.cursor = "pointer";
            alertDiv.title = "Click to inspect anomaly in Cortex Hub";

            alertDiv.innerHTML = `
                <div class="alert-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
                <div class="alert-content">
                    <div class="alert-meta"><span class="alert-type">${event.severity || "CRITICAL"}</span><span class="alert-time">${timeStr}</span></div>
                    <p>${event.title || event.description || "System thermal or power threshold breached."}</p>
                </div>
            `;

            alertDiv.onclick = () => {
                const cortexLink = document.querySelector('.sidebar-nav a[data-route="cortex"]');
                if (cortexLink) cortexLink.click();
            };

            alertsListEl.appendChild(alertDiv);
        });

        if (badgeEl) {
            badgeEl.innerText = `${count} Active`;
            badgeEl.className = "badge alert-critical critical-pulse";
        }
    });
}
