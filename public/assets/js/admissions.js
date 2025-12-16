/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";

/* =====================================================
   HELPERS
===================================================== */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/* =====================================================
   LOAD ADMISSION DEADLINES
===================================================== */
async function loadAdmissionDeadlines() {
    const container = document.getElementById("admission-deadlines");
    if (!container) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/admissions-deadlines/`);
        const data = await res.json();

        container.innerHTML = "";

        if (!data.length) {
            container.innerHTML = "<p>No deadlines have been set yet.</p>";
            return;
        }

        data.forEach(d => {
            const div = document.createElement("div");
            div.className = "deadline-item";
            div.innerHTML = `
                <h4>${d.name}</h4>
                <div class="date">${formatDate(d.deadline_date)}</div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("Error loading admission deadlines:", err);
        container.innerHTML = "<p class='text-danger'>Failed to load deadlines.</p>";
    }
}

/* =====================================================
   REQUEST INFORMATION FORM
===================================================== */
async function handleRequestInfoForm(event) {
    event.preventDefault();
    const form = event.target;

    const formData = {
        name: form.querySelector("#name").value,
        email: form.querySelector("#email").value,
        phone: form.querySelector("#phone").value,
        message: form.querySelector("#message").value,
    };

    try {
        const res = await fetch(`${BACKEND_URL}/api/request-info/`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById("successMessage").textContent = data.message || "Request sent successfully!";
            new bootstrap.Modal(document.getElementById("successModal")).show();
            form.reset();
        } else {
            document.getElementById("errorMessage").textContent = data.error || "Something went wrong.";
            new bootstrap.Modal(document.getElementById("errorModal")).show();
        }
    } catch (err) {
        console.error("Error submitting request info form:", err);
        document.getElementById("errorMessage").textContent = "Error connecting to server.";
        new bootstrap.Modal(document.getElementById("errorModal")).show();
    }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadAdmissionDeadlines();

    const requestForm = document.getElementById("requestInfoForm");
    if (requestForm) {
        requestForm.addEventListener("submit", handleRequestInfoForm);
    }
});
