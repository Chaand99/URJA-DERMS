/**
 * ============================================================================
 * CORTEX EVENTS SYNC BRIDGE (js/services/cortexSync.js)
 * Syncs top 4 Cortex events to the main dashboard highlights.
 * ============================================================================
 */

import { db, ref, onValue, query, limitToLast } from "../firebase.js";

export function initCortexDashboardHighlights(containerElementId) {
    const container = document.getElementById(containerElementId);
    if (!container) return;

    // Cortex events path in Firebase using Modular SDK
    const cortexQuery = query(ref(db, "cortex/events"), limitToLast(4));

    onValue(cortexQuery, (snapshot) => {
        container.innerHTML = "";

        if (!snapshot.exists()) {
            container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 10px;">No active Cortex anomalies reported.</div>`;
            return;
        }

        snapshot.forEach((childSnap) => {
            const event = childSnap.val();

            // Create interactive highlight item
            const card = document.createElement("div");
            card.className = "cortex-highlight-card glass-card";
            card.style.cssText = "padding: 12px 16px; margin-bottom: 8px; border-radius: 8px; cursor: pointer; border-left: 4px solid var(--accent-orange); transition: transform 0.2s;";

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text-primary); font-size: 0.85rem;">${event.title || "Cortex Anomaly"}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-secondary);">${new Date(event.timestamp || Date.now()).toLocaleTimeString()}</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.78rem; margin: 4px 0 0 0;">${event.description || "System state requires manual verification."}</p>
            `;

            container.appendChild(card);
        });
    });
}
