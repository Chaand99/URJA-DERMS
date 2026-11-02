export function generateInsights(metrics, latestRecord) {

    const insights = [];

    // Solar Contribution
    if ((latestRecord.solar || 0) > (latestRecord.power || 0) * 0.7) {

        insights.push({
            icon: "☀️",
            title: "Excellent Solar Generation",
            message: "Solar is supplying most of the current demand."
        });

    } else {

        insights.push({
            icon: "⚡",
            title: "Grid Dependency",
            message: "Solar contribution is currently low."
        });

    }

    // Battery

    if ((latestRecord.battery || 0) > 80) {

        insights.push({
            icon: "🔋",
            title: "Battery Healthy",
            message: "Battery state of charge is above 80%."
        });

    } else if ((latestRecord.battery || 0) > 40) {

        insights.push({
            icon: "🔋",
            title: "Battery Moderate",
            message: "Battery charge is adequate."

        });

    } else {

        insights.push({

            icon: "🪫",

            title: "Battery Low",

            message: "Battery recharge recommended."

        });

    }

    // Voltage

    if (metrics.averageVoltage > 235) {

        insights.push({

            icon: "⚠️",

            title: "High Voltage",

            message: "Average voltage exceeds normal range."

        });

    } else if (metrics.averageVoltage < 210) {

        insights.push({

            icon: "⚠️",

            title: "Low Voltage",

            message: "Average voltage is below nominal."

        });

    } else {

        insights.push({

            icon: "✅",

            title: "Voltage Stable",

            message: "Voltage is operating within limits."

        });

    }

    return insights;

}