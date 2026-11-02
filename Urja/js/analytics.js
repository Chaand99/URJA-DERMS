/**
 * Urja Analytics Hub - Historical Telemetry & Metrics Controller
 */
import {
    getHistory,
    calculateMetrics,
    subscribeHistory
} from "./services/analyticsService.js";
import { initAnalyticsCharts, destroyAnalyticsCharts } from "./services/analyticsChartservice.js";
import { on } from "./services/eventBus.js";

let unsubHistory = null;

/**
 * Cleanup function to destroy listeners and charts
 */
export function destroyAnalytics() {
    if (unsubHistory) { unsubHistory(); unsubHistory = null; }
    destroyAnalyticsCharts();
}

function updateAnalytics(history) {
    if (!history || !history.length) {
        console.warn("Analytics: No data to display.");
        return;
    }

    const metrics = calculateMetrics(history);

    // Update KPI cards
    const elements = {
        peakDemand: document.getElementById("peakDemand"),
        averageLoad: document.getElementById("averageLoad"),
        estimatedBill: document.getElementById("estimatedBill"),
        averageVoltage: document.getElementById("averageVoltage"),
        averageCurrent: document.getElementById("averageCurrent"),
        averagePF: document.getElementById("averagePF"),
        averageFrequency: document.getElementById("averageFrequency")
    };

    if (elements.peakDemand) elements.peakDemand.innerHTML = `${metrics.peakPower.toFixed(2)} <span class="unit">kW</span>`;
    if (elements.averageLoad) elements.averageLoad.innerHTML = `${metrics.averagePower.toFixed(2)} <span class="unit">kW</span>`;
    if (elements.estimatedBill) elements.estimatedBill.textContent = `₹${(metrics.totalEnergy * 8).toFixed(0)}`;
    if (elements.averageVoltage) elements.averageVoltage.innerHTML = `${metrics.averageVoltage.toFixed(1)} <span class="unit">V</span>`;
    if (elements.averageCurrent) elements.averageCurrent.innerHTML = `${metrics.averageCurrent.toFixed(2)} <span class="unit">A</span>`;
    if (elements.averagePF) elements.averagePF.textContent = metrics.averagePF.toFixed(2);
    if (elements.averageFrequency) elements.averageFrequency.innerHTML = `${metrics.averageFrequency.toFixed(2)} <span class="unit">Hz</span>`;

    // Initialize / Update Charts
    initAnalyticsCharts(history);
}

export async function initAnalytics() {
    console.log("Initializing Analytics Hub...");

    destroyAnalytics();

    if (typeof Chart === "undefined") {
        console.error("Chart.js is missing!");
        return;
    }

    // Determine current active node
    const activeNodeId = localStorage.getItem("urja_active_node") || "node04A";
    const badge = document.getElementById('analyticsNodeBadge');
    if (badge) {
        badge.innerText = `Active Node: ${activeNodeId.toUpperCase()}`;
    }

    // Load initial historical dataset
    const history = await getHistory(activeNodeId);
    if (!history || !history.length) {
        console.warn("No historical telemetry found for node:", activeNodeId);
        // Optional: Show empty state UI here
    } else {
        updateAnalytics(history);
    }

    // Subscribe to live historical updates for this node
    unsubHistory = subscribeHistory((updatedHistory) => {
        updateAnalytics(updatedHistory);
    }, activeNodeId);

    // Listen for node changes to refresh
    on("nodeChanged", (newNodeId) => {
        console.log(`🔄 Analytics Hub: Node switched to ${newNodeId}. Refreshing...`);
        // We do *not* call destroyAnalytics() here recursively to avoid event-cycle issues;
        // the router/page-switching mechanism should handle re-initAnalytics().
        // Actually, re-initAnalytics() *is* called by router.js/loadPage(),
        // which calls destroyAnalytics() first. Looks good.
    });
}
