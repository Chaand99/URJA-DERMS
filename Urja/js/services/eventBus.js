/**
 * ============================================================================
 * LIGHTWEIGHT EVENT BUS (js/services/eventBus.js)
 * Enables decoupled pub/sub communication across URJA modules.
 * ============================================================================
 */

const listeners = {};

/**
 * Subscribe to an event
 * @param {string} eventName - Name of the event
 * @param {Function} callback - Handler function
 * @returns {Function} Unsubscribe function
 */
export function on(eventName, callback) {
    if (!listeners[eventName]) {
        listeners[eventName] = [];
    }
    listeners[eventName].push(callback);

    // Return an unsubscribe handler for cleanup
    return () => off(eventName, callback);
}

/**
 * Unsubscribe a specific callback from an event
 * @param {string} eventName - Name of the event
 * @param {Function} callback - Handler function to remove
 */
export function off(eventName, callback) {
    if (!listeners[eventName]) return;
    listeners[eventName] = listeners[eventName].filter((cb) => cb !== callback);
}

/**
 * Publish an event to all registered listeners
 * @param {string} eventName - Name of the event
 * @param {*} payload - Data payload to pass to subscribers
 */
export function emit(eventName, payload) {
    if (!listeners[eventName]) return;
    // Clone array to prevent issues if a callback unregisters during emission
    const callbacks = [...listeners[eventName]];
    callbacks.forEach((callback) => {
        try {
            callback(payload);
        } catch (err) {
            console.error(`Error in event handler for "${eventName}":`, err);
        }
    });
}

/**
 * Clear all listeners for an event (or all events if omitted)
 * @param {string} [eventName]
 */
export function clear(eventName) {
    if (eventName) {
        delete listeners[eventName];
    } else {
        Object.keys(listeners).forEach((key) => delete listeners[key]);
    }
}
