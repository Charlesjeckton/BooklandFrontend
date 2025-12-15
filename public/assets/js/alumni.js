document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("alumniContainer");

    fetch("{% url 'api_alumni' %}")
        .then(response => response.json())
        .then(data => {
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

                container.appendChild(col);
            });

            AOS.refresh();
        })
        .catch(error => {
            console.error("Error loading alumni:", error);
            container.innerHTML = '<p class="text-danger text-center">Failed to load alumni.</p>';
        });
});