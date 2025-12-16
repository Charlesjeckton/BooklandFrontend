document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector(".btn-submit");
        submitBtn.disabled = true;

        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim(),
        };

        try {
            const res = await fetch(
                "https://booklandbackend.onrender.com/api/enquiries/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                throw new Error("Submission failed");
            }

            form.reset();

            // ✅ SUCCESS TOAST
            showToast("Message sent successfully!", "success");

        } catch (error) {
            console.error("Contact form error:", error);

            // ❌ ERROR TOAST
            showToast("Failed to send message. Please try again.", "error");

        } finally {
            submitBtn.disabled = false;
        }
    });
});
