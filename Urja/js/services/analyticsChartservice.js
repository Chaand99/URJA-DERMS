let powerChart = null;
let voltageChart = null;
let currentChart = null;
let energyChart = null;

/**
 * Cleanup function to destroy existing charts before recreating
 */
export function destroyAnalyticsCharts() {
    if (powerChart) { powerChart.destroy(); powerChart = null; }
    if (voltageChart) { voltageChart.destroy(); voltageChart = null; }
    if (currentChart) { currentChart.destroy(); currentChart = null; }
    if (energyChart) { energyChart.destroy(); energyChart = null; }
}

function createChartCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return canvas.getContext("2d");
}

export function initAnalyticsCharts(history) {
    // Clean up first
    destroyAnalyticsCharts();

    const recentHistory = history.slice(-50);

    const labels = recentHistory.map(record =>
        new Date(record.timestamp).toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        })
    );

    const powerData =
        recentHistory.map(r=>Number(r.power)||0);

    const voltageData =
        recentHistory.map(r=>Number(r.voltage)||0);

    const currentData =
        recentHistory.map(r=>Number(r.current)||0);

    const energyData =
        recentHistory.map(r=>Number(r.energy)||0);

    const pfData =
        recentHistory.map(r=>Number(r.powerFactor)||0);
        // =============================
// Chart 1 : Power Consumption
// =============================

const dailyCtx = createChartCanvas("dailyConsumptionChart");

if (dailyCtx) {

    const gradient = dailyCtx.createLinearGradient(0, 0, 0, 300);

    gradient.addColorStop(0, "rgba(37,99,235,0.30)");
    gradient.addColorStop(1, "rgba(37,99,235,0)");

    powerChart = new Chart(dailyCtx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Power (kW)",

                data: powerData,

                borderColor: "#3b82f6",

                backgroundColor: gradient,

                borderWidth: 2,

                fill: true,

                tension: 0.35,

                pointRadius: 3,

                pointHoverRadius: 5

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

// =============================
// Chart 2 : Voltage Trend
// =============================

const distCtx = createChartCanvas("weeklyTrendChart");

if (distCtx) {
    voltageChart = new Chart(distCtx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Voltage (V)",

                data: voltageData,

                borderColor: "#10b981",

                backgroundColor: "rgba(16,185,129,0.15)",

                borderWidth: 2,

                fill: true,

                tension: 0.35,

                pointRadius: 3,

                pointHoverRadius: 5

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: false

                }

            }

        }

    });

}

// =============================
// Chart 3 : Current Trend
// =============================

const weeklyCtx = createChartCanvas("energyDistributionChart");

if (weeklyCtx) {
    currentChart = new Chart(weeklyCtx, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Current (A)",

                data: currentData,

                backgroundColor: "#3b82f6",

                borderRadius: 5,

                borderSkipped: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                },

                x: {

                    grid: {

                        display: false

                    }

                }

            }

        }

    });

}

}
