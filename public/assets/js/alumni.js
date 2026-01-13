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
    return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${encodeURI(path)}`;
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
    throw err;
  }
}

/* =====================================================
   LOAD ALUMNI
===================================================== */
async function loadAlumni() {
    const container = document.getElementById("alumniContainer");
    if (!container) return;

    try {
        const data = await safeFetch(`${BACKEND_URL}/api/alumni/`);


        container.innerHTML = "";

        if (!data.length) {
            container.innerHTML = '<p class="text-center">No alumni available at the moment.</p>';
            return;
        }

        data.forEach((alumni, index) => {
            const col = document.createElement("div");
            col.className = "col-lg-4 col-md-6";
            col.setAttribute("data-aos", "fade-up");
            col.setAttribute("data-aos-delay", `${(index + 2) * 100}`);

            col.innerHTML = `
                <div class="alumni-profile">
                    <div class="profile-header">
                        <div class="profile-img">
                            <img src="${getFullImageUrl(alumni.image)}" alt="${alumni.name}" class="img-fluid" onerror="this.src='${FALLBACK_IMAGE}'">
                        </div>
                        <div class="profile-year">${alumni.year_of_completion}</div>
                    </div>
                    <div class="profile-body">
                        <h4>${alumni.name}</h4>
                        <span class="profile-title">${alumni.title}</span>
                        <p><i>" ${alumni.message} "</i></p>
                    </div>
                </div>
            `;

            container.appendChild(col);
        });

        if (window.AOS) AOS.refresh();
    } catch (error) {
        console.error("Error loading alumni:", error);
        container.innerHTML = '<p class="text-danger text-center">Failed to load alumni.</p>';
    }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
    await loadAlumni();
});
