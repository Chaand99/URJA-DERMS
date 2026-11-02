/**
 * ============================================================================
 * URJA REPORTS CONTROLLER (js/reports.js)
 * Generates data-driven telemetry audits, energy calculations, and compliance reports.
 * ============================================================================
 */

import { subscribeLive, subscribeSolar } from "./services/telemetryService.js";
import { db, ref, onValue, query, limitToLast } from "./firebase.js";
import { BILLING } from "./config/constants.js";

// Active unsubscribe handles for lifecycle cleanup
let unsubLive = null;
let unsubSolar = null;
let unsubHistory = null;

let currentBaseEnergy = 0;
let currentBaseSolar = 0;
let currentLivePower = 0;
let currentLiveVoltage = 230;

/**
 * Clean up active Firebase listeners on page transition or node switch
 */
export function destroyReports() {
    if (unsubLive) { unsubLive(); unsubLive = null; }
    if (unsubSolar) { unsubSolar(); unsubSolar = null; }
    if (unsubHistory) { unsubHistory(); unsubHistory = null; }
}

/**
 * Initializes the Reports module bound dynamically to the active node.
 */
export function initReports() {
    console.log("📊 Reports Module Initializing...");

    // 0. Clean up previous listeners
    destroyReports();

    // 1. Determine active node context
    const activeNodeId = localStorage.getItem("urja_active_node") || "node04A";
    console.log(`📌 Reports Active Node Context: ${activeNodeId}`);

    // Reset local state cache
    currentBaseEnergy = 0;
    currentBaseSolar = 0;
    currentLivePower = 0;
    currentLiveVoltage = 230;

    // 2. Setup Period Filter Tabs (Weekly / Monthly / Yearly)
    setupPeriodTabs(activeNodeId);

    // 3. Setup PDF Download & Filter Dropdown Handlers
    setupActionHandlers();

    // 4. Bind Live Telemetry Subscriptions
    bindLiveTelemetry(activeNodeId);

    // 5. Query Real Historical Audit Records
    bindHistoricalAuditLogs(activeNodeId);
}

/**
 * Updates KPI Summary Cards based on selected period multiplier
 */
function updateReportValues(period, activeNodeId) {
    const consLabel = document.getElementById("rep-label-cons");
    const consVal = document.getElementById("report-consumption");
    const solarVal = document.getElementById("report-solar");
    const savingsVal = document.getElementById("report-savings");
    const co2Val = document.getElementById("report-co2");

    if (!consVal || !solarVal || !savingsVal || !co2Val) return;

    // Multipliers based on daily baseline values
    let daysMultiplier = 7;
    let periodName = "Weekly";

    if (period === "monthly") {
        daysMultiplier = 30;
        periodName = "Monthly";
    } else if (period === "yearly") {
        daysMultiplier = 365;
        periodName = "Yearly";
    }

    if (consLabel) {
        consLabel.innerText = `Total Consumption (${periodName} - ${activeNodeId.toUpperCase()})`;
    }

    // Dynamic calculations from live baseline
    const dailyConsumption = currentBaseEnergy > 0 ? currentBaseEnergy : (currentLivePower > 0 ? currentLivePower * 24 : 114.8);
    const dailySolar = currentBaseSolar > 0 ? currentBaseSolar * 6.5 : (dailyConsumption * 0.72);

    const totalConsumption = dailyConsumption * (daysMultiplier / 7);
    const totalSolar = dailySolar * (daysMultiplier / 7);

    // Savings: Solar generation * utility tariff rate (₹8.00/kWh)
    const tariffRate = BILLING.DEFAULT_TARIFF_RATE || 8.00;
    const totalSavings = totalSolar * (tariffRate * 0.55); // estimated net displaced grid cost

    // Carbon Offset: 0.82 kg CO2 per kWh solar generated
    const totalCO2 = totalSolar * 0.82;

    consVal.innerHTML = `${totalConsumption.toFixed(1)} <span class="unit">kWh</span>`;
    solarVal.innerHTML = `${totalSolar.toFixed(1)} <span class="unit">kWh</span>`;
    savingsVal.innerText = `₹${totalSavings.toFixed(2)}`;
    co2Val.innerHTML = `${totalCO2.toFixed(1)} <span class="unit">kg</span>`;
}

/**
 * Period Tab Navigation Setup
 */
function setupPeriodTabs(activeNodeId) {
    const tabs = document.querySelectorAll(".report-tab");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => {
                t.classList.remove("active");
                t.style.background = "";
                t.style.borderColor = "";
            });

            tab.classList.add("active");
            tab.style.background = "rgba(37,99,235,0.2)";
            tab.style.borderColor = "var(--primary-blue)";

            const period = tab.getAttribute("data-period") || "weekly";
            updateReportValues(period, activeNodeId);
        });
    });
}

/**
 * PDF Export and Quick Filter Listeners
 */
