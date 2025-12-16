/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";

/* =====================================================
   DYNAMIC MODAL (NO HTML REQUIRED)
===================================================== */
function showModal(type = "success", message = "") {
    const modalId = "contactResponseModal";

    // Remove existing modal if present
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const isSuccess = type === "success";

    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content ${isSuccess ? "bg-success" : "bg-danger"} text-white">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            ${isSuccess ? "Message Sent" : "Submission Failed"}
                        </h5>
                        <button type="button"
                                class="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modalEl = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

/* =====================================================
   CONTACT FORM SUBMISSION
===================================================== */
async function handleContactFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector("button[type='submit']");

    const payload = {
        name: form.querySelector("#name")?.value.trim(),
        email: form.querySelector("#email")?.value.trim(),
        subject: form.querySelector("#subject")?.value.trim(),
        message: form.querySelector("#message")?.value.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
        showModal("error", "Please fill in all required fields.");
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        const response = await fetch(`${BACKEND_URL}/api/contact/submit/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            showModal(
                "success",
                "Your message has been sent successfully. We will get back to you shortly."
            );
            form.reset();
        } else {
            showModal(
                "error",
                data?.message || "Failed to submit your message."
            );
        }
    } catch (err) {
        console.error("Contact API error:", err);
        showModal(
            "error",
            "Unable to connect to the server. Please try again later."
        );
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "SEND MESSAGE";
    }
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", handleContactFormSubmit);
    }
});
