// ================================
// CONFIG
// ================================
const BACKEND_URL = "https://booklandbackend.onrender.com"; // your backend
const FALLBACK_IMAGE = "/static/images/default-fallback.jpg"; // fallback image

// ================================
// HELPERS
// ================================
function getFullImageUrl(path) {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BACKEND_URL}/${encodeURI(path)}`;
}

// ================================
// Initialize AOS
// ================================
AOS.init({
    duration: 800,
    once: true
});

document.addEventListener('DOMContentLoaded', function () {

    // -----------------------
    // Load Leadership Team
    // -----------------------
    fetch(`${BACKEND_URL}/api/leadership/`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('leadership-team');
            if (!container) return;

            container.innerHTML = ""; // clear existing content
            data.forEach((leader, index) => {
                const col = document.createElement('div');
                col.className = 'col-lg-3 col-md-6 mb-4';
                col.setAttribute('data-aos', 'fade-up');
                col.setAttribute('data-aos-delay', 100 + (index * 100));

                col.innerHTML = `
                    <div class="leader-card">
                        <div class="leader-image">
                            <img src="${getFullImageUrl(leader.image)}" alt="${leader.title}" class="img-fluid" onerror="this.src='${FALLBACK_IMAGE}'">
                        </div>
                        <div class="leader-info">
                            <h4>${leader.salutation}. ${leader.name}</h4>
                            <p class="position">${leader.designation}</p>
                            <p class="bio"><i>${leader.message}</i></p>
                        </div>
                    </div>
                `;
                container.appendChild(col);
            });
            AOS.refresh();
        })
        .catch(err => console.error("Error loading leadership team:", err));

    // -----------------------
    // Load Gallery Images
    // -----------------------
    fetch(`${BACKEND_URL}/api/gallery/`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('gallery-images');
            if (!container) return;

            container.innerHTML = ""; // clear existing content
            data.forEach((img, i) => {
                const col = document.createElement('div');
                col.className = 'col-lg-4 col-md-6';
                col.setAttribute('data-aos', 'fade-up');
                col.setAttribute('data-aos-delay', 100 + (i * 100));

                col.innerHTML = `
                    <div class="gallery-card">
                        <a href="${getFullImageUrl(img.image)}" class="glightbox" data-gallery="gallery-set" data-title="${img.title}">
                            <img src="${getFullImageUrl(img.image)}" class="gallery-img img-fluid rounded" alt="${img.title}" onerror="this.src='${FALLBACK_IMAGE}'">
                            <div class="overlay-content"><h5 class="overlay-title">${img.title}</h5></div>
                        </a>
                    </div>
                `;
                container.appendChild(col);
            });

            if (window.GLightbox) GLightbox({ selector: '.glightbox' });
            AOS.refresh();
        })
        .catch(err => console.error("Error loading gallery images:", err));

});
