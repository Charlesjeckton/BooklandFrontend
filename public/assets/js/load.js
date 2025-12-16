document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // Helper: format YYYY-MM-DD to readable date
    // ==============================
    function formatDate(isoString) {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    // ==============================
    // Load Admission Deadlines
    // ==============================
    const deadlinesContainer = document.getElementById('admission-deadlines');
    if (deadlinesContainer) {
        fetch('https://booklandbackend.onrender.com/api/admission-deadlines/')
            .then(res => res.json())
            .then(data => {
                deadlinesContainer.innerHTML = '';
                if (!data.length) {
                    deadlinesContainer.innerHTML = '<p>No deadlines have been set yet.</p>';
                    return;
                }
                data.forEach(d => {
                    const div = document.createElement('div');
                    div.className = 'deadline-item';
                    div.innerHTML = `
                        <h4>${d.name}</h4>
                        <div class="date">${formatDate(d.deadline_date)}</div>
                    `;
                    deadlinesContainer.appendChild(div);
                });
            })
            .catch(err => {
                console.error(err);
                deadlinesContainer.innerHTML = '<p>Failed to load deadlines.</p>';
            });
    }

    // ==============================
    // Load Events
    // ==============================
    const eventsContainer = document.getElementById('events-list');
    if (eventsContainer) {
        fetch('https://booklandbackend.onrender.com/api/events/')
            .then(res => res.json())
            .then(events => {
                eventsContainer.innerHTML = '';
                if (!events.length) {
                    eventsContainer.innerHTML = '<p>No events at the moment.</p>';
                    return;
                }
                events.forEach(e => {
                    const startDate = new Date(e.year, e.month - 1, e.day);
                    const formattedDate = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const div = document.createElement('div');
                    div.className = 'event-item';
                    div.setAttribute('data-aos', 'fade-up');
                    div.innerHTML = `
                        <div class="event-date">${formattedDate}</div>
                        <div class="event-content">
                            <h3>${e.title}</h3>
                            <p><i class="bi bi-clock"></i> ${e.start_time} - ${e.end_time}</p>
                            <p><i class="bi bi-geo-alt"></i> ${e.location}</p>
                            <p>${e.description}</p>
                        </div>
                    `;
                    eventsContainer.appendChild(div);
                });
            })
            .catch(err => {
                console.error(err);
                eventsContainer.innerHTML = '<p>Failed to load events.</p>';
            });
    }

    // ==============================
    // Load Featured Events
    // ==============================
    const featuredContainer = document.getElementById('featured-events-container');
    if (featuredContainer) {
        fetch('https://booklandbackend.onrender.com/api/featured-events/')
            .then(res => res.json())
            .then(featured => {
                featuredContainer.innerHTML = '';
                if (!featured.length) {
                    featuredContainer.innerHTML = '<p>No featured events.</p>';
                    return;
                }
                featured.forEach(f => {
                    const div = document.createElement('div');
                    div.className = 'featured-event-content mb-4';
                    div.setAttribute('data-aos', 'fade-up');
                    div.innerHTML = `
                        <img src="${f.image}" alt="${f.title}" class="img-fluid mb-2">
                        <h4>${f.title}</h4>
                        <p><i class="bi bi-calendar-event"></i> ${f.date}</p>
                        <p>${f.description}</p>
                    `;
                    featuredContainer.appendChild(div);
                });
            })
            .catch(err => {
                console.error(err);
                featuredContainer.innerHTML = '<p>Failed to load featured events.</p>';
            });
    }

    // ==============================
    // Load Gallery Images
    // ==============================
    const galleryContainer = document.getElementById('gallery-images');
    if (galleryContainer) {
        fetch('https://booklandbackend.onrender.com/api/gallery/')
            .then(res => res.json())
            .then(data => {
                galleryContainer.innerHTML = '';
                if (!data.length) {
                    galleryContainer.innerHTML = '<p>No gallery images available.</p>';
                    return;
                }
                data.forEach((img, i) => {
                    const col = document.createElement('div');
                    col.className = 'col-lg-4 col-md-6';
                    col.setAttribute('data-aos', 'fade-up');
                    col.setAttribute('data-aos-delay', 100 + (i * 100));
                    col.innerHTML = `
                        <div class="gallery-card">
                            <a href="${img.image}" class="glightbox" data-gallery="gallery-set" data-title="${img.title}">
                                <img src="${img.image}" class="gallery-img img-fluid rounded" alt="${img.title}">
                                <div class="overlay-content"><h5 class="overlay-title">${img.title}</h5></div>
                            </a>
                        </div>
                    `;
                    galleryContainer.appendChild(col);
                });
                if (typeof GLightbox !== 'undefined') GLightbox({ selector: '.glightbox' });
                if (typeof AOS !== 'undefined') AOS.refresh();
            })
            .catch(err => {
                console.error(err);
                galleryContainer.innerHTML = '<p>Failed to load gallery images.</p>';
            });
    }

    // ==============================
    // Load Alumni
    // ==============================
    const alumniContainer = document.getElementById('alumniContainer');
    if (alumniContainer) {
        fetch('https://booklandbackend.onrender.com/api/alumni/')
            .then(res => res.json())
            .then(data => {
                alumniContainer.innerHTML = '';
                if (!data.length) {
                    alumniContainer.innerHTML = '<p class="text-center">No alumni available at the moment.</p>';
                    return;
                }
                data.forEach((alumni, index) => {
                    const col = document.createElement('div');
                    col.className = 'col-lg-4 col-md-6';
                    col.setAttribute('data-aos', 'fade-up');
                    col.setAttribute('data-aos-delay', `${(index + 2) * 100}`);
                    col.innerHTML = `
                        <div class="alumni-profile">
                            <div class="profile-header">
                                <div class="profile-img">
                                    <img src="${alumni.image}" alt="${alumni.name}" class="img-fluid">
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
                    alumniContainer.appendChild(col);
                });
                if (typeof AOS !== 'undefined') AOS.refresh();
            })
            .catch(err => {
                console.error(err);
                alumniContainer.innerHTML = '<p class="text-danger text-center">Failed to load alumni.</p>';
            });
    }

    // ==============================
    // Request Information Form Submission
    // ==============================
    const requestForm = document.getElementById('requestInfoForm');
    if (requestForm) {
        requestForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };
            fetch('https://booklandbackend.onrender.com/api/request-info/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('successMessage').textContent = data.message || 'Request sent successfully!';
                    new bootstrap.Modal(document.getElementById('successModal')).show();
                    requestForm.reset();
                } else {
                    document.getElementById('errorMessage').textContent = data.error || 'Something went wrong.';
                    new bootstrap.Modal(document.getElementById('errorModal')).show();
                }
            })
            .catch(err => {
                console.error(err);
                document.getElementById('errorMessage').textContent = 'Error connecting to server.';
                new bootstrap.Modal(document.getElementById('errorModal')).show();
            });
        });
    }

});
