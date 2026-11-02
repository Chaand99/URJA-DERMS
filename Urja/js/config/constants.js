// ===============================
// Financial & Billing Constants
// ===============================

export const BILLING = {
    DEFAULT_TARIFF_RATE: 8.00, // INR (₹) per kWh
    DEFAULT_FEED_IN_TARIFF: 4.50 // INR (₹) per kWh for solar export
};

export const ALERT_SEVERITY = {

    INFO: "info",

    WARNING: "warning",

    CRITICAL: "critical"

};

// ===============================
// Alert IDs
// ===============================

export const ALERT_IDS = {

    HIGH_VOLTAGE: "HIGH_VOLTAGE",

    LOW_VOLTAGE: "LOW_VOLTAGE",

    HIGH_CURRENT: "HIGH_CURRENT",

    HIGH_POWER: "HIGH_POWER",

    LOW_BATTERY: "LOW_BATTERY"

};

// ===============================
// Electrical Limits
// ===============================

export const LIMITS = {

    HIGH_VOLTAGE: 250,

    LOW_VOLTAGE: 180,

    HIGH_CURRENT: 20,

    HIGH_POWER: 8,

    LOW_BATTERY: 20

};