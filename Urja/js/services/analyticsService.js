/**
 * ============================================================================
 * HISTORICAL ANALYTICS SERVICE (js/services/analyticsService.js)
 * Fetches, filters, and calculates metrics from telemetry records.
 * ============================================================================
 */

import { db, ref, get, onValue, query, orderByChild, startAt } from "../firebase.js";

// Helper function to get the current active node path dynamically
function getActiveHistoryRef(nodeId = null) {
    const activeNodeId = nodeId || localStorage.getItem("urja_active_node") || "node04A";
    return ref(db, `devices/${activeNodeId}/history`);
}

/**
 * Fetch all historical telemetry records for the active node
 */
export async function getHistory(nodeId = null) {
    const historyRef = getActiveHistoryRef(nodeId);
    const snapshot = await get(historyRef);

    if (!snapshot.exists()) {
        return [];
    }

    return Object.values(snapshot.val());
}

/**
 * Fetches filtered historical records based on timeframe window (in hours)
 * e.g., 24 Hours, 168 Hours (7 Days), 720 Hours (30 Days)
 */
export async function fetchHistoricalData(nodeId = null, timeWindowHours = 24) {
    const activeNodeId = nodeId || localStorage.getItem("urja_active_node") || "node04A";
    const cutoffTime = Date.now() - (timeWindowHours * 60 * 60 * 1000);
    
    const historyRef = ref(db, `devices/${activeNodeId}/history`);
    
    try {
        // Query records starting from the calculated cutoff timestamp
        const q = query(historyRef, orderByChild('timestamp'), startAt(cutoffTime));
        const snapshot = await get(q);
        
        if (!snapshot.exists()) {
            return [];
        }

        const records = [];
        snapshot.forEach((childSnap) => {
            records.push(childSnap.val());
        });
        
        return records;
    } catch (error) {
        console.error("Error fetching historical telemetry window:", error);
        return [];
    }
}

/**
 * Calculate analytics metrics from a set of records
 */
export function calculateMetrics(records) {
    if (!records || !records.length) {
        return {
            totalEnergy: 0,
            averageVoltage: 0,
            averageCurrent: 0,
            averagePower: 0,
            peakPower: 0,
            averagePF: 0,
            averageFrequency: 0,
            recordCount: 0
        };
    }

    const latest = records[records.length - 1];
    const earliest = records[0];

    const average = (key) => {
        const values = records
            .map(r => Number(r[key]))
            .filter(v => !isNaN(v));

        if (!values.length) return 0;

        return values.reduce((a, b) => a + b, 0) / values.length;
    };

    return {
        totalEnergy: (Number(latest.energy) || 0) - (Number(earliest.energy) || 0),
        averageVoltage: average("voltage"),
        averageCurrent: average("current"),
        averagePower: average("power"),
        peakPower: Math.max(...records.map(r => Number(r.power) || 0)),
        averagePF: average("powerFactor"),
        averageFrequency: average("frequency"),
        recordCount: records.length
    };
}

/**
 * Listen for realtime history updates for the active node
 * @returns {Function} Unsubscribe function for cleanup
 */
export function subscribeHistory(callback, nodeId = null) {
    const historyRef = getActiveHistoryRef(nodeId);

    const unsub = onValue(historyRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback([]);
            return;
        }

        const history = Object.values(snapshot.val());
        callback(history);
    });

    return unsub;
}