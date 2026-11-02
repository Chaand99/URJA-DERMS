import { on } from "./eventBus.js";
import { push, historyRef } from "../firebase.js";

const LOG_INTERVAL = 60 * 1000; // 1 minute

let lastLogTime = 0;
let initialized = false;

/**
 * Initialize historical telemetry logger
 */
export function initLogger() {

    console.log("🟢 Logger initialized");

    // Prevent duplicate listeners
    if (initialized) return;

    initialized = true;

    on("telemetry", (data) => {

        const now = Date.now();

        // Log only once every minute
        if (now - lastLogTime < LOG_INTERVAL) {
            return;
        }

        lastLogTime = now;
       
push(historyRef, {
            timestamp: now,
            date: new Date(now).toISOString(),

            voltage: data.voltage ?? null,
            current: data.current ?? null,
            power: data.power ?? null,
            energy: data.energy ?? null,
            solar: data.solarPower ?? null,
            battery: data.batterySOC ?? null,
            temperature: data.temperature ?? null,
            frequency: data.frequency ?? null,
            powerFactor: data.powerFactor ?? null,
        })
.then(() => {
    console.log("✅ History written successfully");
})
.catch((err) => {
    console.error("❌ Write failed:", err);
});

    });

}