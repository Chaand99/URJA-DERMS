/**
 * ============================================================================
 * URJA CHART CONTROLLER (js/services/chartService.js)
 * Manages Chart.js instances for Live Power Flow and 24-Hour Solar Generation.
 * ============================================================================
 */

let powerChartInstance = null;
let solarChartInstance = null;

/**
 * Initialize Live Rolling Power Chart
 */
export function initPowerChart(canvasId) {
    const canvas = document.getElementById(canvasId);

    // Safety check: ensure element exists and is a canvas
    if (!canvas || typeof canvas.getContext !== "function") {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (powerChartInstance) {
        powerChartInstance.destroy();
        powerChartInstance = null;
    }

    powerChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["--:--", "--:--", "--:--", "--:--", "--:--", "--:--", "--:--", "Live"],
            datasets: [
                {
                    label: "Active Power (kW)",
                    data: [0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.12)",
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: "#3b82f6"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(15, 20, 30, 0.9)",
                    titleColor: "#f8fafc",
                    bodyColor: "#94a3b8",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.03)" },
                    ticks: { color: "#94a3b8", font: { size: 11 } }
                },
                y: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#94a3b8", font: { size: 11 } }
                }
            }
        }
    });
}

/**
 * Update Live Rolling Power Chart with incoming telemetry point
 */
export function updatePowerChart(newPowerValue) {
    if (!powerChartInstance) return;

    const dataset = powerChartInstance.data.datasets[0];
    const labels = powerChartInstance.data.labels;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    labels.shift();
    labels.push(now);

    dataset.data.shift();
    dataset.data.push(Number(newPowerValue) || 0);

    powerChartInstance.update("none");
}

/**
 * Initialize 24-Hour Solar Generation History Chart
 */
export function initSolarChart(canvasId, historicalData = null) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof canvas.getContext !== "function") {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (solarChartInstance) {
        solarChartInstance.destroy();
        solarChartInstance = null;
    }

    // Default hourly labels if historical data is not yet populated
    const labels = historicalData?.labels || ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];
    const points = historicalData?.points || [0, 0, 2.4, 7.8, 5.1, 0.4, 0];

    solarChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Solar Generation (kW)",
                    data: points,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: "#10b981"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(15, 20, 30, 0.9)",
                    titleColor: "#f8fafc",
                    bodyColor: "#94a3b8",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.03)" },
                    ticks: { color: "#94a3b8", font: { size: 10 } }
                },
                y: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#94a3b8", font: { size: 10 } }
                }
            }
        }
    });
}

/**
 * Update 24-Hour Solar Chart with real Firebase historical records
 */
export function updateSolarChart(labels, points) {
    if (!solarChartInstance) return;

    if (labels && labels.length > 0) {
        solarChartInstance.data.labels = labels;
    }
    if (points && points.length > 0) {
        solarChartInstance.data.datasets[0].data = points;
    }

    solarChartInstance.update();
}
