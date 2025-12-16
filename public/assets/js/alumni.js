/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";
const FALLBACK_IMAGE = "/static/images/default-fallback.jpg";

/* =====================================================
   HELPERS
===================================================== */
function getFullImageUrl(path) {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${encodeURI(path)}`;
}

/* =====================================================
   LOAD ALUMNI
===================================================== */
async function loadAlumni() {
    const container = document.getElementById("alumniContainer");
    if (!container) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/alumni/`);
        const data = await res.json();

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
                        <p><i>${alumni.message}</i></p>
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
document.addEventListener("DOMContentLoaded", loadAlumni);
