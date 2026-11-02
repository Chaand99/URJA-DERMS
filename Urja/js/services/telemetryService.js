/**
 * ============================================================================
 * NODE-AWARE TELEMETRY SERVICE (js/services/telemetryService.js)
 * Manages real-time Firebase subscriptions bound dynamically to the active node.
 * ============================================================================
 */

import { emit } from "./eventBus.js";
import { db, ref, onValue, child, getNodeRef } from "../firebase.js";

// Active subscription registry for global lifecycle cleanup
const activeSubscriptions = new Set();

/**
 * Returns the currently active node ID from localStorage (defaults to node04A)
 * @returns {string} Active node identifier
 */
export function getActiveNodeId() {
    return localStorage.getItem("urja_active_node") || "node04A";
}

/**
 * Sets the active node ID and notifies all listeners via EventBus
 * @param {string} nodeId - Target node identifier
 */
export function setActiveNodeId(nodeId) {
    if (!nodeId) return;
    localStorage.setItem("urja_active_node", nodeId);
    emit("nodeChanged", nodeId);
}

/**
 * Internal helper to create and track a Firebase listener
 * @param {import("firebase/database").DatabaseReference} targetRef - Firebase reference
 * @param {Function} callback - Telemetry callback
 * @param {string} [eventName] - Optional EventBus event to publish
 * @returns {Function} Unsubscribe function
 */
function createSubscription(targetRef, callback, eventName = null) {
    const unsub = onValue(targetRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (eventName) emit(eventName, data);
            if (typeof callback === "function") callback(data);
        } else {
            if (typeof callback === "function") callback(null);
        }
    }, (error) => {
        console.warn(`Firebase telemetry read error at ${targetRef.key}:`, error);
    });

    const safeUnsub = () => {
        try {
            unsub();
        } catch (e) {
            // Ignore if already disconnected
        }
        activeSubscriptions.delete(safeUnsub);
    };

    activeSubscriptions.add(safeUnsub);
    return safeUnsub;
}

/**
 * Listen for live electrical telemetry on the active or specified node
 * Path: devices/{nodeId}/live
 * @param {Function} callback - Invoked on data update
 * @param {string} [nodeId] - Optional node override (defaults to active node)
 * @returns {Function} Unsubscribe function
 */
export function subscribeLive(callback, nodeId = null) {
    const targetNode = nodeId || getActiveNodeId();
    const liveRef = ref(db, `devices/${targetNode}/live`);
    return createSubscription(liveRef, callback, "telemetry");
}

/**
 * Listen for solar generation telemetry on the active or specified node
 * Path: devices/{nodeId}/solar
 * @param {Function} callback - Invoked on data update
 * @param {string} [nodeId] - Optional node override (defaults to active node)
 * @returns {Function} Unsubscribe function
 */
export function subscribeSolar(callback, nodeId = null) {
    const targetNode = nodeId || getActiveNodeId();
    const solarRef = ref(db, `devices/${targetNode}/solar`);
    return createSubscription(solarRef, callback, "solarTelemetry");
}

/**
 * Listen for battery/storage telemetry on the active or specified node
 * Path: devices/{nodeId}/battery
 * @param {Function} callback - Invoked on data update
 * @param {string} [nodeId] - Optional node override (defaults to active node)
 * @returns {Function} Unsubscribe function
 */
export function subscribeBattery(callback, nodeId = null) {
    const targetNode = nodeId || getActiveNodeId();
    const batteryRef = ref(db, `devices/${targetNode}/battery`);
    return createSubscription(batteryRef, callback, "batteryTelemetry");
}

/**
 * Listen for environmental sensor telemetry on the active or specified node
 * Path: devices/{nodeId}/environment
 * @param {Function} callback - Invoked on data update
 * @param {string} [nodeId] - Optional node override (defaults to active node)
 * @returns {Function} Unsubscribe function
 */
export function subscribeEnvironment(callback, nodeId = null) {
    const targetNode = nodeId || getActiveNodeId();
    const envRef = ref(db, `devices/${targetNode}/environment`);
    return createSubscription(envRef, callback, "envTelemetry");
}

/**
 * Clean up all tracked subscriptions (called during page transitions / node switches)
 */
export function unsubscribeAll() {
    activeSubscriptions.forEach((unsub) => {
        try {
            unsub();
        } catch (e) {
            // Ignore
        }
    });
    activeSubscriptions.clear();
}
