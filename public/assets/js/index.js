/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://api.booklandschools.co.ke";
const FALLBACK_IMAGE = "/static/images/default-fallback.jpg"; // fallback image

/* =====================================================
   HELPERS
===================================================== */
const qs = (id) => document.getElementById(id);

function getImageUrl(url) {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${encodeURI(url)}`;
}

function formatDateISO(dateStr, options = {}) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", options);
}

/*======================================================
    Safe Fetch
=======================================================*/
async function safeFetch(url, retries = 2, delay = 1500) {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000); // 8s timeout

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (err) {
        if (retries > 0) {
            await new Promise((r) => setTimeout(r, delay));
            return safeFetch(url, retries - 1, delay);
        }
        console.error("Fetch failed:", err);
        throw err;
    }
}

/* =====================================================
   TESTIMONIALS
===================================================== */
async function loadTestimonials() {
    const container = qs("testimonial-container");
    if (!container) return;

    try {
        const data = await safeFetch(`${BACKEND_URL}/api/testimonials/`);
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `<div class="swiper-slide text-center">No testimonials found.</div>`;
            return;
        }

        container.innerHTML = data
            .map(
                (t) => `
        <div class="swiper-slide">
          <div class="testimonial-item">
            <p>“${t.testimonial}”</p>
            <div class="testimonial-profile">
              <img src="${getImageUrl(t.image)}" alt="${t.name}" class="img-fluid rounded-circle" onerror="this.src='${FALLBACK_IMAGE}'">
              <div>
                <h3>${t.name}</h3>
                <h4><strong>${t.title}</strong></h4>
              </div>
            </div>
          </div>
        </div>`
            )
            .join("");

        if (window.Swiper) {
            new Swiper(".testimonials-slider", {
                loop: true,
                speed: 600,
                autoplay: { delay: 5000 },
                slidesPerView: 1,
                spaceBetween: 30,
                pagination: { el: ".swiper-pagination", clickable: true },
                breakpoints: { 768: { slidesPerView: 2 }, 992: { slidesPerView: 3 } },
            });
        }

        if (window.AOS) AOS.refresh();
    } catch (err) {
        container.innerHTML = `<div class="swiper-slide text-center text-danger">Failed to load testimonials.</div>`;
    }
}

/* =====================================================
   EVENTS
===================================================== */
async function fetchEvents(filters = {}) {
    const container = qs("eventsContainer");
    if (!container) return;

    try {
        const url = new URL(`${BACKEND_URL}/api/events/`);
        Object.entries(filters).forEach(([k, v]) => v && url.searchParams.append(k, v));

        const data = await safeFetch(url);
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `<p class="text-center">No events available.</p>`;
            return;
        }

        container.innerHTML = data
            .map(
                (e, i) => `
        <div class="col-lg-6" data-aos="fade-up" data-aos-delay="${i * 100}">
          <div class="event-card">
            <div class="event-date">
              <span class="month">${e.month.slice(0, 3).toUpperCase()}</span>
              <span class="day">${e.day}</span>
              <span class="year">${e.year}</span>
            </div>
            <div class="event-content">
              <div class="event-tag ${e.category.toLowerCase()}">${e.category}</div>
              <h3>${e.title}</h3>
              <p>${e.description}</p>
              <div class="event-meta">
                <div class="meta-item"><i class="bi bi-clock"></i> ${e.start_time} - ${e.end_time}</div>
                <div class="meta-item"><i class="bi bi-geo-alt"></i> ${e.location}</div>
              </div>
            </div>
          </div>
        </div>`
            )
            .join("");

        if (window.AOS) AOS.refresh();
    } catch (err) {
        container.innerHTML = `<p class="text-center text-danger">Failed to load events.</p>`;
    }
}

async function loadEventFilters() {
    const monthSelect = qs("monthSelect");
    const categorySelect = qs("categorySelect");
    if (!monthSelect || !categorySelect) return;

    try {
        const data = await safeFetch(`${BACKEND_URL}/api/events/`);
        if (!Array.isArray(data) || data.length === 0) return;

        const months = [...new Set(data.map((e) => e.month))];
        months.forEach((m) => (monthSelect.innerHTML += `<option value="${m}">${m}</option>`));

        const categories = [...new Set(data.map((e) => e.category))];
        categories.forEach((c) => (categorySelect.innerHTML += `<option value="${c}">${c}</option>`));
    } catch (err) {
        console.error("Failed to load event filters:", err);
    }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
    await loadEventFilters();
    await loadTestimonials();
    await fetchEvents();

    const filterForm = qs("eventFilterForm");
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            fetchEvents({
                month: qs("monthSelect")?.value,
                category: qs("categorySelect")?.value,
            });
        });
    }
});
