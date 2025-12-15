document.addEventListener("DOMContentLoaded", function() {
    // Load events
    fetch("{% url 'api_events' %}")
        .then(res => res.json())
        .then(events => {
            const container = document.getElementById("events-list");
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
        });

    // Load featured events
    fetch("{% url 'api_featured_events' %}")
        .then(res => res.json())
        .then(featured => {
            const container = document.getElementById("featured-events-container");
            if (featured.length === 0) {
                container.innerHTML = "<p>No featured events.</p>";
                return;
            }
            container.innerHTML = featured.map(f => `
                <div class="featured-event-content mb-4">
                    <img src="${f.image}" alt="${f.title}" class="img-fluid mb-2">
                    <h4>${f.title}</h4>
                    <p><i class="bi bi-calendar-event"></i> ${f.date}</p>
                    <p>${f.description}</p>
                </div>
            `).join("");
        });

    // Load event categories
    fetch("{% url 'api_events' %}")
        .then(res => res.json())
        .then(events => {
            const container = document.getElementById("event-categories");
            const categoryCounts = {};
            events.forEach(e => {
                categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
            });
            container.innerHTML = Object.entries(categoryCounts).map(([cat, count]) => `
                <li><a>${cat} <span>(${count})</span></a></li>
            `).join("");
        });
});
