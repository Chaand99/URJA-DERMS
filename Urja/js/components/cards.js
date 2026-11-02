/**
 * Update any dashboard value
 */
export function updateCardValue(id, value, unit = "") {

    const el = document.getElementById(id);

    if (!el) return;

    if (el.querySelector(".unit")) {

        el.innerHTML =
            `${value} <span class="unit">${unit}</span>`;

    } else {

        el.innerHTML =
            `${value} ${unit}`;

    }

    el.style.color = "#10b981";

    setTimeout(() => {

        el.style.color = "";

    }, 350);

}