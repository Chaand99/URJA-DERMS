/**
 * ============================================================================
 * URJA UI HELPERS (js/components/ui.js)
 * Standardized UI state helpers: Loading, Empty, and Error states.
 * ============================================================================
 */

/**
 * Renders a standardized loading state within a container.
 * @param {HTMLElement} container - Target container
 */
export function renderLoading(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="state-container-center" style="padding: 3rem; text-align: center; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary-blue);"></i>
            <p>Synchronizing live telemetry...</p>
        </div>
    `;
}

/**
 * Renders a standardized empty state.
 * @param {HTMLElement} container - Target container
 * @param {string} message - Human readable message
 */
export function renderEmpty(container, message = "No data available for the active node.") {
    if (!container) return;
    container.innerHTML = `
        <div class="state-container-center" style="padding: 3rem; text-align: center; color: var(--text-muted);">
            <i class="fa-solid fa-circle-info" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Renders a standardized error state.
 * @param {HTMLElement} container - Target container
 * @param {string} error - The error message
 */
export function renderError(container, error = "Failed to load module data.") {
    if (!container) return;
    container.innerHTML = `
        <div class="state-container-center" style="padding: 3rem; text-align: center; color: var(--accent-red);">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>${error}</p>
        </div>
    `;
}
