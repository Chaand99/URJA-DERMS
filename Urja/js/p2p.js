// js/p2p.js

import { getNodeRef, db, ref, push, set, onValue, query, limitToLast } from "./firebase.js";

// Active unsubscribe handles for lifecycle cleanup
let unsubProd = null;
let unsubCons = null;
let unsubLedger = null;

export function destroyP2P() {
    if (unsubProd) { unsubProd(); unsubProd = null; }
    if (unsubCons) { unsubCons(); unsubCons = null; }
    if (unsubLedger) { unsubLedger(); unsubLedger = null; }
}

export function initP2P() {
    console.log("Dynamic P2P Trading Hub Initialized.");

    // Cleanup previous listeners
    destroyP2P();

    const producerSelect = document.getElementById("p2pProducerSelect");
    const consumerSelect = document.getElementById("p2pConsumerSelect");
    const transferBtn = document.getElementById("startP2PTransferBtn");
    const statusLabel = document.getElementById("p2pTransferStatus");
    const transferRateEl = document.getElementById("p2p-transfer-rate");
    const targetBatteryBar = document.getElementById("targetBatteryProgress");
    const targetBatteryLabel = document.getElementById("targetBatteryLabel");
    const ledgerTableBody = document.getElementById("p2pLedgerTableBody");

    let isTransferring = false;
    let liveDeficit = 0;

    // =========================================================================
    // 1. DYNAMIC NODE BINDINGS & FIREBASE LISTENERS (Updates Producer & Consumer UI)
    // =========================================================================
    function updateP2PBindings() {
        const producerId = producerSelect ? producerSelect.value : "node01";
        const consumerId = consumerSelect ? consumerSelect.value : "node02";

        localStorage.setItem("urja_p2p_producer", producerId);
        localStorage.setItem("urja_p2p_consumer", consumerId);

        // Clear existing
        if (unsubProd) { unsubProd(); unsubProd = null; }
        if (unsubCons) { unsubCons(); unsubCons = null; }

        const prodRef = getNodeRef(producerId);
        const consRef = getNodeRef(consumerId);

        if (!prodRef || !consRef) return;

        // Bind Producer Node
        unsubProd = onValue(prodRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const solar = Number(data.solar?.power || 0);
            const load = Number(data.live?.power || 0);
            const net = solar - load;

            const solarEl = document.getElementById("node1-solar");
            const loadEl = document.getElementById("node1-load");
            const netEl = document.getElementById("node1-net");

            if (solarEl) solarEl.innerHTML = `${solar.toFixed(2)} kW`;
            if (loadEl) loadEl.innerHTML = `${load.toFixed(2)} kW`;
            if (netEl) {
                netEl.innerHTML = `+${net.toFixed(2)} kW (Exporting)`;
                netEl.className = "green-text";
            }
        });

        // Bind Consumer Node
        unsubCons = onValue(consRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const solar = Number(data.solar?.power || 0);
            const load = Number(data.live?.power || 0);
            liveDeficit = Math.max(0, load - solar);

            const actualBatterySoC = Number(data.battery?.soc ?? data.battery?.percentage ?? 85);

            const solarEl = document.getElementById("node2-solar");
            const loadEl = document.getElementById("node2-load");
            const netEl = document.getElementById("node2-net");

            if (solarEl) solarEl.innerHTML = `${solar.toFixed(2)} kW`;
            if (loadEl) loadEl.innerHTML = `${load.toFixed(2)} kW`;
            if (netEl) {
                netEl.innerHTML = `-${liveDeficit.toFixed(2)} kW (Deficit)`;
                netEl.style.color = "var(--accent-orange)";
            }
            if (!isTransferring && transferRateEl) {
                transferRateEl.innerText = `${liveDeficit.toFixed(2)} kW Available`;
            }

            if (!isTransferring && targetBatteryBar && targetBatteryLabel) {
                targetBatteryBar.style.width = `${actualBatterySoC}%`;
                targetBatteryLabel.innerText = `${actualBatterySoC}% (Connected Client SoC)`;
            }
        });
    }

    // Restore saved selections on load
    if (producerSelect && consumerSelect) {
        const savedProducer = localStorage.getItem("urja_p2p_producer");
        const savedConsumer = localStorage.getItem("urja_p2p_consumer");
        if (savedProducer) producerSelect.value = savedProducer;
        if (savedConsumer) consumerSelect.value = savedConsumer;

        producerSelect.addEventListener("change", updateP2PBindings);
        consumerSelect.addEventListener("change", updateP2PBindings);
    }

    updateP2PBindings();

    // =========================================================================
    // 2. REAL FIREBASE LEDGER HISTORY SYNC
    // =========================================================================
    if (ledgerTableBody) {
        const historyQuery = query(ref(db, "p2p_market/history"), limitToLast(10));

        unsubLedger = onValue(historyQuery, (snapshot) => {
            ledgerTableBody.innerHTML = "";

            if (!snapshot.exists()) {
                ledgerTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No P2P dispatch settlements recorded yet.</td></tr>`;
                return;
            }

            snapshot.forEach((childSnap) => {
                const item = childSnap.val();
                const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "N/A";
                const formatNode = (n) => {
                    if (!n || n === "N/A") return "N/A";
                    if (n === "node04A") return "Node #04-A";
                    return `Node #${n.replace("node", "")}`;
                };

                ledgerTableBody.innerHTML += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 12px; color: var(--text-secondary);">${timeStr}</td>
                        <td style="padding: 10px 12px; font-weight: 500;">${formatNode(item.consumerNode || item.consumer)}</td>
                        <td style="padding: 10px 12px; font-weight: 500;">${formatNode(item.producerNode || item.producer)}</td>
                        <td style="padding: 10px 12px; color: var(--accent-green); font-weight: 600;">+${Number(item.transferPowerKw || item.powerTransferred || 0).toFixed(2)} kW</td>
                        <td style="padding: 10px 12px; color: var(--text-primary);">₹${Number(item.ratePerKwh || 4.2).toFixed(2)} / kWh</td>
                        <td style="padding: 10px 12px;"><span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-green); padding: 3px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 600;">${item.status || "Settled"}</span></td>
                    </tr>
                `;
            });
        });
    }

    // =========================================================================
    // 3. INTERACTIVE POWER TRANSFER
    // =========================================================================
    if (transferBtn) {
        transferBtn.onclick = () => {
            if (!isTransferring) {
                isTransferring = true;
                transferBtn.innerText = "Transferring Power...";
                transferBtn.style.background = "var(--accent-orange)";
                if (statusLabel) statusLabel.innerText = "Status: Active Power Flow (Host → Client)";

                let transferPower = liveDeficit > 0 ? liveDeficit : 3.40;
                let targetSoc = 88;

                const interval = setInterval(() => {
                    if (!isTransferring) {
                        clearInterval(interval);
                        return;
                    }

                    if (targetSoc < 97) {
                        targetSoc += 0.4;
                    }

                    if (transferRateEl) {
                        transferRateEl.innerText = `${transferPower.toFixed(2)} kW Active`;
                    }
                    if (targetBatteryBar && targetBatteryLabel) {
                        targetBatteryBar.style.width = `${targetSoc}%`;
                        targetBatteryLabel.innerText = `${targetSoc.toFixed(0)}% (Charging via P2P)`;
                    }

                    set(ref(db, "p2p_market/active_transfer"), {
                        status: "TRANSFERRING",
                        powerKw: transferPower,
                        targetSoc: targetSoc,
                        timestamp: Date.now()
                    }).catch((err) => console.warn("P2P active_transfer sync error:", err));
                }, 2000);

                transferBtn.dataset.intervalId = interval;
            } else {
                isTransferring = false;
                clearInterval(Number(transferBtn.dataset.intervalId));
                transferBtn.innerText = "Ready to Transfer";
                transferBtn.style.background = "var(--primary-blue)";
                if (statusLabel) statusLabel.innerText = "Status: Standby / Ready to Dispatch";
                if (targetBatteryLabel) targetBatteryLabel.innerText = "96% (Fully Charged & Settled)";

                const currentProducer = producerSelect ? producerSelect.value : "node01";
                const currentConsumer = consumerSelect ? consumerSelect.value : "node02";
                const finalPower = liveDeficit > 0 ? liveDeficit : 3.40;

                recordP2PDispatch(currentProducer, currentConsumer, finalPower);
            }
        };
    }
}

export async function recordP2PDispatch(producerId, consumerId, powerKw, energyRate = 4.20) {
    try {
        const historyRef = ref(db, "p2p_market/history");
        const newEntry = {
            timestamp: Date.now(),
            producerNode: producerId,
            consumerNode: consumerId,
            transferPowerKw: Number(powerKw),
            ratePerKwh: energyRate,
            status: "Settled"
        };
        await set(ref(db, "p2p_market/active_transfer"), {
            status: "IDLE",
            powerKw: 0,
            timestamp: Date.now()
        });
        await push(historyRef, newEntry);
        console.log("✅ P2P Settlement Logged to Firebase History:", newEntry);
    } catch (error) {
        console.error("Failed to record P2P dispatch:", error);
    }
}
