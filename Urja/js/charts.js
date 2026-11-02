/**
 * Urja Premium Charts Configuration (Chart.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is missing! Please add the CDN to your index.html.");
        return;
    }
    initPremiumCharts();
});

// Helper function to inject canvas into existing placeholders
function createChartContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // Clear the placeholder graphic
    container.innerHTML = '<canvas style="width:100%; height:100%;"></canvas>';
    
    // Remove the dashed borders from the container for a clean look
    container.style.border = 'none';
    container.style.background = 'transparent';
    
    return container.querySelector('canvas').getContext('2d');
}

function initPremiumCharts() {
    // =========================================================
    // 1. GLOBAL PREMIUM DARK THEME DEFAULTS
    // =========================================================
    Chart.defaults.color = '#94a3b8'; // text-secondary
    Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.04)';
    Chart.defaults.scale.grid.borderColor = 'transparent';
    
    // Premium Tooltips
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 20, 30, 0.95)';
    Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.bodyColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.08)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.boxPadding = 6;
    
    // Sleek Line & Point aesthetics
    Chart.defaults.elements.line.tension = 0.4; // Smooth cubic-bezier curves
    Chart.defaults.elements.point.radius = 0;   // Hide dots by default
    Chart.defaults.elements.point.hoverRadius = 6;
    Chart.defaults.elements.point.hitRadius = 10;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.padding = 20;

    // Time label generator for dummy data
    const generateTimeLabels = (count, intervalMins) => {
        const labels = [];
        let now = new Date();
        now.setMinutes(now.getMinutes() - (count * intervalMins));
        for (let i = 0; i < count; i++) {
            now.setMinutes(now.getMinutes() + intervalMins);
            labels.push(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    };


    // =========================================================
    // 2. LIVE POWER FLOW (Multi-Line Chart)
    // =========================================================
    const livePowerCtx = createChartContainer('livePowerChart');
    if (livePowerCtx) {
        new Chart(livePowerCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(15, 2),
                datasets: [
                    {
                        label: 'Facility Load',
                        data: [6.2, 6.5, 6.8, 7.2, 7.5, 7.1, 7.0, 7.4, 7.8, 8.2, 8.5, 8.1, 7.9, 7.6, 7.5],
                        borderColor: '#2563eb', // Primary Blue
                        borderWidth: 2,
                    },
                    {
                        label: 'Solar PV',
                        data: [3.1, 3.2, 3.5, 3.8, 4.2, 4.5, 4.8, 4.7, 4.9, 5.2, 5.5, 5.6, 5.8, 5.9, 6.0],
                        borderColor: '#10b981', // Accent Green
                        borderWidth: 2,
                    },
                    {
                        label: 'Grid Draw',
                        data: [3.1, 3.3, 3.3, 3.4, 3.3, 2.6, 2.2, 2.7, 2.9, 3.0, 3.0, 2.5, 2.1, 1.7, 1.5],
                        borderColor: '#f59e0b', // Accent Orange
                        borderWidth: 2,
                        borderDash: [5, 5], // Dashed line for grid
                    }
                ]
            },
            options: {
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Power (kW)', color: '#64748b' }
                    }
                }
            }
        });
    }

    // =========================================================
    // 3. SOLAR GENERATION (Area Chart)
    // =========================================================
    const solarCtx = createChartContainer('solarChart');
    if (solarCtx) {
        // Create green gradient
        const gradient = solarCtx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        new Chart(solarCtx, {
            type: 'line',
            data: {
                labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                datasets: [{
                    label: 'Yield (kW)',
                    data: [0, 1.2, 4.5, 7.8, 8.2, 6.1, 2.4, 0],
                    borderColor: '#10b981',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    legend: { display: false } // Hide legend for cleaner look
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // =========================================================
    // 4. BATTERY VOLTAGE (Line Chart)
    // =========================================================
    const batteryCtx = createChartContainer('batteryChart');
    if (batteryCtx) {
        new Chart(batteryCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(12, 5),
                datasets: [{
                    label: 'Bank Voltage',
                    data: [50.2, 50.4, 50.7, 51.1, 51.5, 51.8, 52.1, 52.4, 52.8, 53.1, 53.4, 53.6],
                    borderColor: '#8b5cf6', // Premium SaaS Purple
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 48,
                        max: 56,
                        ticks: { stepSize: 2 },
                        title: { display: true, text: 'Volts (V)', color: '#64748b' }
                    }
                }
            }
        });
    }
}