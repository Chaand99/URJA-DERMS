/**
 * ============================================================================
 * URJA UTILITY & NODE SELECTOR HELPERS (js/utils.js)
 * Manages active node UI labels, formatting, and node dropdown interactions.
 * ============================================================================
 */

import { emit } from "./services/eventBus.js";

// Format numbers to fixed decimals safely
export function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

// Generate random realistic fluctuations within a given range
export function getRandomFluctuation(baseValue, maxVariation) {
    const delta = (Math.random() - 0.5) * 2 * maxVariation;
    return baseValue + delta;
}

// Format timestamp for telemetry logs
export function getFormattedTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

// Node Registry Definition
const nodeRegistry = {
    'node01':  { short: '01', name: 'Node #01', fullName: 'Node #01 (Home 1 - Solar)' },
    'node02':  { short: '02', name: 'Node #02', fullName: 'Node #02 (Home 2 / EV)' },
    'node03':  { short: '03', name: 'Node #03', fullName: 'Node #03 (BESS Bank)' },
    'node04A': { short: '04', name: 'Node #04-A', fullName: 'Node #04-A (Main Hub)' },
    'node05':  { short: '05', name: 'Node #05', fullName: 'Node #05 (Substation)' }
};

/**
 * Updates active node name, badge, and metadata across all pages in the DOM
 */
export function updateActiveNodeUI() {
    const activeNodeId = localStorage.getItem('urja_active_node') || 'node04A';

    let nodeInfo = nodeRegistry[activeNodeId];
    if (!nodeInfo) {
        let extractedDigits = activeNodeId.replace(/[^0-9]/g, '');
        if (!extractedDigits) extractedDigits = '00';
        nodeInfo = {
            short: extractedDigits.substring(0, 2),
            name: `Node #${activeNodeId.toUpperCase()}`,
            fullName: `Node #${activeNodeId.toUpperCase()} (Custom Microgrid Node)`
        };
    }

    // 1. Update text elements (Dashboard, Analytics, Reports, Settings headers)
    document.querySelectorAll('.active-node-name').forEach(el => {
        if (el.id === 'avatarText') {
            el.textContent = nodeInfo.short;
        } else if (el.classList.contains('badge')) {
            // Apply standard badge format
            el.innerHTML = `<i class="fa-solid fa-server" style="font-size: 0.7rem;"></i> ${nodeInfo.name}`;
        } else {
            el.textContent = nodeInfo.name;
        }
    });

    // 2. Update node-label spans (used in reports, cortex, etc.)
    document.querySelectorAll('.node-label').forEach(el => {
        el.textContent = nodeInfo.name;
    });

    // 2. Synchronize Settings Hardware Metadata if present on page
    const ipElem = document.getElementById('settingIp');
    const fwElem = document.getElementById('settingFirmware');
    const nameElem = document.getElementById('settingNodeName');

    if (nameElem) nameElem.textContent = nodeInfo.fullName;

    if (ipElem && fwElem) {
        let nodeNum = nodeInfo.short;
        ipElem.textContent = `192.168.1.1${nodeNum}`;
        fwElem.textContent = `v2.${nodeNum}.1-esp`;
    }

    console.log("🔄 Active Node UI Synchronized to:", nodeInfo.fullName);
}

/**
 * Select a node programmatically and broadcast the change
 * @param {string} nodeId
 */
export function selectActiveNode(nodeId) {
    if (!nodeId) return;
    localStorage.setItem('urja_active_node', nodeId);
    updateActiveNodeUI();
    emit('nodeChanged', nodeId);
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNodeUI();
});

// Single delegated click handler for node selector
document.addEventListener('click', (e) => {
    const trigger = document.getElementById('nodeSwitcherTrigger');
    const dropdown = document.getElementById('nodeDropdownMenu');

    if (!trigger || !dropdown) return;

    // 1. Toggle dropdown when trigger is clicked
    if (trigger.contains(e.target)) {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        return;
    }

    // 2. Handle selection of a node option
    const option = e.target.closest('.node-option');
    if (option) {
        const selectedNode = option.getAttribute('data-value');
        if (selectedNode) {
            dropdown.style.display = 'none';
            selectActiveNode(selectedNode);
        }
        return;
    }

    // 3. Close dropdown when clicking outside
    if (!dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});
