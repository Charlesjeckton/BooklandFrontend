const BACKEND_URL = "https://booklandbackend.onrender.com"; // your backend
const FALLBACK_IMAGE = "/static/images/default-fallback.jpg"; // fallback image

function getFullImageUrl(path) {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BACKEND_URL}/${encodeURI(path)}`;
}

document.addEventListener("DOMContentLoaded", function() {
    // -----------------------
    // Load Events
    // -----------------------
    fetch(`${BACKEND_URL}/api/events/`)
        .then(res => res.json())
        .then(events => {
            const container = document.getElementById("events-list");
            if (!container) return;

            if (events.length === 0) {
                container.innerHTML = "<p>No events at the moment.</p>";
                return;
            }

            container.innerHTML = events.map(event => `
                <div class="event-item" data-aos="fade-up">
                    <div class="event-date">
                        <span class="day">${event.day}</span>
                        <span class="month">${event.month.slice(0,3).toUpperCase()}</span>
                        <span class="year">${event.year}</span>
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
            `).join("");
        })
        .catch(err => console.error("Error loading events:", err));

    // -----------------------
    // Load Featured Events
    // -----------------------
    fetch(`${BACKEND_URL}/api/featured_events/`)
        .then(res => res.json())
        .then(featured => {
            const container = document.getElementById("featured-events-container");
            if (!container) return;

            if (featured.length === 0) {
                container.innerHTML = "<p>No featured events.</p>";
                return;
            }

            container.innerHTML = featured.map(f => `
                <div class="featured-event-content mb-4" data-aos="fade-up">
                    <img src="${getFullImageUrl(f.image)}" alt="${f.title}" class="img-fluid mb-2" onerror="this.src='${FALLBACK_IMAGE}'">
                    <h4>${f.title}</h4>
                    <p><i class="bi bi-calendar-event"></i> ${f.date}</p>
                    <p>${f.description}</p>
                </div>
            `).join("");
        })
        .catch(err => console.error("Error loading featured events:", err));

    // -----------------------
    // Load Event Categories
    // -----------------------
    fetch(`${BACKEND_URL}/api/events/`)
        .then(res => res.json())
        .then(events => {
            const container = document.getElementById("event-categories");
            if (!container) return;

            const categoryCounts = {};
            events.forEach(e => {
                categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
            });

            container.innerHTML = Object.entries(categoryCounts).map(([cat, count]) => `
                <li><a>${cat} <span>(${count})</span></a></li>
            `).join("");
        })
        .catch(err => console.error("Error loading event categories:", err));
});
