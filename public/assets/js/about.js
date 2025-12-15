 // Initialize AOS first
    AOS.init({
        duration: 800,
        once: true
    });

    document.addEventListener('DOMContentLoaded', function () {

        // -----------------------
        // Load Leadership Team
        // -----------------------
        fetch("{% url 'api_leadership' %}")
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('leadership-team');
                data.forEach((leader, index) => {
                    const col = document.createElement('div');
                    col.className = 'col-lg-3 col-md-6 mb-4';
                    col.setAttribute('data-aos', 'fade-up');
                    col.setAttribute('data-aos-delay', 100 + (index * 100)); // stagger animation
                    col.innerHTML = `
                        <div class="leader-card">
                            <div class="leader-image">
                                <img src="${leader.image}" alt="${leader.title}" class="img-fluid">
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
                AOS.refresh(); // ensure AOS detects dynamically added elements
            })
            .catch(err => console.error("Error loading leadership team:", err));

        // -----------------------
        // Load Gallery Images
        // -----------------------
        fetch("{% url 'api_gallery' %}")
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById('gallery-images');
                data.forEach((img, i) => {
                    const col = document.createElement('div');
                    col.className = 'col-lg-4 col-md-6';
                    col.setAttribute('data-aos', 'fade-up');
                    col.setAttribute('data-aos-delay', 100 + (i * 100)); // staggered animation
                    col.innerHTML = `
                        <div class="gallery-card">
                            <a href="${img.image}" class="glightbox" data-gallery="gallery-set" data-title="${img.title}">
                                <img src="${img.image}" class="gallery-img img-fluid rounded" alt="${img.title}">
                                <div class="overlay-content"><h5 class="overlay-title">${img.title}</h5></div>
                            </a>
                        </div>
                    `;
                    container.appendChild(col);
                });
                GLightbox({selector: '.glightbox'});
                AOS.refresh(); // refresh AOS after gallery load
            })
            .catch(err => console.error("Error loading gallery images:", err));

    });
