/* =====================================================
   CONTACT FORM API
===================================================== */
const BACKEND_URL = "https://booklandbackend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    const loadingMsg = form.querySelector(".loading-message");
    const errorMsg = form.querySelector(".error-message");
    const successMsg = form.querySelector(".success-message");

    // Hide messages initially
    loadingMsg.style.display = "none";
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Reset messages
        loadingMsg.style.display = "block";
        errorMsg.style.display = "none";
        successMsg.style.display = "none";

        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim(),
        };

        try {
            const res = await fetch(`${BACKEND_URL}/api/contact/submit/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Submission failed");
            }

            // Success
            loadingMsg.style.display = "none";
            successMsg.style.display = "block";
            form.reset();

        } catch (error) {
            console.error("Contact form error:", error);
            loadingMsg.style.display = "none";
            errorMsg.style.display = "block";
        }
    });
});