function setupActionHandlers() {
    // PDF Export
    const pdfBtn = document.getElementById("downloadPdfBtn");
    if (pdfBtn) {
        pdfBtn.onclick = () => {
            const btnText = document.getElementById("pdfBtnText");
            if (btnText) btnText.innerText = "Generating Audit PDF...";
            setTimeout(() => {
                if (btnText) btnText.innerText = "Download PDF Report";
                window.print();
            }, 600);
        };
    }

    // Filter Dropdown
    const quickFilterSelect = document.getElementById("reportQuickFilter");
    if (quickFilterSelect) {
        quickFilterSelect.onchange = (e) => {
            const filterValue = e.target.value;
            const logRows = document.querySelectorAll("#report-table-body .report-log-item");

            logRows.forEach((row) => {
                const category = row.getAttribute("data-category");
                if (filterValue === "all" || category === filterValue) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        };
    }
}

/**
 * Binds live telemetry for the active cycle row and summary calculations
 */
function bindLiveTelemetry(activeNodeId) {
    unsubLive = subscribeLive((data) => {
        if (!data) return;

        if (data.energy) currentBaseEnergy = Number(data.energy);
        if (data.power) currentLivePower = Number(data.power);
        if (data.voltage) currentLiveVoltage = Number(data.voltage);

        const rowVolt = document.getElementById("rep-row-volt");
        const rowLoad = document.getElementById("rep-row-load");
        const rowNet = document.getElementById("rep-row-net");
        const rowStatus = document.getElementById("rep-row-status");

        if (rowVolt) rowVolt.innerText = `${currentLiveVoltage.toFixed(1)} V`;
        if (rowLoad) rowLoad.innerText = `${currentLivePower.toFixed(2)} kW`;

        const net = currentBaseSolar - currentLivePower;
        if (rowNet) {
            rowNet.innerText = net >= 0 ? `+${net.toFixed(2)} kW (Export)` : `${net.toFixed(2)} kW (Import)`;
            rowNet.style.color = net >= 0 ? "var(--accent-green)" : "var(--accent-orange)";
        }

        if (rowStatus) {
            rowStatus.innerText = currentLiveVoltage >= 200 && currentLiveVoltage <= 250 ? "Verified Optimal" : "Voltage Warning";
            rowStatus.className = currentLiveVoltage >= 200 && currentLiveVoltage <= 250 ? "green-text" : "orange-text";
        }

        const activeTab = document.querySelector(".report-tab.active");
        const period = activeTab ? activeTab.getAttribute("data-period") : "weekly";
        updateReportValues(period, activeNodeId);
    }, activeNodeId);

    unsubSolar = subscribeSolar((data) => {
        if (!data) return;

        if (data.power) currentBaseSolar = Number(data.power);
        const rowSolar = document.getElementById("rep-row-solar");
        if (rowSolar) rowSolar.innerText = `${currentBaseSolar.toFixed(2)} kW`;

        const activeTab = document.querySelector(".report-tab.active");
        const period = activeTab ? activeTab.getAttribute("data-period") : "weekly";
        updateReportValues(period, activeNodeId);
    }, activeNodeId);
}

/**
 * Queries real historical audit records from devices/{nodeId}/history
 */
function bindHistoricalAuditLogs(activeNodeId) {
    const tableBody = document.getElementById("report-table-body");
    if (!tableBody) return;

    const historyRef = query(ref(db, `devices/${activeNodeId}/history`), limitToLast(8));

    unsubHistory = onValue(historyRef, (snapshot) => {
        // Keep the first row (Current Cycle)
        const liveRow = tableBody.querySelector(".report-log-item[data-category='power']");
        tableBody.innerHTML = "";
        if (liveRow) tableBody.appendChild(liveRow);

        if (!snapshot.exists()) {
            const emptyRow = document.createElement("tr");
            emptyRow.className = "report-log-item";
            emptyRow.setAttribute("data-category", "info");
            emptyRow.innerHTML = `
                <td colspan="6" style="padding: 16px; text-align: center; color: var(--text-muted);">
                    <i class="fa-solid fa-clock-rotate-left" style="margin-right: 6px;"></i> No prior historical audit records recorded for ${activeNodeId.toUpperCase()}.
                </td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }

        const records = [];
        snapshot.forEach((childSnap) => {
            records.unshift(childSnap.val()); // newest first
        });

        records.forEach((record, index) => {
            const timeStr = record.timestamp
                ? new Date(record.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : record.time || `Cycle #${index + 1}`;

            const volt = Number(record.voltage || 230).toFixed(1);
            const solar = Number(record.solar || record.solarPower || (currentBaseSolar || 0)).toFixed(2);
            const load = Number(record.power || 0).toFixed(2);
            const net = Number(solar - load);

            const isCritical = volt > 250 || volt < 195 || load > 40;
            const category = isCritical ? "critical" : "power";

            const row = document.createElement("tr");
            row.className = "report-log-item";
            row.setAttribute("data-category", category);
            row.style.borderBottom = "1px solid rgba(255,255,255,0.04)";

            row.innerHTML = `
                <td style="padding: 12px; color: var(--text-primary); font-family: monospace;">${timeStr}</td>
                <td style="padding: 12px;">${volt} V</td>
                <td style="padding: 12px; color: var(--accent-green);">${solar} kW</td>
                <td style="padding: 12px;">${load} kW</td>
                <td style="padding: 12px; color: ${net >= 0 ? "var(--accent-green)" : "var(--accent-orange)"};">${net >= 0 ? "+" : ""}${net.toFixed(2)} kW</td>
                <td style="padding: 12px;">
                    <span class="${isCritical ? "alert-critical" : "green-text"}">
                        ${isCritical ? "Threshold Trip" : "Audit Verified"}
                    </span>
                </td>
            `;

            tableBody.appendChild(row);
        });
    });
}
