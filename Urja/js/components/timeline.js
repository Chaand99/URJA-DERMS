const MAX_EVENTS = 12;

export function addTimelineEvent(event) {

    const container =
        document.getElementById("eventTimeline");

    if (!container) return;

    let icon = "fa-circle-info";
    let color = "blue-bg";
    let category = "SYSTEM";

    switch(event.severity){

        case "critical":

            icon = "fa-circle-exclamation";
            color = "red-bg";
            category = "CRITICAL";

            break;

        case "warning":

            icon = "fa-triangle-exclamation";
            color = "orange-bg";
            category = "WARNING";

            break;

        case "info":

            icon = "fa-circle-check";
            color = "green-bg";
            category = "INFO";

            break;

    }

    const item = document.createElement("div");

    item.className = "timeline-item";

    item.innerHTML = `

        <div class="timeline-marker ${color}">
            <i class="fa-solid ${icon}"></i>
        </div>

        <div class="timeline-content">

            <div class="timeline-meta">

                <span class="t-category">

                    ${category}

                </span>

                <span class="t-time">

                    ${event.timestamp}

                </span>

            </div>

            <p class="t-text">

                ${event.message}

            </p>

        </div>

    `;

    container.prepend(item);

    while(container.children.length > MAX_EVENTS){

        container.removeChild(container.lastChild);

    }

}