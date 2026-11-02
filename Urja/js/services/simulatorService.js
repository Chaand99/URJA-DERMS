/**
 * ESP8266/ESP32 HARDWARE SIMULATOR SERVICE (js/services/simulatorService.js)
 * Generates realistic fluctuating sensor telemetry for testing without hardware.
 * Modified: Excludes Node 01 (Real Hardware) and simulates all other inactive/background nodes.
 */

import { db, ref, set } from "../firebase.js";
import { evaluateTelemetryForFaults } from "./faultService.js";

// Multiple background nodes jo simulate honge (Node 01 ko chhod kar)
const simulatedNodes = ["node02", "node03", "node04A"];

// State object taaki har node ki values constant na rahein balki smoothly drift karein
let nodeStates = {
    node02: { voltage: 230.0, current: 40.0, soc: 88 },
    node03: { voltage: 229.5, current: 35.0, soc: 82 },
    node04A: { voltage: 231.0, current: 42.0, soc: 86 }
};

export function startTelemetrySimulator() {
    console.log("🟢 Background Multi-Node Telemetry Simulator Activated (Excluding Node 01).");

    setInterval(async () => {
        // Sabhi simulated nodes par ek loop chalayenge
        for (const nodeId of simulatedNodes) {
            let state = nodeStates[nodeId];

            // Realistic smooth fluctuations (thoda upar-neeche drift hoga)
            state.voltage = +(state.voltage + (Math.random() * 2 - 1)).toFixed(1); // Small voltage drift
            if (state.voltage < 225) state.voltage = 225;
            if (state.voltage > 235) state.voltage = 235;

            state.current = +(state.current + (Math.random() * 1 - 0.5)).toFixed(2); // Small current drift
            if (state.current < 30) state.current = 30;
            if (state.current > 45) state.current = 45;

            const mockPower = +((state.voltage * state.current) / 1000).toFixed(2); // kW
            const mockSolar = +(7.5 + Math.random() * 1.5).toFixed(2); // 7.5kW - 9.0kW
            
            // SOC slight drift
            if (Math.random() > 0.7) {
                state.soc += (Math.random() > 0.5 ? 1 : -1);
                if (state.soc > 95) state.soc = 95;
                if (state.soc < 75) state.soc = 75;
            }

            try {
                const baseRef = ref(db, `devices/${nodeId}`);

                // Push live telemetry data to Firebase for this node
                await set(ref(db, `devices/${nodeId}/live`), {
                    voltage: state.voltage,
                    current: state.current,
                    power: mockPower,
                    energy: +(114.8 + (mockPower * 0.001)).toFixed(2),
                    frequency: +(50.0 + (Math.random() * 0.04 - 0.02)).toFixed(2),
                    powerFactor: 0.98,
                    timestamp: Date.now()
                });

                await set(ref(db, `devices/${nodeId}/solar`), {
                    voltage: 410.5,
                    current: 20.2,
                    power: mockSolar,
                    timestamp: Date.now()
                });

                await set(ref(db, `devices/${nodeId}/battery`), {
                    soc: state.soc,
                    voltage: 51.2,
                    current: 12.5,
                    power: 1.4,
                    temperature: 24.5,
                    timestamp: Date.now()
                });

                // Also append to history for charts & analytics
                const historyRef = ref(db, `devices/${nodeId}/history/${Date.now()}`);
                await set(historyRef, {
                    voltage: state.voltage,
                    current: state.current,
                    power: mockPower,
                    energy: 114.8,
                    frequency: 50.01,
                    powerFactor: 0.99,
                    timestamp: Date.now()
                });

                // Evaluate fault service for this simulated node
                evaluateTelemetryForFaults(nodeId, {
                    voltage: state.voltage,
                    temperature: 24.5
                });

            } catch (error) {
                console.error(`Simulation sync error for ${nodeId}:`, error);
            }
        }
    }, 3000); // Poll every 3 seconds
}