/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";

/* =====================================================
   HELPERS
===================================================== */
function qs(id) {
  return document.getElementById(id);
}

/* =====================================================
   TESTIMONIALS
===================================================== */
async function loadTestimonials() {
  const container = qs("testimonial-container");
  if (!container) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/testimonials/`);
    const data = await res.json();

    container.innerHTML = data.length
      ? data.map(t => {
          const imageUrl = t.image ? `${BACKEND_URL}${t.image}` : "assets/img/default-avatar.png";
          return `
            <div class="swiper-slide">
              <div class="testimonial-item">
                <p>${t.testimonial}</p>
                <div class="testimonial-profile">
                  <img src="${imageUrl}" alt="${t.name}" class="img-fluid rounded-circle">
                  <div>
                    <h3>${t.name}</h3>
                    <h4>${t.title}</h4>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")
      : `<div class="swiper-slide">No testimonials found.</div>`;

    // Initialize Swiper after slides are injected
    if (window.Swiper) {
      new Swiper(".testimonials-slider", {
        loop: true,
        speed: 600,
        autoplay: { delay: 5000 },
        slidesPerView: 1,
        spaceBetween: 30,
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        },
        breakpoints: {
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 }
        }
      });
    }

    if (window.AOS) AOS.refresh();

  } catch (err) {
    console.error("Failed to load testimonials:", err);
    container.innerHTML = `<div class="swiper-slide">Failed to load testimonials.</div>`;
  }
}

/* =====================================================
   EVENTS
===================================================== */
async function loadEvents(filters = {}) {
  const container = qs("eventsContainer");
  if (!container) return;

  try {
    const url = new URL(`${BACKEND_URL}/api/events/`);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    const res = await fetch(url);
    const data = await res.json();

    container.innerHTML = data.length
      ? data.map((e, i) => `
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
                  <div class="meta-item">
                    <i class="bi bi-clock"></i> ${e.start_time} - ${e.end_time}
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-geo-alt"></i> ${e.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join("")
      : `<p class="text-center">No events available.</p>`;

    if (window.AOS) AOS.refresh();

  } catch (err) {
    console.error("Failed to load events:", err);
    container.innerHTML = `<p class="text-center text-danger">Failed to load events.</p>`;
  }
}

/* =====================================================
   EVENT FILTERS
===================================================== */
async function loadEventFilters() {
  const monthSelect = qs("monthSelect");
  const categorySelect = qs("categorySelect");
  if (!monthSelect || !categorySelect) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/events/`);
    const data = await res.json();

    // Populate month options
    [...new Set(data.map(e => e.month))].forEach(month => {
      if (!monthSelect.querySelector(`option[value="${month}"]`)) {
        monthSelect.innerHTML += `<option value="${month}">${month}</option>`;
      }
    });

    // Populate category options
    [...new Set(data.map(e => e.category))].forEach(category => {
      if (!categorySelect.querySelector(`option[value="${category}"]`)) {
        categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
      }
    });

  } catch (err) {
    console.error("Failed to load event filters:", err);
  }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadTestimonials();
  loadEventFilters();
  loadEvents();

  const filterForm = qs("eventFilterForm");
  if (filterForm) {
    filterForm.addEventListener("submit", e => {
      e.preventDefault();
      loadEvents({
        month: qs("monthSelect")?.value,
        category: qs("categorySelect")?.value
      });
    });
  }
});

