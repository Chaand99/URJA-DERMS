import { emit } from "./eventBus.js";
import {
    ALERT_IDS,
    ALERT_SEVERITY,
    LIMITS
} from "../config/constants.js";
// Active alert state
const activeAlerts = new Set();

/**
 * Raise an alert only once.
 */
function raiseAlert(id, alert) {

    if (activeAlerts.has(id)) return;

    activeAlerts.add(id);

    emit("alert", alert);

}

/**
 * Resolve an active alert.
 */
function resolveAlert(id, title) {

    if (!activeAlerts.has(id)) return;

    activeAlerts.delete(id);

    emit("alertResolved", {
        severity: ALERT_SEVERITY.INFO,
        title: `${title} Restored`,
        message: `${title} condition has returned to normal.`,
        timestamp: new Date().toLocaleTimeString()
    });

}

/**
 * Evaluate incoming telemetry.
 */
export function evaluateTelemetry(data) {

    // ---------------- High Voltage ----------------
    if(data.voltage > LIMITS.HIGH_VOLTAGE) {

        raiseAlert(ALERT_IDS.HIGH_VOLTAGE,{
            severity: ALERT_SEVERITY.CRITICAL,
            title: "High Voltage",
            message: `Voltage reached ${data.voltage} V`,
            timestamp: new Date().toLocaleTimeString()
        });

    } else {

        resolveAlert(ALERT_IDS.HIGH_VOLTAGE, "High Voltage");

    }

    // ---------------- Low Voltage ----------------
    if(data.voltage < LIMITS.LOW_VOLTAGE) {

        raiseAlert(ALERT_IDS.LOW_VOLTAGE, {
            severity: ALERT_SEVERITY.CRITICAL,
            title: "Low Voltage",
            message: `Voltage dropped to ${data.voltage} V`,
            timestamp: new Date().toLocaleTimeString()
        });

    } else {

        resolveAlert(ALERT_IDS.LOW_VOLTAGE, "Low Voltage");

    }

    // ---------------- High Current ----------------
    if(data.current > LIMITS.HIGH_CURRENT){

        raiseAlert(ALERT_IDS.HIGH_CURRENT, {
            severity: ALERT_SEVERITY.WARNING,
            title: "High Current",
            message: `Current = ${data.current} A`,
            timestamp: new Date().toLocaleTimeString()
        });

    } else {

        resolveAlert(ALERT_IDS.HIGH_CURRENT, "High Current");

    }

    // ---------------- High Power ----------------
    if(data.power > LIMITS.HIGH_POWER){

        raiseAlert(ALERT_IDS.HIGH_POWER, {
            severity: ALERT_SEVERITY.WARNING,
            title: "High Power Consumption",
            message: `${data.power} kW load detected`,
            timestamp: new Date().toLocaleTimeString()
        });

    } else {

        resolveAlert(ALERT_IDS.HIGH_POWER, "High Power Consumption");

    }

}