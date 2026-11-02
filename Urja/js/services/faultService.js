/**
 * ============================================================================
 * FAULT DETECTION & PROTECTION ENGINE (js/services/faultService.js)
 * Evaluates live telemetry against safety thresholds to trigger hardware trips.
 * ============================================================================
 */

import { getNodeRef, update, child } from "../firebase.js";
import { db, ref, push, set } from "../firebase.js";


const SAFETY_LIMITS = {
    MAX_VOLTAGE: 255.0, // Volts
    MIN_VOLTAGE: 195.0, // Volts
    MAX_CURRENT: 45.0,  // Amps
    MAX_TEMP: 65.0      // Celsius
};

export function evaluateFaults(nodeId, liveData, envData) {
    let faultDetected = false;
    let faultReason = "";

    if (liveData.voltage > SAFETY_LIMITS.MAX_VOLTAGE) {
        faultDetected = true;
        faultReason = `Overvoltage Critical: ${liveData.voltage}V (Limit: ${SAFETY_LIMITS.MAX_VOLTAGE}V)`;
    } else if (liveData.voltage < SAFETY_LIMITS.MIN_VOLTAGE) {
        faultDetected = true;
        faultReason = `Undervoltage Fault: ${liveData.voltage}V (Limit: ${SAFETY_LIMITS.MIN_VOLTAGE}V)`;
    } else if (liveData.current > SAFETY_LIMITS.MAX_CURRENT) {
        faultDetected = true;
        faultReason = `Overcurrent Overload: ${liveData.current}A`;
    }

    if (envData && envData.temperature > SAFETY_LIMITS.MAX_TEMP) {
        faultDetected = true;
        faultReason = `Thermal Overheat: ${envData.temperature}°C`;
    }

    if (faultDetected) {
        triggerHardwareTrip(nodeId, faultReason);
    }
}

function triggerHardwareTrip(nodeId, reason) {
    console.warn(`🚨 HARDWARE TRIP ENGAGED on ${nodeId}: ${reason}`);
    const nodeRef = getNodeRef(nodeId);
    
    // Push critical alert to Firebase for remote telemetry visibility
    update(child(nodeRef, 'status'), {
        tripState: true,
        tripReason: reason,
        tripTimestamp: Date.now()
    });

    window.dispatchEvent(new CustomEvent('hardwareTripTriggered', { detail: { nodeId, reason } }));
}

export function evaluateTelemetryForFaults(nodeId, data) {
    if (!data) return;

    const voltage = Number(data.voltage) || 0;
    const temperature = Number(data.temperature) || 25;

    // Overvoltage Protection Threshold (> 250V)
    if (voltage > 250) {
        triggerFaultEvent(nodeId, {
            severity: "CRITICAL",
            title: `Overvoltage Trip Warning (${voltage}V)`,
            description: `Grid voltage exceeded safety threshold on ${nodeId}. Automatic relay isolation recommended.`
        });
    }

    // Thermal Throttling Threshold (> 45°C)
    if (temperature > 45) {
        triggerFaultEvent(nodeId, {
            severity: "WARNING",
            title: `Thermal Throttling (${temperature}°C)`,
            description: `Inverter or Battery temperature breaching optimal operating limits.`
        });
    }
}

async function triggerFaultEvent(nodeId, faultData) {
    const alertsRef = ref(db, `devices/${nodeId}/alerts`);
    const newAlertRef = push(alertsRef);
    
    await set(newAlertRef, {
        ...faultData,
        timestamp: Date.now()
    });
}