/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://bookland-backend-onku.onrender.com";
const FALLBACK_IMAGE = "/static/images/default-fallback.jpg";

/* =====================================================
   HELPERS
===================================================== */
function getFullImageUrl(path) {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}/${encodeURI(path)}`;
}

/* =====================================================
   Initialize AOS
===================================================== */
AOS.init({
  duration: 800,
  once: true,
});

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
    throw err;
  }
}

/* =====================================================
   Load Leadership Team
===================================================== */
async function loadLeadershipTeam() {
  const container = document.getElementById("leadership-team");
  if (!container) return;

  try {
    // Fetch leadership data
    let data = await safeFetch(`${BACKEND_URL}/api/leadership/`);

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML =
        "<p class='text-center'>No leadership data available.</p>";
      return;
    }

    // Sort by rank descending (highest rank first)
    data.sort((a, b) => (b.rank || 0) - (a.rank || 0));

    data.forEach((leader, index) => {
      const col = document.createElement("div");
      col.className = "col-lg-3 col-md-6 mb-4";
      col.setAttribute("data-aos", "fade-up");
      col.setAttribute("data-aos-delay", 100 + index * 100);

      col.innerHTML = `
                <div class="leader-card">
                    <div class="leader-image">
                        <img src="${getFullImageUrl(leader.image)}" 
                             alt="${leader.title || leader.name}" 
                             class="img-fluid" 
                             onerror="this.src='${FALLBACK_IMAGE}'">
                    </div>
                    <div class="leader-info">
                        <h4>${
                          leader.salutation ? leader.salutation + ". " : ""
                        }${leader.name}</h4>
                        <p class="position">${leader.designation || "N/A"}</p>
                        <p class="bio"><i>"${leader.message || ""}"</i></p>
                    </div>
                </div>
            `;

      container.appendChild(col);
    });

    // Refresh AOS for animations
    if (window.AOS) AOS.refresh();
  } catch (err) {
    console.error("Error loading leadership team:", err);
    container.innerHTML =
      "<p class='text-danger text-center'>Failed to load leadership team.</p>";
  }
}

/* =====================================================
   Load Gallery Images
===================================================== */
async function loadGalleryImages() {
  const container = document.getElementById("gallery-images");
  if (!container) return;

  try {
    const data = await safeFetch(`${BACKEND_URL}/api/gallery/`);

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML =
        "<p class='text-center'>No gallery images available.</p>";
      return;
    }

    data.forEach((img, i) => {
      const col = document.createElement("div");
      col.className = "col-lg-4 col-md-6";
      col.setAttribute("data-aos", "fade-up");
      col.setAttribute("data-aos-delay", 100 + i * 100);

      col.innerHTML = `
                <div class="gallery-card">
                    <a href="${getFullImageUrl(
                      img.image
                    )}" class="glightbox" data-gallery="gallery-set" data-title="${
        img.title
      }">
                        <img src="${getFullImageUrl(
                          img.image
                        )}" class="gallery-img img-fluid rounded" alt="${
        img.title
      }" onerror="this.src='${FALLBACK_IMAGE}'">
                        <div class="overlay-content"><h5 class="overlay-title">${
                          img.title
                        }</h5></div>
                    </a>
                </div>
            `;
      container.appendChild(col);
    });

    if (window.GLightbox) GLightbox({ selector: ".glightbox" });
    AOS.refresh();
  } catch (err) {
    console.error("Error loading gallery images:", err);
    container.innerHTML =
      "<p class='text-danger text-center'>Failed to load gallery images.</p>";
  }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadLeadershipTeam();
  loadGalleryImages();
});
