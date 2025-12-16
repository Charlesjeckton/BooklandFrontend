/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com"; // your backend
const FALLBACK_IMAGE = "/static/images/default-fallback.jpg"; // fallback image

/* =====================================================
   HELPERS
===================================================== */
function getFullImageUrl(path) {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${encodeURI(path)}`;
}

function formatEventDate(event) {
    const month = event.month?.slice(0, 3).toUpperCase() || "";
    const day = event.day || "";
    const year = event.year || "";
    return {day, month, year};
}

/* =====================================================
   EVENTS
===================================================== */
async function loadEvents() {
    const eventsContainer = document.getElementById("events-list");
    const categoriesContainer = document.getElementById("event-categories");
    if (!eventsContainer && !categoriesContainer) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/events/`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const events = await res.json();

        // Populate Events List
        if (eventsContainer) {
            eventsContainer.innerHTML = events.length
                ? events.map(event => {
                    const {day, month, year} = formatEventDate(event);
                    return `
                        <div class="event-item" data-aos="fade-up">
                            <div class="event-date">
                                <span class="day">${day}</span>
                                <span class="month">${month}</span>
                                <span class="year">${year}</span>
                            </div>
                            <div class="event-content">
                                <h3>${event.title}</h3>
                                <div class="event-meta">
                                    <p><i class="bi bi-clock"></i> ${event.start_time} - ${event.end_time}</p>
                                    <p><i class="bi bi-geo-alt"></i> ${event.location}</p>
                                </div>
                                <p>${event.description}</p>
                            </div>
                        </div>
                    `;
                }).join("")
                : "<p>No events at the moment.</p>";
        }

        // Populate Event Categories
        if (categoriesContainer) {
            const categoryCounts = {};
            events.forEach(e => {
                categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
            });

            categoriesContainer.innerHTML = Object.entries(categoryCounts)
                .map(([cat, count]) => `<li><a>${cat} <span>(${count})</span></a></li>`)
                .join("");
        }

        if (window.AOS) AOS.refresh();
    } catch (err) {
        console.error("Error loading events:", err);
        if (eventsContainer) eventsContainer.innerHTML = "<p class='text-danger'>Failed to load events.</p>";
        if (categoriesContainer) categoriesContainer.innerHTML = "<p class='text-danger'>Failed to load categories.</p>";
    }
}

/* =====================================================
   FEATURED EVENTS
===================================================== */
async function loadFeaturedEvents() {
    const container = document.getElementById("featured-events-container");
    if (!container) return;

    try {
        // NOTE: Correct endpoint based on your Django URLs
        const res = await fetch(`${BACKEND_URL}/api/featured-events/`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const featured = await res.json();

        container.innerHTML = featured.length
            ? featured.map((f, index) => `
                <div class="featured-event-content mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <img src="${getFullImageUrl(f.image)}" alt="${f.title}" class="img-fluid mb-2" onerror="this.src='${FALLBACK_IMAGE}'">
                    <h4>${f.title}</h4>
                    <p><i class="bi bi-calendar-event"></i> ${f.date}</p>
                    <p>${f.description}</p>
                </div>
              `).join("")
            : "<p>No featured events.</p>";

        if (window.AOS) AOS.refresh();
    } catch (err) {
        console.error("Error loading featured events:", err);
        container.innerHTML = "<p class='text-danger'>Failed to load featured events.</p>";
    }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
    loadFeaturedEvents();
});
