/**
 * ============================================================================
 * URJA FIREBASE MODULE (js/firebase.js)
 * Initializes Firebase SDK, database references, and dynamic node routing.
 * ============================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    get,
    child,
    push,
    update,
    set,
    onValue,
    query,
    orderByChild,
    startAt,
    limitToLast
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { firebaseConfig } from "./config/firebaseConfig.js";

// Initialize Firebase Core, Realtime Database & Auth (Singleton instances)
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ----------------------------------------------------------------------------
// DEFAULT STATIC REFERENCES (Fallback for node04A)
// ----------------------------------------------------------------------------
const deviceRef = ref(db, "devices/node04A");
const liveRef = ref(db, "devices/node04A/live");
const solarRef = ref(db, "devices/node04A/solar");
const batteryRef = ref(db, "devices/node04A/battery");
const environmentRef = ref(db, "devices/node04A/environment");
const alertsRef = ref(db, "devices/node04A/alerts");
const logsRef = ref(db, "devices/node04A/logs");
const historyRef = ref(db, "devices/node04A/history");

/**
 * ============================================================================
 * DYNAMIC NODE REFERENCE HELPER
 * Returns a Firebase database reference for any given Node ID 
 * (automatically falls back to localStorage active node if none provided).
 * ============================================================================
 * @param {string} [nodeId] - Optional Node Identifier (e.g., 'node01', 'node02', 'node04A')
 * @returns {import("firebase/database").DatabaseReference} Firebase Database Reference
 */
export function getNodeRef(nodeId) {
    const targetNode = nodeId || localStorage.getItem("urja_active_node") || "node04A";
    return ref(db, `devices/${targetNode}`);
}

// ----------------------------------------------------------------------------
// MODULE EXPORTS
// ----------------------------------------------------------------------------
export {
    app,
    db,
    auth,
    ref,
    child,
    onValue,
    set,
    update,
    push,
    get,
    limitToLast,
    query,
    orderByChild,
    startAt,
    deviceRef,
    liveRef,
    solarRef,
    batteryRef,
    environmentRef,
    alertsRef,
    logsRef,
    historyRef
};